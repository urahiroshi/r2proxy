const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

const proxy = httpProxy.createProxyServer({});
const FIXTURES_PATH = 'fixtures.json';

const fixtures = JSON.parse(fs.readFileSync(FIXTURES_PATH));

const loadFixture = ({ req, body }) => {
  return fixtures[req.url][body];
};

const run = ({ port, target }) => {
  console.log('start replay...');
  const { host } = new URL(target);
  const server = http.createServer((req, res) => {
    let rawBody = Buffer.from('');
    req.headers.host = host;
    req.on('data', (data) => {
      rawBody = Buffer.concat([rawBody, data]);
    });
    req.on('end', () => {
      const body = rawBody.toString();
      const fixture = loadFixture({ req, body });
      if (fixture) {
        console.log('load fixture:');
        console.log(fixture);
        res.writeHead(fixture.statusCode, fixture.headers);
        res.write(fixture.body);
        res.end();
      } else {
        proxy.web(req, res, { target });
      }
    });
  });
  server.listen(port);
};
module.exports = run;
