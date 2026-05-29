import React from 'react';

import { debugError } from './debug';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary
  extends React.Component<Props, State> {

  constructor(props: Props) {

    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {

    return {
      hasError: true,
    };
  }

  componentDidCatch(error: any, info: any) {

    debugError(
      `React Error: ${error?.message}`
    );

    debugError(JSON.stringify(info));
  }

  render() {

    if (this.state.hasError) {

      return (
        <div style={{ padding: 20 }}>
          <h1>Erro na aplicação</h1>

          <p>
            Veja o painel de debug.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}