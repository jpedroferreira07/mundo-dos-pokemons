import assert from "node:assert/strict";
import { test } from "node:test";
import { IMAGEM_PADRAO, imagemSegura, totalEstatisticas, validarPokemon } from "../js/dados.js";

const valido = {
  id: 25,
  nome: "pikachu",
  hp: 35,
  peso: 6,
  altura: 0.4,
  tipos: ["electric"],
  imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
};

test("aceita um pokémon válido", () => {
  assert.deepEqual(validarPokemon(valido), valido);
});

test("rejeita valores que não são objeto", () => {
  for (const ruim of [null, undefined, "x", 42, []]) assert.equal(validarPokemon(ruim), null);
});

test("rejeita nome com caracteres perigosos", () => {
  assert.equal(validarPokemon({ ...valido, nome: "<img src=x onerror=alert(1)>" }), null);
});

test("rejeita números inválidos", () => {
  assert.equal(validarPokemon({ ...valido, hp: "35" }), null);
  assert.equal(validarPokemon({ ...valido, peso: Infinity }), null);
  assert.equal(validarPokemon({ ...valido, id: 1.5 }), null);
});

test("descarta tipos desconhecidos e rejeita se não sobrar nenhum", () => {
  assert.deepEqual(validarPokemon({ ...valido, tipos: ["electric", "hack"] }).tipos, ["electric"]);
  assert.equal(validarPokemon({ ...valido, tipos: ["hack"] }), null);
});

test("só aceita imagens da PokeAPI ou da pasta imagens/", () => {
  assert.equal(imagemSegura("javascript:alert(1)"), IMAGEM_PADRAO);
  assert.equal(imagemSegura("https://exemplo.com/rastreador.png"), IMAGEM_PADRAO);
  assert.equal(imagemSegura("imagens/../../segredo"), IMAGEM_PADRAO);
  assert.equal(imagemSegura("imagens/logo.svg"), "imagens/logo.svg");
});

test("mantém os status só se os seis forem válidos", () => {
  const estatisticas = { hp: 35, ataque: 55, defesa: 40, ataqueEspecial: 50, defesaEspecial: 50, velocidade: 90 };
  assert.deepEqual(validarPokemon({ ...valido, estatisticas }).estatisticas, estatisticas);
  assert.equal("estatisticas" in validarPokemon({ ...valido, estatisticas: { hp: 1 } }), false);
  assert.equal(totalEstatisticas({ ...valido, estatisticas }), 320);
});
