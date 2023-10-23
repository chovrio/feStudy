---
title: 一些手写题
---

## 1.手写 Promise

很经典的题目

迄今为止，个人觉得写的最 "好" 的版本(但是魔改了不符合 promsie A+规范)

```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function runMicroTask(callback) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callback);
    return;
  }

  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver(callback);
    const textNode = document.createTextNode('');
    observer.observe(textNode, {
      characterData: true,
    });
    textNode.data = '1';
    return;
  }
  // 不是微任务，但是是比微任务优先级更高的任务
  if (process && typeof process.nextTick === 'function') {
    process.nextTick(callback);
    return;
  }
  if (typeof setImmediate === 'function') {
    setImmediate(callback);
    return;
  }
  setTimeout(callback, 0);
}
function isPromise(obj) {
  return !!(obj && typeof obj === 'object' && typeof obj.then === 'function');
}

class Promise {
  #state;
  #value;
  #handlers;
  #cachePromise;
  constructor(executor) {
    this.#state = PENDING;
    this.#value = null;
    this.#handlers = [];
    try {
      executor(this.#resolve.bind(this), this.#reject.bind(this));
    } catch (error) {
      this.#reject(error);
    }
  }
  then(onFulfilled, onRejected) {
    this.#cachePromise = new Promise((resolve, reject) => {
      this.#pushHandler(onFulfilled, FULFILLED, resolve, reject);
      this.#pushHandler(onRejected, REJECTED, resolve, reject);
      this.#runHandlers();
    });
    return this.#cachePromise;
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (data) => {
        onFinally();
        return data;
      },
      (reason) => {
        onFinally();
        return reason;
      }
    );
  }
  #resolve(data) {
    this.#changeState(FULFILLED, data);
  }
  #reject(reason) {
    this.#changeState(REJECTED, reason);
  }
  #changeState(newState, value) {
    if (this.#state !== PENDING) {
      return;
    }
    if (newState === REJECTED) {
      console.error(new Error(value));
    }
    this.#state = newState;
    this.#value = value;
    this.#runHandlers();
  }
  #pushHandler(executor, state, resolve, reject) {
    this.#handlers.push({
      executor,
      state,
      resolve,
      reject,
    });
  }
  #runHandlers() {
    if (this.#state === PENDING) {
      return;
    }
    while (this.#handlers[0]) {
      const handler = this.#handlers[0];
      this.#runOneHandler(handler);
      this.#handlers.shift();
    }
  }
  #runOneHandler({ executor, state, resolve, reject }) {
    runMicroTask(() => {
      if (this.#state !== state) {
        return;
      }
      if (typeof executor !== 'function') {
        state === FULFILLED ? resolve(this.#value) : reject(this.#value);
        return;
      }
      try {
        const result = executor(this.#value);
        if (isPromise(result)) {
          if (result === this.#cachePromise) {
            const error = new TypeError(
              'Chaining cycle detected for promise #<Promise>'
            );
            reject(error);
          } else {
            result.then(resolve, reject);
          }
          return;
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
  static resolve(value) {
    if (value instanceof Promise) {
      return value;
    }
    return new Promise((resolve, reject) => {
      if (isPromise(value)) {
        value.then(resolve, reject);
      } else {
        resolve(value);
      }
    });
  }
  static reject(reason) {
    return new Promise((_, reject) => {
      reject(reason);
    });
  }
  static all(promises) {
    return new Promise((resolve, reject) => {
      try {
        let count = 0;
        let finishedCount = 0;
        const result = [];
        for (const promise of promises) {
          let cur = count;
          count++;
          Promise.resolve(promise)
            .then((data) => {
              result[cur] = data;
              finishedCount++;
              if (finishedCount === count) {
                resolve(result);
              }
            })
            .catch(reject);
        }
        if (count === 0) {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  static allSettled(promises) {
    const ps = [];
    try {
      for (const promise of promises) {
        ps.push(
          Promise.resolve(promise).then(
            (value) => ({ status: FULFILLED, value }),
            (reason) => ({ status: REJECTED, reason })
          )
        );
      }
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.all(ps);
  }
  static race(promises) {
    return new Promise((resolve, reject) => {
      try {
        for (const promise of promises) {
          Promise.resolve(promise).then(resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
```

符合 promise A+规范的

```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class Promise {
  #state;
  #value;
  #reason;
  #resolvedCallbacks;
  #rejectedCallbacks;
  constructor(executor) {
    this.#state = PENDING; // 失败的值
    this.#value = undefined; // 成功的值
    this.#reason = undefined; // 失败的值
    this.#resolvedCallbacks = []; // 成功的回调
    this.#rejectedCallbacks = []; // 失败的回调
    try {
      executor(this.#resolve.bind(this), this.#reject.bind(this));
    } catch (error) {
      this.#reject(error);
    }
  }
  #resolve(value) {
    if (this.#state === PENDING) {
      this.#state = FULFILLED;
      this.#value = value;
      while (this.#resolvedCallbacks.length > 0) {
        this.#resolvedCallbacks.shift().call(undefined);
      }
    }
  }
  #reject(reason) {
    if (this.#state === PENDING) {
      this.#state = REJECTED;
      this.#reason = reason;
      while (this.#rejectedCallbacks.length > 0) {
        this.#rejectedCallbacks.shift().call(undefined);
      }
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason;
          };
    const p2 = new Promise((resolve, reject) => {
      if (this.#state === FULFILLED) {
        runMicroTask(() => {
          try {
            const x = onFulfilled(this.#value);
            resolvePromise(p2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      } else if (this.#state === REJECTED) {
        runMicroTask(() => {
          try {
            const x = onRejected(this.#reason);
            resolvePromise(p2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      } else if (this.#state === PENDING) {
        this.#resolvedCallbacks.push(() => {
          runMicroTask(() => {
            try {
              const x = onFulfilled(this.#value);
              resolvePromise(p2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        this.#rejectedCallbacks.push(() => {
          runMicroTask(() => {
            try {
              const x = onRejected(this.#reason);
              resolvePromise(p2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });
    return p2;
  }
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  static resolve(value) {
    if (value instanceof Promise) {
      return value;
    }
    return new Promise((resolve, reject) => {
      if (isPromise(value)) {
        value.then(resolve, reject);
      } else {
        resolve(value);
      }
    });
  }
  static reject(reason) {
    return new Promise((_, reject) => {
      reject(reason);
    });
  }
  static all(promises) {
    return new Promise((resolve, reject) => {
      try {
        let count = 0;
        let finishedCount = 0;
        const result = [];
        for (const promise of promises) {
          let cur = count;
          count++;
          Promise.resolve(promise).then((data) => {
            result[cur] = data;
            finishedCount++;
            if (finishedCount === count) {
              resolve(result);
            }
          }, reject);
        }
        if (count === 0) {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  static allSettled(promises) {
    const ps = [];
    try {
      for (const promise of promises) {
        ps.push(
          Promise.resolve(promise).then(
            (value) => ({ status: FULFILLED, value }),
            (reason) => ({ status: REJECTED, reason })
          )
        );
      }
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.all(ps);
  }
  static race(promises) {
    return new Promise((resolve, reject) => {
      try {
        for (const promise of promises) {
          Promise.resolve(promise).then(resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
function runMicroTask(callback) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callback);
    return;
  }

  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver(callback);
    const textNode = document.createTextNode('');
    observer.observe(textNode, {
      characterData: true,
    });
    textNode.data = '1';
    return;
  }
  // 不是微任务，但是是比微任务优先级更高的任务
  if (process && typeof process.nextTick === 'function') {
    process.nextTick(callback);
    return;
  }
  if (typeof setImmediate === 'function') {
    setImmediate(callback);
    return;
  }
  setTimeout(callback, 0);
}

function resolvePromise(p2, x, resolve, reject) {
  if (x === p2) {
    reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
  } else if ((x !== null && typeof x === 'object') || typeof x === 'function') {
    let called;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(p2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}
function isPromise(obj) {
  return !!(obj && typeof obj === 'object' && typeof obj.then === 'function');
}
Promise.deferred = function () {
  let result = {};
  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
};
module.exports = Promise;
```
