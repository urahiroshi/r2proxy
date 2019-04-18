const defaultMatchObject = [
  {
    // path: '.*',
    // samePath: false,
    // query: {
    //   ignoreKeys: [],
    //   ignore: false,
    // },
    // body: {
    //   ignoreKeys: [],
    //   ignore: false,
    // },
  }
];

const getMatchedObjs = (urlObj, match) => {
  return match.filter(({path}) => {
    if (!path) {
      return true;
    }
    if (!path.test) {
      // path is not RegExp
      return path === urlObj.pathname;
    } else {
      // path is RegExp
      return path.test(urlObj.pathname);
    }
  });
}

const replaceUrl = (
  url,
  match = defaultMatchObject,
) => {
  // "url" may not contain scheme and FQDN and this method don't use them, so it inserts dummy values
  const urlObj = new URL(url, 'http://127.0.0.1');
  const matchedObjs = getMatchedObjs(urlObj, match);

  let urlPath = urlObj.pathname;
  matchedObjs.forEach((matchedObj) => {
    const { path = /.*/, samePath = false, query } = matchedObj;
    if (samePath && path.test) {
      urlPath = urlObj.pathname.replace(path, path.source);
    }
    if (query && query.ignore) {
      Array.from(urlObj.searchParams.keys()).forEach((key => {
        urlObj.searchParams.delete(key);
      }));
    } else {
      const queryIgnoreKeys = (query && query.ignoreKeys) ? query.ignoreKeys : [];
      queryIgnoreKeys.forEach((key) => {
        urlObj.searchParams.delete(key);
      });
    }
  });

  return `${urlPath}${urlObj.search}`;
};

const replaceBody = (
  { body, url = '', contentType = '' },
  match = defaultMatchObject,
) => {
  const urlObj = new URL(url, 'http://127.0.0.1');
  const matchedObjs = getMatchedObjs(urlObj, match);

  if (matchedObjs.some(matchedObj => matchedObj.body && matchedObj.body.ignore)) {
    return '';
  }

  const ignoreKeys = matchedObjs.reduce((keys, matched) => {
    return keys.concat((matched.body && matched.body.ignoreKeys) ? matched.body.ignoreKeys : [])
  }, []);
  return ignoreKeys.reduce((nextBody, key) => {
    if (contentType === 'application/json') {
      const bodyObj = JSON.parse(nextBody);
      const keys = key.split('.');
      keys.reduce((obj, k, index) => {
        if (index === keys.length - 1) {
          if (k in obj) { delete obj[k]; }
        } else {
          if (k in obj) { return obj[k]; }
        }
        return {};
      }, bodyObj);
      return JSON.stringify(bodyObj);
    } else if (contentType === 'application/x-www-form-urlencoded') {
      const searchParams = new URLSearchParams(nextBody);
      searchParams.delete(key);
      return searchParams.toString();
    }
  }, body);
};

module.exports = {
  replaceUrl,
  replaceBody,
};
