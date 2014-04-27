var specsSlickAPI = function(context){
	
	var SELECT = function(selector, append) {
		return context.SELECT(context.document, selector, append);
	};

	describe('Select Inputs', function(){
		
		describe('append', function(){
			
			it('should append results to an existing array if passed in', function(){
				var append = [];
				expect( SELECT('*', append) === append ).toEqual(true);
			});
			
			it('should append results to an existing array-like-thing if passed in',  function(){
				var append = {
					length: 0,
					push: function(item){
						this[this.length++] = item;
					}
				};
				expect( SELECT('*', append) ).toEqual( append );
			});
			
			if (document.querySelectorAll)
			it('should not fail when using QSA is enabled', function(){
				context.Slick && (context.Slick.disableQSA = false);
				expect( typeof SELECT('*').length ).toEqual('number');
				expect( SELECT('*').length ).not.toEqual(0);
			});
			
		});
		
		describe('context', function(){
			it('must accept a document', function(){
				expect( SELECT('*', []) ).not.toEqual( [] );
			});
			
			it('must accept a node', function(){
				expect( context.SELECT(context.document.documentElement, '*', []).length ).not.toEqual( 0 );
			});
			
			it('must accept any node',  function(){
				expect( context.SELECT(context.document.documentElement, '*', []).length ).not.toEqual( 0 );
				var timedLog;
				var elements = context.document.getElementsByTagName('*');
				for (var i=0, l=elements.length; i < l; i++) {
					if (elements[i].nodeType != 1) continue;
					
					if (global.console && global.console.log)
					timedLog = setTimeout(function(){
						console.log(elements[i]);
					}, 100);
					
					if (elements[i].getElementsByTagName('*').length)
						expect( context.SELECT(elements[i], '*', []).length ).not.toEqual( 0 );
					else
						expect( context.SELECT(elements[i], '*', []).length ).toEqual( 0 );
					
					clearTimeout(timedLog);
				}
			});
			
			it('must accept a window', function(){
				expect( context.SELECT(global.window, '*', []).length ).not.toEqual( 0 );
				if (context.window && !context.window.fake)
					expect( context.SELECT(context.window, '*', []).length ).not.toEqual( 0 );
			});
			
			it('must reject null', function(){ expect( context.SELECT(null, '*', []).length ).toEqual( 0 ); });
			it('must reject Number', function(){ expect( context.SELECT(1234567891011, '*', []).length ).toEqual( 0 ); });
			it('must reject Array ', function(){ expect( context.SELECT([1,2,3,4,5,6], '*', []).length ).toEqual( 0 ); });
			it('must reject String', function(){ expect( context.SELECT("string here", '*', []).length ).toEqual( 0 ); });
			it('must reject Object',  function(){ expect( context.SELECT({ foo:'bar' }, '*', []).length ).toEqual( 0 ); });
		});
		
	});

	describe('definePseudo', function() {

		describe('simple pseudo', function() {
			beforeEach(function() {
				context.DEFINE_PSEUDO('_select-span', function() {
					return this.nodeName.toLowerCase() === 'span';
				});
			});

			it('should be able to define a custom pseudo-class', function() {
				expect(SELECT(':_select-span').length).toEqual(SELECT('span').length);
			});
		});

		describe('pseudo that uses the selection engine inside it', function() {
			beforeEach(function() {
				context.DEFINE_PSEUDO('_has-elements', function(selector) {
					return !!context.SELECT1(this, selector);
				});
			});

			it('should be able to define a pseudo-class that uses the selection engine at its implementation', function() {
				var h2 = SELECT('div'),
					len = 0;

				for (var i = h2.length; i--;) {
					if (context.SELECT1(h2[i], 'input')) {
						len++;
					}
				}

				expect(SELECT('div:_has-elements(input)').length).toEqual(len);
			});
		});
	});
	
	/*
	describe('uniques', function(){
		var Slick = (context.Slick || global.Slick);
		
		it('should return uniques from `search` with append', function(){
			var append = [];
			var l1 = Slick.search(document, '*', append);
			expect( l1.length ).toEqual( append.length );
			expect( l1.length ).toEqual( Slick.uniques(append).length );
			
			// Should not add any more elements to append
			var l2 = Slick.search(document, '*', append);
			expect( l2.length ).toEqual( Slick.uniques(append).length );
			
			// expect( l2 ).toEqual( Slick.uniques(append).length );
			// expect( l1 ).toEqual( l2 );
		});
		
		it('should not recurse context with context == append', function(){
			var append = Slick.search(document, '*');
			
			var l1 = Slick.search(append, '*', Slick.search(document, ':root')).length;
			
			Slick.search(append, '*', append);
			var l2 = append.length;
			
			expect( l1 ).toEqual( l2 );
		});
		
		it('should support multiple contexts', function(){
			var l1 = Slick.search(document, '* *').length;
			
			var append = Slick.search(document, '*');
			var l2 = Slick.search(append, '*').length;
			
			expect( l1 ).toEqual( l2 );
		});
		
		it('should return uniques from `uniques` with append', function(){
			console.group('search');
			var append = Slick.search(document, '*');
			console.groupEnd('search');
			var append_length = append.length;
			var duplicates = append.concat(append);
			
			console.group('search with append');
			console.log(append.length);
			var results = Slick.search(document, 'a', append);
			console.log(results.length);
			console.groupEnd('search with append');
			
			
			expect( results ).toEqual( append );
			expect( append.length ).toEqual( append_length );
			
			expect( Slick.uniques(results).length ).toEqual( append_length );
			
			// expect(Slick.uniques(duplicates).length).not.toEqual(duplicates.length);
			// 
			// expect(
			// 	Slick.uniques(duplicates, append).length
			// ).toEqual(
			// 	append.length
			// );
			// 
			// expect(
			// 	Slick.uniques(duplicates, append).length
			// ).toEqual(
			// 	Slick.uniques(duplicates).length
			// );
			
		});
		
		it('should add results to append', function(){
			var append;
			
			append = [];
			Slick.search(document, '*', append);
			expect( append.length ).toEqual( Slick.search(document, '*').length );
			
			append = [];
			Slick.search(document, '*', append);
			expect( append.length ).toEqual( Slick.search(document, '*').length );
		});
	});
	*/
};
