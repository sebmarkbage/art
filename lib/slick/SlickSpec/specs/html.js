var specsSlickHtml = function(context){

var makeSlickTestSearch = function(selector, count, disableQSA) {
	return function(){
		context.SELECTOR.disableQSA = !!disableQSA;
		var selectedArray = context.SELECT(context.document, selector);
		var selected = context.SELECT1(context.document, selector);
		expect( selectedArray.length ).toEqual( count );
		if (count){
			expect( selected ).not.toBeNull();
			expect( selected ).toEqual(selectedArray[0]);
			expect( context.MATCH(selectedArray[0], selector) ).toEqual( true );
		} else {
			expect( selected ).toBeNull();
		}
		delete context.SELECTOR.disableQSA;
	};
};

var itShouldFind = function(count, selector){
	if (global.document.querySelectorAll && !global.cannotDisableQSA)
		it('should find '+count+' `'+selector+'` with    QSA', makeSlickTestSearch(selector, count, false));
	it('should find '+count+' `'+selector + (!global.cannotDisableQSA ? '` without QSA' : ''), makeSlickTestSearch(selector, count, true));
};

describe('Slick', function(){

	itShouldFind(1, 'body a[tabindex="0"]');
	itShouldFind(1, 'body a[tabindex="1"]');
	itShouldFind(2, 'body a[tabindex]');
	itShouldFind(2, 'body [tabindex="0"]');
	itShouldFind(2, 'body [tabindex="1"]');
	itShouldFind(5, 'body [tabindex]');

	itShouldFind(2, 'body [maxlength="10"]');
	itShouldFind(4, 'body [maxlength]');

	describe('Combinators', function(){

		it('should find `~`', function(){
			expect(context.SELECT1(context.document.getElementById('one'), '~')).not.toBeNull();
		});
		it('should find `~div`', function(){
			expect(context.SELECT1(context.document.getElementById('one'), '~div')).not.toBeNull();
		});
		it('should find `> i`', function(){
			expect(context.SELECT1(context.document.getElementById('one'), '> i')).not.toBeNull();
		});
		it('should find `+`', function(){
			expect(context.SELECT1(context.document.getElementById('one'), '+')).not.toBeNull();
		});
		it('should find `+div`', function(){
			expect(context.SELECT1(context.document.getElementById('one'), '+div')).not.toBeNull();
		});
		it('should find `non-existent-tag-name, +div`', function(){
			expect(context.SELECT1(context.document.getElementById('one'), 'non-existent-tag-name, +div')).not.toBeNull();
		});

		describe('Orphan context', function() {

			beforeEach(function() {
				this.context = context.document.createElement('div');
				this.context.innerHTML = [
					'<div id="children-orphan-context"></div>'
				].join('');
				this.firstChild = this.context.firstChild;
			});

			it('should find `#chidren-orphan-context`', function() {
				expect(this.firstChild).not.toBeNull();
				expect(this.firstChild.id).toEqual('children-orphan-context');
				expect(context.SELECT1(this.context, '#children-orphan-context')).toEqual(this.firstChild);
			});

		});
	});

	describe('Contains', function(){

		it('should check contains for document', function(){
			expect(context.CONTAINS(document, document)).toEqual(true);
		});
		it('should check contains for document', function(){
			expect(context.CONTAINS(document, document.documentElement)).toEqual(true);
		});
		it('should check contains for document', function(){
			var el = document.createElement('div');
			expect(context.CONTAINS(document, el)).toEqual(false);
		});

	});

});

};
