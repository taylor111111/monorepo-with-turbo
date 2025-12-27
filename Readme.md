# Monorepo 模块化 React 应用（CRA + Webpack + Yarn Workspaces）

这个仓库是一个**真实工程示例**，展示了如何使用 **monorepo** 来构建多个 React 应用，并在**不发布内部 npm 包、不复制代码**的前提下，共享业务逻辑。

核心思想非常简单：

> **Apps 关注产品与 UI  
> Packages 关注可复用的业务能力  
> Tooling 关注构建与工程基础设施**

---

## 为什么要使用这个 Monorepo

在很多项目中，往往会出现这样的需求：

> **多个前端应用，需要共享同一套业务逻辑**  
> （例如：用户模型、权限规则、数据获取约定等）

常见的几种做法及其问题：

- ❌ 复制粘贴代码 → 难以维护、容易分叉
- ❌ 发布私有 npm 包 → 工作流沉重、版本管理复杂
- ❌ 应用之间强耦合 → 架构脆弱、难以演进

这个 monorepo 的目标是：

> **在同一个仓库中同时维护应用和共享业务模块，  
> 同时保持清晰的依赖边界。**

---

## 技术栈

- React 18  
- Webpack 5（基于 CRA 的自定义构建体系）  
- Yarn v1 Workspaces  
- Node.js v16

---

## 仓库结构

```
.
├── apps/                 # 可运行的应用（产品壳）
│   ├── app-d
│   └── app-e
│
├── packages/             # 可复用能力（业务与场景）
│   ├── domain-user       # 领域层：业务事实与规则
│   └── widgets           # Widget 层：可复用的业务场景模块
│       └── pv-chat
│           ├── src
│           ├── DECISIONS.md
│           ├── README.md
│           └── package.json
│
├── tooling/              # 构建系统与工程工具
│   └── cra-config
│
├── scripts/              # 仓库级脚本（构建、生成器等）
└── package.json          # Workspace 根配置 & 共享运行时依赖
```

---

### apps/

`apps/` 目录下的每一个文件夹，都是一个**独立的 React 应用**：

- 可以单独开发、单独运行
- 包含路由、UI、产品级逻辑
- **不允许包含可复用的业务规则**

示例：

- `app-d`：使用用户领域数据 + 权限规则  
- `app-e`：仅使用用户领域数据（只读视图）

---

### packages/

`packages/` 代表**可共享、可复用的能力模块**。

这些模块具有以下特征：

- 包含领域逻辑和业务规则
- 不依赖任何具体应用
- 通过 Yarn Workspaces 被多个应用消费

#### 示例：`@repo/domain-user`

该包定义了：

- 如何获取用户
- 用户在业务中的含义
- 权限判断等业务规则

当你修改这里的逻辑时，**所有依赖它的应用都会立即生效**，  
无需发布、无需版本管理、无需复制代码。

---

### widgets/

`widgets/` 目录用于存放 **可复用的业务场景模块（Widget）**。

Widget 介于「纯 UI 组件」与「完整页面」之间，用于承载：

- 明确的业务语义
- 独立但可嵌入的交互场景
- 可被多个应用 / 多个页面复用的业务能力

典型特征包括：

- ✅ 包含 UI + 样式 + 交互
- ✅ 不绑定路由、不控制页面结构
- ❌ 不直接负责鉴权、网络请求、埋点等产品差异

#### 示例：`@repo/widget-pv-chat`

`pv-chat` 是一个典型的业务 Widget，用于承载「PV / 客服沟通」这一业务场景：

- Widget 本体只关心交互与状态展示
- 不感知具体产品、用户或鉴权方式
- 通过 **adapter** 注入不同产品的行为差异

该目录下同时包含：

- `src/`：Widget 源码（React + 样式）
- `DECISIONS.md`：设计决策与边界说明（防止组件随时间退化）
- `README.md`：Widget 的使用说明

当多个应用需要使用同一个业务场景时，应优先考虑将其抽象为 Widget，而不是复制页面或组件代码。

---

### tooling/

`tooling/` 目录用于存放**构建基础设施**，而不是应用代码：

- 定制的 CRA + Webpack 配置
- Babel、loader、dev-server 等工程能力

这一层被**刻意隔离**，目的是：

> 将来可以整体替换构建工具  
> （例如 Vite、Rspack、Next.js），  
> 而不影响任何业务代码。

---

## 安装依赖

在仓库根目录执行一次即可：

```bash
yarn install
```

Yarn Workspaces 会自动完成：

- 依赖提升（hoist）
- 内部包的本地链接

---

## 本地开发运行应用

每个应用都可以独立启动：

```bash
cd apps/app-d
yarn start


cd apps/app-e
yarn start
```

支持热更新（HMR）。

---

## 构建

使用共享的 tooling 构建所有应用：

```bash
sh scripts/build.sh
```

每个应用都会独立构建，但共享依赖与构建工具缓存。

---

## Monorepo 的价值演示

这个仓库**刻意设计了两个应用，以不同方式使用同一个领域包**：

- `app-d`：展示用户信息，并进行权限校验
- `app-e`：仅展示用户身份信息

两个应用都依赖：

```js
@repo/domain-user
```

当你修改 `packages/domain-user` 中的业务规则时，  
两个应用都会立刻更新 —— **无需发布、无需版本号、无需同步升级**。

---

## 设计原则

- 应用只能依赖 packages，不能反向依赖
- 领域逻辑只存在于一个地方
- 构建工具是可替换的
- 依赖应当根据职责放置，而不是方便程度

---

## Engineering Notes

本仓库中的一些设计决策和工程取舍，被单独整理成文档，集中放在 `docs/` 目录下，用于：

- 解释 **为什么这样设计**，而不仅是“怎么用”
- 防止随着人员变动和时间推移，架构被逐步侵蚀
- 帮助阅读者快速理解真实工程背景

推荐阅读顺序如下：

- [`docs/not_only_components.md`](docs/not_only_components.md)  
  为什么在复杂业务中，仅有 components 分层会逐渐失效

- [`docs/not_npm_why.md`](docs/not_npm_why.md)  
  为什么在金融前端项目中，我选择不将业务模块做成 npm 包

- [`docs/CRA_Monorepo_Workspace.md`](docs/CRA_Monorepo_Workspace.md)  
  CRA + Monorepo + Yarn Workspace 的一次真实踩坑记录

- [`docs/widgets.md`](docs/widgets.md)  
  面向金融业务的 widgets 设计规范

- [`docs/domain.md`](docs/domain.md)  
  Domain 与 Widget 的边界与取舍（金融案例）

- [`docs/todo.md`](docs/todo.md)  
  尚未解决、但值得记录的复杂工程问题

---

## 总结

这个仓库展示了如何：

- 为多个 React 应用设计 monorepo 结构
- 安全、清晰地共享领域逻辑
- 避免为了内部代码而维护私有 npm 包
- 将构建系统与业务逻辑彻底解耦

它的目标不是“炫技 Demo”，  
而是一个**可阅读、可扩展、面向生产环境的工程结构示例**。

欢迎阅读、参考，并在此基础上继续演进。
