const { replaceUrl, replaceBody } = require('./replaceReq');

describe('replaceUrl()', () => {
  const exampleUrl = 'https://example.com/10?hoge=hogehoge&fuga=fugafuga';

  describe('when no options', () => {
    it('url is not changed', () => {
      expect(replaceUrl(exampleUrl)).toEqual(exampleUrl);
    });
  });

  describe('when ignoreQueries is specified', () => {
    it('query string is removed if query is matched', () => {
      expect(replaceUrl(exampleUrl, { ignoreQueries: [
        { query: 'hoge' }
      ]})).toEqual('https://example.com/10?fuga=fugafuga');
    });
    
    it('multiple query string is removed if query is matched', () => {
      expect(replaceUrl(exampleUrl, { ignoreQueries: [
        { query: 'hoge' }, { query: 'fuga' }
      ]})).toEqual('https://example.com/10');
    });

    it('url is not changed if query is not matched', () => {
      expect(replaceUrl(exampleUrl, { ignoreQueries: [
        { query: 'piyo' }
      ]})).toEqual(exampleUrl);
    });

    it('query string is removed if urlRegExp is matched', () => {
      expect(replaceUrl(exampleUrl, { ignoreQueries: [
        { query: 'hoge', urlRegExp: /https:\/\/example\.com\/.*/ }
      ]})).toEqual('https://example.com/10?fuga=fugafuga');
    });

    it('url is not changed if urlRegExp is not matched', () => {
      expect(replaceUrl(exampleUrl, { ignoreQueries: [
        { query: 'hoge', urlRegExp: /https:\/\/example\.net\/.*/ }
      ]})).toEqual(exampleUrl);
    });
  });

  describe('when normalizedHosts is specified', () => {
    it('host is normalized if normalizedHosts includes it', () => {
      const normalizedHost = /example\.[^\.]+$/;
      expect(replaceUrl(exampleUrl, { normalizedHosts: [
        normalizedHost
      ]})).toEqual(`https://${normalizedHost.source}/10?hoge=hogehoge&fuga=fugafuga`);
    });

    it('host is not normalized if normalizedHosts does not include it', () => {
      const normalizedHost = /\.example\.[^\.]+$/;
      expect(replaceUrl(exampleUrl, { normalizedHosts: [
        normalizedHost
      ]})).toEqual(exampleUrl);
    });
  });

  describe('when normalizedPaths is specified', () => {
    it('host is normalized if normalizedPaths includes it', () => {
      const normalizedPath = /[0-9]+/;
      expect(replaceUrl(exampleUrl, { normalizedPaths: [
        normalizedPath
      ]})).toEqual(`https://example.com/${normalizedPath.source}?hoge=hogehoge&fuga=fugafuga`);
    });

    it('host is not normalized if normalizedPaths does not include it', () => {
      const normalizedPath = /a[0-9]+/;
      expect(replaceUrl(exampleUrl, { normalizedPaths: [
        normalizedPath
      ]})).toEqual(exampleUrl);
    });
  });
});

describe('replaceBody()', () => {
  const jsonRequest = {
    body: JSON.stringify({
      hoge: 'hogehoge',
      fuga: 'fugafuga',
    }),
    contentType: 'application/json',
    url: 'https://example.com/10',
  };
  describe('when no options', () => {
    it('body is not changed', () => {
      expect(replaceBody(jsonRequest)).toEqual(jsonRequest.body);
    });
  });

  describe('when ignoreKeys is specified', () => {
    describe('contentType is application/json', () => {
      it('key is removed if ignoreKeys includes it', () => {
        expect(replaceBody(jsonRequest, { ignoreKeys: [
          { key: 'hoge' }
        ]})).toEqual(JSON.stringify({ fuga: 'fugafuga' }));
      });
      
      it('multiple key is removed if ignoreKeys inclues them', () => {
        expect(replaceBody(jsonRequest, { ignoreKeys: [
          { key: 'hoge' }, { key: 'fuga' }
        ]})).toEqual(JSON.stringify({}));
      });
  
      it('key is not removed if ignoreKeys does not include it', () => {
        expect(replaceBody(jsonRequest, { ignoreKeys: [
          { key: 'piyo' }
        ]})).toEqual(jsonRequest.body);
      });
  
      it('key is removed if urlRegExp is matched', () => {
        expect(replaceBody(jsonRequest, { ignoreKeys: [
          { key: 'hoge', urlRegExp: /example\.com\/[0-9]+/ }
        ]})).toEqual(JSON.stringify({ fuga: 'fugafuga' }));
      });
  
      it('key is not removed if urlRegExp is not matched', () => {
        expect(replaceBody(jsonRequest, { ignoreKeys: [
          { key: 'hoge', urlRegExp: /example\.com\/[a-z]+/ }
        ]})).toEqual(jsonRequest.body);
      });
    });

    describe('contentType is application/x-form-urlencoded', () => {
      const formRequest = {
        body: 'hoge=hogehoge&fuga=fugafuga',
        contentType: 'application/x-form-urlencoded',
        url: 'https://example.com/10',
      };
      it('key is removed if ignoreKeys includes it', () => {
        expect(replaceBody(formRequest, { ignoreKeys: [
          { key: 'hoge' }
        ]})).toEqual('fuga=fugafuga');
      });
      
      it('multiple key is removed if ignoreKeys inclues them', () => {
        expect(replaceBody(formRequest, { ignoreKeys: [
          { key: 'hoge' }, { key: 'fuga' }
        ]})).toEqual('');
      });
  
      it('key is not removed if ignoreKeys does not include it', () => {
        expect(replaceBody(formRequest, { ignoreKeys: [
          { key: 'piyo' }
        ]})).toEqual(formRequest.body);
      });
    });
  });

  describe('when ignoreUrls is specified', () => {
    it('body becomes empty if ignoreUrls includes url', () => {
      expect(replaceBody(jsonRequest, { ignoreUrls: [
        /https:\/\/example\.com\/.*/
      ]})).toEqual('');
    });

    it('body is not changed if ignoreUrls does not include url', () => {
      expect(replaceBody(jsonRequest, { ignoreUrls: [
        /https:\/\/example\.net\/.*/
      ]})).toEqual(jsonRequest.body);
    });
  });
});
