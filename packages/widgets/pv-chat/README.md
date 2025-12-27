# pv-chat

A reusable **widget** (UI + style + limited business semantics) intended for financial products.

## Responsibility
- Encapsulate a small, embeddable business scenario
- Expose a single React component API
- Accept environment differences via an adapter (API/auth/tracking)

## Public API

```jsx
import PvChat from "@repo/widget-pv-chat";
import { createExampleAdapter } from "@repo/widget-pv-chat/src/adapters/exampleAdapter";

const adapter = createExampleAdapter();

<PvChat
  title="PvChat"
  adapter={adapter}
  onEvent={(e) => console.log(e)}
/>
```

## Notes
- Do NOT put routing, page layout, or product-level state here.
- Prefer "domain" packages for stable business facts/rules.
