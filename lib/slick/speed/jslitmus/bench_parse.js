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


function benchmarkParser(specs,context){
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
	
	it['THIS.parse'] = _benchmarkParser(global.SlickThis.parse, context, selectors);
	it['LAST.parse'] = _benchmarkParser(global.SlickLast.parse, context, selectors); 
}

function _benchmarkParser(PARSE,context,selectors,before,after){
	function __benchmarkParser(count){
		var document = context.document;
		var i, ii, node, l;
		var elements = PARSE('*');
		before = before || function(){};
		after = after || function(){};
		before(context);
		var results = {};
		
		while(count--){
			for (ii=0; ii < selectors.length; ii++) if (selectors[ii]){
				
				for (var property in PARSE.cache) { PARSE.cache[property] = null; }
				for (var property in PARSE.reverseCache) { PARSE.cache[property] = null; }
				try{
					results[selectors[ii]] = PARSE(selectors[ii]).length;
				}catch(error){
					results[selectors[ii]] = error;
				}
				
			}
		}
		after(context);
		return results;
	}
	return __benchmarkParser;
};
