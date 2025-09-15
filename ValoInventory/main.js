const allData = [];                 // An array for holding all inventory data.
const categories = new Set();       // A Set for holding the categories in the inventory data.
const locations = new Set();        // A Set for holding the locations in the inventory data.

/*
    Adds event listeners to all the buttons and input elements on the main page.
    Should be called when the page is finished loading.
*/
function main() {
    document.getElementById("browse-button").addEventListener("click", browseMode);
    document.getElementById("add-button").addEventListener("click", addMode);
    document.getElementById("submit-button").addEventListener("click", submit);
    document.getElementById("reset-button").addEventListener("click", reset);
    document.getElementById("category").addEventListener("change", categoryChange);
    document.getElementById("location").addEventListener("change", locationChange);
    document.getElementById("textsearch").addEventListener("change", printData);
    document.getElementById("categorysearch").addEventListener("change", printData);
    document.getElementById("locationsearch").addEventListener("change", printData);
    document.getElementById("textsearch").addEventListener("keypress", (e)=>{
        if (e.key === "Enter") {
            printData();
        }
    });
    browseMode();
}

/*
    Sends the data to the server using fetch and the POST method.
    The data sent is a FormData object with the following properties:
    description, quantity, category, location, newcategory, newlocation and date.
    Properties newcategory and newlocation should be used only if
    the respective properties category and location are set to "new".
    The data can be accessed with PHP like this: $_POST["date"] etc.
    Expects a string "success" as result.
    The date information is currently a little messed up.
    Also the file name needs to be updated.
*/
async function submit() {
	if (validate()) {
        /* old version
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
                fetchAll(false);
                reset(false);
            } else {
                document.getElementById("test").innerText = "Not sure what happened!"
            }
        } catch (e) {
            error("Error: " + e.message);
        }
        */
	if (validate()) {
		const date = new Date();
        let item = document.getElementById("description").value;
        let quantity = document.getElementById("quantity").value;
        let category = document.getElementById("category").value;
        if (category == "new") {
            category = document.getElementById("newcategory").value;
        }
        let location = document.getElementById("location").value;
        if (location == "new") {
            location = document.getElementById("newlocation").value;
        }
        try {
            saveData(date.toDateString(), item, quantity, category, location);
            fetchAll(false);
            reset(false);
        } catch (e) {
            error("Error: " + e.message);
        }
    }

    }
}

/*
    Loads the inventory data into the allData array.
    Also updates the categories and locations Sets and
    the respective drop-down boxes.
    If the parameter print is set to true,
    calls the function for printing the inventory data.
*/
async function fetchAll(print = true) {
    try {
        const data = await getData()
        allData.length = 0;
        for (let i = 0; i < data.length; i++) {
            allData.push(data[i]);
            categories.add(data[i][3]);
            locations.add(data[i][4]);
        }
        let select1 = document.getElementById("category");
        let select2 = document.getElementById("categorysearch");
        while (select1.childElementCount > 2) {
            select1.removeChild(select1.children[1])
        }
        while (select2.childElementCount > 1) {
            select2.removeChild(select2.children[1])
        }
        for (const x of categories) {
            let newOption = document.createElement("OPTION");
            newOption.setAttribute("value", x);
            newOption.innerText = x;
            select1.children[0].after(newOption);
            select2.children[0].after(newOption.cloneNode(true));
        }
        select1 = document.getElementById("location");
        select2 = document.getElementById("locationsearch");
        while (select1.childElementCount > 2) {
            select1.removeChild(select1.children[1])
        }
        while (select2.childElementCount > 1) {
            select2.removeChild(select2.children[1])
        }
        for (const x of locations) {
            let newOption = document.createElement("OPTION");
            newOption.setAttribute("value", x);
            newOption.innerText = x;
            select1.children[0].after(newOption);
            select2.children[0].after(newOption.cloneNode(true));
        }
        if (print) {
            printData();
        }
    } catch (e) {
        error("Error: " + e.message);
    }
}

/*
    Displays the inventory data in a table form
    Ordering is not currently implemented.
*/

function printData() {
    let table = document.getElementById("data");
    while (table.childElementCount > 1) {
        table.removeChild(table.children[1]);
    }
    for (let i = 0; i < allData.length; i++) {
        let row = document.createElement("TR");
        let item = document.createElement("TD");
        let quantity = document.createElement("TD");
        let category = document.createElement("TD");
        let location = document.createElement("TD");
        let time = document.createElement("TD");
        let del = document.createElement("TD");
        item.innerText = allData[i][1];
        quantity.innerText = allData[i][2];
        category.innerText = allData[i][3];
        location.innerText = allData[i][4];
        time.innerText = allData[i][0];
        row.append(item, quantity, category, location, time, del);
        let itemMatch = true;
        let categoryMatch = true;
        let locationMatch = true;
        let searchString = document.getElementById("textsearch").value.trim();
        while (searchString.includes("  ")) {
            searchString = searchString.replace("  ", " ");
        }
        const searchArray = searchString.split(" ");
        for (let i = 0; i < searchArray.length; i++) {
            if (!item.innerText.toLowerCase().includes(searchArray[i].toLowerCase())) {
                itemMatch = false;
            }
        }
        if (document.getElementById("categorysearch").value != "all") {
            if (document.getElementById("categorysearch").value != category.innerText) {
                categoryMatch = false;
            }
        }
        if (document.getElementById("locationsearch").value != "all") {
            if (document.getElementById("locationsearch").value != location.innerText) {
                locationMatch = false;
            }
        }
        if (itemMatch && categoryMatch && locationMatch) {
            table.appendChild(row);
        }
    }
}

/*
    Switches the UI to display the browsing mode.
    Clears the search panel.
*/
function browseMode() {
    error("");
    document.getElementById("add-div").style.display = "none";
    document.getElementById("add-button").style.display = "block";
    document.getElementById("browse-div").style.display = "block";
    document.getElementById("browse-button").style.display = "none";
    document.getElementById("textsearch").value = "";
    document.getElementById("categorysearch").value = "all";
    document.getElementById("locationsearch").value = "all";
    fetchAll();
}
/*
async function browseMode() {
    error("");
    document.getElementById("add-div").style.display = "none";
    document.getElementById("browse-div").style.display = "block";
    //More stuff to be added here.
    //writeDataToTestDiv()
    //document.getElementById("test").innerText = await getData()
    const data = await getData()
    for (i in data) {
        document.getElementById("test").innerText += "Date: " + data[i][0] +
            " Description: " + data[i][1] + " Quantity: " + data[i][2] + 
            " Category: " + data[i][3] + " Location: " + data[i][4] + "\n"
    }
}
*/

/*
    Switches the UI to display the form for adding new items to the inventory.
    Also resets the form.
*/
function addMode() {
    error("");
    reset(true);
    document.getElementById("add-div").style.display = "block";
    document.getElementById("add-button").style.display = "none";
    document.getElementById("browse-div").style.display = "none";
    document.getElementById("browse-button").style.display = "block";
}

/*
    Resets the the input form.
    If the parameter full is false, only the item description and quantity are reset.
*/
function reset(full = true) {
    if (full) {
        document.getElementById("location").value = "none";
        document.getElementById("category").value = "none";
        document.getElementById("newcategory").style.display = "none";
        document.getElementById("newlocation").style.display = "none";
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
    } else if (document.getElementById("category").value == "new" &&
            document.getElementById("newcategory").value == "") {
        error("Please enter a category<br>", true);
        valid = false;
    }
    if (document.getElementById("location").value == "none") {
        error("Please select a location<br>", true);
        valid = false;
    } else if (document.getElementById("location").value == "new" &&
            document.getElementById("newlocation").value == "") {
        error("Please enter a location<br>", true);
        valid = false;
}
    return valid;
    //Maybe add regex somewhere
}

/*
    Hides or displays the input for new category.
    Should be called when the user changes the category when adding new items.
*/
function categoryChange() {
    if (document.getElementById("category").value == "new") {
        document.getElementById("newcategory").style.display = "block";
    } else {
        document.getElementById("newcategory").value = "";
        document.getElementById("newcategory").style.display = "none";
    }
}

/*
    Hides or displays the input for new location.
    Should be called when the user changes the location when adding new items.
*/
function locationChange() {
    if (document.getElementById("location").value == "new") {
        document.getElementById("newlocation").style.display = "block";
    } else {
        document.getElementById("newlocation").value = "";
        document.getElementById("newlocation").style.display = "none";
    }
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

const testData = [[1, "Pallohiiri", 1, "Hiiret", "Hylly 1" , new Date()],
                [2, "Optinen hiiri", 1, "Hiiret", "Hylly 1" , new Date()],
                [3, "Pussillinen hiiriä", 10, "Hiiret", "Hylly 1" , new Date()],
                [4, "USB-näppäimistö", 1, "Näppäimistöt", "Hylly 1" , new Date()],
                [5, "Näppäimistö", 2, "Näppäimistöt", "Hylly 2" , new Date()],
                [6, "USB-näppäimistö", 1, "Näppäimistöt", "Hylly 2" , new Date()],
                [7, "RAM-muisti", 5, "RAM", "Hylly 1" , new Date()],
                [8, "Kovalevy 500 GB", 2, "Tallennustilat", "Luola" , new Date()],
                [9, "Kovalevy 1 TB", 3, "Tallennustilat", "Luola" , new Date()],
                [10, "SSD 500 GB", 2, "Tallennustilat", "Hylly 2" , new Date()]]
