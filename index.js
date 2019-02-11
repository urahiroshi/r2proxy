const MODE = process.env.MODE || 'record';

let run;
if (MODE === 'record') {
  run = require('./lib/record');
} else if (MODE === 'replay') {
  run = require('./lib/replay');
}
module.exports = { run };
