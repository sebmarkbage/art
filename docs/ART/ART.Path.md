------

ART.Path {#ART-Path}
====================

ART.Path lets you create and manipulate arbitrary paths which you could draw using [ART.Shape][].

You can also use paths to place objects at various points along a path.

You create a path by issues one or more commands which moves a pointer and draw lines from the
previous position.

A move command can be used to move the pointer without drawing a line. This effectively creates
several sub-paths within a path.

ART.Path method: constructor
----------------------------

### Syntax:

	var path = new ART.Path([path]);

### Arguments:

1. path - (*mixed*, optional) An already existing path. The following options are possible:
	- *ART.Path* - If path is already an instance of ART.Path, it will copy the path.
	- *string* - A SVG path that will be parsed by ART.Path

ART.Path method: move {#ART-Path:move}
--------------------------------------

Moves the pointer relatively to the last point without drawing a line.

### Syntax:

	path.move(x, y);

### Arguments:

1. x - (*number*) The amount of pixels in horizontal direction.
2. y - (*number*) The amount of pixels in vertical direction.

### Returns:

* This ART.Path instance


ART.Path method: moveTo {#ART-Path:moveTo}
------------------------------------------

Moves the pointer to an absolute point without drawing a line.

### Syntax:

	path.moveTo(x, y);

### Arguments:

1. x - (*number*) The position in horizontal direction.
2. y - (*number*) The position in vertical direction.

### Returns:

* This ART.Path instance


ART.Path method: line {#ART-Path:line}
--------------------------------------

Draws a line relatively from the last point.

### Syntax:

	path.line(x, y);

### Arguments:

1. x - (*number*) The amount of pixels in horizontal direction.
2. y - (*number*) The amount of pixels in vertical direction.

### Returns:

* This ART.Path instance


ART.Path method: lineTo {#ART-Path:lineTo}
------------------------------------------

Draws a line to an absolute point from the last point.

### Syntax:

	path.lineTo(x, y);

### Arguments:

1. x - (*number*) The position in horizontal direction.
2. y - (*number*) The position in vertical direction.

### Returns:

* This ART.Path instance


ART.Path method: curve {#ART-Path:curve}
----------------------------------------

// write me


ART.Path method: curveTo {#ART-Path:curveTo}
--------------------------------------------

// write me


ART.Path method: arc {#ART-Path:arc}
------------------------------------

// write me


ART.Path method: arcTo {#ART-Path:arcTo}
----------------------------------------

// write me


ART.Path method: counterArc {#ART-Path:counterArc}
--------------------------------------------------

Same as [arc](#ART-Path:arc) but the line is drawn counter-clockwise.


ART.Path method: counterArcTo {#ART-Path:counterArcTo}
------------------------------------------------------

Same as [arcTo](#ART-Path:arcTo) but the line is drawn counter-clockwise.


ART.Path method: close {#ART-Path:close}
----------------------------------------

Draws a line to the first point in the current sub-path and begins a new sub-path.

### Syntax:

	path.close();

### Returns:

* This ART.Path instance


ART.Path method: reset {#ART-Path:reset}
--------------------------------------

Resets the current path to a blank path.

### Syntax:

	path.reset();

### Returns:

* This ART.Path instance, now empty


[ART.Shape]: /ART.Shape
