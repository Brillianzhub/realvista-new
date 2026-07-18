import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback: React.ReactNode;
    onError?: (error: Error) => void;
}

interface State {
    hasError: boolean;
}

class MapErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.warn('MapView failed to render:', error);
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export default MapErrorBoundary;
