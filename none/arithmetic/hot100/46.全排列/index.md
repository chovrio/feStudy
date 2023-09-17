---
title: 46.全排列
---

### 题目描述

给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。

### 示例

**输入：**nums = [1,2,3]
**输出：**[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

### 思路

递归 ＋ 回溯

```js
var permute = function (nums) {
  const len = nums.length;
  const path = []; // 记录路径
  const reuslt = []; // 返回值
  const search = (nodes, path) => {
    // 当路径长度等于 nums 数组长度说明这是一个排列
    if (path.length === len) {
      // 存储路径
      reuslt.push([...path]);
      return; // 退出递归
    }
    // 每次将数组的节点全部遍历一遍
    for (let i = 0; i < nodes.length; i++) {
      // 这一次遍历需要处理这个节点，首先把值存入路径数组
      path.push(nodes[i]);
      const temp = [...nodes];
      // 这一步和上异步意思是这个节点处理完了，不能用了，把剩下的节点继续递归处理
      temp.splice(i, 1);
      // 继续递归
      search(temp, path);
      // 这个节点递归处理忘了之后把它从路径中删除
      path.pop();
    }
  };
  search(nums, path); // 开始递归处理
  // 返回结果
  return reuslt;
};
```
