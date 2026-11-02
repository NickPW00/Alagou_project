import { expect, test } from '@playwright/test';
import { stubMap } from './helpers';

test.beforeEach(async ({ page }) => stubMap(page));

test('fluxo completo de aviso em 8 etapas aparece no mapa', async ({ page }) => {
  await page.goto('/avisar');
  await expect(page.getByText('Alagou? Conta pra gente!')).toBeVisible();

  // Etapa 1 — validação dos obrigatórios
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Escolha o distrito.')).toBeVisible();
  await expect(page.getByText('Marque o local no mapa ou use sua localização.')).toBeVisible();

  await page.getByLabel('Distrito *').selectOption('Campos Elíseos');
  await page.getByLabel('Bairro *').fill('Bairro Teste E2E');
  await page.getByLabel('Nome da rua ou avenida *').fill('Rua Teste E2E');
  await page.getByLabel('Ponto de referência').fill('Perto da praça');
  const map = page.getByRole('region', { name: 'Mapa para marcar o local do alagamento' });
  await expect(page.getByText('Carregando mapa…')).toBeHidden({ timeout: 20000 });
  await map.scrollIntoViewIfNeeded();
  await map.click({ position: { x: 120, y: 100 } });
  await expect(page.getByText('Ponto marcado no mapa.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 2
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Como está a rua?');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Escolha uma opção.')).toBeVisible();
  await page.getByRole('radio', { name: 'Rua totalmente alagada' }).check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 3
  await page.getByRole('radio', { name: 'Está subindo' }).check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 4 — aviso de segurança presente
  await expect(page.getByText('Nunca atravesse uma área alagada para verificar sua profundidade.')).toBeVisible();
  await page.getByRole('radio', { name: 'Aproximadamente na altura do joelho' }).check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 5
  await page.getByRole('checkbox', { name: 'Bueiro obstruído' }).check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 6
  await page.getByLabel('Descrição (opcional)').fill('Teste automatizado');
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 7 — data futura bloqueada
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quando aconteceu?');
  const date = page.getByLabel('Data da observação');
  const today = await date.inputValue();
  const [y, m, d] = today.split('-').map(Number);
  const tomorrow = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  await date.fill(tomorrow);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('A observação não pode estar no futuro.')).toBeVisible();
  await date.fill(today);
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 8 — revisão
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Revisão e envio');
  await expect(page.getByText(/Rua Teste E2E.*Bairro Teste E2E, Campos Elíseos/)).toBeVisible();
  await expect(page.getByText('Bueiro obstruído')).toBeVisible();
  await page.getByRole('button', { name: 'Avisar a comunidade!' }).click();

  await expect(page.getByRole('heading', { name: 'Obrigado por colaborar com o Alag@u!' })).toBeVisible();
  await expect(page.getByText(/publicado no mapa/)).toBeVisible();

  await page.getByRole('link', { name: 'Ver no mapa' }).click();
  await page.getByRole('button', { name: 'Ver lista' }).click();
  await expect(page.getByRole('heading', { name: '9 relato(s)' })).toBeVisible();
  await page.getByRole('button', { name: /Rua Teste E2E/ }).click();
  const detail = page.getByRole('dialog', { name: /Rua Teste E2E/ });
  await expect(detail.getByText('Rua totalmente alagada')).toBeVisible();
  await expect(detail.getByText('Água subindo')).toBeVisible();
  await expect(detail.getByText('Relato recente')).toBeVisible();
});

test('GPS negado mostra orientação para marcar no mapa', async ({ page, context }) => {
  await context.clearPermissions();
  await page.goto('/avisar');
  await page.getByRole('button', { name: 'Usar minha localização' }).click();
  await expect(page.getByText(/Não foi possível obter sua localização/)).toBeVisible({ timeout: 20000 });
});

test('moderação de demonstração oculta e restaura relato', async ({ page }) => {
  await page.goto('/admin');
  const card = page.locator('li', { hasText: '(d1)' });
  await card.getByRole('button', { name: 'Ocultar do público' }).click();
  await expect(card.getByText('Estado: Removido pela moderação')).toBeVisible();
  await card.getByRole('button', { name: 'Restaurar' }).click();
  await expect(card.getByRole('button', { name: 'Ocultar do público' })).toBeVisible();
});
