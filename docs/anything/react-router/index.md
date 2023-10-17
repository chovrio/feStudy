---
title: react-router 部分原理
---

## 前言

最近在做 [monitor](https://github.com/chovrio/monitor.git) 的 `lib` 包的路由监听的时候，出现了点问题，又发现了点有意思的内容，比如 react-router 的路由底层似乎都是改写的 history Api。而不是 HashRouter 改写的 hashChange，BrowserRouter 改写 history 事件。再比如为什么我们在 `react-router` 重写 `history Api` 前，重写了原生 Api 会导致 react 应用崩溃，而我们在 react-router 改写后，再改写添加我们需要的应用逻辑就没有问题。

[源码位置](https://github.com/chovrio/anything/tree/main/packages/react-router)

小 tip：看官方文档的时候发现 react-router 更新很大，推荐我们使用 createXXX Api 来创建路由，而不是之前的 Router 组件，找到篇文章，感兴趣的可以自行阅读
[4k 字介绍 React Router 6.4 超大变化：引入 Data API。你不纯粹了！](https://cloud.tencent.com/developer/article/2246023)

我还是用的组件

## 问题再现

下面是我们改写 history api 的函数，逻辑很简单，浏览器没有提供 `pushState`和`replaceState` 的事件，但是有这两个函数，我们通过 `AOP` 思想在不影响原函数的执行效果的情况下，派发对应事件，使得我们可以监听到这两个事件

```js
export const createHistoryEvent = (type) => {
  const origin = history[type];
  return function (this, ...args) {
    const res = origin.aplly(this, args);
    const e = new Event(type);
    window.dispatchEvent(e);
    return res;
  };
};
window['trackerHistory'] = () => {
  window.history['pushState'] = createHistoryEvent('pushState');
  window.history['replaceState'] = createHistoryEvent('replaceState');
  const list = ['pushState', 'replaceState', 'popstate'];
  list.forEach((event) => {
    window.addEventListener(event, (e) => {
      e.preventDefault();
      console.log('路由被改变了', e);
    });
  });
};
window['trackerHistory']();
```

在`index.html`中入口`script`上添加

```html
<script src="/changeRoute.ts"></script>
```

![error](./imgs/error.jpg)

我们把上述代码中的 `window['trackerHistory']()` 注释掉，再次刷新页面，然后打开控制台手动执行 `window['trackerHistory']()` 点击我们切换路由的逻辑，会发现页面会强制刷新一次，然后监听路由的逻辑也没了，但是通过报错我们可以明显看到 react-router 内部应该是改写过这些 API 的

## react-router 源码

首先是我们的代码。

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />}>
      <Route path="home" element={<div>home</div>} />
      <Route path="about" element={<div>about</div>} />
      <Route path="dashboard" element={<div>dashboard</div>} />
    </Route>
  </Routes>
</BrowserRouter>
```

无论是 `BrowserRouter` 或者 `HashRouter` 组件它们最后返回的都是 `Router` 组件，我们这里先看 `BrowserRouter` 的源码

```tsx
function BrowserRouter(
  basename, // 前置路由
  children, // 子组件
  future, // 启用可选的未来标志集
  window // 默认使用当前窗口的url，可以配置成别的窗口的url，比如iframe
) {
  let historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current == null) {
    // 创建一个 history 对象
    historyRef.current = createBrowserHistory({ window, v5Compat: true });
    // 长这样
    let history: History = {
      // 当前(最后一次操作)的行为 Action 是一个枚举类型
      get action() {
        return action;
      },
      get location() {
        // globalHistory就是window.history
        return getLocation(window, globalHistory);
      },
      listen(fn: Listener) {
        if (listener) {
          throw new Error('A history only accepts one active listener');
        }
        window.addEventListener(PopStateEventType, handlePop);
        listener = fn;

        return () => {
          window.removeEventListener(PopStateEventType, handlePop);
          listener = null;
        };
      },
      createHref(to) {
        return createHref(window, to);
      },
      createURL,
      encodeLocation(to) {
        // Encode a Location the same way window.location would
        let url = createURL(to);
        return {
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
        };
      },
      push,
      replace,
      go(n) {
        return globalHistory.go(n);
      },
    };
  }

  let history = historyRef.current;
  let [state, setStateImpl] = React.useState({
    action: history.action,
    location: history.location,
  });
  let { v7_startTransition } = future || {};
  let setState = React.useCallback(
    (newState: { action: NavigationType; location: Location }) => {
      v7_startTransition && startTransitionImpl
        ? startTransitionImpl(() => setStateImpl(newState))
        : setStateImpl(newState);
    },
    [setStateImpl, v7_startTransition]
  );

  React.useLayoutEffect(() => history.listen(setState), [history, setState]);

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
}
```
