import { describe, expect, it } from 'vitest';
import { MODULES, QUIZ } from './aprenda';

const allText = [
  ...MODULES.flatMap((m) => [m.title, m.intro, ...m.blocks.flatMap((b) => ('p' in b ? [b.p] : 'list' in b ? b.list : 'tip' in b ? [b.tip] : [b.h]))]),
  ...QUIZ.flatMap((q) => [q.q, q.explain]),
];
const sentences = allText.flatMap((t) => t.split(/(?<=[.!?:])\s+/));

describe('regras do conteúdo educativo (A6)', () => {
  it('nunca orienta a entrar ou atravessar a água sem negação', () => {
    const risky = sentences.filter((s) => /\b(entre|entrar|atravesse|atravessar)\b/i.test(s) && /\b(água|alagad|rua)/i.test(s));
    expect(risky.length).toBeGreaterThan(0); // o tema é tratado
    for (const s of risky) expect(s, s).toMatch(/\b(não|nunca)\b/i);
  });
  it('não contém referências bibliográficas (ano entre parênteses, "et al.")', () => {
    for (const s of allText) {
      expect(s, s).not.toMatch(/\(\s*\d{4}\s*\)|et al\./i);
    }
  });
  it('traz os contatos de emergência e os 5 módulos', () => {
    expect(MODULES.map((m) => m.n)).toEqual([1, 2, 3, 4, 5]);
    expect(allText.join(' ')).toMatch(/199/);
    expect(allText.join(' ')).toMatch(/193/);
  });
  it('quiz com respostas válidas', () => {
    for (const q of QUIZ) expect(q.answer).toBeLessThan(q.options.length);
  });
});
