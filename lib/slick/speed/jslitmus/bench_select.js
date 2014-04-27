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


function benchmarkSelectors(specs,context){
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
		it['QSA Array'] = _benchmarkSelectors(function(searchContext,selector){
			try{
				return local.collectionToArray(searchContext.querySelectorAll.call(searchContext,selector));
			}catch(e){}
		}, context, selectors);
		
		it['Slick WIP'] = _benchmarkSelectors(function(searchContext,selector){ return global.SlickThis.search(searchContext,selector); }, context, selectors, function(){global.SlickThis.disableQSA = false;});
		it['Slick Stable'] = _benchmarkSelectors(function(searchContext,selector){ return global.SlickLast.search(searchContext,selector); }, context, selectors, function(){global.SlickLast.disableQSA = false;});
	}
	
	it['Slick WIP noQSA'] = _benchmarkSelectors(function(searchContext,selector){ return global.SlickThis.search(searchContext,selector); }, context, selectors, function(){global.SlickThis.disableQSA = true;});
	it['Slick Stable noQSA'] = _benchmarkSelectors(function(searchContext,selector){ return global.SlickLast.search(searchContext,selector); }, context, selectors, function(){global.SlickLast.disableQSA = true;}); 
	
	if (global.Sizzle) {
		it['Sizzle'] = _benchmarkSelectors(function(searchContext,selector){ return global.Sizzle(selector,searchContext); }, context, selectors);
	}
	
	if (global.NW) {
		// global.NW.Dom.setCache(false);
		it['NWm'] = _benchmarkSelectors(function(searchContext,selector){ return global.NW.Dom.select(selector,searchContext); }, context, selectors);
	}
	
	// if (global.yass) {
	// 	// global.yass.setCache(false);
	// 	it['YASS'] = _benchmarkSelectors(function(doc,selector){ return global.yass(selector,doc,true); }, context, selectors);
	// }
	
	// if (global.Sly) {
	// 	it['Sly'] = _benchmarkSelectors(function(doc,selector){ return global.Sly.search(selector,doc); }, context, selectors);
	// }
}

function _benchmarkSelectors(SELECT,context,selectors,before,after){
	function __benchmarkSelectors(count){
		var document = context.document;
		var i, ii, node, l;
		var elements = SELECT(document,'*');
		before = before || function(){};
		after = after || function(){};
		before(context);
		var results = {};
		// if (global.console && global.console.profile){
		// 	global.console.profile(SELECT+disableQSA);
		// 	for (ii=0; ii < selectors.length; ii++) {
		// 		// for (i=0; node = elements[i++];) { node._slickUID = node._cssId = null; };
		// 		SELECT(document, selectors[ii]);
		// 	}
		// 	global.console.profileEnd(SELECT+disableQSA);
		// }
		
		while(count--){
			for (ii=0; ii < selectors.length; ii++) if (selectors[ii]){
				
				// for (i=0; node = elements[i++];) { node._slickUID = node._cssId = null; };
				try{
					results[selectors[ii]] = SELECT(document, selectors[ii]).length;
				}catch(error){
					results[selectors[ii]] = error;
					try{console.log( selectors[ii] );}catch(e){};
					setTimeout(function(){throw error}, 0);
				}
				
			}
		}
		after(context);
		return results;
	}
	return __benchmarkSelectors;
};
