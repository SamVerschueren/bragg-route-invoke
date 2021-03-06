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
		err.expose = true;

		return err;
	}

	const error = new Error(message);
	error.status = parseInt(status, 10);
	error.expose = true;

	return error;
}

function parseBody(result) {
	if (result.headers && result.headers['Content-Type'] === 'application/json') {
		try {
			result.body = JSON.parse(result.body);
		} catch (_) {
			// Do nothing
		}
	}

	return result;
}

function invoke(httpMethod, async, fn, path, opts) {
	opts = opts || {};

	if (typeof fn !== 'string') {
		return Promise.reject(new TypeError('Expected a function name'));
	}

	if (typeof path !== 'string') {
		return Promise.reject(new TypeError('Expected a resource path'));
	}

	const queryStringParameters = opts.query;
	const identity = opts.identity; // eslint-disable-line prefer-destructuring
	const requestContext = Object.assign({}, opts.requestContext, {identity});
	delete opts.query;
	delete opts.identity;
	delete opts.requestContext;

	const options = Object.assign({
		path,
		httpMethod,
		queryStringParameters,
		requestContext
	}, opts);

	return lambda[async ? 'invokeAsync' : 'invoke'](fn, options)
		.then(result => {
			if (result.statusCode >= 400) {
				const error = new Error(result.body);
				error.status = result.statusCode;
				error.httpMethod = httpMethod.toUpperCase();
				error.function = fn;
				error.path = path;
				error.expose = true;

				throw error;
			}

			return parseBody(result);
		})
		.catch(err => {
			const error = parseError(err);
			error.httpMethod = httpMethod.toUpperCase();
			error.function = fn;
			error.path = path;

			throw error;
		});
}

Object.keys(methods).forEach(method => {
	module.exports[method] = invoke.bind(undefined, method, false);

	if (methods[method] === true) {
		module.exports[`${method}Async`] = invoke.bind(undefined, method, true);
	}
});
