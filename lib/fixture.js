const fs = require('fs');
const { replaceUrl, replaceBody } = require('./replaceReq');

const FIXTURES_PATH = 'fixtures.json';
let fixtures
try {
  fixtures = JSON.parse(fs.readFileSync(FIXTURES_PATH));
} catch (_) {
  console.log(`${FIXTURES_PATH} isn't found`);
  fixtures = {};
}

const getFixture = ({
  url, reqBody, reqHeaders, match
}) => {
  const replacedUrl = replaceUrl(url, match);
  const replacedBody = replaceBody({
    reqBody,
    url,
    contentType: reqHeaders['content-type'],
  }, match);
  if (!fixtures[replacedUrl] || !fixtures[replacedUrl][replacedBody]) {
    console.error('no fixtures found');
    console.error({ url: replacedUrl, body: replacedBody });
    return undefined;
  }
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
  fixtures[replacedUrl][replacedBody] = { resBody, status, resHeaders };
  console.log('save fixture:');
  console.log({ recordingUrl, recordingBody });
};

const fixturesToString = () => {
  return JSON.stringify(fixtures);
}

const saveFixtures = () => {
  fs.writeFileSync(FIXTURES_PATH, fixturesToString());
}

module.exports = {
  addFixture, getFixture, fixturesToString, saveFixtures
};
