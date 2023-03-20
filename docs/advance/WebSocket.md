---
title: WebSocket入门
---

## 一些基本概念

- WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议，它是 HTML5 中的一部分，由 W3C 标准化。
- WebSocket 提供了双向通信的能力，允许服务器主动发送消息给客户端。这使得 WebSocket 成为实时 Web 应用程序的理想选择。
- 在 WebSocket API 中，浏览器和服务器只需要完成一次握手，然后浏览器和服务器之间就可以创建持久连接，并进行双向数据传输。

## 与 http 的一些比较

WebSocket 和 HTTP 都是应用层协议，但是它们有很大的区别。HTTP 是一种无状态协议，每个请求都是独立的，服务器不会保留任何客户端的数据。而 WebSocket 是一种有状态协议，它在客户端和服务器之间建立了一个持久连接，使得服务器可以主动向客户端发送消息。此外，HTTP 是基于请求/响应模型的，客户端必须先发送请求，服务器才能响应。而 WebSocket 是全双工通信的，客户端和服务器可以同时发送和接收消息。

**连接差异**

传统 HTTP 连接

```shell
## 普通连接
http://localhost:80/test
## 安全连接
https://localhost:80/test
```

webSocket 连接

```shell
## 普通连接
ws://localhost:80/test
## 安全连接
wss://localhost:80/test
```
