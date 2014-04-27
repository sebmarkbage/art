/*
	SubtleSlickSpeed
	Copyright 2009 Thomas Aylott (subtleGradient.com)
	LICENSE: MIT
*/
var SubtleSlickSpeed = parent.SubtleSlickSpeed || (function(){
	
	// Main
	var SubtleSlickSpeed = {
		Tests  : [],
		Test   : function(){},
		Runner : function(){},
		Report : function(){}
	};
	
	
	// Runner
	function Runner(tests){
		/* console.log('Runner()'); */
		this.tests = tests; // Linked to original object!
	};
	Runner.prototype = {
		
		run: function(){
			/* console.log('Runner#run'); */
			var tests = [];
			Object.each(this.tests, function(test){
				tests.push(test);
			});
			
			tests.sort(Array.makeSortByKey('id'));
			
			var runNextTest = function runNextTest(){
				var test = tests.pop();
				if (test) test.run();
				if (tests.length) setTimeout(runNextTest, 0);
			};
			runNextTest();
			return this;
		}
	};
	
	// Test
	var Tests = {};
	function Test(id, fn, binding){
		
		// Support passing in a nested object instead of a Function
		var EACH;
		switch(Object.type(fn)){
		case 'array':
			EACH = Array.each;
		case 'object':
			EACH = EACH || Object.each;
			
			var tests = [];
			EACH(fn, function(testFn, testName){ tests.push(new Test(testName+'.'+id, testFn, binding)); });
			return tests;
		}
		
		/* console.log('Test', {id:id, fn:fn}); */
		this.id = id;
		this.fn = fn;
		this.runs = [];
		this.data = $unlink(this.data);
		this.binding = binding||{};
		
		var self = this;
		var run = this.run;
		this.run = function RUN_Apply(){
			return run.apply(self, Array.prototype.slice.call(arguments));
		};
		
		clearTimeout(Test._loadTimer);
		Test._loadTimer = setTimeout(function(){
			WindowEvents.fireEventStatic('load:tests');
		}, 100);
		
		Tests[id] = this;
	};
	// Test.MAX_ITERS   = 99999;
	// Test.MAX_ITER_TIME = 1;
	// Test.MAX_RUNS     = 9999;
	// Test.MAX_RUN_TIME = 10;
	Test.MIN_ITERS   = 5;
	Test.MIN_ITER_TIME = 1;
	Test.MIN_RUNS     = 1;
	Test.MIN_RUN_TIME = 4;
	Test.prototype = Object.merge(
		Events,
		{
			run: function RUN(MIN_RUNS, force){
				if (SubtleSlickSpeed.STOP && !force) return this;
				// console.profile(this.id);
				// var MIN_RUNS      = Test.MIN_RUNS;
				MIN_RUNS = MIN_RUNS || Test.MIN_RUNS;
				var MIN_ITERS     = Test.MIN_ITERS;
				var MIN_ITER_TIME = Test.MIN_ITER_TIME;
				var MIN_RUN_TIME  = Test.MIN_RUN_TIME;
				// var MAX_ITERS     = Test.MAX_ITERS;
				// var MAX_ITER_TIME = Test.MAX_ITER_TIME;
				// var MAX_RUNS      = Test.MAX_RUNS;
				// var MAX_RUN_TIME  = Test.MAX_RUN_TIME;
				var run;
				var iteration;
				this.data.runs.count = this.data.runs.count || 0;
				this.data.iterations.count = this.data.iterations.count || 0;
				// try {
					if (this.fnBefore) this.fnBefore(i);
					
					do {this.data.runs.count++;
						// run = {iterations:[], data:{time:{}, iterations:{}}};
						run = {
							iterations: [],
							data:{
								time:{
									start:0,
									end:0,
									total:0
								},
								iterations:{
									count:0,
									time:{
										averageCountPerRun:0,
										averageCountPerSecond:0,
										min:0,
										max:0,
										average:0
									}
								}
							}
						};
						this.runs.push(run);
						var rd = run.data;
						var rdt = run.data.time;
						rdt.start = rdt.end = +new Date;
						// try {
							do {this.data.iterations.count++;
								iteration = {
									data:{
										time:{
											start : 0,
											end   : 0,
											total : 0
										}
									}
								};
								run.iterations.push(iteration);
								var idt = iteration.data.time;
								
								idt.start = idt.end = +new Date;
								run.result = iteration.result = this.fn.call(this.binding, this.data.iterations.count);
								idt.end = rdt.end = +new Date;
								// switch(Object.type(iteration.result)){
								// case 'array':
								// 	iteration.result = {length:iteration.result.length};
								// 	break;
								// case 'object':
								// 	var length = 0;
								// 	for (var property in iteration.result) length++;
								// 	iteration.result = { length:length };
								// 	break;
								// case 'string':
								// case 'number':
								// default:
									iteration.result = ''+ iteration.result;
									run.result = ''+ iteration.result;
								// }
								
								idt.total = idt.end - idt.start;
								rdt.total = rdt.end - rdt.start;
								rd.iterations.count = run.iterations.length;
								
								if (this.fnAfterEach) this.fnAfterEach(iteration);
							} while (
								// Give up as soon as you can
								// If any are true, keep going
								(rd.iterations.count < MIN_ITERS) // Must continue if it hasn't done all its chores
								||(idt.total < MIN_ITER_TIME) // Must continue if it hasn't completed a full days work
							)
						// }catch(err){
						// 	rdt.end = +new Date;
						// 	throw(err);
						// };
					} while (
						// Give up as soon as you can
						// If any are true, keep going
						(this.runs.length < MIN_RUNS) // Must continue if it hasn't done all its chores
						||(rdt.total < MIN_RUN_TIME) // Must continue if it hasn't completed a full days work
					);
					
					if (this.fnAfter) this.fnAfter(i);
				// }catch(err){
				// 	run.error = {
				// 		raw: err,
				// 		message:err.message
				// 	};
				// };
				// console.profileEnd(this.id);
				this.fireEvent('complete', this);
				return this;
			},
			
			data: {
				runs:{
					time:{
						times:[]
						// max:0,
						// min:0,
						// average:0,
						// total:0
					}
				},
				iterations:{
					count:0,
					time:{
						times:[]
						// max:0,
						// min:0,
						// average:0,
						// total:0
					}
				}
			},
			
			getData: function(){
				var data = this.data;
				var di = data.iterations;
				var dit = data.iterations.time;
				var dr = data.runs;
				var drt = data.runs.time;
				di.count = 0;
				dit.average = [];
				dit.total = 0;
				drt.times = [];
				drt.total = 0;
				dr.count = this.runs.length;
				
				data.result = this.runs[0].result;
				
				Array.each(this.runs, function(run){
					var rd = run.data || {};
					
					rd.time.total = rd.time.end - rd.time.start;
					drt.total += rd.time.total;
					
					rd.iterations.count = run.iterations.length;
					rd.iterations.time.total = rd.time.total / rd.iterations.count;
					dit.total += rd.iterations.time.total;
					
					drt.times.push(rd.time.total);
					dit.times.push(rd.iterations.time.total);
					
					di.count += rd.iterations.count;
					
					run.data = Object.merge(run.data, rd);
				});
				
				dit.average = dit.total / dr.count;
				drt.average = drt.total / dr.count;
				dit.times.sort(function(a,b){return a-b;});
				
				dit.max = dit.times[dit.times.length-1];
				dit.min = dit.times[0];
				dit.averageCountPerRun = di.count / dr.count;
				dit.averageCountPerSecond = 1000 / dit.average;
				
				dit.times = [];
				drt.times = [];
				delete this.runs;
				this.runs = [];
				this.data = Object.merge(this.data, data);
				return this.data;
			}
		}
	);
	
	Test.Sandboxed = function(name, urls, mode){
		var sandbox = new SubtleSandbox(name, mode);
		if (!sandbox.window.console) sandbox.window.console = window.console;
		sandbox.window.SubtleSlickSpeed = window.SubtleSlickSpeed;
		sandbox.loadScript(urls);
		return sandbox;
	};
	
	// FUN TIMES!!1!
	SubtleSlickSpeed.Test = Test;
	SubtleSlickSpeed.Tests = Tests;
	SubtleSlickSpeed.Runner = Runner;
	return SubtleSlickSpeed;
})();
