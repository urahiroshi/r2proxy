const http = require('http');
const replay = require('./replay');
const record = require('./record');
const admin = require('./admin');
const { getMode, MODE } = require('./mode');

const execByMode = (methodName, ...args) => {
  let method = (getMode() === MODE.REPLAY) ? replay[methodName] : record[methodName];
  if (!method) {
    method = () => {};
  }
  return method(...args);
}

const run = ({
  port, target, adminPort, match = []
}) => {
  // replay => record doesn't work because this method is not worked when mode is changed now
  execByMode('onProxyRes', match);
  const { host } = new URL(target);
  const server = http.createServer((req, res) => {
    execByMode('onReq', req, res, { host, target, match });
  });
  server.listen(port);
  const adminServer = http.createServer(admin.onReq);
  adminServer.listen(adminPort);
  console.log('servers running...');
  console.log({ port, adminPort });
};
module.exports = run;
