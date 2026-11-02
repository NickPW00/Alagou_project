import { expect, test } from '@playwright/test';
import { openMapFilters, stubMap } from './helpers';

// A9: link direto para um relato.
test.beforeEach(async ({ page, context }) => {
  await stubMap(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  // Força o caminho "copiar link" (sem menu de compartilhamento nativo).
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }));
});

test('abrir /mapa?relato=d6 mostra o relato; fechar limpa o endereço sem poluir o histórico', async ({ page }) => {
  await page.goto('/mapa?relato=d6');
  const dialog = page.getByRole('dialog', { name: /Rua Demonstração D6/ });
  await expect(dialog).toBeVisible();
  const hist = await page.evaluate(() => history.length);
  await page.getByRole('button', { name: 'Fechar detalhes' }).click();
  await expect(page).toHaveURL(/\/mapa$/);
  await openMapFilters(page);
  await page.getByRole('button', { name: 'Ver lista' }).click();
  await page.getByRole('button', { name: /Rua Demonstração D2/ }).click();
  await expect(page).toHaveURL(/\/mapa\?relato=d2$/);
  expect(await page.evaluate(() => history.length)).toBe(hist);
});

test('compartilhar copia o link direto com o aviso de não oficial', async ({ page }) => {
  await page.goto('/mapa?relato=d1');
  await page.getByRole('dialog', { name: /Rua Demonstração D1/ }).getByRole('button', { name: 'Compartilhar' }).click();
  await expect(page.getByText('Link copiado. Cole no WhatsApp ou onde quiser compartilhar.')).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('/mapa?relato=d1');
  expect(copied).toContain('não é alerta oficial');
  // O link copiado abre o mesmo relato.
  await page.goto(copied.split(' ').pop()!);
  await expect(page.getByRole('dialog', { name: /Rua Demonstração D1/ })).toBeVisible();
});

test('relato inexistente mostra mensagem clara', async ({ page }) => {
  await page.goto('/mapa?relato=nao-existe');
  await expect(page.getByText('Relato não encontrado.')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar' }).click();
  await expect(page).toHaveURL(/\/mapa$/);
});
