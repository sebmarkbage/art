require('../../modes/script');
var SVGParser = require('../../parsers/svg');

SVGParser.load('../svgviewer/testcase.svg', function(surface){
	var result = document.createElement('textarea');
  result.style.width = '500px';
  result.style.height = '500px';
	result.value = surface.toModule();
	document.body.appendChild(result);
});