---
title: 一些js手写题
---

## 1.实现一个浅拷贝以及深拷贝

假如我们直接将一个对象赋值给另一个对象

```js
let o1 = {
  name: "chovrio",
  age: 19,
};
let o2 = o1;
o1.name = "Autumn";
console.log(o1.name); // Autumn
console.log(o2.name); // Autumn
```

可以发现 o2 的 name 随着 o1 的 name 的改变而改变，因为直接赋值我们给予另一个对象的是赋值对象的地址，这算是一种简单的引用

那我们如何实现一个拷贝呢?

### 浅拷贝

运用...扩展运算符将对象展开以及对象的 assign 方法都可以实现一个浅拷贝，但它存在一些问题

```js
var o1 = {
  name: "chovrio",
  age: 19,
  children: {
    exist: false,
  },
};
var o2 = { ...o1 };
// var o2 = Object.assign({}, o1);
o1.children.exist = true;
o1.name = "Autumn";
console.log(o1.name); // chovrio
console.log(o1.children.exist); // true
console.log(o2.name); // Autumn
console.log(o2.children.exist); // true
```

这里我们可以看到，如果我们的对象中存在子对象，也只是简单的引用，拷贝对象会因为原对象的改变而改变，所以才会出现深拷贝

### 深拷贝

方法一：JSON 转换，很简洁的一种写法，美中不足的是它不能处理循环引用，函数，以及 Symbol 等特殊类型，转换过程中会直接丢失

```js
var o1 = {
  name: "chovrio",
  age: 19,
  children: {
    exist: false,
  },
  say: () => "hello",
};
let o2 = JSON.parse(JSON.stringify(o1));
o1.name = "Autumn";
o1.children.exist = true;
console.log(o1.name); // chovrio
console.log(o1.children.exist); // true
console.log(o2.name); // Autumn
console.log(o2.children.exist); // false
console.log(o1.say()); // hello
console.log(o2.say()); // TypeError: o2.say is not a function
```

方法二：递归函数

```js
// 这里用weak的原因是它的键名是对象
function deepClone(obj, map = new WeakMap()) {
  // 如果传入的数据不是对象或者为null就直接返回(不需要clone)
  if (obj === null || typeof obj !== "object") return obj;
  // 解决循环引用的问题，比如我有一个 A 对象，在 B 对象中引用了 A 对象，然后设置 A.B = B 那在我clone A 的时候就一直陷入循环了
  // 但我们在node中出现了这种情况的话会返回一个 <ref *1>
  if (map.has(obj)) return map.get(obj);
  const copy = Array.isArray(obj) ? [] : {};
  // 将 obj 传入 map
  map.set(obj, copy);
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      // 循环递归
      copy[key] = deepClone(obj[key], map);
    }
  }
  return copy;
}
```

## 2.实现一个柯里化函数

**概念：**多个参数的传入 把它转化成 n 个函数

```js
function currying(fn) {
  // 我们要记录每次调用时传入的参数，并且和函数的参数个数进行比较，如果不满足总个数 就返回新函数
  // 存储每次调用的时候传入的变量
  const inner = (args = []) => {
    return args.length >= fn.length
      ? // 参数足够立即执行
        fn(...args)
      : // 合并新旧参数 递归返回 直到传入参数的个数足够
        (...userArgs) => inner([...args, ...userArgs]);
  };
  return inner();
}
const add = (a, b, c, d) => {
  return a + b + c + d;
};
let sum = currying(add);
console.log(sum(1)(2, 3)(4));
```

## 3.手写 promise

**要点:**

- promise 是一个类，无需考虑兼容性问题
- 当使用 promise 的时候 会传入一个执行器，此执行器
- 当前 executor 中给了两个函数可以来描述当前 promise 的状态。promise 中有三个状态 成功态 失败态 等待态
  默认为等待态
- 每个 promise 实例都有一个 then 方法
- promise 一旦状态变化后不能更改

```js
// 手写promise

// 定义三个变量储存状态,避免出现拼写错误的低级问题
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class Promise {
  constructor(executor) {
    this.status = PENDING; // promise默认的状态
    this.value = undefined; // 成功的原因
    this.reason = undefined; // 失败的原因
    this.onResolvedCallbacks = []; // 存放成功的回调方法
    this.onRejectedCallbacks = []; // 存放失败的回调方法
    const resolve = (value) => {
      // 成功resolve函数
      if (value instanceof Promise) {
        return value.then(resolve, reject);
      }
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED; // 修改状态
        // 发布
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    const reject = (reason) => {
      // 失败的reject函数
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED; // 修改状态
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  // then中的参数是可选的
  then(onFulfilled, onRejected) {
    // onFulfilled, onRejected
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };
    // 用于实现链式调用
    let promise2 = new Promise((resolve, reject) => {
      // 订阅模式
      if (this.status == FULFILLED) {
        // 成功调用成功方法
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            // 此x 可能是一个promise， 如果是promise需要看一下这个promise是成功还是失败 .then ,如果成功则把成功的结果 调用promise2的resolve传递进去，如果失败则同理

            // 总结 x的值 决定是调用promise2的 resolve还是reject，如果是promise则取他的状态，如果是普通值则直接调用resolve
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === REJECTED) {
        // 失败调用失败方法
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status == PENDING) {
        // 代码是异步调用resolve或者reject的
        this.onResolvedCallbacks.push(() => {
          // 切片编程 AOP
          setTimeout(() => {
            try {
              // todo...
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              // todo...
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value);
    });
  }
  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value);
    });
  }
  catch(errorFn) {
    return this.then(null, errorFn);
  }
  // all方法
  static all = function (promises) {
    return new Promise((resolve, reject) => {
      let result = [];
      let times = 0;
      const processSuccess = (index, val) => {
        result[index] = val;
        // 所有的都正确就resolve result
        if (++times === promises.length) {
          resolve(result);
        }
      };
      for (let i = 0; i < promises.length; i++) {
        // 并发 多个请求一起执行的
        let p = promises[i];
        if (p && typeof p.then === "function") {
          p.then((data) => {
            processSuccess(i, data);
          }, reject); // 如果其中某一个promise失败了 直接执行失败即可
        } else {
          processSuccess(i, p);
        }
      }
    });
  };
}
// 利用x的值来判断是调用promise2的resolve还是reject
function resolvePromise(promise2, x, resolve, reject) {
  // 核心流程
  if (promise2 === x) {
    return reject(new TypeError("错误"));
  }
  // 我可能写的promise 要和别人的promise兼容，考虑不是自己写的promise情况
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 有可能是promise
    // 别人的promise可能调用成功后 还能调用失败~~~  确保了别人promise符合规范
    let called = false;
    try {
      // 有可能then方法是通过defineProperty来实现的 取值时可能会发生异常
      let then = x.then;
      if (typeof then === "function") {
        // 这里我就认为你是promise了  x.then 这样写会触发getter可能会发生异常
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject); // 直到解析他不是promise位置
          },
          (r) => {
            // reason
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // {}  {then:{}}
        resolve(x); // 常量
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x); // 说明返回的是一个普通值 直接将他放到promise2.resolve中
  }
}
```
