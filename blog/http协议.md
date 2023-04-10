# HTTP协议



## HTTP协议是什么？

***超文本传输协议\***（HTTP）是一个用于传输超媒体文档（例如 HTML）的[应用层](https://zh.wikipedia.org/wiki/应用层)协议。它是为 Web 浏览器与 Web 服务器之间的通信而设计的，但也可以用于其他目的。HTTP 遵循经典的[客户端—服务端模型](https://zh.wikipedia.org/wiki/主從式架構)，客户端打开一个连接以发出请求，然后等待直到收到服务器端响应。HTTP 是[无状态协议](http://zh.wikipedia.org/wiki/无状态协议)，这意味着服务器不会在两个请求之间保留任何数据（状态）。

## HTTP 的基本性质

### HTTP 是简单的

虽然下一代 HTTP/2 协议将 HTTP 消息封装到了帧（frame）中，HTTP 大体上还是被设计得简单易读。HTTP 报文能够被人读懂，还允许简单测试，降低了门槛，对新人很友好。

### HTTP 是可扩展的

在 HTTP/1.0 中出现的 [HTTP 标头（header）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers)让协议扩展变得非常容易。只要服务端和客户端就新标头达成语义一致，新功能就可以被轻松加入进来。

### HTTP 是无状态，有会话的

HTTP 是无状态的：在同一个连接中，两个执行成功的请求之间是没有关系的。这就带来了一个问题，用户没有办法在同一个网站中进行连续的交互，比如在一个电商网站里，用户把某个商品加入到购物车，切换一个页面后再次添加了商品，这两次添加商品的请求之间没有关联，浏览器无法知道用户最终选择了哪些商品。而使用 HTTP 的标头扩展，HTTP Cookie 就可以解决这个问题。把 Cookie 添加到标头中，创建一个会话让每次请求都能共享相同的上下文信息，达成相同的状态。

注意，HTTP 本质是无状态的，使用 Cookie 可以创建有状态的会话。

### HTTP 和连接

一个连接是由传输层来控制的，这从根本上不属于 HTTP 的范围。HTTP 并不需要其底层的传输层协议是面向连接的，只需要它是可靠的，或不丢失消息的（至少返回错误）。在互联网中，有两个最常用的传输层协议：TCP 是可靠的，而 UDP 不是。因此，HTTP 依赖于面向连接的 TCP 进行消息传递，但连接并不是必须的。

在客户端（通常指浏览器）与服务器能够交互（客户端发起请求，服务器返回响应）之前，必须在这两者间建立一个 TCP 链接，打开一个 TCP 连接需要多次往返交换消息（因此耗时）。HTTP/1.0 默认为每一对 HTTP 请求/响应都打开一个单独的 TCP 连接。当需要连续发起多个请求时，这种模式比多个请求共享同一个 TCP 链接更低效。

为了减轻这些缺陷，HTTP/1.1 引入了流水线（被证明难以实现）和持久连接的概念：底层的 TCP 连接可以通过 [`Connection`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Connection) 标头来被部分控制。HTTP/2 则发展得更远，通过在一个连接复用消息的方式来让这个连接始终保持为暖连接。

为了更好的适合 HTTP，设计一种更好传输协议的进程一直在进行。Google 就研发了一种以 UDP 为基础，能提供更可靠更高效的传输协议 [QUIC](https://en.wikipedia.org/wiki/QUIC)。

### 注意点：

- `HTTP`限制每次连接只处理一个请求，服务器处理完客户的请求，并收到客户的应答后，即断开连接

- `HTTP`是媒体独立的，只要客户端和服务器知道如何处理的数据内容，任何类型的数据都可以通过HTTP发送

- `HTTP`是无状态的，协议对于事务处理没有记忆能力。缺少状态意味着如果后续处理需要前面的信息，则它必须重传，这样可能导致每次连接传送的数据量增大。另一方面，在服务器不需要先前信息时它的应答就较快。

## HTTP报文

### 请求报文

- 请求行
  - 请求行由三部分组成：**请求方法**、**请求URL**（不包括域名 | 、**HTTP协议版本**
- 通用信息头
- 请求头
- 实体头
- 报文主体

### 响应报文

- 状态行
- 通用信息头
- 响应头
- 实体头
- 报文主体

## HTTP请求方式

- GET

　　传递参数长度受限制，因为传递的参数是直接表示在地址栏中，而特定浏览器和服务器对url的长度是有限制的。

　　所以，GET不适合用来传递私密数据，也不适合拿来传递大量数据。

　　但一般的HTTP请求大多都是GET。

- POST

　　POST把传递的数据封装在HTTP请求数据中，以名称/值的形式出现，可以传输大量数据，对数据量没有限制，也不会显示在URL中。表单的提交用的是POST。

- HEAD

　　HEAD跟GET相似，不过服务端接收到HEAD请求时只返回响应头，不发送响应内容。所以，如果只需要查看某个页面的状态时，用HEAD更高效，因为省去了传输页面内容的时间。

- DELETE

　　删除某一个资源。

- OPTIONS

　　用于获取当前URL所支持的方法。若请求成功，会在HTTP头中包含一个名为“Allow”的头，值是所支持的方法，如“GET, POST”。

- PUT

　　把一个资源存放在指定的位置上。

　　本质上来讲， PUT和POST极为相似，都是向服务器发送数据，但它们之间有一个重要区别，PUT通常指定了资源的存放位置，而POST则没有，POST的数据存放位置由服务器自己决定。

- TRACE

　　回显服务器收到的请求，主要用于测试或诊断。

- CONNECT

　　CONNECT方法是HTTP/1.1协议预留的，能够将连接改为管道方式的代理服务器。通常用于SSL加密服务器的链接与非加密的HTTP代理服务器的通信。

## 常用请求头信息

**请求头部由关键字/值对组成，每行一对**

### 典型的请求头有：

● User-Agent：产生请求的浏览器类型;

● Accept：客户端可识别的响应内容类型列表;星号 “ * ” 用于按范围将类型分组，用 “ */* ” 指示可接受全部类型，用“ type/* ”指示可接受 type 类型的所有子类型; 比如 Accept：text/xml（application/json）表示希望接受到的是xml（json）类型。

● Accept-Language：客户端可接受的自然语言;

● Accept-Encoding：客户端可接受的编码压缩格式;

● Accept-Charset：可接受的应答的字符集;

● Host：请求的主机名，允许多个域名同处一个IP 地址，即虚拟主机;

● connection：连接方式(close 或 keepalive);

● Cookie：存储于客户端扩展字段，向同一域名的服务端发送属于该域的cookie;

● Content-Type：发送端发送的实体数据的数据类型。 比如，Content-Type：text/html（application/json）表示发送的是html类型。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aa90ec2b2edf46cb8de233c0b944b118~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

### Content-Type：

| Content-Type                      | 解释                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| text/html                         | html格式                                                     |
| text/plain                        | 纯文本格式                                                   |
| text/css                          | CSS格式                                                      |
| text/javascript                   | js格式                                                       |
| image/gif                         | gif图片格式                                                  |
| image/jpeg                        | jpg图片格式                                                  |
| image/png                         | png图片格式                                                  |
| application/x-www-form-urlencoded | POST专用：普通的表单提交默认是通过这种方式。form表单数据被编码为key/value格式发送到服务器。 |
| application/json                  | POST专用：用来告诉服务端消息主体是序列化后的 JSON 字符串     |
| text/xml                          | POST专用：发送xml数据                                        |
| multipart/form-data               | POST专用：下面讲解                                           |

**multipart/form-data**用以支持向服务器发送二进制数据，以便可以在 POST 请求中实现文件上传等功能

请求体：

GET没有请求数据，POST有。

与请求数据相关的最常使用的请求头是 Content-Type 和 Content-Length 。

## 状态码及分类

#### 状态码：由3位数字组成，第一个数字定义了响应的类别

1xx：指示信息，表示请求已接收，继续处理

2xx：成功，表示请求已被成功接受，处理。

- 200 OK：客户端请求成功
- 204 No Content：无内容。服务器成功处理，但未返回内容。一般用在只是客户端向服务器发送信息，而服务器不用向客户端返回什么信息的情况。不会刷新页面。
- 206 Partial Content：服务器已经完成了部分GET请求（客户端进行了范围请求）。响应报文中包含Content-Range指定范围的实体内容

3xx：重定向

- 301 Moved Permanently：永久重定向，表示请求的资源已经永久的搬到了其他位置。
- 302 Found：临时重定向，表示请求的资源临时搬到了其他位置
- 303 See Other：临时重定向，应使用GET定向获取请求资源。303功能与302一样，区别只是303明确客户端应该使用GET访问
- 307 Temporary Redirect：临时重定向，和302有着相同含义。POST不会变成GET
- 304 Not Modified：表示客户端发送附带条件的请求（GET方法请求报文中的IF…）时，条件不满足。返回304时，不包含任何响应主体。虽然304被划分在3XX，但和重定向一毛钱关系都没有

**一个304的使用场景：** 缓存服务器向服务器请求某一个资源的时候，服务器返回的响应报文具有这样的字段：Last-Modified:Wed,7 Sep 2011 09:23:24，缓存器会保存这个资源的同时，保存它的最后修改时间。下次用户向缓存器请求这个资源的时候，缓存器需要确定这个资源是新的，那么它会向原始服务器发送一个HTTP请求（GET方法），并在请求头部中包含了一个字段：If-Modified-Since:Wed,7 Sep 2011 09:23:24，这个值就是上次服务器发送的响应报文中的最后修改时间。

假设这个资源没有被修改，那么服务器返回一个响应报文：

```http
    HTTP/1.1 304 Not Modified
    Date：Sat, 15 Oct 2011 15:39:29
    (空行)                                      
    (空响应体)
```



## 内容类型和网络文件类型

- `text/html` ： HTML格式
- `text/plain` ：纯文本格式
- `text/xml` ： XML格式
- `image/gif` ：gif图片格式
- `image/jpeg` ：jpg图片格式
- `image/png`：png图片格式

-  `application/xhtml+xml` ：XHTML格式

- `application/xml`： XML数据格式

- `application/atom+xml` ：Atom XML聚合格式

- `application/json`： JSON数据格式

- `application/pdf`：pdf格式

- `application/msword` ： Word文档格式

- `application/octet-stream` ： 二进制流数据（如常见的文件下载）

- `application/x-www-form-urlencoded` ： `<form encType=””>`中默认的encType，form表单数据被编码为key/value格式发送到服务器（表单默认的提交数据的格式）



https协议实际上和http协议