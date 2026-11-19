/**
 * ARQUIVO   : scripts/verificar-projeto.mjs
 * DESCRIÇÃO : Verificações do projeto que as outras ferramentas não cobrem.
 *             É executado pelo CI (npm run verificar:projeto).
 *
 * ERROS (fazem o CI falhar)
 *   - arquivo local referenciado no HTML/CSS que não existe (imagem, script...)
 *   - páginas sem <title>, descrição, canonical ou um único <h1>
 *   - robots.txt, sitemap.xml ou 404.html ausentes
 *   - páginas do site que não estão no sitemap.xml
 *   - cabeçalho ou rodapé diferentes entre as páginas
 *   - módulos JavaScript que importam arquivos inexistentes
 *
 * AVISOS (aparecem no CI, mas não bloqueiam)
 *   - marcador SEU-USUARIO ainda no código (endereço provisório)
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

const paginas = ["index.html", "galeria.html", "arena.html", "favoritos.html"];
const erros = [];
const avisos = [];

const ler = (arquivo) => readFileSync(arquivo, "utf8");
const erro = (mensagem) => erros.push(mensagem);

// ---- 1. Arquivos obrigatórios -------------------------------------------
for (const obrigatorio of ["robots.txt", "sitemap.xml", "404.html"]) {
  if (!existsSync(obrigatorio)) erro(`Arquivo obrigatório ausente: ${obrigatorio}`);
}

// ---- 2. Referências locais (src, href e url() do CSS) -------------------
/**
 * Confere se um caminho citado no código existe no disco.
 * @param {string} origem - arquivo que citou o caminho.
 * @param {string} caminho - valor de src/href/url().
 */
function conferirCaminho(origem, caminho) {
  // Ignora links externos, âncoras, e-mail, telefone e dados embutidos.
  if (/^(https?:|mailto:|tel:|data:|#|%23|\/\/)/.test(caminho)) return;
  const semParametros = caminho.split("#")[0].split("?")[0];
  if (!semParametros) return;
  const destino = join(dirname(origem), semParametros);
  if (!existsSync(destino)) erro(`${origem}: caminho inexistente -> ${caminho}`);
}

for (const arquivo of [...paginas, "404.html", "style.css"].filter(existsSync)) {
  const texto = ler(arquivo);
  for (const m of texto.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) conferirCaminho(arquivo, m[1]);
  for (const m of texto.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) conferirCaminho(arquivo, m[1]);
}

// ---- 3. Imports dos módulos JavaScript ----------------------------------
for (const nome of existsSync("js") ? readdirSync("js").filter((n) => n.endsWith(".js")) : []) {
  const arquivo = join("js", nome);
  for (const m of ler(arquivo).matchAll(/from\s+"(\.[^"]+)"|import\s+"(\.[^"]+)"/g)) {
    conferirCaminho(arquivo, m[1] ?? m[2]);
  }
}

// ---- 4. SEO básico em cada página ---------------------------------------
for (const pagina of paginas) {
  const html = ler(pagina);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) erro(`${pagina}: <title> ausente ou curto demais`);
  if (!/<meta\s+name="description"/.test(html)) erro(`${pagina}: meta description ausente`);
  if (!/rel="canonical"/.test(html)) erro(`${pagina}: link canonical ausente`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) erro(`${pagina}: deve ter exatamente 1 <h1> (encontrado: ${h1})`);
}

// ---- 5. Sitemap lista todas as páginas ----------------------------------
if (existsSync("sitemap.xml")) {
  const mapa = ler("sitemap.xml");
  for (const pagina of paginas) {
    // A página inicial aparece como a raiz do site (".../mundo-dos-pokemons/").
    const esperado = pagina === "index.html" ? "/mundo-dos-pokemons/</loc>" : pagina;
    if (!mapa.includes(esperado)) erro(`sitemap.xml não lista ${pagina}`);
  }
}

// ---- 6. Cabeçalho e rodapé iguais em todas as páginas -------------------
/** Pega um bloco do HTML e tira o que muda de página para página (link atual) e os espaços. */
function bloco(html, etiqueta) {
  const achado = new RegExp(`<${etiqueta}[\\s\\S]*?</${etiqueta}>`).exec(html)?.[0] ?? "";
  return achado.replaceAll(' aria-current="page"', "").replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ");
}
const referencia = ler(paginas[0]);
for (const pagina of paginas.slice(1)) {
  const html = ler(pagina);
  for (const etiqueta of ["header", "footer"]) {
    if (bloco(html, etiqueta) !== bloco(referencia, etiqueta)) {
      erro(`${pagina}: <${etiqueta}> diferente do de ${paginas[0]}`);
    }
  }
}

// ---- 7. Avisos (não bloqueiam) ------------------------------------------
for (const arquivo of [...paginas, "404.html", "sitemap.xml", "robots.txt"].filter(existsSync)) {
  if (ler(arquivo).includes("SEU-USUARIO")) {
    avisos.push(`${arquivo}: endereço provisório (rode: npm run url -- seu-usuario)`);
  }
}

// ---- Resultado ----------------------------------------------------------
for (const a of avisos) console.log(`::warning::${a}`);
for (const e of erros) console.log(`::error::${e}`);
if (erros.length) {
  console.error(`\n${erros.length} erro(s) encontrado(s).`);
  process.exit(1);
}
console.log(`Projeto OK (${avisos.length} aviso(s)).`);
