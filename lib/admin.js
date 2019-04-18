const { fixturesToString, getStatistics } = require('./fixture');
const { setMode, getMode } = require('./mode');

const route = ({ url, method, body }) => {
  if (url === '/fixtures' && method === 'GET') {
    return fixturesToString();
  } else if (url === '/statistics' && method === 'GET') {
    return getStatistics();
  } else if (url === '/configuration' && method === 'GET') {
    return { mode: getMode() };
  } else if (url === '/configuration' && method === 'PUT') {
    const mode = JSON.parse(body).mode;
    setMode(mode);
    return { mode: getMode() };
  }
  return undefined;
}

const returnRes = ({ res, body, status }) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.write(((typeof body === 'string') ? body : JSON.stringify(body)) + '\n');
  res.end();
};

const onReq = ((req, res) => {
  let rawBody = Buffer.from('');
  req.on('data', (data) => {
    rawBody = Buffer.concat([rawBody, data]);
  });
  req.on('end', () => {
    try {
      const body = rawBody.toString();
      const resBody = route({ url: req.url, method: req.method, body });
      if (!resBody) {
        returnRes({ res, body: { error: 'not found' }, status: 404 });
      } else {
        returnRes({ res, body: resBody, status: 200 });
      }
    } catch (err) {
      console.error(err);
      returnRes({ res, body: { error: 'internal error' }, status: 500 });
    }
  });
});

module.exports = { onReq };
