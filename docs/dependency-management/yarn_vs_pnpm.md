# yarn workspace vs pnpm workspace —— 一个 node_modules 就能说明的问题

> 本文不是概念对比，而是工程事实对比。
> 不讨论“谁更先进”，只讨论：它们各自解决了什么问题。

---

## 一、先澄清一个常见误区

很多讨论会把问题问成：

> workspace 和 pnpm 有什么不同？

这个问题本身是**不准确的**。

- **workspace** 是一种 *monorepo 的包组织与依赖解析机制*
- **pnpm / yarn** 是 *包管理器的具体实现*

结论很简单：

> **yarn 和 pnpm 都支持 workspace**，
> 对 turborepo 来说，两者都是合法、可用的底座。

真正值得讨论的是：

> **yarn 和 pnpm 在“依赖物理结构”上的设计差异。**

---

## 二、一个极简但真实的 Demo

假设有如下依赖关系：

```
app
├── react
└── lib-a
    └── lodash
```

- app **没有**直接依赖 lodash
- 只有 lib-a 依赖了 lodash

这是一个非常常见、也非常危险的真实场景。

---

## 三、yarn：扁平化 + hoist 模型

### node_modules 结构（示意）

```
node_modules/
├── react/
├── lodash/        # 被 hoist 到顶层
├── lib-a/
│   └── index.js
```

### 结果

在 app 中：

```js
import _ from 'lodash'; // ✅ 不报错
```

尽管：

- app 没有声明 lodash
- 这是一个 **幽灵依赖（phantom dependency）**

### yarn 的工程哲学

> **我信任工程师会遵守依赖声明。**

优点：
- 兼容性极强（CRA / Webpack / 老项目）
- 几乎不会因为依赖结构阻塞开发

代价：
- 依赖边界主要靠“工程自觉”维护
- monorepo 规模变大后，隐性耦合风险上升

---

## 四、pnpm：非扁平 + 物理隔离模型

### node_modules 结构（示意）

```
node_modules/
├── react/
├── lib-a/
│   └── node_modules/
│       └── lodash/
└── .pnpm/
    ├── react@18.2.0/
    ├── lodash@4.17.21/
    └── lib-a@1.0.0/
```

### 结果

在 app 中：

```js
import _ from 'lodash'; // ❌ 直接报错
```

只能在 lib-a 内部：

```js
import _ from 'lodash'; // ✅ 合法
```

### pnpm 的工程哲学

> **我不信任人，我信任文件系统。**

优点：
- 依赖边界在物理层面被强制
- 非常适合大型 monorepo / 多团队协作

代价：
- 对部分旧工具或非标准脚本不够友好
- 团队需要理解其约束模型

---

## 五、多版本真实场景：lodash@4.1 vs lodash@4.2

上面的示例是假设只有一个 lodash 版本。现实工程中，更常见的是**同一依赖的多个版本同时存在**。

假设依赖关系如下：

```
app
├── lodash@4.1.0
└── lib-a
    └── lodash@4.2.0
```

- app 显式依赖 `lodash@4.1.0`
- lib-a 显式依赖 `lodash@4.2.0`
- 两个版本不完全一致

---

### yarn：优先 hoist，必要时拆分

在 yarn 中，策略是：**尽量 hoist + 尽量共享**，如果版本冲突，才在子依赖中保留额外版本。

典型的 node_modules 结构如下：

```
node_modules/
├── lodash/                # lodash@4.1.0（app 的版本）
├── lib-a/
│   └── node_modules/
│       └── lodash/        # lodash@4.2.0（lib-a 的版本）
```

结果是：

| 位置 | 实际使用的 lodash |
|---|---|
| app | 4.1.0 |
| lib-a | 4.2.0 |

需要注意的是：

- **错误版本在物理上是“可能可访问的”**
- 一旦 import 路径或代码组织不严谨，
  可能在运行期出现语义差异 bug

yarn 在这里的工程假设是：

> *工程师知道自己在用哪个版本，并且会小心维护依赖边界。*

---

### pnpm：版本隔离，物理确定性

pnpm 对多版本的处理逻辑更加直接：**每个 package 只能看到自己声明的依赖版本**。

典型的 node_modules 结构如下：

```
node_modules/
├── app/
│   └── node_modules/
│       └── lodash/        # lodash@4.1.0
├── lib-a/
│   └── node_modules/
│       └── lodash/        # lodash@4.2.0
└── .pnpm/
    ├── lodash@4.1.0/
    ├── lodash@4.2.0/
    ├── app@1.0.0/
    └── lib-a@1.0.0/
```

结果是：

| 位置 | 实际使用的 lodash |
|---|---|
| app | 4.1.0 |
| lib-a | 4.2.0 |
| 交叉访问 | ❌ 不可能 |

pnpm 的工程假设是：

> *版本冲突是事实，我负责把事实固定下来。*

---

### 这个差异的本质

两者的差异不在于：

- 是否支持多版本（都支持）

而在于：

- **错误版本是否在物理层面“可达”**

一句话总结：

> yarn 允许多个版本共存，
> 但 pnpm 能保证你永远只用对的那个版本。

---

## 六、核心差异对比（工程视角）

| 维度 | yarn | pnpm |
|----|----|----|
| node_modules | 扁平 + hoist | 非扁平 + symlink |
| 幽灵依赖 | 允许 | 物理禁止 |
| 依赖边界 | 约定 | 强制 |
| 生态兼容性 | 极强 | 较严格 |
| 适合场景 | 成熟旧项目、CRA | 大型 monorepo、强约束团队 |

---

## 七、它们与 turborepo 的关系

需要特别强调的是：

> **turborepo 并不负责包管理。**

它只做三件事：

1. 读取 workspace 提供的包关系
2. 构建任务 DAG
3. 提供缓存与调度

因此：

- yarn workspace ✅
- pnpm workspace ✅

差异并不在 turbo，而在**依赖边界是否被严格约束**。

---

## 八、一句话总结（面试安全版）

> **yarn 解决的是工程体验问题，
> pnpm 解决的是工程正确性问题。**

它们不是对立关系，而是不同历史阶段、不同工程取舍下的答案。

---

> 如果你能清楚解释 node_modules 长什么样，
> 那你其实已经理解了 80% 的 pnpm 与 yarn 之争。
