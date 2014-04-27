/*
	SubtleSlickSpeed.Report
	Copyright 2009 Thomas Aylott (subtleGradient.com)
	LICENSE: MIT
*/
SubtleSlickSpeed.Report = (function(){
	
	function Report(tests){
		// console.log('Report()', {tests:tests});
		this.tests = {};
		var self = this;
		self.updateOne.timeouts = {};
		this.updateOneBound = function(test){
			if (self.updateOne.timeouts[test.id]) clearTimeout(self.updateOne.timeouts[test.id]);
			self.updateOne.timeouts[test.id] = setTimeout(function(){
				self.updateOne.call(self, test);
				// self.fireEvent('update');
			},100);
		};
		this.addTests = function(tests){
			Object.each(tests, connectTest, self);
			return self;
		};
		
		if (tests) this.addTests(tests);
	};
	Report.prototype = {
		
		// element,
		
		// tests:{},
		
		// addTests: function(){},
		
		buildWrapperElement: function(){
			// console.log('Report#buildWrapperElement');
			var dad = document.createElement('ul');
			document.body.appendChild(dad);
			return dad
		},
		
		buildOne: function(test){
			// console.log('Report#buildOne');
			var one = document.createElement('li');
			one.innerHTML = pp({
				id   : test.id,
				fn   : test.fn,
				// runs : test.runs,
				data : test.getData()
			});
			return one;
		},
		
		toElement: function(){
			// console.log('Report#toElement');
			if (this.element) return this.element;
			return this.element = this.buildWrapperElement();
		},
		
		// Update a single test passively
		updateOne: function(test){
			// console.log('Report#updateOne', { test:test });
			var dad = this.toElement();
			var elNew = this.buildOne(test);
			var el = elements[test.id];
			if (el && el.parentNode && elNew) {
				el.parentNode.replaceChild(elNew, el);
			} else {
				if (elNew) dad.appendChild(elNew);
			}
			elements[test.id] = elNew;
			return this;
		}
	};
	
	var elements = {};
	function connectTest(test, id){
		// console.log('Report##connectTest', { test:test });
		test.id = test.id || id;
		this.tests[test.id] = test;
		
		if (!test || !test.addEvent) return;
		test.addEvent('complete', this.updateOneBound);
	};
	
	return Report;
})();
