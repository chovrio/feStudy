---
title: rust 基础入门
---

## 3.数据

### 3.1 变量与可变性

- 声明变量使用 let 关键字。
- 默认情况下，变量是不可变的(immutable)。
- 声明变量时，在变量前面加上 mut，就可以使变量可变。

**变量与常量**

- 常量(constant)，常量绑定以后也是不可变的，但是它与不可变的变量有很多区别：
  - 不可以使用 mut，常量永远都是不可变的
  - 声明常量使用 const 关键字，它的类型必须被标注
  - 常量可以在任何作用域内及进行声明，包括全局作用域
  - 常量只可以绑定到常量表达式，无法绑定到函数的调用结构或只能在运行时才能计算出的值
- 在程序运行期间，常量在其声明的作用域内一直有效
- 命名规范：Rust 里常量使用全大写字母，每个单词之间用下划线分开，例如
  - MAX_POINTS

**隐藏(shadowing)**

- 可以使用相同的名字声明新的变量，新的变量就会 shadow(隐藏)之前声明的相同变量
  - 在后续的代码中这个变量名就是心的变量

```rust
fn main(){
  let x = 5;
  let x = x + 1;
  println!("{}",x);// 6
}
```

- shadow 和把变量标记为 mut 是不一样的：
  - 如果不适用 let 关键之，那么重新给非 mut 的变量赋值会导致编译时错误
  - 而使用 let 声明的同名新变量，也是不可变的。
  - 使用 let 声明的同名新变量，它的类型可以与之前不同

```rust
fn main() {
    let spaces = "    ";
    let spaces = spaces.len();
    print!("{}", spaces);
}
```

### 3.2 数据类型

- 标量和复合类型
- Rust 是静态编译语言，在编译时必须直到所有变量的类型
  - 基于使用的值，编译器通常能够推断出它的具体类型
  - 但如果可能的类型比较多(例如把 String 转为整数的 parse 方法)，就必须添加类型的标注，否则编译会报错
  ```rust
  fn main() {
   // 不写 u32 类型就报错
   let guess: u32 = "42".parse().expect("Not a number");
  }
  ```

**标量类型**

- 一个变量类型代表一个单个的值
- Rust 有四个主要的标量类型
  - 整数类型
  - 浮点类型
  - 布尔类型
  - 字符类型

**整数类型**

- 整数类型没有小数部分
- 例如 u32 就是一个无符号的整数类型，占据 32 位的空间
- 无符号整数类型以 u 开头
- 有符号整数类型以 i 开头
- Rust 的整数类型 ：8 16 32 64 128 arch(size)
  - 每种都分 i 和 u，以及固定的位数
  - 有符号范围:
    - -(2^n-1)到 2^(n-1)-1
  - 无符号范围：
    - 0 到 2^n - 1

**isize 和 usize 类型**

- isize 和 usize 类型的位数由程序运行的计算机的架构所决定：
  - 如果是 64 位计算机，那就是 64 位的
  - (其余同理)....
- 使用 isize 或 usize 的主要场景是对某种集合进行索引操作。

**整数字面量**

- 除了 byte 类型外，所有的数值字面值都允许使用类型后缀。
  - 例如 57u8
- 如果你不太清楚应该使用哪种类型，可以使用 Rust 相应的默认类型
- 整数的默认类型就是 u32

**整数溢出**

- 例如： u8 的范围是 0-255，如果你把一个 u8 变量的值设为 256，那么：
  - 调试模式下编译：Rust 会检查整数溢出，如果发生溢出，程序在运行时就会 panic
  - 发布模式下(-release)编译：Rust 不会检查可能导致 panic 的整数溢出
    - 如果溢出发生：Rust 会执行“环绕”操作：
      - 256 变成 0 ，257 变成 1 ...
    - 但是程序不会 panic

**浮点类型**

- Rust 有两种基础的浮点类型，也就是含有小数部分的类型
  - f32，32 位，单精度
  - f64，64 位，双精度
- Rust 的浮点类型使用了 IEEE-754 标准来表述
- f64 时默认内心，因为在现代 CPU 上 f64 和 f32 的速度差不多，而且精度更高。

```rust
fn main() {
   let x = 2.0; // f64
   let y: f32 = 3.0; // f32
}

```

**数值操作**

加减乘除没啥好说的

**布尔类型**

和其它语言也一样，没啥好说的

**字符类型**

- Rust 语言中 char 类型被用来描述语言中最基础的单个字符。
- 字符类型的字面值使用单引号
- 占用 4 字节大小
- 是 Unicode 的标量值，可以表示比 ASCII 多得多的字符内容：拼音、中日韩文、零长度空白字符、emoji 表情等
  - U+0000 到 U+D7FF
  - U+E000 到 U+10FFFF
- 但 Unicode 中并没有“字符”的改良，所以直觉上认为的字符也许与 Rust 中的概念并不相符

### 3.3 复合类型

- 复合类型可以将多个值放在一个类型中
- Rust 提供了两种基础的复合类型：元组(Tuple)、数组

#### Tuple

**创建 Tuple**

- 在小括号里面，将值用逗号分开
- Tuple 中的每个位置都对应一个类型，Tuple 中各元素的类型不必相同

**获取 Tuple 的元素值**

- 可以使用模式匹配来解构（destructure）一个 Tuple 来获取元素的值

```rust
fn main() {
    let tup: (i32, f64, i32) = (500, 6.4, 1);
    // 解构
    let (x, y, z) = tup;
    println!("{},{},{}", x, y, z);
    // 索引
    println!("{},{},{}", tup.0, tup.1, tup.2);
}
```

#### 数组

- 数组也可以将多个值放在一个类型里
- 数组中每个元素的类型必须相同
- 数组的长度也是固定的

**声明一个数组**

- 在中括号里，各值用逗号分开

**数组的用处**

- 如果想让你的数据存放在 stack(栈)上而不是 heap(堆)上，或者想保证有固定数量的元素，这时使用数组更有好处
- 数组没有 Vector 灵活
  - Vector 和数组类似，它由标准库提供
  - Vector 的长度可以改变
  - 如果你不确定应该使用数组还是 Vector，那么估计你应该用 Vector

**数组的类型**

- 数组的类型以这种形式表示: [类型; 长度]

  - 例如 let a:[i32;5] = [1,2,3,4,5];

**另一种声明数组的方法**

- 如果数组的每个元素的值都相同,那么可以在:
  - 在中括号里指定初始值
  - 然后是一个"; "
  - 最后是数组的长度
- 例如: let a = [3; 5]; 它相当于: let a = [3,3,3,3,3]

**访问数组的元素**

- 数组时 Stack 上分配的单个块的内存
- 可以使用索引来访问数组的元素(例子 )
- 如果访问的索引超出了数组的范围,那么:
  - 编译会通过
  - 运行会报错(runtime 时会 panic)
    - Rust 不会允许其继续访问相应地址的内存

```rust
fn main() {
    let months: [&str; 12] = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "Auguest",
        "September",
        "October",
        "November",
        "December",
    ];
    let first = months[0];
    let second = months[1];
    let index = 15;
    let month = months[index];
    println!("{}", month);
}
```

### 3.4 函数

- 声明函数使用 fn 关键字
- 依照惯例:针对函数和变量名,Rust 使用 stack case 命名规范:
  - 所有的字母都是小写的,单词之间使用下划线分开

#### 函数的参数

- parameters,arguments
- 在函数签名里,必须声明每个参数的类型

#### 函数体中的语句与表达式

- 函数体由一系列语句组成,可选的由一个表达式结束
- Rust 是一个基于表达式的语言
- 语句是执行一些动作的指令
- 表达式会计算产生一个值
- 函数的定义也是一个语句

#### 函数的返回值

- 在 -> 符号后边声明函数返回值的类型,但是不可以为返回值命名
- 在 Rust 里面,返回值就是函数体里面最后一个表达式的值
- 若想提前返回,需使用 return 关键字,并指定一个值
  - 大多数函数都是默认使用最后一个表达式最为返回值

#### 函数注释

和 js 一样

```rust
fn main() {
    another_function(5); // argument
    let y = {
        let x = 1;
        // 不加分号返回 x + 3;
        // x + 3; //()
        x + 3
    };
    println!("The value of plus_five(10) is:{}", plus_five(10));
    println!("The value of y is:{}", y);
}
fn another_function(x: i32) {
    // parameter
    println!("the value of x is:{}", x);
}
fn plus_five(x: i32) -> i32 {
    x + 5
}
```

### 3.5 控制流

#### if 表达式

- if 表达式允许您根据条件来执行不同的代码分支
  - 这个条件必须 bool 类型
- if 表达式中,与条件相关联的代码块就叫分支(arm)
- 可选的,在后边可以加上一个 else 表达式

#### 使用 else if 处理多重条件

- 但如果使用了多于一个 else if,那么最好使用 match 来重构代码

```rust
fn main() {
    let number = 7;
    if number < 5 {
        println!("condition was true");
    } else if number > 1000 {
        println!("too big");
    } else {
        println!("condition was false");
    }
    let condition = true;
    let number = if condition { 5 } else { 6 };
    println!("The value of number is: {}", number);
}
```

### Rust 的循环

- Rust 提供了 3 种循环:loop,while 和 for

#### loop 循环

- loop 关键字告诉 Rust 反复的执行一块代码,直到你喊停

#### while 条件循环

- 另一种常见的循环模式是每次执行循环体之前都判断一次条件.
- while 条件循环为这种模式而生

#### 使用 for 循环遍历集合

- 可以使用 while 或 loop 来遍历集合,但是易错且低效

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    let mut index = 0;
    while index < 5 {
        println!("The value of a[index] is: {}", a[index]);
        index = index + 1;
    }
    for element in a.iter() {
        println!("element: {}", element);
    }
    let mut i = 1;
    while i <= 3 {
        i = i + 1;
        println!("while {}", i);
    }
    loop {
        i = i + 1;
        println!("loop {}", i);
        if i >= 10 {
            break;
        }
    }
}
```

#### Range

- 标准库提供
- 指定一个开始数字和一个结束数字,Range 可以生成它们之间的数字(不含结束)
- rev 方法可以反转 Range

```rust
fn main() {
    for number in (1..4).rev() {
        println!("{}!", number);
    }
    println!("LIFTOFF!");
}
```

## 4.所有权

- 所有权是 Rust 最独特的特性,它让 Rust 无需 GC(垃圾收集器) 就可以保证内存安全

### 4.1 什么是所有权

- Rust 的核心特性就是所有权
- 所有程序在运行时都必须管理它们使用计算机内存的方式
  - 有些语言有垃圾收集机制,在程序运行时,它们会不断寻找不再使用的内存
  - 在其它语言中,程序员必须显示的分配和释放内存(不包括 js 吧 😋)
- Rust 采用了第三种方式:
  - 内存是通过一个所有权系统来管理的,其中包含一组编译器在编译时检查的规则
  - 当程序运行时,所有权特性不会减慢程序的运行速度

#### 4.1.1 Stack vs Heap

栈内存 vs 堆内存

- 在像 Rust 这样的系统级编程语言里,一个值是在 stack 上还是在 heap 上堆语言的行为和你为什么要做某些决定时有更大的影响的
- 在你的代码运行的时候,Stack 和 Heap 都是你可用的内存,但是它们的解构很不相同.

**存储数据**

- Stack 按值的接受顺序来存储,按相反的顺序将它们移除(后进先出,LIFO)
  - 添加数据叫做压入栈
  - 移除数据叫做弹出栈
- 所有存储在 Stack 上的数据必须拥有已知的固定的大小
  - 编译时大小未知的数据或运行时大小可能发生变化的数据必须存放在 heap 上
- Heap 内存组织性差一些

  - 当你把数据放入 heap 时,你会请求一定数量的空间
  - 操作系统在 heap 里找到一块足够大的空间,把它标记为在用,并返回一个指针,也就是这个空间的地址
  - 这个过程叫做在 heap 上进行分配,有时候仅仅称为分配

- 把值压在 stack 上不叫分配

- 因为指针是已知固定大小的,可以把指针存放在 stack 上.
  - 当如果想要实际数据,你必须使用指针来定位
- 把数据压倒 stack 上要比在 heap 上分配快得多
  - 因为操作系统不需要寻找用来存储新数据的空间,那个位置永远都在 stack 的顶端

**访问数据**

- 访问 heap 中的数据要比访问 stack 中的数据慢,因为需要通过指针才能找到 heap 中的数据
  - 对于现代的处理器来说,由于缓存的缘故,如果指令在内存中跳转的次数越少,那么速度就越快
- 如果数据存放的距离比较近,那么处理器的处理速度就会更快以下(stack)上
- 如果数据之间的距离比较远,那么处理速度就会慢一些(heap)上
  - 在 heap 上分配大量的空间也是需要时间的

**函数调用**

- 当你的代码调用函数时,值被传入到函数(也包括指向 heap 的指针).函数本地的变量被压到 stack 上. 当函数结束后,这些值会从 stack 上弹出

**所有权存在的原因**

- 所有权解决的问题:
  - 跟踪代码的哪些部分正在使用 heap 的哪些数据
  - 最小化 heap 上的重复数据量
  - 清理 heap 上从未使用的数据以避免空间不足
- 一旦你懂得了所有权,那么就不需要经常去想 stack 或 heap 了
- 但是直到管理 heap 数据是所有权存在的原因,这有助于解释它为什么会这样工作

#### 4.1.2 所有权规则、内存与分配

**所有权规则**

- 每个值都有一个变量，这个变量是该值的所有者
- 每个值同时只能有一个所有者
- 当所有者超出作用域(scope)时，该值将被删除

**变量作用域**

- Scope 就是程序中一个项目的有效范围

```rust
fn main() {
    // s 不可用
    let s = "hello"; // s 可用
                     // 可以对 s 进行相关操作
    println!("Hello, world!");
} // s 作用域到此结束，s 不再可用
```

**String 类型**

- String 比那些基础标量数据类型更加复杂
- 字符串字面值：程序里手写的那些字符串值。它们是不可变的
- Rust 还有第二种字符串类型：String
  - 在 heap 上分配。能够存储在编译时未知数量
    **创建 String 类型的值**
  - 可以使用 from 函数从字符串字面值创建出 String 类型
  - let s = String::from("hello ")
  - 这类字符串是可以被修改的
  - 为什么 String 类型的值可以修改，而字符串字面值却不能修改
    - 因为它们处理内存的方式不同

**内存和分配**

- 字符串字面值，在编译时就知道它的内容，其文本内容直接被硬编码到最终的可执行文件里
  - 速度快、高效。是因为其不可变性。
- String 类型，为了支持可变性，需要在 heap 上分配内存来保存编译时未知的文本内容：

  - 操作系统必须在运行时来请求内存
    - 这步通过调用 String::from 来实现
  - 当用完 String 之后，需要使用某种方式将内存返回给操作系统
    - 这步，在拥有 GC 的语言中，GC 会跟踪并清理
    - 没有 GC，就需要我们去识别内存何时不再使用，并调用代码将它返回
      - 如果忘了，那就浪费内存
      - 如果提前做了，变量就会非法
      - 如果做了两次，也是 Bug，必须一次分配对应一次释放

- Rust 采用了不同的方式：对于某个值来说，当拥有它的变量走出作用范围时，内存会立即自动的交还给操作系统
- drop 函数

**变量和数据交互的方式：移动（Move）**

- 多个变量可以与同一个数据使用一种独特的方式来交互

```rust
let x = 5;
let y = x;
```

- 整数时已知且固定大小的简单的值，这两个 5 被压倒了 stack 中

**String 版本**

```rust
let s1 = String::from("hello");
let s2 = s1;
```

- 一个 String 由 3 部分组成

  - 一个指向存放字符串内容的内存的指针
  - 一个长度
  - 一个容量

- 上面这些东西放在 stack 上。
- 存放字符串内容的部分在 heap 上
- 长度 len，就是存放字符串内容所需要的字节数
- 容量 capacity 是指 String 从操作系统总共获得内存的总字节数

- 当把 s1 赋给 s2，String 的数据被复制了一份
  - 在 stack 上复制了一份指针、长度、容量
  - 并没有复制指针所指向的 heap 上的数据
- 当变量离开作用域时，Rust 会自动调用 drop 函数，并将变量使用的 heap 内存释放
- 当 s1、s2 离开作用域时，它们都会尝试释放相同的内存：

  - 二次释放（double free）bug

- 为了保证内存安全：
  - Rust 没有尝试复制被分配的内存
  - Rust 让 s1 失效
    - 当 s1 离开作用域的时候，Rust 不需要释放任何东西
- 试试看当 s2 创建后再使用 s1 是什么效果

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;
    println!("{}", s1);// 报错 s1 已经失效了
}
```

- 浅拷贝（shallow copy）
- 深拷贝（deep copy）
- 你也许会将复制指针、长度、容量视为浅拷贝，但由于 Rust 让 s1 失效了，所以我们用一个新的术语：移动（Move）
- 隐含的一个设计原则：Rust 不会自动创建数据的深拷贝
  - 就运行时性能而言，任何自动赋值的操作都是廉价的

**变量和数据交互的方式：克隆（Clone）**

- 如果真想堆 heap 上的 String 数据进行深度拷贝，而不仅仅是 stack 上的数据，可以使用 clone 方法

**Stack 上的数据：复制**

- Copy trait，可以用于像整数这样完全存放再 stack 上面的类型
- 如果一个类型实现了 Copy 这个 trait，那么旧的变量在赋值后仍然可用
- 如果一个类型或者该类型的一部分实现 Drop trait，那么 Rust 不允许让它再去实现 Copy trait 了

**一些拥有 Copy trait 的类型**

- 任何简单标量的组合类型都可以是 Copy 的
- 任何需要分配内存或某种资源的都不是 Copy 的
- 一些拥有 Copy trait 的类型：
  - 所有的整数类型，例如 u32
  - bool
  - char
  - 所有的浮点类型，例如 f64
  - Tuple（元组），如果其所有的字段都是 Copy 的
    - (i32,i32) 是
    - (i32,String) 不是

### 4.1.3 所有权与函数

- 在语义上，将值传递给函数和把值赋给变量是类似的：
  - 将值传递给函数将发生移动或复制

```rust
fn main() {
    let s = String::from("Hello World");
    take_ownership(s);// 函数执行后 s 就无效了
    let x = 5;
    makes_copy(x);
    println!("x:{}", x);
}

fn take_ownership(some_string: String) {
    println!("{}", some_string);
}
fn makes_copy(some_number: i32) {
    println!("{}", some_number);
}
```

**返回值与作用域**

- 函数在返回值的过程中同样也会发生所有权的转移
- 一个变量的所有权总是遵循同样的模式：
  - 把一个值赋给其它变量时就会发生移动
  - 当一个包含 heap 数据的变量离开作用域时，它的值就会被 drop 函数清理，除非数据的所有权移动到另一个变量上

**如何让函数使用某个值，但不获得其所有权？**

```rust
fn main() {
    let s1 = String::from("hello");
    let (s2, len) = calculate_length(s1);
    println!("The length of '{}' is {}.", s2, len);
}
fn calculate_length(s: String) -> (String, usize) {
    let length = s.len();
    (s, length)
}
```

## 4.2 引用与借用

**例子**

```rust
fn main() {
    let s1 = String::from("Hello");
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}", s1, len);
}
fn calculate_length(s: &String) -> usize {
    s.len()
}
```

- 参数的类型时&String 而不是 String
- &符号就表示引用：允许你引用某些值而不取得其所有权

**借用**

- 我们把引用作为函数参数这个行为叫做借用
- 我们不能修改借用的东西
- 和变量一样，默认是不可变的

**可变引用**

- 可变引用有一个重要的限制：在特定作用域内，堆某一块数据，只能由一个可变的引用。
  - 这样做的好处是可在编译时防止数据竞争
- 以下三种行为下会发生数据竞争：
  - 两个或多个指针同时访问同一个数据
  - 至少有一个指针用于写入数据
  - 没有使用任何机制来同步对数据的访问
- 可以通过创建新的作用域，来允许非同时的创建多个可变引 用（例子）

```rust
fn main() {
    let mut s = String::from("Hello");
    let s1 = &mut s;
    let s2 = &mut s;// 报错
    println!("The length of '{}' is {}.", s1, s2);
}
fn main() {
    let mut s = String::from("Hello");
    {
        let s1 = &mut s;
    }
    // 不报错
    let s2 = &mut s;
}
```

**另一个限制**

- 不可以同时拥有一个可变引用和一个不变引用
- 多个不变的引用是可行的
```rust
fn main() {
    let mut s = String::from("Hello");
    let r1 = &s;
    let r2 = &s;
    let s1 = &mut s;// 报错
    println!("{} {} {}", r1, r2, s1);
}
```