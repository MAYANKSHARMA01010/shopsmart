import { render, screen } from '@testing-library/react';
import App from '../../App';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('App Unit Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders loading state initially', () => {
        // Mock fetch to return a promise that doesn't resolve immediately
        global.fetch = vi.fn(() => new Promise(() => { }));

        render(<App />);
        expect(screen.getByText(/Loading backend status.../i)).toBeInTheDocument();
    });
});
