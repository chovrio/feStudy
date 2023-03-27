---
sidebar_position: 3
title: css
---

## 1.什么是浮动？为什么要清除浮动？怎么清除浮动

**浮动：**非 IE 浏览器下，容器不设置高度，且元素浮动（float）时，容器高度不能被内容撑开。此时，内容会溢出到容器外面而影响布局。这种现象被称为浮动（溢出）

- 浮动元素脱离文档流，不占据空间（引起”高度塌陷“现象）
- 浮动元素碰到包含它的边框或者其它浮动元素的边框停留

浮动元素可以左右移动，直到遇到另一个浮动元素或者遇到它外边缘的包含框。浮动框不属于文档流中的普通流，当元素浮动之后，不会影响块级元素的布局，只会影响内联元素布局。此时文档流中的普通流就会表现得该浮动框不存在一样的布局模式。当包含框的高度小于浮动框的时候，此时就会出现”高度塌陷“

**浮动产生的问题：**

- 父元素的高度无法被撑开，影响与父元素同级的元素
- 与浮动元素同级的非浮动元素会跟随其后
- 若浮动的元素不是第一个元素，则该元素之前的元素也要浮动，否则会影响页面的显示结构

**清除浮动的方式：**

- 给父级`div`定义`height`属性
- 最后一个浮动元素之后添加一个空的`div`标签，并添加`clear:both`样式
- 包含浮动元素的父级标签添加`overflow:hidden`或者`overflow:auto`
- 使用`:after`伪元素。由于 IE6-7 不支持`:after`，使用`zoom:1`触发`hasLayout`

```css
.clearfix:after {
  content: "\200B";
  display: table;
  height: 0;
  clear: both;
}
.clearfix {
  *zoom: 1;
}
```

**使用 clear 属性清除浮动的原理**

```css
.xxx {
  clear: none;
  clear: left;
  clear: right;
  clear: both;
}
```

- clear 属性只有块级元素才有效得，而::after 等为元素默认都是内联水平，这就是借助伪元素清除影响时需要设置 display 属性值的原因

## 2. 什么是 BFC，怎么创建 BFC

两个相关概念

- Box：Box 是 CSS 布局的对象和基本单位，一个页面是由很多个 Box 组成的，这个 Box 就是我们所说的盒模型。
- Formatting context：块级上下文格式化，它是页面中的一块渲染区域，并且有一套渲染规则，它决定了其子元素将如何定位，以及和其它元素的关系和相互作用

块级格式化上下文（Block Formatting Context，BFC）是 Web 页面的可视化 CSS 渲染的一部分，是布局过程中生成块级盒子的区域，也是浮动元素与其它元素的交互限定区域。

## display:none 与 visibility:hidden 的区别

区别如下：

1. 是否占据空间

- display:none，该元素不占据任何空间，在文档渲染的时候，仍存在文档对象模型树中，但不渲染，也不占据空间
- visibility:hidden，该元素空间仍然存在，但不展示，相当于透明隐藏

2. 是否渲染

- display:none，会触发 reflow（回流），进行重新渲染。
- visibility:hidden，只会触发 repaint（重绘），因为没有位置变化，不进行渲染

3. 是否是继承属性

- display:none，display 不是继承属性，元素本身及其子元素都会消失。
- visibility:hidden，visibility 是继承属性，若子元素使用了 visibility:visible，则不继承，这个子孙元素又会显现出来。

4. 读屏器是否读取

- display:none，不会被读取
- visibility:hidden，会读取

