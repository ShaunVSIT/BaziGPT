import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  shouldThrow: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: undefined, shouldThrow: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, shouldThrow: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.shouldThrow) {
      throw new Error("Test ErrorBoundary");
    }
    if (this.state.hasError) {
      return (
        <div className="m-4 flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-primary/15 bg-card p-6 text-center shadow-2xl shadow-primary/10 sm:p-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-primary text-primary-foreground">
              <AlertTriangle className="size-6" />
            </span>
            <h1 className="font-display text-3xl font-bold text-primary">
              Oops! Something went wrong
            </h1>
          </div>
          <p className="mx-auto mb-6 max-w-md font-medium text-muted-foreground">
            We encountered an unexpected error. Please try refreshing the page or
            return home. If the problem persists, contact support.
          </p>
          <div className="mb-3 flex flex-wrap justify-center gap-3">
            <Button onClick={this.handleRetry} className="font-semibold">
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="font-semibold"
            >
              Refresh Page
            </Button>
          </div>
          <a
            href="/"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
          >
            Go to Home
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
