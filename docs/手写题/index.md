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

## 2.手写一个 Promise
