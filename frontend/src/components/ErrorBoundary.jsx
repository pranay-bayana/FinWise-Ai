import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>App crashed</h1>
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
          {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
        </pre>
      </div>
    );
  }
}

