

# CRA + Monorepo + Workspace：一次真实的踩坑记录

这篇文章不是一份教程，而是一份**真实工程记录**。

我并不是一开始就打算使用 CRA + Monorepo + Yarn Workspace 这一组合，
而是在解决“业务模块复用”问题的过程中，被一步步推到这个结构上的。

如果你也遇到过：

- 多个前端项目需要共享业务模块
- npm 包看起来合理，但用起来别扭
- monorepo 搭完了，却总有奇怪的问题

那这篇踩坑记录，可能能帮你少走一些弯路。

---

## 一、起点：为什么我要做 Monorepo

最初的动机其实很朴素：

> **两个前端项目，需要引用同一块业务模块。**

这块模块：

- 不只是工具函数
- 不只是 UI
- 而是一个带业务语义的小模块

最开始，我尝试过把它做成 npm 包，但很快发现：

- 版本管理很别扭
- 业务规则被版本切割
- 本地调试成本高

于是，我转向了 monorepo。

---

## 二、第一步：Yarn Workspace 很顺利（也是个陷阱）

我最早的结构是：

```txt
repo/
├── apps/
│   ├── app-d/
│   └── app-e/
├── packages/
│   └── domain-user/
└── package.json
```

在根 `package.json` 中配置：

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

此时：

- `@repo/domain-user` 可以被正常安装
- 本地链接生效

这一步非常顺利，也让我产生了一个错觉：

> “Workspace 已经搞定了，后面应该都差不多。”

事实证明，这是第一个误判。

---

## 三、第二个坑：为什么 Widget 装不上？

当我引入 widgets 目录后：

```txt
packages/
├── domain-user/
└── widgets/
    └── pv-chat/
```

在 app 中依赖：

```json
"@repo/widget-pv-chat": "*"
```

却得到了一个非常迷惑的错误：

```txt
Couldn't find package "@repo/widget-pv-chat@*" on the "npm" registry
```

乍一看，像是 npm 出问题了。

但真正的原因是：

> **Yarn 根本没有把 `packages/widgets/*` 当成 workspace。**

解决方式很简单，但非常容易忽略：

```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "packages/widgets/*"
  ]
}
```

这个坑让我真正理解了一点：

> **Workspace 是“显式声明”的，不是自动发现的。**

---

## 四、真正的大坑：CRA 默认不编译 Workspace 源码

在成功安装 widget 之后，我很快又遇到了新的问题。

启动 app 时，直接报错：

```txt
Module parse failed: Unexpected token <
You may need an additional loader to handle the result of these loaders
```

报错文件指向：

```txt
packages/widgets/pv-chat/src/PvChat.jsx
```

---

### 问题本质

CRA 的一个默认假设是：

> **只编译当前 app 的 `src/` 目录。**

而 workspace 中的 widget 源码：

```txt
packages/widgets/pv-chat/src/
```

对 CRA 来说，是“外部依赖”。

结果就是：

- JSX 没有被 Babel 转译
- Webpack 按普通 JS 解析
- 直接在 `<section>` 处失败

---

## 五、解决方案：让 CRA 显式编译 Workspace 源码

由于我使用了自定义的 CRA config（未 eject），
最终的解决方案是：

> **把 workspace 源码路径加入 Babel loader 的 include。**

核心思路只有一句话：

> **如果 workspace 输出的是源码，构建工具就必须知道要编译它。**

具体实现细节并不复杂，但这个认知非常重要。

---

## 六、为什么我没有选择“预编译 Widget”

一种常见的绕路方案是：

- 在 widget 中 build 出 dist
- app 只引用编译产物

我没有选择这条路，原因很简单：

- 增加维护成本
- 调试体验变差
- 会把 monorepo 再次变成“伪 npm”

既然选择了 monorepo，我更倾向于：

> **共享源码，而不是共享构建结果。**

---

## 七、踩完这些坑之后，我对这套结构的判断

到这里为止，我已经打通了：

- CRA
- Yarn Workspace
- Domain 模块
- Widget 模块
- 多 app 共享

我对这套结构的评价是：

- ❌ 不轻量
- ❌ 不适合小项目
- ✅ 非常适合业务复杂、生命周期长的系统

---

## 八、总结

这次踩坑经历让我真正意识到：

> **工程复杂度不是被“消灭”的，而是被“安置”的。**

CRA + Monorepo + Workspace 并不是银弹，
但在明确边界、清楚约束的前提下，
它可以成为一套稳定、可控的工程结构。

这篇文章记录的不是最佳实践，
而是我在真实项目中，
**一步一步把系统拉回可理解状态的过程。**
