import { expect, test } from '@playwright/test';
import { expectAccessible, failMap, stubMap } from './helpers';

test('mapa carrega, filtra e abre detalhes pela lista', async ({ page }) => {
  await stubMap(page);
  await page.goto('/mapa');
  await expect(page.getByText('Carregando mapa…')).toBeHidden({ timeout: 20000 });
  await expect(page.getByText(/Atualizado às/)).toBeVisible();
  const box = await page.getByRole('region', { name: /Mapa de relatos/ }).boundingBox();
  expect(box?.height ?? 0).toBeGreaterThan(250);
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Ver lista' }).click();
  await expect(page.getByRole('heading', { name: '8 relato(s)' })).toBeVisible();

  await page.getByLabel('Filtrar por distrito').selectOption('Xerém');
  await expect(page.getByRole('heading', { name: '1 relato(s)' })).toBeVisible();
  await page.getByLabel('Filtrar por distrito').selectOption('');

  await page.getByRole('searchbox', { name: 'Pesquisar rua ou bairro' }).fill('demonstracao d6');
  await expect(page.getByRole('heading', { name: '1 relato(s)' })).toBeVisible();
  await page.getByRole('button', { name: /Rua Demonstração D6/ }).click();
  const detail = page.getByRole('dialog', { name: /Rua Demonstração D6/ });
  await expect(detail).toBeVisible();
  await expect(detail.getByText('Informações conflitantes')).toBeVisible();
  await expect(detail.getByText(/não.*significa que a água baixou/)).toBeVisible();
  await detail.getByRole('button', { name: 'Ver histórico' }).click();
  await expect(detail.getByText(/Atualização: água baixando/)).toBeVisible();

  await page.getByRole('searchbox').fill('nada-encontrado');
  await page.getByRole('button', { name: 'Fechar detalhes' }).click();
  await expect(page.getByText('Nenhum relato para este filtro.')).toBeVisible();
});

test('falha no serviço de mapas mostra aviso e lista de relatos', async ({ page }) => {
  await failMap(page);
  await page.goto('/mapa');
  await expect(page.getByText('O mapa não pôde ser carregado. Mostrando os relatos em lista.')).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('heading', { name: '8 relato(s)' })).toBeVisible();
});

test('camada histórica aparece na legenda ao escolher "Histórico"', async ({ page }) => {
  await stubMap(page);
  await page.goto('/mapa');
  await page.getByRole('button', { name: 'Histórico' }).click();
  await page.getByRole('button', { name: 'Legenda' }).click();
  await expect(page.getByText('Já alagou (histórico)')).toBeVisible();
  await expect(page.getByText(/Verde não significa rua segura/)).toBeVisible();
});
