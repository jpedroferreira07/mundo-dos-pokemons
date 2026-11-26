# Mundo dos Pokémons

Site com três páginas (Início, Galeria e Favoritos) feito com HTML, CSS e JavaScript puros, usando a [PokeAPI](https://pokeapi.co/). Nasceu como trabalho da AP2 de desenvolvimento web e foi evoluído depois: filtros, detalhes, comparação, animações e um pipeline de qualidade.

## O que o site faz

- **Galeria** com todos os pokémons (mais de 1.300), busca com debounce, filtro por vários tipos, filtro por geração e ordenação (número, nome, HP, peso, altura, total de status). O estado fica na URL: `galeria.html?q=pika&tipos=fire,flying&geracao=1&ordem=hp`.
- **Detalhes** em uma janela (`<dialog>`): status em barras, habilidades, evolução, arte shiny e grito. Link direto: `galeria.html?pokemon=25`.
- **Comparar** dois pokémons lado a lado.
- **Arena de batalha** (`arena.html`): escolha o seu pokémon e o adversário (ou sorteie), em três dificuldades. A batalha é por turnos no nível 50, com 4 golpes reais da PokeAPI por pokémon, tabela de tipos, bônus do mesmo tipo, acertos críticos, precisão e velocidade (o mais veloz ataca primeiro, como nos jogos). O visual é de estádio (holofotes, torcida, piso em perspectiva e anéis na cor do tipo), com tela de abertura "VS", Master Ball de entrada, golpes com efeito próprio para cada tipo (fogo, água, raio, folhas, gelo...), recuo e números de dano, tremida da tela, dica de efetividade em cada golpe, barra de HP com rastro, aviso de HP crítico, banner de vitória ou derrota com resumo, revanche, placar guardado no navegador e teclas 1 a 4 para os golpes. A música de batalha e os efeitos sonoros são gerados na hora pelo navegador (Web Audio, sem arquivos de áudio), desligados por padrão e com controle de volume. As regras ficam em `js/batalha.js` (com testes), os efeitos em `js/arena-efeitos.js` e o áudio em `js/musica.js`.
- **Favoritos** salvos no `localStorage` e sincronizados entre abas.
- **Animações:** rolagem suave (Lenis), barra de progresso de leitura, título do hero que sobe palavra por palavra com fundo fluido em WebGL, seção "Como funciona" que acende e entra em sequência, números que contam, faixa de tipos que acelera com a rolagem, cards com inclinação 3D e botões magnéticos, Master Ball que fecha e abre na troca de página, botão de voltar ao topo (Master Ball que balança quando o mouse chega perto), captura na pokébola ao favoritar e cards holográficos (brilho dourado nos raros). Há um botão para pausar tudo, e `prefers-reduced-motion` é respeitado (nesses casos o GSAP e o Lenis nem são baixados).

## Como rodar

O site usa módulos ES, então precisa de um servidor local (abrir o arquivo direto no navegador não funciona).

```bash
npm install
npm run dev
```

Depois abra http://localhost:8080.

## Qualidade e CI

| Comando | O que faz |
| --- | --- |
| `npm run lint:html` | valida o HTML (html-validate) |
| `npm run lint:css` | valida o CSS (Stylelint) |
| `npm run lint:js` | valida o JavaScript (ESLint, inclui `no-var` e `no-eval`) |
| `npm test` | testes unitários (filtros, validação de dados, utilidades) |
| `npm run verificar:projeto` | links, SEO básico, sitemap, imports e cabeçalho/rodapé iguais |
| `npm run teste:a11y` | acessibilidade WCAG 2 AA com pa11y |
| `npm run teste:lighthouse` | Lighthouse (acessibilidade, SEO e boas práticas ≥ 0,9) |
| `npm run verificar` | lint + testes + verificações + pa11y |
| `npm run vendor` | copia e minifica GSAP e Lenis do `node_modules` para `js/vendor/` (rode depois de atualizá-los) |

O pa11y e o Lighthouse precisam de um Chrome/Edge. No Windows, se não encontrarem sozinhos, defina antes `CHROME_PATH` (e `PUPPETEER_EXECUTABLE_PATH`) com o caminho do `chrome.exe`.

Os workflows em `.github/workflows/` já estão prontos: quando o projeto for para o GitHub, `ci.yml` roda tudo isso a cada push e pull request, e `pages.yml` publica o site no GitHub Pages. O Dependabot abre PRs semanais de atualização.

> O Lighthouse local pode acusar `robots.txt` como inválido por causa do CSP da página. É um falso positivo da ferramenta: o arquivo existe e é válido.

## Segurança

- CSP por `<meta>` (scripts, estilos e conexões só do próprio site e da PokeAPI) e `referrer` restrito.
- Nenhum dado externo entra por `innerHTML`; tudo é criado pelo DOM com `textContent`.
- Dados da API e do `localStorage` são validados antes do uso; imagens só de origens permitidas; parâmetros da URL só de listas permitidas.
- Ícones em SVG inline, sem CDN de terceiros.

## Acessibilidade e SEO

`aria-current`, avisos em região live, botões com `aria-pressed`, foco gerenciado em diálogos e remoções, alvos de toque de 44px, `<noscript>` e contraste AA. Canonical, Open Graph, Twitter Cards, JSON-LD, `robots.txt`, `sitemap.xml` e página 404.

## Se for publicar um dia

As URLs de canonical, sitemap e `robots.txt` usam o texto provisório `jpedroferreira07`. Quando houver repositório, troque tudo de uma vez:

```bash
npm run url -- seu-usuario
```

Depois, em Settings > Pages do repositório, escolha "Source: GitHub Actions".

## Estrutura

```
index.html  galeria.html  favoritos.html  404.html
style.css
js/          módulos ES (api, dados, cartas, filtros, galeria, detalhes, comparar, animações…)
imagens/
scripts/     verificar-projeto.mjs, definir-url.mjs
testes/      testes unitários (node:test)
.github/     workflows e dependabot
```

## Autor

João Pedro Ferreira.
