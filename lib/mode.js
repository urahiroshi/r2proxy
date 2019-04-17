let mode = process.env.MODE || 'record';

const MODE = {
  REPLAY: 'replay',
  RECORD: 'record',
};
Object.freeze(MODE);

const getMode = () => {
  return mode;
}

const setMode = (value) => {
  mode = value;
}

module.exports = { getMode, setMode, MODE };
