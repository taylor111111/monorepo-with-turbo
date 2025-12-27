import React from "react";

/**
 * PvChat
 *
 * A widget should be an embeddable black box:
 * - Export a single component
 * - Keep internal structure private
 * - Accept runtime/environment differences via adapter
 */

export default function PvChat({
  title = "PvChat",
  adapter,
  onEvent,
}) {
  const [status, setStatus] = React.useState("ready");

  React.useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!adapter || typeof adapter.bootstrap !== "function") return;
      setStatus("booting...");
      try {
        const info = await adapter.bootstrap();
        if (!cancelled) {
          setStatus(info?.status || "ready");
          onEvent?.({ type: "BOOTSTRAP_OK", payload: info });
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          onEvent?.({ type: "BOOTSTRAP_ERROR", payload: String(err) });
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [adapter, onEvent]);

  return (
    <section className="widget">
      <header className="widget__header">
        <h4 className="widget__title">{title}</h4>
        <span className="widget__status">{status}</span>
      </header>

      <div className="widget__body">
        {/* TODO: implement your scenario UI here */}
        <p className="widget__hint">This is a generated widget skeleton.</p>
        <button
          className="widget__button"
          type="button"
          onClick={() => onEvent?.({ type: "CLICK", payload: { widget: "pv-chat" } })}
        >
          Emit event
        </button>
      </div>
    </section>
  );
}
