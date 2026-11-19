import assert from "node:assert/strict";
import { test } from "node:test";
import { capitalizar, formatarNumero, normalizar } from "../js/util.js";

test("normalizar tira acentos, maiúsculas e espaços das pontas", () => {
  assert.equal(normalizar("  Elétrico "), "eletrico");
  assert.equal(normalizar("Pokémon"), "pokemon");
});

test("capitalizar só muda a primeira letra", () => {
  assert.equal(capitalizar("bulbasaur"), "Bulbasaur");
  assert.equal(capitalizar("mr-mime"), "Mr-mime");
});

test("formatarNumero usa vírgula como no Brasil", () => {
  assert.equal(formatarNumero(6.9), "6,9");
  assert.equal(formatarNumero(0.555, 2), "0,56");
});
