// var o1 = {
//   name: "chovrio",
//   age: 19,
// };
// var o2 = o1;
// o1.name = "Autumn";
// console.log(o1.name); // Autumn
// console.log(o2.name); // Autumn

// var o1 = {
//   name: "chovrio",
//   age: 19,
//   children: {
//     exist: false,
//   },
// };
// // var o2 = { ...o1 };
// var o2 = Object.assign({}, o1);
// o1.children.exist = true;
// o1.name = "Autumn";
// console.log(o1.name); // chovrio
// console.log(o1.children.exist); // true
// console.log(o2.name); // Autumn
// console.log(o2.children.exist); // true

// var o1 = {
//   name: "chovrio",
//   age: 19,
//   children: {
//     exist: false,
//   },
//   say: () => "hello",
// };
// let o2 = JSON.parse(JSON.stringify(o1));
// o1.name = "Autumn";
// o1.children.exist = true;
// console.log(o1.name); // chovrio
// console.log(o1.children.exist); // true
// console.log(o2.name); // Autumn
// console.log(o2.children.exist); // false
// console.log(o1.say()); // hello
// console.log(o2.say()); // TypeError: o2.say is not a function

// var A = {
//   name: "chovrio",
// };
// var B = {
//   name: "Autumn",
//   A,
// };
// A.B = B;
// console.log(A);

var o1 = {
  name: "chovrio",
  age: 19,
  children: {
    exist: false,
  },
  say: () => "hello",
};
let o2 = deepClone(o1);
console.log(o2);
// o1.name = "Autumn";
// o1.children.exist = true;
// console.log(o1.name); // chovrio
// console.log(o1.children.exist); // true
// console.log(o2.name); // Autumn
// console.log(o2.children.exist); // false
// console.log(o1.say()); // hello
// console.log(o2.say()); // TypeError: o2.say is not a function

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

function deepClone(obj) {
  return new Promise((resolve) => {
    const { port1, prot2 } = new MessageChannel();
    prot2.onmessage = (ev) => resolve(ev.data);
    port1.postMessage(obj);
  });
}
