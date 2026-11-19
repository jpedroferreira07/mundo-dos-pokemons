import assert from "node:assert/strict";
import { test } from "node:test";
import { escolherBola } from "../js/captura.js";

const base = (n) => ({ hp: n, ataque: n, defesa: n, ataqueEspecial: n, defesaEspecial: n, velocidade: n });
const pokemon = (id, estatisticas) => ({ id, hp: estatisticas.hp, estatisticas });

test("lendários sempre pedem Master Ball", () => {
  assert.equal(escolherBola(pokemon(249, base(90))).nome, "Master Ball"); // Lugia
  assert.equal(escolherBola(pokemon(150, base(100))).nome, "Master Ball"); // Mewtwo
  assert.equal(escolherBola(pokemon(1007, base(80))).nome, "Master Ball"); // Koraidon
});

test("status altíssimos também pedem Master Ball, mesmo fora da lista", () => {
  assert.equal(escolherBola(pokemon(10200, base(115))).nome, "Master Ball"); // total 690
});

test("pokémons fortes usam Ultra Ball e os médios, Great Ball", () => {
  assert.equal(escolherBola(pokemon(149, base(100))).nome, "Ultra Ball"); // Dragonite (600)
  assert.equal(escolherBola(pokemon(6, base(89))).nome, "Ultra Ball"); // Charizard (534)
  assert.equal(escolherBola(pokemon(2, base(68))).nome, "Great Ball"); // Ivysaur (408)
});

test("pokémons fracos nunca gastam bola rara", () => {
  const comuns = new Set(["Poké Ball", "Premier Ball", "Luxury Ball"]);
  for (let i = 0; i < 40; i++) assert.ok(comuns.has(escolherBola(pokemon(19, base(42))).nome)); // Rattata
});

test("sem pokémon usa a Poké Ball", () => {
  assert.equal(escolherBola(null).nome, "Poké Ball");
});
