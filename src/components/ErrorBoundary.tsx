import { Component, type ReactNode } from 'react';

type Props = { fallback: ReactNode; onError?: (e: unknown) => void; children: ReactNode };

/** Captura falhas de renderização ou de carregamento de código (ex.: parte do app não salva no aparelho e sem internet). */
export default class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
