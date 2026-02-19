import { render, screen } from '@testing-library/react';
import App from '../../App';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'

describe('App Integration Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders data after successful fetch', async () => {
        render(<App />);

        // Wait for the data to be displayed (MSW intercepts the request and returns the mock data from handlers.js)
        expect(await screen.findByText(/Mock Data Active \(MSW\)/i)).toBeInTheDocument();
        expect(screen.getByText(/ok/i)).toBeInTheDocument();
        // Timestamp is dynamic in handlers.js, so we just check it exists or ignore it for this basic test
        // If needed, we could override the handler here or use a regex for ISO string
    });

    it('handles fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Oversee the handler to return an error for this specific test
        server.use(
            http.get('*/api/health', () => {
                return HttpResponse.error()
            })
        )

        render(<App />);

        // Verify that loading message is still there or some error state handle (currently App just logs error)
        expect(screen.getByText(/Loading backend status.../i)).toBeInTheDocument();

        // Wait a bit for the promise to reject/MSW to process
        await new Promise(resolve => setTimeout(resolve, 0));

        // Note: MSW network error might produce a tailored error message
        // For simplicity, we check if console.error was called.
        // The exact error object depends on how fetch handles the network error simulated by MSW.
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
