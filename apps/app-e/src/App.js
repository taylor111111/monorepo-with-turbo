import React from "react";
import "./App.css";
import { fetchUser } from "@repo/domain-user";
import PvChat from "@repo/widget-pv-chat";

// app-e: 模拟“真实金融产品”的 adapter（更复杂、更脏）
function createProdLikeAdapter({ userId }) {
  return {
    async bootstrap() {
      // 模拟鉴权 + PV 分配 + 合规校验
      await new Promise((r) => setTimeout(r, 500));

      if (!userId) {
        throw new Error("unauthorized");
      }

      return {
        status: "connected",
        pvId: "pv-789",
        ts: Date.now(),
      };
    },

    async sendMessage(message) {
      // 模拟真实网络请求
      console.log("[app-e][sendMessage]", {
        userId,
        message,
      });

      return { ok: true };
    },

    track(eventName, payload) {
      // 模拟埋点 / 审计
      console.log("[app-e][track]", eventName, payload);
    },
  };
}

function App() {
  const [name, setName] = React.useState("loading...");

  React.useEffect(() => {
    fetchUser().then((user) => {
      setName(user.name);
    });
  }, []);

  const pvChatAdapter = React.useMemo(() => {
    return createProdLikeAdapter({
      userId: "user-123",
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h3>app-e</h3>

        <p>
          Current user: <strong>{name}</strong>
        </p>

        <p>
          User data is shared from <code>@repo/domain-user</code>
        </p>

        <hr style={{ width: "60%", margin: "24px 0" }} />

        <h4>PvChat Widget (production-like)</h4>

        <PvChat
          title="Your Financial Advisor"
          adapter={pvChatAdapter}
          onEvent={(event) => {
            console.log("[app-e][PvChat event]", event);
          }}
        />
      </header>
    </div>
  );
}

export default App;
