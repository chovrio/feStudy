// token用于注销
function getWithCancel(url, token) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  return new Promise((resolve, reject) => {
    console.log(12111);
    xhr.onload = function () {
      resolve(xhr.response);
    };
    token.cancel = function () {
      xhr.abort(); // 中断请求
      reject(new Error("Cancelled")); // reject 出去
    };
    // 监听到错误也reject出去
    xhr.onerror = reject;
  });
}
getWithCancel("www.baidu.com", {});

const controller = new AbortController();
const sendFetchRequest = function (url, options) {
  const signal = controller.signal;
  fetch(url, { ...options, signal })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((e) => {
      console.error("Download error" + e.message);
    });
};
const abortFetchRequest = () => {
  console.log("Fetch aborted");
  controller.abort();
};
