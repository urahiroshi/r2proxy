const http = require('http');
const replay = require('./replay');
const record = require('./record');
const admin = require('./admin');

const execByMode = (method, ...args) => {
  const mode = process.env.MODE;
  if (mode === 'replay') {
    return replay[method](...args);
  } else {
    return record[method](...args);
  }
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
