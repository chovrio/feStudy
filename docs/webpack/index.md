---
title: webpack
sidebar_position: 6
---

东西不是很多，主要是复习面试(很杂，很散)

## 1. Webpack Loader

- Loader 就是将 webpack 不认识的内容转化为认识的内容
- loader 的执行顺序是从右往左，从下往上

## 2. Webpack Plugin

插件（Plugin）可以贯穿 Webpack 打包的生命周期，执行不同的任务

## 3. 区分环境

**可以使用 cross-env 在执行命令的时候注入环境变量，也可以手动添加**

**本地环境**

- 需要更快的构建速度
- 需要打印 debug 的信息
- 需要 live reload 或 hot reload 功能
- 需要 sourcemap 方便定位问题
- ...

**生产环境**

- 需要更小的包体积，代码压缩 + tree-shaking
- 需要进行代码分割
- 需要压缩图片体积
- ...

## 4. 为什么开发阶段要配置静态文件目录

因为 webpack 在进行打包的时候，对静态文件的处理，例如图片，都是直接 copy 到 dist 目录下面。但是对于本地开发来说，这个过程太费时，也没有必要，所以在设置 static(webpack-dev-server 版本小于 4 的时候是 contentBase)后，就直接到对应的静态目录下读取文件，而不需要对文件做任何移动，节省了时间和性能开销。

## 5. CSS 相关

- 使用 postcss-loader，自动添加 CSS3 部分属性的浏览器前缀
- 使用 mini-css-extract-plugin 分离 css 文件
