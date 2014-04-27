------

ART.Shapes
==========

ART.Shapes defines common used Shapes that extend [ART.Shape][].

ART.Rectangle {#ART-Rectangle}
==============================

Creates an rectangular shape.

### Extends:

- [ART.Shape][]

ART.Rectangle method: constructor
---------------------------------

### Syntax:

	var myRectangle = new ART.Rectangle(width, height[, radius]);

### Arguments:

1. width - (*number*) The width of the rectangle in pixels
2. height - (*number*) The height of the rectangle in pixels
3. radius - (*number*, optional) A border radius


ART.Pill {#ART-Pill}
====================

Creates a pill shape where the smaller side is entirely rounded.

### Extends:

- [ART.Rectangle][]

ART.Pill method: constructor
----------------------------

### Syntax:

	var myRectangle = new ART.Pill(width, height);

### Arguments:

1. width - (*number*) The width of the rectangle in pixels
2. height - (*number*) The height of the rectangle in pixels



ART.Ellipse
===========


ART.Wedge
=========



[ART.Shape]: ../ART/ART.Shape
[ART.Rectangle]: #ART-Rectangle

