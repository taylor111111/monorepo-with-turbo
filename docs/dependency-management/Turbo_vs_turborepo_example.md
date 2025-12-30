

# Turbo vs 官方 turborepo example  
## 平台化（Next） vs 工程迁移（CRA tooling）

在很多介绍 Turborepo 的文章中，官方 example（`create-turbo`）常常被当作“标准答案”。  
但当我把一个**真实存在、长期运行的 CRA + Yarn Workspace + Webpack 工程**迁移进 Turbo 之后，我发现：

> **官方 example 和真实工程的关注点，几乎不在同一个层级。**

这并不是优劣之分，而是**出发点完全不同**。

---

## 一句话结论（面试官友好版）

- **官方 turborepo example**  
  👉 平台化方案，以 **Next.js** 为核心，目标是「开箱即用 + 统一技术栈」

- **monorepo-with-turbo（本文方案）**  
  👉 工程迁移方案，目标是「在不推翻既有架构的前提下，引入任务调度能力」

---

## 一、官方 turborepo example 在做什么？

官方 example（`pnpm dlx create-turbo@latest`）的核心特征非常明确。

### 1️⃣ Next 是“平台核心”

在官方 example 中：

- Next.js 并不是一个普通的 app
- 它是 **事实上的平台核心**
- 构建、路由、SSR、Bundler、Dev Server 都由 Next 接管

> Turbo 在这里更像是 **Next 的并行执行器**。

### 2️⃣ Tooling 被平台吸收

在官方 example 中，几乎看不到：

- 显式的 webpack 配置
- 独立的 build / start 工具脚本
- 可迁移的 CRA tooling

原因很简单：

> **Next 本身就是一个“工具集合体”。**

| 能力 | 负责方 |
|----|----|
| bundling | Next（webpack / swc） |
| dev server | Next |
| build pipeline | Next |
| code transform | SWC |
| env 注入 | Next |
| output 结构 | Next |

Turbo 在这里只负责：

- 发现需要执行任务的 package
- 并行调度任务
- 计算缓存与依赖关系

---

## 二、monorepo-with-turbo 在做什么？

`monorepo-with-turbo` 的出发点完全不同。

### 1️⃣ 这是一个“活着的工程”

它并不是模板，而是从以下结构**迁移而来**：

```
CRA + Webpack + Babel
+ Yarn Workspace
+ domain / widget 业务复用
```

前提是：

> **工程已经存在，并且正在被人使用。**

### 2️⃣ Tooling 是一等公民

在这个仓库中：

- `tooling/cra-config` 是显式存在的
- build / start 的行为是 **工程资产**
- Turbo **不替代 tooling**

职责分工非常清晰：

| 层级 | 负责内容 |
|----|----|
| CRA tooling | build / start 的具体实现 |
| Workspace | 依赖管理与代码复用 |
| Turbo | 任务的依赖关系与调度 |

> Turbo 是**调度系统**，而不是构建系统。

---

## 三、平台化 vs 工程迁移：本质差异

### 官方 example：平台化思路

平台化的核心假设是：

> **你愿意用工程自由度，换取平台一致性。**

优点：

- 新人友好
- 配置极少
- 技术栈高度统一

代价：

- 工程被平台绑定
- 架构演进受平台节奏影响
- 老工程迁移成本极高

---

### monorepo-with-turbo：工程迁移思路

工程迁移的核心假设是：

> **工程历史是资产，而不是负担。**

优点：

- 不推翻已有架构
- 可以渐进引入新工具
- 迁移路径清晰、可控

代价：

- 需要清楚每一层在做什么
- 架构决策不能外包给工具

---

## 四、为什么官方 example 看起来“更简单”？

因为它**提前替你做了大量决策**：

- 选定 Next
- 选定 SWC
- 选定 pnpm
- 选定输出结构
- 选定开发范式

而在 monorepo-with-turbo 中：

> **这些决策仍然掌握在工程自己手里。**

Turbo 不关心：

- 用不用 CRA
- 用不用 webpack
- 用不用 Babel

它只关心一件事：

> **任务之间是否存在可计算的依赖关系（DAG）。**

---

## 五、两种方案并不冲突

一个常见误解是：

> “用了 Turbo，就应该用官方 example 的方式。”

实际上：

- 官方 example ≈ **平台产品**
- monorepo-with-turbo ≈ **工程方法论**

你完全可以：

- 新项目采用平台化
- 老项目采用工程迁移
- 同一公司内两种并存

---

## 六、如何选择？

### 适合官方 turborepo example（Next 平台）

- 全新项目
- 希望强约束架构
- 团队工程经验差异较大
- 接受平台锁定

### 适合 monorepo-with-turbo（工程迁移）

- 已有 CRA / Webpack 工程
- 有稳定 build / start 流程
- 工程历史本身有价值
- 希望渐进演进，而非推倒重来

---

## 总结

Turbo 本身并不偏向 Next，  
只是**官方 example 的叙事绑定了 Next**。

当你把 Turbo 从 example 中抽离，会发现：

> **它本质上只是一个：  
> 把工程中的隐式顺序，显式化为 DAG 的任务调度系统。**

至于「怎么 build、怎么 start、用什么工具」，  
那是工程自己的事情。

这正是 `monorepo-with-turbo` 想要证明的核心结论。
