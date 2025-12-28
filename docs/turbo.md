# Turbo 在 monorepo-with-turbo 里到底做了什么？

> ——从 Task DAG 到后根序执行的一次工程拆解

在前端工程里，**Turbo（Turborepo）**常常被描述为「更快的 monorepo 工具」「带缓存的构建系统」。  
但在真实工程中，这种描述往往过于抽象。

本文基于一个真实可运行的仓库 **monorepo-with-turbo**，说明：

- Turbo **具体介入了工程的哪一层**
- 它 **到底解决了什么问题**
- 以及，它 **刻意没有做什么**

---

## 一、先给结论：Turbo 只做了一件事

在 **monorepo-with-turbo** 中，Turbo 的职责可以用一句话概括：

> **把原本存在于工程设计中的“任务依赖关系”，显式建模成一个 Task DAG（有向无环图），并按照拓扑顺序进行调度与缓存。**

它**没有**：

- 管包如何复用（那是 workspace 的职责）
- 管构建工具（CRA / Webpack / Babel 仍然在工作）
- 管工程分层（domain / widget / app 是人为设计的）

---

## 二、monorepo-with-turbo 的工程结构（简化）

```text
apps/
  app-d
  app-e

packages/
  domain-user
  widgets/
    pv-chat

tooling/
  cra-config
```

设计原则是**单向依赖**：

```text
domain  →  widget  →  app
tooling ⟂ 业务 DAG
```

这是一个**天然无环**的结构。

---

## 三、Turbo 实际建模的不是“包 DAG”，而是“任务 DAG”

Turbo 的建模单位不是 package，而是：

> **package + task**

例如：

- `@repo/widget-pv-chat#build`
- `@repo/app-d#build`

每一个都是 DAG 中的一个**节点**。

---

## 四、build 任务的 DAG（概念图）

在 `turbo.json` 中：
这句话的语义是：

> 一个 package 的 build，必须在它**所有依赖 package 的 build 完成之后**执行。

在 **monorepo-with-turbo** 中，build 任务的 DAG 可以抽象为：

```text
@repo/domain-user#build
        │
        ▼
@repo/widget-pv-chat#build
        │
        ▼
@repo/app-d#build

@repo/app-e#build   （与 app-d 并行，无依赖）
```

关键特征：

- **单向**
- **无环**
- **app-d 与 app-e 可并行**

---

## 五、Turbo 的执行顺序：为什么“像后根序遍历”

在一次 `turbo run build --dry=json` 输出中，可以看到类似信息：

```json
{
  "taskId": "@repo/widget-pv-chat#build",
  "dependents": [
    "@repo/app-d#build"
  ]
}
```

这表示一条有向边：

```text
widget-pv-chat#build  ───▶  app-d#build
```

Turbo 的执行规则是：

> **一个 task 只能在它所有 dependencies 执行完成后才会执行**

在算法层面，这等价于：

- 对 DAG 做 **拓扑排序**
- 在单路径子图中，表现为 **后根序（post-order）执行**

也就是：

```text
domain → widget → app
```

这不是偶然，而是构建系统的**必然执行语义**。

---

## 六、Turbo 为什么要维护 dependents（反向边）

在 dry-run 的 JSON 中，还能看到：

```json
"dependencies": [],
"dependents": ["@repo/app-d#build"]
```

这说明 Turbo 同时维护：

- 我依赖谁（dependencies）
- 谁依赖我（dependents）

这对三个能力至关重要：

1. **精准 cache 命中**
2. **最小化重建范围**
3. **并行调度的安全性**

这也是 Turbo 能做到「工程级缓存」的前提。

---

## 七、Turbo 没有替代 CRA，也不试图“理解业务”

在整个 build 过程中，真正执行构建的仍然是：

```text
node ../../tooling/cra-config/scripts/build.js
```

也就是说：

- Webpack 仍然在打包
- Babel 仍然在转译
- CRA 的假设完全未被破坏

Turbo **只负责调度，不负责实现**。

---

## 八、为什么在这个工程里，Turbo“看起来没做什么”

这是一个常见误解，但在这个项目中恰恰是**好事**。

原因是：

> **工程在引入 Turbo 之前，就已经是 DAG 结构了。**

Turbo 只是把原本由“人脑 + 文档约定”维护的顺序关系：

```text
先 build domain
再 build widget
最后 build app
```

变成了**机器可验证、可缓存、可并行的事实**。

---

## 九、workspace 与 Turbo 的边界

- **workspace（yarn / pnpm）**
    - 解决 package 复用
    - 解决依赖解析
- **Turbo**
    - 不解决复用
    - 不解决依赖
    - 只解决：**任务调度与缓存**

两者并不冲突，而是分工明确。

---

## 十、小结

在 **monorepo-with-turbo** 中：

- Turbo 的角色是 **Task DAG 调度器**
- 它把 build / start 等任务建模成有向无环图
- 使用类似后根序的拓扑顺序保证依赖先于结果执行
- 并在此基础上提供并行与缓存能力

> **当工程结构本身是单向、清晰、无环的，Turbo 的存在会非常克制，但非常可靠。**

---



