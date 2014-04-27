------

ART.Transform {#ART-Transform}
==============================

ART.Transform lets you manipulate ART objects by moving, scaling and rotating them.

You can also use a custom [homogeneous transformation matrix][] to create advanced transforms.

[ART.Shape][] implements ART.Transform as a mixin which means it has all ART.Transform methods
available.

This documentation refers to the "origin". This refers to the 0,0 coordinate in a shape
or group. Often the top left corner.

ART.Transform method: constructor
---------------------------------

Typically you won't use this constructor yourself. Instead, you'll use the methods as they're
implemented on shapes or groups.

### Syntax:

	var transform = new ART.Transform([xx, yx, xy, yy[, x, y]]);

### Arguments:

1. xx - (*number*) multiplier to scale the x axis (default: 1)
2. yx - (*number*) multiplier to skew the x axis (default: 0)
3. xy - (*number*) multiplier to skew the y axis (default: 0)
4. yy - (*number*) multiplier to scale y scale (default: 1)
5. x - (*number*) number of units to move in the horizontal direction (default: 0)
6. y - (*number*) number of units to move in the vertical direction (default: 0)

The arguments correspond to the following [homogeneous transformation matrix][]:

	xx  xy  x
	yx  yy  y
	0   0   1

The default transformation is the [identity matrix]:

	1 0 0
	0 1 0
	0 0 1

### Alternative Syntax:

	var transform = new ART.Transform(transform);

### Arguments:

1. transform - (*ART.Transform*) an existing transform to clone.


ART.Transform method: transform {#ART-Transform:transform}
----------------------------------------------------------

Modifies the current transform by multiplying the current values with some new values.
This method can be used to create complex transformations. Typically you won't use this method
yourself but rather one of the other convenient methods.

Note: The order of which multiplied transforms are applied is significant.

### Syntax:

	instance.transform(xx, yx, xy, yy[, x, y]);

### Arguments:

1. xx - (*number*) multiplier to scale the x axis (default: 1)
2. yx - (*number*) multiplier to skew the x axis (default: 0)
3. xy - (*number*) multiplier to skew the y axis (default: 0)
4. yy - (*number*) multiplier to scale y scale (default: 1)
5. x - (*number*) number of units to move in the horizontal direction (default: 0)
6. y - (*number*) number of units to move in the vertical direction (default: 0)

The arguments correspond to the following [matrix multiplication][]:

	  result       current      arguments
	xx  xy  x     xx  xy  x     xx  xy  x
	yx  yy  y  =  yx  yy  y  *  yx  yy  y
	0   0   1     0   0   1     0   0   1

### Alternative Syntax:

	instance.transform(transform);

### Arguments:

1. transform - (*ART.Transform*) an existing transform object.

### Returns:

* The current ART.Transform instance or shape


ART.Transform method: transformTo {#ART-Transform:transformTo}
--------------------------------------------------------------

Resets the transform to some new values. This method has the same arguments as the constructor.

This is typically used to reset the transform of a shape to some absolute value.

### Syntax:

	instance.transformTo([xx, yx, xy, yy[, x, y]]);
	instance.transformTo([transform]);

ART.Transform method: move {#ART-Transform:move}
------------------------------------------------

Moves the origin x/y units in the horizontal/vertical direction.

### Syntax:

	transform.move(x, y);

### Arguments:

1. x - (*number*) The number of units to move in the horizontal direction.
2. y - (*number*) The number of units to move in the vertical direction.

### Returns:

* The current ART.Transform instance or shape

ART.Transform method: moveTo {#ART-Transform:moveTo}
----------------------------------------------------

Moves the origin to an absolute point.

### Syntax:

	transform.moveTo(x, y);

### Arguments:

1. x - (*number*) The position within it's parent along the horizontal axis.
2. y - (*number*) The position within it's parent along the vertical axis.

### Returns:

* The current ART.Transform instance or shape


[ART.Shape]: ART.Shape
[homogeneous transformation matrix]:  http://en.wikipedia.org/wiki/Transformation_matrix
[identity matrix]: http://en.wikipedia.org/wiki/Identity_matrix
[matrix multiplication]: http://en.wikipedia.org/wiki/Matrix_multiplication