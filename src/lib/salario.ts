/**
 * O campo `salario` das vagas é texto livre (ex.: "R$ 2.200,00 + comissão",
 * "A combinar"). Para permitir filtro por faixa salarial sem exigir um campo
 * numérico novo no banco, extraímos o primeiro valor em reais do texto.
 */
export function extrairSalarioNumero(salario: string): number | null {
  const match = salario.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/);
  if (!match) return null;
  const numero = Number(match[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
}
