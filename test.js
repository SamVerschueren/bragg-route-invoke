import test from 'ava';
import sinon from 'sinon';
import 'sinon-as-promised';
import lambda from 'aws-lambda-invoke';
import m from './';

test.before(() => {
	const stub = sinon.stub(lambda, 'invoke');
	stub.withArgs('foo', {'http-method': 'post', 'resource-path': 'bar', 'body': {foo: 'bar'}}).rejects('400 - Bad Request');
	stub.resolves({foo: 'bar'});
});

test.after(() => {
	lambda.invoke.restore();
});

test('methods exists', t => {
	t.ok(m.get);
	t.ok(m.put);
	t.ok(m.patch);
	t.ok(m.post);
	t.ok(m.delete);
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

test.serial('error', async t => {
	t.throws(m.post('foo', 'bar', {body: {foo: 'bar'}}), 'POST foo::bar ⇾ 400 - Bad Request');
});
