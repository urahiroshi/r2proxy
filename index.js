const http = require('http');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

const fixtures = {};

const cloneRes = ({ body, statusCode, headers }) => ({ body, statusCode, headers });

const saveFixture = (req, { body, statusCode, headers }) => {
  fixtures[req.url] = { body, statusCode, headers };
  console.log('save fixture:');
  console.log(fixtures[req.url]);
};

const loadFixture = (req) => {
  return fixtures[req.url];
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
})

const server = http.createServer((req, res) => {
  const fixture = loadFixture(req);
  if (fixture) {
    console.log('load fixture:');
    console.log(fixtures[req.url]);
    res.writeHead(fixture.statusCode, fixture.headers);
    res.write(fixture.body);
    res.end();
  } else {
    proxy.web(req, res, { target: 'http://httpbin.org' });
  }
});
server.listen(8888);
