import test from 'ava';
import sinon from 'sinon';
import 'sinon-as-promised';					// eslint-disable-line import/no-unassigned-import
import lambda from 'aws-lambda-invoke';
import m from './';

test.before(() => {
	const stub = sinon.stub(lambda, 'invoke');
	stub.withArgs('foo', {'http-method': 'post', 'resource-path': 'bar', body: {foo: 'bar'}}).rejects('400 - Bad Request');
	stub.withArgs('foo', {'http-method': 'post', 'resource-path': 'baz', body: {foo: 'baz'}}).rejects('Something went wrong');
	stub.resolves({foo: 'bar'});

	const invokeAsync = sinon.stub(lambda, 'invokeAsync');
	invokeAsync.resolves({foo: 'baz'});
});

test('methods', t => {
	t.truthy(m.get);
	t.falsy(m.getAsync);
	t.truthy(m.put);
	t.truthy(m.putAsync);
	t.truthy(m.patch);
	t.truthy(m.patchAsync);
	t.truthy(m.post);
	t.truthy(m.postAsync);
	t.truthy(m.delete);
	t.truthy(m.deleteAsync);
});

test('error', async t => {
	await t.throws(m.get(), 'Expected a function name');
	await t.throws(m.get('foo'), 'Expected a resource path');
});

test('result', async t => {
	t.deepEqual(await m.get('foo', '/foo'), {foo: 'bar'});
});

test.serial('invoke no params', async t => {
	await m.get('foo', '/foo');

	t.is(lambda.invoke.lastCall.args[0], 'foo');
	t.deepEqual(lambda.invoke.lastCall.args[1], {
		'resource-path': '/foo',
		'http-method': 'get'
	});
});

test.serial('invoke with params', async t => {
	await m.post('foo', '/foo', {body: {foo: 'bar'}});

	t.is(lambda.invoke.lastCall.args[0], 'foo');
	t.deepEqual(lambda.invoke.lastCall.args[1], {
		'resource-path': '/foo',
		'http-method': 'post',
		body: {
			foo: 'bar'
		}
	});
});

test.serial('invoke async', async t => {
	await m.postAsync('hello', '/world', {body: {foo: 'bar'}});

	t.is(lambda.invokeAsync.lastCall.args[0], 'hello');
	t.deepEqual(lambda.invokeAsync.lastCall.args[1], {
		'resource-path': '/world',
		'http-method': 'post',
		body: {
			foo: 'bar'
		}
	});
});

test('remote error', async t => {
	try {
		await m.post('foo', 'bar', {body: {foo: 'bar'}});
		t.fail('Expected to throw an error');
	} catch (err) {
		t.is(err.message, 'Bad Request');
		t.is(err.status, 400);
		t.is(err.httpMethod, 'POST');
		t.is(err.function, 'foo');
		t.is(err.path, 'bar');
	}
});

test('remote error without status code', async t => {
	try {
		await m.post('foo', 'baz', {body: {foo: 'baz'}});
		t.fail('Expected to throw an error');
	} catch (err) {
		t.is(err.message, 'Something went wrong');
		t.is(err.httpMethod, 'POST');
		t.is(err.function, 'foo');
		t.is(err.path, 'baz');
	}
});
