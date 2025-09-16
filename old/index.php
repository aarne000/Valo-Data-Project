<!DOCTYPE html>
<html>
	<?php function auto_version($file) {return $file . "?v=" . filemtime($file);} ?>
    <head>
        <title>Valo Inventory</title>
		<link href="<?= auto_version("./style.css") ?>" rel="stylesheet">
		<script src="<?= auto_version("./main.js") ?>"></script>
		<meta charset="UTF-8">
    </head>
    <body onload="main()">
		<div id="main-div">
     	    <h1>Inventory</h1>
            <div id="top-div">
                <button id="browse-button">Browse</button><button id="add-button">Add</button>
            </div>
            <div id="add-div">
                <form id="form" accept-charset="UTF-8" autocomplete="off">
                    <label for="description">Item description:</label><br>
                    <textarea id="description" name="description" rows="5" cols="45"></textarea><br>
                    <label for="quantity">Quantity:</label>
                    <input id="quantity" type="number" name="quantity" value="1" min="1"><br>
                    <label for="category">Category:</label><br>
				    <select id="category" name="category">
                        <option value="none" selected>Select a category</option>
                        <option value="cat1">Cat 1</option>
                        <option value="cat2">Cat 2</option>
				    </select><br>
                    <label for="location">Location:</label><br>
				    <select id="location" name="location">
                        <option value="none" selected>Select a location</option>
                        <option value="cat1">Cat 1</option>
                        <option value="cat2">Cat 2</option>
				    </select><br><br>
                </form>
                <button id="submit-button">Submit</button><button id="reset-button">Reset</button>
            </div>
            <div id="browse-div">
            </div>
            <p id=error></p>
			<p id=test></p>
		</div>
    </body>
</html>