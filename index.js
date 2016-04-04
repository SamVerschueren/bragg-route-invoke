'use strict';
var lambda = require('aws-lambda-invoke');
var objectAssign = require('object-assign');
var Promise = require('pinkie-promise');
var methods = {
	get: false,
	put: true,
	patch: true,
	post: true,
	delete: true
};

function invoke(method, async, fn, path, opts) {
	if (typeof fn !== 'string') {
		return Promise.reject(new TypeError('Expected a function name'));
	}

	if (typeof path !== 'string') {
		return Promise.reject(new TypeError('Expected a resource path'));
	}

	var options = objectAssign({
		'resource-path': path,
		'http-method': method
	}, opts);

	return lambda[async ? 'invokeAsync' : 'invoke'](fn, options).catch(function (err) {
		throw new Error(method.toUpperCase() + ' ' + fn + '::' + path + ' ⇾ ' + err.message);
	});
}

Object.keys(methods).forEach(function (method) {
	module.exports[method] = invoke.bind(undefined, method, false);

	if (methods[method] === true) {
		module.exports[method + 'Async'] = invoke.bind(undefined, method, true);
	}
});
