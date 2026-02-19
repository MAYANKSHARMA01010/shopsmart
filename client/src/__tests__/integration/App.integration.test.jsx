import { render, screen } from '@testing-library/react';
import App from '../../App';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('App Integration Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders data after successful fetch', async () => {
        const mockData = { status: 'ok', message: 'Test Msg', timestamp: '2023-01-01' };
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockData)
            })
        );

        render(<App />);

        // Wait for the data to be displayed
        expect(await screen.findByText(/Test Msg/i)).toBeInTheDocument();
        expect(screen.getByText(/ok/i)).toBeInTheDocument();
        expect(screen.getByText(/2023-01-01/i)).toBeInTheDocument();
    });

    it('handles fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        global.fetch = vi.fn(() => Promise.reject('API Error'));

        render(<App />);

        // Verify that loading message is still there or some error state handle (currently App just logs error)
        expect(screen.getByText(/Loading backend status.../i)).toBeInTheDocument();

        // Wait a bit for the promise to reject
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(consoleSpy).toHaveBeenCalledWith('Error fetching health check:', 'API Error');

        consoleSpy.mockRestore();
    });
});
