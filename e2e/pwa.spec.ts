import { expect, test } from '@playwright/test';

// A3: roda contra a versão de produção (vite build + preview), onde existe o service worker.

test('manifesto válido e ícones disponíveis', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifestUrl = new URL(href!, page.url()).toString();
  const manifest = await (await request.get(manifestUrl)).json();
  expect(manifest.name).toBe('Alag@u — Alagou? Avisou!');
  expect(manifest.short_name).toBe('Alag@u');
  expect(manifest.display).toBe('standalone');
  expect(manifest.lang).toBe('pt-BR');
  expect(manifest.start_url).toBeTruthy();
  const sizes = manifest.icons.map((i: { sizes: string; purpose?: string }) => `${i.sizes}${i.purpose ? `:${i.purpose}` : ''}`);
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512', '512x512:maskable']));
  for (const icon of manifest.icons) {
    const res = await request.get(new URL(icon.src, manifestUrl).toString());
    expect(res.status(), icon.src).toBe(200);
  }
  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect((await request.get(new URL(apple!, page.url()).toString())).status()).toBe(200);
});

test('funciona offline depois da primeira visita', async ({ page, context }) => {
  // Bloqueia o mapa externo (não é necessário para este teste).
  await context.route(/openfreemap\.org/, (r) => r.abort());
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // A primeira visita instala o service worker; a partir da recarga, ele controla a página.
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  // Sem nunca ter aberto o mapa: o formulário precisa funcionar offline, com aviso no lugar do mapa.
  await context.setOffline(true);
  await page.goto('/avisar');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Onde aconteceu?');
  await expect(page.getByText('Mapa indisponível sem internet.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Usar minha localização' })).toBeVisible();
  await context.setOffline(false);

  // Abre o mapa online uma vez, para o código do mapa ser guardado no primeiro uso.
  await page.goto('/mapa');
  await expect(page.getByRole('searchbox', { name: 'Pesquisar rua ou bairro' })).toBeVisible();

  await context.setOffline(true);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Alag@u' })).toBeVisible();
  await expect(page.getByText('Sem internet — mostrando informações salvas neste aparelho.')).toBeVisible();

  await page.goto('/avisar');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Onde aconteceu?');

  await page.goto('/mapa');
  await expect(page.getByRole('searchbox', { name: 'Pesquisar rua ou bairro' })).toBeVisible();

  await context.setOffline(false);
  await expect(page.getByText('Sem internet — mostrando informações salvas neste aparelho.')).toBeHidden();
});
