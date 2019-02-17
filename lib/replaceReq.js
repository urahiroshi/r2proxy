const replaceUrl = (
  url,
  // ignoreQueries: [{ urlRegExp?: string, query: string }]
  { ignoreQueries = [], normalizedHosts = [], normalizedPaths = [] } = {},
) => {
  const urlObj = new URL(url);
  ignoreQueries.forEach(({ urlRegExp, query }) => {
    if (!urlRegExp || urlRegExp.test(url)) {
      urlObj.searchParams.delete(query);
    }
  });
  const normalizedHost = normalizedHosts.find((regExp) => (
    regExp.test(urlObj.host)
  ));
  const host = (
    normalizedHost ?
    urlObj.host.replace(normalizedHost, normalizedHost.source) :
    urlObj.host
  );

  const normalizedPath = normalizedPaths.find((regExp) => (
    regExp.test(urlObj.pathname)
  ));
  const path = (
    normalizedPath ?
    urlObj.pathname.replace(normalizedPath, normalizedPath.source) :
    urlObj.pathname
  );

  return `${urlObj.protocol}//${host}${path}${urlObj.search}`;
};

const replaceBody = (
  { body, url = '', contentType = '' },
  // ignoreKeys: [{ urlRegExp?: string, key: string }]
  { ignoreKeys = [], ignoreUrls = [] } = {}
) => {
  if (ignoreUrls.some((regExp) => regExp.test(url))) {
    return '';
  }
  return ignoreKeys.reduce((nextBody, { urlRegExp, key }) => {
    if (urlRegExp && !urlRegExp.test(url)) { return nextBody; }
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
    } else if (contentType === 'application/x-form-urlencoded') {
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
