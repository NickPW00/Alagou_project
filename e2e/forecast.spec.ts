import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expectAccessible } from './helpers';

// A7: previsão por distrito com resposta SINTÉTICA do Open-Meteo.
const fixture = readFileSync('e2e/fixtures/open-meteo.json', 'utf8');

test.beforeEach(async ({ page }) => {
  // Relógio fixo em 02/11/2026 12:30 (Brasília), dentro da janela da resposta sintética.
  await page.clock.setFixedTime(new Date('2026-11-02T15:30:00Z'));
});

test('mostra previsão por distrito, rótulo de não oficial, fonte e horário', async ({ page }) => {
  await page.route(/api\.open-meteo\.com/, (r) => r.fulfill({ contentType: 'application/json', body: fixture }));
  await page.goto('/alertas');
  await expect(page.getByText('Previsão de modelo meteorológico — não é aviso oficial.')).toBeVisible();
  await expect(page.getByTestId('resumo-previsao')).toContainText('14,9 mm');
  await expect(page.getByTestId('resumo-previsao')).toContainText('17:00');
  await page.getByLabel('Distrito').selectOption('Xerém');
  await expect(page.getByTestId('resumo-previsao')).toContainText('Nenhuma chuva prevista');
  await expect(page.getByRole('link', { name: /Open-Meteo\.com/ })).toBeVisible();
  await expect(page.getByText(/Consultado em 02\/11\/2026/)).toBeVisible();
  await expectAccessible(page);
});

test('sem conexão: usa a última previsão salva, com aviso; sem previsão salva, mensagem clara', async ({ page }) => {
  await page.route(/api\.open-meteo\.com/, (r) => r.abort());
  await page.goto('/alertas');
  await expect(page.getByText(/Não foi possível consultar a previsão agora/)).toBeVisible();

  await page.unroute(/api\.open-meteo\.com/);
  await page.route(/api\.open-meteo\.com/, (r) => r.fulfill({ contentType: 'application/json', body: fixture }));
  await page.reload();
  await expect(page.getByTestId('resumo-previsao')).toContainText('14,9 mm');

  await page.unroute(/api\.open-meteo\.com/);
  await page.route(/api\.open-meteo\.com/, (r) => r.abort());
  await page.reload();
  await expect(page.getByText(/Mostrando a previsão consultada em 02\/11\/2026/)).toBeVisible();
  await expect(page.getByTestId('resumo-previsao')).toContainText('14,9 mm');
});
