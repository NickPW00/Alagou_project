import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Estilo mínimo de mapa: isola os testes do serviço externo de tiles. */
export const STUB_STYLE = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#dfe9f0' } }],
};

export async function stubMap(page: Page) {
  await page.route(/openfreemap\.org/, (route) =>
    route.request().url().includes('/styles/')
      ? route.fulfill({ json: STUB_STYLE })
      : route.fulfill({ status: 404, body: '' }),
  );
}

export async function failMap(page: Page) {
  await page.route(/openfreemap\.org/, (route) => route.abort('internetdisconnected'));
}

export async function expectAccessible(page: Page) {
  // O @axe-core/playwright tipa contra outra versão do Playwright; a API usada é compatível.
  const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('.maplibregl-canvas')
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
