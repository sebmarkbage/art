var Slow = {};
Slow.Document = function(element) {
  this.body = element;
  this.document = this.documentElement = this;

  this.xml = true;
  this.navigator = {};
  this.attributes = {};

  this.nodeType = 9;
}

Slow.Document.prototype = {
  /*
    Slick.Finder tries to probe document it was given to determine
    capabilities of the engine and possible quirks that will alter
    the desired results.
  
    We try to emulate XML-tree (simple built-in querying capabilities),
    so all of the traversing work happens inside of Slick except
    getElementsByTagName which is provided by LSD.Module.DOM.
  
    So the problem is that Slick creates element and tries to
    append it to the document which is unacceptable (because every node
    in LSD.Document means widget instance, and we dont want that for
    dummy elements). The solution is to ignore those elements.
  */
  createElement: function(tag) {
    return {
      innerText: '',
      mock: true
    }
  },

  appendChild: function(widget) {
    if (widget.mock) return false;
  },

  removeChild: function(widget) {
    if (widget.mock) return false;
  },

  getAttribute: function(name) {
    return this.attributes[name]
  },

  setAttribute: function(name, value) {
    return this.attributes[name] = value;
  },
    
  getElementsByTagName: function() {
     return parent.childNodes;
  }
}

Slow.Node = function() {
  this.nodeType = 1;
  this.parentNode = this.nextSibling = this.previousSibling = null;
  this.nodeName = this.tagName = 'div';
  this.childNodes = [];
  this.appendChild =  this.removeChild = function(){};
}

var doc = new Slow.Document(document.body);
var parent = new Slow.Node();
for (var i = 0; i < 10; i++) {
  var child = new Slow.Node;
  parent.childNodes.push(child);
}