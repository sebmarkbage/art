------

ART.Group {#ART-Group}
======================

ART.Group is used to combine shapes or other groups into hierarchies that can be
transformed as a set.

ART.Group implements [ART.Transform][] as a mixin which means it has all transform
methods available for moving, scaling and rotating a shape.

ART.Group method: constructor
-----------------------------

Creates a new group.

### Syntax:

	var group = new ART.Group([width, height]);

### Arguments:

1. width - (*number*, optional) The width of the shape in pixels.
2. height - (*number*, optional) The height of the shape in pixels.

The size is optional and defines a content box which can be scaled to fit a new
size using the [resizeTo method](ART.Transform#ART-Transform:resizeTo).

ART.Group method: inject {#ART-Group:inject}
--------------------------------------------

Injects a group into another group or [ART][] surface instance.

This group is rendered in front of any existing content in the container.

### Syntax:

	group.inject(container);

### Arguments:

1. container - (*mixed*) an [ART][] surface instance or another ART.Group

### Returns:

* The ART.Group instance itself

### Example:

	var art = new ART(500, 500);
	var group = new ART.Group().inject(art);

ART.Group method: grab {#ART-Group:grab}
----------------------------------------

Grabs one or more groups or [ART.Shape][] instances and injects them into this group's
content. The child instances are ejected from their current container.

The new children are rendered in front of any current group content.

### Syntax:

	group.grab(child[, child[, ...]]);

### Arguments:

1. child - (*mixed*) a shape, text or another group instance

### Returns:

* The ART.Group instance itself

### Example:

	var art = new ART(500, 500);
	var rectangle = new ART.Rectangle(400, 200).fill('black');
	var circle = new ART.Ellipse(200).fill('red');
	var group = new ART.Group()
		.grab(rectangle, circle)
		.inject(art);

ART.Group method: eject {#ART-Group:eject}
------------------------------------------

Removes the group from it's current container. Leaving it free to be garbage collected
or injected somewhere else.

### Syntax:

	group.eject();

### Returns:

* The ART.Group instance itself

### Example:

	var art = new ART(500, 500);
	var group = new ART.Group().inject(art);
	var square = new ART.Rectangle(200).fill('black').inject(group);
	art.subscribe('click', function(){
		group.eject();
	});


[ART]: ../ART/ART
[ART.Transform]: ../ART/ART.Transform
[ART.Shape]: ../ART/ART.Shape