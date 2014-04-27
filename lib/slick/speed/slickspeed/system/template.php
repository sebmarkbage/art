<?php
	$template = ($_GET['css'] == 'yahoo') ? '../template.yahoo.html' : '../template.html';
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" debug="true">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	
<?php
		$time = time();
		$includes = $_GET['include'];
		if (is_string($includes)) $includes = array($includes);
		foreach ($includes as $include):
		?>
		
	<script type="text/javascript" src="../../frameworks/<?php echo $include . '?' . $time; ?>"></script>

<?php	endforeach; ?>
	
	<script type="text/javascript">

		var get_length = function(elements){
			return (typeof elements.length == 'function') ? elements.length() : elements.length;
		}

		var context = document;

<?php	if ($_GET['special'] == 'loose'): ?>

		window.onload = function() {
			// all selectors engines fail on a fragment, therefore an element
			context = document.createElement('div');
			context.innerHTML = document.body.innerHTML; // I feel dirty!
			document.body.innerHTML = '';
		};

<?php	elseif ($_GET['special'] == 'xml'): ?>

		// from http://www.webreference.com/programming/javascript/definitive2/
		var newDocument = function(rootTagName, namespaceURL) {
		  if (!rootTagName) rootTagName = "";
		  if (!namespaceURL) namespaceURL = "";
		  if (document.implementation && document.implementation.createDocument) {
		    // This is the W3C standard way to do it
		    return document.implementation.createDocument(namespaceURL, rootTagName, null);
		  }
		  else { // This is the IE way to do it
		    // Create an empty document as an ActiveX object
		    // If there is no root element, this is all we have to do
		    var doc = new ActiveXObject("MSXML2.DOMDocument");
		    // If there is a root tag, initialize the document
		    if (rootTagName) {
		      // Look for a namespace prefix
		      var prefix = "";
		      var tagname = rootTagName;
		      var p = rootTagName.indexOf(':');
		      if (p != -1) {
		        prefix = rootTagName.substring(0, p);
		        tagname = rootTagName.substring(p+1);
		      }
		      // If we have a namespace, we must have a namespace prefix
		      // If we don't have a namespace, we discard any prefix
		      if (namespaceURL) {
		        if (!prefix) prefix = "a0"; // What Firefox uses
		      }
		      else prefix = "";
		      // Create the root element (with optional namespace) as a
		      // string of text
		      var text = "<" + (prefix?(prefix+":"):"") +  tagname +
		          (namespaceURL
		           ?(" xmlns:" + prefix + '="' + namespaceURL +'"')
		           :"") +
		          "/>";
		      // And parse that text into the empty document
		      doc.loadXML(text);
		    }
		    return doc;
		  }
		};


		window.onload = function() {
			context = newDocument('digi:root', 'http://digitarald.com/'); // I feel dirty!

			try {
				for (var i = 0, child; (child = document.body.childNodes[i]); i++) {
					context.firstChild.appendChild(context.importNode(child, true));
					child.parentNode.removeChild(child);
				}
			} catch(e) {
				alert('IE Can`t Touch This!');
			};


			// document.body.innerHTML = '';
		};
<?php	endif; ?>


		function test(selector){
			try {
				var times = [];
				var i = 0;

<?php	if (isset($_GET['initialize'])): ?>
				<?= $_GET['initialize'] ?>(selector);
<?php	endif; ?>

<?php	if (strpos($_GET['function'], '%') === false):
				$_GET['function'] = $_GET['function'] . '(%1$s, %2$s)';
			endif; ?>
			
				var once = function() {
					return <?php echo sprintf($_GET['function'], 'selector', 'context') ?>;
				}
				var elements = once();
				var start = (new Date()).getTime(), distance = 0, comps = 0, elements;
				
				do {
					comps++;
					once();
				} while (!(
					comps > 100
					&&
					(distance = (new Date()).getTime() - start) > 250
				));
				
				var end = new Date();
				var data = { time:0, found:get_length(elements) };

				data.ops = comps / 100;

				return data;
			} catch(err){
				if (elements == undefined) elements = {length: -1};
				return ({'time': ((new Date().getTime() - start) / (i||1)) || 0, 'found': get_length(elements), 'error': (err.fileName || '?.js').replace(/^.*(\/[^\/]+)$/, '$1') + '#' + err.lineNumber + ': ' + err.message});
			}

		};

		test.name = "<?php echo $_GET['include']; ?>";

	</script>

</head>

<body>

	<?php include($template);?>

</body>
</html>
