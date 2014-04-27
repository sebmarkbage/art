#!/usr/bin/env node
version: 0.15;

// TODO: Enable clean debugging by keeping runtime boilerplate within the 62 characters Node does.
// TODO: Drop CommonJS Async compliance and the more esoteric parts of AMD compliance
// TODO: Better custom path API

var usage = 'Usage:\n' +
	'linkjs --output [filename] [--global] [--cjs] [--amd] [--strict] modulename\n' +
	'linkjs modulename [argv...]\n\n' +

	'Options:\n' +
	'--output [filename]       \tConvert the input file to one or more of the formats below.\n' +
	'                          \tIf no filename is provided, the result is written to stdout.\n' +
	'[--global] [--cjs] [--amd]\tSelect a target format: the global object, CommonJS or AMD.\n' +
	'[--strict]                \tEnforce dynamic strict mode. Requires ECMAScript 5.\n\n' +
	'-[o|g|c|a|s]              \tSingle character shortcuts for the above options.\n\n' +

	'modulename [argv...]      \tRun a module in Node.js, with optional arguments.\n';


var defaultOptions = {

	// Input filename
	input: '',

	// Output filename
	output: '',

	// Define the output format. These values can be combined to create a multi-format file.
	cjs: true,      // If true, convert to a CommonJS compatible module,
	amd: false,     // If true, convert to an AMD compatible module.
	global: false,  // If true, export to the global object for script tag loading.

	// Enables enforcement of "use strict" mode. The compiled code will require ES5.
	// When this option is false, strict mode is not enforced on top level code.
	// Wrap your code in a strict function if you want to enforce it on newer engines
	// yet remain compatible with old.
	strict: false

};

var Path = require('path'),
	Module = require('module'),
	Link = require('../Library/link'),
	FS = require('fs');

// AMD test suite has strict requirements on id formatting, is this necessary?
function makeAMDCompliantId(module){
	if (!module.id) return;
	var compliantId = module.id, base = basePath;
	if (base && compliantId.substr(0, base.length) === base)
		compliantId = compliantId.substr(base.length + 1);
	if (compliantId.substr(-3) === '.js') compliantId = compliantId.substr(0, compliantId.length - 3);
	module.uri = module.id;
	module.id = compliantId;
}

function setExports(exports){
	this.exports = exports;
}

function compile(self, content, filename) {
	makeAMDCompliantId(self);
	self.setExports = setExports;
	return self._compile('require.ensure=function(i,s,f){s(require)};' + content, filename);
};

// Preload imports

var loadedModules, testObject = {};

function preloadImports(parsedModule, parent){
	for (var i = 0, l = parsedModule.imports.length; i < l; i++){
		var path = parsedModule.imports[i];
		if (!(path in aliases)){
			if (path in testObject)
				path = path + '.js'; // Resolve Node cache bug
			parsedModule.imports[i] = path = Module._resolveFilename(path, parent);
		}
		if (Path.extname(aliases[path] || path) == '.js' && !Object.prototype.hasOwnProperty.call(require.cache, path)){
			var mod = new Module(path, parent);
			mod.filename = path;
			preload(path, mod);
		}
	}
}

function preload(filename, parent){
	if (filename in loadedModules) return loadedModules[filename];
	if (filename in aliases) parent.filename = Path.resolve(basePath || __dirname, filename);
	var source = FS.readFileSync(aliases[filename] || filename, 'utf8');
	var parsedModule = Link.parse(source);
	loadedModules[filename] = parsedModule;
	preloadImports(parsedModule, parent);
	return parsedModule;
}

// Graph information

function resolveExports(filename){
	var m = loadedModules[filename],
	    exports = m ? m.exportedVariables.concat(m.exportedFunctions, m.exportedProperties) : [];
	m = require.cache[filename];
	if (m)
		for (var key in m)
			if (Object.prototype.hasOwnProperty.call(m, key))
				exports.push(key);
	return exports;
}

function isObjectPrototypeShadowed(parsedModule){
	for (var i = 0, l = parsedModule.imports.length; i < l; i++){
		var imported = resolveExports(parsedModule.imports[i]);
		for (var j = 0, k = imported.length; j < k; j++)
			if (imported[j] in testObject)
				return true;
	}
	return false;
}

// Register as the default module loader in Node.js

if (!require.extensions) return;
require.extensions['.js'] = function(module, filename){
	var root = !loadedModules;
	if (root) loadedModules = Object.create(null);
	var parsedModule = preload(filename, module),
	    options = { resolve: isObjectPrototypeShadowed(parsedModule) && resolveExports },
	    source = parsedModule.convert(options),
	    result = compile(module, source, filename);
	if (root) loadedModules = null;
	return result;
};

// Export Loader API

exports.load = function(url, success, failure){
	try {
		var result = require(url);
	} catch (error){
		if (failure) failure(error);
		return;
	}
	if (success) success(result);
};

exports.eval = function(source){
	var module = new Module();
	var parsedModule = Link.parse(source);
	preloadImports(parsedModule, module);
	parsedModule.source = '__EVAL_OUTPUT__ = eval(' + JSON.stringify(source) + ')'; // TODO check for eval shadowing
	source = parsedModule.convert();
	return compile(module, 'var __EVAL_OUTPUT__;' + source + ';return __EVAL_OUTPUT__', null);
};

exports.evalAsync = function(source, callback, failure){
	try {
		var result = eval(source);
	} catch (error){
		 if (failure) failure(error);
		 return;
	}
	if (success) success(result);
};

exports.loaded = require.cache; // Currently contains module objects, but should be exports

// Path mapping

var originalFindPath = Module._findPath;
Module._findPath = function(request, paths){
	if (basePath && (request[0] != '.' || (request[1] != '/' && request[1] != '.')))
		paths = [basePath];
	return (request in aliases) ? request : originalFindPath(request, paths);
};

var aliases = Object.create(null), basePath;
exports.alias = function(name, url){
	if (loadedModules) delete loadedModules[name];
	aliases[name] = require.resolve(url);
};

exports.base = function(path){
	basePath = Path.dirname(path + 'x'); // Because trailing slash in urls refer to a directory
};

// Error reporting

function error(code){
	console.error(code);
	process.exit(1);
};

// Options

function optionsFromArgs(args){
	var singleCharacterOptions = {};
	for (var key in defaultOptions) singleCharacterOptions[key[0]] = key;

	var options = {};
	for (var i = 2, l = args.length; i < l; i++){
		var v = args[i];
		if (v[0] != '-'){
			options.input = v;
			options.args = args.slice(i + 1);
			break;
		}
		options.convert = true;
		v = v[1] == '-' ? v.substr(2) : singleCharacterOptions[v.substr(1)];
		if (typeof(defaultOptions[v]) == 'boolean'){
			options[v] = true;
		} else if (typeof defaultOptions[v] == 'string' && args[i + 1]){
			if (args[i + 1][0] != '-') options[v] = args[++i];
		} else {
			error('invalidArgs');
		}
	}
	if (!options.input && options.output){
		options.input = options.output;
		options.output = null;
	}
	if (!options.input) error('missingInput');
	return options;
}

// Executed from the command line

function main(){
	if (!process.argv || process.argv.length < 3){
		console.log(usage);
		process.exit(1);
	}

	var options = optionsFromArgs(process.argv);

	// Convert or Execute

	if (options.convert){

		function resolveExports(filename){
			if (filename in testObject)
				filename += '.js';
			filename = Module._resolveFilename(filename, inputModule)
			var source = FS.readFileSync(filename, 'utf8'),
			    m = Link.parse(source);
			return m.exportedVariables.concat(m.exportedFunctions, m.exportedProperties);
		}

		var input = require.resolve(Path.resolve(options.input));
		var inputModule = new Module(input, module);
		inputModule.filename = input;

		options.resolve = resolveExports;

		var source = FS.readFileSync(input, 'utf8');
		source = Link.parse(source).convert(options);

		if (options.output)
			FS.writeFileSync(options.output, source);
		else
			process.stdout.write(source);

	} else {

		process.argv.splice(1, 2, require.resolve(Path.resolve(options.input)));
		Module.runMain();

	}
}

if (require.main === module) main();