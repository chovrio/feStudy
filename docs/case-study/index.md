---
title: case-study
---

## 1.fs 模块的大小写敏感性问题

这是在逛 vite 的 issues 的时候发现的，本来想着或许可以解决下的，然后测试寄了。

具体问题在这个 [issue](https://github.com/vitejs/vite/issues/14374) 里面

描述一下问题，比如我有一个资源路径是 'xxx/Path/1.png' 经过 vite 的处理，我在文件里面导入的路径就算写成 '/xxx/path/1.png' 在 resolve 的插件的处理下也会被转换成 '/xxx/Path/1.png'(真实路径)，所以引入资源的时候不会报错。

当然这种情况仅限于 `win` 和 `macos` 系统，在大部分 `unix` 系统下是行不通的(maybe)，查了一下是因为 `unix` 系统对路径大小写敏感，而 `win` 和 `macos` 系统对路径大小写不敏感。举一个例子吧。

```js
import fs from 'fs';
// win or macos
// 我的文件真实路径
// win    'E:\\web\\vite-demo\\src\\path\\1.jpg'
// macos  '/xxx/path/1.png'
// unix   '/xxx/path/1.png'
// 然后输入下面的 path 时我统一将上面路径的 path 全部改写成 Path
fs.statSync(path);
// 这段代码在 win 和 macos 下都是可以正常运行的会返回文件的信息，但是在 unix 下就会报错
```

在 vite 遇到 import 之类的导入语句的时候，会走到 resolve 这个插件的逻辑里面，这个插件的主要作用就是处理路径，举一个例子，比如 `react` 这个库它是不会改变的，所以 vite 会对它进行预构建(用于复用，这样就不必每次都重新打包)，然后存放在`node_module/.vite/deps/` 里面，但是我们在文件里面导入的时候又是直接导入的 `react`，那怎么样才能找到真实的路径，或者说我们预想的路径呢。靠得就是 resolve 插件。

```js
// 就不截图了，这是开发阶段经过 vite 编译过后的代码
// 编译前
import React from 'react';
import ReactDOM from 'react-dom/client';
// 编译后
import __vite__cjsImport1_react from '/node_modules/.vite/deps/react.js?v=cd158394';
const React = __vite__cjsImport1_react.__esModule
  ? __vite__cjsImport1_react.default
  : __vite__cjsImport1_react;
import __vite__cjsImport2_reactDom_client from '/node_modules/.vite/deps/react-dom_client.js?v=fd88a28b';
const ReactDOM = __vite__cjsImport2_reactDom_client.__esModule
  ? __vite__cjsImport2_reactDom_client.default
  : __vite__cjsImport2_reactDom_client;
i;
```

具体流程感兴趣的可以自行阅读，这里就不展开了(太多了，我也说不清 😥)，和这个 `case-study` 相关的内容在 `tryCleanFsResolve` 这个函数里面，路径在 `packages/vite/src/node/plugins/resolve.ts` 里面的前几行代码就是

```js
// 这里的 file 是资源路径
const fileStat = tryStatSync(file);
// Try direct match first
if (fileStat?.isFile()) return getRealPath(file, options.preserveSymlinks);
```

这里的 `tryStatSync` 函数作用很简单，就是我们上面提到的 `fs.statSync`，判断路径下是否存在资源。根据我们上面的结论，在路径大小写写错的情况下，`win` 和 `macos` 能返回 `fs.Stats`，而 `unix` 系统下就会直接报错，下面的逻辑就是判断 `fileStat` 是不是一个文件，是的话就获取文件的真实路径。 `getRealPath` 函数也很简单。`win` 系统调用了 `fs.realpathSync` ，其余调用 `fs.realpathSync.native`。

`win` 系统下调用 `fs.realpathSync` 传入大小写不正确的路径会返回真实的(大小写正确的)路径，`macos` 系统下调用 `fs.realpathSync.native` 也会返回正确的路径(由 issue 推测，因为没有 mac 没测过)。但是如果是 `unix` 系统的话，执行 `fs.realpathSync.native` 传入一个错误(大小写不正确)的路径，则会直接报错。

不过在 `vite` 中压根走不到这一步，因为我们刚才说了 `unix` 系统下调用 `fs.statSync` 路径不正确也会直接报错。在 `vite` 的 `trySatSync` 函数里面对错误进行了捕获，但是没做处理。所以执行后的 `fileStae` 是 `undefined`，所以它压根不会走进下方的判断，虽然就算走进去了也获取不到真实的路径。

解决方案：递归(感觉不算特别好)

思路：从程序执行的路径向后面，对资源的导入路径(这里传入的都是绝对路径，因为 vite 会对路径进行处理都会转换成绝对路径，只是在这一步骤的时候是绝对路径，最后 resolve 处理完后的路径不是)进行拆分，并且将路径都转换成小写，如果存在且相等就将转换小写前的路径拼接进去，一旦有不相等的路径，就直接退出循环，因为路径不可能存在了。

```js
import fs from 'fs';
import path from 'path';
function findRealPath(inputPath) {
  const projectPath = process.cwd();
  const parts = inputPath.replace(projectPath, '').split(path.sep);
  parts.shift();
  let currentPath = projectPath;
  let flag = true;

  for (const part of parts) {
    const dirContents = fs.readdirSync(currentPath);
    const normalizedPart = part.toLowerCase(); // 将当前部分转换为小写
    const matchingDir = dirContents.find(
      (item) => item.toLowerCase() === normalizedPart
    );
    if (matchingDir) {
      currentPath = path.join(currentPath, matchingDir);
    } else {
      flag = false;
      break; // 未找到匹配的目录，结束循环
    }
  }
  return flag ? currentPath : undefined;
}
```

有了上面这个函数过后，我们只需要将之前那里改动一下，就可以达到在 `unix` 系统下也能正常运行的效果了。

```js
let fileStat = tryStatSync(file);
if (!isWindows && fileStat === void 0 && (file = findRealPath(file))) {
  fileStat = tryStatSync(file);
}
// Try direct match first
if (fileStat?.isFile()) return getRealPath(file, options.preserveSymlinks);
```

因为我本身没有 `unix` 系统，改动完代码过后是在 `win` 系统下跑的测试都通过了，对 `unix` 系统的测试是在 `stackblitz.com` 下完成的，我在原 issue 的 `stackblitz` 仓库里面 link 了我改动后的 `vite` 代码，页面正常展示了。但是我没在 `unix` 系统下跑过测试，后续的结果就是跑 `ci` 的时候测试寄了，吓得我赶紧关了 `pr` 😢。不过截止(9.16 23:16)现在关于这个 issue 都没有人对它进行分类，最开始看到这个 issue 的时候，没注意到具体的内容还评论了 `文件路径错了.`，最开始我觉得它不能算 `bug`，因为这本身就是用户自身的不合理行为，不应该由框架买单，但是 `vite` 自身又对它做了处理(获取真实路径)，但是又因为 `unix` 路径大小写敏感的特性，导致自身做的处理在 `unix` 无效，所以这算什么问题了，会不会是`特性`？

update(9.17 1:37):

凌晨睡床上突然想起，测试寄掉的原因是因为，`vite` 有后缀补全，没后缀的时候肯定找不到资源，但是 `file` 路径会被覆盖成空串，所以改动一下代码就行了(有点白痴了 😥)

```js
// 改动前
if (!isWindows && fileStat === void 0 && (file = findRealPath(file))) {
  fileStat = tryStatSync(file);
}
// 改动后
if (!isWindows && fileStat === void 0) {
  const newPath = findRealPath(file);
  if (newPath) file = newPath;
  fileStat = tryStatSync(file);
}
```

继续睡觉，测试应该没问题了。😴