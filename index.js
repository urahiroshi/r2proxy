const MODE = process.env.MODE || 'record';

if (MODE === 'record') {
  require('./recordMode');
} else if (MODE === 'replay') {
  require('./replayMode');
}
