const r2proxy = require('..');

r2proxy.run({
  port: 8888,
  target: 'http://httpbin.org',
  adminPort: 8889,
});
