version: 0.15;

(function(debuggableRun, simpleRun, getGlobal){
'use strict';

// Link.js parser stub

var parseSource = typeof require !== 'undefined' ? require('../Library/link.js').parse : null;

// Modes

var staticMode = false, es5mode;

if (Object.defineProperties){
	Object.defineProperties(es5mode = {}, {
		supported: { get: function(){ return true; } }
	});
	eval('var es5mode={}');
	es5mode = !!es5mode.supported;
}

// Source code suffix branding (necessary for debugging)
var sourceCodeBranding = '\n\n// Loaded by Link.js //@ sourceURL=',
	strictModeBranding = '\n\neval( Loaded_by_Link.js )//@ sourceURL=';

// Execution

var global = getGlobal() || {}, testObject = {}, hop = testObject.hasOwnProperty, undefined = testObject.undefined;

function execute(module){
	if (!module) error('preloadFailed');

	var exports = module.exports, url = module.uri, sourceCodeSuffix = '';

	if (url){
		executedModules[url] = module;
		sourceCodeSuffix = sourceCodeBranding + url;
	}

	// Clean up
	// delete loadedModules[url]; TODO after the run

	// If it's plain CommonJS or legacy code we can run it directly
	var plainCJS = (!module.imports || !module.imports.length) &&
		(!module.exportedFunctions || !module.exportedFunctions.length) &&
		(!module.exportedVariables || !module.exportedVariables.length);

	if (plainCJS){
		return simpleRun.call(exports, module.source + sourceCodeSuffix, module.environment);
	}

	// Helpers
	function requireByImportIndex(i){
		return module.imports && i < module.imports.length ?
			module.environment.require(module.imports[i]) : {};
	}

	function resolve(id){
		id = canonicalize(id, url);
		var m = loadedModules[id];
		var exports = m ? m.exportedVariables.concat(m.exportedFunctions, m.exportedProperties) : [];
		m = executedModules[id];
		if (m && (m = m.exports))
			for (var key in m)
				if (hop.call(m, key))
					exports.push(key);
		return exports;
	}

	// Verify that all expected top level variables are resolved
	var importedVariables = {}, objectPrototypeShadowed = false;
	if (module.imports)
		for (var i = 0, l = module.imports.length; i < l; i++){
			var imp = resolve(module.imports[i]);
			for (var j = 0, k = imp.length; j < k; j++){
				importedVariables[imp[j]] = true;
				if (imp[j] in testObject || testObject[imp[j]] !== undefined)
					objectPrototypeShadowed = true;
			}
		}
	if (module.expectedVariables)
		for (var i = 0, l = module.expectedVariables.length; i < l; i++){
			var exp = module.expectedVariables[i];
			if (!(exp in importedVariables) && !(exp in global) && !(exp in module.environment))
				warn('unresolvedVariable', exp, url);
		}

	// Figure out if eval or Object.prototype is being shadowed
	var evalShadowed = false;
	if (!staticMode){
		if (module.lexicalEnvironment['eval'] || ('eval' in exports))
			evalShadowed = true;
		else if (module.imports)
			for (var i = 0, l = module.imports.length; i < l; i++)
				if ('eval' in requireByImportIndex(i)){
					evalShadowed = true;
					break;
				}
	}

	// Convert in special cases
	if (staticMode || evalShadowed || objectPrototypeShadowed || (module.imports && module.imports.length > 10)){
		var source;
		if ((staticMode || objectPrototypeShadowed) && module.resolve)
			source = module.resolve(resolve);
		else if (module.strict && es5mode && module.wrapStrict)
			source = module.wrapStrict();
		else if (module.wrap)
			source = module.wrap();
		else
			source = module.source;

		return simpleRun.call(
			exports,
			source + sourceCodeSuffix,
			module.environment
		);
	}

	// Debuggable run
	return debuggableRun.call(
		exports,
		{ js: module.variableExtractionCode },
		requireByImportIndex,
		prepareSource(module),
		module.environment
	);
}

// Prepare module

function prepareVariableExtraction(module){
	if (module.strict && es5mode){
		if (module.exportedVariables.length || module.exportedFunctions.length){
			var output = [], exports;
			output.push('({}.constructor.defineProperties(this,{');
			exports = module.exportedVariables.concat(module.exportedFunctions);
			for (var i = 0, l = exports.length; i < l; i++){
				var e = exports[i], v = e == 'v' ? 'b' : 'v';
				if (i > 0) output.push(',');
				output.push(e, ':{get:function(){return ', e, '},set:function(', v, '){', e, '=', v,'},enumerable:true}');
			}
			output.push('}));Loaded_by_Link.js=null;');
			return output.join('');
		}
	} else if (module.exportedFunctions && module.exportedFunctions.length){
		var exports = module.exportedFunctions, output = [];
		for (var i = 0, l = exports.length; i < l; i++)
			output.push('this.', exports[i], '=', exports[i], ';');
		return output.join('');
	}
	return null;
}

function prepareSource(module){
	var sourceCodeSuffix = module.uri ? sourceCodeBranding + module.uri : '',
		strictModeSuffix = module.uri ? strictModeBranding + module.uri : '';

	var functions = module.exportedFunctions, variables = module.exportedVariables, properties = module.exportedProperties;

	if (!module.strict || !es5mode ||
		((!functions || !functions.length) && (!variables || !variables.length))
		) return module.source + sourceCodeSuffix;

	if (module.lexicalExports && (!properties || !properties.length))
		return module.source + strictModeSuffix;

	return module.source.substr(0,module.strict) + ' eval( Loaded_by_Link.js );' + // I try to avoid this
		module.source.substr(module.strict) + sourceCodeSuffix;
}

function prepareExports(module){
	var exports = {};
	if (module.exportedVariables)
		for (var i = 0, l = module.exportedVariables.length; i < l; i++)
			exports[module.exportedVariables[i]] = undefined;
	if (module.exportedProperties)
		for (var i = 0, l = module.exportedProperties.length; i < l; i++)
			exports[module.exportedProperties[i]] = undefined;
	return exports;
}

function prepareEnvironment(module){
	// Determine whether to run in legacy mode
	// TODO clarify this bit

	var requires = module.requires, functions = module.exportedFunctions,
	    variables = module.exportedVariables, properties = module.exportedProperties,
	    lexicalEnvironment = module.lexicalEnvironment,
	    legacyMode =
	    	!(functions && functions.length) && !(variables && variables.length) &&
			!(properties && properties.length) && !(requires && requires.length) &&
			(!lexicalEnvironment || (lexicalEnvironment['exports'] !== 0 &&
			lexicalEnvironment['define'] !== 0 && lexicalEnvironment['require'] !== 0 &&
			lexicalEnvironment['module'] !== 0)) && !!parseSource;

	if (legacyMode){

		if (module.declaredVariables)
			for (var i = 0, l = module.declaredVariables.length; i < l; i++)
				if (!(module.declaredVariables[i]) in global)
					global[module.declaredVariables[i]] = undefined;
		if (module.expectedVariables)
			for (var i = 0, l = module.expectedVariables.length; i < l; i++)
				if (!(module.expectedVariables[i]) in global)
					global[module.expectedVariables[i]] = undefined;

		module.exports = global;
		return global;
	}

	// Declare a CommonJS and AMD environment for the module

	function require(id, success, failure){
		if (typeof id !== 'string' && id.length)
			return amdRequire(id, success, failure);
		if (id === 'require')
			return require;
		if (id === 'exports')
			return module.exports;
		if (id === 'module')
			return module;
		id = canonicalize(id, module.uri);
		if (!(id in executedModules))
			if (id in loadedModules)
				execute(loadedModules[id]);
			else
				error('moduleNotLoaded', id);
		return executedModules[id].exports;
	}
	require.main = mainModule;
	require.toUrl = function(id){
		return canonicalize(id, module.uri, true);
	};
	require.ensure = function(ids, success, failure){
		var urls = [];
		for (var i = 0, l = ids.length; i < l; i++)
			loadSource(urls[i] = canonicalize(ids[i], module.uri));
		scheduleCallback(
			function(){
				for (var i = 0, l = urls.length; i < l; i++){
					if (!(urls[i] in loadedModules) && !(urls[i] in executedModules))
						error('failedToEnsureModuleLoad', url);
				}
				return require;
			},
			success,
			failure
		);
	};

	function amdRequire(ids, success, failure){
		for (var i = 0, l = ids.length; i < l; i++)
			if (ids[i] !== 'require' && ids[i] !== 'exports' && ids[i] !== 'module')
				loadSource(canonicalize(ids[i], module.uri));
		scheduleCallback(
			function(){
				var results = [];
				for (var i = 0, l = ids.length; i < l; i++)
					results[i] = require(ids[i]);
				return results;
			},
			function(results){
				success.apply(null, results);
			},
			failure
		);
	}

	function define(id, deps, factory){
		if (typeof id !== 'string'){
			factory = deps;
			deps = id;
			id = module.uri;
		}
		if (factory == null){
			factory = deps;
			deps = ['require', 'exports', 'module'];
		}
		var required = [];
		if (typeof factory === 'function'){
			for (var i = 0, l = deps.length; i < l; i++)
				required.push(require(deps[i]));
			factory = factory.apply(module.exports, required);
		}
		if (factory && id){
			executedModules[canonicalize(id, module.uri)].exports = factory;
		}
	}
	define.amd = {};

	module.setExports = function(exports){
		module.exports = exports;
		//if (module.uri) executedModules[module.uri] = exports;
	};

	return {
		'require': require,
		'define': define,
		'module': module,
		'exports': module.exports = prepareExports(module)
	};
}

function prepareURL(module, url){
	loadedModules[url] = module;
	if (module.id == null)
		module.id = url.substr(0, baseUrl.length) == baseUrl ?
			url.substr(baseUrl.length).replace(/.js$/, '') : url;
	module.uri = url;
	if (url === main) mainModule = module;
}

function loadDependencies(module){
	for (var i = 0, l = module.requires.length; i < l; i++){
		var dependency = canonicalize(module.requires[i], module.uri);
		module.requires[i] = dependency;
		loadSource(dependency);
	}
}

function ensureImportsAreLoaded(module, stack){
	if (!stack) stack = {};
	if (module.imports)
	for (var i = 0, l = module.imports.length; i < l; i++){
		var dependency = canonicalize(module.imports[i], module.uri);
		module.imports[i] = dependency;
		if (dependency in executedModules)
			continue;
		if (!(dependency in loadedModules))
			error('importLoadFailure', dependency);
		else if (!(dependency in stack)){
			stack[dependency] = true;
			ensureImportsAreLoaded(loadedModules[dependency], stack);
		}
	}
}

function prepare(url, source, sync){
	var module = parseSource ? parseSource(source) : {
		requires: [],
		source: source
	};
	if (url) prepareURL(module, url);
	module.variableExtractionCode = prepareVariableExtraction(module);
	module.environment = prepareEnvironment(module);
	if (sync) ensureImportsAreLoaded(module)
	else loadDependencies(module);
	return module;
}

// Error Messages

function error(code){
	throw new Error([].join.call(arguments, ' '));
}

function warn(code){
	console.warn([].join.call(arguments, ' '));
}

// Syntax validation

function validateSyntax(url, source){
	// If there's a syntax error, we add it to the DOM to trigger a debuggable syntax error.
	try {
		new Function(source);
		return true;
	} catch (err){
		var script = document.createElement('script');
		script.src = (urlAliases[url] || url) + urlSuffix;
		(head || document.body).appendChild(script);
		return false;
	}
}

// URL

var urlSuffix = '', baseUrl, urlAliases = {},
    urlParts = /^((?:\w+:)?(?:\/\/[^\/?#]*))?(\.\.?$|(?:[^?#\/]*\/)*)(.*)/,
    hasExtension = /^\/|\?|#|\.js$|\/$/, endSlash = /\/$/;

function canonicalize(path, base, strictExtension){
	// RequireJS convention
	if (path.indexOf(':') >= 0) return path;
	if (!strictExtension && !hasExtension.test(path)) path = path + '.js';

	var parts = String(path).match(urlParts);
	if (!parts || parts[1]) return path;

	if (!base || path.charAt(0) !== '.') base = baseUrl;
	base = String(base).match(urlParts);

	var directory = parts[2];
	if (directory.charAt(0) != '/'){
		directory = (base[2] || '/') + directory;
		var result = [], paths = directory.replace(endSlash, '').split('/');
		for (var i = 0, l = paths.length; i < l; i++){
			var dir = paths[i];
			if (dir === '..' && result.length > 0) result.pop();
			else if (dir !== '.') result.push(dir);
		};
		directory = result.join('/') + '/';
	}
	return base[1] + directory + parts[3];
}

baseUrl = canonicalize('./', location.href);

function alias(name, url){
	urlAliases[canonicalize(name)] = canonicalize(url);
}

function base(url){
	baseUrl = canonicalize('./', canonicalize(url));
}

// XHR

var xhr, xhrs = [
	function(){ return new ActiveXObject('Microsoft.XMLHTTP'); },
	function(){ return new ActiveXObject('MSXML2.XMLHTTP'); },
	function(){ return new XMLHttpRequest(); }
];
while (xhrs.length) try { xhr = xhrs.pop(); xhr(); break; } catch(x) { xhr = null; }

if (typeof document == 'undefined' || !xhr) throw new Error('Unknown environment');

function fetch(url, success, failure){
	var request = xhr(), realUrl = (urlAliases[url] || url) + urlSuffix;
	request.open('GET', realUrl, true);
	request.onreadystatechange = function(){
		if (request.readyState == 4){
			if (request.status == 200)
				success(request.responseText);
			else
				failure('Error loading: ' + realUrl);
		}
	};
	request.send();
}

// Loading

var pendingRequests = {},
    pending = 0,
    pendingCallbacks = [],
    loadedModules = {},
    executedModules = {};

function executeCallbacks(callbacks, index){
	// Ensure all callbacks are triggered regardless of failure,
	// but don't catch errors. This leaves them debuggable.
	var failed, callback, success, failure, result;
	setTimeout(function(){
		if (index >= callbacks.length) return;
		if (failed && failure){
			setTimeout(function(){ executeCallbacks(callbacks, index + 1); }, 0);
			failure(new Error()); // TODO Pick up error
		} else {
			executeCallbacks(callbacks, index + 1);
		}
	}, 0);
	while (index < callbacks.length){
		failed = true;
		callback = callbacks[index];
		success = callback.success;
		failure = callback.failure;
		result = callback.execute();
		failed = false;
		if (success) success(result);
		index++;
	}
}

function fetchComplete(){
	pending--;
	if (pending > 0) return;
	var callbacks = pendingCallbacks;
	pendingCallbacks = [];
	executeCallbacks(callbacks, 0);
}

function scheduleCallback(execute, success, failure){
	pendingCallbacks.push({
		execute: execute,
		success: success,
		failure: failure
	});
	if (!pending){
		pending++;
		setTimeout(fetchComplete, 0);
	}
}

function loadSource(url){
	if (url in pendingRequests || url in loadedModules || url in executedModules)
		return;
	pending++;
	pendingRequests[url] = true;
	fetch(
		url,
		function(text){
			if (validateSyntax(url, text)){
				prepare(url, text);
				if (pending == 0) return;
			}
			delete pendingRequests[url];
			fetchComplete();
		},
		function(){
			delete pendingRequests[url];
			fetchComplete();
		}
	);
}

function load(url, success, failure){
	url = canonicalize(url);
	if (!(url in executedModules))
		loadSource(url);
	scheduleCallback(
		function(){
			if (url in executedModules) return executedModules[url].exports;
			var module = loadedModules[url];
			if (!module) error('moduleNotLoaded', url);
			ensureImportsAreLoaded(module);
			execute(module);
			return module.exports;
		},
		success,
		failure
	);
}

// Eval

function evaluate(source){
	var module = prepare(null, source, true);
	return execute(module);
}

function evaluateAsync(source, success, failure){
	var module = prepare(null, source);
	scheduleCallback(
		function(){
			ensureImportsAreLoaded(module);
			return execute(module);
		},
		success,
		failure
	);
}

// Export loader

var loader = typeof exports !== 'undefined' ? exports : {};
loader.load = load;
loader.eval = evaluate;
loader.evalAsync = evaluateAsync;
loader.loaded = executedModules;
loader.alias = alias;
loader.base = base;

// Import parser

if (!parseSource && loader.parse)
	parseSource = loader.parse;

// Load the main script and run

var scripts = document.getElementsByTagName('script'), script, head, main, mainModule;
for (var i = scripts.length - 1; i >= 0; i--){
	script = scripts[i];
	main = script.getAttribute('data-main');
	if (main){

		if (script.getAttribute('data-nocache') != null)
			urlSuffix = '?noCache=' + (+new Date());

		if (script.getAttribute('data-resolve') != null)
			staticMode = true;

		executedModules[canonicalize(script.src)] = { exports: loader };
		main = canonicalize(main);
		baseUrl = canonicalize('./', main);

		if (!parseSource)
			load(canonicalize('../Library/link.js', script.src), function(global){
				parseSource = loader.parse = global.parse;
				load(main);
			});
		else
			load(main);

		head = script.parentNode;
		head.removeChild(script); // The loader can load itself more than once but run main only once
		break;
	}
}

}(

function(Loaded_by_Link, __MODULE_IMPORT__, __MODULE_SOURCE__, __MODULE_ENVIRONMENT__){

// Isolated scope where modules are executed

// Firebug doesn't support debugging eval in eval, so we hardcode this list
with (__MODULE_ENVIRONMENT__)
with (__MODULE_IMPORT__(0))
with (__MODULE_IMPORT__(1))
with (__MODULE_IMPORT__(2))
with (__MODULE_IMPORT__(3))
with (__MODULE_IMPORT__(4))
with (__MODULE_IMPORT__(5))
with (__MODULE_IMPORT__(6))
with (__MODULE_IMPORT__(7))
with (__MODULE_IMPORT__(8))
with (__MODULE_IMPORT__(9))
return (function(){
	var __MODULE_RESULT__;
	with(this)
		__MODULE_RESULT__ = eval(__MODULE_SOURCE__);
	eval(Loaded_by_Link.js);
	return __MODULE_RESULT__;
}.call(this));

},

function(__MODULE_SOURCE__, __MODULE_ENVIRONMENT__){
	with (__MODULE_ENVIRONMENT__)
		return eval(__MODULE_SOURCE__);
},

function(){
	return this;
}

));