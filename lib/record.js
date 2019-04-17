const httpProxy = require('http-proxy');
const fs = require('fs');
const { replaceUrl, replaceBody } = require('./replaceReq');

const proxy = httpProxy.createProxyServer({});
const FIXTURES_PATH = 'fixtures.json';

const fixtures = {};
// { [srcIp: string]: { [srcPort: string]: { [url: string]: { body: string }}}}
const reqCache = {};

const onExit = (code) => {
  fs.writeFileSync(FIXTURES_PATH, JSON.stringify(fixtures));
  process.exit(code || 0);
}

const saveFixture = (
  req,
  match,
  { body, statusCode, headers },
) => {
  const reqBody = reqCache[req.socket.remoteAddress][req.socket.remotePort][req.url].body;
  const recordingUrl = replaceUrl(req.url, match);
  const recordingBody = replaceBody({
    url: req.url,
    body: reqBody,
    contentType: req.headers['content-type'],
  }, match);
  if (!fixtures[recordingUrl]) { fixtures[recordingUrl] = {}; }
  fixtures[recordingUrl][recordingBody] = { body, statusCode, headers };
  delete reqCache[req.socket.remoteAddress][req.socket.remotePort][req.url];
  console.log('save fixture:');
  console.log({ recordingUrl, recordingBody });
};

const onProxyRes = (match) => {
  proxy.on('proxyRes', (proxyRes, req) => {
    let rawBody = Buffer.from('');
    proxyRes.on('data', (data) => {
      rawBody = Buffer.concat([rawBody, data]);
    });
    proxyRes.on('end', () => {
      const body = rawBody.toString();
      saveFixture(req, match, {
        body,
        statusCode: proxyRes.statusCode,
        headers: proxyRes.headers
      });
    });
  });
};

const onReq = ({ host, target }) => ((req, res) => {
  let rawBody = Buffer.from('');
  req.headers.host = host;
  req.on('data', (data) => {
    rawBody = Buffer.concat([rawBody, data]);
  });
  req.on('end', () => {
    const body = rawBody.toString();
    if (!reqCache[req.socket.remoteAddress]) {
      reqCache[req.socket.remoteAddress] = {};
    }
    reqCache[req.socket.remoteAddress][req.socket.remotePort] = {
      [req.url]: { body },
    };
  });
  proxy.web(req, res, { target });
});

module.exports = { onReq, onProxyRes, onExit };
