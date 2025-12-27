import React from "react";
import "./App.css";
import { fetchUser, canAccessUserDashboard } from "@repo/domain-user";
import PvChat from "@repo/widget-pv-chat";
import { createExampleAdapter } from "@repo/widget-pv-chat/src/adapters/exampleAdapter";

function App() {
  const [status, setStatus] = React.useState("loading...");

  React.useEffect(() => {
    fetchUser().then((user) => {
      const canAccess = canAccessUserDashboard(user) ? "yes" : "no";
      setStatus(`${user.name} | role: ${user.role} | access dashboard: ${canAccess}`);
    });
  }, []);

  const pvChatAdapter = React.useMemo(() => {
    return createExampleAdapter({
      status: "demo-ready",
      delay: 300,
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h3>app-d</h3>
        <p>{status}</p>
        <p>
          Data & business rules are provided by <code>@repo/domain-user</code>
        </p>

        <hr style={{ width: "60%", margin: "24px 0" }} />

        <h4>PvChat Widget Demo</h4>

        <PvChat
          title="PV Chat (app-d demo)"
          adapter={pvChatAdapter}
          onEvent={(event) => {
            console.log("[app-d][PvChat event]", event);
          }}
        />
      </header>
    </div>
  );
}

export default App;
