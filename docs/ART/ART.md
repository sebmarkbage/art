------

ART {#ART}
==========

ART creates a new surface to draw on.

ART method: constructor
-----------------------

Creates a new surface.

### Syntax:

	var art = new ART([width, height]);

### Arguments:

1. width - (*number*, optional) The width of the element in pixels
2. height - (*number*, optional) The height of the element in pixels

### Example:

	var art = new ART(300, 400);
	// Inject it in our page using MooTools
	$('myElement').adopt(art);


ART method: resize {#ART:resize}
--------------------------------

Resizes the surface to a new width and height. The surface content is cropped, not scaled.

### Syntax:

	art.resize(width, height);

### Arguments:

1. width - (*number*) The width of the element in pixels
2. height - (*number*) The height of the element in pixels

ART method: inject {#ART:inject}
--------------------------------------------

Injects the surface into the bottom a DOM element.

### Syntax:

	art.inject(container);

### Arguments:

1. container - (*Element*) a parent DOM element. E.g. document.body

### Returns:

* The ART instance itself

### Example:

	var art = new ART(500, 500).inject(document.body);

ART method: eject {#ART:eject}
------------------------------

Removes the surface from the DOM container. Leaving it free to be garbage collected
or injected somewhere else.

### Syntax:

	art.eject();

### Returns:

* The ART instance itself

### Example:

	var art = new ART(500, 500).inject(document.body);
	art.subscribe('click', function(){
		art.eject();
	});

ART method: grab {#ART:grab}
----------------------------

Grabs one or more [ART.Group][] or [ART.Shape][] instances and injects them into this surface's
content. The child instances are ejected from their previous container.

The new children are rendered in front of any existing content.

### Syntax:

	art.grab(child[, child[, ...]]);

### Arguments:

1. child - (*mixed*) a shape, text or group instance

### Returns:

* The ART instance itself

### Example:

	var art = new ART(500, 500);
	var rectangle = new ART.Rectangle(400, 200).fill('black');
	var circle = new ART.Ellipse(200).fill('red');
	var group = new ART.Group()
		.grab(rectangle, circle)
		.inject(art);

[ART.Group]: ART.Group
[ART.Shape]: ART.Shape