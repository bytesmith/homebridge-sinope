'use strict';

var _require = require('./request'),
    httpAction = _require.httpAction,
    sessionOption = _require.sessionOption;

var R = require('ramda');

var uri = ['https://neviweb.com/api'];
var urlComposer = R.compose(R.join('/'), R.concat);

function request(params) {
  var method = params.method,
      url = params.url,
      path = params.path,
      body = params.body,
      queryString = params.queryString,
      sessionId = params.sessionId;


  var httpRequest = sessionId ? sessionOption(sessionId) : httpAction;
  var httpOptions = {
    qs: queryString,
    body: body
  };
  var sinopeUrl = url ? url : urlComposer(uri, path);

  return httpRequest(method, sinopeUrl, httpOptions);
}

module.exports = {
  request: request
};
