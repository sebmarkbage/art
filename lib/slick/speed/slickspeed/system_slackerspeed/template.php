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
	
<?php
		if (strpos($_GET['function'], '%') === false):
			$_GET['function'] = $_GET['function'] . '(%1$s, %2$s)';
		endif;
?>	

	<script type="text/javascript">
		
		var context = document;
		
		var get_length = function(elements){
			return (typeof elements.length == 'function') ? elements.length() : elements.length;
		}
		
		function test(selector){
			try {
				var start = new Date().getTime();
				var elements = <?php echo sprintf($_GET['function'], 'selector', 'context') ?>;
				var end = new Date().getTime() - start;
				return {'time': Math.round(end), 'found': get_length(elements)};
			} catch(err){
				if (elements == undefined) elements = {length: -1};
				return ({'time': new Date().getTime() - start, 'found': get_length(elements), 'error': err});
			}
		}
	
	</script>
	
</head>

<body>
	
	<?php include('../template.html');?>

</body>
</html>