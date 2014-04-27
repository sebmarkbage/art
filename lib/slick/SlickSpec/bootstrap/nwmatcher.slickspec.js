var setupMethods = function(specs, window){
	global.cannotDisableQSA = true;
	
	window.SELECT = function(context, selector, append){
		return (window.NW || global.NW).Dom.select(selector, context, append);
	};
	window.MATCH = function(context, selector){
		return (window.NW || global.NW).Dom.match(context, selector);
	};
	window.isXML = TODO;
}

var verifySetupMethods = function(specs, window){
	describe('Verify Setup',function(){
		it('should define SELECT', function(){
			expect( typeof window.SELECT ).toEqual('function');
			expect( window.SELECT(window.document, '*').length ).not.toEqual(0);
		});
		it('should define MATCH', function(){
			expect( typeof window.MATCH ).toEqual('function');
			expect( window.MATCH(window.document.documentElement, '*') ).toEqual(true);
		});
		it('should define isXML', function(){
			expect( typeof window.isXML ).toEqual('function');
		});
	});
};
