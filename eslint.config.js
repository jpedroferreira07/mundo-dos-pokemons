/**
 * Configuração do ESLint (formato "flat config").
 * O ESLint lê os arquivos JavaScript e aponta erros e más práticas.
 * Rode com: npm run lint:js
 */
import js from "@eslint/js";
import globals from "globals";

export default [
  // Pastas que o ESLint deve ignorar.
  { ignores: ["node_modules/**", ".lighthouseci/**", "_site/**", "js/vendor/**"] },

  // Regras recomendadas pelo próprio ESLint.
  js.configs.recommended,

  // Código que roda NO NAVEGADOR (módulos ES dentro de js/).
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
    },
  },

  // Script clássico do <head> (não é módulo).
  {
    files: ["js/entrada.js"],
    languageOptions: { sourceType: "script" },
  },

  // Código que roda no NODE (scripts de apoio e configurações).
  {
    files: ["scripts/**/*.mjs", "testes/**/*.mjs", "*.js", "*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },

  // Regras do projeto (valem para todos os arquivos).
  {
    rules: {
      "no-var": "error", // usar const/let
      "prefer-const": "error", // const quando o valor não muda
      eqeqeq: ["error", "always"], // sempre === e !==
      "no-eval": "error", // segurança: nada de eval()
      "no-implied-eval": "error", // segurança: nada de setTimeout("texto")
      "no-new-func": "error", // segurança: nada de new Function()
      "no-unused-vars": ["error", { caughtErrors: "none" }],
    },
  },
];
