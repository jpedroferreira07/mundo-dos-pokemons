import assert from "node:assert/strict";
import { test } from "node:test";
import {
  NIVEL,
  acertou,
  calcularDano,
  calcularStatus,
  corDoHp,
  criarLutador,
  danoEsperado,
  descreverEfetividade,
  escolherGolpeDoRival,
  escolherGolpes,
  multiplicadorDeTipo,
  quemComeca,
} from "../js/batalha.js";

const base = (n) => ({ hp: n, ataque: n, defesa: n, ataqueEspecial: n, defesaEspecial: n, velocidade: n });
const pokemon = (id, tipos, n = 80) => ({ id, nome: "teste-" + id, tipos, imagem: "imagens/logo.svg", estatisticas: base(n) });
const golpe = (extra = {}) => ({ nome: "teste", tipo: "normal", poder: 80, precisao: 100, classe: "physical", ...extra });

test("status no nível 50", () => {
  assert.equal(NIVEL, 50);
  const status = calcularStatus(base(100));
  assert.equal(status.hp, Math.floor(((200 + 52) * 50) / 100) + 60);
  assert.equal(status.ataque, Math.floor(((200 + 52) * 50) / 100) + 5);
});

test("tabela de tipos: dobro, metade, nada e dois tipos juntos", () => {
  assert.equal(multiplicadorDeTipo("water", ["fire"]), 2);
  assert.equal(multiplicadorDeTipo("fire", ["water"]), 0.5);
  assert.equal(multiplicadorDeTipo("normal", ["ghost"]), 0);
  assert.equal(multiplicadorDeTipo("electric", ["ground"]), 0);
  assert.equal(multiplicadorDeTipo("ice", ["grass", "flying"]), 4);
  assert.equal(multiplicadorDeTipo("fire", ["water", "rock"]), 0.25);
  assert.equal(multiplicadorDeTipo("normal", ["normal"]), 1);
});

test("descrição da efetividade", () => {
  assert.equal(descreverEfetividade(4).nivel, "super");
  assert.equal(descreverEfetividade(0.5).nivel, "fraco");
  assert.equal(descreverEfetividade(0).nivel, "nulo");
  assert.equal(descreverEfetividade(1), null);
});

test("dano: STAB, super efetivo e crítico aumentam; imune zera", () => {
  const a = criarLutador(pokemon(1, ["fire"]), []);
  const d = criarLutador(pokemon(2, ["normal"]), []);
  const normal = calcularDano({ atacante: a, defensor: d, golpe: golpe({ tipo: "water" }), aleatorio: 1, critico: false });
  const comStab = calcularDano({ atacante: a, defensor: d, golpe: golpe({ tipo: "fire" }), aleatorio: 1, critico: false });
  const critico = calcularDano({ atacante: a, defensor: d, golpe: golpe({ tipo: "water" }), aleatorio: 1, critico: true });
  assert.ok(comStab.dano > normal.dano);
  assert.equal(comStab.stab, true);
  assert.ok(critico.dano > normal.dano);

  const planta = criarLutador(pokemon(3, ["grass"]), []);
  const efetivo = calcularDano({ atacante: a, defensor: planta, golpe: golpe({ tipo: "fire" }), aleatorio: 1, critico: false });
  assert.equal(efetivo.multiplicador, 2);

  const fantasma = criarLutador(pokemon(4, ["ghost"]), []);
  const nulo = calcularDano({ atacante: a, defensor: fantasma, golpe: golpe(), aleatorio: 1, critico: true });
  assert.equal(nulo.dano, 0);
  assert.equal(nulo.critico, false);
});

test("dano usa ataque e defesa físicos ou especiais conforme o golpe", () => {
  const forteFisico = criarLutador({ ...pokemon(1, ["normal"]), estatisticas: { ...base(60), ataque: 150 } }, []);
  const alvo = criarLutador(pokemon(2, ["normal"]), []);
  const fisico = calcularDano({ atacante: forteFisico, defensor: alvo, golpe: golpe({ classe: "physical" }), aleatorio: 1, critico: false });
  const especial = calcularDano({ atacante: forteFisico, defensor: alvo, golpe: golpe({ classe: "special" }), aleatorio: 1, critico: false });
  assert.ok(fisico.dano > especial.dano);
});

test("o dano mínimo é 1 e a variação fica entre 85% e 100%", () => {
  const fraco = criarLutador(pokemon(1, ["normal"], 5), []);
  const tanque = criarLutador({ ...pokemon(2, ["normal"]), estatisticas: { ...base(250) } }, []);
  assert.equal(calcularDano({ atacante: fraco, defensor: tanque, golpe: golpe({ tipo: "fire", poder: 1 }), aleatorio: 0, critico: false }).dano, 1);

  const a = criarLutador(pokemon(1, ["normal"]), []);
  const d = criarLutador(pokemon(2, ["normal"]), []);
  const minimo = calcularDano({ atacante: a, defensor: d, golpe: golpe(), aleatorio: 0, critico: false }).dano;
  const maximo = calcularDano({ atacante: a, defensor: d, golpe: golpe(), aleatorio: 1, critico: false }).dano;
  assert.ok(minimo < maximo);
  assert.ok(minimo / maximo >= 0.84);
});

test("precisão: nula nunca erra; 50% depende do sorteio", () => {
  assert.equal(acertou(golpe({ precisao: null }), 0.999), true);
  assert.equal(acertou(golpe({ precisao: 50 }), 0.49), true);
  assert.equal(acertou(golpe({ precisao: 50 }), 0.5), false);
});

test("quem começa: o mais rápido; empate é sorteado", () => {
  const rapido = criarLutador({ ...pokemon(1, ["normal"]), estatisticas: { ...base(80), velocidade: 140 } }, []);
  const lento = criarLutador(pokemon(2, ["normal"]), []);
  assert.equal(quemComeca(rapido, lento), "jogador");
  assert.equal(quemComeca(lento, rapido), "rival");
  assert.equal(quemComeca(lento, lento, 0.2), "jogador");
  assert.equal(quemComeca(lento, lento, 0.8), "rival");
});

test("escolha de golpes: um do mesmo tipo, tipos variados e no máximo 4", () => {
  const candidatos = [
    golpe({ nome: "a", tipo: "fire", poder: 90 }),
    golpe({ nome: "b", tipo: "fire", poder: 80 }),
    golpe({ nome: "c", tipo: "water", poder: 70 }),
    golpe({ nome: "d", tipo: "grass", poder: 60 }),
    golpe({ nome: "e", tipo: "rock", poder: 50 }),
    golpe({ nome: "f", tipo: "normal", poder: 40 }),
  ];
  const escolhidos = escolherGolpes(candidatos, ["fire"]);
  assert.equal(escolhidos.length, 4);
  assert.equal(escolhidos[0].nome, "a");
  assert.equal(new Set(escolhidos.map((g) => g.tipo)).size, 4);
  assert.deepEqual(escolherGolpes([candidatos[0]], ["fire"]).map((g) => g.nome), ["a"]);
});

test("adversário: difícil sempre escolhe o melhor; fácil escolhe pelo sorteio", () => {
  const fraco = golpe({ nome: "fraco", poder: 20 });
  const forte = golpe({ nome: "forte", poder: 120 });
  const rival = criarLutador(pokemon(1, ["normal"]), [fraco, forte]);
  const jogador = criarLutador(pokemon(2, ["normal"]), []);
  assert.ok(danoEsperado(rival, jogador, forte) > danoEsperado(rival, jogador, fraco));
  assert.equal(escolherGolpeDoRival(rival, jogador, "dificil", () => 0.99).nome, "forte");
  assert.equal(escolherGolpeDoRival(rival, jogador, "facil", () => 0).nome, "fraco");
});

test("cor do HP", () => {
  assert.equal(corDoHp(100, 100), "verde");
  assert.equal(corDoHp(40, 100), "amarelo");
  assert.equal(corDoHp(10, 100), "vermelho");
});
