const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = 8000;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`键盘小车手已启动：http://127.0.0.1:${port}/`);
  console.log("保持这个窗口打开，关闭窗口游戏网址就会停止访问。");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`端口 ${port} 已被占用，请先关闭另一个预览窗口。`);
  } else {
    console.log(error.message);
  }
});
