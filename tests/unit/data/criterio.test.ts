import { describe, it, expect } from "vitest";
import { getDeficitsByTema } from "@/lib/data/criterio";
import type { DeficitEstrutural } from "@/types";

const deficit = (over: Partial<DeficitEstrutural> = {}): DeficitEstrutural => ({
  candidato_id: "bolsonaro-flavio",
  tema: "educacao",
  declaracoes_encontradas: 0,
  justificativa: "lacuna registrada",
  data_verificacao: "2026-05-28",
  ...over,
});

describe("getDeficitsByTema", () => {
  it("retorna apenas os déficits do tema dado", () => {
    const deficits = [deficit({ tema: "educacao" }), deficit({ tema: "saude" })];
    const result = getDeficitsByTema(deficits, "educacao");
    expect(result).toHaveLength(1);
    expect(result[0]?.tema).toBe("educacao");
  });

  it("retorna [] quando nenhum déficit pertence ao tema", () => {
    const deficits = [deficit({ tema: "educacao" }), deficit({ tema: "saude" })];
    expect(getDeficitsByTema(deficits, "economia")).toEqual([]);
  });

  it("retorna [] quando a lista de déficits é vazia", () => {
    expect(getDeficitsByTema([], "educacao")).toEqual([]);
  });

  it("preserva todos os déficits do mesmo tema (múltiplos candidatos)", () => {
    const deficits = [
      deficit({ candidato_id: "bolsonaro-flavio", tema: "saude" }),
      deficit({ candidato_id: "lula-luiz-inacio", tema: "saude" }),
      deficit({ candidato_id: "bolsonaro-flavio", tema: "educacao" }),
    ];
    const result = getDeficitsByTema(deficits, "saude");
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.candidato_id)).toEqual(["bolsonaro-flavio", "lula-luiz-inacio"]);
  });
});
