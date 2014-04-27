<?php
	$frameworks = parse_ini_file('config.ini', true);

	$valid = true;

	$special_list = array('' => 'Default', 'loose' => 'Loose DOM Fragment', 'xml' => 'XML Document');

	$special = '';
	if (isset($_REQUEST['special'])) {
		if (array_key_exists($_REQUEST['special'], $special_list)) {
			$special = $_REQUEST['special'];
		} else {
			$valid = false;
		}
	}

	$css_list = array('' => 'Default', 'simple' => 'Simple', 'extended' => 'Extended', 'yahoo' => 'Yahoo (via ejohn)', 'crazy' => 'Just crazy');

	$css = '';
	if (isset($_REQUEST['css'])) {
		if (array_key_exists($_REQUEST['css'], $css_list)) {
			$css = $_REQUEST['css'];
		} else {
			$valid = false;
		}
	}

	if (!$valid) {
		header('Location: ' . $_SERVER['SCRIPT_NAME']);
		exit;
	}

	$link = $_SERVER['SCRIPT_NAME'];

	if (!$valid) {
		header('Location: ' . $link);
		exit;
	}

	if ($css || $special) {
		$build = array();
		if ($css) $build['css'] = $css;
		if ($special) $build['special'] = $special;
		$link = $link . '?' . http_build_query($build, '', '&');
	}

	if (count($_POST)) {
		header('Location: ' . $link);
		exit;
	}

	$file = 'selectors.list.css';
	if ($css) $file = 'selectors.list.' . $css . '.css';

	$selectors = file_get_contents($file);

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>SlickSpeed Selectors Test</title>
	<link rel="stylesheet" href="style.css" type="text/css" media="screen">

	<script type="text/javascript">
		<?php
		$selectors = explode("\n", $selectors);
		foreach ($selectors as $i => $selector) $list[$i] = "'".str_replace("'","\'",$selector)."'";
		$list = implode(',', $list);
		echo "window.selectors = [$list]";
		?>
	</script>

	<script src="system/slickspeed.js" type="text/javascript"></script>
</head>

<body>

<div id="container">

	<div id="controls">
		<a class="stop" href="#">stop tests</a>
		<a class="start" href="#">start tests</a>
	</div>

<?php include('header.php'); ?>

<?php

	foreach ($frameworks as $framework => $properties){
		$time = time();
		
		$query = http_build_query(array(
			'include' => $properties['file'],
			'function' => $properties['function'],
			'initialize' => isset($properties['initialize']) ? $properties['initialize'] : '',
			'special' => $special,
			'css' => $css,
			'nocache' => $time
		), '', '&amp;');

		echo '<iframe name="' . $framework . '" src="system/template.php?' . $query . '"></iframe>';
	}
?>

<table>

	<thead id="thead">
		<tr>
			<th class="selectors-title">selectors</th>
			<?php
				foreach ($frameworks as $framework => $properties){
					echo "<th class='framework'>$framework</th>";
				}
			?>
		</tr>
	</thead>

	<tbody id="tbody">
		<?php
			foreach ($selectors as $selector){
				echo "<tr>";
				$selector = str_replace('%', '', $selector);
				echo "<th class='selector'>$selector</th>";
				foreach ($frameworks as $framework){
					echo "<td class='empty'></td>";
				}
				echo "</tr>";
			}
		?>
	</tbody>

	<tfoot id="tfoot">
		<tr>
		<th class="score-title"><strong>final ops/ms (more is better)</strong></th>
		<?php
			foreach ($frameworks as $framework){
				echo "<td class='score'>0</td>";
			}
		?>
		</tr>
	</tfoot>

</table>

<h2>Legend</h2>

<table id="legend">

	<tr>
		<th>the faster</th>
		<th>the slower</th>
		<th>exception thrown or zero elements found</th>
		<th>different returned elements</th>
	</tr>

	<tr>
		<td class="good"></td>
		<td class="bad"></td>
		<td class="exception"></td>
		<td class="mismatch"></td>
	</tr>

</table>

<?php include('footer.html'); ?>
</div>

</body>
</html>