/*
    Adds event listeners to all the buttons on the main page.
    Should be called when the page is finished loading.
*/
function main() {
    document.getElementById("browse-button").addEventListener("click", browseMode);
    document.getElementById("add-button").addEventListener("click", addMode);
    document.getElementById("submit-button").addEventListener("click", submit);
    document.getElementById("reset-button").addEventListener("click", reset);
}

/*
    Sends the data to the server using fetch and the POST method.
    The data sent is a FormData object with the following properties:
    description, quantity, category, location and date.
    The data can be accessed with PHP like this: $_POST["date"] etc.
    Expects a string "success" as result.
    The date information is currently a little messed up.
    Also the file name needs to be updated.
*/
async function submit() {
	if (validate()) {
		const form = document.getElementById("form");
		const data = new FormData(form);
		const date = new Date();
		data.set("time", date.toLocaleString("en-GB", {
            timeZone: "UTC",
            timeZoneName: "short"
        }));                    // Probably the wrong time zone and format
        try {
            const response = await fetch("placeholder.php", {      //Change filename here
                method: "POST",
                body: data
            })
            const result = await response.text();
            if (result == "success") {
                document.getElementById("test").innerText = "Data added successfully!"
                reset(false);
            } else {
                document.getElementById("test").innerText = "Not sure what happened!"
            }
        } catch (e) {
            error("Error: " + e.message);
        }
    }
}

/*
    Switches the UI to display the browsing mode.
    Note that browsing is not currently implemented.
*/
function browseMode() {
    error("");
    document.getElementById("add-div").style.display = "none";
    document.getElementById("browse-div").style.display = "block";
    //More stuff to be added here.
}

/*
    Switches the UI to display the form for adding new items to the inventory.
    Also resets the form.
*/
function addMode() {
    error("");
    reset(true);
    document.getElementById("add-div").style.display = "block";
    document.getElementById("browse-div").style.display = "none";
}

/*
    Resets the the input form.
    If the parameter full is false, only the item description and quantity are reset.
*/
function reset(full = true) {
    if (full) {
        document.getElementById("location").value = "none";
        document.getElementById("category").value = "none";
    }
    document.getElementById("quantity").value = "1";
    document.getElementById("description").value="";
}

/*
    Checks to see if the form is properly filled.
    Gives the user error messages if needed.
    Returns true if everything is in order and false otherwise.
    Doesn't contain any regex for the item description.
*/
function validate() {
    error("");
    let valid = true;
    if (document.getElementById("description").value == "") {
        error("Please enter item description<br>", true);
        valid = false;
    }
    if (Number(document.getElementById("quantity").value) <= 0) {
        error("Please enter a positive quantity<br>", true);
        valid = false;
    }
    if (document.getElementById("category").value == "none") {
        error("Please select a category<br>", true);
        valid = false;
    }
    if (document.getElementById("location").value == "none") {
        error("Please select a location<br>", true);
        valid = false;
    }
    return valid;
    //Maybe add regex somewhere
}

/*
    Prints errors for the user to see.
    If the parameter add is true, the parameter text is added to the end of the existing error message.
    Otherwise the current error message is replaced with the parameter text.
*/
function error(text, add = false) {
    const error = document.getElementById("error");
    if (add) {
        error.innerHTML += text
    } else {
        error.innerHTML = text
    }
}

/*
    Used for testing only.
*/
function testi(text, add = false) {
    const testi = document.getElementById("test");
    if (add) {
        testi.innerHTML += text
    } else {
        testi.innerHTML = text
    }
}
