---
sidebar_position: 3
title: js 内容
---

## 1.generator

generator 的底层实现

```js
// async + await 基于generator的  语法糖

// 我们知道核心靠的就是switch case 来实现的
const { wrap } = require("node:module");
let regeneratorRuntime = {
  mark(genFn) {
    return genFn;
  },
  wrap(iteratorFn) {
    const context = {
      next: 0,
      done: false, // 表示迭代器没有完成
      stop() {
        this.done = true;
      },
    };
    let it = {};
    it.next = function (v) {
      // 用户调用的next方法
      context.sent = v;
      let value = iteratorFn(context);
      return {
        value,
        done: context.done, // 是否完成
      };
    };
    return it;
  },
};
("use strict");

// 这是babel转义前的read函数
// function* read() {
//   // 生成器 他执行的结果叫迭代器
//   console.log(1);
//   yield 1;
//   console.log(2);
//   yield 2;
//   console.log(3);
//   yield 3;
// }
// 这是Babel转义的结果
var _marked = /*#__PURE__*/ regeneratorRuntime.mark(read);
function read() {
  var a, b, c;
  return regeneratorRuntime.wrap(function read$(_context) {
    switch ((_context.prev = _context.next)) {
      case 0:
        _context.next = 2;
        return 1;

      case 2:
        a = _context.sent;
        console.log("a", a);
        _context.next = 6;
        return 2;

      case 6:
        b = _context.sent;
        console.log("b", b);
        _context.next = 10;
        return 3;

      case 10:
        c = _context.sent;
        console.log("c", c);

      case 12:
      case "end":
        return _context.stop();
    }
  }, _marked);
}

let it = read(); // 默认没有执行
let { value, done } = it.next("abc"); // 第一次传递参数是没有意义的
// 给next方法传递参数时 他的传参会给上一yield的返回值
{
  let { value, done } = it.next("abc");
  console.log(value, done);
}
{
  let { value, done } = it.next("ddd");
  console.log(value, done);
}
{
  let { value, done } = it.next("eee");
  console.log(value, done);
}
```

## 2.symbol 类型详解，及其应用场景

### 基本概念及使用

`Symbol`是`ES6`中新增的一种数据类型，表示一个独一无二的值

```js
const symbol = Symbol("chovrio"); // 参数只能是 string 和 number
console.log(symbol.description); // chovrio
```

`Symbol`的作用：避免第三方框架的同名属性被覆盖

如何区分`Symbol`？

- 通过 Symbol 生成独一无二的值时可以设置一个标记
- 这个标记仅仅用于区分没有其它任何含义
- 通过 description 方法可以获取传入的参数

在对象中使用

```js
const symbol = Symbol("chovrio");
const name = Symbol("name");
const age = Symbol("age");
const obj = {
  [name]: symbol.description,
  [age]: 19,
};
obj.name = "Autumn";
console.log(obj); // { name: 'Autumn', [Symbol(name)]: 'chovrio', [Symbol(age)]: 19 }
console.log(obj.name); // Autumn
```

### symbol 的注意点

1. Symbol 是基本数据类型，创建 symbol 变量不用加 new
2. 创建变量时候传入的字符串或者数字，只是一个标识没有任何意义，并且无法做更改

```js
const symbol = Symbol("chovrio");
symbol.description = "test";
console.log(symbol); // Symbol(chovrio)
console.log(symbol.description); // chovrio
```

3. 能转换成 String 和 Boolean 类型

```js
console.log(String(symbol)); // Symbol(chovrio)
console.log(Boolean(symbol)); // true
console.log(Number(symbol)); // 报错
```

4. 不能做任何运算

```js
const name = Symbol("chovrio");
console.log(name + 1); // 报错
console.log(name + "1"); // 报错
```

5. symbol 生成的值用作属性或方法名的时候一定要保存下来，否则后续无法使用

- 使用还是用`[]`包裹起来就行

```js
console.log(obj[name]);
```

6. for in 遍历对象是无法遍历出 symbol 为名的属性和方法的。可以通过 Object.getOwnPropertySymbols()单独取出

```js
const obj = {
  [name]: symbol.description,
  [age]: 19,
};
console.log(Object.getOwnPropertySymbols(obj)); // [ Symbol(name), Symbol(age) ]
```

### symbol 的应用

1. 在企业开发中如果需要对一些第三方的插件、框架及进行自定义的时候，可能会因为添加了同名的属性或者方法，将框架中原有的属性或者方法覆盖掉了，为了避免这种情况的发生，`框架的作者或者我们`就可以使用 Symbol 作为属性或者方法的名称

2. 消除魔术字符串

魔术字符串：在代码之中多次出现、与代码形成强耦合的一个具体的字符串或者数值。风格良好的代码，应该尽量消除魔术字符串，改由含义清晰的变量代替。

```js
const sex = {
  //这样就说明man就是一个独一无二的值，不用再man:'man' 或者sex.man === 'man'
  man: Symbol(),
  woman: Symbol(),
};
function isMan(gender) {
  switch (gender) {
    case sex.man:
      console.log("男性");
      break;
    case sex.woman:
      console.log("女性");
      break;
  }
}
isMan(sex.man); //男性
```

3. 为对象定义一些非私有的、但又希望只用于内部的方法。

**前置知识 对象遍历的方法**：

- for (const key in obj) 遍历对象、数组都可以，也是遍历对象较常用的方法
- for (const key of obj) 只能遍历有迭代器的对象，数组(默认有)
- Object.keys(obj) 返回对象身上 key(键) 的数组
- Object.values(obj) 返回对象上 value(值) 的数组
- Object.getOwnPropertyNames() 返回对象上 key(键) 的

注：上述所有的方法其实都便利不到 Symbol 类型的数据

- Object.getOwnPropertySymbol() 返回对象中只包含 symbol 类型的 key 的数组
- Reflect.ownKeys() 返回包含对象中所有类型的 key(键) 的数组(包含 Symbol 类型的数据)

4. Symbol 自带的方法

- Symbol.for()

因为 Symbol 类型的值都是独一无二的，但有时，我们希望重新使用同一个 Symbol 值，`Symbol.for`方法可以做到，它接收一个字符串作为参数，然后搜索有没有以该参数作为名称的 symbol 值，如果有，就返回这个 Symbol 值，否则就新建一个以该字符串为名称的 Symbol 值，并将其注册到全局

```js
const name1 = Symbol.for("chovrio");
const name2 = Symbol.for("chovrio");
console.log(name1 === name2); // true
```

- Symbol.keyFor()

由于`Symbol("xxx")`写法没有登记机制，所以每次调用都会返回一个不同的值。

`Symbol.keyFor`方法返回一个已经登记的 Symbol 类型值`key`

```js
const name1 = Symbol.for("chovrio");
console.log(Symbol.keyFor(name1)); // chovrio
const name2 = Symbol("Autumn");
console.log(Symbol.keyFor(name2)); // undefined
```

## 3. ==、===和 Object.is()的区别

- ==：等于，两边值类型不同的时候，先进行类型转换，再比较
- ===：严格等于，只有当类型和值都相等时，才相等
- Object.is()：与===的作用基本一样，但有些许不同

**==和===的区别**

==和===最大的区别就是前者不限定类型而后者限定类型，如下例，如果想要实现严格相等（===），两者的类型必须相同

```js
1 == "1"; // true
1 === "1"; // false
0 == false; // true
0 === false; // false
```

对于严格相等，有以下规则，如果 x === y，那么

**注：NaN 是数字类型**

- 如果 x 的类型和 y 的类型不一样，返回 false
- 如果 x 的类型是数字，那么
  - 如果 x 是 NaN，返回 false
  - 如果 y 是 NaN，返回 false
  - 如果 x 和 y 是同一个数字，返回 true
  - 如果 x 是+0，y 是-0，返回 true
  - 如果 x 是-0，y 是+0，返回 true
  - 其余返回 false
- 如果 x 和 y 的类型都为 undefined 或者 null，返回 true
  - 注：undefined == null 是为 true
- 如果 x 和 y 的都是字符串类型，那么如果 x 和 y 是完全相同的字符编码序列，返回 true，否则返回 false
- 如果 x 和 y 都是布尔类型，那么如果 x 和 y 同为 true 或者 false，返回 true，否则返回 false
- 如果 x 和 y 是同一个对象值，返回 true，否则返回 false

**===和 Object.is()的区别**

Object.is 的行为与===基本一致，但是有两处不同：

- +0 不等于 -0
- NaN 等于 NaN

```js
+0 === -0; // true
Object.is(+0, -0); // false

NaN === NaN; // false
Object.is(NaN, NaN); // true
```

## 4. 箭头函数与普通函数的区别

1. 箭头函数比普通函数更加简洁

- 如果没有参数就直接写一个空括号即可
- 如果只有一个参数，可以省去参数的括号
- 如果有多个参数，用逗号分割
- 如果函数体的返回值只有一句，可以省略大括号

```js
var test = () => {};
var test = (x) => x;
// 直接返回对象的话要加小括号
var test = (x) => ({ name: x });
```

2. 箭头函数没有自己的 this

- 箭头函数不会创建自己的 this
- 它会继承自己作用域的上一层的 this

```js
var id = "GLOBAL";
var obj = {
  id: "obj",
  fn() {
    console.log(this.id);
  },
  _fn: () => {
    console.log(this.id);
  },
  __fn() {
    console.log(this.id);
  },
};
// 浏览器环境
obj.fn(); // obj
obj._fn(); // GLOBAL
obj.__fn(); // obj
// node环境
obj.fn(); // obj
obj._fn(); // undefined
obj.__fn(); // obj
```

3. 箭头函数继承来的 this 指向永远不会改变

```js
var id = "GLOBAL";
var obj = {
  id: "OBJ",
  a: function () {
    console.log(this.id);
  },
  b: () => {
    console.log(this.id);
  },
};
obj.a(); // 'OBJ'
obj.b(); // 'GLOBAL'
new obj.a(); // undefined
new obj.b(); // Uncaught TypeError: obj.b is not a constructor
```

4. call()、apply()、bind()等方法不能改变箭头函数中 this 的指向

```js
var id = "Global";
let fun1 = () => {
  console.log(this.id);
};
fun1(); // 'Global'
fun1.call({ id: "Obj" }); // 'Global'
fun1.apply({ id: "Obj" }); // 'Global'
fun1.bind({ id: "Obj" })(); // 'Global'
```

5. 箭头函数不能作为构造函数使用

由于箭头函数时没有自己的 this，且 this 指向外层的执行环境，且不能改变指向，所以不能当做构造函数使用。

6. 箭头函数没有自己的 arguments

箭头函数没有自己的 arguments 对象。在箭头函数中访问 arguments 实际上获得的是它外层函数的 arguments 值。

7. 箭头函数没有 prototype

8. 箭头函数的 this 指向哪⾥？

箭头函数不同于传统 JavaScript 中的函数，箭头函数并没有属于⾃⼰的 this，它所谓的 this 是捕获其所在上下⽂的 this 值，作为⾃⼰的 this 值，并且由于没有属于⾃⼰的 this，所以是不会被 new 调⽤的，这个所谓的 this 也不会被改变。

## 5. 闭包

**闭包的概念**

函数嵌套函数，内部函数可以引用外部函数的参数和变量。参数和变量不会被垃圾回收机制回收。

```js
function fn(a) {
  let i = 0;
  return function () {
    i++;
    // 访问a 和 i
    console.log(a, i);
  };
}

let newFn = fn("newFn");
newFn(); // newFn 1
newFn(); // newFn 2
newFn(); // newFn 3
```

**补充内容：垃圾回收机制**

1. 标记清除

- js 会对变量做一个标记 yes or no 的标签以供 js 引擎来处理，但变量在某个环境下被使用则标记为 yes，但超出改环境（可以理解为超出作用域）则标记为 no，然后队友 no 的标签进行释放

2. 引用计数

- 对于 js 中引用类型的变量，采用引用计数的内存回收机制，当一个引用类型的变量赋值给另一个变量时，引用计数会+1，而当其中又一个变量不再等于值时，引用计数会-1，如果引用计数为 0，则 js 引擎会将其释放掉

**闭包的作用**
相比全局变量和局部变量，闭包有两大特点：

1. 闭包拥有全局变量不被释放的特点
2. 闭包拥有局部变量的无法被外部访问的特点

**闭包的好处**

1. 可以让一个变量长期在内存中不被释放
2. 避免全局变量的污染，和全局变量不同，闭包中的变量无法被外部使用
3. 私有成员的存在，无法被外部调用，只能直接内部调用

**闭包可以完成的功能**

1. 防抖

```js
// 防抖 避免函数的重复调用 只会调用一次
function Antishake(fn, wait) {
  // 第一个参数是函数，第二个是间隔事件
  let timer = null; // 声明一个变量来接收延时器 初始值为null
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, wait);
  };
}
let fn = Antishake(() => {
  console.log(1111);
}, 2000);
fn();
```

2. 节流

```js
// 节流
function throttle(fn, wait) {
  let timer = null; //节点阀
  return function () {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      fn();
      timer = null;
    }, wait);
  };
}
let fn = throttle(() => {
  console.log(111);
}, 5000);
setInterval(() => {
  fn();
}, 1000);
```

**节流和防抖的区别**

- 防抖避免重复执行 只执行一次
- 节流减少执行次数 执行多次 但在一段时间里面只执行一次

3. 函数柯里化

```js
function curry(fn) {
  // 接收一个后面的参数，除了fn的参数
  let args = Array.prototype.slice.call(arguments, 1); // 从下标1开始全部剪切
  return function () {
    let newArgs = args.concat(Array.from(arguments)); // 将内部函数和外部参数合并
    if (newArgs.length < fn.length) {
      return curry.call(this, fn, ...newArgs);
    } else {
      return fn.apply(this, newArgs);
    }
  };
}
function sum(a, b, c, d) {
  console.log(a + b + c + d);
}
const fn = curry(sum);
fn(1, 2)(3)()(4, 5); // 10
```

## 6. 事件循环（Event Loop）

浏览器的事件循环分为同步和异步任务：所有同步任务都在主线程上执行，形成一个函数调用栈（执行栈），而异步则先放到任务队列（task queue）里，任务队列又分为红任务（macro-task）与微任务（micro-task）。下面的整个执行过程就是事件循环

宏任务：script 内的代码，settimeout，setinterval，I/O、UI 交互事件 setImmediate(node，ie 浏览器环境)

微任务：new Promise.then()、MutationObserver(html5 新特性)、Object.observe(已废弃)、process.nextTick(node 环境)

若同时存在 promise 和 nextTick，则先执行 nextTick

## 7. 虚拟 DOM 原理是什么？优缺点？

虚拟 DOM 本质上是 JavaScript 对象，是对真实 DOM 的抽象，状态变更时，记录新树和旧树的差异，最后把差异更新到真正的 dom 中。

虚拟 DOM 的作用：使用原生 js 或者 jQuery 写页面的时候会发现操作 DOM 是一件非常麻烦的一件事情，往往是 DOM 标签和 js 逻辑同时写在 js 文件里，数据交互时还是不是要写很多 input 隐藏域，如果没有好的代码规范的话，就会显得代码非常冗余混乱，耦合度过高难以维护。

另一方面在浏览器里一遍又一遍的渲染 DOM 是非常非常消耗性能的，常常会出现页面卡死的情况；所以尽量减少对 DOM 的操作成为了优化前端性能的必要手段，vdom 就是将 DOM 的对比放在了 js 层，通过对比不同之处来选择新渲染 DOM 节点，从而提高渲染效率。

**优点：**

- 保证性能下限：虚拟 DOM 可以经过 diff 找出最小差异，然后批量进行 patch，这种操作虽然比不上手动优化，但是比起粗暴的 DOM 操作性能要好很多，因此，虚拟 DOM 可以保证性能下限
- 无需手动操作 DOM：虚拟 DOM 的 diff 和 patch 都是在一次更新中自动进行的，我们无需手动操作 DOM，极大提高开发效率
- 跨平台：虚拟 DOM 本质上 JavaScript 对象，而 DOM 与平台强相关，相比之下虚拟 DOM 可以进行更方便地跨平台操作，例如服务器渲染，移动端开发等等。

**缺点：**

- 无法进行极致优化：在一些性能要求极高得应用中虚拟 DOM 无法进行针对性得极致优化，比如 vscode 采用直接手动操作 DOM 得方式进行极端得性能优化

**vue 和 react 在虚拟 DOM 的 diff 算法上做了哪些改进使速度更快**

**Vue 的 diff 算法**

diff 算法发生在虚拟 DOM 上

判断是否是同一个节点：selector 和 key 都要一样

diff 规则：

- 只比较同层的节点，不同层不做比较。删除原节点，并且新建插入更新节点（实际开发中很少遇到）
- 新旧节点是同层节点，但不是同一个节点，不做精细化比较。删除原节点，并且新建插入更新节点（实际开发中很少遇到）
- 新旧节点是同层节点，也是同一个节点，需要做精细化比较

**React 的 diff 算法**

从左往右一次对比，利用元素的 index 和标识 lastIndex 进行比较，如果满足 index < lastIndex 就移动元素，删除和添加则各自按照规则调整

跨层不比较，同层比较，跟 Vue 一样

**diff 策略**

新节点的位置是 lastIndex，旧节点的位置是 index。从新的节点中一次读取节点索引，对比旧的节点数根据索引

- 不满足 index < lastIndex 的条件，不移动；满足 index < lastIndex 的条件，移动节点。
- 每一次比较都需要重新设置 lastIndex=Math.max(index,lastIndex) (index,lastIndex 中的较大值)
- 移动的节点在前一个被操作的节点后面
- 如果从新的节点集合获取的节点在旧节点集合未找到，就是新增，lastIndex 为上一次的值不变。
- 如果新的节点集合遍历完了，旧节点还有值就是删除，loop 删除掉

最差的情况：如果把最后一个元素移动到最前面，react 会一次移动节点向后

**对比**

相同点：

- React 和 Vue 的 diff 算法，都是不进行跨层级比较，只做同级比较

不同点：

- Vue 进行 diff 时，调用 patch 打补丁函数，一边比较一边给真实 DOM 打补丁
- Vue 对比节点，当节点元素类型相同，但是 className 不同时，认为时不同类型的元素，删除重新创建，而 react 则认为时同类型节点，进行修改操作。
- Vue 的列表比对，采用从两端到中间的方式，旧集合和新集合两端各存在两个指针，两两进行比较，如果匹配上了就按照新集合去调整旧集合，每次对比结束后，指针向队列中间移动；
- 而 react 则是从左往右依次对比，利用元素的 index 和标识 lastIndex 进行比较，如果满足 index < lastIndex 就移动元素，删除和添加则各自按照规则调整；
- 当一个集合把最后一个节点移动到最前面，react 会把前面的节点依次向后移动，而 Vue 只会把最后一个节点放在最前面，这样的操作来看，Vue 的 diff 性能是高于 react 的

## 8. 如何中断一个网络请求

- XML(XMLHttpRequest)

```js
// token用于注销
function getWithCancel(url, token) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  return new Promise((resolve, reject) => {
    console.log(12111);
    xhr.onload = function () {
      resolve(xhr.response);
    };
    token.cancel = function () {
      xhr.abort(); // 中断请求
      reject(new Error("Cancelled")); // reject 出去
    };
    // 监听到错误也reject出去
    xhr.onerror = reject;
  });
}
getWithCancel("www.baidu.com", {});
```

- fetch

```js
const controller = new AbortController();
const sendFetchRequest = function (url, options) {
  const signal = controller.signal;
  fetch(url, { ...options, signal })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((e) => {
      console.error("Download error" + e.message);
    });
};
const abortFetchRequest = () => {
  console.log("Fetch aborted");
  controller.abort();
};
```

## 9. JavaScript 的内存管理
