import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Home from './Home';

describe('Início sem backend', () => {
  it('mostra marca, botões principais e estados vazios sem números inventados', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Alag@u' })).toBeInTheDocument();
    expect(screen.getByText('Alagou? Avisou!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver mapa ao vivo/ })).toHaveAttribute('href', '/mapa');
    expect(screen.getByRole('link', { name: /Avisar alagamento/ })).toHaveAttribute('href', '/avisar');
    expect(await screen.findByText('Ainda não há relatos registrados.')).toBeInTheDocument();
    expect(screen.queryByText(/MODO DEMONSTRAÇÃO/)).not.toBeInTheDocument();
    expect(screen.getByText(/ligue 199/)).toBeInTheDocument();
  });
});
