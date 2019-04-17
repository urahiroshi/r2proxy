const { getFixture } = require('./fixture');

const onReq = ({ host, match }) => ((req, res) => {
  let rawBody = Buffer.from('');
  req.headers.host = host;
  req.on('data', (data) => {
    rawBody = Buffer.concat([rawBody, data]);
  });
  req.on('end', () => {
    const body = rawBody.toString();
    const fixture = getFixture({
      url: req.url,
      reqBody: body,
      reqHeaders: req.headers,
      match,
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
