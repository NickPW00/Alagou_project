import { expect, test, type Page } from '@playwright/test';
import { openMapFilters, stubGeo, stubGeocoder, stubMap } from './helpers';

// A5: confirmação do trecho da rua, com trechos SINTÉTICOS:
// "Avenida Exemplo Central" (leste-oeste em -22.75) cruzada pela "Rua Transversal Teste" (norte-sul em -43.245).
test.beforeEach(async ({ page, context }) => {
  await stubMap(page);
  await stubGeo(page);
  await stubGeocoder(page);
  await context.grantPermissions(['geolocation']);
});

async function startAt(page: Page, latitude: number, longitude: number) {
  await page.context().setGeolocation({ latitude, longitude });
  await page.goto('/avisar');
  await page.getByLabel('Bairro *').fill('Bairro Trecho');
  await page.getByRole('button', { name: 'Usar minha localização' }).click();
  await expect(page.getByText('Ponto marcado no mapa.')).toBeVisible();
}

async function finish(page: Page) {
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: 'Rua totalmente alagada' }).check();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: 'Está subindo' }).check();
  // profundidade → outros problemas → foto/descrição → quando → revisão
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Revisão e envio');
}

test('pede confirmação do trecho, permite escolher outra rua e preenche o nome', async ({ page }) => {
  await startAt(page, -22.7501, -43.2452);
  const box = page.getByRole('group', { name: 'A água está neste trecho?' });
  await expect(box).toContainText('Avenida Exemplo Central');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Responda se a água está no trecho destacado.')).toBeVisible();

  await box.getByRole('button', { name: 'Escolher outra rua' }).click();
  await box.getByRole('button', { name: /Rua Transversal Teste · a \d+ m do ponto/ }).click();
  await expect(box).toContainText('Rua Transversal Teste');
  await box.getByRole('button', { name: 'Sim, neste trecho' }).click();
  await expect(box.getByRole('button', { name: 'Sim, neste trecho' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Nome da rua ou avenida *')).toHaveValue('Rua Transversal Teste');

  await finish(page);
  await expect(page.getByText(/Rua Transversal Teste \(trecho destacado, até 100 m para cada lado\)/)).toBeVisible();
  await page.getByRole('button', { name: 'Avisar a comunidade!' }).click();
  await page.getByRole('link', { name: 'Ver no mapa' }).click();
  await openMapFilters(page);
  await page.getByRole('button', { name: 'Ver lista' }).click();
  await page.getByRole('button', { name: /Rua Transversal Teste/ }).click();
  await expect(page.getByRole('dialog', { name: /Rua Transversal Teste/ }).getByText(/Trecho de referência na Rua Transversal Teste/)).toBeVisible();
});

test('"Só perto do ponto" mantém o relato como ponto', async ({ page }) => {
  await startAt(page, -22.7501, -43.2452);
  await page.getByLabel('Nome da rua ou avenida *').fill('Avenida Exemplo Central');
  await page.getByRole('group', { name: 'A água está neste trecho?' }).getByRole('button', { name: 'Só perto do ponto' }).click();
  await finish(page);
  await expect(page.getByText('Só perto do ponto')).toBeVisible();
});

test('sem rua próxima, segue como ponto sem pedir confirmação', async ({ page }) => {
  await startAt(page, -22.6, -43.4);
  await page.getByLabel('Nome da rua ou avenida *').fill('Rua Não Mapeada');
  await expect(page.getByRole('group', { name: 'A água está neste trecho?' })).toHaveCount(0);
  await finish(page);
  await expect(page.getByText('Ponto no mapa')).toBeVisible();
});
