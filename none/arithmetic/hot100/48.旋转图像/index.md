---
title: 48.旋转图像
---

思路：

```js
var rotate = function (matrix) {
  // 原矩阵边长
  const n = matrix.length;
  // 创建一个用0填充的矩阵 边长一致
  const matrix_new = new Array(n).fill(0).map(() => new Array(n).fill(0));
  // 根据要求将新矩阵的位置排列成反转后的样子
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      matrix_new[j][n - i - 1] = matrix[i][j];
    }
  }
  // 将新矩阵内容填入旧矩阵
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i][j] = matrix_new[i][j];
    }
  }
};
```
