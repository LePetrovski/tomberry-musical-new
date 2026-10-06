import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; label: string };

class AssetErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[home-scene] ${this.props.label}`, error, info.componentStack);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Optional assets must never suspend or replace the interactive scene. */
export function SceneAsset({ children, label }: Props) {
  return (
    <AssetErrorBoundary label={label}>
      <Suspense fallback={null}>{children}</Suspense>
    </AssetErrorBoundary>
  );
}
