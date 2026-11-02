import { expect, test } from '@playwright/test';
import { openMapFilters, stubMap } from './helpers';

// A2: todo dado fictício mostra o selo "EXEMPLO".
test.beforeEach(async ({ page }) => stubMap(page));

test('selo EXEMPLO em listas, detalhes, Início, Memória e painel administrativo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section', { has: page.getByRole('heading', { name: 'Últimas atualizações comunitárias' }) }).getByText(/^EXEMPLO/)).toHaveCount(3);

  await page.goto('/mapa');
  await openMapFilters(page);
  const listToggle = page.getByRole('button', { name: 'Ver lista' });
  if (await listToggle.isVisible()) await listToggle.click();
  const list = page.getByRole('heading', { name: '8 relato(s)' }).filter({ visible: true }).locator('xpath=..');
  await expect(list.getByText(/^EXEMPLO/)).toHaveCount(8);
  await list.getByRole('button', { name: /Rua Demonstração D1/ }).click();
  await expect(page.getByRole('dialog', { name: /Rua Demonstração D1/ }).getByRole('heading', { level: 2 })).toContainText('EXEMPLO');

  await page.goto('/memoria');
  await expect(page.getByRole('main').getByText(/^EXEMPLO/)).toHaveCount(3);

  await page.goto('/admin');
  await expect(page.getByRole('main').getByText(/^EXEMPLO/)).toHaveCount(8);
});
