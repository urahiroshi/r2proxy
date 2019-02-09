const http = require('http');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://httpbin.org' });
});
server.listen(8888);
