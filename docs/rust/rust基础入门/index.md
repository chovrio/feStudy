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

## 4.3 切片

- Rust 的另一种不持有所有权的数据类型：切片（slice）
- 一道题，编写一个函数：
  - 它接收字符串作为参数
  - 返回它在这个字符串里找到的第一个的那次
  - 如果函数没找到任何控股个，那么整个字符串就被返回

```rust
fn main() {
    let mut s = String::from("Hello world");
    let word_index = fitst_world(&s);
    s.clear();
    println!("{}", word_index);
}
fn fitst_world(s: &String) -> usize {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return i;
        }
    }
    s.len()
}
```

### 字符串切片

- 字符串切片是指字符串中一部分内容的引用
- 形式：[开始索引..结束索引]
  - 开始索引就是切片起始位置的索引值
  - 结束索引就是切片终止位置的下一个索引值

**注意**

- 字符串切片的返回索引必须发生在有效的 UTF-8 字符边界内。
- 如果尝试从一个多字节的字符中创建字符串切片，程序会报错并退出

```rust
fn main() {
    let s = String::from("Hello World");
    // let hello = &s[0..5];
    // let world = &s[6..11];
    // let hello = &s[..5];
    // let world = &s[6..];
    // let world = &s[6..s.len()];
    // println!("{},{}", hello, world);
    // let whole = &s[0..s.len()];
    let whole = &s[..];
    println!("{}", whole);
}
```

**使用字符串切片重写例子**

```rust
fn main() {
    let mut s = String::from("Hello world");
    let word_index = fitst_world(&s);
    s.clear();
    println!("{}", word_index);
}
fn fitst_world(s: &String) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[..i];
        }
    }
    &s[..]
}
```

#### 字符串字面值是切片

- 字符串字面值被直接存储在二进制程序中
- let s = "Hello World"
- 变量 s 的类型是&str，他是一个指向二进制程序特定位置的切片
  - &str 是不可变引用，所以字符串字面值也是不可变的

#### 将字符串切片作为参数传递

- fn first_word(s:&String)->&str{}
- 有经验的 Rust 开发者会采用&str 作为参数类型，因为这样就可以同时接收 String 和&str 类型的参数了：
- fn first_world(s:&str)->&str {}
  - 使用字符串切片，直接调用该函数
  - 使用 String，可以创建一个完成 String 切片来调用该函数
- 定义函数时使用字符串切片来代替字符串引用会使我们的 API 更加通用，且不会损失任何功能。

```rust
fn main() {
    let my_string = String::from("Hello World");
    let word_index = first_world(&my_string);
    let my_string_literal = "hello world";
    let word_index = first_world(my_string_literal);
}
fn first_world(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[..i];
        }
    }
    &s[..]
}
```

### 其它类型的切片

```rust

fn main() {
    let a = [1, 2, 3, 4, 5];
    let slice = &a[1..3];
}
```

## 5.struct

### 5.1 定义并实例化 struct

**什么是 struct**

- struct，结构体
  - 自定义的数据类型
  - 为相关联的值命名，打包 => 有意义的组合

**定义 struct**

- 使用 **struct** 关键字，并未整个 struct 命名
- 在花括号内，为所有`字段（Field）`定义名称和类型
- 例如：

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

**实例化 struct**

- 想要使用 struct，需要创建 struct 的实例
  - 为每个字段指定具体值
  - 无需按声明的顺序进行指定
- 例子

```rust
let user1 = User {
        email: String::from("chovrio@....."),
        username: String::from("chovrio"),
        sign_in_count: 1,
        active: true,
    };
```

### 5.2 struct 中的例子

**取得 struct 里面的某个值**

- 使用点标记法
- user1.email = String::from("Autumn@...")

```rust
let mut user1 = User {
        email: String::from("chovrio@....."),
        username: String::from("chovrio"),
        sign_in_count: 1,
        active: true,
    };
```

- 一旦 struct 的实例是可变的，那么实例中所有的字段都是可变的

**struct 作为函数的返回值**

字段同名可以简化

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}
```

**struct 更新语法**

- 当你想要基于某个 struct 实例来创建一个新实例的时候，可以使用 struct 更新语法：

```rust
let user2 = User {
        email: String::from("AAAA"),
        username: String::from("BBB"),
        ..user1
    };
```

**Tuple struct**

- 可定义类似 tuple 的 struct，叫做 tuple struct
  - Tuple struct 整体有个名，但里面的元素没有名
  - 适用：想给整个 tuple 起名，并让它不同于其它 tuple，而且又不需要给每个元素其起名
- 定义 tuple struct：使用 struct 关键字，后边是名字，以及里面元素的类型
- black 和 origin 是不同的类型，是不同 tuple struct 的实例。

**Unit-Like Struct（没有任何字段）**

- 可以定义没有任何字段的 struct，叫做 Unit-Like struct（因为与()，单元类型类似）
- 适用于需要在某个类型上实现某个 trait，但是在里面有没有想要存储的数据

**struct 数据的所有权**

```rust
struct User1 {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

- 这里的字段使用了 String 而不是&str：
  - 该 struct 实例拥有其所有的数据
  - 只要 struct 实例是有效的，那么里面的字段也是有效的
- struct 里也可以存放引用，但这需要使用生命周期 -生命周期保证只要 struct 实例是有效的，那么里面的引用也是有效的。
- 如果 struct 里面存储引用，而不使用生命周期，就会报错

```rust
struct User {
    username: &str,// 报错
    email: &str,// 报错
    sign_in_count: u64,
    active: bool,
}

fn main() {
    println!("Hello World");
    let user1 = User {
        email: "aaa",
        username: "bbb",
        active: true,
        sign_in_count: 100,
    };
}
```

**计算矩形面积例子**

**普通版本**

```rust
fn main() {
    let w = 30;
    let l = 50;
    println!("{}", area(w, l));
}
fn area(width: u32, length: u32) -> u32 {
    width * length
}
```

**元组版本**

```rust
fn main() {
    let rect = (30, 50);
    println!("{}", area(rect));
}
fn area(dim: (u32, u32)) -> u32 {
    dim.0 * dim.1
}
```

**结构体版本**

```rust
struct Rectangle {
    width: u32,
    length: u32,
}
fn main() {
    let rect = Rectangle {
        width: 30,
        length: 50,
    };
    println!("{}", area(&rect));
}
fn area(rect: &Rectangle) -> u32 {
    rect.width * rect.length
}
```

### 5.3 struct 的方法

#### 5.3.1 定义方法

- 方法和函数类似：fn 关键字、名称、参数、返回值
- 方法与函数不同之处
  - 方法是在 struct（或 enum、frait 对象）的上下文中定义
  - 第一个参数是 self，表示方法被调用的 struct 实例
- 在 impl 块里定义方法
- 方法的第一个参数可以是&self，也可以获得其所有权或可变借用。和其它参数一样。
- 更良好的代码组织

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    length: u32,
}
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.length
    }
}
fn main() {
    let rect = Rectangle {
        width: 30,
        length: 50,
    };
    println!("{}", rect.area());
}
```

#### 5.3.2 方法调用的运算符

- C/C++：object->something()和(\*object.something()一样
- Rust 没有 -> 运算符
- Rust 会自动引用或解引用
  - 在调用方法时，Rust 根据情况自动添加&、&mut 或\*，以便 object 可以匹配方法的签名。
- 下面两行代码效果相同：
  - p1.distance(&p2);
  - (&p1).distance(&p2)

#### 5.3.3 方法参数

- 方法可以有多个参数

```rust
#[derive(Debug)]
struct Rectangle {
   width: u32,
   length: u32,
}
impl Rectangle {
   fn can_hold(&self, other: &Rectangle) -> bool {
       self.width > other.width && self.length > other.length
   }
}
fn main() {
   let rect1 = Rectangle {
       width: 30,
       length: 50,
   };
   let rect2 = Rectangle {
       width: 10,
       length: 40,
   };
   let rect3 = Rectangle {
       width: 35,
       length: 55,
   };
   println!("{}", rect1.can_hold(&rect2)); // true
   println!("{}", rect2.can_hold(&rect3)); // false
}
```

#### 5.3.4 关联函数

- 可以在 impl 块里定义不把 self 作为第一个参数的函数，它们叫关联函数（不叫方法）
  - 例如：String::from()
- 关联函数通常用于构造器（例子）
- ::符号
  - 关联函数
  - 模块创建的命名空间

#### 5.3.5 多个 impl 块

- 每个 struct 允许拥有多个 impl 块（例子）

## 6.枚举与模式匹配

- 枚举允许我们列举所有可能的值来定义一个类型

### 6.1 定义枚举

- IP 地址：IPv4、IPv6

```rust
enum ip_addrkind {
  V4,
  V6
}
```

#### 6.1.1 枚举值

- 例子：
- let four = ip_addrkind::V4;
- let six = ip_addrkind::V6;

**将数据附加到枚举的变体中**

```rust
enum IpAddr {
  V4(String),
  V6(String),
}
```

- 优点：
  - 不需要额外使用 struct
  - 每个变体可以拥有不同的类型以及关联的数据量
- 例如：

```rust
enum IpAddrKind  {
  V4(u8,u8,u8,u8),
  V6(String)
}
```

### 6.1.2 标准库中的 IpAddr

```rust
struct Ipv4Addr {
    // --snip--
}
struct Ipv6Addr {
    // --snip--
}
enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let q = Message::Quit;
    let m = Message::Move { x: 12, y: 24 };
    let w = Message::Write(String::from("Hello"));
    let c = Message::ChangeColor(0, 255, 255);
}
```

### 6.1.3 为枚举定义方法

同样使用 `impl`

```rust
impl Message {
   fn call(&self) {}
}
```

### 6.2 Option 枚举

- 定义于标准库中
- 在 Prelude（预导入模块）中
- 描述了：某个值可能存在（某种类型）或不存在的情况

#### 6.2.1 Rust 没有 Null

- 其它语言中：
  - Null 是一个值，它表示“没有值”
  - 一个变量可以处于两种状态：空值（null）、非空
- Null 引用：Billion Dollar Mistake
- Null 的问题在于：当你尝试使用非 Null 值那样使用 Null 值的时候，就会引起某种错误
- Null 的概念还是有用的：因某种原因而变为无效或缺失的值

#### 6.2.2 Rust 中类似 Null 概念的枚举 - `Option<T>`

- 标准库中的定义

```rust
enum Option<T> {
  Some(T),
  None,
}
```

- 它包含在 Prelude（预导入模块）中。可以直接使用：

  - `Option<T>`
  - Some(T)
  - None

- 例子

```rust
let some_number = Some(5);
    let some_string = Some("A String");
    let absent_number: Option<i32> = None;
```

#### `Option<T>`比 Null 好在哪？

- `Option<T>`和`T`是不同的类型，不可以把`Option<T>`直接当成`T`
- 若想使用`Option<T>`中的`T`，必须将它转为`T`
- 而在 C#中：
  - string a = null;
  - string b = a + "123456";

### 6.3 控制流运算符 - match

#### 6.3.1 强大的控制流运算符 - match

- 允许一个值与一系列模式进行匹配，并执行匹配的模式对应的代码
- 模式可以是字面值、变量、通配符...

#### 6.3.2 绑定值的模式

- 匹配的分支可以绑定到被匹配对象的部分值
  - 因此，可以从 enum 变体中提取值

```rust
#[derive(Debug)]
enum UsState {
    Alabame,
    Alaska,
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {:?}", state);
            25
        }
    }
}
fn main() {
    let c = Coin::Quarter(UsState::Alaska);
    println!("{}", value_in_cents(c));
}
```

#### 6.3.3 匹配`Option<T>`

**注意 match 匹配必须穷举所有的可能**

```rust
fn main() {
    let five = Some(5);
    let six = plus_one(five);
    let none = plus_one(None);
}
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}
```

#### match`_`通配符

```rust
fn main() {
    let v = 0u8;
    match v {
        1 => println!("one"),
        3 => println!("three"),
        5 => println!("five"),
        _ => (),
    }
}
```

### 6.4 if let

- 处理只关心一种匹配而忽略其它匹配的情况
- 更少的代码，更少的缩进，更少的模板代码
- 放弃了穷举的可能
- 可以把 if let 看作是 match 的语法糖
- 搭配 else

```rust
fn main() {
    let v = Some(0u8);
    match v {
        Some(3) => println!("three"),
        _ => println!("others"),
    }
    if let Some(3) = v {
        println!("three");
    } else {
        println!("others");
    }
}
```

## 7.Package，Crate，Module

### 7.1 Package、Crate、定义 Module

#### 7.1.1 Rust 的代码组织

- 代码组织主要包括：
  - 哪些细节可以暴露，哪些细节是私有的
  - 作用域内哪些名称有效
  - ...
- 模块系统：
  - `Package（包）`：Cargo 的特性，让你构建、测试、共享 crate
  - `Crate（单元包）`：一个模块树，它可产生一个 library 或可执行文件
  - `Module（模块）`、use：让你控制代码的组织、作用域、私有路径
  - `Path（路径）`：为 struct、function 或 module 等项命名的方式

#### 7.1.2 Package 和 Crate

- **Crate** 的类型：
  - **binary**（二进制）
  - **library**（库）
- **Crate Root**：
  - 是源代码文件
  - Rust 编译器从这里开始，组成你的 Crate 的根 Module
- 一个**Package**：
  - 包含 1 个 Cargo.toml，它描述了如何构建这些 Crates
  - 只能包含 0-1 个 library crate
  - 可以包含任意数量的 binary crate

#### 7.1.3 Cargo 的惯例

- src/main.rs:
  - binary crate 的 crate root
  - crate 名与 package 名相同
- src/lib.rs：
  - package 包含一个 library crate
  - library crate 的 crate root
  - crate 名与 package 名相同
- Cargo 把 crate root 文件交给 rustc 来构建 library 或 binary
- 一个 Package 可以同时包含 src/main.rs 和 src/lib.rs
  - 一个 binary create，一个 library create
  - 名称与 package 名相同
- 一个 Package 可以有多个 binary crate：
  - 文件放在：src/bin
  - 每个文件是单独的 binary crate

#### 7.1.4 Crate 的作用

- 将相关功能组合到一个作用域内，便于在项目将进行共享
  - 防止冲突
- 例如 rand crate，访问它的功能需要通过它的名字：rand

#### 7.1.5 定义 module 来控制作用域和私有性

- Module：
  - 在一个 crate 内，将代码进行分组
  - 增加可读性，易于复用
  - 控制项目（item）的私有性。public、private
- 建立 module
  - mod 关键字
  - 可嵌套
  - 可包含其它项（struct，enum，常量，trait，函数等）的定义
- src/main.rs 和 src/lib.rs 叫做 crate roots：
  - 这两个文件（任意一个）的内容形成了名为 crate 的模块，位于整个模块树的根部

```rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
        fn seat_at_table() {}
    }
    mod serving {
        fn take_order() {}
        fn serve_order() {}
        fn take_payment() {}
    }
}
```

### 7.2 路径

- 为了在 Rust 的模块中找到某个条目，需要使用`路径`。
- 路径的两种形式：
  - 绝对路径：从 crate root 开始，使用 crate 名或字面值 crate
  - 相对路径：从当前模块开始，使用 self，super 或当前模块的标识符
- 路径至少由一个标识符组成，标识符之间使用::。

#### 7.2.1 私有边界（privacy boundary）

- 模块不仅可以组织代码，还可以定义私有边界。
- 如果想把函数或 struct 等设为私有，可以将它放在某个模块中。
- Rust 中所有的条目（函数，方法，struct，enum，模块，常量）默认是私有的
- 父级模块无法访问子模块中的私有条目
- 子模块里可以使用所有祖先模块中的条目

#### 7.2.1 pub 关键字

- 使用 pub 关键字来将某些条目标记为公共的

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}
pub fn eat_at_restaurant() {
    crate::front_of_house::hosting::add_to_waitlist();
    front_of_house::hosting::add_to_waitlist();
}
```

#### 7.2.2 super 关键字

- `super`:用来访问父级模块路径中的内容，类似文件系统中的..

```rust
fn serve_order() {}
mod back_of_house {
    use crate::cook_order;

    fn fix_incorrect_order() {
        cook_order();
        super::serve_order(); // 相对
        crate::serve_order(); // 绝对
    }
}
fn cook_order() {}
```

#### 7.2.3 pub struct 关键字

- pub 放在 struct 前：
  - struct 是公共的
  - struct 的字段默认是私有的
- struct 的字段需要单独设置 pub 来变成共有

```rust
mod back_of_house {
    pub struct BreakFast {
        pub toast: String,
        seasonal_fruit: String,
    }
    impl BreakFast {
        pub fn summer(toast: &str) -> BreakFast {
            BreakFast {
                toast: String::from(toast),
                seasonal_fruit: String::from("peaches"),
            }
        }
    }
}
pub fn eat_at_restaurant() {
    let mut meal = back_of_house::BreakFast::summer("Rye");
    meal.toast= String::from("Wheat");
    println!("I'd like {} toast please", meal.toast);
    meal.seasonal_fruit = String::from("blueberries");// 报错
}
```

#### 7.2.4 pub enum

- pub 放在 enum 前 :
  - enum 是`公共`的
  - enum 的变体也都是`公共`的

### 7.3 use 关键字

- 可以使用`use`关键字将路径导入到作用域内
  - 仍遵循私有性规则
- 使用 use 来指定相对路径

#### 7.3.1 use 的习惯用法

- 函数：将函数的父级模块引入作用域（指定到父级）
- struct，enum，其它：指定完整路径（指定到本身）
- 同名条目：指定到父级

#### 7.3.2 使用 pub use 重新导入名称

- 使用 use 将路径（名称）导入到作用域内后，该名称在此作用域内是`私有`的
- pub use：重导出
  - 将条目引入作用域
  - 该条目可以被外部代码引入到它们的作用域

#### 7.3.3 使用外部包（package）

1. Cargo.toml 添加依赖的包（package）

- https://crates.io/

2. use 将特定条目引入作用域

- 标准库（std）也被当做外部包
  - 不需要修改 Cargo.toml 文件来包含 std
  - 需要使用 use 将 std 中的特定条目引入当前作用域

#### 7.3.4 使用`嵌套路径`清理大量的 use 语句

- 如果使用同一个包或模块下的多个条目（例子）
- 可以使用嵌套路径在同一行内将上述条目进行引入：
  - 路径相同的部分::{路径差异的部分}

```rust
use std::cmp::Ordering;
use std::io;
use std::{cmp::Ordering, io};
use std::io::{self,Write}
```

#### 7.3.5 通配符\*

- 使用\*可以把路径中所有的公共条目都引入到作用域

```rust
use std::collections::*;
```

- 注意：谨慎使用
- 引用场景：
  - 测试，将所有被测试代码引入 tests 模块
  - 有时被用于预导入（prelude）模块

### 7.4 将模块拆分为不同文件

#### 7.4.1 将模块内容移动到其它文件

- 模块定义时，如果模块名后边是“;”，而不是代码块：
  - Rust 会从与模块同名的文件中加载内容
  - 模块树的结构不会发生变化
- 随着模块逐渐变大，该技术让你可以把模块的内容移动到其它文件中
