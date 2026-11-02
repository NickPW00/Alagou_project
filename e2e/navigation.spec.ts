import { expect, test } from '@playwright/test';
import { expectAccessible, expectNoHorizontalScroll, stubMap } from './helpers';

const PAGES = [
  { path: '/', heading: 'Alag@u' },
  { path: '/alertas', heading: 'Vai chover? Fique ligado!' },
  { path: '/memoria', heading: 'Aqui já alagou!' },
  { path: '/aprenda', heading: 'Aprenda e Previna' },
  { path: '/dados', heading: 'Duque de Caxias em Dados' },
  { path: '/participacao', heading: 'Minha Participação' },
  { path: '/sobre', heading: 'Sobre o Alag@u' },
  { path: '/admin', heading: 'Painel administrativo' },
  { path: '/avisar', heading: 'Onde aconteceu?' },
];

test.beforeEach(async ({ page }) => stubMap(page));

for (const p of PAGES) {
  test(`página ${p.path}: título, acessibilidade e sem rolagem horizontal`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page.getByRole('heading', { level: 1, name: p.heading })).toBeVisible();
    await expect(page.getByText('MODO DEMONSTRAÇÃO')).toBeVisible();
    await expectAccessible(page);
    await expectNoHorizontalScroll(page);
  });
}

test('início mostra slogan, botões principais e aviso legal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Alagou? Avisou!').first()).toBeVisible();
  await expect(page.getByText('Monitoramento Comunitário de Alagamentos')).toBeVisible();
  await expect(page.getByText(/não substituem os alertas/)).toBeVisible();
  await page.getByRole('link', { name: 'Ver mapa ao vivo' }).click();
  await expect(page).toHaveURL(/\/mapa$/);
});

test('barra inferior e menu "Mais" no celular', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'apenas celular');
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navegação inferior' });
  await nav.getByRole('link', { name: 'Alertas' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vai chover? Fique ligado!');
  await nav.getByRole('button', { name: 'Mais' }).click();
  const dialog = page.getByRole('dialog', { name: 'Mais opções' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await nav.getByRole('button', { name: 'Mais' }).click();
  await dialog.getByRole('link', { name: 'Mapa da Memória' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aqui já alagou!');
});

test('teclado: link "Pular para o conteúdo" é o primeiro foco', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
});
