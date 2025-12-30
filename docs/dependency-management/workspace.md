# Workspace 是什么？——从工程问题到实现机制

> 本文不是工具说明，而是一次**工程概念的澄清**。
> 目标是回答三个问题：
>
> 1. workspace 这个概念为什么会出现？
> 2. 它解决的到底是什么工程问题？
> 3. yarn workspace 与 pnpm workspace 是如何实现「packages 被多个 app 共享」的？

---

## 目录

1. workspace 的概念与设计动机
2. workspace 解决的真实工程问题
3. 一个最小可用的 workspace 依赖模型
4. yarn workspace：共享优先的实现方式
5. pnpm workspace：边界优先的实现方式
6. yarn vs pnpm 的核心差异对比
7. 面试场景下的一句话总结
8. workspace 与 turborepo 的关系

---

## 一、workspace 是什么（概念层）

**workspace 不是某一个工具的名字，而是一种工程能力。**

它的本质定义是：

> 在**同一个代码仓库**中，
> 以**多个 package 为基本单元**进行依赖管理、安装与引用，
> 并允许这些 package 像 npm 包一样被使用，但不需要发布到 npm。

因此：

- workspace 是一种 *工程组织模型*
- yarn / pnpm / npm 只是这个模型的不同实现

---

## 二、workspace 为什么会出现（工程动机）

在 workspace 出现之前，多项目共享代码通常只能通过以下方式：

| 方式 | 核心问题 |
|----|----|
| 复制代码 | 不可维护，必然分叉 |
| git submodule | 心智成本高，易出错 |
| 私有 npm 包 | 发布成本高，版本割裂 |
| npm link | 调试脆弱，不可规模化 |

这些方式的共同问题是：

> **代码共享只能发生在“发布之后”，而不是“开发之中”。**

workspace 的设计目标正是：

> **把“发布阶段才能建立的包关系”，提前到开发阶段。**

---

## 三、一个最小可用的 workspace 依赖模型

假设仓库结构如下：

```
repo/
├── apps/
│   ├── app-a
│   └── app-b
└── packages/
    └── shared-utils
```

逻辑依赖关系是：

```
app-a ─┐
       ├── shared-utils
app-b ─┘
```

这就是 workspace 在**逻辑层面**建立的依赖图。

> 到这一步为止，**yarn 与 pnpm 的能力是完全一致的**。
> 差异只体现在：依赖是如何在 node_modules 中被“物理实现”的。

---

## 四、yarn workspace：共享优先的实现方式

### 4.1 核心策略

**yarn workspace 的核心目标是：让工程尽可能顺滑地运行。**

它主要做了三件事：

1. 所有依赖统一在仓库根目录安装
2. workspace package 通过 symlink 暴露为本地 npm 包
3. 尽可能 hoist 依赖，减少重复安装

### 4.2 典型 node_modules 结构（示意）

```
repo/
├── node_modules/
│   ├── react/
│   ├── lodash/
│   └── shared-utils/   → symlink
├── apps/
│   ├── app-a/
│   └── app-b/
└── packages/
    └── shared-utils/
```

### 4.3 工程特征

- shared-utils 像 npm 包一样被 app 引用
- 依赖尽量被提升、共享
- 依赖边界**偏宽松**，更多依赖工程约定

一句话概括：

> **yarn workspace 用“扁平化 + 约定”换取工程体验。**

---

## 五、pnpm workspace：边界优先的实现方式

### 5.1 核心策略

pnpm workspace 的核心目标不同：

> **在共享 package 的同时，强制依赖边界成立。**

它的关键机制包括：

1. 全局内容寻址存储（store）
2. 每个 package 拥有独立的 node_modules
3. 通过 symlink 精确连接声明过的依赖

### 5.2 典型 node_modules 结构（示意）

```
repo/
├── node_modules/
│   └── .pnpm/
│       ├── react@18.2.0/
│       ├── shared-utils@1.0.0/
│       └── lodash@4.17.21/
├── apps/
│   ├── app-a/
│   │   └── node_modules/
│   │       └── shared-utils/ → symlink
│   └── app-b/
│       └── node_modules/
│           └── shared-utils/ → symlink
└── packages/
    └── shared-utils/
        └── node_modules/
            └── lodash/
```

### 5.3 工程特征

- 每个 package 只能访问自己声明的依赖
- 错误依赖在文件系统层面不可达
- 更早暴露问题，适合大规模 monorepo

一句话概括：

> **pnpm workspace 用“物理隔离”保证工程正确性。**

---

## 六、yarn workspace vs pnpm workspace（核心差异）

| 维度 | yarn workspace | pnpm workspace |
|----|----|----|
| 共享方式 | hoist + symlink | symlink + 隔离 |
| node_modules | 扁平 | 非扁平 |
| 幽灵依赖 | 可能存在 | 物理禁止 |
| 工程体验 | 顺滑 | 严谨 |
| 心智成本 | 低 | 中 |
| 适合场景 | CRA / 老项目 / 快速开发 | 大型 monorepo / 多团队 |

---

## 七、面试场景下的一句话总结（安全版）

> **workspace 解决的是“代码如何在多个 app 之间共享”的问题；**  
> **yarn 与 pnpm 的差异，不在能力，而在依赖边界是靠约定还是靠结构。**

这句话：

- 不站队
- 不反驳
- 但工程含量非常高

---

## 八、workspace 与 turborepo 的关系

需要特别强调的是：

> **turborepo 并不实现 workspace。**

它只做三件事：

1. 读取 workspace 已经建立好的 package 依赖图
2. 基于该依赖图构建任务 DAG
3. 提供任务调度与缓存能力

因此：

- yarn workspace ✅
- pnpm workspace ✅
- turborepo 是其上的“调度放大器”

---

> 如果你能解释清楚 node_modules 的结构，
> 那你其实已经理解了 80% 的 workspace 与包管理器差异。
