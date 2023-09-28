---
title: case-study
---

## 1.fs 模块的大小写敏感性问题

这是在逛 vite 的 issues 的时候发现的，本来想着或许可以解决下的，然后测试寄了。

具体问题在这个 [issue](https://github.com/vitejs/vite/issues/14374) 里面

描述一下问题，比如我有一个资源路径是 'xxx/Path/1.png' 经过 vite 的处理，我在文件里面导入的路径就算写成 '/xxx/path/1.png' 在 resolve 的插件的处理下也会被转换成 '/xxx/Path/1.png'(真实路径)，所以引入资源的时候不会报错。

当然这种情况仅限于 `win` 和 `macos` 系统，在大部分 `unix` 系统下是行不通的(maybe)，查了一下是因为 `unix` 系统对路径大小写敏感，而 `win` 和 `macos` 系统对路径大小写不敏感。举一个例子吧。

```js
import fs from 'fs';
// win or macos
// 我的文件真实路径
// win    'E:\\web\\vite-demo\\src\\path\\1.jpg'
// macos  '/xxx/path/1.png'
// unix   '/xxx/path/1.png'
// 然后输入下面的 path 时我统一将上面路径的 path 全部改写成 Path
fs.statSync(path);
// 这段代码在 win 和 macos 下都是可以正常运行的会返回文件的信息，但是在 unix 下就会报错
```

在 vite 遇到 import 之类的导入语句的时候，会走到 resolve 这个插件的逻辑里面，这个插件的主要作用就是处理路径，举一个例子，比如 `react` 这个库它是不会改变的，所以 vite 会对它进行预构建(用于复用，这样就不必每次都重新打包)，然后存放在`node_module/.vite/deps/` 里面，但是我们在文件里面导入的时候又是直接导入的 `react`，那怎么样才能找到真实的路径，或者说我们预想的路径呢。靠得就是 resolve 插件。

```js
// 就不截图了，这是开发阶段经过 vite 编译过后的代码
// 编译前
import React from 'react';
import ReactDOM from 'react-dom/client';
// 编译后
import __vite__cjsImport1_react from '/node_modules/.vite/deps/react.js?v=cd158394';
const React = __vite__cjsImport1_react.__esModule
  ? __vite__cjsImport1_react.default
  : __vite__cjsImport1_react;
import __vite__cjsImport2_reactDom_client from '/node_modules/.vite/deps/react-dom_client.js?v=fd88a28b';
const ReactDOM = __vite__cjsImport2_reactDom_client.__esModule
  ? __vite__cjsImport2_reactDom_client.default
  : __vite__cjsImport2_reactDom_client;
i;
```

具体流程感兴趣的可以自行阅读，这里就不展开了(太多了，我也说不清 😥)，和这个 `case-study` 相关的内容在 `tryCleanFsResolve` 这个函数里面，路径在 `packages/vite/src/node/plugins/resolve.ts` 里面的前几行代码就是

```js
// 这里的 file 是资源路径
const fileStat = tryStatSync(file);
// Try direct match first
if (fileStat?.isFile()) return getRealPath(file, options.preserveSymlinks);
```

这里的 `tryStatSync` 函数作用很简单，就是我们上面提到的 `fs.statSync`，判断路径下是否存在资源。根据我们上面的结论，在路径大小写写错的情况下，`win` 和 `macos` 能返回 `fs.Stats`，而 `unix` 系统下就会直接报错，下面的逻辑就是判断 `fileStat` 是不是一个文件，是的话就获取文件的真实路径。 `getRealPath` 函数也很简单。`win` 系统调用了 `fs.realpathSync` ，其余调用 `fs.realpathSync.native`。

`win` 系统下调用 `fs.realpathSync` 传入大小写不正确的路径会返回真实的(大小写正确的)路径，`macos` 系统下调用 `fs.realpathSync.native` 也会返回正确的路径(由 issue 推测，因为没有 mac 没测过)。但是如果是 `unix` 系统的话，执行 `fs.realpathSync.native` 传入一个错误(大小写不正确)的路径，则会直接报错。

不过在 `vite` 中压根走不到这一步，因为我们刚才说了 `unix` 系统下调用 `fs.statSync` 路径不正确也会直接报错。在 `vite` 的 `trySatSync` 函数里面对错误进行了捕获，但是没做处理。所以执行后的 `fileStae` 是 `undefined`，所以它压根不会走进下方的判断，虽然就算走进去了也获取不到真实的路径。

解决方案：递归(感觉不算特别好)

思路：从程序执行的路径向后面，对资源的导入路径(这里传入的都是绝对路径，因为 vite 会对路径进行处理都会转换成绝对路径，只是在这一步骤的时候是绝对路径，最后 resolve 处理完后的路径不是)进行拆分，并且将路径都转换成小写，如果存在且相等就将转换小写前的路径拼接进去，一旦有不相等的路径，就直接退出循环，因为路径不可能存在了。

```js
import fs from 'fs';
import path from 'path';
function findRealPath(inputPath) {
  const projectPath = process.cwd();
  const parts = inputPath.replace(projectPath, '').split(path.sep);
  parts.shift();
  let currentPath = projectPath;
  let flag = true;

  for (const part of parts) {
    const dirContents = fs.readdirSync(currentPath);
    const normalizedPart = part.toLowerCase(); // 将当前部分转换为小写
    const matchingDir = dirContents.find(
      (item) => item.toLowerCase() === normalizedPart
    );
    if (matchingDir) {
      currentPath = path.join(currentPath, matchingDir);
    } else {
      flag = false;
      break; // 未找到匹配的目录，结束循环
    }
  }
  return flag ? currentPath : undefined;
}
```

有了上面这个函数过后，我们只需要将之前那里改动一下，就可以达到在 `unix` 系统下也能正常运行的效果了。

```js
let fileStat = tryStatSync(file);
if (!isWindows && fileStat === void 0 && (file = findRealPath(file))) {
  fileStat = tryStatSync(file);
}
// Try direct match first
if (fileStat?.isFile()) return getRealPath(file, options.preserveSymlinks);
```

因为我本身没有 `unix` 系统，改动完代码过后是在 `win` 系统下跑的测试都通过了，对 `unix` 系统的测试是在 `stackblitz.com` 下完成的，我在原 issue 的 `stackblitz` 仓库里面 link 了我改动后的 `vite` 代码，页面正常展示了。但是我没在 `unix` 系统下跑过测试，后续的结果就是跑 `ci` 的时候测试寄了，吓得我赶紧关了 `pr` 😢。不过截止(9.16 23:16)现在关于这个 issue 都没有人对它进行分类，最开始看到这个 issue 的时候，没注意到具体的内容还评论了 `文件路径错了.`，最开始我觉得它不能算 `bug`，因为这本身就是用户自身的不合理行为，不应该由框架买单，但是 `vite` 自身又对它做了处理(获取真实路径)，但是又因为 `unix` 路径大小写敏感的特性，导致自身做的处理在 `unix` 无效，所以这算什么问题了，会不会是`特性`？

update(9.17 1:37):

凌晨睡床上突然想起，测试寄掉的原因是因为，`vite` 有后缀补全，没后缀的时候肯定找不到资源，但是 `file` 路径会被覆盖成空串，所以改动一下代码就行了(有点白痴了 😥)

```js
// 改动前
if (!isWindows && fileStat === void 0 && (file = findRealPath(file))) {
  fileStat = tryStatSync(file);
}
// 改动后
if (!isWindows && fileStat === void 0) {
  const newPath = findRealPath(file);
  if (newPath) file = newPath;
  fileStat = tryStatSync(file);
}
```

继续睡觉，测试应该没问题了。😴

9.18 很早之前发现过类似的问题(是否会区分大小写)，vite 貌似更尊重系统特性。 [issue](https://github.com/vitejs/vite/issues/964)

之前的 `issue` 不出意料的被关闭了。

## recoil 小记(很小很小)

首先下面是 recoil 官网上的一个小例子，这里为了方便展示就没有像日常开发那样分到多个文件下了。

```tsx
import { ChangeEventHandler } from 'react';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
const textState = atom({
  key: 'textState', // unique ID (with respect to other atoms/selectors)
  default: '', // default value (aka initial value)
});

function App() {
  return (
    <RecoilRoot>
      <CharacterCounter />
    </RecoilRoot>
  );
}

function CharacterCounter() {
  return (
    <div>
      <TextInput />
      <CharacterCount />
    </div>
  );
}

function TextInput() {
  const [text, setText] = useRecoilState(textState);

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setText(event.target.value);
  };

  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
      <br />
      Echo: {text}
    </div>
  );
}
const charCountState = selector({
  key: 'charCountState', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const text = get(textState);
    return text.length;
  },
});
function CharacterCount() {
  const count = useRecoilValue(charCountState);

  return <>Character Count: {count}</>;
}
export default App;
```

从外向内看，第一个运用到的是组件`RecoilRoot`，这是 `recoil` 封装的 `react` 组件，官网对它的描述是`提供了上下文，并且 atom 有值。此组件必须是所有使用 Recoil hook 的根组件。`我们先看看它做了什么事情吧。

`packages/recoil/core/Recoil_RecoilRoot.js `

在看 recoil 的根组件前，我们可以看看 recoil 的全局存储区(store)的定义

```ts
// 下面的组件会用到
const AppContext = React.createContext<StoreRef>({ current: defaultStore });
const useStoreRef = (): StoreRef => useContext(AppContext);

// 全局store 除了id以外，再未被RecoilRoot组件包裹的情况下，函数都为被改变，都会抛出异常
const defaultStore: Store = Object.freeze({
  // 存储区的唯一标识符 直接就生成了，底层就是id从0开始++
  storeID: getNextStoreID(),
  // 获取存储区当前状态的方法
  getState: notInAContext,
  // 替换存储区状态的方法
  replaceState: notInAContext,
  // 获取存储区依赖图方法
  getGraph: notInAContext,
  // 订阅存储区事务的方法
  subscribeToTransactions: notInAContext,
  // 添加事务源数据
  addTransactionMetadata: notInAContext,
});
function notInAContext() {
  throw err('This component must be used inside a <RecoilRoot> component.');
}
```

我们可以看到除了 `storeID` 之外，其他的方法都是抛出异常的，这也是为什么我们在使用 `recoil` 的时候必须要用 `RecoilRoot` 组件包裹的原因。但是这些方法如果一直抛出异常一定是会影响到我们 recoil 的调度的，那 recoil 是在什么地方对它们做处理的呢?

```ts
function RecoilRoot(props: Props): React.Node {
  const { override, ...propsExceptOverride } = props;
  const ancestorStoreRef = useStoreRef();
  if (override === false && ancestorStoreRef.current !== defaultStore) {
    return props.children;
  }
  return <RecoilRoot_INTERNAL {...propsExceptOverride} />;
}
```

这里其实只是简单的对传入的 props 做了下处理，这里就不介绍作用了，[官网](https://recoiljs.org/zh-hans/docs/api-reference/core/RecoilRoot)写的很清楚，我们直接看组件 `RecoilRoot_INTERNAL` 里面的逻辑。

```ts
function RecoilRoot_INTERNAL(
  initializeState_DEPRECATED,
  initializeState,
  store_INTERNAL: storeProp,
  children,
  skipCircularDependencyDetection_DANGEROUS
) {
  // 省略了一大堆定义函数的过程,就是之前被初始化成抛出异常的函数
  let storeStateRef: { current: StoreState }; // eslint-disable-line prefer-const
  const storeRef: { current: Store } = useRefInitOnce(
    () =>
      // 我们这里只考虑一个根组件的情况，所以这次初始化storeProp一定是undefined
      storeProp ?? {
        storeID: getNextStoreID(),
        // 在定义这个函数的时候 storeStateRef 还没被初始化
        getState: () => storeStateRef.current,
        replaceState,
        getGraph,
        subscribeToTransactions,
        addTransactionMetadata,
        skipCircularDependencyDetection_DANGEROUS,
      }
  );
  if (storeProp != null) {
    storeRef.current = storeProp;
  }
  // 初始化 storeStateRef
  storeStateRef = useRefInitOnce(() =>
    initializeState_DEPRECATED != null
      ? initialStoreState_DEPRECATED(
          storeRef.current,
          initializeState_DEPRECATED
        )
      : initializeState != null
      ? initialStoreState(initializeState)
      : // 前面都不用看，因为我们只注意初始化逻辑，所以上面的判断全是false undefined == null
        makeEmptyStoreState()
  );
  return (
    <AppContext.Provider value={storeRef}>
      <Batcher setNotifyBatcherOfChange={setNotifyBatcherOfChange} />
      <Suspense fallback={<RecoilSuspenseWarning />}>{children}</Suspense>
    </AppContext.Provider>
  );
}
```

这里省略了很多逻辑，这里面的`AppContext`其实就是 `react` 通过 `createContext` 创建的`context`,所以 `recoil` 只是帮我们封装了原生的 context 达到了共享数据的目的。但是 recoil 底层做的工作一定是不少的，不然我们也不能体会到原生 recoil 般丝滑的状态管理(指通过 hooks)

函数`useRefInitOnce`和原生的`useRef`作用一致，但是多了一种逻辑，就是如果传入的 initialValue 是函数的会，会执行函数将函数的返回值作为 initialValue

```ts
function makeEmptyStoreState(): StoreState {
  // const currentTree = makeEmptyTreeState();// 简化一下
  const version = getNextTreeStateVersion(); // 也是一个id自增函数
  const currentTree = {
    version,
    stateID: version,
    transactionMetadata: {},
    dirtyAtoms: new Set(),
    atomValues: persistentMap(),
    nonvalidatedAtoms: persistentMap(),
  };
  return {
    currentTree,
    nextTree: null,
    previousTree: null,
    commitDepth: 0,
    knownAtoms: new Set(),
    knownSelectors: new Set(),
    transactionSubscriptions: new Map(),
    nodeTransactionSubscriptions: new Map(),
    nodeToComponentSubscriptions: new Map(),
    queuedComponentCallbacks_DEPRECATED: [],
    suspendedComponentResolvers: new Set(),
    graphsByVersion: new Map<StateID, Graph>().set(
      currentTree.version,
      graph()
    ),
    retention: {
      referenceCounts: new Map(),
      nodesRetainedByZone: new Map(),
      retainablesToCheckForRelease: new Set(),
    },
    nodeCleanupFunctions: new Map(),
  };
}
```

对于这些属性都是什么意思我们暂时不用 care，因为我们只需要将调用`atom`、`useRecoilState`这两个 api 时做了什么，我们就能理解`recoil`的基本原理了。

后面还有段逻辑就是通过`useEffect`在每次`storeRef`改变的时候执行，涉及到`atoms`的处理，就在后面看到`atom`的时候再说了最后返回的组件如下

```tsx
<AppContext.Provider value={storeRef}>
  {/* Batcher是用来批量更新recoil状态，就像react的批量更新一样，每更新一次就会渲染一次页面，所以合并更新加快渲染效率 */}
  {/* setNotifyBatcherOfChange这个函数 x => notifyBatcherOfChange.current = x; notifyBatcherOfChange是个ref，用来通知批量更新这个函数会在notifyBatcherOfChange修改的时候重新定义 */}
  {/* 所以更新的逻辑大致是notifyBatcherOfChange改变，setNotifyBatcherOfChange函数改变，Batcher组件重新渲染，执行批量更新逻辑，注意：Batcher组件返回的是null，所以没有DOM渲染，只专注于状态更新 */}
  <Batcher setNotifyBatcherOfChange={setNotifyBatcherOfChange} />
  <Suspense fallback={<RecoilSuspenseWarning />}>{children}</Suspense>
</AppContext.Provider>
```

初始化的逻辑大致就是这些，接下来就是定义状态的方法`atom`。方法在`packages/recoil/recoil_values/Recoil_atom.js`

```ts
function atom<T>(options: AtomOptions<T>): RecoilState<T> {
  // 在dev环境下如果key不是string类型的话会抛出异常
  const { ...restOptions } = options;
  const optionsDefault:
    | RecoilValue<T>
    | Promise<T>
    | Loadable<T>
    | WrappedValue<T>
    | T = 'default' in options ? options.default : new Promise(() => {});
  // 如果我们传入的值已经是一个recoil状态的话，会通过selector派生这个状态
  // selector代表一个派生状态，派生状态是状态的转换。你可以将派生状态视为将状态传递给以某种方式修改给定状态的纯函数的输出：
  if (isRecoilValue(optionsDefault)) {
    return atomWithFallback<T>({
      ...restOptions,
      default: optionsDefault,
    });
  }
  // 普通值
  else {
    return baseAtom<T>({ ...restOptions, default: optionsDefault });
  }
}

function baseAtom<T>(options: BaseAtomOptions<T>): RecoilState<T> {
  const { key, persistence_UNSTABLE: persistence } = options;
  // 因为我们没有嵌套多个RecoilRoot，所以这里默认的就是RecoilRoot，这里是获得这个状态存储的位置(maybe，先质疑)
  const retainedBy = retainedByOptionWithDefault(options.retainedBy_UNSTABLE);
  // 省略很多函数定义,有删减,具体作用等用到了再看
  const node = registerNode(
    ({
      // 节点唯一标识
      key,
      // 节点的类型 'atom' | 'selector'
      nodeType: 'atom',
      // 获取当前节点的值,但是不会订阅更新
      peek: peekAtom,
      // 获取当前节点的值,并订阅更新
      get: getAtom,
      // 设置节点的值
      set: setAtom,
      // 初始化节点的值
      init: initAtom,
      // 使节点的值无效
      invalidate: invalidateAtom,
      // 个人理解:上层RecoilRoot因为recoil是可以有多个RecoilRoot的
      retainedBy,
    }: ReadWriteNodeOptions<T>),
  );
  // 虽说这里是node,但实际返回的是recoilValue
  return node;
}
function registerNode<T>(node: Node<T>): RecoilValue<T> {
  // 检查之前是否注册过这个键，存在的话会抛出异常
  if (RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED) {
    checkForDuplicateAtomKey(node.key);
  }
  // nodes是一个全局的Map，在全局Map上加上这个键值对
  nodes.set(node.key, node);
  //
  const recoilValue: RecoilValue<T> =
  // 没有set方法证明它是只读的,这两个实现上没有区别,只是用于区分类型而已
    node.set == null
      ? new RecoilValueClasses.RecoilValueReadOnly(node.key)
      : new RecoilValueClasses.RecoilState(node.key);
  // recoilValues也是一个贯穿recoil的Map,可以通过atom的key来找到对应的recoilValue
  recoilValues.set(node.key, recoilValue);
  return recoilValue;
}
```

最后就是 `useRecoilState` 这个 hook 了,

定义如下

```ts
function useRecoilState<T>(
  recoilState: RecoilState<T>
): [T, SetterOrUpdater<T>] {
  // 传入的不是一个recoilValue就抛出异常
  if (__DEV__) {
    validateRecoilValue(recoilState, 'useRecoilState');
  }
  // 下面这两个钩子我们是可以单独使用的,从命名上也很好理解,一个是获取状态(我只需要状态,不需要更新),一个是设置状态(我只需要更新状态,不需要获取)
  return [useRecoilValue(recoilState), useSetRecoilState(recoilState)];
}

// 首先是 useRecoilValue
function useRecoilValue<T>(recoilValue: RecoilValue<T>): T {
  if (__DEV__) {
    validateRecoilValue(recoilValue, 'useRecoilValue');
  }
  // 这里的storeRef是我们在RecoilRoot组件中定义的
  const storeRef = useStoreRef();
    // 接受一个RecoilValue实例,返回实例对应的目前在recoil中的状态(hasValue | loading(Promise,最后会throw出这个promise) | hasError | 不存在)和值
  const loadable = useRecoilValueLoadable(recoilValue);
  // 这个函数会处理不同状态的情况,只有hasValue会返回值,其余都会throw出异常
  return handleLoadable(loadable, recoilValue, storeRef);
}
// useSetRecoilState最终其实会调用下面这个函数
function setRecoilValue<T>(
  store: Store,
  recoilValue: AbstractRecoilValue<T>,
  valueOrUpdater: T | DefaultValue | (T => T | DefaultValue),
): void {
  queueOrPerformStateUpdate(store, {
    type: 'set',
    // RecoilValue实例
    recoilValue,
    // 更新后的值
    valueOrUpdater,
  });
}
function queueOrPerformStateUpdate(store: Store, action: Action<mixed>): void {
// 如果批量更新的栈不为空,就将action放入栈中,否则直接更新
  if (batchStack.length) {
    const actionsByStore = batchStack[batchStack.length - 1];
    let actions = actionsByStore.get(store);
    if (!actions) {
      actionsByStore.set(store, (actions = []));
    }
    actions.push(action);
  } else {
    applyActionsToStore(store, [action]);
  }
}
function applyActionsToStore(store: Store, actions: Array<Action<mixed>>) {
  // 全局store上的replaceState方法
  store.replaceState(state => {
    // 复制原有状态
    const newState = copyTreeState(state);
    // 遍历用户行为,对状态进行更新
    for (const action of actions) {
      applyAction(store, newState, action);
    }
    //
    invalidateDownstreams(store, newState);
    invalidateMemoizedSnapshot();
    return newState;
  });
}

// 这是root组件中的replaceState方法
const replaceState = (replacer: TreeState => TreeState) => {
    // 检查当前状态树是否已经过期，如果已经过期，则会启动下一个状态树更新。
    startNextTreeIfNeeded(storeRef.current);
    // 获取当前存储区（store）的下一个状态树（tree）
    const nextTree = nullthrows(storeStateRef.current.nextTree);
    let replaced;
    try {
      stateReplacerIsBeingExecuted = true;
      replaced = replacer(nextTree);
    } finally {
      stateReplacerIsBeingExecuted = false;
    }
    if (replaced === nextTree) {
      return;
    }
    // 将replacer返回的状态树赋值给storeStateRef.current.nextTree
    storeStateRef.current.nextTree = replaced;
    if (reactMode().early) {
      // 如果是reactMode().early模式,react早期模式，就会立即更新组件
      notifyComponents(storeRef.current, storeStateRef.current, replaced);
    }
    // 用于通知批处理器（batcher）状态已经发生变化，然后批处理器会在下一个事件循环中执行批处理更新。
    // 批处理器就是之前说的Batcher组件
    nullthrows(notifyBatcherOfChange.current)();
  };
```

其实只梳理了一下流程，recoil 中的数据结构啥的都没细看

暂时看到这儿吧，国庆开摆!
