// -*- Mode: JavaScript; tab-width: 4; -*-
var local = {};
local.collectionToArray = function(node){
   return Array.prototype.slice.call(node);
};
try{
    local.collectionToArray(root.childNodes);
}
catch(e){
	local.collectionToArray = function(node){
		if (node instanceof Array) return node;
		var i = node.length, array = new Array(i);
		while (i--) array[i] = node[i];
		return array;
	};
}

function qsaMatch(node, selector){
	var results = local.collectionToArray(node.ownerDocument.querySelectorAll(selector));
	for (var i=0; i < results.length; i++) if (results[i] === node) return true;
	return false;
}

function benchmarkSelectors(context){
	
	var selectors = global.selectors;
	if (global.disableQSA) {
		try{
			context.document.querySelector = null;
			context.Element.prototype.querySelectorAll = null;
			context.document.querySelector = null;
			context.Element.prototype.querySelector = null;
		}catch(e){}
	}
	
	global.SlickLast.debug = function(error){
		throw error;
	};
	global.SlickThis.debug = function(error){
		throw error;
	};
	
	if (context.document.querySelectorAll) {
		// JSLitmus.test('QSA Array', _benchmarkSelectors(qsaMatch, context, selectors));
		JSLitmus.test('Slick WIP', _benchmarkSelectors(function(node,selector){ return global.SlickThis.match(node,selector); }, context, selectors, function(){global.SlickThis.disableQSA = false;}));
		JSLitmus.test('Slick Stable', _benchmarkSelectors(function(node,selector){ return global.SlickLast.match(node,selector); }, context, selectors, function(){global.SlickLast.disableQSA = false;}));
	}
	else {
		JSLitmus.test('Slick WIP noQSA', _benchmarkSelectors(function(node,selector){ return global.SlickThis.match(node,selector); }, context, selectors, function(){global.SlickThis.disableQSA = true;}));
		JSLitmus.test('Slick Stable noQSA', _benchmarkSelectors(function(node,selector){ return global.SlickLast.match(node,selector); }, context, selectors, function(){global.SlickLast.disableQSA = true;})); 
	}
	
	if (global.Sizzle) {
		JSLitmus.test('Sizzle', _benchmarkSelectors(function(node,selector){ return !!global.Sizzle.matches(selector,[node]).length; }, context, selectors));
	}
	
	if (global.NW) {
		JSLitmus.test('NWm', _benchmarkSelectors(function(node,selector){ return global.NW.Dom.match(node,selector); }, context, selectors));
	}
	
	// if (global.yass) {
	// 	// global.yass.setCache(false);
	// 	JSLitmus.test('YASS', _benchmarkSelectors(function(doc,selector){ return global.yass(selector,doc,true); }, context, selectors));
	// }
	
	if (global.Sly) {
		JSLitmus.test('Sly', _benchmarkSelectors(function(doc,selector){ return global.Sly.match(selector,doc); }, context, selectors));
	}
}

function _benchmarkSelectors(MATCH, context, selectors, before, after){
	function __benchmarkSelectors(count){
		var document = context.document;
		var i, ii, node, l;
		var elements = document.getElementsByTagName('*');
		before = before || function(){};
		after = after || function(){};
		before(context);
		var results = {};
		
		while (count--){
			for (ii=0; ii < selectors.length; ii++) if (selectors[ii]){
				results[selectors[ii]] = 0;
				for (var Ei=0, node; node = elements[Ei++];) {
					try {
						if (MATCH(node, selectors[ii])) results[selectors[ii]] ++;
					} catch(error) {
						results[selectors[ii]] = results[selectors[ii]] + error.message;
					}
				}
				results[selectors[ii]] = results[selectors[ii]];
			}
		}
		after(context);
		return results;
	}
	return __benchmarkSelectors;
};
