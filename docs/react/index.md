---
sidebar_position: 4
title: react 相关
---

## 1.为什么要用虚拟 DOM(virtual DOM)

- 大量的 dom 操作慢，很小的更新都有可能引起页面的重新排列，js 对象优于在内存中，处理起来更快，可以通过 diff 算法比较新老 virtual Dom 的差异，并且批量、异步、最小化的执行 dom 的变更，以提高性能
- 跨平台，比如浏览器环境，native 环境

**注意：虚拟 DOM 只是在更新的时候快，在应用初始化的时候不一定快**

## 2.jsx

- jsx 可以声明式的描述视图，提升开发效率，通过 babel 可以转换成 `jsx()` 的语法糖，也是 js 语法的扩展。

jsx 是 ClassComponent 的 render 函数或者 FunctionComponent 的返回值，可以用来表示组件的内容，在经过 babel 编译之后，最后会被编译成 `React.createElement(18以前)`、`jsx`，所以 18 以前我们使用 jsx 文件必须要需要引入`react`

## createElement 函数

- 处理 config，把除了保留属性外的其他 config 赋值给 props
- 把 children 处理后赋值给 props.children
- 处理 defaultProps
- 调用 ReactElement 返回一个 jsx 对象(virtual-dom)
