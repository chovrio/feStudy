---
title: 3.无重复字符的最长子串
---

字符串

### 题目描述

给定一个字符串 s ，请你找出其中不含有重复字符的 最长子串 的长度

### 示例

输入: s = "abcabcbb"
输出: 3
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。

### 提示

- 0 <= s.length <= 5 \* 104
- s 由英文字母、数字、符号和空格组成

### 思路

我个人有两种思路 一是快慢指针，二是扩散，感觉都算是滑动窗口的一种思路

#### 快慢指针

快慢指针就是用两个变量指向字符串的下标，指向一段子串，但是我们这里必须使用哈希表来存储字符，不然无法得知当前快慢指针包裹的子串是否有重复字符

```js
// 快慢指针
var lengthOfLongestSubstring = function (s) {
  // 创建一个哈希表
  let map = new Map();
  // let set = new Set(); Set Map都可以
  // 慢指针
  let slow = 0,
    // 快指针
    fast = 0;
  // 初始化返回值为最小
  let result = -Infinity;
  // 当慢指针小于等于快指针 且 快指针没到字符串的末尾
  while (slow <= fast && fast < s.length) {
    // 如果哈希表内存在快指针指向的字符
    if (map.has(s[fast])) {
      // 删除哈希表当前慢指针指向的字符
      map.delete(s[slow]);
      // 慢指针加1
      slow++;
      // 设置返回值为 快减慢+1，因为上一轮快指针加1 后已经不是最长的子串了
      result = fast - slow + 1 > result ? fast - slow + 1 : result;
    } else {
      // 哈希表中不存在就，加入进哈希表
      map.set(s[fast], true);
      // 快指针+1
      fast++;
    }
  }
  // 这里这么返回的原因是因为可能我们字符串末尾连续的一段子串是最长的
  // 即末尾字符最后加入哈希表，没有计算出最长子串，
  // 这里快减慢不加 1 是因为最后 fast++ 了 fast === s.length
  return fast - slow > result ? fast - slow : result;
};
```

时间复杂度：O(N)

#### 扩散

扩散就是循环，然后在当前字符左右两边同步扩散，没有相同的字符就继续扩散，有了就跳到下一个循环，就不写了，总感觉大差不差
