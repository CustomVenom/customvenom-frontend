'use client';
import { Component, ReactNode } from 'react';

interface Props { 
  children: ReactNode; 
  fallback?: ReactNode;
  requestId?: string;
}

interface State { 
  hasError: boolean; 
  error?: Error;
  requestId?: string;
  copied: boolean;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { 
    super(props); 
    this.state = { hasError: false, copied: false }; 
  }
  
  static getDerivedStateFromError(error: Error) { 
    return { hasError: true, error }; 
  }

  componentDidCatch(error: Error) {
    // Try to extract request_id from error message if available
    const match = error.message.match(/request_id[:\s]+([a-f0-9-]+)/i);
    if (match) {
      this.setState({ requestId: match[1] });
    }
  }

  copyRequestId = () => {
    const rid = this.state.requestId || this.props.requestId || 'unknown';
    navigator.clipboard.writeText(rid).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };
  
  render() {
    if (this.state.hasError) {
      const requestId = this.state.requestId || this.props.requestId;
      
      return this.props.fallback ?? (
        <div className="card p-6 text-center space-y-4">
          <div>
            <p className="text-red-600 font-semibold">Something went wrong loading data.</p>
            <p className="text-sm text-gray-600 mt-1">{this.state.error?.message}</p>
          </div>
          
          {requestId && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
              <p className="text-gray-500 mb-2">Request ID:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="font-mono text-xs bg-[rgb(var(--bg-input))] px-2 py-1 rounded border border-[rgba(148,163,184,0.2)] text-[rgb(var(--cv-primary))]">
                  {requestId}
                </code>
                <button
                  onClick={this.copyRequestId}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Copy request ID"
                >
                  {this.state.copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => this.setState({ hasError: false, copied: false })}
            className="px-4 py-2 bg-[rgb(var(--cv-primary))] text-[#0A0E1A] rounded-lg hover:bg-[rgb(var(--success))] transition-all font-semibold shadow-lg"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

