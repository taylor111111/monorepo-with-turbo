

# Widgets 设计规范（金融向）

本文档用于定义 **widgets（可嵌入业务模块）** 在金融类系统中的设计原则、边界与工程规范。

widgets 不是普通 UI 组件，也不是完整产品，而是：

> **可被多个产品复用的、具备 UI + 样式 + 有限业务语义的业务场景模块**

---

## 1. widgets 的定位

### widgets 是什么

widgets 用于承载 **“小而完整的业务场景”**，常见于金融系统中：

- PV / 客服聊天卡片
- 风险提示卡片
- 合规说明弹窗
- KYC 进度模块
- 费率 / 利率说明面板

它们通常具备以下特征：

- 有 UI 和样式
- 有明确业务语义
- 会被多个产品 / 应用复用
- 本身不是一个完整 product

---

### widgets 不是什么

widgets **不是**：

- ❌ 纯 UI 组件（Button / Table）
- ❌ 纯业务规则（domain）
- ❌ 页面（page）
- ❌ 微前端应用

---

## 2. 与其他层级的边界

### 与 domain 的边界

| domain | widgets |
|------|--------|
| 无 UI | 有 UI |
| 业务事实 & 规则 | 业务场景表达 |
| 稳定 | 相对可变 |
| 不依赖运行环境 | 通过 adapter 适配环境 |

widgets **可以依赖 domain**，但 domain **绝不能依赖 widgets**。

---

### 与 ui 组件库的边界

| ui | widgets |
|---|--------|
| 无业务语义 | 有业务语义 |
| 原子 / 基础组件 | 场景级模块 |
| 被 widgets 使用 | 不反向依赖 widgets |

---

### 与 app 的边界

- app 是 product shell
- widgets 是可嵌入模块

widgets 不负责：

- 路由
- 页面布局
- 全局状态管理
- 产品级决策

---

## 3. 目录结构规范（标准模板）

```txt
packages/widgets/<widget-name>/
  ├── package.json
  ├── README.md
  └── src/
      ├── index.js          # 对外唯一出口
      ├── Widget.jsx        # 组件本体
      ├── styles.css        # 样式 / CSS Module
      ├── adapters/         # 环境适配层（可选）
      └── domain/           # widget 内部业务规则（可选）
```

---

## 4. 设计铁律（必须遵守）

### 规则一：widgets 必须是“可嵌入黑盒”

- 对外只暴露一个 React 组件
- 内部实现不可被外部依赖

```jsx
<PvChatWidget {...props} />
```

---

### 规则二：widgets 不拥有运行环境

widgets **不能假设**：

- API 域名
- 鉴权方式
- 埋点系统
- 全局 store

差异必须通过以下方式注入：

- props
- adapter
- context（谨慎使用）

---

### 规则三：widgets 只解决“一个业务场景”

如果一个模块：

- 需要路由
- 需要跨页面状态
- 包含多个业务子系统

它就已经 **不适合作为 widget**。

---

## 5. Adapter 设计规范（金融重点）

在金融系统中，不同产品往往存在：

- 不同鉴权体系
- 不同 API 域名
- 不同合规 / 埋点要求

widgets 必须通过 adapter 隔离这些差异。

### 示例

```js
const pvChatAdapter = {
  fetchMessages,
  sendMessage,
  trackEvent
};

<PvChatWidget adapter={pvChatAdapter} />
```

---

## 6. 什么时候应该创建 widget

满足以下 **至少 2 条**，即可考虑 widget：

- 被 2 个以上产品使用
- 包含 UI + 样式
- 表达明确业务语义
- 生命周期长于单一需求

---

## 7. 什么时候不应该使用 widget

- 仅单一页面使用
- 纯视觉组件
- 高度定制、不可复用
- 强依赖单一产品流程

---

## 8. 金融系统中的核心价值

widgets 的核心价值在于：

- 降低重复实现的合规 / 风控风险
- 保证业务场景一致性
- 减少产品之间的逻辑漂移
- 提升系统整体可审计性

---

## 9. 总结

widgets 是金融系统中 **承载“业务场景复用”的关键层级**。

它的存在是为了：

- 保护业务认知
- 控制复杂度
- 在多产品环境中保持一致性

请谨慎设计、克制扩展。
