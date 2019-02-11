const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

const proxy = httpProxy.createProxyServer({});
const FIXTURES_PATH = 'fixtures.json';

const fixtures = {};
// { [srcIp: string]: { [srcPort: string]: { [url: string]: { body: string }}}}
const reqCache = {};

const exit = (code) => {
  fs.writeFileSync(FIXTURES_PATH, JSON.stringify(fixtures));
  process.exit(code || 0);
}

process.on('SIGINT', () => {
  exit();
});

process.on('SIGHUP', () => {
  exit();
});

const saveFixture = (req, { body, statusCode, headers }) => {
  const reqBody = reqCache[req.socket.remoteAddress][req.socket.remotePort][req.url].body;
  if (!fixtures[req.url]) { fixtures[req.url] = {}; }
  fixtures[req.url][reqBody] = { body, statusCode, headers };
  delete reqCache[req.socket.remoteAddress][req.socket.remotePort][req.url];
  console.log('save fixture:');
  console.log(fixtures[req.url]);
};

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

const run = ({ port, target }) => {
  console.log('start recording...');
  const { host } = new URL(target);
  const server = http.createServer((req, res) => {
    let rawBody = Buffer.from('');
    req.headers.host = host;
    req.on('data', (data) => {
      rawBody = Buffer.concat([rawBody, data]);
    });
    req.on('end', () => {
      const body = rawBody.toString();
      reqCache[req.socket.remoteAddress] = {
        [req.socket.remotePort]: {
          [req.url]: { body },
        } 
      };
    });
    proxy.web(req, res, { target });
  });
  server.listen(port);
};
module.exports = run;
