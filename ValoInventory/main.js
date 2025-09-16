const allData = [];                 // An array for holding all inventory data.
const categories = new Set();       // A Set for holding the categories in the inventory data.
const locations = new Set();        // A Set for holding the locations in the inventory data.
let sorting = "date";               // A string to determine the sorting variable.
let ascending = false;              // A boolean to determine how to sort.

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
    let links = document.getElementsByClassName("pseudo-link");
    for(let i = 0; i < links.length; i++) {
        links[i].addEventListener("click", sortingEvent);
    }
    browseMode();
}

/*
    Calls the saveData function with the necessary data from the html form.
    The date information might currently be a little messed up.
*/
async function submit() {
	if (validate()) {
        let newstuff = false;
		const date = new Date();
        let item = document.getElementById("description").value;
        let quantity = document.getElementById("quantity").value;
        let category = document.getElementById("category").value;
        if (category == "new") {
            category = document.getElementById("newcategory").value;
            newstuff = true;
        }
        let location = document.getElementById("location").value;
        if (location == "new") {
            location = document.getElementById("newlocation").value;
            newstuff = true;
        }
        try {
            saveData(date.toDateString(), item, quantity, category, location);
            if (newstuff) {
                fetchAll(false);
            }
            reset(false);
        } catch (e) {
            error("Error: " + e.message);
        }
    }
}

/*
    Loads the inventory data into the allData array.
    Also updates the categories and locations Sets and
    the respective drop-down boxes.
    If the parameter print is set to true,
    calls the functions for sorting and printing the inventory data.
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
            sortData();
            printData();
        }
    } catch (e) {
        error("Error: " + e.message);
    }
}

/*
    Displays the inventory data in a table form
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
    Sets the global sorting variables and
    calls the functions for sorting and printing the data.
    Should be called when the user wants to sort the data.
*/
function sortingEvent(e) {
    switch(e.target.getAttribute("id")) {
        case "name-heading":
            if (sorting == "name") {
                ascending = !ascending;
            } else {
                sorting = "name";
                ascending = true;
            }
            break;
        case "category-heading":
            if (sorting == "category") {
                ascending = !ascending;
            } else {
                sorting = "category";
                ascending = true;
            }
            break;
        case "location-heading":
            if (sorting == "location") {
                ascending = !ascending;
            } else {
                sorting = "location";
                ascending = true;
            }
            break;
        case "date-heading":
            if (sorting == "date") {
                ascending = !ascending;
            } else {
                sorting = "date";
                ascending = true;
            }
    }
    sortData();
    printData();
}

/*
    Sorts the inventory data.
*/
function sortData() {
    switch(sorting) {
        case "date":
            allData.sort(sortByDate);
            break;
        case "name":
            allData.sort(sortByName);
            break;
        case "category":
            allData.sort(sortByCategory);
            break;
        case "location":
            allData.sort(sortByLocation);
    }
}

/*
    Sorts the inventory data by item name.
    Feed this function to the sort() function.
*/
function sortByName(a, b) {
    if (a[1].toLowerCase() === b[1].toLowerCase()) {
        return 0;
    }
    else {
        if (ascending) {
            return (a[1].toLowerCase() < b[1].toLowerCase()) ? -1 : 1;
        } else {
            return (a[1].toLowerCase() > b[1].toLowerCase()) ? -1 : 1;
        }
    }
}

/*
    Sorts the inventory data by category.
    Feed this function to the sort() function.
*/
function sortByCategory(a, b) {
    if (a[3].toLowerCase() === b[3].toLowerCase()) {
        return 0;
    }
    else {
        if (ascending) {
            return (a[3].toLowerCase() < b[3].toLowerCase()) ? -1 : 1;
        } else {
            return (a[3].toLowerCase() > b[3].toLowerCase()) ? -1 : 1;
        }
    }
}

/*
    Sorts the inventory data by location.
    Feed this function to the sort() function.
*/
function sortByLocation(a, b) {
    if (a[4].toLowerCase() === b[4].toLowerCase()) {
        return 0;
    }
    else {
        if (ascending) {
            return (a[4].toLowerCase() < b[4].toLowerCase()) ? -1 : 1;
        } else {
            return (a[4].toLowerCase() > b[4].toLowerCase()) ? -1 : 1;
        }
    }
}

/*
    Sorts the inventory data by input date.
    Feed this function to the sort() function.
*/
function sortByDate(a, b) {
    const date1 = new Date(a[0]);
    const date2 = new Date(b[0]);
    if (date1.getTime() === date2.getTime()) {
        return 0;
    }
    else {
        if (ascending) {
            return (date1 < date2) ? -1 : 1;
        } else {
            return (date1 > date2) ? -1 : 1;
        }
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