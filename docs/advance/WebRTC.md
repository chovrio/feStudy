---
title: WebRTC入门
---

## webrtc 技术浅析

### webrtc 与 websocket 的区别

- WebRTC 和 WebSocket 都是用于实现实时通信的技术，但它们在实现方式和应用场景上有所不同。
- WebRTC 是一种用于浏览器之间实时音视频通信的技术，它能够在浏览器之间直接建立点对点的连接，实现低延迟、高清晰度的音视频通话。WebRTC 基于 ICE （Interactive Connectivity Establishment）协议实现 NAT 穿透，支持 STUN 和 TURN 服务器，可以在不同的网络环境下实现连接。
- WebSocket 是一种用于浏览器与服务器之间实时双向通信的技术，它能够通过 HTTP 协议升级为 WebSocket 协议，建立长连接，实现双向通信。WebSocket 通常用于聊天室、实时消息推送等应用场景。
- WebRTC 更适合实现实时音视频通信，WebSocket 更适合实现实时消息推送和双向通信。

- websocket 需要保活（active），心跳（客户端发出，为了让服务器直到我还存活）+ 短线重连（客户端由于网络原因断开后，主动发起重连）
- websocket 不存在点对点约束，（房间）

### 一些 api

## webrtc 在协同编辑器开发中的应用

## webrtc 在音视频开发中的应用

## webrtc 封装源码讲解
