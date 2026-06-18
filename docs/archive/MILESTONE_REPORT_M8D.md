# Milestone Report M8D: Payment Verification & Webhooks

## Summary
The M8D milestone finalized the e-commerce transaction pipeline by introducing secure Payment Webhooks via BullMQ. The system now securely validates incoming gateway webhooks, handles duplication idempotently, and guarantees fulfillment resilience through queued workers without relying on synchronous frontend responses.

## Files
- `server/src/modules/payment/payment.validator.ts`
- `server/src/modules/payment/payment.controller.ts`
- `server/src/modules/payment/payment.routes.ts`
- `server/src/queues/paymentWebhook.queue.ts`
- `server/src/workers/paymentWebhook.worker.ts`
- `server/tests/webhook.integration.test.ts`
- `server/tests/queue.worker.test.ts`
- *Modified*: `server/src/server.ts`
- *Modified*: `server/package.json` (Added `bullmq`)

## Architecture
- Separated API ingest logic from heavy business execution.
- Extracted worker processor for testability in Vitest without requiring actual Redis connections.
- Order Transitions are explicitly routed through `OrderStateMachine.transition()` within transactions ensuring `CONFIRMED` or `CANCELLED` statuses are never arbitrarily assigned.

## Webhook Flow
1. Razorpay Webhook hits `/api/payment/webhook`.
2. Controller uses `express.raw()` to cryptographically verify the signature via `crypto.createHmac`.
3. Checks `ProcessedWebhook` database table using the payload/header `eventId`.
4. If exists, returns 200 without executing (skips duplication).
5. If new, enqueues to BullMQ `payment-webhook`.
6. Returns 200 synchronously to the Gateway.

## Queue Strategy
- Engine: BullMQ leveraging the existing `ioredis` cache.
- Deduplication: Relies on `jobId = eventId` natively in BullMQ combined with `ProcessedWebhook` PG constraints.
- Retries: 5 attempts with Exponential Backoff (base delay 2000ms).

## Security
- The webhook endpoint specifically skips `express.json()` to parse natively, completely negating HMAC tampering or JSON serialization drift.
- Never directly relies on user payload to complete an order.

## Build, Lint, and Tests
- **Lint**: 100% Passed. We eliminated unused return warnings.
- **Build**: 100% Passed. Typings correctly resolved.
- **Tests**: Mocked database queues efficiently. The system handled `P2002` (Duplicate Key Error) perfectly gracefully returning 200 OK. Coverage covers invalid signatures, captures, and fails.

## Risks
- Depending on the deployment, ensuring `bullmq` workers scale cleanly requires tuning `concurrency` settings within the Worker constructor depending on Redis memory limits.

## Future Improvements
- Add Slack/Email notification jobs cascaded sequentially after `PaymentTransactionStatus.CAPTURED`.
- Include the Reconciliation CRON job (if needed).
