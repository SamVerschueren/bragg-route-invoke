'use strict';
const lambda = require('aws-lambda-invoke');
const methods = {
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

	const options = Object.assign({
		'resource-path': path,
		'http-method': method
	}, opts);

	return lambda[async ? 'invokeAsync' : 'invoke'](fn, options).catch(err => {
		throw new Error(`${method.toUpperCase()} ${fn}::${path} ⇾ ${err.message}`);
	});
}

Object.keys(methods).forEach(method => {
	module.exports[method] = invoke.bind(undefined, method, false);

	if (methods[method] === true) {
		module.exports[`${method}Async`] = invoke.bind(undefined, method, true);
	}
});
