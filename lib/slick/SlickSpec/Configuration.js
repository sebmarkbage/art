(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'MooTools Slick';

Configuration.presets = {
	'slick': {
		sets: ['specs'],
		source: ['helpers', 'slick']
	}
};

Configuration.defaultPresets = {
	browser: 'slick',
	jstd: 'slick'
};

Configuration.sets = {

	'specs': {
		path: 'specs/',
		files: [
			'unit', 'syntax', 'api', 'engine_bugs', 'html', 'html5',
			'select_nth-child', 'select_exhaustive', 'mock_template', 
			'isxml', 'xml',
			'match', 'parser',
			'google_closure', 'prototype', 'jquery', 'dojo', 'yui'
		]
	}
	
};

Configuration.source = {
	
	'helpers': {
		path: '',
		files: [
			'assets/simple_request',
			'assets/JSSpecHelpers',
			'bootstrap/slick.slickspec',
			'setup'
		]
	},

	'slick': {
		path: '../Source/',
		files: [
			'Slick.Finder',
			'Slick.Parser'
		]
	}

};

})(typeof exports != 'undefined' ? exports : this);
