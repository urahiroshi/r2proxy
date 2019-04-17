const httpProxy = require('http-proxy');
const { addFixture, saveFixtures } = require('./fixture');

const proxy = httpProxy.createProxyServer({});

// { [srcIp: string]: { [srcPort: string]: { [url: string]: { body: string }}}}
const reqCache = {};

const onExit = (code) => {
  saveFixtures();
  process.exit(code || 0);
}

const onProxyRes = (match) => {
  proxy.on('proxyRes', (proxyRes, req) => {
    let rawBody = Buffer.from('');
    proxyRes.on('data', (data) => {
      rawBody = Buffer.concat([rawBody, data]);
    });
    proxyRes.on('end', () => {
      const body = rawBody.toString();
      const reqBody = reqCache[req.socket.remoteAddress][req.socket.remotePort][req.url].body;
      addFixture({
        url: req.url,
        reqBody,
        reqHeaders: req.headers,
        match,
        status: proxyRes.statusCode,
        resBody: body,
        resHeaders: proxyRes.headers,
      });
      delete reqCache[req.socket.remoteAddress][req.socket.remotePort][req.url];
      console.log('save fixture:');
      console.log({ recordingUrl, recordingBody });
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
