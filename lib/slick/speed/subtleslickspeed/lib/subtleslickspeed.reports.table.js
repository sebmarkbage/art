/*
	SubtleSlickSpeed.Report.Table
	Copyright 2009 Thomas Aylott (subtleGradient.com)
	LICENSE: MIT
*/

// if (typeof SubtleSlickSpeed == 'undefined') document.write('<scr'+'ipt src="file:///Users/taylott/Projects/MooTools/SubtleSlickSpeed/lib/jslib.js"><\/script>');
// if (typeof SubtleSlickSpeed == 'undefined') SubtleSlickSpeed={};
// if (SubtleSlickSpeed.Report == null) SubtleSlickSpeed.Report={};
SubtleSlickSpeed.Report.TIMEOUT = SubtleSlickSpeed.Report.TIMEOUT || 25;
SubtleSlickSpeed.Report.Table = (function(){
	
	function Table(options){
		this.options = $pick(options, {});
		this.element = document.createElement('div');
		this.element.setAttribute('id', this.options.id || uid++);
		
		this.rows = {};
	};
	Table.prototype = {
		
		toElement: function(){
			this.rebuild();
			return this.element;
		},
		
		rebuild: function(){
			this.element.innerHTML = Build.tag('table', this.options, this.rows);
		},
		
		getRow: function(rowId){
			return this.rows[rowId] || (this.rows[rowId] = {});
		},
		
		setCell: function(rowId, colId, value){
			this.getRow(rowId)[colId] = value;
			return this;
		},
		
		getCell: function(rowId, colId){
			return this.getRow(rowId)[colId];
		},
		
		set: function(row, col, value){
			var id = UID.uidOf(row + col);
			var rowId = UID.uidOf(row);
			var colId = UID.uidOf(col);
			// console.log('set', row, col, value);
			// console.log('set', rowId, colId, id);
			
			this.setCell(rowId, colId, value);
			var self = this;
			if (this.buildTimeout) clearTimeout(this.buildTimeout);
			this.buildTimeout = setTimeout(function(){
				self.rebuild();
			}, SubtleSlickSpeed.Report.TIMEOUT);
		},
		
		get: function(row, col){
			var id = UID.uidOf(row + col);
			var rowId = UID.uidOf(row);
			var colId = UID.uidOf(col);
		}
	};
	
	var uid = 0;
	
	return Table;
})();

var Build = (function(){
	
	function buildTag(tag, attrs, html){
		if (tag=='table'){
			html = buildTags('tr', attrs.tr||{td:attrs.td||{}}, html);
			delete attrs.tr;
		}
		if (tag=='tr'){
			html = buildTags('td', attrs.td||{}, html);
			delete attrs.td;
		}
		if (tag=='ul' || tag=='ol'){
			html = buildTags('li', attrs.li||{}, html);
			delete attrs.li;
		}
		var t = [];
		t.push('<');
		t.push(tag);
		t.push(buildAttrs(attrs));
		t.push('>');
		
		if (Object.type(html)=='function') html = html();
		t.push(html);
		
		t.push('</');
		t.push(tag);
		t.push('>');
		return t.join('');
	}
	function buildTags(tag, attrs, htmls){
		var h = [];
		Object.each(htmls,function(html){
			h.push( buildTag(tag, attrs, html) );
		});
		return h.join('\n');
	}
	function buildAttr(key,value){
		if (value == null) return '';
		if (Object.type(value)=='function') value = value();
		return ' '+key+'="'+String.escapeDouble(value)+'"';
	}
	function buildAttrs(attrs){
		var builtAttrs = [];
		Object.each(attrs,function(value, key){
			builtAttrs.push( buildAttr(key, value) );
		});
		return builtAttrs;
	}
	
	return {
		tag:buildTag,
		tags:buildTags,
		attr:buildAttr,
		attrs:buildAttrs
	};
})();

SubtleSlickSpeed.Report.prototype.buildWrapperElement = function(){
	this.table = this.table || new SubtleSlickSpeed.Report.Table();
	
	return this.table.toElement();
};
SubtleSlickSpeed.Report.prototype.buildOne = function(test){
	if (!this.table.hasSetCells) {
		this.table.set('header', 'header', 'SELECTORS');
		for (var frameworkName in Frameworks) {
			
			if (!Frameworks[frameworkName].stop) this.table.set('header', frameworkName, frameworkName);
			
			for (var i=0; i < SELECTORS.length; i++) {
				if (SELECTORS[i]) this.table.set(SELECTORS[i], 'header', SELECTORS[i]);
				if (!Frameworks[frameworkName].stop) if (SELECTORS[i]) this.table.set(SELECTORS[i], frameworkName, 'loading… 2');
			}
		}
		this.table.hasSetCells = true;
	}
	
try{
	var d = test.getData();
	d.id = test.id.split(';;;');
	d.framework = d.id[1];
	d.selector  = d.id[0];
	
	Number.setCompare(d.selector, test.id+'selector', d.iterations.time.average);
	Number.setCompare(d.framework, test.id+'framework', d.iterations.time.average);
	Number.setCompare('All', test.id+'selector', d.iterations.time.average);
	// selectorNumbers[test.id] = {selector:d.selector, value:d.iterations.time.average};
	
	var l = document.getElementById('log');
	l.innerHTML = (Build.tag('u',{}, Math.round(d.iterations.time.average *1000)/1000 + 'ms average after running '+ d.iterations.count +' iterations' ) +' — '+ d.id.join(" : ") +'\n') + l.innerHTML;
	l = null;
	
	// console.log(d);
	this.table.set('header', 'header', 'SELECTORS');
	this.table.set('header', d.framework, function(){
		var html = ['<div class="wrap">'];
		html.push(Build.tag('h3',{},d.framework));
		
		html.push(Build.tag('div', { 'class':'bgw' },
			function(){
				var html = [], n, n1;
				var a = [
					[d.selector, 'selector'],
					[d.framework, 'framework'],
					['All']
				];
				n1 = Number.getCompare('All', Number.getCompare(d.framework, d.iterations.time.average).avg).percent.avg * 100;
				n = Number.setCompare('An', d.framework, n1).percent.max * 100;
				n = 100 - n;
				n1 = (Math.round( (200 - n1) /100 *10)/10);
				
				var className = '';
				for (var i=0; i < a.length; i++) {
					className += ' '+ a[i][a[i].length-1]
				}
				html.push(
					Build.tag('div', { 'class':'bg '+className, style:'width:' + n + '%;height:' + n + '%;font-size:' + n + '%;opacity:' + n/100}, n1 + 'x' )
				);
				
				return html.join('');
			}
		));
		html.push('</div>');
		return html.join('');
	});
	this.table.set(d.selector, 'header', d.selector);
	var imgid;
	this.table.set(d.selector, d.framework, buildCell(test,d));
	// Number.compare(d.selector, d.iterations.time.average);
	
	// var tr = document.createElement('tr');
	// var td = document.createElement('td');
	// td.appendChild(document.createTextNode(d.selector));
	// tr.appendChild(td);
	
	// clearTimeout(doneBuildingTimeout);
	// doneBuildingTimeout = setTimeout(doneBuildingFn, 0);
}catch(e){
	console.log(e);
};
};
function buildCell(test,d){
	return function(){
		var html = ['<div class="wrap">'];
		
		html.push(Build.tag('div', { 'class':'bgw' },
			function(){
				var html = [], n, n1;
				var a = [
					[d.selector, 'selector'],
					[d.framework, 'framework'],
					['All']
				];
				for (var i=0; i < a.length; i++) {
					n1 = Number.getCompare(a[i][0], d.iterations.time.average).percent.avg * 100;
					n = Number.setCompare(a[i][0]+'n', test.id, n1).percent.max * 100;
					n = 100 - n;
					n1 = (Math.round( (200 - n1) /100 *10)/10);
					
					html.push(
						Build.tag('div', { 'class':'bg '+a[i][a[i].length-1], style:'width:' + n + '%;height:' + n + '%;font-size:' + n + '%;opacity:' + n/100}, n1 + 'x' )
					);
				}
				
				return html.join('');
			}
		));
		
		html.push( Build.tag('strong', {'class':'result'}, "Result: " + d.result ) );
		
		html.push(' ');
		
		html.push(
			Build.tag('strong', 
				{
					title:
					'min:'+ Math.round(d.iterations.time.min     *1000)/1000 +',\n'+
					'avg:'+ Math.round(d.iterations.time.average *1000)/1000 +',\n'+
					'max:'+ Math.round(d.iterations.time.max     *1000)/1000
				},
				Math.round(d.iterations.time.average *1000)/1000 +
				Build.tag('em', {}, ' ms/op')
			)
		);
		
		html.push(' ');
		
		html.push(
			Build.tag('strong', {'class':'sec'},
				Math.round(d.iterations.time.averageCountPerSecond) +
				Build.tag('em', {}, ' ops/sec ')
			)
		);
		
		html.push(
			Build.tag('a', {
				'class': 'rerun',
				onclick: "var t=SubtleSlickSpeed.Tests['"+String.escapeSingle(test.id)+"'];t.run(15, true);",
				href: 'javascript:void(0)'
			}, 'rerun')
		);
		
		html.push(
			((/debug/).test(document.location.hash) ? Build.tag('div', {}, pp(d)) : '')
		);
		
		html.push('</div>');
		return html.join('');
	};
};


function doneBuildingFn(){
	for (var id in selectorNumbers) {
		Element_keepNumberCompared('selectorNumbers[id].selector', 'chartimg-'+UID.uidOf(id), selectorNumbers[id].value);
	}
};
var doneBuildingTimeout;
var selectorNumbers = {};

// document.write('hi')
// 
// var fred = new SubtleSlickSpeed.Report.Table('fred');
// document.body.appendChild( fred.toElement() );
// 
// cols = ['Selectors', 'frame 1', 'frame 2', 'frame 3', 'frame 4', 'frame 5', 'frame 6', 'frame 7'];
// for (var c=0; c < cols.length; c++) {
// 	UID.uidOf(cols[c]);
// }
// 
// fred.set('row0','col0', 'Selectors');
// fred.set('row1','col0', 'selector 1');
// fred.set('row2','col0', 'selector 2');
// fred.set('row3','col0', 'selector 3');
// fred.set('row4','col0', 'selector 4');
// fred.set('row5','col0', 'selector 5');
// fred.set('row6','col0', 'selector 6');
// fred.set('row7','col0', 'selector 7');
// 
// 
// 
// fred.set('row1','col1', 'c1 selector 1');
// fred.set('row1','col2', 'selector 1');
// fred.set('row1','col3', 'selector 1');
// fred.set('row2','col1', 'c1 selector 2');
// fred.set('row2','col2', 'selector 2');
// fred.set('row2','col3', 'selector 2');
// fred.set('row3','col1', 'c1 selector 3');
// fred.set('row3','col2', 'selector 3');
// fred.set('row3','col3', 'selector 3');
// fred.set('row4','col1', 'c1 selector 4');
// fred.set('row4','col2', 'selector 4');
// fred.set('row4','col3', 'selector 4');
// fred.set('row5','col1', 'c1 selector 5');
// fred.set('row5','col2', 'selector 5');
// fred.set('row5','col3', 'selector 5');
// fred.set('row6','col1', 'c1 selector 6');
// fred.set('row6','col2', 'selector 6');
// fred.set('row6','col3', 'selector 6');
// fred.set('row7','col1', 'c1 selector 7');
// fred.set('row7','col2', 'selector 7');
// fred.set('row7','col3', 'selector 7');
// fred.set('row0','col1', 'c1 Selectors');
// fred.set('row0','col2', 'Selectors');
// fred.set('row0','col3', 'Selectors');
// 
// fred.set('row0','col1', 'frame 1');
// fred.set('row0','col2', 'frame 2');
// fred.set('row0','col3', 'frame 3');
// fred.set('row0','col4', 'frame 4');
// 
// fred.set('row1','col1', '1');
// fred.set('row1','col2', '2');
// fred.set('row1','col3', '3');
// fred.set('row1','col4', '4');
// 
// fred.set('row2','col1', '5');
// fred.set('row2','col2', '6');
// fred.set('row2','col3', '7');
// fred.set('row2','col4', '8');
// 
// 

