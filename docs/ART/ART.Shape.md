------

ART.Shape {#ART-Shape}
======================

ART.Shape is used to draw arbitrary vector shapes from an [ART.Path][].

ART.Shape implements [ART.Transform][] as a mixin which means it has all transform
methods available for moving, scaling and rotating a shape.

[ART.Shapes][] provides shortcuts to common shapes. These inherit from
ART.Shape so each shape gets all common ART.Shape methods.

ART.Shape method: constructor
-----------------------------

Creates a new shape.

### Syntax:

	var shape = new ART.Shape([path, width, height]);

### Arguments:

1. path - (*ART.Path*, optional) An [ART.Path][] instance.
2. width - (*number*, optional) The width of the shape in pixels.
3. height - (*number*, optional) The height of the shape in pixels.

The size is optional but should be specified on symbols. It defines
the surface on which to draw a path. This can be use to scale the
shape to fit a new size using the [resizeTo method](ART.Transform#ART-Transform:resizeTo).

ART.Shape method: draw {#ART-Shape:draw}
----------------------------------------

Draws the provided path on the canvas.

### Syntax:

	shape.draw(path[, width, height]);

### Arguments:

1. path - (*ART.Path*, optional) An [ART.Path][] instance.
2. width - (*number*, optional) The width of the shape in pixels.
3. height - (*number*, optional) The height of the shape in pixels.

### Returns:

* The ART.Shape instance

ART.Shape method: inject {#ART-Shape:inject}
--------------------------------------------

Injects a into a [ART.Group][] or [ART][] instance.

This group is rendered in front of any existing content in the container.

### Syntax:

	shape.inject(container);

### Arguments:

1. container - (*mixed*) an [ART][] instance or another [ART.Shape][]

### Returns:

* The ART.Shape instance

### Example:

	var art = new ART(500, 500);
	var shape = new ART.Rectangle(400, 200).fill('black').inject(art);


ART.Shape method: eject {#ART-Shape:eject}
------------------------------------------

Removes the shape from it's current container. Leaving it free to be garbage collected
or injected somewhere else.

### Syntax:

	shape.eject();

### Returns:

* The ART.Shape instance itself

### Example:

	var art = new ART(500, 500);
	var square = new ART.Rectangle(200).fill('black').inject(group);
	art.subscribe('click', function(){
		square.eject();
	});



// TODO: the other methods

[ART]: ../ART/ART
[ART.Path]: ../ART/ART.Path
[ART.Transform]: ../ART/ART.Transform
[ART.Group]: ../ART/ART.Group
[ART.Shape]: ../ART/ART.Shape
[ART.Shapes]: ../Shapes/ART.Shapes
