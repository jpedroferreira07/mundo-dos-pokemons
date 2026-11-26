// Copia do node_modules para js/vendor/ só os arquivos de GSAP e Lenis que o site usa, já minificados.
// O site é estático (sem build) e publicado só com a pasta js/, então as bibliotecas precisam
// ficar dentro dela. Rode "npm run vendor" depois de atualizar essas dependências.
// As notas de licença dos arquivos originais são mantidas (legalComments: "inline").
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { transformSync } from "esbuild";

const ARQUIVOS = [
  ["node_modules/gsap/gsap-core.js", "js/vendor/gsap/gsap-core.js"],
  ["node_modules/gsap/CSSPlugin.js", "js/vendor/gsap/CSSPlugin.js"],
  ["node_modules/gsap/index.js", "js/vendor/gsap/index.js"],
  ["node_modules/gsap/Observer.js", "js/vendor/gsap/Observer.js"],
  ["node_modules/gsap/ScrollTrigger.js", "js/vendor/gsap/ScrollTrigger.js"],
  ["node_modules/lenis/dist/lenis.mjs", "js/vendor/lenis/lenis.mjs"],
];

for (const [origem, destino] of ARQUIVOS) {
  mkdirSync(destino.slice(0, destino.lastIndexOf("/")), { recursive: true });
  const { code } = transformSync(readFileSync(origem, "utf8"), {
    loader: "js",
    format: "esm",
    minify: true,
    legalComments: "inline",
  });
  writeFileSync(destino, code);
  console.log("copiado e minificado:", destino, Math.round(code.length / 1024) + " KB");
}
