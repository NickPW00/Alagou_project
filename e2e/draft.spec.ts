import { expect, test } from '@playwright/test';
import { stubMap } from './helpers';

// A3: rascunho do aviso salvo só neste aparelho.
test.beforeEach(async ({ page }) => stubMap(page));

test('rascunho é salvo, oferecido ao voltar e restaurado só com escolha da pessoa', async ({ page }) => {
  await page.goto('/avisar');
  await page.getByLabel('Distrito *').selectOption('Xerém');
  await page.getByLabel('Nome da rua ou avenida *').fill('Rua Rascunho');
  await expect(page.getByText(/Rascunho salvo só neste aparelho/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Você tem um aviso não enviado');
  await expect(page.getByText('Salvo só neste aparelho — ainda não enviado')).toBeVisible();
  await expect(page.getByText(/Rua Rascunho, Xerém/)).toBeVisible();
  await page.getByRole('button', { name: 'Continuar de onde parei' }).click();
  await expect(page.getByLabel('Nome da rua ou avenida *')).toHaveValue('Rua Rascunho');
  await expect(page.getByLabel('Distrito *')).toHaveValue('Xerém');
});

test('restaura a etapa em que a pessoa parou', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('semeado')) return;
    sessionStorage.setItem('semeado', '1');
    localStorage.setItem(
      'alagou:rascunho:v1',
      JSON.stringify({
        v: 1,
        step: 2,
        savedAt: new Date().toISOString(),
        draft: { district: 'Imbariê', neighborhood: 'B', street: 'Rua Etapa', nearNumber: '', postalCode: '', referencePoint: '', segmentDescription: '', location: { lng: -43.21, lat: -22.63 }, condition: 'fully_flooded', hazards: [], description: '', observedDate: '', observedTime: '' },
      }),
    );
  });
  await page.goto('/avisar');
  await page.getByRole('button', { name: 'Continuar de onde parei' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('O que está acontecendo com a água?');
  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page.getByRole('radio', { name: 'Rua totalmente alagada' })).toBeChecked();
});

test('descartar apaga o rascunho', async ({ page }) => {
  await page.goto('/avisar');
  await page.getByLabel('Bairro *').fill('Bairro Descarte');
  await expect(page.getByText(/Rascunho salvo só neste aparelho/)).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Descartar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Onde aconteceu?');
  await expect(page.getByLabel('Bairro *')).toHaveValue('');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Onde aconteceu?');
});
