import type { DeficitEstrutural } from "@/types";

/**
 * Filtra os déficits estruturais registrados pelo tema dado.
 * Função pura: a página passa `criterio.data.deficits_estruturais`.
 */
export function getDeficitsByTema(
  deficits: DeficitEstrutural[],
  temaSlug: string,
): DeficitEstrutural[] {
  return deficits.filter((d) => d.tema === temaSlug);
}
