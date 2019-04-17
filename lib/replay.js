const httpProxy = require('http-proxy');
const fs = require('fs');
const { replaceUrl, replaceBody } = require('./replaceReq');

const proxy = httpProxy.createProxyServer({});
const FIXTURES_PATH = 'fixtures.json';

const fixtures = JSON.parse(fs.readFileSync(FIXTURES_PATH));

const loadFixture = ({
  req, body, match
}) => {
  const recordedUrl = replaceUrl(req.url, match);
  const recordedBody = replaceBody({
    body,
    url: req.url,
    contentType: req.headers['content-type'],
  }, match);
  if (!fixtures[recordedUrl] || !fixtures[recordedUrl][recordedBody]) {
    console.error('no fixtures found');
    console.error({ url: recordedUrl, body: recordedBody });
    return undefined;
  }
  return fixtures[recordedUrl][recordedBody];
};

const onReq = ({ host }) => ((req, res) => {
  let rawBody = Buffer.from('');
  req.headers.host = host;
  req.on('data', (data) => {
    rawBody = Buffer.concat([rawBody, data]);
  });
  req.on('end', () => {
    const body = rawBody.toString();
    const fixture = loadFixture({
      req, body, match
    });
    if (fixture) {
      res.writeHead(fixture.statusCode, fixture.headers);
      res.write(fixture.body);
      res.end();
    } else {
      res.writeHead(500);
      res.end();
    }
  });
});

module.exports = { onReq };
