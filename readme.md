# bragg-route-invoke [![Build Status](https://travis-ci.org/SamVerschueren/bragg-route-invoke.svg?branch=master)](https://travis-ci.org/SamVerschueren/bragg-route-invoke)

> Invoke [bragg routes](https://github.com/SamVerschueren/bragg-router) in a lambda function.


## Install

```
$ npm install --save bragg-route-invoke
```


## Usage

```js
const invoke = require('bragg-route-invoke');

invoke.get('myFunction', '/foo/{bar}', {params: {bar: 'bar'}}).then(result => {
	// handle result
});

invoke.post('myFunction', '/foo', {body: {foo: 'bar'}}).then(() => {
	// resource created
});

invoke.postAsync('myFunction', '/foo', {body: {foo: 'bar'}}).then(() => {
	// don't wait for the target function to be executed
});
```


## API

### invoke.get(fn, path, [options])

### invoke.put(fn, path, [options])

### invoke.putAsync(fn, path, [options])

### invoke.patch(fn, path, [options])

### invoke.patchAsync(fn, path, [options])

### invoke.post(fn, path, [options])

### invoke.postAsync(fn, path, [options])

### invoke.delete(fn, path, [options])

### invoke.deleteAsync(fn, path, [options])

#### fn

Type: `string`

Lambda function name that should be invoked.

#### path

Type: `string`

Resource path of the function defined by the [router](https://github.com/SamVerschueren/bragg-router).

#### options

##### body

Type: `object`

Body of the request.

##### params

Type: `object`

Params of the request.

##### query

Type: `object`

Query string of the request.

##### identity

Type: `object`

Identity of the request.


## Related

- [aws-lambda-invoke](https://github.com/SamVerschueren/aws-lambda-invoke) - API for this module.


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
