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
obj.fn(); // obj
obj._fn(); // GLOBAL
obj.__fn(); // obj
