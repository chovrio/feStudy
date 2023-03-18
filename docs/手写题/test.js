console.log(222);
process.nextTick(() => {
  console.log(1111);
});
console.log(333);
