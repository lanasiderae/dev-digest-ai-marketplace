# Onion Architecture — Examples

Snippets below use a generic example backend's module names (`settings`, `orders`, `billing`) rather than any one specific codebase — substitute your repo's actual module names and adapter calls when applying these rules. See [rules/layers.md](rules/layers.md) and [rules/enforcement.md](rules/enforcement.md) for the rules these illustrate, and [README.md](README.md) for sources.

## 1. Route-only module is correct for CRUD — don't add empty layers

`settings/` has no `service.ts` or `repository.ts` — `routes.ts` talks to the DB directly via the container:

```ts
// settings/routes.ts — GOOD: no added layer, because there's nothing to orchestrate
app.get('/settings', async (req) => {
  const { workspaceId } = await getContext(container, req);
  const rows = await container.db
    .select()
    .from(t.settings)
    .where(eq(t.settings.workspaceId, workspaceId));
  return rowsToSettings(rows);
});
```

```ts
// BAD: adding a pass-through service.ts/repository.ts "to match" other modules
// service.ts
export class SettingsService {
  constructor(private repo: SettingsRepository) {}
  getSettings(workspaceId: string) {
    return this.repo.getSettings(workspaceId); // adds nothing — pure forwarding
  }
}
// repository.ts
export class SettingsRepository {
  constructor(private db: Db) {}
  getSettings(workspaceId: string) {
    return this.db.select().from(t.settings).where(eq(t.settings.workspaceId, workspaceId));
  }
}
```
This is the "indirection without abstraction" anti-pattern — two new files and zero new behavior. Other simple CRUD modules should follow the same route-only shape for the same reason.

## 2. Dependency direction inside a module that *does* have the full chain

`orders/` has `routes.ts` → `service.ts` → `repository.ts`:

```ts
// GOOD: routes.ts only ever calls into service.ts
// orders/routes.ts
const service = new OrderService(container);
app.post('/orders/:id/fulfill', ..., async (req) => {
  const targets = await service.resolveTargets(workspaceId, body);
  const { runs, results } = await service.fulfillOrder(workspaceId, req.params.id, targets, req.log);
  return { order_id: req.params.id, runs, results };
});
```

```ts
// BAD: a route reaching past service.ts straight into repository.ts
// orders/routes.ts
import { OrderRepository } from './repository.js';
const repo = new OrderRepository(container.db);
app.get('/orders/:id/history', async (req) => {
  return repo.getHistoryForOrder(req.params.id); // skips the Application layer entirely —
                                                    // any orchestration/auth-shaping service.ts
                                                    // would normally add is now bypassed
});
```

## 3. Extracting pure domain logic once it's genuinely hard to unit-test

`orders/helpers.ts` extracts pricing/reduction logic rather than leaving it embedded in `service.ts` — re-exporting from a pure core library if one exists in the repo:

```ts
// orders/helpers.ts — GOOD: no ORM or web-framework types in the signature
export { reducePriceBreakdown, sliceLineItems } from '@acme/pricing-core';

export function lineItemRowToDto(row: LineItemRow): OrderDtoLineItem {
  // pure mapping — takes a row shape in, returns a DTO shape out, no DB/HTTP access
  ...
}
```

Follow this precedent when a new business rule (e.g. a cost-allocation or ranking computation) starts needing a DB or a web-framework request just to exercise its logic in a test — pull the computation itself into a plain function first, and leave the DB/HTTP call as a thin wrapper around it.

```ts
// BAD: a pure computation trapped inside service.ts, forcing every test through the DB
export class OrderService {
  async computeOrderCost(orderId: string) {
    const order = await this.repo.getOrder(orderId); // DB round-trip required just to test the math below
    return order.unitsIn * PRICE_IN + order.unitsOut * PRICE_OUT;
  }
}
```

```ts
// GOOD: the math is a plain function; the DB call is a one-line wrapper around it
// helpers.ts
export function computeOrderCost(order: Pick<OrderRow, 'unitsIn' | 'unitsOut'>): number {
  return order.unitsIn * PRICE_IN + order.unitsOut * PRICE_OUT; // no DB, unit-testable directly
}
// service.ts
async computeOrderCost(orderId: string) {
  return computeOrderCost(await this.repo.getOrder(orderId));
}
```

## 4. ORM rows are fine in `service.ts` — not fine on the wire

```ts
// GOOD: repository returns the ORM-inferred row type; service.ts consumes it directly
// orders/repository.ts
export type OrderRow = typeof t.orders.$inferSelect;
getOrder(id: string): Promise<OrderRow | undefined> { ... }
```

```ts
// BAD: that same row type reaching a route response / validation-library contract unconverted
app.get('/orders/:id', async (req) => {
  return repo.getOrder(req.params.id); // OrderRow — a later column rename in
                                        // db/schema/*.ts now silently breaks the API contract
});
```

```ts
// GOOD: map explicitly once there's divergence between the row shape and the response shape
app.get('/orders/:id', async (req) => {
  const row = await repo.getOrder(req.params.id);
  return row ? orderRowToDto(row) : null; // Response shape is a validation-library contract from a shared package
});
```

## 5. Adapters are off-limits from routes — even in a route-only module

```ts
// BAD — a route calling container adapters directly, with no service.ts in the module at all.
app.post('/settings/test-connection', { schema: { body: ConnTestRequest } }, async (req) => {
  const { provider, key } = req.body;
  if (key) {
    await container.secrets.set(SECRET_KEY_BY_PROVIDER[provider], key);
  }
  if (provider === EMAIL_PROVIDER) {
    const client = await container.emailSender();      // adapter call straight from the route
    const identity = await client.verifySenderIdentity();
    return { provider, ok: true, message: `Verified as ${identity}` };
  }
  const payments = await container.paymentGateway(provider);   // same issue
  const accounts = await payments.listAccounts();
  return { provider, ok: true, message: `OK — ${accounts.length} accounts available` };
});
```
A route-only module calling an adapter directly like this is the anti-pattern to flag, not necessarily something to mass-refactor on sight if it's pre-existing debt. The fix going forward, applied the next time one of these handlers is touched, or to any *new* route that needs an adapter:

```ts
// GOOD — the route stays Presentation-only; the adapter call moves to a plain
// exported function (no class needed just to hold one function):
// settings/service.ts
export async function testConnection(container: Container, provider: Provider, key?: string) {
  if (key) await container.secrets.set(SECRET_KEY_BY_PROVIDER[provider], key);
  if (provider === EMAIL_PROVIDER) {
    const identity = await (await container.emailSender()).verifySenderIdentity();
    return { provider, ok: true, message: `Verified as ${identity}` };
  }
  const accounts = await (await container.paymentGateway(provider)).listAccounts();
  return { provider, ok: true, message: `OK — ${accounts.length} accounts available` };
}

// settings/routes.ts
app.post('/settings/test-connection', { schema: { body: ConnTestRequest } }, async (req) => {
  return testConnection(container, req.body.provider, req.body.key);
});
```
A plain `container.db` read in a route-only module (e.g. `settings`'s `GET /settings`) is **not** the same category — see `rules/enforcement.md` for why adapter calls get the stricter rule.

## 6. Repository interfaces: container adapters earn them, per-module repositories usually don't

```ts
// GOOD: platform/container.ts — a real interface for a genuinely swappable cross-cutting adapter
export interface PaymentGateway {
  charge(accountId: string, amountCents: number): Promise<ChargeResult>;
  refund(chargeId: string): Promise<void>;
}
// StripePaymentGateway implements it for real; MockPaymentGateway implements it for tests —
// two real implementations justify the interface.
```

```ts
// BAD: a speculative interface for a repository with exactly one implementation
// orders/repository.port.ts
export interface IOrdersRepository {
  getOrder(id: string): Promise<OrderRow | undefined>;
}
// orders/repository.ts
export class OrdersRepository implements IOrdersRepository { ... } // the only implementation that
                                                                      // exists or is planned — the
                                                                      // interface adds a file with no
                                                                      // swap it actually enables; direct
                                                                      // construction + integration tests
                                                                      // already cover the test need.
```
Add the interface only once a second real implementation (or a swap need direct construction can't satisfy) actually exists — not in anticipation of one.
