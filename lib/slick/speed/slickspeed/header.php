<h1><span>SlickSpeed</span></h1>

<form action="./index.php" method="post" style="float: right">
<p>
	<input type="submit" style="display: none;" />
	<sup style="color: red">NEW!</sup>
	Check
	<select name="css" onchange="this.form.submit();" title="Choose between common and rare selectors. Be aware that not all will work on the template document (0 results).">
<?php	foreach($css_list as $key => $value): ?>
		<option value="<?= $key ?>"<?= ($key == $css) ? ' selected="selected"' : '' ?>><?= $value ?></option>
<?php	endforeach; ?>
	</select>
	selector list against
	<select name="special" onchange="this.form.submit();" title="Many browser engines only run on document, these tests reveal the pure JavaScipt part of selector engines.">
<?php	foreach($special_list as $key => $value): ?>
		<option value="<?= $key ?>"<?= ($key == $special) ? ' selected="selected"' : '' ?>><?= $value ?></option>
<?php	endforeach; ?>
	</select>
	case
	<small>(<a href="<?= $link ?>">Refresh/Copy Link</a>)</small>
</p>
</form>

<h2>speed/validity selectors test for frameworks.</h2>
<p>
	Every framework runs in his own iFrame, thus no conflicts can happen. Tests are run selector by selector, with an interval to prevent the browser from freeezing.
	Tests are run in a neutral environment (against a local copy of <a href="http://www.w3.org/TR/2001/CR-css3-selectors-20011113/">this document</a>), no library or framework is included in the main javascript test, to avoid favoritism.
</p>