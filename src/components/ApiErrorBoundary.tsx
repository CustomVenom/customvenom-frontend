'use client';
import { Component, ReactNode } from 'react';

interface Props { 
  children: ReactNode; 
  fallback?: ReactNode;
}

interface State { 
  hasError: boolean; 
  error?: Error;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { 
    super(props); 
    this.state = { hasError: false }; 
  }
  
  static getDerivedStateFromError(error: Error) { 
    return { hasError: true, error }; 
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="card p-6 text-center">
          <p className="text-red-600">Something went wrong loading data.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

