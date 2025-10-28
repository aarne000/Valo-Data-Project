const allData = [];                 // An array for holding all inventory data.
const categories = new Set();       // A Set for holding the categories in the inventory data.
const locations = new Set();        // A Set for holding the locations in the inventory data.
let sorting = "date";               // A string to determine the sorting variable.
let ascending = false;              // A boolean to determine how to sort.
let lang = 0;                       // A variable for switching language. 0 is English, 1 is Finnish.
let editing = false;                // A boolean to indicate whether the user is editing or adding an item.
let loading = 0;                    // A number indicating loading progress during launch. 2 means finished.

/*
    Adds event listeners to all the buttons and input elements on the main page.
    Should be called when the page is loaded and the database is initialized.
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
    document.getElementById("fin").addEventListener("click", changeLang);
    document.getElementById("eng").addEventListener("click", changeLang);
    document.getElementById("textsearch").addEventListener("input", ()=>{printData();});
    let links = document.getElementsByClassName("pseudo-link");
    for(let i = 0; i < links.length; i++) {
        links[i].addEventListener("click", sortingEvent);
    }
    browseMode();
}

/*
    Checks to see if loading the app has finished.
    Should be called when the page is finished loading and
    when the database is initialized.
*/
function loaded() {
    loading++;
    if (loading == 2) {main();}
}

/*
    Calls the appropriate functions for adding or editing an item.
*/
async function submit() {
	if (validate()) {
        let newCategory = false;
        let newLocation  = false;
		const date = new Date();
        let item = document.getElementById("description").value;
        let quantity = document.getElementById("quantity").value;
        let category = document.getElementById("category").value;
        if (category == "new") {
            category = document.getElementById("newcategory").value;
            newCategory = true;
        }
        let location = document.getElementById("location").value;
        if (location == "new") {
            location = document.getElementById("newlocation").value;
            newLocation = true;
        }
        try {
            if (!editing) {
                addItem(date.getTime(), item, quantity, category, location);
                if (newCategory || newLocation) {
                    fetchAll(false, newCategory, newLocation);
                }
                reset(false);
                const strings = ["Item added successfully", "Tuote lisätty onnistuneesti."];
                alert(strings[lang]);
            } else {
                removeItem(document.getElementById("hidden-input").value);
                addItem(date.getTime(), item, quantity, category, location);
                browseMode();
            }
        } catch (e) {
            error("Error: " + e.message);
        }
    }
}

/*
    Loads the inventory data into the allData array.
    Also updates the categories and locations Sets.
    If the parameter print is set to true,
    calls the functions for sorting and printing the inventory data.
    If the newCat and newLoc parameters are set to true,
    updates the respective drop-down boxes.
*/
async function fetchAll(print = true, newCat = true, newLoc = true) {
    try {
        const data = await getItems()
        allData.length = 0;
        categories.clear();
        locations.clear();
        for (let i = 0; i < data.length; i++) {
            allData.push(data[i]);
            categories.add(data[i].category);
            locations.add(data[i].location);
        }
        let select1, select2;
        if (newCat) {
            select1 = document.getElementById("category");
            select2 = document.getElementById("categorysearch");
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
        }
        if (newLoc) {
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
    Displays the inventory data in a table form.
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
        item.innerText = allData[i].description;
        quantity.innerText = allData[i].quantity;
        category.innerText = allData[i].category;
        location.innerText = allData[i].location;
        let date = new Date(allData[i].date)
        time.innerText = date.toLocaleDateString();
        del.innerHTML = '<img src="/svg/trashcan.svg" alt="Delete item" width="20" height="25">';
        del.innerHTML += '<img src="/svg/edit.svg" alt="Edit item" width="20" height="25">';
        del.setAttribute("id", allData[i].id);
        del.children[0].addEventListener("click", deleteItem);
        del.children[1].addEventListener("click", editMode);
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
    A function to be called when the user wants to delete an item.
    Calls the funtion removeItem, which should remove the item from the database.
    Calls fetchAll to update the UI.
*/
function deleteItem(e) {
    const conf = ["Are you sure you want to delete?", "Oletko varma, että haluat poistaa?"]
    if (confirm(conf[lang]) == true)
    {
        let td = e.target.parentElement;
        removeItem(td.getAttribute("id"));
        fetchAll();
    }
}

/*
    Switches the UI to display the browsing mode.
    Clears the search panel.
*/
function browseMode() {
    error("");
    document.getElementById("add-div").style.display = "none";
    document.getElementById("add-button").style.display = "inline-block";
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
    editing = false;
    error("");
    reset(true);
    document.getElementById("edit-legend").style.display = "none";
    document.getElementById("add-legend").style.display = "inline-block";
    document.getElementById("add-div").style.display = "block";
    document.getElementById("add-button").style.display = "none";
    document.getElementById("browse-div").style.display = "none";
    document.getElementById("browse-button").style.display = "inline-block";
}

/*
    Switches the UI to display the form for editing items in the inventory.
*/
function editMode(e) {
    editing = true;
    error("");
    let td = e.target.parentElement;
    let tr = td.parentElement;
    document.getElementById("location").value = tr.children[3].innerText;
    document.getElementById("category").value = tr.children[2].innerText;
    document.getElementById("quantity").value = tr.children[1].innerText;
    document.getElementById("description").value = tr.children[0].innerText;
    document.getElementById("newcategory").style.display = "none";
    document.getElementById("newlocation").style.display = "none";
    document.getElementById("add-legend").style.display = "none";
    document.getElementById("edit-legend").style.display = "inline-block";
    document.getElementById("add-div").style.display = "block";
    document.getElementById("add-button").style.display = "none";
    document.getElementById("browse-div").style.display = "none";
    document.getElementById("browse-button").style.display = "inline-block";
    document.getElementById("hidden-input").setAttribute("value", td.getAttribute("id"))
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
        const x = ["Please enter item description<br>", "Syötä tuotteen kuvaus<br>"];
        error(x[lang], true);
        valid = false;
    }
    if (Number(document.getElementById("quantity").value) <= 0) {
        const x = ["Please enter a positive quantity<br>", "Syötä positiivinen lukumäärä<br>"];
        error(x[lang], true);
        valid = false;
    }
    if (document.getElementById("category").value == "none") {
        const x = ["Please select a category<br>", "Valitse kategoria<br>"];
        error(x[lang], true);
        valid = false;
    } else if (document.getElementById("category").value == "new" &&
            document.getElementById("newcategory").value == "") {
        const x = ["Please enter a category<br>", "Syötä kategoria<br>"];
        error(x[lang], true);
        valid = false;
    }
    if (document.getElementById("location").value == "none") {
        const x = ["Please select a location<br>", "Valitse sijainti<br>"];
        error(x[lang], true);
        valid = false;
    } else if (document.getElementById("location").value == "new" &&
            document.getElementById("newlocation").value == "") {
        const x = ["Please enter a location<br>", "Syötä sijainti<br>"];
        error(x[lang], true);
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
        document.getElementById("newcategory").value = "";
        document.getElementById("newcategory").style.display = "block";
        document.getElementById("newcategory").focus();
    } else {
        document.getElementById("newcategory").style.display = "none";
    }
}

/*
    Hides or displays the input for new location.
    Should be called when the user changes the location when adding new items.
*/
function locationChange() {
    if (document.getElementById("location").value == "new") {
        document.getElementById("newlocation").value = "";
        document.getElementById("newlocation").style.display = "block";
        document.getElementById("newlocation").focus();
    } else {
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
            break;
        case "quantity-heading":
            if (sorting == "quantity") {
                ascending = !ascending;
            } else {
                sorting = "quantity";
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
            break;
        case "quantity":
            allData.sort(sortByQuantity)
    }
}

/*
    Sorts the inventory data by item name.
    Feed this function to the sort() function.
*/
function sortByName(a, b) {
    if (a.description.toLowerCase() === b.description.toLowerCase()) {
        return 0;
    }
    else {
        if (ascending) {
            return (a.description.toLowerCase() < b.description.toLowerCase()) ? -1 : 1;
        } else {
            return (a.description.toLowerCase() > b.description.toLowerCase()) ? -1 : 1;
        }
    }
}

/*
    Sorts the inventory data by category.
    Feed this function to the sort() function.
*/
function sortByCategory(a, b) {
    if (a.category.toLowerCase() === b.category.toLowerCase()) {
        return 0;
    }
    else {
        if (ascending) {
            return (a.category.toLowerCase() < b.category.toLowerCase()) ? -1 : 1;
        } else {
            return (a.category.toLowerCase() > b.category.toLowerCase()) ? -1 : 1;
        }
    }
}

/*
    Sorts the inventory data by location.
    Feed this function to the sort() function.
*/
function sortByLocation(a, b) {
    if (a.location.toLowerCase() === b.location.toLowerCase()) {
        return 0;
    }
    else {
        if (ascending) {
            return (a.location.toLowerCase() < b.location.toLowerCase()) ? -1 : 1;
        } else {
            return (a.location.toLowerCase() > b.location.toLowerCase()) ? -1 : 1;
        }
    }
}

/*
    Sorts the inventory data by input date.
    Feed this function to the sort() function.
*/
function sortByDate(a, b) {
    const date1 = new Date(a.date);
    const date2 = new Date(b.date);
    if (date1.getTime() === date2.getTime()) {
        return 0;
    }
    else {
        if (ascending) {
            return (date1.getTime() < date2.getTime()) ? -1 : 1;
        } else {
            return (date1.getTime() > date2.getTime()) ? -1 : 1;
        }
    }
}

/*
    Sorts the inventory data by quantity.
    Feed this function to the sort() function.
*/
function sortByQuantity(a, b) {
    if (parseInt(a.quantity) === parseInt(b.quantity)) {
        return 0;
    }
    else {
        if (ascending) {
            return (parseInt(a.quantity) < parseInt(b.quantity)) ? -1 : 1;
        } else {
            return (parseInt(a.quantity) > parseInt(b.quantity)) ? -1 : 1;
        }
    }
}

/*
    Changes the language of the UI.
    Note that changes in the html file will mess this up.
*/
function changeLang(e) {
    if (e.target.getAttribute("id") == "eng") {
        //document.getElementById("eng").style.display = "none"
        //document.getElementById("fin").style.display = "inline-block"
        lang = 0;
        document.getElementsByTagName("title")[0].innerText = "Valo Inventory";
        document.getElementsByTagName("h1")[0].innerText = "Valo Inventory";
        document.getElementById("browse-button").innerText = "Click to browse";
        document.getElementById("add-button").innerText = "Click to add";
        document.getElementById("add-legend").innerText = "Add a new item";
        document.getElementById("edit-legend").innerText = "Edit an item";
        let labels = document.getElementsByTagName("label");
        labels[0].innerText = "Item name:";
        labels[1].innerText = "Item description:";
        labels[2].innerText = "Quantity:";
        labels[3].innerText = "Category:";
        labels[4].innerText = "Location:";
        labels[5].innerText = "Search for item:";
        let cats = document.getElementById("category");
        cats.children[0].innerText = "Select a category";
        cats.children[cats.children.length - 1].innerText = "A new category:";
        let locs = document.getElementById("location");
        locs.children[0].innerText = "Select a location";
        locs.children[locs.children.length - 1].innerText = "A new location:";
        document.getElementById("submit-button").innerText = "Submit";
        document.getElementById("reset-button").innerText = "Reset";
        document.getElementById("categorysearch").children[0].innerText = "All categories";
        document.getElementById("locationsearch").children[0].innerText = "All locations";
        let heads = document.getElementsByTagName("th");
        heads[0].innerText = "Item";
        heads[1].innerText = "Quantity";
        heads[2].innerText = "Category";
        heads[3].innerText = "Location";
        heads[4].innerText = "Time";
    } else if (e.target.getAttribute("id") == "fin") {
        //document.getElementById("fin").style.display = "none"
        //document.getElementById("eng").style.display = "inline-block"
        lang = 1;
        document.getElementsByTagName("title")[0].innerText = "Valo Inventaario";
        document.getElementsByTagName("h1")[0].innerText = "Valo Inventaario";
        document.getElementById("browse-button").innerText = "Paina selataksesi";
        document.getElementById("add-button").innerText = "Paina lisätäksesi";
        document.getElementById("add-legend").innerText = "Lisää uusi tuote";
        document.getElementById("edit-legend").innerText = "Muokkaa tuotetta";
        let labels = document.getElementsByTagName("label");
        labels[0].innerText = "Tuotteen nimi:";
        labels[1].innerText = "Tuotteen kuvaus:";
        labels[2].innerText = "Määrä:";
        labels[3].innerText = "Kategoria:";
        labels[4].innerText = "Sijainti:";
        labels[5].innerText = "Etsi tuotetta:";
        let cats = document.getElementById("category");
        cats.children[0].innerText = "Valitse kategoria";
        cats.children[cats.children.length - 1].innerText = "Uusi kategoria:";
        let locs = document.getElementById("location");
        locs.children[0].innerText = "Valitse sijainti";
        locs.children[locs.children.length - 1].innerText = "Uusi sijainti:";
        document.getElementById("submit-button").innerText = "Valmis";
        document.getElementById("reset-button").innerText = "Tyhjennä";
        document.getElementById("categorysearch").children[0].innerText = "Kaikki kategoriat";
        document.getElementById("locationsearch").children[0].innerText = "Kaikki sijainnit";
        let heads = document.getElementsByTagName("th");
        heads[0].innerText = "Tuote";
        heads[1].innerText = "Määrä";
        heads[2].innerText = "Kategoria";
        heads[3].innerText = "Sijainti";
        heads[4].innerText = "Aika";
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

/*
    To do:
    Separate item name and item description.
    Subcategories.
    Merging identical or near identical items.
*/