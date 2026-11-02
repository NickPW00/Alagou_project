import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expectAccessible } from './helpers';

// A7: avisos oficiais do INMET com resposta SINTÉTICA no formato real da API.
const avisos = readFileSync('e2e/fixtures/inmet-avisos.json', 'utf8');

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-02T15:30:00Z'));
  await page.route(/api\.open-meteo\.com/, (r) => r.abort());
});

test('mostra só avisos de Duque de Caxias, com severidade, validade, orientações e fonte', async ({ page }) => {
  await page.route(/apiprevmet3\.inmet\.gov\.br/, (r) => r.fulfill({ contentType: 'application/json', body: avisos }));
  await page.goto('/alertas');
  const list = page.getByRole('article');
  await expect(list).toHaveCount(2);
  const first = page.getByRole('article', { name: 'Acumulado de Chuva' });
  await expect(first.getByText('Aviso oficial · INMET')).toBeVisible();
  await expect(first.getByText('Perigo', { exact: true })).toBeVisible();
  await expect(first.getByText(/02\/11\/2026, 10:00 até 03\/11\/2026, 10:00/)).toBeVisible();
  await expect(first.getByText('Instrução de teste.')).toBeVisible();
  await expect(first.getByText(/código urn:oid:2\.49\.0\.0\.76\.0\.2026\.1\.1/)).toBeVisible();
  await expect(page.getByRole('article', { name: 'Tempestade' }).getByText(/Previsto/)).toBeVisible();
  await expect(page.getByText('Baixa Umidade')).toHaveCount(0);
  await expectAccessible(page);

  // O Início mostra o resumo a partir da cópia guardada, sem baixar de novo.
  await page.goto('/');
  await expect(page.getByText('Acumulado de Chuva — Perigo')).toBeVisible();
});

test('INMET indisponível: usa a cópia guardada ou mostra mensagem clara', async ({ page }) => {
  await page.route(/apiprevmet3\.inmet\.gov\.br/, (r) => r.abort());
  await page.goto('/alertas');
  await expect(page.getByText(/Não foi possível consultar os avisos do INMET agora/)).toBeVisible();
  await page.unroute(/apiprevmet3\.inmet\.gov\.br/);
  await page.route(/apiprevmet3\.inmet\.gov\.br/, (r) => r.fulfill({ contentType: 'application/json', body: avisos }));
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.unroute(/apiprevmet3\.inmet\.gov\.br/);
  await page.route(/apiprevmet3\.inmet\.gov\.br/, (r) => r.abort());
  await page.reload();
  await expect(page.getByText(/Mostrando os avisos consultados em 02\/11\/2026/)).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(2);
});

test('sem avisos vigentes: mensagem com o alerta sobre ausência de risco', async ({ page }) => {
  await page.route(/apiprevmet3\.inmet\.gov\.br/, (r) => r.fulfill({ json: { hoje: [], futuro: [] } }));
  await page.goto('/alertas');
  await expect(page.getByText(/Nenhum aviso do INMET vigente para Duque de Caxias/)).toBeVisible();
  await expect(page.getByText('A ausência de aviso não significa ausência de risco.')).toBeVisible();
});
