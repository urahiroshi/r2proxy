const { replaceUrl, replaceBody } = require('./replaceReq');

describe('replaceUrl()', () => {
  const exampleUrl = 'https://example.com/10?hoge=hogehoge&fuga=fugafuga';
  const defaultPath = '/10?hoge=hogehoge&fuga=fugafuga';

  describe('when no options', () => {
    it('url is not changed', () => {
      expect(replaceUrl(exampleUrl)).toEqual(defaultPath);
    });
  });

  describe('when string path is matched', () => {
    it('query is removed if ignoreKeys is matched', () => {
      expect(replaceUrl(exampleUrl, [
        { path: '/10', query: { ignoreKeys: ['hoge'] }},
      ])).toEqual('/10?fuga=fugafuga');
    });
    
    it('multiple queries are removed if ignoreKeys are matched', () => {
      expect(replaceUrl(exampleUrl, [
        { path: '/10', query: { ignoreKeys: ['hoge', 'fuga'] }},
      ])).toEqual('/10');
    });

    it('url is not changed if ignoreKeys is not matched', () => {
      expect(replaceUrl(exampleUrl, [
        { path: '/10', query: { ignoreKeys: ['piyo'] }},
      ])).toEqual(defaultPath);
    });

    it('all queries are removed if ignore=true', () => {
      expect(replaceUrl(exampleUrl, [
        { path: '/10', query: { ignore: true }},
      ])).toEqual('/10');
    })
  });

  describe('when RegExp path is matched', () => {
    it('path is replaced if no other options are specified', () => {
      expect(replaceUrl(exampleUrl, [
        { path: /.*/ },
      ])).toEqual('.*?hoge=hogehoge&fuga=fugafuga');
    });

    it('query is removed if ignoreKeys is matched', () => {
      expect(replaceUrl(exampleUrl, [
        { path: /.*/, query: { ignoreKeys: ['hoge'] }},
      ])).toEqual('.*?fuga=fugafuga');
    });
    
    it('multiple queries are removed if ignoreKeys are matched', () => {
      expect(replaceUrl(exampleUrl, [
        { path: /.*/, query: { ignoreKeys: ['hoge', 'fuga'] }},
      ])).toEqual('.*');
    });

    it('all queries are removed if ignore=true', () => {
      expect(replaceUrl(exampleUrl, [
        { path: /.*/, query: { ignore: true }},
      ])).toEqual('.*');
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

  describe('when string path is matched', () => {
    describe('contentType is application/json', () => {
      it('key is removed if ignoreKeys includes it', () => {
        expect(replaceBody(jsonRequest, [
          { path: '/10', body: { ignoreKeys: ['hoge'] }},
        ])).toEqual(JSON.stringify({ fuga: 'fugafuga' }));
      });
      
      it('multiple key is removed if ignoreKeys inclues them', () => {
        expect(replaceBody(jsonRequest, [
          { path: '/10', body: { ignoreKeys: ['hoge', 'fuga'] }},
        ])).toEqual(JSON.stringify({}));
      });
  
      it('key is not removed if ignoreKeys does not include it', () => {
        expect(replaceBody(jsonRequest, [
          { path: '/10', body: { ignoreKeys: ['piyo'] }},
        ])).toEqual(jsonRequest.body);
      });
  
      it('body is ignored if ingore=true', () => {
        expect(replaceBody(jsonRequest, [
          { path: '/10', body: { ignore: true }},
        ])).toEqual('');
      });
    });

    describe('contentType is application/x-form-urlencoded', () => {
      const formRequest = {
        body: 'hoge=hogehoge&fuga=fugafuga',
        contentType: 'application/x-form-urlencoded',
        url: 'https://example.com/10',
      };
      it('key is removed if ignoreKeys includes it', () => {
        expect(replaceBody(formRequest, [
          { path: '/10', body: { ignoreKeys: ['hoge'] }},
        ])).toEqual('fuga=fugafuga');
      });
      
      it('multiple key is removed if ignoreKeys inclues them', () => {
        expect(replaceBody(formRequest, [
          { path: '/10', body: { ignoreKeys: ['hoge', 'fuga'] }},
        ])).toEqual('');
      });
  
      it('key is not removed if ignoreKeys does not include it', () => {
        expect(replaceBody(formRequest, [
          { path: '/10', body: { ignoreKeys: ['piyo'] }},
        ])).toEqual(formRequest.body);
      });

      it('body is ignored if ignore=true', () => {
        expect(replaceBody(formRequest, [
          { path: '/10', body: { ignore: true }},
        ])).toEqual('');
      });
    });
  });

  describe('when RegExp path is matched', () => {
    it('key is removed if ignoreKeys includes it', () => {
      expect(replaceBody(jsonRequest, [
        { path: /.*/, body: { ignoreKeys: ['hoge'] }},
      ])).toEqual(JSON.stringify({ fuga: 'fugafuga' }));
    });
    
    it('multiple key is removed if ignoreKeys inclues them', () => {
      expect(replaceBody(jsonRequest, [
        { path: /.*/, body: { ignoreKeys: ['hoge', 'fuga'] }},
      ])).toEqual(JSON.stringify({}));
    });

    it('key is not removed if ignoreKeys does not include it', () => {
      expect(replaceBody(jsonRequest, [
        { path: /.*/, body: { ignoreKeys: ['piyo'] }},
      ])).toEqual(jsonRequest.body);
    });

    it('body is ignored if ingore=true', () => {
      expect(replaceBody(jsonRequest, [
        { path: /.*/, body: { ignore: true }},
      ])).toEqual('');
    });
  });
});
