import assert from "node:assert/strict";
import { test } from "node:test";
import { ESTADO_INICIAL, estadoParaUrl, filtrar, geracaoDo, lerEstadoDaUrl, temFiltro } from "../js/filtros.js";

const pokemon = (id, nome, tipos, extra = {}) => ({ id, nome, tipos, hp: 50, peso: 10, altura: 1, imagem: "x", ...extra });

const lista = [
  pokemon(6, "charizard", ["fire", "flying"], { hp: 78, peso: 90.5 }),
  pokemon(25, "pikachu", ["electric"], { hp: 35, peso: 6 }),
  pokemon(1, "bulbasaur", ["grass", "poison"], { hp: 45, peso: 6.9 }),
  pokemon(150, "mewtwo", ["psychic"], { hp: 106, peso: 122 }),
  pokemon(152, "chikorita", ["grass"], { hp: 45, peso: 6.4 }),
  pokemon(10034, "charizard-mega-x", ["fire", "dragon"], { hp: 78, peso: 110.5 }),
];

test("busca por nome ignora acentos e maiúsculas", () => {
  const achados = filtrar(lista, { ...ESTADO_INICIAL, busca: "PIKA" });
  assert.deepEqual(achados.map((p) => p.nome), ["pikachu"]);
});

test("busca pelo nome do tipo em português", () => {
  const achados = filtrar(lista, { ...ESTADO_INICIAL, busca: "eletrico" });
  assert.deepEqual(achados.map((p) => p.nome), ["pikachu"]);
});

test("vários tipos: o pokémon precisa ter todos", () => {
  const achados = filtrar(lista, { ...ESTADO_INICIAL, tipos: ["fire", "flying"] });
  assert.deepEqual(achados.map((p) => p.nome), ["charizard"]);
});

test("geração é calculada pelo número do pokémon", () => {
  assert.equal(geracaoDo(pokemon(151, "mew", ["psychic"])), "1");
  assert.equal(geracaoDo(pokemon(152, "chikorita", ["grass"])), "2");
  assert.equal(geracaoDo(pokemon(10034, "forma", ["fire"])), "especiais");
  const achados = filtrar(lista, { ...ESTADO_INICIAL, geracao: "1" });
  assert.deepEqual(achados.map((p) => p.id), [1, 6, 25, 150]);
});

test("ordena por peso do maior para o menor e empata pelo número", () => {
  const achados = filtrar(lista, { ...ESTADO_INICIAL, ordem: "peso" });
  assert.deepEqual(achados.map((p) => p.nome).slice(0, 3), ["mewtwo", "charizard-mega-x", "charizard"]);
});

test("ordena por nome de A a Z", () => {
  const achados = filtrar(lista, { ...ESTADO_INICIAL, ordem: "nome" });
  assert.equal(achados[0].nome, "bulbasaur");
});

test("temFiltro ignora a ordenação", () => {
  assert.equal(temFiltro({ ...ESTADO_INICIAL, ordem: "hp" }), false);
  assert.equal(temFiltro({ ...ESTADO_INICIAL, busca: "a" }), true);
});

test("o estado vai para o endereço e volta igual", () => {
  const estado = { busca: "char", tipos: ["fire", "flying"], geracao: "1", ordem: "hp" };
  assert.deepEqual(lerEstadoDaUrl(estadoParaUrl(estado)), estado);
  assert.equal(estadoParaUrl(ESTADO_INICIAL), "");
});

test("valores desconhecidos no endereço são ignorados", () => {
  const estado = lerEstadoDaUrl("tipos=fire,<script>,xyz&geracao=99&ordem=hack&q=" + "a".repeat(200));
  assert.deepEqual(estado.tipos, ["fire"]);
  assert.equal(estado.geracao, "");
  assert.equal(estado.ordem, "numero");
  assert.equal(estado.busca.length, 60);
});
