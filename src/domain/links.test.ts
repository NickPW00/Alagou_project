import { describe, expect, it } from 'vitest';
import { reportUrl, shareText } from './links';

describe('link direto (A9)', () => {
  it('monta o link com o subcaminho e codifica o identificador', () => {
    expect(reportUrl('d6', 'https://nickpw00.github.io', '/Alagou_project/')).toBe('https://nickpw00.github.io/Alagou_project/mapa?relato=d6');
    expect(reportUrl('novo 1', 'http://x', '/')).toBe('http://x/mapa?relato=novo%201');
  });
  it('texto de compartilhamento deixa claro que não é alerta oficial', () => {
    expect(shareText({ street: 'Rua A', neighborhood: 'Bairro B', condition: 'fully_flooded' })).toBe(
      'Alag@u: Rua A, Bairro B — Rua totalmente alagada (informação comunitária, não é alerta oficial).',
    );
  });
});
