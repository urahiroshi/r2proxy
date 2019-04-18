const fs = require('fs');
const { replaceUrl, replaceBody } = require('./replaceReq');
const { getMode, MODE } = require('./mode');

const FIXTURES_PATH = 'fixtures.json';
let fixtures;
if (getMode() === MODE.REPLAY) {
  fixtures = JSON.parse(fs.readFileSync(FIXTURES_PATH));
} else {
  fixtures = {};
}

const statistics = { hit: 0, miss: 0 };

const getFixture = ({
  url, reqBody, reqHeaders, match
}) => {
  const replacedUrl = replaceUrl(url, match);
  const replacedBody = replaceBody({
    body: reqBody,
    url,
    contentType: reqHeaders['content-type'],
  }, match);
  if (!fixtures[replacedUrl] || !fixtures[replacedUrl][replacedBody]) {
    console.error('no fixtures found');
    console.error({ url: replacedUrl, body: replacedBody });
    statistics.miss += 1;
    return undefined;
  }
  statistics.hit += 1;
  return fixtures[replacedUrl][replacedBody];
};

const addFixture = ({
  url,
  reqBody,
  reqHeaders,
  match,
  status,
  resBody,
  resHeaders,
}) => {
  const replacedUrl = replaceUrl(url, match);
  const replacedBody = replaceBody({
    url,
    body: reqBody,
    contentType: reqHeaders['content-type'],
  }, match);
  if (!fixtures[replacedUrl]) { fixtures[replacedUrl] = {}; }
  if (fixtures[replacedUrl][replacedBody]) {
    // if fixture is already existing, it doesn't update
    statistics.hit += 1;
  } else {
    fixtures[replacedUrl][replacedBody] = { body: resBody, status, headers: resHeaders };
    statistics.miss += 1;
    console.log('save fixture:');
    console.log({ replacedUrl, replacedBody });
  }
};

const fixturesToString = () => {
  return JSON.stringify(fixtures);
}

const saveFixtures = () => {
  fs.writeFileSync(FIXTURES_PATH, fixturesToString());
}

const getStatistics = () => {
  return { ...statistics };
}

module.exports = {
  addFixture, getFixture, fixturesToString, saveFixtures, getStatistics
};
