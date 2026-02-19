import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get('/api/health', () => {
        return HttpResponse.json({
            status: 'ok',
            message: 'Mock Data Active (MSW)',
            timestamp: new Date().toISOString(),
        });
    }),
];
