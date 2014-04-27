require('../mode');
var SVGParser = require('../../parsers/svg');

SVGParser.load('testcase.svg', function(surface){
	surface.inject(document.body);
});
