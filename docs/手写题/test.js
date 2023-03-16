// 手写promise

// 定义三个变量储存状态,避免出现拼写错误的低级问题
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

// 用es6的方式定义类
class Promise {
  // executor 执行器
  constructor(executor) {
    this.status = PENDING; // pending 是默认的状态
    this.value = undefined; // 成功的原因
    this.reason = undefined; // 失败的原因
    // 存储起来是因为如果有异步方法 函数事先执行
    this.onResolvedCallbacks = []; // 存放成功的回调方法
    this.onRejectedCallbacks = []; // 存放失败的回调方法
    // 成功resolve啊含糊
    const resolve = (value) => {
      // 只有promise的状态为pending才可以改变promise的状态
      if (this.status === PENDING) {
        this.status = FULFILLED; // 修改状态
        this.value = value; // 修改成功的原因
        // 执行成功的回调函数
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    // 失败reject函数
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED; // 修改状态
        this.reason = reason; // 修改失败的原因
        // 执行失败的回调函数
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    try {
      // 执行调度器
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onFulfiled, onRejected) {
    let promise2 = new Promise((resolve, reject) => {
      // 订阅模式
      if (this.status === PENDING) {
        // 切片编程AOP
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              // todo...
              let x = onFulfiled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
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
          });
        });
      }
      // 成功调用成功
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            // 此 x 可能是 promise，如果是promise需要看一下这个promise是成功还是失败
            // .then 如果成功则把成功的结果 resolve 失败就reject 传递出去
            // 总结x的值决定是调用promise2的resolve还是reject如果是promise则取他的状态
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      // 失败调用失败
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      // 返回新的 promise2 用于实现链式调用
    });
  }
}
const p = new Promise((resolve, reject) => {
  resolve(111);
}).then((v) => {
  console.log(v);
});

// 利用x的值来判断是调用promise2的resolve还是reject
function resolvePromise(promise2, x, resolve, reject) {
  // 如果新返回的promise等于旧的promise就报错
  if (promise2 === x) {
    new TypeError("Chaining cycle detected for promise #<Promise>]");
  }
  // 别人的promise可能调用成功后 还可以调用失败---
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 有可能是 promise
    let called = false;
    // 有可能 then 方法是通过 deinedProperty 方法来实现的 取值时可能会发生异常
    try {
      let then = x.then;
      // 代表返回的x是promise，但也有可能是一个对象身上存在then方法
      if (typeof then === "function") {
        // 去之后this指向丢失，将then的this指回去
        then.call(
          x,
          (value) => {
            // 已经回调过了就直接返回
            if (called) return;
            // 没有回调过就设置回调值为true
            called = true;
            resolve(value);
          },
          (reason) => {
            // 这里同上
            if (called) return;
            called = true;
            reject(reason);
          }
        );
      } else {
        // 如果then是对象，即x不是一个promise 直接resolve就行
        resolve(x);
      }
    } catch (e) {
      // 出错了就直接reject
      reject(e);
    }
  } else {
    // 返回的是一个普通值 直接resolve
    resolve(x);
  }
}
