'use strict';
const lambda = require('aws-lambda-invoke');

const methods = {
	get: false,
	put: true,
	patch: true,
	post: true,
	delete: true
};

function parseError(err) {
	if (!err && !err.message) {
		return err;
	}

	const split = err.message.split(' - ');
	const status = split[0];
	const message = split[1];

	if (isNaN(status)) {
		return err;
	}

	const error = new Error(message);
	error.status = parseInt(status, 10);

	return error;
}

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

	return lambda[async ? 'invokeAsync' : 'invoke'](fn, options).then(result => {
		if (result.body && result.headers && result.statusCode) {
			try {
				return JSON.parse(result.body);
			} catch (error) {
				return result.body;
			}
		}

		return result;
	}).catch(error => {
		const parsedError = parseError(error);
		parsedError.httpMethod = method.toUpperCase();
		parsedError.function = fn;
		parsedError.path = path;

		throw parsedError;
	});
}

Object.keys(methods).forEach(method => {
	module.exports[method] = invoke.bind(undefined, method, false);

	if (methods[method] === true) {
		module.exports[`${method}Async`] = invoke.bind(undefined, method, true);
	}
});
