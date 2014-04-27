/*
curl -s http://domassistant.googlecode.com/files/DOMAssistantComplete-2.7.4.js #*/
// Developed by Robert Nyman/DOMAssistant team, code/licensing: http://code.google.com/p/domassistant/, documentation: http://www.domassistant.com/documentation, version 2.7.4
var DOMAssistant = function () {
	var HTMLArray = function () {
		// Constructor
	};
	var isIE = /*@cc_on!@*/false;
	var ie5 = isIE && parseFloat(navigator.appVersion) < 6;
	var tagCache = {}, lastCache = {}, useCache = true;
	var camel = {
		"accesskey": "accessKey",
		"class": "className",
		"colspan": "colSpan",
		"for": "htmlFor",
		"maxlength": "maxLength",
		"readonly": "readOnly",
		"rowspan": "rowSpan",
		"tabindex": "tabIndex",
		"valign": "vAlign",
		"cellspacing": "cellSpacing",
		"cellpadding": "cellPadding"
	};
	var regex = {
		rules: /\s*(,)\s*/g,
		selector: /^(\w+)?(#[\w\u00C0-\uFFFF\-\_]+|(\*))?((\.[\w\u00C0-\uFFFF\-_]+)*)?((\[\w+\s*(\^|\$|\*|\||~)?(=\s*([\w\u00C0-\uFFFF\s\-\_\.]+|"[^"]*"|'[^']*'))?\]+)*)?(((:\w+[\w\-]*)(\((odd|even|\-?\d*n?((\+|\-)\d+)?|[\w\u00C0-\uFFFF\-_\.]+|"[^"]*"|'[^']*'|((\w*\.[\w\u00C0-\uFFFF\-_]+)*)?|(\[#?\w+(\^|\$|\*|\||~)?=?[\w\u00C0-\uFFFF\s\-\_\.\'\"]+\]+)|(:\w+[\w\-]*))\))?)*)?(>|\+|~)?/,
		id: /^#([\w\u00C0-\uFFFF\-\_]+)$/,
		tag: /^(\w+)/,
		relation: /^(>|\+|~)$/,
		pseudo: /^:(\w[\w\-]*)(\((.+)\))?$/,
		pseudos: /:(\w[\w\-]*)(\(([^\)]+)\))?/g,
		attribs: /\[(\w+)\s*(\^|\$|\*|\||~)?=?\s*([\w\u00C0-\uFFFF\s\-_\.]+|"[^"]*"|'[^']*')?\]/g,
		classes: /\.([\w\u00C0-\uFFFF\-_]+)/g,
		quoted: /^["'](.*)["']$/,
		nth: /^((odd|even)|([1-9]\d*)|((([1-9]\d*)?)n([\+\-]\d+)?)|(\-(([1-9]\d*)?)n\+(\d+)))$/
	};
	var pushAll = function (set1, set2) {
		set1.push.apply(set1, [].slice.apply(set2));
		return set1;
	};
	if (isIE) {
		pushAll = function (set1, set2) {
			if (set2.slice) {
				return set1.concat(set2);
			}
			var i=0, item;
			while ((item = set2[i++])) {
				set1[set1.length] = item;
			}
			return set1;
		};
	}
	var contains = function (array, value) {
		if (array.indexOf) { return array.indexOf(value) >= 0; }
		for (var i=0, iL=array.length; i<iL; i++) {
			if (array[i] === value) { return true; }
		}
		return false;
	};
	var isDescendant = function (node, ancestor) {
		var parent = node.parentNode;
		return ancestor === document || parent === ancestor || (parent !== document && isDescendant(parent, ancestor));
	};
	return {
		isIE : isIE,
		camel : camel,
		allMethods : [],
		publicMethods : [
			"cssSelect",
			"elmsByClass",
			"elmsByAttribute",
			"elmsByTag"
		],
		
		initCore : function () {
			this.applyMethod.call(window, "$", this.$);
			this.applyMethod.call(window, "$$", this.$$);
			window.DOMAssistant = this;
			if (isIE) {
				HTMLArray = Array;
			}
			HTMLArray.prototype = [];
			HTMLArray.prototype.each = function (functionCall) {
				for (var i=0, il=this.length; i<il; i++) {
					functionCall.call(this[i]);
				}
				return this;
			};
			HTMLArray.prototype.first = function () {
				return (typeof this[0] !== "undefined")? DOMAssistant.addMethodsToElm(this[0]) : null;
			};
			HTMLArray.prototype.end = function () {
				return this.previousSet;
			};
			this.attach(this);
		},
		
		addMethods : function (name, method) {
			if (typeof this.allMethods[name] === "undefined") {
				this.allMethods[name] = method;
				this.addHTMLArrayPrototype(name, method);
			}
		},
		
		addMethodsToElm : function (elm) {
			for (var method in this.allMethods) {
				if (typeof this.allMethods[method] !== "undefined") {
					this.applyMethod.call(elm, method, this.allMethods[method]);
				}
			}
			return elm;
		},
		
		applyMethod : function (method, func) {
			if (typeof this[method] !== "function") {
				this[method] = func;
			}
		},
		
		attach : function (plugin) {
			var publicMethods = plugin.publicMethods;
			if (typeof publicMethods === "undefined") {
				for (var method in plugin) {
					if (method !== "init" && typeof plugin[method] !== "undefined") {
						this.addMethods(method, plugin[method]);
					}
				}
			}
			else if (publicMethods.constructor === Array) {
				for (var i=0, current; (current=publicMethods[i]); i++) {
					this.addMethods(current, plugin[current]);
				}
			}
			if (typeof plugin.init === "function") {
				plugin.init();
			}
		},
		
		addHTMLArrayPrototype : function (name, method) {
			HTMLArray.prototype[name] = function () {
				var elmsToReturn = new HTMLArray();
				elmsToReturn.previousSet = this;
				var elms;
				for (var i=0, il=this.length; i<il; i++) {
					elms = method.apply(this[i], arguments);
					if (!!elms && elms.constructor === Array) {
						elmsToReturn = pushAll(elmsToReturn, elms);
					}
					else {
						elmsToReturn.push(elms);
					}
				}
				return elmsToReturn;
			};
		},
		
		clearHandlers : function () {
			var children = this.all || this.getElementsByTagName("*");
			for (var i=0, child, attr; (child=children[i++]);) {
				if ((attr = child.attributes)) {
					for (var j=0, jl=attr.length, att; j<jl; j++) {
						att = attr[j].nodeName.toLowerCase();
						if (typeof child[att] === "function") {
							child[att] = null;
						}
					}
				}
			}
		},
		
		setCache : function (cache) {
			useCache = cache;
		},
		
		$ : function () {
			var obj = arguments[0];
			if (arguments.length === 1 && (typeof obj === "object" || (typeof obj === "function" && !!obj.nodeName))) {
				return DOMAssistant.$$(obj);
			}
			var elm = new HTMLArray();
			for (var i=0, arg, idMatch; (arg=arguments[i]); i++) {
				if (typeof arg === "string") {
					arg = arg.replace(/^[^#]*(#)/, "$1");
					if (regex.id.test(arg)) {
						if ((idMatch = DOMAssistant.$$(arg.substr(1), false))) {
							elm.push(idMatch);
						}
					}
					else {
						var doc = (document.all || document.getElementsByTagName("*")).length;
						elm = (!document.querySelectorAll && useCache && lastCache.rule && lastCache.rule === arg && lastCache.doc === doc)? lastCache.elms : pushAll(elm, DOMAssistant.cssSelection.call(document, arg));
						lastCache = { rule: arg, elms: elm, doc: doc };
					}
				}
			}
			return elm;
		},
		
		$$ : function (id, addMethods) {
			var elm = (typeof id === "object" || (typeof id === "function" && !!id.nodeName))? id : document.getElementById(id);
			var applyMethods = addMethods || true;
			if (typeof id === "string" && elm && elm.id !== id) {
				elm = null;
				for (var i=0, item; (item=document.all[i]); i++) {
					if (item.id === id) {
						elm = item;
						break;
					}
				}
			}
			if (elm && applyMethods) {
				DOMAssistant.addMethodsToElm(elm);
			}
			return elm;
		},
		
		getSequence : function (expression) {
			var start, add = 2, max = -1, modVal = -1,
				pseudoValue = regex.nth.exec(expression.replace(/^0n\+/, "").replace(/^2n$/, "even").replace(/^2n+1$/, "odd"));
			if (!pseudoValue) {
				return null;
			}
			if (pseudoValue[2]) {	// odd or even
				start = (pseudoValue[2] === "odd")? 1 : 2;
				modVal = (start === 1)? 1 : 0;
			}
			else if (pseudoValue[3]) {	// single digit
				start = parseInt(pseudoValue[3], 10);
				add = 0;
				max = start;
			}
			else if (pseudoValue[4]) {	// an+b
				add = pseudoValue[6]? parseInt(pseudoValue[6], 10) : 1;
				start = pseudoValue[7]? parseInt(pseudoValue[7], 10) : 0;
				while (start < 1) {
					start += add;
				}
				modVal = (start > add)? (start - add) % add : ((start === add)? 0 : start);
			}
			else if (pseudoValue[8]) {	// -an+b
				add = pseudoValue[10]? parseInt(pseudoValue[10], 10) : 1;
				start = max = parseInt(pseudoValue[11], 10);
				while (start > add) {
					start -= add;
				}
				modVal = (max > add)? (max - add) % add : ((max === add)? 0 : max);
			}
			return { start: start, add: add, max: max, modVal: modVal };
		},
		
		cssByDOM : function (cssRule) {
			var cssRules = cssRule.replace(regex.rules, "$1").split(",");
			var elm = new HTMLArray(), prevElm = [], matchingElms = [];
			var selectorSplitRegExp, prevParents, currentRule, cssSelectors, childOrSiblingRef, nextTag, nextRegExp, current, previous, prevParent, notElm, addElm, iteratorNext, childElm, sequence;
			try {
				selectorSplitRegExp = new RegExp("(?:\\[[^\\[]*\\]|\\(.*\\)|[^\\s\\+>~\\[\\(])+|[\\+>~]", "g");
			}
			catch (e) {
				selectorSplitRegExp = /[^\s]+/g;
			}
			function clearAdded (elm) {
				elm = elm || prevElm;
				for (var n=0, nl=elm.length; n<nl; n++) {
					elm[n].added = null;
				}
			}
			function clearChildElms () {
				for (var n=0, nl=prevParents.length; n<nl; n++) {
					prevParents[n].childElms = null;
				}
			}
			function subtractArray (arr1, arr2) {
				for (var i=0, src1; (src1=arr1[i]); i++) {
					var found = false;
					for (var j=0, src2; (src2=arr2[j]); j++) {
						if (src2 === src1) {
							found = true;
							arr2.splice(j, 1);
							break;
						}
					}
					if (found) {
						arr1.splice(i--, 1);
					}
				}
				return arr1;
			}
			function getAttr (elm, attr) {
				return isIE? elm[camel[attr.toLowerCase()] || attr] : elm.getAttribute(attr, 2);
			}
			function attrToRegExp (attrVal, substrOperator) {
				attrVal = attrVal? attrVal.replace(regex.quoted, "$1").replace(/\./g, "\\.") : null;
				switch (substrOperator) {
					case "^": return "^" + attrVal;
					case "$": return attrVal + "$";
					case "*": return attrVal;
					case "|": return "^" + attrVal + "(\\-\\w+)*$";
					case "~": return "\\b" + attrVal + "\\b";
					default: return attrVal? "^" + attrVal + "$" : null;
				}
			}
			function getTags (tag, context) {
				return ie5? ((tag === "*")? context.all : context.all.tags(tag)) : context.getElementsByTagName(tag);
			}
			function getElementsByTagName (tag, parent) {
				tag = tag || "*";
				parent = parent || document;
				return (parent === document || parent.lastModified)? tagCache[tag] || (tagCache[tag] = getTags(tag, document)) : getTags(tag, parent);
			}
			function getElementsByPseudo (previousMatch, pseudoClass, pseudoValue) {
				prevParents = [];
				var pseudo = pseudoClass.split("-"), matchingElms = [], idx = 0, checkNodeName, recur;
				var prop = (checkNodeName = /\-of\-type$/.test(pseudoClass))? "nodeName" : "nodeType";
				function getPrevElm(elm) {
					var val = checkNodeName? elm.nodeName : 1;
					while ((elm = elm.previousSibling) && elm[prop] !== val) {}
					return elm;
				}
				function getNextElm(elm) {
					var val = checkNodeName? elm.nodeName : 1;
					while ((elm = elm.nextSibling) && elm[prop] !== val) {}
					return elm;
				}
				var match = {
					first: function(el) { return !getPrevElm(el); },
					last: function(el) { return !getNextElm(el); },
					empty: function(el) { return !el.childNodes.length; },
					enabled: function(el) { return !previous.disabled && previous.type !== "hidden"; },
					disabled: function(el) { return previous.disabled; },
					checked: function(el) { return previous.checked; },
					contains: function(el) { return (previous.innerText || previous.textContent || "").indexOf(pseudoValue.replace(regex.quoted, "$1")) > -1; },
					other: function(el) { return getAttr(previous, pseudoClass) === pseudoValue; }
				};
				function basicMatch(key) {
					while ((previous=previousMatch[idx++])) {
						if (match[key](previous)) {
							matchingElms[matchingElms.length] = previous;
						}
					}
					return matchingElms;
				}
				var word = pseudo[0] || null;
				if (word && match[word]) {
					return basicMatch(word);
				}
				switch (word) {
					case "only":
						var kParent;
						while ((previous=previousMatch[idx++])) {
							prevParent = previous.parentNode;
							if (prevParent !== kParent) {
								if (!getPrevElm(previous) && !getNextElm(previous)) {
									matchingElms[matchingElms.length] = previous;
								}
								kParent = prevParent;
							}
						}
						break;
					case "nth":
						if (/^n$/.test(pseudoValue)) {
							matchingElms = previousMatch;
						}
						else {
							var direction = (pseudo[1] === "last")? ["lastChild", "previousSibling"] : ["firstChild", "nextSibling"];
							sequence = DOMAssistant.getSequence.call(this, pseudoValue);
							if (sequence) {
								while ((previous=previousMatch[idx++])) {
									prevParent = previous.parentNode;
									if (!prevParent.childElms) {
										var childCount = 0, p = previous.nodeName;
										iteratorNext = sequence.start;
										childElm = prevParent[direction[0]];
										while (childElm && (sequence.max < 0 || iteratorNext <= sequence.max)) {
											var c = childElm.nodeName;
											if ((checkNodeName && c === p) || (!checkNodeName && childElm.nodeType === 1)) {
												if (++childCount === iteratorNext) {
													if (c === p) { matchingElms[matchingElms.length] = childElm; }
													iteratorNext += sequence.add;
												}
											}
											childElm = childElm[direction[1]];
										}
										prevParent.childElms = true;
										prevParents[prevParents.length] = prevParent;
									}
								}
								clearChildElms();
							}
						}
						break;
					case "target":
						var hash = document.location.hash.slice(1);
						if (hash) {
							while ((previous=previousMatch[idx++])) {
								if (getAttr(previous, "name") === hash || getAttr(previous, "id") === hash) {
									matchingElms[matchingElms.length] = previous;
									break;
								}
							}
						}
						break;
					case "not":
						if ((recur = regex.pseudo.exec(pseudoValue))) {
							matchingElms = subtractArray(previousMatch, getElementsByPseudo(previousMatch, recur[1]? recur[1].toLowerCase() : null, recur[3] || null));
						}
						else {
							for (var re in regex) {
								if (regex[re].lastIndex) {
									regex[re].lastIndex = 0;
								}
							}
							pseudoValue = pseudoValue.replace(regex.id, "[id=$1]");
							var notTag = regex.tag.exec(pseudoValue);
							var notClass = regex.classes.exec(pseudoValue);
							var notAttr = regex.attribs.exec(pseudoValue);
							var notRegExp = new RegExp(notAttr? attrToRegExp(notAttr[3], notAttr[2]) : "(^|\\s)" + (notTag? notTag[1] : notClass? notClass[1] : "") + "(\\s|$)", "i");
							while ((notElm=previousMatch[idx++])) {
								addElm = null;
								if (notTag && !notRegExp.test(notElm.nodeName)) {
									addElm = notElm;
								}
								else if (notClass && !notRegExp.test(notElm.className)) {
									addElm = notElm;
								}
								else if (notAttr) {
									var att = getAttr(notElm, notAttr[1]);
									if (!att || !notRegExp.test(att)) {
										addElm = notElm;
									}
								}
								if (addElm && !addElm.added) {
									addElm.added = true;
									matchingElms[matchingElms.length] = addElm;
								}
							}
						}
						break;
					default: return basicMatch("other");
				}
				return matchingElms;
			}
			for (var a=0; (currentRule=cssRules[a]); a++) {
				if (a && contains(cssRules.slice(0, a), currentRule)) { continue; }
				prevElm = [this];
				cssSelectors = currentRule.match(selectorSplitRegExp);
				for (var i=0, rule; (rule=cssSelectors[i]); i++) {
					matchingElms = [];
					if (i > 0 && regex.relation.test(rule)) {
						if ((childOrSiblingRef = regex.relation.exec(rule))) {
							var idElm = null, nextWord = cssSelectors[i+1];
							if ((nextTag = regex.tag.exec(nextWord))) {
								nextTag = nextTag[1];
								nextRegExp = new RegExp("(^|\\s)" + nextTag + "(\\s|$)", "i");
							}
							else if (regex.id.test(nextWord)) {
								idElm = DOMAssistant.$(nextWord) || null;
							}
							for (var j=0, prevRef; (prevRef=prevElm[j]); j++) {
								switch (childOrSiblingRef[0]) {
									case ">":
										var children = idElm || getElementsByTagName(nextTag, prevRef);
										for (var k=0, child; (child=children[k]); k++) {
											if (child.parentNode === prevRef) {
												matchingElms[matchingElms.length] = child;
											}
										}
										break;
									case "+":
										while ((prevRef = prevRef.nextSibling) && prevRef.nodeType !== 1) {}
										if (prevRef) {
											if ((idElm && idElm[0] === prevRef) || (!idElm && (!nextTag || nextRegExp.test(prevRef.nodeName)))) {
												matchingElms[matchingElms.length] = prevRef;
											}
										}
										break;
									case "~":
										while ((prevRef = prevRef.nextSibling) && !prevRef.added) {
											if ((idElm && idElm[0] === prevRef) || (!idElm && (!nextTag || nextRegExp.test(prevRef.nodeName)))) {
												prevRef.added = true;
												matchingElms[matchingElms.length] = prevRef;
											}
										}
										break;
								}
							}
							prevElm = matchingElms;
							clearAdded();
							rule = cssSelectors[++i];
							if (/^\w+$/.test(rule) || regex.id.test(rule)) {
								continue;
							}
							prevElm.skipTag = true;
						}
					}
					var cssSelector = regex.selector.exec(rule);
					var splitRule = {
						tag : (!cssSelector[1] || cssSelector[3] === "*")? "*" : cssSelector[1],
						id : (cssSelector[3] !== "*")? cssSelector[2] : null,
						allClasses : cssSelector[4],
						allAttr : cssSelector[6],
						allPseudos : cssSelector[11]
					};
					if (splitRule.id) {
						var u = 0, DOMElm = document.getElementById(splitRule.id.replace(/#/, ""));
						if (DOMElm) {
							while (prevElm[u] && !isDescendant(DOMElm, prevElm[u])) { u++; }
							matchingElms = (u < prevElm.length)? [DOMElm] : [];
						}
						prevElm = matchingElms;
					}
					else if (splitRule.tag && !prevElm.skipTag) {
						if (i===0 && !matchingElms.length && prevElm.length === 1) {
							prevElm = matchingElms = pushAll([], getElementsByTagName(splitRule.tag, prevElm[0]));
						}
						else {
							for (var l=0, ll=prevElm.length, tagCollectionMatches, tagMatch; l<ll; l++) {
								tagCollectionMatches = getElementsByTagName(splitRule.tag, prevElm[l]);
								for (var m=0; (tagMatch=tagCollectionMatches[m]); m++) {
									if (!tagMatch.added) {
										tagMatch.added = true;
										matchingElms[matchingElms.length] = tagMatch;
									}
								}
							}
							prevElm = matchingElms;
							clearAdded();
						}
					}
					if (!matchingElms.length) {
						break;
					}
					prevElm.skipTag = false;
					if (splitRule.allClasses) {
						var n = 0, matchingClassElms = [], allClasses = splitRule.allClasses.split(".").slice(1);
						while ((current = prevElm[n++])) {
							var matchCls = true, elmClass = current.className;
							if (elmClass && elmClass.length) {
								elmClass = elmClass.split(" ");
								for (var o=0, ol=allClasses.length; o<ol; o++) {
									if (!contains(elmClass, allClasses[o])) {
										matchCls = false;
										break;
									}
								}
								if (matchCls) {
									matchingClassElms[matchingClassElms.length] = current;
								}
							}
						}
						prevElm = matchingElms = matchingClassElms;
					}
					if (splitRule.allAttr) {
						var r = 0, regExpAttributes = [], matchingAttributeElms = [], allAttr = splitRule.allAttr.match(/\[[^\]]+\]/g);
						for (var q=0, ql=allAttr.length, attributeMatch, attrVal; q<ql; q++) {
							regex.attribs.lastIndex = 0;
							attributeMatch = regex.attribs.exec(allAttr[q]);
							attrVal = attrToRegExp(attributeMatch[3], attributeMatch[2] || null);
							regExpAttributes[q] = [(attrVal? new RegExp(attrVal) : null), attributeMatch[1]];
						}
						while ((current = matchingElms[r++])) {
							for (var s=0, sl=regExpAttributes.length; s<sl; s++) {
								var matchAttr = true, attributeRegExp = regExpAttributes[s][0], currentAttr = getAttr(current, regExpAttributes[s][1]);
								if (!attributeRegExp && currentAttr === true) { continue; }
								if ((!attributeRegExp && (!currentAttr || typeof currentAttr !== "string" || !currentAttr.length)) || (!!attributeRegExp && !attributeRegExp.test(currentAttr))) {
									matchAttr = false;
									break;
								}
							}
							if (matchAttr) {
								matchingAttributeElms[matchingAttributeElms.length] = current;
							}
						}
						prevElm = matchingElms = matchingAttributeElms;
					}
					if (splitRule.allPseudos) {
						var allPseudos = splitRule.allPseudos.match(regex.pseudos);
						for (var t=0, tl=allPseudos.length; t<tl; t++) {
							regex.pseudos.lastIndex = 0;
							var pseudo = regex.pseudos.exec(allPseudos[t]);
							var pseudoClass = pseudo[1]? pseudo[1].toLowerCase() : null;
							var pseudoValue = pseudo[3] || null;
							matchingElms = getElementsByPseudo(matchingElms, pseudoClass, pseudoValue);
							clearAdded(matchingElms);
						}
						prevElm = matchingElms;
					}
				}
				elm = pushAll(elm, prevElm);
			}
			return elm;
		},
		
		cssByXpath : function (cssRule) {
			var ns = { xhtml: "http://www.w3.org/1999/xhtml" };
			var prefix = (document.documentElement.namespaceURI === ns.xhtml)? "xhtml:" : "";
			var nsResolver = function lookupNamespaceURI (prefix) {
				return ns[prefix] || null;
			};
			DOMAssistant.cssByXpath = function (cssRule) {
				if (/:checked/.test(cssRule)) {
					return DOMAssistant.cssByDOM.call(this, cssRule);
				}
				var cssRules = cssRule.replace(regex.rules, "$1").split(",");
				var elm = new HTMLArray();
				var currentRule, cssSelectors, xPathExpression, cssSelector, splitRule, sequence;
				var selectorSplitRegExp = new RegExp("(?:\\[[^\\[]*\\]|\\(.*\\)|[^\\s\\+>~\\[\\(])+|[\\+>~]", "g");
				function attrToXPath (match, p1, p2, p3) {
					p3 = p3? p3.replace(regex.quoted, "$1") : p3;
					switch (p2) {
						case "^": return "starts-with(@" + p1 + ", \"" + p3 + "\")";
						case "$": return "substring(@" + p1 + ", (string-length(@" + p1 + ") - " + (p3.length - 1) + "), " + p3.length + ") = \"" + p3 + "\"";
						case "*": return "contains(concat(\" \", @" + p1 + ", \" \"), \"" + p3 + "\")";
						case "|": return "(@" + p1 + "=\"" + p3 + "\" or starts-with(@" + p1 + ", \"" + p3 + "-\"))";
						case "~": return "contains(concat(\" \", @" + p1 + ", \" \"), \" " + p3 + " \")";
						default: return "@" + p1 + (p3? "=\"" + p3 + "\"" : "");
					}
				}
				function attrToXPathB (match, p1, p2, p3) {
					return "[" + attrToXPath(match, p1, p2, p3) + "]";
				}
				function pseudoToXPath (tag, pseudoClass, pseudoValue) {
					tag = /\-child$/.test(pseudoClass)? "*" : tag;
					var xpath = "", pseudo = pseudoClass.split("-"), recur;
					switch (pseudo[0]) {
						case "nth":
							if (!/^n$/.test(pseudoValue)) {
								var position = ((pseudo[1] === "last")? "(count(following-sibling::" : "(count(preceding-sibling::") + tag + ") + 1)";
								if ((sequence = DOMAssistant.getSequence.call(this, pseudoValue))) {
									xpath = (sequence.start === sequence.max)?
										position + " = " + sequence.start :
										position + " mod " + sequence.add + " = " + sequence.modVal + ((sequence.start > 1)? " and " + position + " >= " + sequence.start : "") + ((sequence.max > 0)? " and " + position + " <= " + sequence.max: "");
								}
							}
							break;
						case "not":
							var notSelector = (recur = regex.pseudo.exec(pseudoValue))?
								pseudoToXPath(tag, recur[1]? recur[1].toLowerCase() : null, recur[3] || null) :
								pseudoValue.replace(regex.id, "[id=$1]")
									.replace(regex.tag, "self::$1")
									.replace(regex.classes, "contains(concat(\" \", @class, \" \"), \" $1 \")")
									.replace(regex.attribs, attrToXPath);
							xpath = "not(" + notSelector + ")";
							break;
						case "first": return "not(preceding-sibling::" + tag + ")";
						case "last": return "not(following-sibling::" + tag + ")";
						case "only": return "not(preceding-sibling::" + tag + " or following-sibling::" + tag + ")";
						case "empty": return "count(child::*) = 0 and string-length(text()) = 0";
						case "contains": return "contains(., \"" + pseudoValue.replace(regex.quoted, "$1") + "\")";
						case "enabled": return "not(@disabled) and not(@type=\"hidden\")";
						case "disabled": return "@disabled";
						case "target": var hash = document.location.hash.slice(1); return "@name=\"" + hash + "\" or @id=\"" + hash + "\"";
						default: return "@" + pseudoClass + "=\"" + pseudoValue + "\"";
					}
					return xpath;
				}
				for (var i=0; (currentRule=cssRules[i]); i++) {
					if (i && contains(cssRules.slice(0, i), currentRule)) { continue; }
					cssSelectors = currentRule.match(selectorSplitRegExp);
					xPathExpression = ".";
					for (var j=0, jl=cssSelectors.length; j<jl; j++) {
						cssSelector = regex.selector.exec(cssSelectors[j]);
						splitRule = {
							tag : prefix + ((!cssSelector[1] || cssSelector[3] === "*")? "*" : cssSelector[1]),
							id : (cssSelector[3] !== "*")? cssSelector[2] : null,
							allClasses : cssSelector[4],
							allAttr : cssSelector[6],
							allPseudos : cssSelector[11],
							tagRelation : cssSelector[23]
						};
						if (splitRule.tagRelation) {
							var mapping = { ">": "/child::", "+": "/following-sibling::*[1]/self::", "~": "/following-sibling::" };
							xPathExpression += mapping[splitRule.tagRelation] || "";
						}
						else {
							xPathExpression += (j > 0 && regex.relation.test(cssSelectors[j-1]))? splitRule.tag : ("/descendant::" + splitRule.tag);
						}
						if (splitRule.id) {
							xPathExpression += "[@id = \"" + splitRule.id.replace(/^#/, "") + "\"]";
						}
						if (splitRule.allClasses) {
							xPathExpression += splitRule.allClasses.replace(regex.classes, "[contains(concat(\" \", @class, \" \"), \" $1 \")]");
						}
						if (splitRule.allAttr) {
							xPathExpression += splitRule.allAttr.replace(regex.attribs, attrToXPathB);
						}
						if (splitRule.allPseudos) {
							var allPseudos = splitRule.allPseudos.match(regex.pseudos);
							for (var k=0, kl=allPseudos.length; k<kl; k++) {
								regex.pseudos.lastIndex = 0;
								var pseudo = regex.pseudos.exec(allPseudos[k]);
								var pseudoClass = pseudo[1]? pseudo[1].toLowerCase() : null;
								var pseudoValue = pseudo[3] || null;
								var xpath = pseudoToXPath(splitRule.tag, pseudoClass, pseudoValue);
								if (xpath.length) {
									xPathExpression += "[" + xpath + "]";
								}
							}
						}
					}
					var xPathNodes = document.evaluate(xPathExpression, this, nsResolver, 0, null), node;
					while ((node = xPathNodes.iterateNext())) {
						elm.push(node);
					}
				}
				return elm;
			};
			return DOMAssistant.cssByXpath.call(this, cssRule);
		},
		
		cssSelection : function (cssRule) {
			DOMAssistant.cssSelection = document.evaluate? DOMAssistant.cssByXpath : DOMAssistant.cssByDOM;
			if (document.querySelectorAll) {
				var cssSelectionBackup = DOMAssistant.cssSelection;
				DOMAssistant.cssSelection = function (cssRule) {
					try {
						var elm = new HTMLArray();
						return pushAll(elm, this.querySelectorAll(cssRule));
					}
					catch (e) {
						return cssSelectionBackup.call(this, cssRule);
					}
				};
			}
			return DOMAssistant.cssSelection.call(this, cssRule);
		},
		
		cssSelect : function (cssRule) {
			return DOMAssistant.cssSelection.call(this, cssRule);
		},
		
		elmsByClass : function (className, tag) {
			var cssRule = (tag || "") + "." + className;
			return DOMAssistant.cssSelection.call(this, cssRule);
		},
		
		elmsByAttribute : function (attr, attrVal, tag, substrMatchSelector) {
			var cssRule = (tag || "") + "[" + attr + ((attrVal && attrVal !== "*")? ((substrMatchSelector || "") + "=" + attrVal + "]") : "]");
			return DOMAssistant.cssSelection.call(this, cssRule);
		},
		
		elmsByTag : function (tag) {
			return DOMAssistant.cssSelection.call(this, tag);
		}
	};
}();
DOMAssistant.initCore();
DOMAssistant.AJAX = function () {
	var globalXMLHttp = null;
	var readyState = 0;
	var status = -1;
	var statusText = "";
	var requestPool = [];
	var createAjaxObj = function (url, method, callback, addToContent) {
		var params = null;
		if (/POST/i.test(method)) {
			url = url.split("?");
			params = url[1];
			url = url[0];
		}
		return {
			url : url,
			method : method,
			callback : callback,
			params : params,
			headers : {},
			responseType : "text",
			addToContent : addToContent || false
		};
	};
	var inProgress = function (xhr) {
		return (!!xhr && xhr.readyState >= 1 && xhr.readyState <= 3);
	};
	return {
		publicMethods : [
			"ajax",
			"get",
			"post",
			"load"
		],
		
		initRequest : function () {
			var XMLHttp = null;
			if (!!window.XMLHttpRequest) {
				XMLHttp = new XMLHttpRequest();
				DOMAssistant.AJAX.initRequest = function () {
					return requestPool.length? requestPool.pop() : new XMLHttpRequest();
				};
			}
			else if (!!window.ActiveXObject) {
				var XMLHttpMS = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
				for (var i=0; i<XMLHttpMS.length; i++) {
					try {
						XMLHttp = new window.ActiveXObject(XMLHttpMS[i]);
						DOMAssistant.AJAX.initRequest = function () {
							return requestPool.length? requestPool.pop() : new window.ActiveXObject(XMLHttpMS[i]);
						};
						break;
					}
					catch (e) {
						XMLHttp = null;
					}
				}
			}
			return XMLHttp;
		},
		
		ajax : function (ajaxObj) {
			if (!ajaxObj.noParse && ajaxObj.url && /\?/.test(ajaxObj.url) && ajaxObj.method && /POST/i.test(ajaxObj.method)) {
				var url = ajaxObj.url.split("?");
				ajaxObj.url = url[0];
				ajaxObj.params = url[1] + ((url[1].length > 0 && ajaxObj.params)? ("&" + ajaxObj.params) : "");
			}
			return DOMAssistant.AJAX.makeCall.call(this, ajaxObj);
		},
		
		get : function (url, callback, addToContent) {
			var ajaxObj = createAjaxObj(url, "GET", callback, addToContent);
			return DOMAssistant.AJAX.makeCall.call(this, ajaxObj);
		},
		
		post : function (url, callback) {
			var ajaxObj = createAjaxObj(url, "POST", callback);
			return DOMAssistant.AJAX.makeCall.call(this, ajaxObj);
		},
		
		load : function (url, addToContent) {
			DOMAssistant.AJAX.get.call(this, url, DOMAssistant.AJAX.replaceWithAJAXContent, addToContent);
		},
		
		makeCall : function (ajaxObj) {
			var XMLHttp = DOMAssistant.AJAX.initRequest();
			if (XMLHttp) {
				globalXMLHttp = XMLHttp;
				(function (elm) {
					var url = ajaxObj.url,
						method = ajaxObj.method || "GET",
						callback = ajaxObj.callback,
						params = ajaxObj.params,
						headers = ajaxObj.headers,
						responseType = ajaxObj.responseType || "text",
						addToContent = ajaxObj.addToContent,
						timeout = ajaxObj.timeout || null,
						ex = ajaxObj.exception,
						timeoutId = null;
					XMLHttp.open(method, url, true);
					XMLHttp.setRequestHeader("AJAX", "true");
					XMLHttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
					if (method === "POST") {
						var contentLength = params? params.length : 0;
						XMLHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						XMLHttp.setRequestHeader("Content-length", contentLength);
						if (XMLHttp.overrideMimeType) {
							XMLHttp.setRequestHeader("Connection", "close");
						}
					}
					if (responseType === "json") {
						XMLHttp.setRequestHeader("Accept", "application/json, text/javascript, */*");
					}
					for (var i in headers) {
						if (typeof i === "string") {
							XMLHttp.setRequestHeader(i, headers[i]);
						}
					}
					if (typeof callback === "function") {
						XMLHttp.onreadystatechange = function () {
							try {
								if (XMLHttp.readyState === 4) {
									window.clearTimeout(timeoutId);
									status = XMLHttp.status;
									statusText = XMLHttp.statusText;
									readyState = 4;
									if (!status || status !== 200) {
										throw new Error(statusText);
									}
									var response = /xml/i.test(responseType)? XMLHttp.responseXML : XMLHttp.responseText;
									if (/json/i.test(responseType)) {
										response = (typeof JSON === "object" && typeof JSON.parse === "function")? JSON.parse(response) : eval("(" + response + ")");
									}
									globalXMLHttp = null;
									XMLHttp.onreadystatechange = function () {};
									requestPool.push(XMLHttp);
									callback.call(elm, response, addToContent);
								}
							}
							catch (e) {
								globalXMLHttp = XMLHttp = null;
								if (typeof ex === "function") {
									ex.call(elm, e);
									ex = null;
								}
							}
						};
					}
					XMLHttp.send(params);
					if (timeout) {
						timeoutId = window.setTimeout( function () {
							if (inProgress(XMLHttp)) {
								XMLHttp.abort();
								if (typeof ex === "function") {
									readyState = 0;
									status = 408;
									statusText = "Request timeout";
									globalXMLHttp = XMLHttp = null;
									ex.call(elm, new Error(statusText));
									ex = null;
								}
							}
						}, timeout);
					}
				})(this);
			}
			return this;
		},
		
		replaceWithAJAXContent : function (content, add) {
			if (add) {
				this.innerHTML += content;
			}
			else {
				DOMAssistant.clearHandlers.apply(this);
				this.innerHTML = content;
			}
		},
		
		getReadyState : function () {
			return (globalXMLHttp && typeof globalXMLHttp.readyState !== "undefined")? globalXMLHttp.readyState : readyState;
		},
		
		getStatus : function () {
			return status;
		},
		
		getStatusText : function () {
			return statusText;
		}
	};
}();
DOMAssistant.attach(DOMAssistant.AJAX);
DOMAssistant.CSS = function () {
	return {
		addClass : function (className) {
			if (!DOMAssistant.CSS.hasClass.call(this, className)) {
				var currentClass = this.className;
				this.className = currentClass + (currentClass.length? " " : "") + className;
			}
			return this;
		},

		removeClass : function (className) {
			return DOMAssistant.CSS.replaceClass.call(this, className);
		},

		replaceClass : function (className, newClass) {
			var classToRemove = new RegExp(("(^|\\s)" + className + "(\\s|$)"), "i");
			this.className = this.className.replace(classToRemove, function (match, p1, p2) {
				var retVal = newClass? (p1 + newClass + p2) : "";
				if (/^\s+.*\s+$/.test(match)) {
					retVal = match.replace(/(\s+).+/, "$1");
				}
				return retVal;
			}).replace(/^\s+|\s+$/g, "");
			return this;
		},

		hasClass : function (className) {
			return new RegExp(("(^|\\s)" + className + "(\\s|$)"), "i").test(this.className);
		},

		setStyle : function (style, value) {
			if (this.filters && (typeof style === "string"? /opacity/i.test(style) : style.opacity)) {
				this.style.filter = "alpha(opacity=" + (value || style.opacity || 1) * 100 + ")";
			}
			if (typeof this.style.cssText !== "undefined") {
				var styleToSet = this.style.cssText;
				if (typeof style === "object") {
					for (var i in style) {
						if (typeof i === "string") {
							styleToSet += ";" + i + ":" + style[i];
						}
					}
				}
				else {
					styleToSet += ";" + style + ":" + value;
				}
				this.style.cssText = styleToSet;
			}
			return this;
		},

		getStyle : function (cssRule) {
			var val = "";
			cssRule = cssRule.toLowerCase();
			if (document.defaultView && document.defaultView.getComputedStyle) {
				val = document.defaultView.getComputedStyle(this, "").getPropertyValue(cssRule);
			}
			else if (this.currentStyle) {
				if (this.filters && /^opacity$/.test(cssRule)) {
					var alpha = this.filters["DXImageTransform.Microsoft.Alpha"] || this.filters.alpha || {};
					val = (alpha.opacity || 100) / 100;
				}
				else {
					cssRule = cssRule.replace(/^float$/, "styleFloat").replace(/\-(\w)/g, function (match, p1) {
						return p1.toUpperCase();
					});
					val = this.currentStyle[cssRule];
				}
				if (val === "auto" && /^(width|height)$/.test(cssRule) && this.currentStyle.display !== "none") {
					val = this["offset" + cssRule.charAt(0).toUpperCase() + cssRule.substr(1)] + "px";
				}
			}
			return val;
		}
	};
}();
DOMAssistant.attach(DOMAssistant.CSS);
DOMAssistant.Content = function () {
	var $ = DOMAssistant.$;
	return {
		init : function () {
			DOMAssistant.setCache(false);
		},

		prev : function () {
			var prevSib = this;
			while ((prevSib = prevSib.previousSibling) && prevSib.nodeType !== 1) {}
			return $(prevSib);
		},

		next : function () {
			var nextSib = this;
			while ((nextSib = nextSib.nextSibling) && nextSib.nodeType !== 1) {}
			return $(nextSib);
		},

		create : function (name, attr, append, content) {
			var elm = $(document.createElement(name));
			if (attr) {
				elm = elm.setAttributes(attr);
			}
			if (typeof content !== "undefined") {
				elm.addContent(content);
			}
			if (append) {
				DOMAssistant.Content.addContent.call(this, elm);
			}
			return elm;
		},

		setAttributes : function (attr) {
			if (DOMAssistant.isIE) {
				var setAttr = function (elm, att, val) {
					var attLower = att.toLowerCase();
					switch (attLower) {
						case "name":
						case "type":
							return document.createElement(elm.outerHTML.replace(new RegExp(attLower + "=[a-zA-Z]+"), " ").replace(">", " " + attLower + "=" + val + ">"));
						case "style":
							elm.style.cssText = val;
							return elm;
						default:
							elm[DOMAssistant.camel[attLower] || att] = val;
							return elm;
					}
				};
				DOMAssistant.Content.setAttributes = function (attr) {
					var elem = this;
					var parent = this.parentNode;
					for (var i in attr) {
						if (typeof attr[i] === "string" || typeof attr[i] === "number") {
							var newElem = setAttr(elem, i, attr[i]);
							if (parent && /(name|type)/i.test(i)) {
								if (elem.innerHTML) {
									newElem.innerHTML = elem.innerHTML;
								}
								parent.replaceChild(newElem, elem);
							}
							elem = newElem;
						}
					}
					return $(elem);
				};
			}
			else {
				DOMAssistant.Content.setAttributes = function (attr) {
					for (var i in attr) {
						if (/class/i.test(i)) {
							this.className = attr[i];
						}
						else {
							this.setAttribute(i, attr[i]);
						}
					}
					return this;
				};
			}
			return DOMAssistant.Content.setAttributes.call(this, attr); 
		},

		addContent : function (content) {
			var type = typeof content;
			if (type === "string" || type === "number") {
				this.innerHTML += content;
			}
			else if (type === "object" || (type === "function" && !!content.nodeName)) {
				this.appendChild(content);
			}
			return this;
		},

		replaceContent : function (content) {
			DOMAssistant.clearHandlers.apply(this);
			this.innerHTML = "";
			return DOMAssistant.Content.addContent.call(this, content);
		},

		replace : function (content, returnNew) {
			var type = typeof content;
			if (type === "string" || type === "number") {
				var parent = this.parentNode;
				var tmp = $(parent).create("div", null, false, content);
				for (var i=tmp.childNodes.length-1; i>=0; i--) {
					parent.insertBefore(tmp.childNodes[i], this.nextSibling);
				}
				content = this.nextSibling;
				parent.removeChild(this);
			}
			else if (type === "object" || (type === "function" && !!content.nodeName)) {
				this.parentNode.replaceChild(content, this);
			}
			return returnNew? content : this;
		},

		remove : function () {
			this.parentNode.removeChild(this);
			return null;
		}
	};
}();
DOMAssistant.attach(DOMAssistant.Content);
DOMAssistant.Events = function () {
	var uniqueHandlerId = 1;
	return {
		publicMethods : [
			"triggerEvent",
			"addEvent",
			"removeEvent",
			"preventDefault",
			"cancelBubble"
		],

		init : function () {
			window.addEvent = this.addEvent;
			window.removeEvent = this.removeEvent;
			DOMAssistant.preventDefault = this.preventDefault;
			DOMAssistant.cancelBubble = this.cancelBubble;
		},

		triggerEvent : function (evt, target) {
			if (this.events && this.events[evt]) {
				// Create synthetic event
				var event = {
					type: evt,
					target: target || this,
					currentTarget: this,
					bubbles: false,
					cancelable: false,
					preventDefault: function(){},
					stopPropagation: function(){},
					timeStamp: +new Date()
				};
				for (var i=0, iL=this.events[evt].length; i<iL; i++) {
					this.events[evt][i].call(this, event);
				}
			}
			else if (typeof this["on" + evt] === "function") {
				this["on" + evt].call(this, event);
			}
			return this;
		},

		addEvent : function (evt, func) {
			if (/^DOM/.test(evt)) {
				if (this.addEventListener) {
					this.addEventListener(evt, func, false);
				}
			}
			else {
				if (!this.uniqueHandlerId) {
					this.uniqueHandlerId = uniqueHandlerId++;
				}
				if (!(func.attachedElements && func.attachedElements[evt + this.uniqueHandlerId])) {
					if (!this.events) {
						this.events = {};
					}
					if (!this.events[evt]) {
						this.events[evt] = [];
						var existingEvent = this["on" + evt];
						if (existingEvent) {
							this.events[evt].push(existingEvent);
						}
					}
					this.events[evt].push(func);
					this["on" + evt] = DOMAssistant.Events.handleEvent;
					if (typeof this.window === "object") {
						this.window["on" + evt] = DOMAssistant.Events.handleEvent;
					}
					if (!func.attachedElements) {
						func.attachedElements = {};
					}
					func.attachedElements[evt + this.uniqueHandlerId] = true;
				}
			}
			return this;
		},

		handleEvent : function (evt) {
			var currentEvt = evt || event;
			var currentTarget = currentEvt.target || currentEvt.srcElement || document;
			while (currentTarget.nodeType !== 1 && currentTarget.parentNode) {
				currentTarget = currentTarget.parentNode;
			}
			currentEvt.eventTarget = currentTarget;
			var eventColl = this.events[currentEvt.type].slice(0), eventCollLength, eventReturn;
			if ((eventCollLength = eventColl.length)) {
				for (var i=0; i<eventCollLength; i++) {
					if (typeof eventColl[i] === "function") {
						eventReturn = eventColl[i].call(this, currentEvt);
					}
				}
				return eventReturn;
			}
		},

		removeEvent : function (evt, func) {
			if (this.events && this.events[evt]) {
				var eventColl = this.events[evt];
				for (var fn, i=eventColl.length-1; i>=0; i--) {
					fn = func || eventColl[i];
					if (eventColl[i] === fn) {
						delete eventColl[i];
						eventColl.splice(i, 1);
						if (fn.attachedElements) {
							fn.attachedElements[evt + this.uniqueHandlerId] = null;
						}
					}
				}
			}
			else if (this["on" + evt] && !func) {
				this["on" + evt] = null;
			}
			return this;
		},

		preventDefault : function (evt) {
			if (evt && evt.preventDefault) {
				DOMAssistant.Events.preventDefault = function (evt) {
					evt.preventDefault();
				};
			}
			else {
				DOMAssistant.Events.preventDefault = function (evt) {
					event.returnValue = false;
				};
			}
			return DOMAssistant.Events.preventDefault(evt);
		},

		cancelBubble : function (evt) {
			if (evt && evt.stopPropagation) {
				DOMAssistant.Events.cancelBubble = function (evt) {
					evt.stopPropagation();
				};
			}
			else {
				DOMAssistant.Events.cancelBubble = function (evt) {
					event.cancelBubble = true;
				};
			}
			return DOMAssistant.Events.cancelBubble(evt);
		}
	};
}();
DOMAssistant.attach(DOMAssistant.Events);
DOMAssistant.DOMLoad = function () {
	var DOMLoaded = false;
	var DOMLoadTimer = null;
	var functionsToCall = [];
	var addedStrings = {};
	var errorHandling = null;
	var execFunctions = function () {
		for (var i=0, il=functionsToCall.length; i<il; i++) {
			try {
				functionsToCall[i]();
			}
			catch (e) {
				if (errorHandling && typeof errorHandling === "function") {
					errorHandling(e);
				}
			}
		}
		functionsToCall = [];
	};
	var DOMHasLoaded = function () {
		if (DOMLoaded) {
			return;
		}
		DOMLoaded = true;
		execFunctions();
	};
	/* Internet Explorer */
	/*@cc_on
	@if (@_win32 || @_win64)
		if (document.getElementById) {
			document.write("<script id=\"ieScriptLoad\" defer src=\"//:\"><\/script>");
			document.getElementById("ieScriptLoad").onreadystatechange = function() {
				if (this.readyState === "complete") {
					DOMHasLoaded();
				}
			};
		}
	@end @*/
	/* Mozilla/Opera 9 */
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", DOMHasLoaded, false);
	}
	/* Safari, iCab, Konqueror */
	if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
		DOMLoadTimer = setInterval(function () {
			if (/loaded|complete/i.test(document.readyState)) {
				DOMHasLoaded();
				clearInterval(DOMLoadTimer);
			}
		}, 10);
	}
	/* Other web browsers */
	window.onload = DOMHasLoaded;
	
	return {
		DOMReady : function () {
			for (var i=0, il=arguments.length, funcRef; i<il; i++) {
				funcRef = arguments[i];
				if (!funcRef.DOMReady && !addedStrings[funcRef]) {
					if (typeof funcRef === "string") {
						addedStrings[funcRef] = true;
						funcRef = new Function(funcRef);
					}
					funcRef.DOMReady = true;
					functionsToCall.push(funcRef);
				}
			}
			if (DOMLoaded) {
				execFunctions();
			}
		},
		
		setErrorHandling : function (funcRef) {
			errorHandling = funcRef;
		}
	};
}();
DOMAssistant.DOMReady = DOMAssistant.DOMLoad.DOMReady;

// DISABLE CACHE FOR ACCURATE TEST RESULTS
DOMAssistant.setCache=false;

