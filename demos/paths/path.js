require('../mode');
var ART = require('../../index');
var MetricsPath = require('../../metrics/path');
var SVGPath = require('../../modes/svg/path');

var art = new ART.Surface(1000, 600);

var group = new ART.Group();

var curve = new ART.Path().move(200, 20).curve(100, 0, 0, 200, 300, 300);

curve.move(-100, -100).line(100, -100).line(100, 100);

curve.arc(-100, 0, 100, 200).counterArc(0, 50, 100);

var line = new ART.Shape(curve).stroke('#00F', 1).translate(0,0).inject(group);

group.inject(art);

group.scale(1, 1);

var curve = new MetricsPath()
curve._measureLine = curve.onLine;
curve.onLine = function(sx, sy, x, y){
	this._measureLine(sx, sy, x, y);
	new ART.Rectangle(3, 3).fill('#0f0').move(x - 1, y - 1).inject(group);
};

curve.move(200, 20).curve(100, 0, 0, 200, 300, 300)
	.move(-100, -100).line(100, -100).line(100, 100)
	.arc(-100, 0, 100, 200).counterArc(0, 50, 100);


var square = new ART.Rectangle(20, 10).fill('#F00').inject(group);

art.inject(document.body);

console.log(curve.length);

var curve2 = new SVGPath()
	.move(200, 20).curve(100, 0, 0, 200, 300, 300)
	.move(-100, -100).line(100, -100).line(100, 100)
	.arc(-100, 0, 100, 200).counterArc(0, 50, 100);

if (document.createElementNS){
	var nativeCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	nativeCurve.setAttribute('d', curve2.toSVG());
	console.log(nativeCurve.getTotalLength());
}

var l = curve.length;

setInterval(function(){

	var i = ((+new Date()) / 50) % l;

	var point = curve.point(i);
	square.transformTo(point).translate(-15, -5);

}, 50);
