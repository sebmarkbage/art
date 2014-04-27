<?php

// Report all errors during development
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Custom error handler, to throw nice-looking error exceptions
function errorHandler($errno, $errstr, $errfile, $errline, $errcontext)
{
	$report = error_reporting();
	if ($report && $report & $errno) {
	  throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
	}
}
set_error_handler('errorHandler');

if (isset($_GET['system'])){
	include($_GET['system'] . '/index.php');
} else {
	?>
	<html>
		<head>
			<meta http-equiv="Content-type" content="text/html; charset=utf-8">
			<title>(Slick|Slacker)speed</title>
		</head>
		<body>
			<ul>
				<li><a title="Slickspeed" href="?system=system">Slickspeed</a></li>
				<li><a title="Slackerspeed" href="?system=system_slackerspeed">Slackerspeed</a></li>
			</ul>
		</body>
	</html>
	<?
}
?>

