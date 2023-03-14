# 用 nextjs 搭建个人博客前台

## 前言

二月前的小半个月我一直在搭建自己的个人博客的前台，技术栈选用的是`nextjs`(因为相较`vue`我更喜欢`react`，虽然学的都不咋地 😥)。因为是个人项目，我比较喜欢使用较新的东西，使用了`next13`还在`beta`阶段的`app`目录。但是做到后面我发现用`app`目录我很难确定自己用的到底是想以哪种渲染模式进行页面渲染，大部分页面都是`CSR(客户端渲染)`，好像我使用`nextjs`这件事情本身就是没有意义一般。于是我打算不采用`app`目录重构一下这个前台项目

## 目前效果图

样式是仿`hexo`一个主题 [hexo 博客](https://chovrio.club/hexo/)

[前台博客目前线上地址](https://blog.chovrio.club)

<img src="https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230214223700049.png" alt="image-20230214223700049"  />

<img src="https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230214230450198.png" alt="image-20230214230450198" style={{zoom:"50%"}} />

<img src="https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230214230613740.png" alt="image-20230214230613740" style={{zoom:"50%"}} />

<img src="https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230214230646663.png" alt="image-20230214230646663" style={{zoom:"50%"}} />

## 提醒

该博客项目不是纯粹通过`SSR`展示`md`文件的项目，是`SSR`和`CSR`混合的。文章的数据都是通过接口获取的。我目前的服务端项目在这儿[blog-server](https://github.com/chovrio/blog-server)，如果只是想跟着文章了解一下`SSR`的话，可以考虑直接使用。需要在根目录下新建一个`.env`文件设置一些配置

```properties
APP_PORT = 8000 # 服务运行端口
MONGO_HOST = 127.0.0.1 # mongodb数据库所在服务器 127.0.0.1 表示就在本机
MONGO_PORT = 27017 # mongodb端口号
MONGO_DB = blog # 数据库名称
JWT_SECRET = 秋 # JWT鉴权的令牌
SERVER_RUNNiNG = http://127.0.0.1:8000 # 项目运行地址 开发环境
SERVER_RUNNiNG_PROD = https://blog-server.chovrio.club # 项目运行地址生产环境 但是我还没配置打包工具没有做区分，得手动区分
```

但如果你也想搭一个类似的博客的话，我还是建议自己写服务端。或者就不采取这种方式。直接将`md`文件放在一个专门的目录然后通过`fs`模块去读取就是了(这样性能会好一些)。我写服务端的原因是因为想通过后台项目来管理文章和处理一些其他信息，比如数据埋点之类的。

该文不会涉及到`nextjs`的详细讲解。但是就算是没了解过`nextjs`的小白，只要跟着步骤走也是能搭建出来的(应该吧)。

## 项目搭建

### 创建项目

next 项目就直接使用脚手架搭建，我试过的脚手架有`create-next-app`和`vite`，这里我就直接用`create-next-app`了

```shell
pnpm create next-app
```

一路回车即可，先不尝试新鲜的东西。项目目录如下。

<img src="https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230214230934651.png" alt="image-20230214230934651" style={{zoom:"80%"}} />![image-20230214234238411](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230214234238411.png)

我们先删除`styles/Home.module.less`文件，清空`styles/globals.css`文件并修改`pages/index.tsx`下面的代码如下

```typescript
import { FC, ReactElement } from "react";

export interface IProps {
  children?: ReactElement;
}
const Home: FC<IProps> = (props) => {
  const { children } = props;
  return <div>hello next</div>;
};
export default Home;
Home.displayName = "Home";
```

运行`pnpm dev`访问`localhost:3000`可以看到页面中只有一个`hello next`.

### 首页`SEO`优化

个人认为`SSR`比传统`SPA`应用的优势主要体现于`SEO`和首屏渲染速率。

修改`pages/_document.tsx`文件的内容如下

```typescript
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      {/* 移动端适配 */}网站标题
      <title>{process.env.NEXT_PUBLIC_TITLE}</title>
      <Head>
        {/* 网页描述 */}
        <meta name="description" content="chovrio'blog" />
        {/* 网页关键词 */}
        <meta name="keywords" content="chovrio blog chovrio'blog next博客" />
        {/* 移动端适配 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* 网站的icon图标 */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

我们可以看到在`title`标签中我们使用了`process.env.NEXT_PUBLIC_TITLE`，这行代码会去读取我们根目录下的`.env*.(environment)`下面键为`NEXT_PUBLIC_TITLE`的值。所以我们得在项目根目录下面新建一个`.env`文件，并填入以下配置。当然上面`SEO`中的网站描述关键字以及下面的博客网站标题都可以自己随意写，不必按照我的来。

```properties
NEXT_PUBLIC_TITLE = chovrio'blog
```

### .env 文件(有基础可直接跳过)

简单讲述一下在`nextjs`中应该如何去使用`.env`配置文件。有四种`.env`、`.env.local`、`.env.production`、`.env.development`。

#### .env

所有环境下都可使用，优先级最低

#### .env.development、.env.production

优先级高于.env，低于.env.local，只能运行与特定的环境。

#### .env.local

优先级最高，所有环境下都可以使用

#### 书写.env 文件

```properties
NAME = chovrio # 只能在服务端使用
NEXT_PUBLIC_NAME = choviro # 服务端客户端都可以使用 必须以 NEXT_PUBLIC 开头

# 下面是会用到的一些配置 记得把 # 后面的内容都删掉
NEXT_PUBLIC_TITLE = chovrio'blog # 首页标题
NEXT_PUBLIC_DESCRIPTION = 一个基于nextjs的简易博客 # 博客描述
NEXT_PUBLIC_BASEURL_DEV = http://localhost:3000 # 开发模式下的接口地址，因为是服务端渲染所以没有浏览器跨域问题
NEXT_PUBLIC_BASEURL_PROD = https://blog-server.chovrio.club # 生产模式下的接口地址，白名单只有我自己的网站，所以生产模式下你们会报错的
NEXT_PUBLIC_NAME = chovrio # 谁的博客，往后的代码会根据这个name去获得文章
NEXT_PUBLIC_CONTENT = 认错人很不礼貌 # 个人描述
NEXT_PUBLIC_GITHUB = https://github.com/chovrio # github地址

# 因为刚开始写的时候想的有点多，这个前台博客就显得有些畸形了。
```

### 书写首页

#### 背景图片及描述

此时我们`pnpm dev`会发现页面的 title 已经变成`.env`文件中设置的了。接下来我们可以开始还原首页了

因为我这里是用的`scss`来编写`css`样式的所以我们先下载`scss`，也可以采用`less`或者`css`不必完全和我一致

```shell
pnpm add sass -D
```

因为`nextjs`脚手架底层做了配置，安装好后我们可以直接使用`sass`，不用再做其他配置

修改`pages/index.tsx`的代码如下

```typescript
import { FC, ReactElement } from "react";

export interface IProps {
  children?: ReactElement;
}
const Home: FC<IProps> = (props) => {
  const { children } = props;
  return (
    <div>
      <div className="home">
        <h2 className="description">{process.env.NEXT_PUBLIC_DESCRIPTION}</h2>
      </div>
    </div>
  );
};
export default Home;
Home.displayName = "Home";
```

再在`styles`目录下新增`Home.scss`文件，内容如下

```scss
.home {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center center;
  background-image: url(/xia.jpg);
  color: #fff;
  .description {
    position: absolute;
    width: 100%;
    text-align: center;
    top: 40vh;
  }
}
```

在`public`目录下添加自己想用的背景图片并在`Home.scss`中引用，我这里是`xia.png`因为我挺喜欢那个樱花效果的，而且这个图片和它很配

然后在`pages/_app.tsx`文件下引入样式，所有的样式文件都只能在`_app.tsx`里面引入，不能直接在`idnex.tsx`中引入

```typescript
import "@/styles/Home.scss";
```

此时的效果图如下，我们发现有边距。

![image-20230216150758051](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230216150758051.png)

修改`styles`目录下的`globals.css`为`globals.scss`，记得在`_app.tsx`中修改引入的名称。然后就没有内外边距了

```scss
// globals.scss
* {
  padding: 0;
  margin: 0;
}
```

#### 站点名称及跳动的箭头

##### 站点名称

我们在根目录新建`components`文件夹，新建`Title/index.tsx`组件，内容如下

```typescript
import { FC, ReactElement } from "react";

export interface IProps {
  children?: ReactElement;
}
const Title: FC<IProps> = (props) => {
  return (
    <div className="title">
      <div className="name">{process.env.NEXT_PUBLIC_TITLE}</div>
    </div>
  );
};
export default Title;
Title.displayName = "Title";
```

##### 跳动的箭头

在`components`目录下新建`Down/index.tsx`，内容如下

```typescript
import Image from "next/image";
import { FC, ReactElement } from "react";
export interface IProps {
  children?: ReactElement;
}
const Down: FC<IProps> = (props) => {
  return (
    <div className="down">
      <Image src={"/down.png"} alt={"向下"} width={30} height={30} />
    </div>
  );
};
export default Down;
Down.displayName = "Down";
```

组件写好了，我们在`pages/index.tsx`中引用

```typescript
import Down from "@/components/Down";
import Title from "@/components/Title";
import { FC, ReactElement } from "react";
export interface IProps {
  children?: ReactElement;
}
const Home: FC<IProps> = (props) => {
  const { children } = props;
  return (
    <div>
      <div className="home">
        <Title />
        <h2 className="description">{process.env.NEXT_PUBLIC_DESCRIPTION}</h2>
        <Down />
      </div>
    </div>
  );
};
export default Home;
Home.displayName = "Home";
```

并修改`Home.scss`如下

```scss
.home {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center center;
  background-image: url(/xia.jpg);
  color: #fff;
  .title {
    height: 55px;
    font-size: 26px;
    font-weight: 700;
    display: flex;
    line-height: 55px;
    .name {
      flex: 1;
      padding-left: 10px;
    }
  }
  .description {
    position: absolute;
    width: 100%;
    text-align: center;
    top: 40vh;
  }
  .down {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    animation: move 1.5s ease infinite alternate;
    display: flex;
    flex-direction: column;
  }
  @keyframes move {
    0% {
      bottom: 20px;
      opacity: 0.4;
    }
    50% {
      bottom: 36px;
      opacity: 1;
    }
    100% {
      bottom: 20px;
      opacity: 0.4;
    }
  }
}
```

此时效果图如下

![image-20230216152336495](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230216152336495.png)

### 封装 axios

下面的内容需要使用到网络请求，所以我们这里先简单的封装一下`axios`，在根目录新建一个`service`文件夹，因为封装不是重点，这里我就直接贴代码了(好像一直都是在贴代码 😴)

```typescript
import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";
class Request {
  instance: AxiosInstance;
  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
  }
  // 公共的请求的方法
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise((resolve, reject) => {
      // 开始发起网络请求
      this.instance
        .request<T>(config)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  get<T = any>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "get" });
  }
  post<T = any>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "post" });
  }
  delete<T = any>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "delete" });
  }
  put<T = any>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "put" });
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new Request({
  baseURL:
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_BASEURL_DEV
      : process.env.NEXT_PUBLIC_BASEURL_PROD,
  timeout: 10000,
});
```

### `nextjs`的几种渲染模式

在贴代码之前不得不先说`nextjs`的几种渲染模式，不然纯小白可能会看的云里雾里的。

#### 1.SSR(服务端渲染)

首先就是`ssr`渲染，这里我们需要在文件中同步导出`getServerSideProps`这个函数并在里面进行一些获取在页面中想要使用的数据的操作,然后将数据返回到 props 中，这样我们就可以在上面的页面组件的`props`中获得对应的数据，并且是在页面渲染前就获得。

```typescript
export const getServerSideProps: GetStaticProps = async (ctx) => {
  // ctx是上下文，里面有非常多我们用得上的属性，比如路由参数。
  // 假如我在这里发送一个网络请求 网页路由如下 http://localhost:3000?name=chovrio
  const res = await axios.get(`http://127.0.0.1:3000/api/userinfo')
  return {
    props: {
    	user:res
    },
  };
};

```

#### 2.SSG(静态页面生成)

这种渲染模式会在我们`pnpm build`的时候自动将页面创建好，相当于就是纯粹的静态页面了。生成页面可以在`.next/servcer/pages`下面找寻到。我们同样可以在`getStaticProps`这个函数里面进行一些操作将数据注入到页面中，但是数据只和打包时保持一致，就算后面这个接口数据改变了。生成的静态页面也不会发生变化

```typescript
export const getStaticProps: GetStaticProps = async (context: any) => {
  const res = await axios.get(`http://127.0.0.1:3000/api/userinfo')
  return {
    props: {
    	user:res
    },
  };
};
```

#### 3.ISG(静态增量再生)

这种渲染模式和 SSG 其实很像，唯一的不同点就是，这种渲染模式的页面我们可以设置更新数据的时间

```typescript
export const getStaticProps: GetStaticProps = async (context: any) => {
  const res = await axios.get(`http://127.0.0.1:3000/api/userinfo')
  return {
    props: {
    	user:res
    },
    revalidate: 60,// 单位s 这里表示 60s 更新一次页面数据
  };
};
```

#### 4.CSR(客户端渲染)

就是传统的客户端渲染，我们直接在文件里面写代码就是了，比如数据在页面加载的时候获取

```typescript
const Test: FC<IProps> = (props) => {
    useEffect(()=>{
        axios.get(......)
    })
  return (
    <div>test</div>
  );
};
```

### 文章列表

这里我们来写文章的列表，就是下面这个东西。

![image-20230216151213763](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230216151213763.png)

我们依旧在`components`下面新建组件`Articles/index.tsx`，然后因为我可能会在后台操作文章。所以我们这里使用`ISG`渲染模式，并且让它每半个小时更新一次数据。完整代码如下

#### types/articles.ts

新建文件及文件夹，定义文章的类型，这里是接口返回的文章类型

```typescript
export interface IArticle {
  _id: string;
  name: string;
  author: string;
  tags: string[];
  createTime: number;
  updateTime: number;
}
export interface IResult<T> {
  code: number;
  message: string;
  result: T;
}
```

#### service/article.ts

这里我们通过配置的`name`来获得文章列表

```typescript
import instance from ".";
import type { IArticle, IResult } from "@/types/article";

export const getAllArticle = async () => {
  const res = await instance.get<IResult<IArticle[]>>({
    url: `/essay/acquire-fe?name=${process.env.NEXT_PUBLIC_NAME}`,
  });
  return res.data;
};
```

#### pages/index.tsx

首页的主文件，使用了`getStaticProps`函数，在其中进行网络请求，并将返回的数据注入到了 props 中，然后再将数据注入到`Articles`组件

```typescript
// pages/index.tsx
import Articles from "@/components/Articles";
import Down from "@/components/Down";
import Title from "@/components/Title";
import { getAllArticle } from "@/service/article";
import { IArticle } from "@/types/article";
import { GetStaticProps } from "next";
import { FC, ReactElement } from "react";
export interface IProps {
  children?: ReactElement;
  articles: IArticle[];
}
const Home: FC<IProps> = (props) => {
  const { children, articles } = props;
  return (
    <div>
      <div className="home">
        <Title />
        <h2 className="description">{process.env.NEXT_PUBLIC_DESCRIPTION}</h2>
        <Down />
      </div>
      <div className="bottom">
        <Articles articles={articles} />
      </div>
    </div>
  );
};
export default Home;
Home.displayName = "Home";
export const getStaticProps: GetStaticProps = async (ctx) => {
  const allArticle = await getAllArticle();
  return {
    props: {
      articles: allArticle.result,
    },
    revalidate: 60 * 60 * 30,
  };
};
```

#### utils/getTime

将时间戳转化为字符

```typescript
export const getTime = (time: number, flag = false) => {
  const t = new Date(time);
  const Y = t.getFullYear();
  const M = t.getMonth() + 1;
  const D = t.getDate();
  const h = t.getHours() < 10 ? "0" + t.getHours() : t.getHours();
  const m = t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes();

  return flag ? `${Y}年${M}月${D}日 ${h}:${m}` : `${Y}年${M}月${D}日`;
};
```

#### components/Articles/index.tsx

通过注入的文章数组渲染页面，这里是`CSR`客户端渲染模式(我不知道这么说对不对，但是父组件采用 SSR，并不妨碍子组件采用 CSR 方法)。

```typescript
// components/Articles/index.tsx
import { IArticle } from "@/types/article";
import { getTime } from "@/utils/getTime";
import Link from "next/link";
import { FC, ReactElement, useEffect, useState } from "react";
export interface IProps {
  children?: ReactElement;
  articles: IArticle[];
}
const Articles: FC<IProps> = (props) => {
  const { articles } = props;
  const [showArti, setShowArti] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  useEffect(() => {
    const arr = articles.slice(0, 3);
    let t: any[] = [];
    for (let i = 0; i < Math.ceil(articles.length / 3); i++) {
      t.push(i);
    }
    setPages(t);
    setShowArti(arr);
  }, [articles]);
  const changePage = (page: number) => {
    const arr = articles.slice(page * 3, page * 3 + 3);
    setShowArti(arr);
  };
  return (
    <div className="lists">
      {showArti.length !== 0 &&
        showArti.map((item) => (
          <Link href={`/posts/${item._id}`} className="essay" key={item._id}>
            <div className="Img"></div>
            <div className="content">
              <h1 className="title">{item.name}</h1>
              <p>标签：{item.tags.join("，")}</p>
              <p>发表于：{getTime(item.createTime)}</p>
              <p>更新于：{getTime(item.updateTime)}</p>
            </div>
          </Link>
        ))}
      <div className="pages">
        {articles.length !== 0 &&
          pages.map((_, index) => (
            <span
              key={Math.random()}
              onClick={() => changePage(index)}
              className="page"
            >
              {index + 1}
            </span>
          ))}
      </div>
    </div>
  );
};
export default Articles;
Articles.displayName = "Articles";
```

#### styles/bottom.scss

底部布局

```scss
// styles/bottom.scss
.bottom {
  display: flex;
}
@media screen and (min-width: 1000px) and (max-width: 100vw) {
  .bottom {
    align-items: flex-start;
    justify-content: center;
  }
}
@media screen and (min-width: 550px) and (max-width: 1000px) {
  .bottom {
    flex-direction: column;
    align-items: center;
  }
}

@media screen and (max-width: 550px) {
  .bottom {
    flex-direction: column;
    align-items: center;
  }
}
```

#### styles/globals.scss

全局样式，这里修改了滚动条的样式

```scss
// styles/globals.scss
* {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue",
    Lato, Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
}
// 修改滚动条样式
html {
  overflow-x: hidden;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  overflow: auto;
}
::-webkit-scrollbar-thumb {
  background-color: #e6e6e6;
  min-height: 25px;
  min-width: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 99px;
}
::-webkit-scrollbar-track {
  background-color: #f7f7f7;
  border: 1px solid #efefef;
}

::-webkit-scrollbar-thumb {
  background-color: #49b1f5;
}
a {
  text-decoration: none;
  color: #000;
}
```

#### styles/lists.scss

文章列表的样式

```scss
// styles/lists.scss
.lists {
  margin: 30px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .essay {
    display: flex;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
      "Helvetica Neue", Lato, Roboto, "PingFang SC", "Microsoft YaHei",
      sans-serif;
    height: 250px;
    margin-top: 20px;
    overflow: hidden;
    box-shadow: 0 3px 8px 6px rgba(7, 17, 27, 0.05);
    border-radius: 20px;
    cursor: pointer;
  }
  .pages {
    .page {
      display: inline-block;
      text-align: center;
      line-height: 35px;
      width: 35px;
      height: 35px;
      margin: 10px;
      background: #00c4b6;
      border-radius: 8px;
      color: #fff;
    }
  }
}
@media screen and (min-width: 1000px) and (max-width: 100vw) {
  .lists {
    width: 800px;
    .essay {
      width: 800px;
      .Img {
        width: 50% !important;
        height: 100%;
        background: url(/xia.jpg);
        background-size: cover;
        background-position: center center;
      }
      .content {
        width: 50%;
        flex-direction: column;
        text-align: left;
        margin-top: 40px;
        margin-left: 20px;
        .title {
          font-size: 24px;
        }
        p {
          margin-top: 10px;
        }
      }
    }
  }
}

@media screen and (min-width: 500px) and (max-width: 1000px) {
  .lists {
    width: 75vw;
    .essay {
      width: 700px;

      .Img {
        width: 50% !important;
        height: 100%;
        background: url(/xia.jpg);
        background-size: cover;
        background-position: center center;
      }
      .content {
        width: 50%;
        display: flex;
        flex-direction: column;
        text-align: left;
        margin-top: 40px;
        margin-left: 20px;
        .title {
          font-size: 24px;
        }
        p {
          margin-top: 10px;
        }
      }
    }
  }
}
@media screen and (max-width: 500px) {
  .lists {
    width: 80vw;
    font-size: 14px;
    .essay {
      display: flex;
      flex-direction: column;
      width: 80vw;

      .Img {
        width: 100% !important;
        height: 50% !important;
        background: url(/xia.jpg);
        background-size: cover;
        background-position: center center;
      }
      .content {
        width: 100%;
        display: flex;
        flex-direction: column;
        text-align: left;
        padding-top: 10px;
        margin-left: 20px;
        .title {
          font-size: 24px;
        }
        p {
          margin-top: 10px;
        }
      }
    }
  }
}
```

最后记得在`pages/_app.tsx`里面引入`lists.scss`和`bottom.scss`

现在我们的页面长这样

![image-20230216165349345](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230216165349345.png)

### 个人信息小卡片以及樱花飘落

#### 樱花飘落

打开链接下载源码[sakura.js](https://blog.chovrio.club/sakura.js)放在`public`文件夹中，然后在`pages/_app.tsx`中引入即可

```typescript
// pages/_app.tsx
import "@/styles/globals.scss";
import "@/styles/Home.scss";
import "@/styles/lists.scss";
import "@/styles/bottom.scss";
import type { AppProps } from "next/app";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Script src="/sakura.js" />
      <Component {...pageProps} />
    </div>
  );
}
```

#### 个人信息小卡片

**注意这里的个人头像是我实现存储在我的服务端代码的**

创建`components/Profile/index.tsx`

```typescript
import Image from "next/image";
import { FC, ReactElement } from "react";
import styles from "@/styles/profile.module.scss";
export interface IProps {
  children?: ReactElement;
}
const Profile: FC<IProps> = (props) => {
  const { children } = props;
  const local =
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_BASEURL_DEV
      : process.env.NEXT_PUBLIC_BASEURL_PROD;
  return (
    <div className={styles.profile}>
      <Image
        src={`${local}/avactor/chovrio.jpg`}
        alt="avactor"
        width={150}
        height={150}
      />
      <h2 className={styles.name}>{process.env.NEXT_PUBLIC_NAME}</h2>
      <p className={styles.content}>{process.env.NEXT_PUBLIC_CONTENT}</p>
      <div className={styles.cates}>
        <div>
          <span>文章</span>
          <span>2</span>
        </div>
        <div>
          <span>标签</span>
          <span>4</span>
        </div>
      </div>
      <button className={styles.github}>
        <a href={process.env.NEXT_PUBLIC_GITHUB}>要看看菜狗吗?</a>
      </button>
    </div>
  );
};
export default Profile;
Profile.displayName = "Profile";
```

`styles/profile.module.scss`

```scss
.profile {
  height: 350px;
  display: flex;
  flex-direction: column;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 3px 8px 6px rgba(7, 17, 27, 0.05);
  border-radius: 20px;
  img {
    border-radius: 50%;
    margin: 10px auto 5px auto;
  }
  .name {
    font-size: 26px;
    font-weight: 700;
  }
  .content {
    font-size: 14px;
  }
  .cates {
    margin-top: 10px;
    display: flex;
    justify-content: space-evenly;
    div {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      &:hover {
        color: #4fb4f5;
      }
    }
  }
  button {
    width: 80%;
    height: 35px;
    margin: auto;
    background-color: #49b1f5;
    font-size: 14px;
    border: none;
    a {
      color: #fff;
    }
  }
}
@media screen and (min-width: 1000px) and (max-width: 100vw) {
  .profile {
    top: 0;
    width: 200px;
    margin-top: 40px;
  }
}
@media screen and (min-width: 550px) and (max-width: 1000px) {
  .profile {
    width: 80vw;
  }
}

@media screen and (max-width: 550px) {
  .profile {
    width: 80vw;
  }
}
```

修改`next.config.js`的一些配置

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允许<Image/> 标签展示哪些来源的图片
  images: {
    remotePatterns: [
      // http://localhost:8000/avactor/**
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/avactor/**",
      },
      {
        protocol: "https",
        hostname: "blog-server.chovrio.club",
        port: "",
        pathname: "/avactor/**",
      },
    ],
  },
};

module.exports = nextConfig;
```

目前效果

![image-20230216172325161](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230216172325161.png)

### 文档详细页面

我们现在点击文章列表的文章会发现没有这个页面

![image-20230216172637255](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230216172637255.png)

因为`nextjs`底层封装的很完整，pages 下面的目录就相当于动态路由的路径，所以我们这里新建文件`pages/posts/[id].tsx`，因为这里我们要使用第三方库`react-markdown`来渲染`md`文件。所以这个页面我们采用`CSR`

我们先安装依赖

```shell
pnpm add react-markdown remark-gfm rehype-raw react-syntax-highlighter
pnpm i --save-dev @types/react-syntax-highlighter -D
```

在我测试的时候，发现 react-markdown 无法正常渲染，并且`react-syntax-highlighter`代码高亮的包的导出方式好像也不兼容，所以被迫无奈，我们还是得使用`app`目录，

![image-20230216211416866](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230216211416866.png)

修改`next.config.js`的配置如下

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // 开启实验性的app目录
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/avactor/**",
      },
      {
        protocol: "https",
        hostname: "blog-server.chovrio.club",
        port: "",
        pathname: "/avactor/**",
      },
    ],
  },
  async rewrites() {
    return [
      //接口请求 前缀带上/api/
      {
        source: "/api/:path*",
        destination: `http://127.0.0.1:8000/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
```

这里可以看到，我们对跨域问题一并做了处理，因为文章详细页面是`CSR`会出现跨域问题。

修改`service/index`

```typescript
//service/index.ts
import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";
class Request {
  instance: AxiosInstance;
  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
  }
  // 公共的请求的方法
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise((resolve, reject) => {
      // 开始发起网络请求
      this.instance
        .request<T>(config)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  get<T = any>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "get" });
  }
  post<T = any>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "post" });
  }
  delete<T = any>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "delete" });
  }
  put<T = any>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "put" });
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
const instance = new Request({
  baseURL:
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_BASEURL_DEV
      : process.env.NEXT_PUBLIC_BASEURL_PROD,
  timeout: 10000,
});
const origin = new Request({
  baseURL:
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_BASEURL_DEV_ORIGIN
      : process.env.NEXT_PUBLIC_BASEURL_PROD,
  timeout: 10000,
});

export { instance, origin };
```

service/article.ts

```typescript
// service/article.ts
import { instance, origin } from ".";
import type { IArticle, IResult } from "@/types/article";

export const getAllArticle = async () => {
  const res = await instance.get<IResult<IArticle[]>>({
    url: `/essay/acquire-fe?name=${process.env.NEXT_PUBLIC_NAME}`,
  });
  return res.data;
};
export const getArticleContent = async (id: string) => {
  console.log(id);
  const res = await origin.get({
    url: `/essay/content-fe?name=${process.env.NEXT_PUBLIC_NAME}&id=${id}`,
  });
  return res.data;
};
```

app/posts/[id]/page.tsx

```typescript
"use client";
import Head from "next/head";
import { FC, ReactElement, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // 解析标签，支持html语法
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // 代码高亮
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getTime } from "@/utils/getTime";
import { usePathname } from "next/navigation";
import Profile from "@/components/Profile";
import { getArticleContent } from "@/service/article";
import "./index.scss";
import Script from "next/script";
const Article = () => {
  const [markdown, setMarkdown] = useState<string>("");
  const [info, setInfo] = useState<any>({});
  const [article, setArticle] = useState<string>("");
  const pathname = usePathname();
  useEffect(() => {
    let id = pathname?.split("/")[2] || "";
    setArticle(id);
  }, [pathname]);
  useEffect(() => {
    if (article !== "") {
      getArticleContent(article).then((data) => {
        setMarkdown(data.result.content);
        setInfo(data.result.info);
      });
    }
  }, [article]);
  return (
    <div className="article">
      <Script src="/sakura.js"></Script>
      <Head>
        <title>test</title>
        <meta name="keywords" content={`${info.name} ${info.author}`} />
        <meta
          name="description"
          content={`${markdown} ${process.env.NEXT_PUBLIC_NAME}的博客`}
        />
      </Head>
      <div className="title">
        <h2>{info.name}</h2>
        <div className="data">{getTime(info.updateTime)}</div>
        <div>阅读量:埋点未作</div>
      </div>
      <div className="test">
        <article className="content py-8 prose  prose-h1:mt-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    // eslint-disable-next-line react/no-children-prop
                    children={String(children).replace(/\n$/, "")}
                    style={tomorrow as any}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
        <Profile />
      </div>
    </div>
  );
};
export default Article;
Article.displayName = "Article";
```

app/posts/[id]/index.scss

因为是 app 目录下的新的页面所以滚轮样式得再写一遍

```scss
* {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue",
    Lato, Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
}
html {
  overflow-x: hidden;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  overflow: auto;
}
::-webkit-scrollbar-thumb {
  background-color: #e6e6e6;
  min-height: 25px;
  min-width: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 99px;
}
::-webkit-scrollbar-track {
  background-color: #f7f7f7;
  border: 1px solid #efefef;
}

::-webkit-scrollbar-thumb {
  background-color: #49b1f5;
}
a {
  text-decoration: none;
  color: #000;
}

.article {
  background-color: #ffffff;
  .title {
    width: 100%;
    height: 30vh;
    background-size: cover;
    background-position: center center;
    background-image: url(/xia.jpg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    div {
      padding-top: 10px;
    }
    color: #fff;
  }

  .content {
    width: 800px;
    position: relative;
    min-height: 100%;
    line-height: 2;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    box-sizing: border-box;
    margin: 40px 10px 0 100px;
    padding: 40px 60px;
    box-shadow: 0 3px 8px 6px rgba(7, 17, 27, 0.05);
    border-radius: 8px;
    background: #fff;
    -webkit-box-shadow: 0 3px 8px 6px rgba(7, 17, 27, 0.05);
    box-shadow: 0 3px 8px 6px rgba(7, 17, 27, 0.05);
    border-radius: 20px;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    -ms-transition: all 0.3s;
    transition: all 0.3s;
  }
  .test {
    width: 100%;
    display: flex;
    justify-content: center;
    &:last-child {
      position: absolute;
    }
  }
}
```

最后页面如下

![image-20230216213824273](https://aesthetic-stroopwafel-621be5.netlify.app/blog-fe/image-20230216213824273.png)

[项目源码](https://github.com/chovrio/blog-fe)

照着文章写，写出来`pnpm dev`是正常的，但是打包的时候会报错，我暂时没找到是什么问题，所以源码是我重新用`app`目录写的没有使用`pages`，本末倒置了(悲

改着改着又出现 bug 了，头像访问不到了。不过大致内容就这些了，下次修改估计得两周后了。要准备开学考试了(突然发现没改的时候是这个项目最完美的时候.......越改 bug 越多好烦)。
