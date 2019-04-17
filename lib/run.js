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

process.on('SIGINT', () => {
  execByMode('onExit');
});

process.on('SIGHUP', () => {
  execByMode('onExit');
});

const run = ({
  port, target, adminPort, match = []
}) => {
  execByMode('onProxyRes', match);
  const { host } = new URL(target);
  const server = http.createServer(execByMode('onReq', { host, target, match }));
  server.listen(port);
  const adminServer = http.createServer(admin.onReq);
  adminServer.listen(adminPort);
  console.log('servers running...');
  console.log({ port, adminPort });
};
module.exports = run;
