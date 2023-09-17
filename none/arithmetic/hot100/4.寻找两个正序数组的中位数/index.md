---
title: 4.寻找两个正序数组的中位数
---

数组

### 题目描述

给定两个大小分别为 m 和 n 的正序（从小到大）数组  nums1 和  nums2。请你找出并返回这两个正序数组的 中位数 。

算法的时间复杂度应该为 O(log (m+n)) 。

### 示例

**输入：**nums1 = [1,3], nums2 = [2]

**输出：**2.00000

**解释：**合并数组 = [1,2,3] ，中位数 2

**提示：**

- nums1.length == m
- nums2.length == n
- 0 <= m <= 1000
- 0 <= n <= 1000
- 1 <= m + n <= 2000
- -106 <= nums1[i], nums2[i] <= 106

### 思路

这道题虽然是 hard，但是用 js 写起来非常简单

```js
var findMedianSortedArrays = function (nums1, nums2) {
  // 合并数组并且排序
  let nums = nums1.concat(nums2).sort((a, b) => a - b);
  // 寻找中间元素下标
  let mid = nums.length >> 1;
  // 如果数组长度是偶数
  if (nums.length % 2 === 0) {
    return (nums[mid - 1] + nums[mid]) / 2;
  } else {
    // 奇数直接返回中间数
    return nums[mid];
  }
};
```
