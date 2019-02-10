const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

const proxy = httpProxy.createProxyServer({});
const FIXTURES_PATH = 'fixtures.json';

const fixtures = {};

const exit = (code) => {
  fs.writeFileSync(FIXTURES_PATH, JSON.stringify(fixtures));
  process.exit(code || 0);
}

process.on('SIGINT', () => {
  onExit();
});

process.on('SIGHUP', () => {
  onExit();
});

const saveFixture = (req, { body, statusCode, headers }) => {
  fixtures[req.url] = { body, statusCode, headers };
  console.log('save fixture:');
  console.log(fixtures[req.url]);
};

proxy.on('proxyReq', (proxyReq) => {
  proxyReq.setHeader('host', 'httpbin.org');
});

proxy.on('proxyRes', (proxyRes, req) => {
  let rawBody = Buffer.from('');
  proxyRes.on('data', (data) => {
    rawBody = Buffer.concat([rawBody, data]);
  });
  proxyRes.on('end', () => {
    const body = rawBody.toString();
    saveFixture(req, {
      body,
      statusCode: proxyRes.statusCode,
      headers: proxyRes.headers
    });
  });
});

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://httpbin.org' });
});
server.listen(8888);
