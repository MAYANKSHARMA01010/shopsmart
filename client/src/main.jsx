import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

async function enableMocking() {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }
    const { worker } = await import('./mocks/browser');
    return worker.start();
}

const enableMSW = import.meta.env.VITE_ENABLE_MSW === 'true' || import.meta.env.VITE_ENABLE_MSW === undefined;

if (enableMSW) {
    enableMocking().then(() => {
        ReactDOM.createRoot(document.getElementById('root')).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
        );
    });
} else {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
