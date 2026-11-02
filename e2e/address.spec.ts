import { expect, test } from '@playwright/test';
import { stubGeo, stubGeocoder, stubMap } from './helpers';

// A4: busca de endereços e distrito automático, com dados geográficos SINTÉTICOS (4 quadrantes).
test.beforeEach(async ({ page }) => {
  await stubMap(page);
  await stubGeo(page);
  await stubGeocoder(page, [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-43.25, -22.75] }, properties: { name: 'Escola Municipal Teste', street: 'Avenida Exemplo Central', osm_key: 'amenity' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-43.0, -22.9] }, properties: { name: 'Escola Fora do Município', osm_key: 'amenity' } },
  ]);
});

const search = (page: import('@playwright/test').Page) => page.getByRole('combobox', { name: 'Buscar rua, bairro ou lugar' });

test('sugere ruas homônimas separadas por distrito e preenche rua, distrito e ponto', async ({ page }) => {
  await page.goto('/avisar');
  await search(page).fill('rua das flores, 120');
  const options = page.getByRole('option', { name: /Rua das Flores/ });
  await expect(options).toHaveCount(3);
  await page.getByRole('option', { name: /Rua das Flores.*Distrito de Imbariê/ }).click();
  await expect(page.getByLabel('Nome da rua ou avenida *')).toHaveValue('Rua das Flores');
  await expect(page.getByLabel('Distrito *')).toHaveValue('Imbariê');
  await expect(page.getByText('Ponto marcado no mapa.')).toBeVisible();
  await expect(page.getByText('Distrito identificado pelo limite oficial do IBGE: Imbariê.')).toBeVisible();
  await expect(page.getByText('Confira se o marcador está no trecho certo e arraste se precisar.')).toBeVisible();
});

test('mostra lugares do geocodificador e descarta os de fora do município', async ({ page }) => {
  await page.goto('/avisar');
  await search(page).fill('escola');
  await expect(page.getByRole('option', { name: /Escola Municipal Teste/ })).toBeVisible();
  await expect(page.getByRole('option', { name: /Fora do Município/ })).toHaveCount(0);
  // Navegação por teclado no combobox.
  await search(page).press('ArrowDown');
  await search(page).press('Enter');
  await expect(page.getByLabel('Nome da rua ou avenida *')).toHaveValue('Avenida Exemplo Central');
  await expect(page.getByLabel('Distrito *')).toHaveValue('Campos Elíseos');
});

test('endereço não encontrado orienta a marcar no mapa', async ({ page }) => {
  await stubGeocoder(page, []);
  await page.goto('/avisar');
  await search(page).fill('zzzz inexistente');
  await expect(page.getByText('Nenhum resultado. Você pode marcar o ponto direto no mapa.')).toBeVisible();
});

test('GPS fora do município bloqueia a etapa; dentro, preenche o distrito', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: -22.9, longitude: -43.0 });
  await page.goto('/avisar');
  await page.getByLabel('Bairro *').fill('B');
  await page.getByLabel('Nome da rua ou avenida *').fill('R');
  await page.getByRole('button', { name: 'Usar minha localização' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'fora do município de Duque de Caxias' })).toBeVisible();
  await page.getByLabel('Distrito *').selectOption('Xerém');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Onde aconteceu?');

  await context.setGeolocation({ latitude: -22.6, longitude: -43.4 });
  await page.getByLabel('Distrito *').selectOption('');
  await page.getByRole('button', { name: 'Usar minha localização' }).click();
  await expect(page.getByText('Distrito identificado pelo limite oficial do IBGE: Xerém.')).toBeVisible();
  await expect(page.getByLabel('Distrito *')).toHaveValue('Xerém');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Como está a rua?');
});

test('Mapa ao Vivo: sugere ruas e bairros para ir até eles', async ({ page }) => {
  await page.goto('/mapa');
  const box = page.getByRole('combobox', { name: 'Pesquisar rua ou bairro' });
  await box.fill('teste norte');
  await page.getByRole('option', { name: /Bairro Teste Norte/ }).click();
  await expect(box).toHaveValue('');
  await expect(page.getByRole('listbox')).toHaveCount(0);
});
