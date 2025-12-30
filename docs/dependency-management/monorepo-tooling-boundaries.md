

# Monorepo Tooling Boundaries

> 在一个真实的 monorepo 工程中，工具本身并不重要，
> 重要的是：**每个工具停在哪一层，以及它不该越过哪些边界。**

本文基于一个真实工程 `monorepo-with-turbo`，从**工具职责边界**的角度，解释 Turbo / Workspace / CRA Tooling / pnpm(yarn) 在同一个工程中各自做了什么、没有做什么，以及为什么这种分层是稳定且可迁移的。

---

## 一、为什么要谈「工具边界」

在 monorepo 场景下，工程很容易出现一种错觉：

- 工具越多，能力越强
- 一个工具能不能“顺手多干点事”

但真实工程经验往往相反：

> **工程失控，几乎都来自工具越界，而不是工具能力不足。**

因此，本文不讨论“最佳实践”，只讨论一件事：

> **每个工具，在 monorepo 中，应该停在哪里。**

---

## 二、整体分层概览（自下而上）

从实现角度看，`monorepo-with-turbo` 可以被清晰拆成四层：

```
┌──────────────────────────────┐
│        Turbo (Task DAG)       │  ← 任务调度层
├──────────────────────────────┤
│      CRA Tooling (build)      │  ← 构建执行层
├──────────────────────────────┤
│     Workspace (packages)      │  ← 代码组织层
├──────────────────────────────┤
│   pnpm / yarn (node_modules)  │  ← 依赖物理层
└──────────────────────────────┘
```

这四层**互不替代、也不重叠**。

---

## 三、pnpm / yarn：依赖物理管理层

### 它们负责什么

- 解析 `package.json`
- 下载依赖
- 在磁盘上生成 `node_modules`

pnpm 与 yarn 的差异在于**实现方式**：

- yarn：尽量扁平化 hoist
- pnpm：内容寻址 + 多版本并存（`.pnpm/`）

### 它们不负责什么

- 不理解 monorepo
- 不知道哪些是 app / domain / widget
- 不关心 build / start / lint

> 这一层的职责只有一句话：
> **“依赖在磁盘上如何存在。”**

---

## 四、Workspace：packages 共享与代码组织层

### 它解决的问题

Workspace 是 monorepo 成立的前提。

它负责：

- 识别多个 package
- 允许 app 直接依赖本地 package
- 避免将内部模块发布成 npm 包

在本工程中：

```
apps/
  app-d
  app-e

packages/
  domain-*
  widgets/*
```

Workspace 让这些目录在**逻辑上属于同一个仓库**。

### 它刻意不做的事

- 不调度 build 顺序
- 不并行任务
- 不缓存结果

> Workspace 只负责一件事：
> **“代码如何被组织和复用。”**

---

## 五、CRA Tooling：构建执行层

### 它在工程中的真实角色

在 `monorepo-with-turbo` 中，`tooling/cra-config` 是一个显式存在的工程资产。

它负责：

- webpack 配置
- babel 转译
- dev server（start）
- production build（build）
- env 注入规则

换句话说：

> **CRA Tooling 决定了：一行 `yarn build` 实际执行了什么。**

### 它不应该承担的责任

- 不知道 monorepo 中有多少 app
- 不负责多个 app 的执行顺序
- 不做任务调度

这也是为什么：

- `@repo/cra-config` 不应该被 Turbo 当成 build 产物
- 它是“工具”，而不是“目标”

---

## 六、Turbo：任务调度与 DAG 层

### Turbo 在这里真正做了什么

Turbo 在这个工程中的角色非常克制：

1. 发现 task（build / start / lint）
2. 根据依赖关系构建 Task DAG
3. 执行拓扑排序并调度任务

例如：

```
widget#build  →  app#build
```

意味着：

- widget 的 build 必须先完成
- app 的 build 才能开始

### Turbo 刻意不做的事

- 不碰 webpack
- 不碰 babel
- 不管理 node_modules
- 不理解 CRA / Next 内部实现

> Turbo 的职责可以被严格描述为：
> **“把工程中隐含的顺序，变成机器可验证的 DAG。”**

---

## 七、职责边界汇总表

| 层级 | 工具 | 负责什么 | 不负责什么 |
|----|----|----|----|
| 调度层 | Turbo | 任务顺序 / 并行 / DAG | 如何 build |
| 执行层 | CRA Tooling | webpack / build / start | 多 app 调度 |
| 组织层 | Workspace | packages 共享 | 构建顺序 |
| 物理层 | pnpm / yarn | node_modules 落盘 | 工程结构 |

---

## 八、结语：为什么这种分层是稳定的

这种分层方式的好处在于：

- 每一层都可以被替换
- 但只要边界不变，工程整体不会失控

例如：

- CRA 可以被替换为 Vite / Next
- yarn 可以被替换为 pnpm
- Turbo 也可以被替换为其他调度系统

但前提始终是：

> **调度不碰执行，执行不碰组织，组织不碰物理。**

这不是某个工具的最佳实践，
而是工程长期演进中反复验证过的秩序。
