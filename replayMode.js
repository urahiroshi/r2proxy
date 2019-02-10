const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

const proxy = httpProxy.createProxyServer({});
const FIXTURES_PATH = 'fixtures.json';

const fixtures = JSON.parse(fs.readFileSync(FIXTURES_PATH));

const loadFixture = (req) => {
  return fixtures[req.url];
};

proxy.on('proxyReq', (proxyReq) => {
  proxyReq.setHeader('host', 'httpbin.org');
});

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
