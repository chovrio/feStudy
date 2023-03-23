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

## 8.常用的集合

- Vector
- String
- HashMap

### 8.1 Vector

- `Vec<T>` 叫做 vector
  - 由标准库提供
  - 可存储多个值
  - 只能存储相同类型的数据
  - 值在内存中连续存放

#### 8.1.1 创建 Vector

- Vec::new 函数
- ` let v: Vec<i32> = Vec::new();`
- 使用初始值创建 Vec <T\>,使用 vec!宏
  - `let v = vec![1, 2, 3];`

#### 8.1.2 删除 Vector

- 与任何其它 struct 一样，但 Vector 离开作用域后
  - 它就被清理掉了
  - 它所有的元素也被清理掉了

#### 8.1.3 读取 Vector 的元素

- `两种方式可以引用`Vector 里的值
  - 索引
  - get 方法

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];
    let third: &i32 = &v[1];
    println!("The third element is {}", third);
    match v.get(2) {
        Some(third) => println!("The third element is {}", third),
        None => println!("The is no third element"),
    }
}
```

#### 8.1.4 所有权和借用规则

- 不能在统一作用域内同时拥有可变和不可变引用

```rust
fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    let first = &v[0];
    v.push(6);// 报错
    println!("The first element is {}", first);
}
```

#### 8.1.5 遍历 Vector 中的值

```rust
fn main() {
    let mut v = vec![100, 32, 57];
    for i in &mut v {
        // * 是取这个地址的值
        *i += 50;
        println!("{}", i);
    }
}
```

### 8.2 Vector-例子

#### 8.2.1 使用 enum 来存储多种数据类型

- Enum 的变体可以附加不同类型的数据
- Enum 的变体定义在同一个 enum 类型下

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}
fn main() {
    let row = vec![
        SpreadsheetCell::Int(3),
        SpreadsheetCell::Text(String::from("blue")),
        SpreadsheetCell::Float(10.12),
    ];
}
```

### 8.3 String

#### 8.3.1 Rust 开发者经常会被字符串困扰的原因

- Rust 倾向于暴露可能的错误
- 字符串数据结构复杂
- UTF-8

#### 8.3.2 字符串是什么

- Byte 的集合
  - 一些方法
    - 能将 byte 解析为文本
- Rust 的`核心语言层面`,只有一个字符串类型:字符串切片`str`(或&str)
- 字符串切片:对存储在其它地方 UTF-8 编码的字符串的引用
  - 字符串字面值:存储在二进制文件中,也是字符串切片
- `String`类型:
  - 来自`标准库`而不是核心语言
  - 可增长,可修改,可拥有

#### 8.3.3 通常说的字符串是指?

- String 和&str
  - 标准库里用的多
  - UTF-8 编码
- 本节课讲的主要是 String

#### 8.3.4 其它类型的字符串

- Rust 的标准库还包含了很多其它的字符串类型,例如:OsString,OsStr,CString,CStr
  - String vs Str 后缀:拥有或借用的变体
  - 可存储不同编码的文本或在内存中以不同的形式展示
- Library crate 针对存储字符串可提供更多的选项

#### 8.3.5 创建一个新的字符串(String)

- 很多`Vec<T>`的操作都可以用于 String.
- String::new()函数
- 使用初始值来创建 String:
  - to_string()方法,可用于实现了 Display trait 的类型,包括字符串字面值(例子)
  - String::from()函数,从字面量创建 String(例子)

```rust
fn main() {
    // let mut s = String::new();
    let data = "initial contents";
    let s = data.to_string();
    let s1 = "initial contents".to_string();
    let s = String::from("initial contents");
}
```

#### 8.3.6 更新 String

- push_str()方法:把一个字符串切片附加到 String(例子)
- push 方法:把单个字符附加到 String
- - 连接字符串
  * 使用了类似这个签名的方法 fn add(slef,s:&str) -> { ... }
    - 标准库中的 add 方法使用了泛型
    - 只能把&str 添加到 String
    - 解引用强制转换(deref coercion)
- format!:连接多个字符串(例子)

```rust
fn main() {
    let mut s = String::from("foo");
    let s1 = String::from("bar");
    s.push_str(&s1);
    s.push('h');
    println!("{}", s);
    let a = String::from("aaaaa");
    let b = String::from("BBBBB");
    let c = a + &b;
    println!("{}", c);// aaaaaBBBBB
    println!("{}", a); // 报错
    println!("{}", b);
    println!("{}", c);
}
```

```rust
fn main() {
    let s1 = String::from("tic");
    let s2 = String::from("tac");
    let s3 = String::from("toe");
    // let s3 = s1 + "-" + &*s2 + "-" + &s3;
    // println!("{}", s3);
    let s = format!("{}-{}-{}", s1, s2, s3);
    println!("{}", s)
}
```

#### 8.3.7 对 String 按索引的形式进行访问

- 按索引语法访问 String 的某部分,会报错
- Rust 的字符串不支持索引语法访问

#### 8.3.8 String 类型的内部表示

- String 是对`Vec<u8>`的包装

#### 8.3.9 字节,标量值,字形簇

**Bytes,Scalar,Grapheme Clusters**

- Rust 有三种看待字符串的方式:
  - 字节 bytes
  - 标量值 chars
  - 字形簇
- Rust 不允许对 String 进行索引的最后一个原因:
  - 索引操作应消耗一个 v 额产量时间(O(1))
  - 而 String 无法保证:需要遍历所有内容,来确定由多少个合法的字符.

#### 8.3.10 切割 String

- 可以使用`[]`和`一个范围`来创建字符串的切片
  - 必须谨慎使用
  - 如果切割时跨越了字符边界,程序就会 panic
  - `(b1,b2),(b3,`b3)(b4,b5),(b7,b7)
    - panic

#### 8.3.11 遍历 String 的方法

- 对于标量值:chars()方法
- 对于字节:bytes()方法
- 对于字形簇:很复杂,标准库未提供

```rust
fn main() {
    let w = "哈哈哈";
    for b in w.bytes() {
        println!("{}", b);
    }
    for b in w.chars() {
        println!("{}", b);
    }
}
```

**String 不简单**

- Rust 选择将正确处理 String 数据作为所有 Rust 程序的默认行为
  - 程序员必须在处理 UTF-8 数据之前投入更多的精力
- 可防止在开发后期处理涉及非 ASCII 字符的错误

### 8.4 HashMap

**`HashMap<K,v>`**

- 键值对的形式存储数据,一个键(Key)对应一个值(value)
- Hash 函数:决定如何在内存中存放 K 和 V

#### 8.4.1 创建 HashMap

- 创建空 HashMap:new()函数
- 添加数据:insert()方法
- HashMap 用的较少,不在 prelude 中
- 标准库对其支持较少,没有内置的宏来创建 HashMap
- 数据存储在 heap 上
- 同构的, 一个 HashMap 中:
  - 所有的 K 必须是同一种类型
  - 所有的 V 必须是同一种类型

```rust
use std::collections::HashMap;

fn main() {
    // let mut scores: HashMap<String, i32> = HashMap::new();
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("yellow"), 50);
}
```

#### 8.4.2 另一种创建 HashMap 的方式:collect 方法

- 在元素类型为 Tuple 的 Vector 上使用 collect 方法,可以组建一个 HashMap:
  - 要求 Tuple 有两个值:一个作为 K,一个作为 V
  - collect 方法可以把数据整合成很多种集合类型,包括 HashMap
    - 返回值需要显式指明类型

```rust
use std::collections::HashMap;

fn main() {
    let teams = vec![String::from("Blue"), String::from("Yellow")];
    let intial_scores = vec![10, 50];
    let scores: HashMap<_, _> = teams.iter().zip(intial_scores.iter()).collect();
}
```

#### 8.4.3 HashMap 和所有权

- 对于实现了 Copy trait 的类型(例如 i32),值会被复制到 HashMap 中
- 对于拥有所有权的值(例如 String),值会被移动,所有权会转移给 HashMap
- 如果将值的引用插入到 HashMap,值本身不会移动

```rust
fn main() {
    let field_name = String::from("Favorite color");
    let field_value = String::from("Blue");
    let mut map = HashMap::new();
    // 使用这种方式插不会丧失所有权
    // map.insert(&field_name, &field_value);
    // 丧失所有权,再次调用会报错
    map.insert(field_name, field_value);
    // println!("{}", field_name); // 报错
}
```

#### 8.4.4 访问 HashMap 中的值

- get 方法
  - 参数：K
  - 返回：`Option<&V>`

```rust
use std::collections::HashMap;
fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    let team_name = String::from("Blue");
    let score = scores.get(&team_name);
    match score {
        Some(s) => println!("{}", s),
        None => println!("team not exist"),
    }
}
```

#### 8.4.5 遍历 HashMap

- for 循环

```rust
for (k, v) in &scores {
    println!("{}:{}", k, v);
}
```

#### 8.4.6 更新 HashMap<K,V>

- HashMap 大小可变
- 每个 K 同时只能对应一个 V
- 更新 HashMap 中的数据：
  - K 已经存在，对应一个 V
    - 替换现有的 V
    - 保留现有的 V，忽略新的 V
    - 合并现有的 V 和新的 V

**替换现有的 V**

- 如果向 HashMap 插入一对 KV，然后再插入同样的 K，但是不同的 V，那么原来的 V 会被替换掉

```rust
fn main() {
   let mut scores = HashMap::new();
   scores.insert(String::from("Blue"), 10);
   scores.insert(String::from("Blue"), 25);
   println!("{:?}", scores);
}
```

**只有 K 不对应任何值得情况下，才插入 V**

- entry 方法：检查指定得 K 是否对应一个 V
  - 参数为 K
  - 返回 enum Entry：代表值是否存在

## 9.错误处理

### 9.1 panic! 不可恢复的错误

**Rust 错误处理概述**

- Rust 的可靠性：错误处理
  - 大部分情况下：在编译时提示错误，并处理
- 错误的分类：
  - 可回复
    - 例如文件未找到，可再次尝试
  - 不可恢复
    - bug，例如访问的索引超出范围
  - Rust 没有类似异常的机制
    - 可恢复错误：Result<T,E\>
    - 不可恢复：panic!宏

#### 9.1.1 不可恢复的错误与 panic!

- 当 panic!宏执行
  - 你的程序会打印一个错误信息
  - 展开(unwind)、清理调用栈（Stack）
  - 退出程序

#### 9.1.2 为应对 panic，展开或终止(abort)调用栈

- 默认情况下，当 panic 发生：
  - 程序展开调用栈(工作量大)
    - Rust 沿着调用栈往回走
    - 清理每个遇到的函数中的数据
  - 或立即中止调用栈：
    - 不进行清理，直接停用程序
    - 内存需要 OS 进行清理
- 想让二进制文件更小，把设置从”展开“改为”中止“
  - 在 Cargo.toml 中适当的 profile 部分设置：
    - panic = 'abort'

```rust
fn main() {
    // panic!("crash and burn");
    let v = vec![1, 2, 3];
    println!("{}", v[99]);
}
```

#### 9.1.3 使用 panic!产生的回溯信息

- panic!可能出现在：
  - 我们写的代码中
  - 我们所依赖的代码中
- 可通过调用 panic!的函数的回溯信息来定位引起问题的代码
- 通过设置环境变量 RUST_BACKTRACE 可得到回溯信息(直接编译器 run 也行)
- 为了获取带有调试信息得回溯，必须启用调试符号（不带 --release）

### 9.2 Result 与可恢复的错误

#### 9.2.1 Result 枚举

```rust
enum Result<T,E> {
  Ok(T),
  Err(E)
}
```

- T:操作成功情况下，Ok 变体里返回的数据的类型
- Err：操作失败情况下，Err 变体里返回的错误的类型

```rust
fn main() {
    let f = File::open("hello.txt");
}
```

#### 9.2.2 处理 Result 的一种方式：match 表达式

- 和 Option 枚举一样，Result 及其变体也是由 prelude 带入作用域

```rust
use std::{fs::File, io::ErrorKind};

fn main() {
    let f = File::open("hello.txt");
    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Error creating file:{:?}", e),
            },
            other_error => panic!("Error opening the file:{:?}", other_error),
        },
    };
}
```

**匹配不同的错误**

- 上面的例子中使用了很多 match
- match 很有用，但是很原始
- 闭包（closure）。Result<T,E\>有很多方法：
  - 它们接收闭包作为参数
  - 使用 match 实现
  - 使用新的方法会使代码变得更加简洁

**unwrap**

- unwrap：match 表达式的一个快捷方法：
  - 如果 Result 结果是 Ok，返回 Ok 里面的值
  - 如果 Result 结果是 Err，调用 panic!宏

```rust
use std::{fs::File, io::ErrorKind};

fn main() {
    let f = File::open("hello.txt").unwrap_or_else(|error| {
        if error.kind() == ErrorKind::NotFound {
            File::create("hello.txt").unwrap_or_else(|error| {
                panic!("Error creating file:{:?}", error);
            })
        } else {
            panic!("Error opening file:{:?}", error);
        }
    });
    println!("{:?}", f);
}
```

**expect**

- expect：和 unwrap 类似，但可指定错误信息

#### 9.2.3 传播错误

- 在函数出处处理错误
- 将错误返回给调用者

```rust
fn read_username_from_file() -> Result<String, io::Error> {
    let f = File::open("hello.txt");
    let mut f = match f {
        Ok(file) => file,
        Err(e) => return Err(e),
    };
    let mut s = String::new();
    match f.read_to_string(&mut s) {
        Ok(_) => Ok(s),
        Err(e) => Err(e),
    }
}
```

**?运算符**

- ?运算符：传播错误的一种快捷方式
- 如果 Result 是 Ok：Ok 中的值就是表达式的结果，然后继续执行程序
- 如果 Result 是 Err：Err 就是整个函数的返回值，就像使用了 return

```rust
fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

**?与 from 函数**

- Trait std::convert::From 上的 from 函数：
  - 用于错误之间的转换
- 被?所应用的错误，会隐式的被 from 函数处理
- 当?调用 from 函数时：
  - 它所接收的所悟类型会被转换为当前函数返回类型所定义的错误类型
- 用于：针对不同错误原因，返回同一种错误类型
  - 只要每个错误类型实现了转换为所返回的错误类型的 from 函数

**链式调用**

```rust
fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();
    File::open("hello.txt")?.read_to_string(&mut s)?;
    Ok(s)
}
```

**?运算符只能用于返回 Result 的函数**

- 最初 main 函数返回的类型是：()
- main 函数类型也可以是 Result
- Box<dyn Error\> 是 trait 对象

```rust
fn main() {
    let f = File::open("hello.txt")?;
}
use std::{error::Error, fs::File};

fn main() -> Result<(), Box<dyn Error>> {
    let f = File::open("hello.txt")?;
    Ok(())
}
```

### 9.4 什么时候应该使用 panic!

总体原则

- 在定义一个可能失败的函数时，优先考虑返回 Result
- 否则就 panic!

#### 9.4.1 编写实例、原型代码、测试

- 可以使用 panic!
  - 演示某些概念：unwrap
  - 原型代码：unwrap、expect
  - 测试：unwrap、expect

**有时候你比编译器掌握更多的信息**

- 你可以确定 Result 就是 Ok：unwrap
- 例子

```rust
use std::net::IpAddr;
fn main() {
    let home: IpAddr = "127.0.0.1".parse().unwrap();
}
```

**错误处理的指导性建议**

- 当代码最终可能处于损坏状态时，最好使用 panic!
- 损坏状态（Bad state）：某些假设、保证、约定或不可变性被打破
  - 例如非法的值、矛盾的值或空缺的值被传入代码
  - 以及下列中的一条
    - 这种损坏状态并不是预期能够偶尔发生的事情。
    - 在此之后，您的代码如果处于这种损坏状态就无法运行
    - 在您使用的类型中没有一个好的方法来将这些信息（出入损坏状态）进行编码。

**场景建议**

- 调用你的代码，传入无意义的参数值：panic!
- 调用外部不可控代码，返回非法状态，你无法修复：panic!
- 如果失败是可预期的：Result
- 当你的代码对值进行操作，首先应该验证这些值：panic!

**为验证创建自定义类型**

- 创建新的类型，把验证逻辑放在构造实例的函数里。
- getter: 返回字段数据
  - 字段是私有的（下例中）：外部无法直接对字段赋值

```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100 , got {}", value);
        }
        Guess { value }
    }
    pub fn value(&self) -> i32 {
        self.value
    }
}

fn main() {
    loop {
        // todo...
        let guess = "32";
        let guess: i32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        let guess = Guess::new(guess);
        // todo...
    }
}
```

## 10 泛型，Trait，生命周期

### 10.1 提取函数消除重复的代码

- 重复代码的危害：
  - 容易出错
  - 需求变更时需要在多处进行修改
- 消除重复：提取函数

```rust
fn largest(list: &[i32]) -> i32 {
    let mut largest = list[0];
    for &item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];
    let result = largest(&number_list);
    println!("The largest number is {}", result);
    let number_list = vec![34, 50, 25, 6000, 65];
    let result = largest(&number_list);
    println!("The largest number is {}", result);
}
```

**消除重复的步骤**

- 识别重复代码
- 提取重复代码到函数体中，并在函数签名中指定函数的输入和返回值
- 将重复的代码使用函数调用进行替代

### 10.2 泛型

- 泛型：提高代码`复用`能力
  - 处理重复代码的问题
- 泛型是具体类型或其它属性的抽象代替：
  - 你编写的代码不是最终的代码，而是一种`模板`，里面有一些`占位符`。
    编译器在`编译时`将”占位符“`替换为具体的类型`。
- 例如：fn largest<T\>(list:&[T]) -> T{ ... }
- 类型参数：
  - 很短，通常一个字母
  - CamelCase
  - T：type 的缩写

#### 10.2.1 函数定义中的泛型

- 泛型函数：
  - 参数类型
  - 返回类型

例子有点小问题，但和 typescript 差不多

```rust
fn largest<T: std::cmp::PartialOrd>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];
    let result = largest(&number_list);
    println!("The largest number is {}", result);
    let char_list = vec!['y', 'm', 'a', 'q'];
    let result = largest(&char_list);
    println!("The largest char is {}", result);
}
```

#### 10.2.2 Struct 中定义的泛型

- 可以使用多个泛型的类型参数
  - 太多类型参数：你的代码需要重组为多个更小的单元

```rust
struct Point<T> {
    x: T,
    y: T,
}
fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```

#### 10.2.3 Enum 定义中的泛型

- 可以让枚举的变体持有泛型数据类型
  - 例如 Option<T\>,Result<T,E\>

```rust
enum Option<T> {
    Some(T),
    None,
}
enum Result<T, E> {
    Ok(T),
    Err(E),
}
fn main() {}
```

#### 10.2.4 方法定义中的泛型

- 为 struct 或 enum 实现方法的时候，可在定义中使用泛型
- 注意：
  - 把 T 放在 impl 关键字后，表示在类型 T 上实现方法
    - 例如：impl<T\> Point<T\>
  - 只针对具体类型实现方法（其余类型没实现方法）
    - 例如：impl Point<f32\>
- struct 里的泛型类型参数可以和方法的泛型类型参数不同

```rust
struct Point<T, U> {
    x: T,
    y: U,
}
impl<T, U> Point<T, U> {
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}
fn main() {
    let p1 = Point { x: 5, y: 4 };
    let p2 = Point {
        x: "Hello",
        y: "Rust",
    };
    let p3 = p1.mixup(p2);
    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

#### 10.2.5 泛型代码的性能

- 使用泛型的代码和使用具体类型的代码运行速度是一样的。
- 单态话（monomorphization）：
  - 在编译时将泛型替换为具体类型

```rust
fn main() {
    let integer = Some(5);
    let float = Some(5.0);
}
enum Option_i32 {
    Some(i32),
    None,
}
enum Option_f64 {
    Some(f64),
    None,
}
fn main() {
    let integer = Option_i32::Some(5);
    let float = Option_f64::Some(5.0);
}
```

### 10.3 Trait

- Trait 告诉 Rust 编译器：
  某种类型具有哪些并且可以与其它类型共享的功能
- Trait：抽象的定义共享行为
- Trait bounds（约束）：泛型类型参数指定为实现了特定行为的类型
- Trait 与其他语言的接口（）interface 类似，但有些区别。

#### 10.3.1 定义一个 Trait

- Trait 的定义：把方法签名放在一起，来定义实现某种目的所必须的一组行为。
  - 关键字：trait
  - 只有方法签名，没有具体实现
  - trait 可以有多个方法：每个方法签名占一行，以;结尾
  - 实现该 trait 的类型必须提供具体的方法实现

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
```

#### 10.3.2 在类型上实现 trait

- 与为类型实现方法类似。
- 不同之处：
  - impl Xxxx for Tweet { ... }
  - 在 impl 的块里，需要对 Trait 里的方法签名进行具体的实现

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}
impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}
pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}
impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}:{}", self.username, self.content)
    }
}

use demo::Summary;
use demo::Tweet;
fn main() {
    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        retweet: false,
    };
    println!("1 new tweet:{}", tweet.summarize());
}
```

#### 10.3.3 实现 trait 的约束

- 可以在某个类型上实现某个 trait 的前提条件是：
  - 这个类型或这个 trait 是在本地 crate 里定义的
- 无法为外部类型来实现外部的 trait：
  - 这个限制是程序属性的一部分（也就是`一致性`）。
  - 更具体地说是`孤儿原则`：之所以这样命名是因为父类型不在。
  - 此规则确保其他人的代码不能破话你的代码，反之亦然
  - 如果没有这个规则，两个 crate 可以为同一类型实现同一个 trait，Rust 就不知道应该使用哪个实现了。

#### 10.3.4 默认实现

- 默认实现的方法可以调用 trait 中其它的方法，即使这些方法没有默认实现
- 注意：无法从方法的重写实现里面调用默认的实现

```rust
pub trait Summary {
    fn summarize_author(&self) -> String;
    fn summarize(&self) -> String {
        String::from("Read more...")
    }
}
```

- Trait 作为参数
- impl Trait 语法：适用于简单情况
- Trait bound 语法：可用于复杂情况
  - impl Trait 语法是 Trait bound 的语法糖
- 使用+ 指定多个 Traitboun
- Trait bound 使用 where 子句
  - 可以在方法签名后指定 where 子句

#### 10.3.5 实现 trait 作为返回类型

- impl Trait 语法
- 注意：impl Trait 只能返回确定的同一种类型，返回可能不同类型的代码会报错

```rust
pub fn notify1(flag: bool) -> impl Summary {
    if flag {
        NewsArticle {
            headline: String::from("hello"),
            content: String::from("World"),
            author: String::from("chovrio"),
            location: String::from("重庆"),
        }
    } else {
        Tweet {
            username: "chovrio",
            content: "hahahah",
            reply: true,
            retweet: false,
        }
    }
}
```

#### 10.3.6 使用 Trait Bound

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item
        }
    }
    largest
}
fn main() {
    let number_list = vec![34, 50, 25, 100, 65];
    let result = largest(&number_list);
}
```

**使用 Trait Bound 有条件的实现方法**

- 在使用泛型类型参数的 impl 块上使用 Trait bound，我们可以有条件的为实现了特定 Trait 的类型来实现方法
- 也可以为实现了其它 Trait 的任意类型有条件的实现某个 Trait
- 为满足 Trait Bounrd 的所有类型上实现 Trait 叫做覆盖实现（blankt implementations）

```rust
struct Pair<T> {
    x: T,
    y: T,
}
impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}
impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y ={}", self.y);
        }
    }
}

fn main() {
    let str = 3.to_string();
}
```

### 10.4 生命周期

- Rust 的每个引用都有自己的生命周期
- 生命周期：引用保持有效的作用域
- 大多数情况：生命周期是隐式的、可被推断的
- 当引用的生命周期可能以不同的方式互相关联时：手动标注生命周期。

#### 10.4.1 生命周期-避免悬垂引用（dangling reference）

- 生命周期的主要目标：避免悬垂引用（dangling reference）

```rust
fn main() {
    {
        let r;
        {
            let x = 5;
            r = &x;
        }
        println!("{}", r);
    }
}
```

#### 10.4.2 函数中的泛型生命周期

**'x**

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";
    let result = longest(string1.as_str(), string2);
}
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

#### 10.4.3 生命周期标注语法

- 生命周期的标注不会改变引用的生命周期长度
- 当指定了泛型生命周期参数，函数可以接受带有任何生命周期的引用
- 生命周期的标注：描述了多个引用的生命周期间的关系，但不影响生命周期

#### 10.4.4 生命周期标注-语法

- 生命周期参数名：
  - 以`'`开头
  - 通常全小写而且非常短
  - 很多人使用 'a
- 生命周期标注的位置：
  - 在引用的 & 符号后
  - 使用空格将标注和引用类型分开
- 例子

  - &i32 // 一个引用
  - &'a i32 // 带有显式生命周期的引用
  - &'a mut i32 // 带有显式生命周期的可变引用

  - 单个生命周期标注本身没有意义

#### 10.4.5 函数签名中的生命周期标注

- 泛型生命周期参数声明在：函数名和参数列表之间<\>里
- 生命周期`'a`的实际生命周期是：x 和 y 两个生命周期中较小的那个

#### 10.4.6 深入理解生命周期

- 指定生命周期参数的方式依赖于函数所作的事情
- 从函数返回引用时，返回类型的生命周期参数需要与其中一个参数的生命周期匹配：
- 如果返回的引用没有指向任何参数，那么它只能引用函数内创建的值：
  - 这就是悬垂引用：该值在函数结束时就走出了作用域

#### 10.4.7 Struct 定义中的生命周期标注

- Struct 里可包括：
  - 自持有的类型
  - 引用：需要在每个应用上添加生命周期标注

#### 10.4.8 生命周期的省略

- 我们知道：
  - 每个引用都有生命周期
  - 需要为使用生命周期的函数或 struct 指定生命周期参数

**省略规则**

- 在 Rust 引用分析所编入的模式称为`生命周期省略规则`。
  - 这些规则无需开发者来遵守
  - 它们是一些特殊情况，由编译器来考虑
  - 如果你的代码符合这些情况，那么就无需显式标注生命周期
- 生命周期省略规则不会提供完整的推断：
  - 如果应用规则后，引用的生命周期仍然模糊不清 -> 编译错误
  - 解决办法：添加生命周期标注，表明引用间的相互关系

**输入、输出生命周期**

- 生命周期在:
  - 函数/方法的参数：输入生命周期
  - 函数/方法的返回值：输出生命周期

**生命周期省略的三个规则**

- 编译器使用 3 个规则在没有显式标注生命周期的情况下，来确定引用的生命周期
  - 规则 1 应用于输入生命周期
  - 规则 2、3 应用于输出生命周期
  - 如果编译器应用完 3 个规则之后，仍然有无法确定生命周期的应用 -> 报错
  - 这些规则适用于 fn 定义和 impl 块
- 规则 1：每个引用类型的参数都有自己的生命周期
- 规则 2：如果只有一个输入生命周期参数，那么该生命周期被赋给所有的输出生命周期参数
- 规则 3：如果有多个输入生命周期参数，但其中一个是&self 或&mut self（是方法），那么 self 的生命周期会被赋给所有的输出生命周期参数

**生命周期省略的三个规则 - 例子**

- 假设我们是编译器
- fn first_word(s:&str) -> {}
- fn first_word<'a>(s:&'a str) -> &star {}
- fn first_word<'a>(s:&'a str) -> &'a str {}

- fn longest(x:&str,y:&str) -> &str {}
- fn longest<'a,'b>(x:&'a str,y:&'b str) -> &str {}

#### 10.4.8 方法定义中的生命周期标注

- 在 struct 上使用生命周期实现方法，语法和泛型参数的语法一样
- 在哪声明和使用生命周期参数，依赖于：
  - 生命周期参数是否和字段、方法的参数或返回值有关
- struct 字段的生命周期名：
  - 在 impl 后声明
- impl 块内的方法签名中：
  - `引用`必须绑定于 struct 字段引用的声明周期，或者引用是`独立`的也可以
  - 生命周期省略规则经常使得方法中的生命周期标注不是必须的。

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}
impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please:{}", announcement);
        self.part
    }
}
```

#### 10.4.9 静态生命周期

- `'static` 是一个特殊的生命周期：整个程序的持续时间。
  - 例如：所有的字符串字面值都拥有'static 生命周期
    - let s:&'static str = "I have a static lifetime.";
- 为引用指定'static 生命周期前要三思：
  - 是否需要引用在程序整个生命周期内都存活

#### 10.4.10 泛型参数类型、Trait Bound、生命周期
```rust
use std::fmt::Display;

fn longest_with_an_announcement<'a, T>(x: &'a str, y: &'a str, ann: T) -> &'a str
where
    T: Display,
{
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
fn main() {}
```