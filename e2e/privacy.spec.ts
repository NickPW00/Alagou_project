import { expect, test } from '@playwright/test';

// A8: transparência sobre dados na versão atual e links para os rascunhos.
test('Sobre explica os dados hoje e linka os rascunhos não vigentes', async ({ page }) => {
  await page.goto('/sobre');
  const hoje = page.locator('section', { has: page.getByRole('heading', { name: 'Seus dados hoje' }) });
  await expect(hoje.getByText(/não há cadastro nem banco de dados/)).toBeVisible();
  for (const svc of ['GitHub Pages', 'OpenFreeMap', 'Photon', 'Open-Meteo', 'INMET']) await expect(hoje.getByText(new RegExp(svc))).toBeVisible();
  await expect(page.getByRole('link', { name: /Política de Privacidade \(rascunho, não vigente\)/ })).toHaveAttribute('href', /politica-de-privacidade-RASCUNHO\.md$/);
  await expect(page.getByRole('link', { name: /Termos de Participação \(rascunho, não vigente\)/ })).toHaveAttribute('href', /termos-de-participacao-RASCUNHO\.md$/);
});
