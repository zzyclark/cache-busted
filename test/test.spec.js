var cacheBust = require('../');
var express = require('express');
var assert = require('assert');
var mocha = require('mocha');
var sinon = require('sinon');

describe('cacheBust', function () {
	beforeEach(function () {
		this.sandbox = sinon.sandbox.create();
		this.sandbox.stub(cacheBust, 'getTimestamp').returns('12345');
	});

	afterEach(function () {
		this.sandbox.restore();
	});

	describe('express integration', function () {
		it('should set app locals', function () {
			var app = { locals: {} };
			var handlerFn = cacheBust.handler(app, { packageLocation: './test/package-test.json' });
			assert.equal(typeof app.locals.cacheBust, 'function');
		});
	});

	describe('default production set to false', function () {
		it('should not append a timestamp', function () {
			var fn = cacheBust({ packageLocation: './test/package-test-dev.json' });
			var out = fn('/scripts/app.js');
			assert.equal(out, '<script src="/scripts/app.js?v=1.0.0" type="text/javascript"></script>');
		});
	});

	it('should generate a script tag for js files', function () {
		var fn = cacheBust({ packageLocation: './test/package-test.json' });
		var out = fn('/scripts/app.js');
		assert.equal(out, '<script src="/scripts/app.js?v=1.0.0-12345" type="text/javascript"></script>');
	});

	it('should generate a script tag for jsx files', function () {
		var fn = cacheBust({ packageLocation: './test/package-test.json' });
		var out = fn('/scripts/app.jsx');
		assert.equal(out, '<script src="/scripts/app.jsx?v=1.0.0-12345" type="text/javascript"></script>');
	});

	it('should generate a link tag for css files', function () {
		var fn = cacheBust({ packageLocation: './test/package-test.json' });
		var out = fn('/scripts/style.css');
		assert.equal(out, '<link rel="stylesheet" href="/scripts/style.css?v=1.0.0-12345" type="text/css"/>');
	});

	it('should use a type argument if given', function () {
		var fn = cacheBust({ packageLocation: './test/package-test.json' });
		var out = fn('/scripts/app', 'js');
		assert.equal(out, '<script src="/scripts/app?v=1.0.0-12345" type="text/javascript"></script>');
	});
});
