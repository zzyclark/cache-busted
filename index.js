var cacheBust = module.exports = function cacheBust (options) {
	var defaults = {
		version: null,
		production: false,
		packageLocation: __dirname + '/../../package.json',
		minifiedDir: []
	};

	options = options ? {
		version: options.version || defaults.version,
		packageLocation: options.packageLocation || defaults.packageLocation,
		production: options.packageLocation ? require(options.packageLocation).production : require(defaults.packageLocation).production
		|| defaults.production,
		minifiedDir: options.minifiedDir || defaults.minifiedDir
	} : defaults;

	if (!options.version) {
		try {
			options.version = require(options.packageLocation).version;
		} catch(e) {
			throw(new Error('No version information found. Looked in ' + options.packageLocation));
		}
	}

	var querystring;
	if (options.production) {
		querystring = options.version;
	} else {
		querystring = options.version + '-' + cacheBust.getTimestamp();
	}

	return function (resource, type) {
		if (!options.production) {
			resource = cacheBust.restructUrl(resource, options.minifiedDir);
		}
		type = type || getType(resource);
		if (type === 'js' || type === 'jsx') {
			return '<script src="' + resource + '?v=' + querystring + '"></script>';
		} else if (type === 'css') {
			return '<link rel="stylesheet" href="' + resource + '?v=' + querystring + '" />';
		} else {
			throw new Error('Unknown extension, currently only css, js and jsx are automatically recognized. When using another extension specify either js or css as the second parameter')
		}
	};
};

cacheBust.handler = function handler (app, options) {
	app.locals.cacheBust = cacheBust(options);
};

cacheBust.getTimestamp = function getTimestamp () {
	return new Date().valueOf();
};

cacheBust.restructUrl = function (url, minifiedDir) {
	if (0 === minifiedDir.length) {
		return url;
	} else {
		for (var i = 0, lgh = minifiedDir.length; i < lgh; ++i) {
			if (url.indexOf(minifiedDir[i]) > -1) {
				url = url.replace('.min', '');
				break;
			}
		}
		return url;
	}
};

function getType (resource) {
	var extension = resource.split('.').pop();
	return extension;
}
