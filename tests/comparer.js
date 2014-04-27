var CanvasMode = require('../modes/canvas');
var SVGParser = require('../parsers/svg');
var svgToCanvas = new SVGParser(CanvasMode);

var canvas = document.createElement('canvas');

var context = canvas.getContext && canvas.getContext('2d');

var oneOverMaxDistance = 1 / Math.sqrt(
	255 * 255 +
	255 * 255 +
	255 * 255 +
	255 * 255
);

if (context)
exports.compare = function(a, b){
	if (b.render) b.render();
	if (b.toElement) b = b.toElement();
	if (b.nodeName == 'svg' || b.nodeName == 'SVG'){
		b = svgToCanvas.parseAsSurface(b);
		b.render();
		b = b.toElement();
	}

	var w = Math.max(a.width, b.width),
		h = Math.max(a.height, b.height);

	canvas.width = w;
	canvas.height = h * 2;

	context.drawImage(a, 0, 0);
	context.drawImage(b, 0, h);
	
	var imgData = context.getImageData(0, 0, w, h * 2), data = imgData.data;

	var resultCanvas = null;
	var resultCanvas = document.createElement('canvas');
	var resultContext = resultCanvas.getContext('2d');
	var resultingImgData = resultContext.createImageData(w, h), result = resultingImgData.data;

	function colorDistanceBetween(a, b){
		var aa = data[a + 3] / 255, ba = data[b + 3] / 255,
		    rd = (data[a + 0] * aa) - (data[b + 0] * ba),
			gd = (data[a + 1] * aa) - (data[b + 1] * ba),
			bd = (data[a + 2] * aa) - (data[b + 2] * ba),
			ad = data[a + 3] - data[b + 3];

		var distance = Math.sqrt(
			rd * rd +
			gd * gd +
			bd * bd +
			ad * ad
		) * oneOverMaxDistance;

		return distance;
	}

	var sum = 0, comparedPixels = 0;

	var startTime = +new Date();

	for (var i = 0, l = w * h * 4; i < l; i += 4){

		var distance = colorDistanceBetween(i, l + i);
		if (i > 0) // Left
			distance *= 1 - ((1 - colorDistanceBetween(i, l + i - 4)) * 0.75);
		if (i >= w * 4) // Top
			distance *= 1 - ((1 - colorDistanceBetween(i, l + i - w * 4)) * 0.75);
		if (i < l - 4) // Right
			distance *= 1 - ((1 - colorDistanceBetween(i, l + i + 4)) * 0.75);
		if (i < l - w * 4) // Bottom
			distance *= 1 - ((1 - colorDistanceBetween(i, l + i + w * 4)) * 0.75);

		if (distance != 0 || data[i + 3] != 0){
			sum += distance * distance * distance;
			comparedPixels++;
		}

		result[i + 0] = 255 - distance * 255;
		result[i + 1] = 255 - distance * 255;
		result[i + 2] = 255 - distance * 255;
		result[i + 3] = 255;

	}

	var endTime = +new Date();

	//console.log('Tight comparison loop took ' + (endTime - startTime) + 'ms');

	var average = Math.pow(sum / comparedPixels, 1 / 3);

	resultCanvas.width = w;
	resultCanvas.height = h;
	resultContext.putImageData(resultingImgData, 0, 0, 0, 0, w, h);

	return { element: resultCanvas, score: 1 - average };
};