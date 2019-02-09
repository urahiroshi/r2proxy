const http = require('http');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', (proxyReq) => {
  proxyReq.setHeader('host', 'httpbin.org');
});

proxy.on('proxyRes', (proxyRes) => {
  let rawBody = new Buffer('');
  proxyRes.on('data', (data) => {
    rawBody = Buffer.concat([rawBody, data]);
  });
  proxyRes.on('end', () => {
    const body = rawBody.toString();
    console.log({
      headers: proxyRes.headers,
      statusCode: proxyRes.statusCode,
      body,
    });
  });
})

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://httpbin.org' });
});
server.listen(8888);
