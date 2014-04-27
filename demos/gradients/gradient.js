require('../mode');
require('../fonts/moderna');
var ART = require('../../index');
var MetricsPath = require('../../metrics/path');

//addEvent('domready', function(){

var art = ART.Surface(1000, 600);

var group = new ART.Group(1000, 600).inject(art);

var tang = new ART.Shape().translate(550, 50).stroke('#000').inject(group);

/*var stops = { '0.0': '#000', '0.5': '#FFF', '1.0': '#F00' };

console.log(JSON.encode(convertPointsToAngle( 1, 1, 2, 1, stops )));
console.log(JSON.encode(convertPointsToAngle( 0, 0, 0, -1, stops )));
console.log(JSON.encode(convertPointsToAngle( 0, 0, -1, 0, stops )));
console.log(JSON.encode(convertPointsToAngle( 0, 0, 0, 1, stops )));
console.log(JSON.encode(convertPointsToAngle( -10, 30, 20, 0, stops )));
console.log(JSON.encode(convertPointsToAngle( 0.5, 0.5, 2, 2, stops )));
console.log(JSON.encode(convertPointsToAngle( 0.5, 0.5, -1, -1, stops )));
console.log(JSON.encode(convertPointsToAngle( -0.25, -0.25, 0.75, 0.75, stops )));

function convertPointsToAngle(x1, y1, x2, y2, stops){

	var dx = x1 - x2, dy = y1 - y2;
	var distance = Math.sqrt(dx * dx + dy * dy);
	var angle = Math.atan2(dx + distance, dy) * 2;

	var c = Math.cos(angle), s = -Math.sin(angle),
		l = Math.abs(c) + Math.abs(s);

	/*var o1 = (x1 * c) - (y1 * s);
	var o2 = ((0.5 - (c * l / 2)) * c) - ((0.5 - (s * l / 2)) * s);
	o2 = (x2 * c) - (y2 * s);* /

	var xx = 0.5 - (c * l / 2);
	var yy = 0.5 - (s * l / 2);

	var o = ((x1 - xx) * c + (y1 - yy) * s) / l;
	var scale = distance / l;

	var newStops = {};
	for (var offset in stops){
		newStops[(offset * scale + o).toFixed(2)] = stops[offset];
	}

	return { angle: angle * 180 / Math.PI, sp: [x1, y1], gp: [Math.round(xx * 1000) / 1000, Math.round(yy * 1000) / 1000], o: Math.round(o * 1000) / 1000, s: scale, stops: newStops };
*/
/*
	angle *= Math.PI / 180;

	var x1 = .5, y1 = .5;

	var x2 = Math.cos(angle), y2 = Math.sin(angle),
		l = (Math.abs(x2) + Math.abs(y2)) / 2;

	x2 *= l; y2 *= l;

	var x3 = -Math.sin(angle) * 40, y3 = Math.cos(angle) * 40;
*/

/*
	angle = ((angle == null) ? 270 : angle) * Math.PI / 180;

	var x = Math.cos(angle), y = -Math.sin(angle),
		l = (Math.abs(x) + Math.abs(y)) / 2;

	x *= l; y *= l;

	gradient.setAttribute('x1', 0.5 - x);
	gradient.setAttribute('x2', 0.5 + x);
	gradient.setAttribute('y1', 0.5 - y);
	gradient.setAttribute('y2', 0.5 + y);
*/

//}

var pill = new ART.Pill(200, 20).stroke('#ccc').fill('rgba(255, 0, 0, .2)').inject(group);
var text = new ART.Font('Some Text!', 'normal 10px Moderna').translate(20, 5).fill('#000').inject(group);

//group.resize(500, 300);

pill = new ART.Pill(200, 20).fill('rgba(0, 0, 0, .2)').translate(0, 180).inject(group);
text = new ART.Font('Some Text!', 'normal 10px Moderna').translate(20, 185).fill('#000').rotate(-45).inject(group);

new ART.Ellipse(100, 100).translate(50, 50).fill('#0f0').inject(group);
var p = new ART.Path().move(0, 0).counterArc(100, 70, 100, 200, false);
new ART.Shape().draw(p).translate(50, 50).stroke('#000').fill('#00f').inject(group)
var p = new MetricsPath().move(0, 0).counterArc(100, 70, 100, 200, false);
var size = p;
new ART.Rectangle(size.width, size.height).translate(size.left + 49.5, size.top + 49.5).stroke('#c00').inject(group);

var blu = new ART.Wedge(0, 100, 370, 50).fill('#00f').translate(400.5, 0.5).rotate(90, 100, 0).scale(2, 1).inject(group);

var wedge = new ART.Wedge().fillRadial(['#00f', '#f00', 'rgba(255, 0, 0, 0)'], 100, 100, 100).translate(200.5, 0.5).stroke('rgba(0, 0, 0, .2)', 20).inject(group);

wedge.scale(0.5).move(100, 0);

var bb = new ART.Rectangle().stroke('rgba(0, 0, 0, .5)').inject(group);

//group.scale(1, 1).rotate(0, 0, 200).translate(0, 0).scale(1);

new ART.Ellipse(200, 100).fillRadial(['#000', '#F00', '#FFF'], 200 * .15, 100 * .5, 200 * .5, 100 * .5, 200 * .5, 100 * .5).translate(500, 200).inject(group);
var gt = new ART.Rectangle(100, 300).translate(450, 0).scale(1, 1).stroke('#000').inject(group);

//gt.translate(100, 0);

var rt = new ART.Rectangle(100, 200).translate(600, 310).stroke('#000').inject(group);

var p = new ART.Path().move(20, 20).line(200, 0).line(-100, 100).line(-10, 0).close().move(10, 10).arc(100, 100).arc(-100, -100).close();
new ART.Shape(p).fillRadial(['rgba(255, 0, 0, .2)', '#00f', '#f00', '#0f0']).translate(150, 310).stroke('#000').inject(group);
size = new MetricsPath().move(20, 20).line(200, 0).line(-100, 100).line(-10, 0).close().move(10, 10).arc(100, 100).arc(-100, -100).close();
new ART.Rectangle(size.width, size.height).translate(size.left + 150, size.top + 310).stroke('#ddd').inject(group);

//var log = new Element('div').inject(document.body);

new ART.Rectangle(100, 100).translate(550, 50).stroke('#ddd').inject(group);

/*var tb = document.createElement('av:textbox');
rt.element.appendChild(tb);
var span = new Element('span', { text: 'My text .sdfgsd fgsdf gsdfg.sd f.gsdfgd.sf sd.fg.sdf g.sdf.g.sdfg. s.dg.sdfg.sd fgsd.fg.sd g.sdfg.' });
span.inject(tb);*/

//gt.fillLinear({ '0.00': 'rgba(0, 0, 0, 0.2)', '0.02': '#000', '0.49': '#F00', '0.50': '#FFF', '0.51': '#F00', '0.98': 'rgba(255, 255, 255, 1)', '1.00': '#0F0' });

gt.fill('rgb(0, 0, 0, .1)', 'rgb(255, 0, 0, .2)');

art.inject(document.body);
//console.log('injected');

//window.logger = new Element('div').inject(document.body);

gt.fill();

gt.rotate(20, 0, 0);

gt.fill('#f00', '#0f0');

	var angle = (new Date() % 30000) / 30000 * 360;

rt.fillRadial({ 0.0: '#000', '0.9': '#F00', '1.0': '#FFF' }, 100 * .5, 200 * (.5 + Math.abs(Math.cos(angle * Math.PI / 90)) / 2), 100 * .25, 200 * .25, 100 * .5, 200 * .75);


var txt = new ART.Text('Hello', 'bold 60px "Arial"')
	.move(300, 450)
	.scale(2,2)
	.fillRadial({ 0.0: '#000', '0.9': '#F00', '1.0': '#FFF' }, 100, 50, 70, 40, 50, 50)
	.inject(group);


//txt.fillLinear(['#CCF', '#FFF'], 0, 0, 0, 50);
//gt.fill();

//gt.fill('rgb(0, 0, 0)', 'rgb(255, 0, 0)');

//gt.fill('#f00');

gt.move(100, 350).scale(-2, 1);

rt.rotate(20, 0, 0).scale(2, -1);

//gt.transform(-1, 0, -0.5, 1, 0, 0);

//group.scale(1, 0.8);

//	gt.moveTo(200, 10);

	//gt.scaleTo(-1.5, 1);

	window.boundingBox = new ART.Rectangle(200, 200);
window.boundingBox.stroke('#0C0').inject(art);

	wedge.scaleTo(1, 1);
	wedge.moveTo(200, 0);


setInterval(function(){

//gt.fill('rgb(0, 0, 0)', '#f00');

	var angle = (new Date() % 30000) / 30000 * 360;
	rt.fillRadial({ 0.0: '#000', '0.9': '#F00', '1.0': '#FFF' }, 100 * .5, 200 * (.5 + Math.abs(Math.cos(angle * Math.PI / 90)) / 2), 100 * .25, 200 * .25, 100 * .5, 200 * .75);
	//rt.fillRadial({ 0.0: '#000', '0.9': '#F00', '1.0': '#FFF' }, 100 * .5, 200, 100 * .25, 200 * .25);
	gt.fillRadial({ 0.0: '#000', '0.9': '#F00', '1.0': '#FFF' }, 100 * .5, 200 * (.5 + Math.abs(Math.cos(angle * Math.PI / 90)) / 2), 100 * .25, 200 * .25, 100 * .5, 200 * .75);
	gt.fillLinear({ '0.00': '#0F0', '0.02': '#000', '0.49': '#F00', '0.50': '#FFF', '0.51': '#F00', '0.98': 'rgba(255, 255, 255, 1)', '1.00': '#00B' }, angle);
	//gt.fillLinear({ '0.00': '#0F0', '0.02': '#000', '0.49': '#F00', '0.50': '#FFF', '0.51': '#F00', '0.98': 'rgba(255, 255, 255, 1)', '1.00': '#00B' }, 100,0,0,300);
	//gt.rotate(1, 100, 300);

	txt.fillRadial({ 0.0: '#000', '0.9': '#F00', '1.0': '#FFF' }, 100 * (Math.abs(Math.cos(angle * Math.PI / 90))), 50, 70, 40, 50, 50)

	//gt.rotateTo(0, 0, 0);

	//gt.scaleTo(0.5, 1);

	//div.setStyle('background-image', '-moz-linear-gradient(' + angle + 'deg, #000, #F00, #FFF)');

	angle *= Math.PI / 180;

	var x1 = .5, y1 = .5;

	var x2 = Math.cos(angle), y2 = Math.sin(angle),
		l = (Math.abs(x2) + Math.abs(y2)) / 2;

	x2 *= l; y2 *= l;

	var x3 = -Math.sin(angle) * 40, y3 = Math.cos(angle) * 40;

	//tang.draw(new ART.Path().move(x1 * 100, y1 * 100).line((x2) * 100, (y2) * 100).move(x3, y3).line(-x3 * 2, -y3 * 2));


	// Wedget

	var angle = (new Date() % 30000) / 30000 * 360;
	wedge.draw(0, 100, 0, Math.round(angle));
	/*var size = wedge.path.measure();
	bb.moveTo(200 + size.left, 0 + size.top).draw(size.width, size.height);*/
	txt.scale(1,1);


}, 50);
/*
var second = 1000,
	minute = second * 60,
	hour = minute * 60,
	day = hour * 24,
	month = day * 30.41,
	year = month * 12;

var timescales = [year, month, day, hour, minute];

var wedges = timescales.map(function(s, i){ return new ART.Wedge().fill('#0f0').translate(640 - i * 10, 40 - i * 10).inject(group); });

setInterval(function(){

	var time = +new Date();

	timescales.each(function(s, i){
		wedges[i].draw(40 + i * 10, 48 + i * 10, 0, (time % s) / s * 360);
	});

}, 50);
*/

//});
