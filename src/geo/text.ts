// Normalização de nomes para busca (sem acentos, minúsculas, espaços simples).
// Sem dependências: usado pelo app e pelos scripts de dados (Node).
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
