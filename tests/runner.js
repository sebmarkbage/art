var query = document.location.search.substr(1).split('&'),
	options = {
		set: '',
		mode: 'fast',
		compare: false
	};

for (var i = 0, l = query.length; i < l; i++){
	var q = query[i].split('=', 2);
	options[q[0]] = q[1];
}

var MODE;
switch (options.mode){
	case 'vml': MODE = require('../modes/vml'); break;
	case 'svg': MODE = require('../modes/svg'); break;
	case 'canvas': MODE = require('../modes/canvas'); break;
	case 'dom': MODE = require('../modes/dom'); break;
	default: MODE = require('../modes/fast');
}
require('../modes/current').setCurrent(MODE);

var SVGParser = require('../parsers/svg');

var ComparisonTests = require('./ui/ComparisonTests');
var SetSelector = require('./ui/SetSelector');

var Specs = require('./specs');

if (!options.set){

	var selector = SetSelector(Specs);
	document.body.appendChild(selector);

} else {

	var Comparer = require('./comparer');

	var implementation = document.implementation;
	var hasSVG = (implementation && implementation.hasFeature && implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));

	var selectedSet = options.set;

	var tester = new ComparisonTests();

	function createTestRunner(svgPath, pngPath){
		return function(completed, failed){
			var img = new Image();
			img.onload = function(){
				var parser = new SVGParser(MODE);
				parser.load(svgPath, { viewportWidth: img.width, viewportHeight: img.height }, function(result){
					if (result == null){
						failed('Parser Failed: Returned null');
					} else {
						var wrapper;
						var link = document.createElement('a');
						link.setAttribute('href', svgPath);
						link.title = 'Click to view SVG';
						link.appendChild(img);

						if (hasSVG){
							var svgImg = document.createElement('iframe');
							svgImg.className = 'secondaryKey';
							svgImg.style.width = img.width + 'px';
							svgImg.style.height = img.height + 'px'
							svgImg.src = svgPath;

							link.className = 'primaryKey';

							wrapper = document.createElement('div');
							wrapper.appendChild(link);
							wrapper.appendChild(svgImg);

							link = wrapper;
						}

						var resultElement = result.toElement();

						var comparison = options.compare && Comparer.compare && Comparer.compare(img, result);

						if (comparison && comparison.element){
							resultElement.setAttribute('class', 'primaryResult');
							comparison.element.setAttribute('class', 'secondaryResult');

							wrapper = document.createElement('div');
							wrapper.appendChild(resultElement);
							wrapper.appendChild(comparison.element);
							resultElement = wrapper;
						}

						completed(resultElement, link, comparison ? comparison.score : null);
					}
				});
			};
			img.src = pngPath;
		};
	};

	var disabledSpecs = {};
	for (var i = 0, l = Specs.unsupportedFeatures.length; i < l; i++){
		disabledSpecs[Specs.unsupportedFeatures[i]] = true;
	}

	var sets = Specs.presets[selectedSet];

	function addSet(set){
		var set = Specs.sets[set];

		function addSpec(file){
			if (file in disabledSpecs){
				return;
			}
			tester.add(createTestRunner(set.testPath + file + '.svg', set.keyPath + file + '.png'), file);
		}

		for (var i = 0, l = set.files.length; i < l; i++)
			addSpec(set.files[i]);
	}

	var ranTests = {};

	if (sets){
		for (var i = 0, l = sets.length; i < l; i++)
			addSet(sets[i]);
	} else {
		for (var setName in Specs.sets){
			var set = Specs.sets[setName];
			for (var i = 0, l = set.files.length; i < l; i++){
				var file = set.files[i];
				if (file in disabledSpecs){
					continue;
				}
				if ((file == selectedSet || selectedSet == 'all') && !(file in ranTests)){
					ranTests[file] = true;
					tester.add(createTestRunner(set.testPath + file + '.svg', set.keyPath + file + '.png'), file);
				}
			}
		}
	}

	document.body.appendChild(tester.element);

	tester.run();

}