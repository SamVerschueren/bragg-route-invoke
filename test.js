import test from 'ava';
import sinon from 'sinon';
import 'sinon-as-promised';
import lambda from 'aws-lambda-invoke';
import m from './';

test.before(() => {
	const stub = sinon.stub(lambda, 'invoke');
	stub.withArgs('foo', {'http-method': 'post', 'resource-path': 'bar', 'body': {foo: 'bar'}}).rejects('400 - Bad Request');
	stub.resolves({foo: 'bar'});

	const invokeAsync = sinon.stub(lambda, 'invokeAsync');
	invokeAsync.resolves({foo: 'baz'});
});

test('methods', t => {
	t.ok(m.get);
	t.notOk(m.getAsync);
	t.ok(m.put);
	t.ok(m.putAsync);
	t.ok(m.patch);
	t.ok(m.patchAsync);
	t.ok(m.post);
	t.ok(m.postAsync);
	t.ok(m.delete);
	t.ok(m.deleteAsync);
});

test('error', t => {
	t.throws(m.get(), 'Expected a function name');
	t.throws(m.get('foo'), 'Expected a resource path');
});

test.serial('result', async t => {
	t.same(await m.get('foo', '/foo'), {foo: 'bar'});
});

test.serial('invoke no params', async t => {
	await m.get('foo', '/foo');

	t.is(lambda.invoke.lastCall.args[0], 'foo');
	t.same(lambda.invoke.lastCall.args[1], {
		'resource-path': '/foo',
		'http-method': 'get'
	});
});

test.serial('invoke with params', async t => {
	await m.post('foo', '/foo', {body: {foo: 'bar'}});

	t.is(lambda.invoke.lastCall.args[0], 'foo');
	t.same(lambda.invoke.lastCall.args[1], {
		'resource-path': '/foo',
		'http-method': 'post',
		'body': {
			foo: 'bar'
		}
	});
});

test('invoke async', async t => {
	await m.postAsync('hello', '/world', {body: {foo: 'bar'}});

	t.is(lambda.invokeAsync.lastCall.args[0], 'hello');
	t.same(lambda.invokeAsync.lastCall.args[1], {
		'resource-path': '/world',
		'http-method': 'post',
		'body': {
			foo: 'bar'
		}
	});
});

test.serial('error', async t => {
	t.throws(m.post('foo', 'bar', {body: {foo: 'bar'}}), 'POST foo::bar ⇾ 400 - Bad Request');
});
