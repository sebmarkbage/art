(function(){
/*
* YASS 0.3.8 - The fastest CSS selectors JavaScript library
* Experimental branch of YASS - CSS3 selectors with cache only
*
* Copyright (c) 2008 Nikolay Matsievsky aka sunnybear (webo.in, webo.name)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2009-02-23 12:59:31 +3000 (Mon, 23 Feb 2009) $
* $Rev: 22 $
*/
/**
 * Returns number of nodes or an empty array
 * @param {String} CSS selector
 * @param {DOM node} root to look into
 * @param {Boolean} disable cache of not
 */
var _ = function (selector, root, noCache) {
/*
Subtree added, second argument, thx to tenshi.
Return cache if exists. Third argument.
Return not cached result if root specified, thx to Skiv
*/
	if (_.c[selector] && !noCache && !root) {
		return  _.c[selector];
	}
/* re-define noCache */
	noCache = noCache || !!root;
/* clean root with document */
	root = root || _.doc;
/* sets of nodes, to handle comma-separated selectors */
	var sets = [];
/* quick return or generic call, missed ~ in attributes selector */
	if (/^[\w[:#.][\w\]*^|=!]*$/.test(selector)) {
/*
some simple cases - only ID or only CLASS for the very first occurence
- don't need additional checks. Switch works as a hash.
*/
		var idx = 0;
/* the only call -- no cache, thx to GreLI */
		switch (selector.charAt(0)) {
			case '#':
				idx = selector.slice(1);
				sets = _.doc.getElementById(idx);
/*
workaround with IE bug about returning element by name not by ID.
Solution completely changed, thx to deerua.
Get all matching elements with this id
*/
				if (_.browser.ie && sets.id !== idx) {
					sets = _.doc.all[idx];
				}
				sets = sets ? [sets] : [];
				break;
			case '.':
				var klass = selector.slice(1);
				if (_.k) {
					sets = (idx = (sets = root.getElementsByClassName(klass)).length) ? sets : [];
				} else {
/* no RegExp, thx to DenVdmj */
					klass = ' ' + klass + ' ';
					var nodes = root.getElementsByTagName('*'),
						i = 0,
						node;
					while (node = nodes[i++]) {
						if ((' ' + node.className + ' ').indexOf(klass) != -1) {
							sets[idx++] = node;
						}

					}
					sets = idx ? sets : [];
				}
				break;
			case ':':
				var node,
					nodes = root.getElementsByTagName('*'),
					i = 0,
					ind = selector.replace(/[^(]*\(([^)]*)\)/,"$1"),
					mod = selector.replace(/\(.*/,'');
				while (node = nodes[i++]) {
					if (_.mods[mod] && !_.mods[mod](node, ind)) {
						sets[idx++] = node;
					}
				}
				sets = idx ? sets : [];
				break;
			case '[':
				var nodes = root.getElementsByTagName('*'),
					node,
					i = 0,
					attrs = /\[([^!~^*|$ [:=]+)([$^*|]?=)?([^ :\]]+)?\]/.exec(selector),
					attr = attrs[1],
					eql = attrs[2] || '',
					value = attrs[3];
				while (node = nodes[i++]) {
/* check either attr is defined for given node or it's equal to given value */
					if (_.attr[eql] && (_.attr[eql](node, attr, value) || (attr === 'class' && _.attr[eql](node, 'className', value)))) {
						sets[idx++] = node;
					}
				}
				sets = idx ? sets : [];
				break;
			default:
				sets = (idx = (sets = root.getElementsByTagName(selector)).length) ? sets : [];
				break;
		}
	} else {
/*
all other cases. Apply querySelector if exists.
All methods are called via . not [] - thx to arty
*/
		if (_.q && selector.indexOf('!=') == -1) {
			sets = root.querySelectorAll(selector);
/* generic function for complicated selectors */
		} else {
/* number of groups to merge or not result arrays */
/*
groups of selectors separated by commas.
Split by RegExp, thx to tenshi.
*/
			var groups = selector.split(/ *, */),
/* group counter */
				gl = groups.length - 1,
/* if we need to concat several groups */
				concat = !!gl,
				group,
				singles,
				singles_length,
/* to handle RegExp for single selector */
				single,
				i,
/* to remember ancestor call for next childs, default is " " */
				ancestor,
/* current set of nodes - to handle single selectors */
				nodes,
/* for inner looping */
				tag, id, klass, attr, eql, mod, ind, newNodes, idx, J, child, last, childs, item, h;
/* loop in groups, maybe the fastest way */
			while (group = groups[gl--]) {
/*
try to avoid work - check cache. Will glitch a few
on concatinating different results with one tag.
*/
				if (!(nodes = _.c[group]) || noCache) {
/*
Split selectors by space - to form single group tag-id-class,
or to get heredity operator. Replace + in child modificators
to % to avoid collisions. Additional replace is required for IE.
Replace ~ in attributes to & to avoid collisions.
*/	
					singles_length = (singles = group.replace(/(\([^)]*)\+/,"$1%").replace(/(\[[^\]]+)~/,"$1&").replace(/(~|>|\+)/," $1 ").split(/ +/)).length;
					i = 0;
					ancestor = ' ';
/* is cleanded up with DOM root */
					nodes = [root];
/*
John's Resig fast replace works a bit slower than
simple exec. Thx to GreLI for 'greed' RegExp
*/
					while (single = singles[i++]) {
/* simple comparison is faster than hash */
						if (single !== ' ' && single !== '>' && single !== '~' && single !== '+' && nodes) {
							single = single.match(/([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?:\:([^(]+)(?:\(([^)]+)\))?)?/);
/* 
Get all required matches from exec:
tag, id, class, attribute, value, modificator, index.
*/
							tag = single[1] || '*';
							id = single[2];
							klass = single[3] ? ' ' + single[3] + ' ' : '';
							attr = single[4];
							eql = single[5] || '';
							mod = single[7];
/*
for nth-childs modificator already transformed into array.
Example used from Sizzle, rev. 2008-12-05, line 362.
*/
							ind = mod === 'nth-child' || mod === 'nth-last-child' ? /(?:(-?\d*)n)?(?:(%|-)(\d*))?/.exec(single[8] === 'even' && '2n' || single[8] === 'odd' && '2n%1' || !/\D/.test(single[8]) && '0n%' + single[8] || single[8]) : single[8];
/* new nodes array */
							newNodes = [];
/* 
cached length of new nodes array
and length of root nodes
*/
							idx = J = 0;
/* if we need to mark node with expando yeasss */
							last = i == singles_length;
/* loop in all root nodes */
							while (child = nodes[J++]) {
/*
find all TAGs or just return all possible neibours.
Find correct 'children' for given node. They can be
direct childs, neighbours or something else.
*/
								switch (ancestor) {
									case ' ':
										childs = child.getElementsByTagName(tag);
										h = 0;
										while (item = childs[h++]) {
/*
check them for ID or Class. Also check for expando 'yeasss'
to filter non-selected elements. Typeof 'string' not added -
if we get element with name="id" it won't be equal to given ID string.
Also check for given attributes selector.
Modificator is either not set in the selector, or just has been nulled
by modificator functions hash.
*/
											if ((!id || item.id === id) && (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) && (!attr || (_.attr[eql] && (_.attr[eql](item, attr, single[6]) || (attr === 'class' && _.attr[eql](item, 'className', single[6]))))) && !item.yeasss && !(_.mods[mod] ? _.mods[mod](item, ind) : mod)) {
/* 
Need to define expando property to true for the last step.
Then mark selected element with expando
*/
												if (last) {
													item.yeasss = 1;
												}
												newNodes[idx++] = item;
											}
										}
										break;
/* W3C: "an F element preceded by an E element" */
									case '~':
										tag = tag.toLowerCase();
/* don't touch already selected elements */
										while ((child = child.nextSibling) && !child.yeasss) {
											if (child.nodeType == 1 && (tag === '*' || child.nodeName.toLowerCase() === tag) && (!id || child.id === id) && (!klass || (' ' + child.className + ' ').indexOf(klass) != -1) && (!attr || (_.attr[eql] && (_.attr[eql](item, attr, single[6]) || (attr === 'class' && _.attr[eql](item, 'className', single[6]))))) && !child.yeasss && !(_.mods[mod] ? _.mods[mod](child, ind) : mod)) {
												if (last) {
													child.yeasss = 1;
												}
												newNodes[idx++] = child;
											}
										}
										break;
/* W3C: "an F element immediately preceded by an E element" */
									case '+':
										while ((child = child.nextSibling) && child.nodeType != 1) {}
										if (child && (child.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') && (!id || child.id === id) && (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) && (!attr || (_.attr[eql] && (_.attr[eql](item, attr, single[6]) || (attr === 'class' && _.attr[eql](item, 'className', single[6]))))) && !child.yeasss && !(_.mods[mod] ? _.mods[mod](child, ind) : mod)) {
											if (last) {
												child.yeasss = 1;
											}
											newNodes[idx++] = child;
										}
										break;
/* W3C: "an F element child of an E element" */
									case '>':
										childs = child.getElementsByTagName(tag);
										i = 0;
										while (item = childs[i++]) {
											if (item.parentNode === child && (!id || item.id === id) && (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) && (!attr || (_.attr[eql] && (_.attr[eql](item, attr, single[6]) || (attr === 'class' && _.attr[eql](item, 'className', single[6]))))) && !item.yeasss && !(_.mods[mod] ? _.mods[mod](item, ind) : mod)) {
												if (last) {
													item.yeasss = 1;
												}
												newNodes[idx++] = item;
											}
										}
										break;
								}
							}
/* put selected nodes in local nodes' set */
							nodes = newNodes;
						} else {
/* switch ancestor ( , > , ~ , +) */
							ancestor = single;
						}
					}
				}
				if (concat) {
/* if sets isn't an array - create new one */
					if (!nodes.concat) {
						newNodes = [];
						h = 0;
						while (item = nodes[h]) {
							newNodes[h++] = item;
						}
						nodes = newNodes;
/* concat is faster than simple looping */
					}
					sets = nodes.concat(sets.length == 1 ? sets[0] : sets);
				} else {
/* inialize sets with nodes */
					sets = nodes;
				}
			}
/* define sets length to clean up expando */
			idx = sets.length;
/*
Need this looping as far as we also have expando 'yeasss'
that must be nulled. Need this only to generic case
*/
			while (idx--) {
				sets[idx].yeasss = sets[idx].nodeIndex = sets[idx].nodeIndexLast = null;
			}
		}
	}
/* return and cache results */
	return noCache ? sets : _.c[selector] = sets;
};
/* cache for selected nodes, no leaks in IE detected */
_.c = [];
/* caching global document */
_.doc = document;
/* caching global window */
_.win = window;
/* function calls for CSS2/3 attributes selectors */
_.attr = {
/* W3C "an E element with a "attr" attribute" */
	'': function (child, attr) {
		return !!child.getAttribute(attr);
	},
/*
W3C "an E element whose "attr" attribute value is
exactly equal to "value"
*/
	'=': function (child, attr, value) {
		return (attr = child.getAttribute(attr)) && attr === value;
	},
/*
from w3.prg "an E element whose "attr" attribute value is
a list of space-separated values, one of which is exactly
equal to "value"
*/
	'&=': function (child, attr, value) {
		return (attr = child.getAttribute(attr)) && (new RegExp('(^| +)' + value + '($| +)').test(attr));
	},
/*
from w3.prg "an E element whose "attr" attribute value
begins exactly with the string "value"
*/
	'^=': function (child, attr, value) {
		return (attr = child.getAttribute(attr) + '') && !attr.indexOf(value);
	},
/*
W3C "an E element whose "attr" attribute value
ends exactly with the string "value"
*/
	'$=': function (child, attr, value) {
		return (attr = child.getAttribute(attr) + '') && attr.indexOf(value) == attr.length - value.length;
	},
/*
W3C "an E element whose "attr" attribute value
contains the substring "value"
*/
	'*=': function (child, attr, value) {
		return (attr = child.getAttribute(attr) + '') && attr.indexOf(value) != -1;
	},
/*
W3C "an E element whose "attr" attribute has
a hyphen-separated list of values beginning (from the
left) with "value"
*/
	'|=': function (child, attr, value) {
		return (attr = child.getAttribute(attr) + '') && (attr === value || !!attr.indexOf(value + '-'));
	},
/* attr doesn't contain given value */
	'!=': function (child, attr, value) {
		return !(attr = child.getAttribute(attr)) || !(new RegExp('(^| +)' + value + '($| +)').test(attr));
	}
};
/*
function calls for CSS2/3 modificatos. Specification taken from
http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
on success return negative result.
*/
_.mods = {
/* W3C: "an E element, first child of its parent" */
	'first-child': function (child) {
/* implementation was taken from jQuery.1.2.6, line 1394 */
			return child.parentNode.getElementsByTagName('*')[0] !== child;
		},
/* W3C: "an E element, last child of its parent" */
	'last-child': function (child) {
			var brother = child;
/* loop in lastChilds while nodeType isn't element */
			while ((brother = brother.nextSibling) && brother.nodeType != 1) {}
/* Check for node's existence */
			return !!brother;
		},
/* W3C: "an E element, root of the document" */
	root: function (child) {
			return child.nodeName.toLowerCase() !== 'html';
		},
/* W3C: "an E element, the n-th child of its parent" */
	'nth-child': function (child, ind) {
		var i = child.nodeIndex || 0,
			a = ind[3] = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
			b = ind[1];
/* check if we have already looked into siblings, using exando - very bad */
		if (i) {
			return !( (i + a) % b);
		} else {
/* in the other case just reverse logic for n and loop siblings */
			var brother = child.parentNode.firstChild;
			i++;
/* looping in child to find if nth expression is correct */
			do {
/* nodeIndex expando used from Peppy / Sizzle/ jQuery */
				if (brother.nodeType == 1 && (brother.nodeIndex = ++i) && child === brother && ((i + a) % b)) {
					return 0;
				}
			} while (brother = brother.nextSibling);
			return 1;
		}
	},
/*
W3C: "an E element, the n-th child of its parent,
counting from the last one"
*/
	'nth-last-child': function (child, ind) {
/* almost the same as the previous one */
		var i = child.nodeIndexLast || 0,
			a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
			b = ind[1];
		if (i) {
			return !( (i + a) % b);
		} else {
			var brother = child.parentNode.lastChild;
			i++;
			do {
				if (brother.nodeType == 1 && (brother.nodeLastIndex = i++) && child === brother && ((i + a) % b)) {
					return 0;
				}
			} while (brother = brother.previousSibling);
			return 1;
		}
	},
/*
Rrom w3.org: "an E element that has no children (including text nodes)".
Thx to John, from Sizzle, 2008-12-05, line 416
*/
	empty: function (child) {
			return !!child.firstChild;
		},
/* thx to John, stolen from Sizzle, 2008-12-05, line 413 */
	parent: function (child) {
			return !child.firstChild;
		},
/* W3C: "an E element, only child of its parent" */
	'only-child': function (child) {
			return child.parentNode.getElementsByTagName('*').length != 1;
		},
/*
W3C: "a user interface element E which is checked
(for instance a radio-button or checkbox)"
*/
	checked: function (child) {
			return !child.checked;
		},
/*
W3C: "an element of type E in language "fr"
(the document language specifies how language is determined)"
*/
	lang: function (child, ind) {
			return child.lang !== ind && _.doc.documentElement.lang !== ind;
		},
/* thx to John, from Sizzle, 2008-12-05, line 398 */
	enabled: function (child) {
			return child.disabled || child.type === 'hidden';
		},
/* thx to John, from Sizzle, 2008-12-05, line 401 */
	disabled: function (child) {
			return !child.disabled;
		},
/* thx to John, from Sizzle, 2008-12-05, line 407 */
	selected: function(elem){
/*
Accessing this property makes selected-by-default
options in Safari work properly.
*/
      child.parentNode.selectedIndex;
      return !child.selected;
    }
};
/* browser sniffing */
_.ua = navigator.userAgent.toLowerCase();
/* cached check for querySelectorAll */
_.q = !!_.doc.querySelectorAll;
/* cached check for getElementsByClassName */
_.k = !!_.doc.getElementsByClassName;
/* code for DOM ready and browsers detection taken from jQuery */
_.browser = {
	safari: _.ua.indexOf('webkit') != -1,
	opera: _.ua.indexOf('opera') != -1,
	ie: _.ua.indexOf('msie') != -1 && _.ua.indexOf('opera') == -1,
	mozilla: _.ua.indexOf('mozilla') != -1 && (_.ua.indexOf('compatible') + _.ua.indexOf('webkit') == -2)
};
/* initialization as a global var */
window.yass = _;
/* do not override existing window._ */
window._ = window._ || _;
})();