# Monorepo 架构与工具研究（Monorepo Architecture & Tooling Research）

## 1. 项目意图与范围（Project Intent & Scope）

本仓库是一个**面向工具与架构的技术调研项目**，用于系统性地理解现代前端 Monorepo 架构是如何被搭建的、不同工具之间如何协作，以及它们各自的职责边界。

需要特别说明的是：**本仓库并不是一个工程落地方案，也不是最佳实践模板**。它更像是一份可运行的“对照实验”，用于讨论和比较不同 Monorepo 架构形态背后的设计取舍。

---

## 2. 本仓库是什么（以及不是什么）

**本仓库是：**
- 一个 Monorepo 架构与工具的对比研究
- 一个以工具职责与边界为核心的技术拆解
- 一个可运行、可验证的讨论载体（而不是纯概念文档）
- 面向技术讨论 / 面试 / 架构思考的参考项目

**本仓库不是：**
- 一个生产可直接使用的工程模板
- 一个 Turborepo 的推广或推荐方案
- 一个“最佳实践”或“银弹式”解决方案
- 一个替代真实工程决策的结论仓库

---

## Non-Goals（非目标）

为了避免讨论失焦，本仓库**刻意不尝试**解决以下问题：

- ❌ 不给出「哪一种 Monorepo 架构更好」的结论  
  不同团队、不同阶段、不同约束下，最优解并不相同。本仓库只讨论结构与工具能力，而不替代工程判断。

- ❌ 不比较性能指标（如 build 时间快多少）  
  性能数据强依赖具体项目规模、缓存命中率与 CI 环境，脱离上下文的对比没有长期价值。

- ❌ 不覆盖业务层面的拆分策略  
  业务如何拆 domain、如何切边界，是组织与产品决策问题，而非工具问题。

- ❌ 不尝试统一或简化工具链  
  本仓库的目标不是「减少工具数量」，而是**明确工具各自的责任边界**。

- ❌ 不作为团队规范或工程模板  
  本仓库不承担规范约束责任，也不假设读者会直接在此基础上开展生产开发。

这些 Non-Goals 的存在，是为了确保讨论始终停留在**架构认知与工具边界**这一层级。

---

## 3. 基线方案：CRA + Yarn Workspace Monorepo

本调研的起点并不是 Turborepo，而是一个**已经可以正常工作的 Monorepo 架构**：

- 使用 CRA 作为构建与开发服务器工具（Webpack 体系）
- 使用 Yarn Workspaces 实现 packages 级别的代码复用
- 将共享代码划分为 domain 与 widgets 两类

这一基线方案被**完整保留**，用于清晰对比：

> 在引入 Turborepo 之后，哪些东西发生了变化，哪些并没有。

---

## 4. 引入 Turborepo：改变了什么，没有改变什么

在本仓库中，Turborepo 被引入为一个**任务调度层（Task Orchestration Layer）**，而不是：

- Workspace 的替代品
- 包管理器的替代品
- CRA 构建体系的替代品

Turborepo 在这里主要负责：
- 在多个 package 之间调度 build / start 等任务
- 并行执行可并行的任务
- 构建明确、可观察的任务 DAG（有向无环图）
- 提供任务级别的缓存语义

而以下内容**并未因为 Turborepo 的引入而改变**：
- packages 如何被共享（仍由 workspace 决定）
- 依赖如何被安装与存储（仍由包管理器决定）
- 实际的构建与启动逻辑（仍由 CRA tooling 执行）

---

## 5. 工具职责与边界（Tooling Responsibilities & Boundaries）

本仓库刻意将不同工具的职责拆分清楚：

- **Workspace（Yarn / pnpm）**：解决 packages 如何被多个应用共享
- **包管理器（npm / yarn / pnpm）**：解决依赖的解析与存储模型
- **CRA Tooling**：负责 build / start / webpack 行为
- **Turborepo**：负责任务的调度、排序与执行策略

一个核心结论是：

> Monorepo 是一种**结构性问题**，而不是某个工具本身。

---

## 6. Monorepo 任务调度：DAG 视角

在启用 Turborepo 后，Monorepo 中的任务会被显式建模为一个 **DAG（有向无环图）**：

- 节点：某个 package 中的某个任务（如 build）
- 边：任务之间的依赖关系

这一 DAG 决定了：
- 执行顺序（拓扑排序 / 后序遍历）
- 哪些任务可以并行执行
- 缓存命中与否的判断边界

通过 Turborepo 的任务元数据与日志，这一 DAG 是**可观察、可验证的**。

---

## 7. 复用模型：Domain 与 Widget

在本仓库中，共享代码被明确区分为两种不同的复用模型：

- **Domain packages**：业务领域逻辑，随业务规则演进
- **Widgets**：面向业务的 UI + 行为模块，随产品发布节奏演进

这种区分来源于真实的金融前端实践：

> 并非所有可复用代码都适合被发布为 npm 包。

有些模块需要与业务流程、发布节奏强绑定，Monorepo 在这种场景下更自然。

---

## 8. Workspace 与依赖管理对比

本仓库同时讨论：

- Workspace 的概念与设计目的
- Yarn Workspace 与 pnpm Workspace 的差异
- npm / yarn / pnpm 在依赖存储模型上的不同取舍

相关讨论集中在以下文档中，避免在 README 中过度展开。

---

## 9. 与官方 Turborepo 示例的对比

官方 Turborepo 示例更多体现的是一种**平台化方案**（通常以 Next.js 为核心），而本仓库关注的是：

- 从既有工程（CRA + Workspace）迁移与对照
- 工具职责的拆解，而非一体化平台体验

两者关注的问题层级不同，因此不构成优劣对比。

---

## 10. 核心结论（Key Takeaways）

- Monorepo 是架构问题，不是工具问题
- Turborepo 解决的是任务调度，而不是代码复用
- Workspace 是基础设施，而不是亮点功能
- 工程决策与技术调研应当被区分讨论

---

## 🔍 工具与依赖管理研究（docs/dependency-management/）

这是本仓库的**核心内容区**。  
该目录并非零散的工具说明，而是一组**围绕 Monorepo 架构中「工具职责边界」展开的系统性研究文档**。

每一篇文档都刻意聚焦于一个**明确的工程问题**，并避免工具崇拜或结论先行。

---

### [monorepo-tooling-boundaries.md](docs/dependency-management/monorepo-tooling-boundaries.md)  
**主题：Monorepo 中“工具各自负责什么”的边界划分**

这篇是**总纲级文档**，回答的是一个基础但经常被混淆的问题：

> 在一个 Monorepo 里，  
> **Turbo / Workspace / 包管理器 / 构建工具**  
> 各自到底解决了什么问题？

核心关注点包括：
- Turbo *不是* 用来做 packages 复用的
- Workspace *不是* 构建系统
- 包管理器解决的是依赖模型，而不是工程结构
- CRA / Next 这类 tooling 承担的是“具体执行”

---

### [workspace.md](docs/dependency-management/workspace.md)  
**主题：Workspace 的概念、设计目的与实现方式**

这篇文档专门回答：

> Workspace 到底是什么？  
> 它解决的是哪一类工程问题？

内容重点：
- Workspace 的抽象目标：**packages 级别的代码复用**
- 为什么 Workspace 是 Monorepo 的“基础设施”
- Yarn Workspace 与 pnpm Workspace 在能力层面的共性
- Workspace 与 Turbo 之间的关系（互补而非替代）

---

### [yarn_vs_pnpm.md](docs/dependency-management/yarn_vs_pnpm.md)  
**主题：Yarn Workspace vs pnpm Workspace 的工程差异**

这篇文档关注的是一个**常见但容易被问歪的问题**：

> “Workspace 和 pnpm 有什么区别？”

文档会澄清：
- Workspace 是概念，不是 pnpm 独有能力
- Yarn 与 pnpm 都实现了 Workspace
- 两者在 **依赖解析策略、node_modules 结构** 上的不同
- 不同实现方式带来的工程取舍

---

### [pnpm.md](docs/dependency-management/pnpm.md)  
**主题：pnpm 的依赖模型与设计动机**

这篇文档不从“pnpm 快不快”入手，而是回答：

> pnpm 到底做了什么？  
> 它为什么要这样做？

核心内容包括：
- 把依赖版本视为**完全独立的节点**
- 内容寻址（content-addressable store）的思想
- 为什么 pnpm 的 node_modules 看起来“发散”
- pnpm 的模型如何降低磁盘冗余、提高确定性

---

### [npm-vs-yarn-vs-pnpm-what-problem-does-each-solve.md](docs/dependency-management/npm-vs-yarn-vs-pnpm-what-problem-does-each-solve.md)  
**主题：三代包管理器分别在解决什么问题**

这是一个**时间轴 + 问题导向**的对比文档。

关注点不是“谁更好”，而是：
- npm 解决了什么历史问题
- yarn 在 npm 的哪些痛点上做了改进
- pnpm 又是针对什么新的约束条件出现的

---

### [turbo.md](docs/dependency-management/turbo.md)  
**主题：Turbo 在 monorepo-with-turbo 中具体做了什么**

这篇文档只讨论一件事：

> 在这个仓库里，Turbo **实际承担了哪些职责**？

内容包括：
- Turbo 如何构建任务 DAG
- build / start 任务的调度关系
- Turbo 的缓存粒度与边界
- Turbo **不会**替代哪些东西（Workspace / CRA / 包管理器）

---

### [Turbo_vs_turborepo_example.md](docs/dependency-management/Turbo_vs_turborepo_example.md)  
**主题：工程迁移视角 vs 官方平台化示例的差异**

这篇文档专门用于**对照官方 Turborepo 示例**。

讨论的不是优劣，而是**关注点不同**：
- 官方示例：以 Next.js 为核心的平台化方案
- 本仓库：从既有 CRA Monorepo 出发的工程迁移与对照

它解释了：
- 官方 example 里的 tooling 能力“交给了谁”
- 为什么两种结构服务的是不同层级的问题
- 为什么本仓库不试图复刻官方示例

---

## 11. 文档索引（Related Documents）

### 工具与依赖管理研究（docs/dependency-management/）

- `monorepo-tooling-boundaries.md`
- `npm-vs-yarn-vs-pnpm-what-problem-does-each-solve.md`
- `pnpm.md`
- `yarn_vs_pnpm.md`
- `workspace.md`
- `turbo.md`
- `Turbo_vs_turborepo_example.md`

### 架构与设计笔记

- `CRA_Monorepo_Workspace.md`
- `domain.md`
- `widgets.md`
- `not_only_components.md`
- `not_npm.md`
- `not_npm_why.md`
- `todo.md`

---

## 如何使用这个仓库

本仓库更适合作为：

- 技术讨论或面试中的参考项目
- 比较不同 Monorepo 工具与架构时的对照样本
- 抽象化思考工程问题的辅助材料

**并不建议直接 fork 并用于生产环境。**

---

## 结语

本仓库的目标不是推广工具，而是**澄清认知**。

Monorepo 的价值来自清晰的结构，而不是工具堆叠。
