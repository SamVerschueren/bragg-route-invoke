'use strict';
var lambda = require('aws-lambda-invoke');
var Promise = require('pinkie-promise');
var methods = [
	'GET',
	'PUT',
	'PATCH',
	'POST',
	'DELETE'
];

methods.forEach(function (method) {
	method = method.toLowerCase();

	module.exports[method] = function (fn, path, opts) {
		if (typeof fn !== 'string') {
			return Promise.reject(new TypeError('Expected a function name'));
		}

		if (typeof path !== 'string') {
			return Promise.reject(new TypeError('Expected a resource path'));
		}

		opts = opts || {};
		opts['resource-path'] = path;
		opts['http-method'] = method;

		return lambda.invoke(fn, opts);
	};
});
