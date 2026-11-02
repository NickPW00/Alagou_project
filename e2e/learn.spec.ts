import { expect, test } from '@playwright/test';
import { expectAccessible } from './helpers';

// A6: conteúdo educativo (rascunho) e quiz.
test('módulos expansíveis com selo de rascunho', async ({ page }) => {
  await page.goto('/aprenda');
  await expect(page.getByText('Rascunho em revisão pela equipe Meninas pelo Clima')).toBeVisible();
  const mod2 = page.locator('details', { hasText: 'Entenda os fenômenos' });
  await expect(mod2.getByText('Acúmulo de água nas ruas')).toBeHidden();
  await mod2.locator('summary').click();
  await expect(mod2.getByText('Acúmulo de água nas ruas')).toBeVisible();
  // Teclado: abre o módulo 3 com Enter.
  const mod3 = page.locator('details', { hasText: 'Como se proteger?' });
  await mod3.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(mod3.getByText(/Não entre em ruas alagadas, nem a pé/)).toBeVisible();
  await expectAccessible(page);
});

test('quiz mostra acerto, erro, explicação e placar', async ({ page }) => {
  await page.goto('/aprenda');
  await page.getByRole('group', { name: /bueiro não deu conta/ }).getByRole('radio', { name: 'Alagamento' }).check();
  await expect(page.getByText('Acertou!').first()).toBeVisible();
  await page.getByRole('group', { name: /rio transbordou/ }).getByRole('radio', { name: 'Enxurrada' }).check();
  await expect(page.getByText('Não é essa.')).toBeVisible();
  await page.getByRole('group', { name: /altura da canela/ }).getByRole('radio', { name: /Não atravessar/ }).check();
  await page.getByRole('group', { name: /energia elétrica/ }).getByRole('radio', { name: /Desligar no quadro/ }).check();
  await expect(page.getByText('Você acertou 3 de 4.')).toBeVisible();
  await page.getByRole('button', { name: 'Refazer' }).click();
  await expect(page.getByText('Você acertou')).toHaveCount(0);
});
