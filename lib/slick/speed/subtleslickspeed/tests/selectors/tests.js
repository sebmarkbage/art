if (!window.didThisAlready) {

var SELECTORS = SELECTORS || '\
body\n\
div\n\
span\n\
a\n\
a.fn\n\
a.url\n\
a.fn.url\n\
body\n\
div\n\
body div\n\
div p\n\
div > p\n\
div + p\n\
div ~ p\n\
div[class^=exa][class$=mple]\n\
div p a\n\
div, p, a\n\
.note\n\
div.example\n\
ul .tocline2\n\
div.example, div.note\n\
#title\n\
h1#title\n\
div #title\n\
ul.toc li.tocline2\n\
ul.toc > li.tocline2\n\
h1#title + div > p\n\
h1[id]:contains(Selectors)\n\
a[href][lang][class]\n\
div[class]\n\
div[class=example]\n\
div[class^=exa]\n\
div[class$=mple]\n\
div[class*=e]\n\
div[class|=dialog]\n\
div[class!=made_up]\n\
div[class~=example]\n\
div:not(.example)\n\
p:contains(selectors)\n\
p:nth-child(even)\n\
p:nth-child(2n)\n\
p:nth-child(odd)\n\
p:nth-child(2n+1)\n\
p:nth-child(n)\n\
p:only-child\n\
p:last-child\n\
p:first-child\n\
';

document.getElementById('SELECTORS').innerHTML = SELECTORS;
SELECTORS = SELECTORS.split(/\r?\n/);
var q = Object.fromQueryString(document.location.search);

function loadFrameworkTests(framework){
	var url = 'lib/frameworks/'+framework.js+'.js';
	var sandbox = new SubtleSlickSpeed.Test.Sandboxed(framework.name, ["tests/selectors/template.js", url]);
	
	if (disableQSA) sandbox.eval('document.querySelectorAll = undefined;Element.prototype.querySelectorAll = undefined;');
	if (disableGBC) sandbox.eval('document.getElementsByClassName = undefined;Element.prototype.getElementsByClassName = undefined;');
	sandbox.addEvent('load:'+url, function(){
		
		// framework.queryFn = sandbox.eval(framework.queryFn);
		
		Array.each(SELECTORS, function(selector){
			if (!selector) return;
			// console.log(selector);
			// sandbox.eval("document.querySelectorAll = undefined; Element.prototype.querySelectorAll = undefined;");
			framework.runBefore && sandbox.eval(framework.runBefore);
			sandbox.eval("new SubtleSlickSpeed.Test('"+selector+";;;"+String.escapeSingle(framework.name)+"', function(){ return "+framework.queryFn+"('"+String.escapeSingle(selector)+"').length; })");
			// with (sandbox.window)
			// new SubtleSlickSpeed.Test(selector+";;;"+framework.name, function(){
			// 	return framework.queryFn(selector);
			// });
		});
	});
}

var Frameworks = {
	// 'jQuery 1.2.6':{
	// 	js:'jq-126',
	// 	queryFn:'$'
	// },
	// 'jQuery 1.3.2':{
	// 	js:'jq-132',
	// 	queryFn:'$'
	// },
	// 'Dojo 1.3':{
	// 	js:'dojo',
	// 	queryFn:'dojo.query'
	// },
	// 'Prototype 1.6.0.3':{
	// 	js:'proto-1603',
	// 	queryFn:'$$'
	// },
	'MooTools 1.2.4':{
		js:'../../../frameworks/mootools',
		queryFn:'$$'
	},
	// 'Slick (parse only)':{
	// 	js:'slick',
	// 	queryFn:'SubtleSlickParse'
	// },
	// 'Slick (parse only) nocache':{
	// 	js:'slick',
	// 	queryFn:'SubtleSlickParse.nocache=true; SubtleSlickParse'
	// },
	// 'NW Matcher 1.1.1':{
	// 	js:'nwmatcher',
	// 	runBefore:'NW.Dom.setCache(false);',
	// 	queryFn:'NW.Dom.select'
	// },
	// 'Sly v1.0rc2':{
	// 	js:'sly',
	// 	queryFn:'Sly.search'
	// },
	'Slick Stable':{
		js:'../../../frameworks/slick',
		runBefore:'document.search = function(selector){return Slick(document,selector)};',
		queryFn:'document.search'
	},
	'Slick WIP':{
		js:'../../../../slick',
		runBefore:'document.search = function(selector){return Slick(document,selector)};',
		queryFn:'document.search'
	// },
	// 'Evil Slick':{
	// 	js:'slick_dsl',
	// 	runBefore:'Matcher.nocache=false;SubtleSlickParse.nocache=true;',
	// 	queryFn:'document.search'
	// },
	// 'Evil Slick (no-cache)':{
	// 	js:'slick_dsl',
	// 	runBefore:'Matcher.nocache=true;SubtleSlickParse.nocache=true;',
	// 	queryFn:'document.search'
	}
};

function shouldExclude(str){
	if (!q.exclude) return false;
	
	q.exclude = $splat(q.exclude);
	
	for (var i = q.exclude.length - 1; i >= 0; i--){
		if (q.exclude[i] == str) return true;
	}
	return false;
};

Array.each(SELECTORS, UID.uidOf);
Object.each(Frameworks, function(framework, frameworkName){
	
	UID.uidOf(frameworkName);
	Array.each(SELECTORS, function(selector){
		UID.uidOf(selector + frameworkName);
	});
	
	framework.name = frameworkName;
	// console.log(q.exclude.indexOf(frameworkName))
	if (!shouldExclude(Frameworks[frameworkName].js))
		loadFrameworkTests(framework);
	else 
		Frameworks[frameworkName].stop = true;
});

var html = [], ex = document.getElementById('exclude');
html.push('Exclude: ');
for (var frameworkName in Frameworks) {
	html.push('<label><input name="exclude" type="checkbox" '+ (shouldExclude(Frameworks[frameworkName].js) ? 'checked="checked"' : '') +' value="' + String.escapeDouble(Frameworks[frameworkName].js) + '" /> '+frameworkName+'</label>');
}
// html.push('<input type="submit" value="Exclude" />')
ex.innerHTML = html.join('');


window.didThisAlready = true;}
