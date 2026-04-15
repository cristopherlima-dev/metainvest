export function formatBRL(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
}

export function formatData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}

export const TIPOS_ATIVO = {
  caixinha_nubank: "Caixinha Nubank",
  tesouro: "Tesouro Direto",
  acao: "Ação BR",
  etf: "ETF",
  fii: "FII",
};
