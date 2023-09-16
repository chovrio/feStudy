---
title: WebRTC入门
---

## webrtc 技术浅析

### 什么是 WebRTC

`WebRTC`(Web Real-Time Communications)是一项`实时通讯技术`，它允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间`点对点(Peer-to-Peer)的连接`，实现视频流或音频流或者其他`任意数据`的传输，WebRTC 包含的这些标准使用户再无需安装任何插件或者第三方的软件的情况下，创建点对点(Peer-to-Peer)的数据分享和电话会议称为可能

### webrtc 与 websocket 的区别

- WebRTC 和 WebSocket 都是用于实现实时通信的技术，但它们在实现方式和应用场景上有所不同。
- WebRTC 是一种用于浏览器之间实时音视频通信的技术，它能够在浏览器之间直接建立点对点的连接，实现低延迟、高清晰度的音视频通话。WebRTC 基于 ICE （Interactive Connectivity Establishment）协议实现 NAT 穿透，支持 STUN 和 TURN 服务器，可以在不同的网络环境下实现连接。
- WebSocket 是一种用于浏览器与服务器之间实时双向通信的技术，它能够通过 HTTP 协议升级为 WebSocket 协议，建立长连接，实现双向通信。WebSocket 通常用于聊天室、实时消息推送等应用场景。
- WebRTC 更适合实现实时音视频通信，WebSocket 更适合实现实时消息推送和双向通信。

- websocket 需要保活（active），心跳（客户端发出，为了让服务器直到我还存活）+ 短线重连（客户端由于网络原因断开后，主动发起重连）
- websocket 不存在点对点约束，（房间）

### 媒体流

媒体流可以是来自本地设备，也可以是来自远程设备的。媒体流可以是实施的(监控)，也可以是非实时的(音频，视频)。WebRTC 我们绕不开媒体流。获得媒体流的方法有很多，比如摄像头，麦克风，屏幕共享等等，然后使用 WebRTC 的技术将媒体流传输到远端实现实时通讯

### 获得媒体流的一些操作

**注意 WebRTC 只能在 HTTPS 协议或者 localhost 下使用，如果是 HTTP 协议，会报错**

我们主要通过`navigator.mediaDevices.getUserMedia(constraints)`这个 api 来获取媒体流，这个方法接受一个配置对象作为参数，配置对象中包含了媒体流的类型，以及媒体流的分辨率等信息

```ts
/** 获取本地音视频流 */
async function getLocalStream(constraints: MediaStreamConstraints) {
  /** 获取媒体流 */
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
}
```

其中`constraints`制定了请求的媒体类型和相对应的参数，用于配置视频流和音频流的信息。

我可以通过`navigator.mediaDevices.getSupportedConstraints()`这个方法来获取`constraints`参数中具体支持哪些配置项。

![image-20230423125038502](E:\web\only\feStudy\docs\advance\img\webrtc\image-20230423125038502.png)

如果我们不设置`constraints`参数，那么默认获取的就是摄像头和麦克风的媒体流，如果我们只想要获取摄像头的媒体流，那么我们可以这样设置

```ts
navigator.mediaDevices.getUserMedia({
  audio: false,
  video: true,
})
```

如果我们想要获取视频的高度宽度，那么我们可以这样设置：

```ts
navigator.mediaDevices.getUserMedia({
  audio: false,
  video: {
    width: 1280,
    height: 720,
  },
})
```

诸如此类，video 中也可以设置设备 id 或者前后置摄像头...， 大家可以在支持的情况下根据自己的需求来设置即可。具体可以查看[MDN](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FMediaDevices%2FgetUserMedia)。这里我不做过多的介绍了，我们继续。

获取通过摄像头获取媒体流后，将媒体流赋值给 video 标签的 srcObject 属性，让其播放。

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebRTC初级</title>
  </head>
  <body>
    <video id="localVideo" src="" autoplay muted></video>
    <button id="btn1">普通拍照</button>
    <button id="btn2">滤镜拍照</button>
  </body>
  <script src="./index.ts" type="module"></script>
</html>

```



```ts
// main.ts
// 用于保存照片到本地，如果要保存到后端的话，直接把那串二进制文本穿给后端即可
import { saveAs } from "file-saver";

/** 获取本地音视频流 */
async function getLocalStream(constraints: MediaStreamConstraints) {
  /** 获取媒体流 */
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  // 将媒体流设置到video标签上播放
  playLocalStream(stream);
}
/** 播放本地视频流 */
function playLocalStream(stream: MediaStream) {
  const videoEl = document.getElementById("localVideo") as HTMLVideoElement;
  videoEl.srcObject = stream;
}
getLocalStream({
  audio: false,
  video: true,
});
console.log(navigator.mediaDevices.getSupportedConstraints());

// 拍照
const imageList: string[] = [];
function takePhoto() {
  const videoEl = document.getElementById("localVideo") as HTMLVideoElement;
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx!.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  imageList.push(canvas.toDataURL("image/png"));
  console.log("imageList", imageList);
  canvas.toBlob(function (blob: any) {
    saveAs(blob, "test.png");
  });
}
/** 滤镜版本 */
function takePhoto2() {
  const filterList = [
    "blur(5px)", // 模糊
    "brightness(0.5)", // 亮度
    "contrast(200%)", // 对比度
    "grayscale(100%)", // 灰度
    "hue-rotate(90deg)", // 色相旋转
    "invert(100%)", // 反色
    "opacity(90%)", // 透明度
    "saturate(200%)", // 饱和度
    "saturate(20%)", // 饱和度
    "sepia(100%)", // 褐色
    "drop-shadow(4px 4px 8px blue)", // 阴影
  ];
  for (let i = 0; i < filterList.length; i++) {
    const videoEl = document.getElementById("localVideo") as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx!.filter = filterList[i];
    ctx!.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    imageList.push(canvas.toDataURL("image/png"));
  }
  console.log("imageList", imageList);
}

const btn1 = document.getElementById("btn1") as HTMLButtonElement;
const btn2 = document.getElementById("btn2") as HTMLButtonElement;
btn1.addEventListener("click", takePhoto);
btn2.addEventListener("click", takePhoto2);
```



## webrtc 在音视频开发中的应用

- 会议
- 实时通话
- 实时视频
- 1v1视频
- 多对多视频

## webrtc 封装源码讲解
