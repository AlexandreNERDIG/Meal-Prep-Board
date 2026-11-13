import { Component, type ErrorInfo, type ReactNode } from 'react';
import { translate } from '../i18n/core';
import './Privacy.css';

type State = { hasError: boolean };

class ErrorBoundary extends Component<{ children: ReactNode }, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Erreur d\'affichage :', error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="errorScreen">
                <h1>{translate("error.title")}</h1>
                <p>{translate("error.text")}</p>
                <button className="Btn2" onClick={() => window.location.assign('/')}>{translate("error.reload")}</button>
            </div>
        );
    }
}

export default ErrorBoundary;
