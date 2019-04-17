const http = require('http');
const replay = require('./replay');
const record = require('./record');

const execByMode = (method, args...) => {
  const mode = process.env.MODE;
  if (mode === 'replay') {
    replay[method](...args);
  } else if (mode === 'record') {
    record[method](...args);
  }
}

process.on('SIGINT', () => {
  execByMode('onExit');
});

process.on('SIGHUP', () => {
  execByMode('onExit');
});

const run = ({
  port, target, match = {}
}) => {
  execByMode('onProxyRes', match);
  const { host } = new URL(target);
  const server = http.createServer(execByMode('onReq', { host, target });
  server.listen(port);
};
module.exports = run;
