/**
 * Adapter example
 *
 * Widgets must not assume runtime environment (auth/API/tracking).
 * Inject differences through an adapter.
 */

export function createExampleAdapter({
  status = "ready",
  delay = 150,
} = {}) {
  return {
    async bootstrap() {
      await new Promise((r) => setTimeout(r, delay));
      return { status, ts: Date.now() };
    },

    // Example placeholders (implement per product):
    // async fetchData() {},
    // async sendAction(payload) {},
    // track(eventName, payload) {},
  };
}
