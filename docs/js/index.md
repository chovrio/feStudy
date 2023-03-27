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
