var otherModes = [
	require('../../modes/vml'),
	require('../../modes/svg'),
//	require('../../modes/script'),
	require('../../modes/canvas')
];
var ART = require('../../index');

var result = [];

function log(){
	result.push.apply(result, arguments);
	result.push('\n');
}



function isMethodInAllTheModes(name, prop){
	return !otherModes.some(function(mode){
		return mode[name] && !mode[name].prototype[prop];
	});
}

function getArgumentNames(fn){
	var code = fn.toString(),
		startOfParam = code.indexOf('(') + 1,
		endOfParam = code.indexOf(')');
	if (startOfParam == endOfParam) return '';
	return code.substring(startOfParam, endOfParam);
}

function logPrototypeProperty(obj, key){
	if (key.indexOf('_') > -1) return;
	var v = obj[key];
	if (key == 'draw') v = obj._draw_function || v;
	if (typeof v == 'function'){
		log(': ', key, '(', getArgumentNames(v), ')');
	} else {
		log(': ', key);
	}
}

function logInstanceProperty(obj, key){
	if (key.indexOf('_') > -1) return;
	var v = obj[key];
	if (typeof v == 'function'){
		log('. ', key, '(', getArgumentNames(v), ')');
	} else {
		log('. ', key);
	}
}

for (var name in ART){
	var v = ART[name].prototype._draw_function || ART[name].prototype.initialize;
	if (typeof v !== 'function')
		v = ART[name];

	log(name, '(', getArgumentNames(v), ')');

	Object.keys(ART[name]).sort().forEach(function(key){
		logInstanceProperty(ART[name], key);
	});

	var prototype = ART[name].prototype;
	Object.keys(prototype).sort().forEach(function(key){

		if (key == 'initialize' || key == 'constructor' || key == '_draw_function')
			return;

		if (name !== 'Transform' && ART.Transform.prototype[key] === prototype[key])
			return;

		if (name !== 'Transform' && name !== 'Shape' && name !== 'Group' && name !== 'Text' && ART.Shape.prototype[key] === prototype[key])
			return;

		if (isMethodInAllTheModes(name, key) || key == 'blend' || key == 'eject' || key == 'inject')
			logPrototypeProperty(prototype, key);
	});
	log('');
}

var ta = document.createElement('textarea');
ta.style.width = '500px';
ta.style.height = '500px';
ta.value = result.join('');
document.body.appendChild(ta);