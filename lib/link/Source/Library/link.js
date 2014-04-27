version: 0.15;

(function(){
"use strict";

if (typeof exports !== 'undefined') exports.parse = parse;

var hop = {}.hasOwnProperty;

// Conversion options

var defaultOptions = {

	// Define the output format. These values can be combined to create a multi-format file.
	cjs: true,      // If true, convert to a CommonJS compatible module,
	amd: false,     // If true, convert to an AMD compatible module.
	global: false,  // If true, export to the global object for script tag loading.

	// Define a synchronous function that determines a dependency's exported identifiers.
	// Modules that don't allow for static analysis may need to be executed to be resolved.
	// If not set, dynamic mode is used.
	resolve: null,

	// Enables enforcement of "use strict" mode. The compiled code will require ES5.
	// When this option is false, strict mode is not enforced on top level code.
	// Wrap your code in a strict function if you want to enforce it on newer engines
	// yet remain compatible with old.
	strict: false

};

// Boilerplate

var umd = {

	'':
		'$',

	'cjs':
		'$',

	'global':
		'(function(exports){\nfunction require(id){ return this; };\n$\n}.call(this, this));',

	'cjs,global':
		'(function(require, exports){\n$\n}' +
		'.call(this, typeof require === "undefined" ? function(){return this} : require, this));',

	'amd':
		'define(function(require, exports, module){\n$\n});',

	'cjs,amd':
		'(typeof define === "function" && define.amd ? define : ' +
		'function(factory){factory.call(exports, require, exports, module)}' +
		')(function(require, exports, module){\n$\n});',

	'amd,global':
		'(typeof define === "function" && define.amd ? define : ' +
		'function(factory){factory.call(this, function(){return this}, this)}' +
		')(function(require, exports, module){\n$\n});',

	'cjs,amd,global':
		'(typeof define === "function" && define.amd ? define : ' +
		'function(factory){var e = typeof exports == "undefined" ? this : exports;' +
		'factory.call(e, typeof require == "undefined" ? function(){return this} : require, e, typeof module == "undefined" ? null : module)}' +
		')(function(require, exports, module){\n$\n});'

};

// TODO: AMD modules should be destructured to CommonJS to be fully compatible.

var define = "\
var define = function(id, deps, factory){\
	if (typeof id !== 'string'){ factory = deps; deps = id; }\
	if (factory == null){ factory = deps; deps = ['require', 'exports', 'module']; }\
	function resolveList(deps){\
		var required = [];\
		for (var i = 0, l = deps.length; i < l; i++)\
			required.push(\
				(deps[i] === 'require') ? amdRequire :\
				(deps[i] === 'exports') ? exports :\
				(deps[i] === 'module') ? module :\
				require(deps[i])\
			);\
		return required;\
	}\
	function amdRequire(ids, success, failure){\
		if (typeof ids === 'string') return require(ids);\
		var resolved = resolveList(ids);\
		/*try { var resolved = resolveList(ids); }\
		catch (error) { if (failure) failure(error); return; }*/\
		if (success) success.apply(null, resolved);\
	}\
	amdRequire.toUrl = require.resolve;\
	if (typeof factory === 'function') factory = factory.apply(exports, resolveList(deps));\
	if (factory) module.exports = factory;\
};define.amd={};\
";

// Transpiler

function ModuleDefinition(source){
	this.id = null;
	this.source = source;

	this.requires = [];
	this.imports  = [];

	this.exportedVariables = [];
	this.exportedFunctions = [];
	this.declaredVariables = [];
	this.declaredFunctions = [];
	this.expectedVariables = [];

	this.lexicalExports = true; // TODO
	this.exportedProperties = []; // TODO

	this.strict = 0;
	this.lexicalScope = true;
	this.amd = false;

	this.tokens = [];
	this.lexicalEnvironment = {};
};

ModuleDefinition.prototype = {

	resolve: function(resolver){
		var input = this.source,
		    newLine = /\r\n/.test(input) ? '\r\n' : '\n',
		    output = [],
		    imports = this.imports,
		    lexicalEnvironment = this.lexicalEnvironment,
		    imported = {};

		// Write strict mode
		output.push(input.substr(0, this.strict));
		if (this.strict) output.push(newLine);

		// Resolve imported properties
		if (typeof resolver === 'function')
			for (var i = 0, l = imports.length; i < l; i++){
				var id = imports[i],
					name = '__MODULE' + i + '__',
					m = resolver(id);

				if (m && m.length)
					for (var j = 0, k = m.length; j < k; j++){
						var identifier = m[j];
						if (hop.call(imported, identifier) && imported[identifier].id !== id)
							error('importConflict', imported[identifier].id, id, identifier, this.id || '');
						else if (!lexicalEnvironment[identifier] || !hop.call(lexicalEnvironment, identifier))
							imported[identifier] = { id: id, name: name };
						else if ((lexicalEnvironment[identifier] & Exported) === Exported)
							error('exportConflict', id, identifier, this.id || '');
						else
							warn('shadowedImport', id, identifier, this.id || '');
					}

				// Import module
				output.push(
					i == 0 ? 'var ' : ', ',
					name, ' = require("', id, '")'
				);
			}
		if (imports.length) output.push(';', newLine);

		// Redeclare variables at the top
		for (var i = 0, l = this.declaredVariables.length; i < l; i++){
			output.push(i == 0 ? 'var ' : ', ');
			output.push(this.declaredVariables[i]);
		}
		if (l) output.push(';', newLine);

		// Export hoisted function declarations at the top
		for (var i = 0, l = this.exportedFunctions.length; i < l; i++){
			output.push('exports.', this.exportedFunctions[i], ' = ', this.exportedFunctions[i], '; ');
		}
		if (l) output.push(newLine);

		// Rewrite the source code
		var last = this.strict, tokens = this.tokens;
		for (var i = 0, l = tokens.length; i < l; i++){
			var token = tokens[i], type = token.type;
			output.push(input.substring(last, token.start));
			last = token.start;
			if (type === Identifier){
				// Rewrite imported and exported top level variables
				var identifier = token.value;
				if ((lexicalEnvironment[identifier] & Exported) === Exported)
					output.push('exports.');
				else if (hop.call(imported, identifier))
					output.push(imported[identifier].name + '.');

			} else if (type === RequireStatement){
				// Strip require statement
				last = token.end;

			} else if (type === ExportsStatement){
				// Strip exports label
				last = token.expressionStart;

			} else if (type === VariableDeclaration){
				// Strip variable declaration
				last = token.expressionStart;
			}
		}
		output.push(input.substring(last, input.length));

		return output.join('');
	},

	wrapStrict: function(){
		var output = [],
		    exports = this.exportedProperties,
		    imports = this.imports;

		for (var i = 0, l = exports.length; i < l; i++)
			output.push('exports.', exports[i], '=');
		if (l > 0) output.push('{}.undefined;');

		for (var i = 0, l = imports.length; i < l; i++)
			output.push('with(require("', imports[i], '"))\n');

		if (imports.length) output.push('(function(){');

		exports = this.exportedVariables.concat(this.exportedFunctions);
		if (exports.length){
			for (var i = 0, l = exports.length; i < l; i++){
				var e = exports[i], v = e == 'v' ? 'b' : 'v';
				output.push(
					i == 0 ? '({}.constructor.defineProperties(this, {' : ',',
					e, ':{get:function(){return ', e, '},set:function(', v, '){', e, '=', v,'},enumerable:true}'
				);
			}
			if (l) output.push('}));');
		}

		output.push(this.source);

		if (imports.length) output.push('}.call(this))');

		return output.join('');
	},

	wrap: function(){
		var output = [], exports, imports = this.imports;

		exports = this.exportedVariables.concat(this.exportedProperties);
		for (var i = 0, l = exports.length; i < l; i++)
			output.push('exports.', exports[i], '=');
		if (l > 0) output.push('{}.undefined;');

		for (var i = 0, l = imports.length; i < l; i++)
			output.push('with(require("', imports[i], '"))\n');

		output.push('with(exports)(function(){');

		exports = this.exportedFunctions;
		for (var i = 0, l = exports.length; i < l; i++)
			output.push('this.', exports[i], '=', exports[i], ';');

		output.push(
			'with(this){\n',
			this.source,
			'\n}'
		);

		output.push('}.call(exports));');

		return output.join('');
	},

	convert: function(options){
		if (!options) options = defaultOptions;
		var result;

		if (!this.imports.length && !this.exportedFunctions.length && !this.exportedVariables.length)
			result = this.source;
		else if (this.lexicalScope && options.resolve)
			result = this.resolve(options.resolve);
		else if (this.strict && options.strict)
			result = this.wrapStrict();
		else
			result = this.wrap();

		var boilerplates = [];
		if (options.cjs) boilerplates.push('cjs');
		if (options.amd) boilerplates.push('amd');
		if (options.global) boilerplates.push('global');
		
		if ((this.amd || this.lexicalEnvironment['define'] === Undeclared) && (!options.amd || boilerplates.length > 1))
			result = define + result;

		return umd[boilerplates].replace('$', result);
	}

};

// Error helpers

var errorMessages = {

	'importConflict': 
		'Import conflict: "$1" and "$2" both export "$3"\n' +
		'Resolve it by explicitly naming one of them: var $32 = require("$2").$3\n[$4]',

	'exportConflict': 
		'Export conflict: "$1" also contains the exported "$2"\n' +
		'Resolve it by explicitly naming one of them: var $22 = require("$1").$2\n[$3]',

	'shadowedImport':
		'Import shadowed: The variable $2 is declared by this module but it\'s also\n' +
		'imported through "$1". Only the locally declared variable will be used.\n[$3]',

	'invalidArgs':
		'Invalid arguments.',

	'nestedRequire':
		'The require statement can only be applied in the top scope. (Line $1)',

	'nestedExport':
		'The exports statement can only be applied in the top scope. (Line $1)',

	'unknownExport':
		'Unknown export statement. (Line $1)',

	'undeclaredExport':
		'Cannot export undeclared variable: $1'

};

function formatMessage(args){
	return errorMessages[args[0]]
	       .replace(/\$(\d)/g, function(s, i){ return args[i]; })
}

function warn(){
	console.warn(formatMessage(arguments));
};

function error(){
	throw new Error(formatMessage(arguments));
};

// Tokenizer

var source,
	index,
	lineNumber,
	length,
	previousToken;

var EOF = 2,
	Identifier = 3,
	Keyword = 4,
	Literal = 5,
	Punctuator = 7,
	StringLiteral = 8,

	VariableDeclaration = 10,
	FunctionDeclaration = 11,
	ExportsStatement = 12,
	RequireStatement = 13;

function createToken(type, value, start){
	return {
		type: type,
		value: value,
		lineNumber: lineNumber,
		start: start,
		end: index
	};
}

function isDecimalDigit(ch) {
	return '0123456789'.indexOf(ch) >= 0;
}

function couldBeRegExp(){
	// TODO: Proper regexp handling, when I find a case for it
	var token = previousToken;
	return typeof token === 'undefined' ||
		(token.type === Punctuator && '})]'.indexOf(token.value) == -1) ||
		(token.type === Keyword && isKeyword(token.value));
}

function isWhiteSpace(ch) {
	// TODO Unicode "space separator"
	return (ch === ' ') || (ch === '\u0009') || (ch === '\u000B') ||
		(ch === '\u000C') || (ch === '\u00A0') || (ch === '\uFEFF');
}

function isPunctuator(ch){
	return '=<>{}();:,.!?+-*%&|^/[]~'.indexOf(ch) >= 0;
}

function isLineTerminator(ch) {
	return (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029');
}

function isKeyword(id) {
	switch (id) {

	// Keywords.
	case 'break':
	case 'case':
	case 'catch':
	case 'continue':
	case 'debugger':
	case 'default':
	case 'delete':
	case 'do':
	case 'else':
	case 'finally':
	case 'for':
	case 'function':
	case 'if':
	case 'in':
	case 'instanceof':
	case 'new':
	case 'return':
	case 'switch':
	case 'this':
	case 'throw':
	case 'try':
	case 'typeof':
	case 'var':
	case 'void':
	case 'while':
	case 'with':
		return true;

	// Future reserved words.
	// 'const' is specialized as Keyword in V8.
	case 'const':
		return true;

	// strict mode
	case 'implements':
	case 'interface':
	case 'let':
	case 'package':
	case 'private':
	case 'protected':
	case 'public':
	case 'static':
	case 'yield':
		return true;
	}

	return false;
}

function nextChar() {
	var ch = '\x00',
		idx = index;
	if (idx < length) {
		ch = source[idx];
		index += 1;
	}
	return ch;
}

function skipComment() {
	var ch, blockComment, lineComment;

	blockComment = false;
	lineComment = false;

	while (index < length) {
		ch = source[index];

		if (lineComment) {
			nextChar();
			if (isLineTerminator(ch)) {
				lineComment = false;
				if (ch ===  '\r' && source[index] === '\n') {
					nextChar();
				}
				lineNumber += 1;
			}
		} else if (blockComment) {
			nextChar();
			if (ch === '*') {
				ch = source[index];
				if (ch === '/') {
					nextChar();
					blockComment = false;
				}
			} else if (isLineTerminator(ch)) {
				if (ch ===  '\r' && source[index] === '\n') {
					nextChar();
				}
				lineNumber += 1;
			}
		} else if (ch === '/') {
			ch = source[index + 1];
			if (ch === '/') {
				nextChar();
				nextChar();
				lineComment = true;
			} else if (ch === '*') {
				nextChar();
				nextChar();
				blockComment = true;
			} else {
				break;
			}
		} else if (isWhiteSpace(ch)) {
			nextChar();
		} else if (isLineTerminator(ch)) {
			nextChar();
			if (ch ===  '\r' && source[index] === '\n') {
				nextChar();
			}
			lineNumber += 1;
		} else {
			break;
		}
	}
}

function scanIdentifier() {
	var ch, start, id;
	ch = source[index];
	start = index;
	id = nextChar();
	while (index < length) {
		ch = source[index];
		if (isWhiteSpace(ch) || isLineTerminator(ch) || isPunctuator(ch) ||
			ch == '\'' || ch == '"')
			break;
		id += nextChar();
	}

	if (id.length === 1)
		return createToken(Identifier, id, start);

	if (isKeyword(id))
		return createToken(Keyword, id, start);

	if (id === 'null' || id === 'true' || id === 'false')
		return createToken(Literal, id, start);

	return createToken(Identifier, id, start);
}

function scanPunctuator() {
	var start = index,
		ch1 = source[index],
		ch2 = source[index + 1];

	if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0))
		return createToken(Punctuator, nextChar() + nextChar(), start);

	return createToken(Punctuator, nextChar(), start);
}

function scanNumericLiteral() {
	var number, ch;
	while (index < length) {
		ch = source[index];
		if ('0123456789abcdefABCDEF.xXeE'.indexOf(ch) < 0) {
			if (ch != '+' && ch != '-') break;
			ch = source[index - 1];
			if (ch != 'e' && ch != 'E') break;
		}
		nextChar();
	}
	return createToken(Literal);
}

function scanStringLiteral() {
	var str = '', quote, start, ch;

	quote = source[index];
	start = index;
	nextChar();

	while (index < length) {
		ch = nextChar();

		if (ch === quote) {
			break;
		} else if (ch === '\\') {
			ch = nextChar();
			if (!isLineTerminator(ch)) {
				str += '\\';
				str += ch;
			}
		} else {
			str += ch;
		}
	}

	return createToken(StringLiteral, str, start);
}

function scanRegExp() {
	nextChar();
	var start = index;
	while (index < length) {
		var ch = nextChar();
		if (ch === '\\')
			nextChar();
		if (ch === '/')
			break;
		if (ch === '[')
			while (index < length && nextChar() !== ']');
	}
	while (index < length && (/[a-z]/i).test(source[index]))
		nextChar();
	return createToken(Literal);
}

function advance() {
	var ch;

	skipComment();

	if (index >= length)
		return createToken(EOF);

	ch = source[index];

	if (ch === '/' && couldBeRegExp())
		return scanRegExp();

	if (isPunctuator(ch) && (ch != '.' || !isDecimalDigit(source[index+1])))
		return scanPunctuator();

	if (ch === '\'' || ch === '"')
		return scanStringLiteral();

	if (ch === '.' || isDecimalDigit(ch))
		return scanNumericLiteral();

	return scanIdentifier();
}

// Parser

var module,
	scope,
	globalScope,
	scopeAliases,
	scopeTokens,
	dependencies,
	buffer;

var Undeclared = 0,
	DeclaredVariable = 1,
	DeclaredFunction = 2 | DeclaredVariable,
	Exported = 4,
	ExportedVariable = DeclaredVariable | Exported,
	ExportedFunction = DeclaredFunction | Exported,
	ExportedProperty = 8 | Exported;

var Required = 1,
	Imported = 3;

function lex(){
	var token;

	if (buffer){
		token = buffer;
		buffer = null;
		return token;
	}
	buffer = null;
	return previousToken = advance();
}

function lookahead(){
	if (buffer !== null)
		return buffer;
	return buffer = previousToken = advance();
}

function expect(value){
	var token = lex();
	if (token.type !== Punctuator || token.value !== value) {
		throw new Error('Unexpected token: ' + token.value + ' at line ' + lineNumber);
	}
}

function expectKeyword(keyword){
	var token = lex();
	if (token.type !== Keyword || token.value !== keyword) {
		throw new Error('Unexpected token: ' + token.value);
	}
}

function match(value){
	var token = lookahead();
	return token.type === Punctuator && token.value === value;
}

function matchKeyword(keyword){
	var token = lookahead();
	return token.type === Keyword && token.value === keyword;
}

function matchBlockStart(){
	var token = lookahead();
	if (token.type == Keyword){
		if (token.value == 'case'){
			lex();
			lex();
			return true;
		}
		if (token.value == 'default'){
			lex();
			return true;
		}
		return token.value == 'do' || token.value == 'else' ||
			   token.value == 'finally' || token.value == 'try';
	}
	return false;
}

function matchParenthesisBlockStart(){
	var token = lookahead();
	if (token.type == Keyword)
		return token.value == 'if' || token.value == 'for' ||
			   token.value == 'catch' || token.value == 'with' ||
			   token.value == 'switch' || token.value == 'while';
	return false;
}

function matchASI(){
	// TODO Proper ASI in all cases
	var token = lookahead();
	return token.type !== Punctuator &&
		   (token.type !== Keyword || (token.value != 'in' && token.value != 'instanceof'));
}

function scanObjectInitializer(){
	expect('{');
	while (!match('}')){
		var token = lex();
		if (token.type == Identifier && (token.value == 'get' || token.value == 'set') && !match(':'))
			lex();
		expect(':');
		scanExpression();
		if (match('}')) break;
		expect(',');
	}
	expect('}');
}

function scanArrayInitializer(){
	expect('[');
	while (!match(']')){
		scanExpression();
		if (match(']')) break;
		expect(',');
	}
	expect(']');
}

function scanParenthesis(){
	expect('(');
	if (matchKeyword('var'))
		scanVariableDeclarationList(Undeclared, DeclaredVariable);
	else
		scanExpression();
	 while(match(',') || match(';')){
		lex();
		scanExpression();
	};
	expect(')');
}

function scanRequireExpression(){
	expect('(');
	if (lookahead().type == StringLiteral){
		var identifier = lex().value;
		if (match(')')){
			dependencies[identifier] |= Required;
			lex();
			return;
		}
	}
	scanExpression();
	while(match(',')){
		lex();
		if (match(')')) break;
		scanExpression();
	}
	expect(')');
}

function scanCallExpression(identifier){
	if (identifier == 'define') return scanDefineStatement();
	if (identifier == 'require') return scanRequireExpression();
	if (identifier == 'eval') module.lexicalScope = false;
	scanExpression();
}

function scanIdentifierExpression(token){
	var identifier = token.value;
	if (!(identifier in scope)) scope[identifier] = Undeclared;

	scopeTokens.push(token);

	if (identifier in scopeAliases){
		identifier = scopeAliases[identifier];
		if (globalScope[identifier]) return;
	} else {
		if (scope[identifier]) return;
	}
	if (match('(')) return scanCallExpression(identifier);
	if (identifier != 'exports') return;
	if (match('.')){
		lex();
		globalScope[lex().value] |= ExportedProperty;
	} else if (match('[')){
		lex();
		if (lookahead().type === StringLiteral){
			var value = lex().value;
			if (match(']')) globalScope[value] |= ExportedProperty;
		}
		scanExpression();
		expect(']');
	}
}

function scanExpression(){
	var token = lookahead();
	while (token.type != EOF && !match('}') && !match(')') && !match(']') && !match(',') && !match(';')){

		if (token.type == Identifier){
			lex();
			scanIdentifierExpression(token);
			if (matchASI()) break;
		}
		else if (token.type == StringLiteral || token.type == Literal){
			lex();
			if (matchASI()) break;
		}
		else if (matchKeyword('function')){
			scanFunctionExpression();
			if (matchASI()) break;
		}
		else if (match('{')){
			scanObjectInitializer();
			if (matchASI()) break;
		}
		else if (match('[')){
			scanArrayInitializer();
			if (matchASI()) break;

		} else if (match('(')){
			scanParenthesis();
			if (match('{')){
				scanBlock();
				return;
			}
			if (matchASI()) break;
		
		} else if (match('++') || match('--')){
			lex();
			var previous = lineNumber;
			if (matchASI() && previous !== lineNumber) break;

		} else if (match('.')){
			lex();
			token = lookahead();
			if (token.type == Identifier){
				lex();
				if (matchASI()) break;
			}
		}

		else
			lex();

		token = lookahead();
	}
}

function scanVariableDeclarationList(exported, declared){
	if (declared){
		var declarationToken = {
			type: VariableDeclaration,
			start: lex().start,
			expressionStart: lookahead().start,
			end: 0
		};
		if (scope === globalScope)
			scopeTokens.push(declarationToken);
	} 

	var token = lex();
	while(token.type !== EOF){
		var identifier = token.value;
		scope[identifier] |= declared;
		scope[identifier] |= exported;

		scopeTokens.push(token);

		if (match('=') || matchKeyword('in')) scanExpression();
		if (!match(',')) break;
		lex();
		token = lex();
	}

	if (declared) declarationToken.end = lookahead().start;
}

function scanCatchStatement(){
	expectKeyword('catch');
	// TODO: Variables declared belong to the function scope,
	// but the caught variable is unique to the catch scope.
	scanFunction();
}

function scanArguments(aliases){
	var token, i = 0;
	expect('(');
	if (!match(')')){
		while ((token = lex()).type != EOF){
			if (aliases != null && i < aliases.length){
				scopeAliases[token.value] = aliases[i++];
			}
			scope[token.value] |= DeclaredVariable;
			if (match(')')){
				break;
			}
			expect(',');
		}
	}
	expect(')');
}

function scanFunction(aliases, identifier){
	var scopeChain = function(){};
	scopeChain.prototype = scope;
	scope = new scopeChain();
	scope.arguments = DeclaredVariable;
	if (identifier) scope[identifier] = DeclaredFunction;

	if (aliases){
		var scopeAliasesChain = function(){};
		scopeAliasesChain.prototype = scopeAliases;
		scopeAliases = new scopeAliasesChain();
	}

	var parentScopeTokens = scopeTokens;
	scopeTokens = [];
	scanArguments(aliases);
	scanBlock();

	for (var i = 0, l = scopeTokens.length; i < l; i++){
		var identifier = scopeTokens[i].value;
		if (!hop.call(scope, identifier) || scope[identifier] === Undeclared){
			parentScopeTokens.push(scopeTokens[i]);
			scopeChain.prototype[identifier] |= Undeclared;
		}
	}

	scope = scopeChain.prototype;
	scopeTokens = parentScopeTokens;
	if (aliases) scopeAliases = scopeAliasesChain.prototype;
}

function scanFunctionDeclaration(exported){
	var start = lookahead().start;
	expectKeyword('function');
	var identifier = lex().value;
	scope[identifier] |= DeclaredFunction;
	scope[identifier] |= exported;
	var declarationToken = createToken(FunctionDeclaration, null, start);
	if (scope === globalScope) scopeTokens.push(declarationToken);
	scanFunction(null, identifier);
	declarationToken.end = lookahead().start;
}

function scanFunctionExpression(aliases){
	expectKeyword('function');
	if (lookahead().type === Identifier)
		scanFunction(aliases, lex().value);
	else
		scanFunction(aliases);
}

function scanBlock(){
	expect('{');
	scanStatements();
	expect('}');
}

function scanDefineStatement(){
	var id = null, deps = [];
	expect('(');
	module.amd = true;
	if (lookahead().type === StringLiteral){
		id = lex().value;
		if (match(',')) lex();
		if (matchKeyword('function')){
			scanFunctionExpression(['require', 'exports', 'module']);
			if (match(')')){
				lex();
				module.id = id;
				return;
			}
		}
		if (match(')')){ lex(); return; }
	}
	if (match('[')){
		lex();
		while (lookahead().type === StringLiteral){
			deps.push(lex().value);
			if (match(',')) lex();
		}
		if (match(']')){
			lex();
			if (match(',')){
				lex();
				if (matchKeyword('function')){
					scanFunctionExpression(deps);
					if (match(')')){
						module.id = id;
						for (var i = 0, l = deps.length; i < l; i++)
							if (deps[i] !== 'require' &&
							    deps[i] !== 'exports' &&
							    deps[i] !== 'module')
							    dependencies[deps[i]] |= Required;
					}
				} else {
					scanExpression();
				}
			}
		}
	}
	if (matchKeyword('function')){
		scanFunctionExpression(['require', 'exports', 'module']);
	} else if (!match(')')){
		scanExpression();
	}
	while(match(',')){
		lex();
		if (match(')')) break;
		scanExpression();
	}
	expect(')');
}

function scanRequireStatement(){
	if (scope !== globalScope){
		warn('nestedRequire', lookahead().lineNumber);
		return;
	}
	var token = lex();
	if (token.type === StringLiteral)
	while (token.type !== EOF){
		dependencies[token.value] |= Imported;
		if (match(','))
			lex();
		if (lookahead().type !== StringLiteral)
			break;
		token = lex();
	}
}

function scanExportsStatement(){
	if (scope !== globalScope){
		warn('nestedExport', lookahead().lineNumber);
		return;
	}
	if (matchKeyword('var'))
		scanVariableDeclarationList(Exported, DeclaredVariable);
	else if (matchKeyword('function'))
		scanFunctionDeclaration(Exported);
	else if (lookahead().type === Identifier)
		scanVariableDeclarationList(Exported, Undeclared);
	else
		warn('unknownExport', lookahead().lineNumber);
}

function scanStatement(){
	var token = lookahead();
	if (token.type === Identifier){
		lex();
		var identifier = token.value;
		if (match(':')){
			lex();
			var declarationToken = {
				type: 0,
				start: token.start,
				expressionStart: lookahead().start,
				end: 0
			};
			if (identifier === 'require'){
				if (scope === globalScope) scopeTokens.push(declarationToken);
				declarationToken.type = RequireStatement;
				scanRequireStatement();
			}
			if (identifier === 'exports'){
				if (scope === globalScope) scopeTokens.push(declarationToken);
				declarationToken.type = ExportsStatement;
				scanExportsStatement();
			}
			declarationToken.end = lookahead().start;
			if (match('{'))
				scanBlock();
		} else {
			scanIdentifierExpression(token);
		}
	}

	else if (matchKeyword('var'))
		scanVariableDeclarationList(Undeclared, DeclaredVariable);

	else if (matchKeyword('function'))
		scanFunctionDeclaration();

	else if (matchKeyword('catch'))
		scanCatchStatement();

	else if (matchBlockStart()){
		lex();
		if (match('{')) scanBlock();
	}

	else if (matchParenthesisBlockStart()){
		if (matchKeyword('with'))
			module.lexicalScope = false;
		lex();
		scanParenthesis();
		if (match('{')) scanBlock();
	}

	else if (match(',') || match(';'))
		lex();

	else
		scanExpression();	
}

function scanStatements(){
	var token = lookahead();
	while (token.type !== EOF && !match('}')){
		scanStatement();
		token = lookahead();
	}
}

function scanProgram(){
	var token = lookahead();
	if (token.type === StringLiteral && token.value === 'use strict'){
		lex();
		if (match(';')) token = lex();
		module.strict = token.end;
	}
	scanStatements();
}

function mapDependencies(dependency){
	var type = dependencies[dependency];
	if (type === Required){
		module.requires.push(dependency);
	} else if (type === Imported){
		module.requires.push(dependency);
		module.imports.push(dependency);
	}
}

function mapScope(identifier){
	var type = globalScope[identifier];
	if (type === Exported){
		warn('undeclaredExport', identifier);
		module.expectedVariables.push(identifier);
	}
	if ((type & ExportedFunction) === ExportedFunction)
		module.exportedFunctions.push(identifier);
	else if ((type & ExportedVariable) === ExportedVariable)
		module.exportedVariables.push(identifier);
	else if (type === ExportedProperty)
		module.exportedProperties.push(identifier);
	else if (type === DeclaredFunction)
		module.declaredFunctions.push(identifier);
	else if (type === DeclaredVariable)
		module.declaredVariables.push(identifier);
	else if (type === Undeclared)
		module.expectedVariables.push(identifier);
}

var enumFailures = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];
for (var i = 0; i < enumFailures.length; i++){
	var testObj = {};
	testObj[enumFailures[i]] = 1;
	for (var key in testObj)
		enumFailures.splice(i--, 1);
}

function parse(sourceCode){
	source = String(sourceCode);

	var m = module = new ModuleDefinition(sourceCode);

	// Reset
	index = 0;
	lineNumber = (source.length > 0) ? 1 : 0;
	length = source.length;
	scope = globalScope = m.lexicalEnvironment;
	scopeAliases = {};
	scopeTokens = m.tokens;
	dependencies = {};
	previousToken = buffer = null;

	// IE fix
	if (length > 0 && typeof source[0] === 'undefined'){
		source = [];
		for (var i = 0; i < length; i++)
			source[i] = sourceCode.charAt(i);
	}

	// Scan
	scanProgram();

	// Convert maps to arrays

	for (var key in globalScope) mapScope(key);

	for (var dependency in dependencies) mapDependencies(dependency);

	for (var i = 0, l = enumFailures.length; i < l; i++){
		mapScope(enumFailures[i]);
		mapDependencies(enumFailures[i]);
	}

	// Clean up
	module = globalScope = scope = scopeAliases = dependencies = buffer = source = null;

	return m;
}

}());