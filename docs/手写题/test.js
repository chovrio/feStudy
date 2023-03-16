// async + await 基于generator的  语法糖

// 我们知道核心靠的就是switch case 来实现的
// const { wrap } = require("node:module");
// let regeneratorRuntime = {
//   mark(genFn) {
//     return genFn;
//   },
//   wrap(iteratorFn) {
//     const context = {
//       next: 0,
//       done: false, // 表示迭代器没有完成
//       stop() {
//         this.done = true;
//       },
//     };
//     let it = {};
//     it.next = function (v) {
//       // 用户调用的next方法
//       context.sent = v;
//       let value = iteratorFn(context);
//       return {
//         value,
//         done: context.done, // 是否完成
//       };
//     };
//     return it;
//   },
// };
// ("use strict");

// var _marked = /*#__PURE__*/ regeneratorRuntime.mark(read);

// function read() {
//   var a, b, c;
//   return regeneratorRuntime.wrap(function read$(_context) {
//     switch ((_context.prev = _context.next)) {
//       case 0:
//         _context.next = 2;
//         return 1;

//       case 2:
//         a = _context.sent;
//         console.log("a", a);
//         _context.next = 6;
//         return 2;

//       case 6:
//         b = _context.sent;
//         console.log("b", b);
//         _context.next = 10;
//         return 3;

//       case 10:
//         c = _context.sent;
//         console.log("c", c);

//       case 12:
//       case "end":
//         return _context.stop();
//     }
//   }, _marked);
// }

// let it = read(); // 默认没有执行
// let { value, done } = it.next("abc"); // 第一次传递参数是没有意义的
// // 给next方法传递参数时 他的传参会给上一yield的返回值
// {
//   let { value, done } = it.next("abc");
//   console.log(value, done);
// }
// {
//   let { value, done } = it.next("ddd");
//   console.log(value, done);
// }
// {
//   let { value, done } = it.next("eee");
//   console.log(value, done);
// }

// function* read() {
//   // 生成器 他执行的结果叫迭代器
//   console.log(1);
//   yield 1;
//   console.log(2);
//   yield 2;
//   console.log(3);
//   yield 3;
// }
// let it = read(); // 默认没有执行
// it.next();
// it.next();
// it.next();

const util = require("util");
const fs = require("fs");
const path = require("path");
const readFile = util.promisify(fs.readFile);
function* read() {
  let data = yield readFile(path.resolve(__dirname, "./a.txt"), "utf-8");
  data = yield readFile(path.resolve(__dirname, data), "utf-8");
  return data;
}
let it = read(); // it => next
let { value, done } = it.next();
value.then((data) => {
  let { value, done } = it.next(data);
  value.then((data) => {
    console.log(data);
  });
});
