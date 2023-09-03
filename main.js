(function(){

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const ballTypes = ["beast", "dream", "fast", "friend", "heavy", "level", "love", "lure", "moon", "safari", "sport"];

    const natures = ["random", "hardy", "lonely", "adamant", "naughty", "brave",
                    "bold", "docile", "impish", "lax", "relaxed",
                    "modest", "mild", "bashful", "rash", "quiet",
                    "calm", "gentle", "careful", "quirky", "sassy",
                    "timid", "hasty", "jolly", "naive", "serious"];

    const users = [
        {
            "name": "knifecat",
            "pref": {
                "collapse": false,
                "style": "driftwood"
            }
        },
        {
            "name": "test",
            "pref": {
                "collapse": true,
                "style": "driftwood"
            }
        },
        {
            "name": "iolite",
            "pref": {
                "collapse": true,
                "style": "driftwood"
            }
        }
    ];

    // check the url params
    const qString = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let userInfo = users[0];
    if (qString.user) {
        userInfo = users.filter(function(user){
            return user.name === qString.user;
        })[0];
        if (userInfo === undefined) {
            userInfo = users[0];
        }
    }

    function capitalize(str) {

        // check if it's blank (loose equality intentional)
        if (str == "") {
            return "";
        }

        // split string into words, initialize new string
        let wordArr = str.split(" ");
        let newStr = "";

        // for each word in the string
        for (let i = 0; i < wordArr.length; i++) {

            // capitalize the first letter
            let firstLetter = wordArr[i][0].toUpperCase();

            // assign the rest of the word to a different variable
            let rest = wordArr[i].slice(1);

            // combine them again and add them to the new string
            let word = firstLetter + rest;
            newStr += word + " ";
        }

        // remove trailing space from the string and return it
        newStr = newStr.slice(0, newStr.length - 1);
        return newStr;
    }

    // applies leading zeros to id numbers
    // used to match pokemon to images
    function addLeadingZeros(number) {
        if (number > 99) {
            return number.toString();
        } else if (number > 9) {
            return "0" + number;
        } else {
            return "00" + number;
        }
    }

    // change color of icons on hover
    // keep track of hover state to make sure it doesn't double-activate
    let activeHover = false;

    // applies hover coloring to icons on buttons
    function hoverIcon(e) {

        // account for bubbling
        let icon;
        if (e.target.classList.contains("symbol")) {
            icon = e.target;
        } else {
            icon = e.target.getElementsByClassName("symbol")[0];
        }

        if (icon === undefined) {
            return;
        }

        // find the icon filename, without extension or filepath
        const filenameArr = icon.src.split("/");
        const filename = filenameArr[filenameArr.length - 1];
        const slug = filename.split(".")[0];

        // change the state of the hover tracker
        // add or remove "-hover" from the filename
        if ((e.type === "mouseover" || e.type === "focusin") && activeHover === false) {
            activeHover = true;
            icon.src = "img/" + slug + "-hover.png";
        } else if ((e.type === "mouseleave"|| e.type === "focusout") && activeHover === true) {
            activeHover = false;
            const deslug = slug.split("-")[0];
            icon.src = "img/" + deslug + ".png";
        }
    }

    // apply the hover function to mouseover, mouseleave, focusin, focusout
    const smallBtns = document.getElementsByClassName("small-button");
    for (button of smallBtns) {
        button.addEventListener("mouseover", function(e){
            hoverIcon(e);
        });
        button.addEventListener("mouseleave", function(e){
            hoverIcon(e);
        });
        button.addEventListener("focusin", function(e){
            hoverIcon(e);
        });
        button.addEventListener("focusout", function(e){
            hoverIcon(e);
        });
    }

    // toggles between tall cards and thin cards
    const sizeButton = document.getElementById("size-toggle");
    function toggleSize() {
        const cardRows = document.getElementById("card-rows");
        const symbol = sizeButton.getElementsByClassName("symbol")[0];
        if (cardRows.classList.contains("compact")) {
            cardRows.classList.remove("compact");
            symbol.src = "img/collapse.png";
            symbol.alt = "arrows pointing inwards";
        } else {
            cardRows.classList.add("compact");
            symbol.src = "img/expand.png";
            symbol.alt = "arrows pointing outwards";
        }
    }
    sizeButton.addEventListener("click", toggleSize);
    if (userInfo.pref.collapse === true) {
        toggleSize();
    }

    // toggles sections of the menu
    function menuToggle(item) {
        const menuSection = document.getElementById(item);
        const menuButton = document.getElementById(item + "-menu");

        if (menuSection.classList.contains("hidden")) {
            menuSection.classList.remove("hidden");
            menuButton.classList.add("shiny");
        } else {
            menuSection.classList.add("hidden");
            menuButton.classList.remove("shiny");
        }
    }

    // handles the event for the menu toggle
    function menuHandler(e) {
        if (e.type === "keydown" && e.key !== "Enter") {
            return;
        }

        const item = e.target.id.split("-")[0];
        menuToggle(item);
    }

    // adds action handlers to menu sections
    const menuSections = document.getElementsByClassName("menu");
    for (section of menuSections) {
        section.addEventListener("click", function(e){
            menuHandler(e);
        });
        section.addEventListener("keydown", function(e){
            menuHandler(e);
        });
    }

    // minimizes 3 sections
    menuToggle("control");
    menuToggle("sort");
    menuToggle("filter");

    // get the list of possible aprimon
    function getPossible() {
        fetch("data/_possible.json")
        .then(response => response.json())
        .then(possible => {

    // get the user information about their specific aprimon
    const url = "data/" + userInfo.name + ".json";
    fetch(url, {cache: "no-store"})
    .then(response => response.json())
    .then(json => {

        // i thought this would clone it; it did not
        // but the only harm done is that the sort order is persistent now
        // which might actually be good
        let activeSort = json;
        let pkmnList = ["SELECT:"];

        // function that renders cards from a json
        function displayCards(data) {

            const cardBox = document.getElementById("card-rows");
            cardBox.innerHTML = "";

            data.forEach(function(pkmn){

                let title;
                if (pkmn.pokemon.form === null) {
                    title = capitalize(pkmn.pokemon.name);
                } else {
                    title = capitalize(`${pkmn.pokemon.form} ${pkmn.pokemon.name}`);
                }

                const card = document.createElement("div");
                card.classList.add("box", "card");
                if (pkmn.final !== null) {
                    card.classList.add("shiny");
                }
                let id = pkmn.ball + "-" + pkmn.pokemon.name;
                cardBox.appendChild(card);

                const image = document.createElement("img");
                image.classList.add("pokemon");
                
                if (pkmn.pokemon["form"] === null) {
                    image.src = `img/${addLeadingZeros(pkmn.pokemon.natdex)}.png`;
                } else {
                    let suffix = "-" + pkmn.pokemon.form.split("")[0];
                    image.src = `img/${addLeadingZeros(pkmn.pokemon.natdex)}${suffix}.png`;
                    id += suffix;
                }
                image.alt = title;
                card.appendChild(image);
                card.id = id;
                pkmnList.push(id);

                const ball = document.createElement("img");
                ball.classList.add("ball");
                ball.src = `img/${pkmn.ball}ball.png`;
                ball.alt = pkmn.ball + " ball";
                card.appendChild(ball);

                const cardTitle = document.createElement("h3");
                cardTitle.innerText = title;
                card.appendChild(cardTitle);

                const smallRow = document.createElement("div");
                smallRow.classList.add("small-row");
                card.appendChild(smallRow);

                const ivs = document.createElement("p");
                ivs.classList.add("info");
                ivs.innerText = "5+";
                ivs.title = "5+ IVs";
                if (pkmn["5iv"] === false) {
                    ivs.classList.add("missing");
                }
                smallRow.appendChild(ivs);

                const ha = document.createElement("p");
                ha.classList.add("info");
                ha.innerText = "HA";
                ha.title = "hidden ability";
                if (pkmn.ha === false || pkmn.ha === null) {
                    ha.classList.add("missing");
                }
                smallRow.appendChild(ha);

                const sparkleWrap = document.createElement("div");
                sparkleWrap.classList.add("info", "missing");
                smallRow.appendChild(sparkleWrap);

                const sparkles = document.createElement("img");
                sparkles.classList.add("icon");
                if (pkmn.final !== null) {
                    sparkles.src = "img/sparkle-hover.png";
                    sparkles.alt = "active shiny symbol";
                } else {
                    sparkles.src = "img/sparkle-grey.png";
                    sparkles.alt = "inactive shiny symbol";
                }
                sparkleWrap.appendChild(sparkles);

                const count = document.createElement("p");
                count.classList.add("info");
                count.title = "eggs hatched";
                count.innerText = pkmn.eggs;
                if (pkmn.target === false) {
                    count.classList.add("missing");
                }
                smallRow.appendChild(count);

                card.addEventListener("click", function(e){
                    zoomIn(e);
                });

            });
        }

        // function that calculates and displays stats
        function apriTotals() {
            const apriTotal = document.getElementById("apri-total");
            apriTotal.innerText = json.length;

            const shinies = document.getElementById("shinies");
            const eggs = document.getElementById("eggs");
            let shinyCount = 0;
            let eggCount = 0;
            json.forEach(function(pkmn){
                if (pkmn.final !== null) {
                    shinyCount++;
                }
                eggCount += parseInt(pkmn.eggs);
            });
            shinies.innerText = shinyCount;
            eggs.innerText = eggCount;

            const ratioDisplay = document.getElementById("ratio");
            const ratio = eggCount / shinyCount;
            ratioDisplay.innerText = "1:" + ratio.toFixed(0);

        }

        // function that sorts json data based on input
        function sortCards(e) {
            // if using keyboard navigation, ignore keys other than enter
            if (e.type === "keydown" && e.key !== "Enter") {
                return;
            }

            // account for bubbling; find the target element
            let button;
            if (e.target.classList.contains("symbol")) {
                button = e.target.parentNode;
            } else if (e.target.classList.contains("sort")) {
                button = e.target;
            }

            const id = button.id;
            let sortedJSON = activeSort;
            if (id === "alpha") {
                sortedJSON = activeSort.sort(function(a, b){
                    let x = a.pokemon.name;
                    let y = b.pokemon.name;
                    if (x < y) { return -1; }
                    if (x > y) { return 1; }
                    return 0;
                });
            } else if (id === "numer") {
                sortedJSON = activeSort.sort(function(a, b){
                    return a.pokemon.natdex - b.pokemon.natdex;
                });
            } else if (id === "balls") {
                sortedJSON = activeSort.sort(function(a, b){
                    let x = a.ball;
                    let y = b.ball;
                    if (x < y) { return -1; }
                    if (x > y) { return 1; }
                    return 0;
                });
            } else if (id === "target") {
                sortedJSON = activeSort.sort(function(a, b){
                    return b.target - a.target;
                });
            } else if (id === "shiny") {
                sortedJSON = activeSort.sort(function(a, b){
                    return new Date(b.final) - new Date(a.final);
                });
            } else if (id === "ha") {
                sortedJSON = activeSort.sort(function(a, b){
                    return b.ha - a.ha;
                });
            } else if (id === "five") {
                sortedJSON = activeSort.sort(function(a, b){
                    return b["5iv"] - a["5iv"];
                });
            } else if (id === "count") {
                sortedJSON = activeSort.sort(function(a, b){
                    return b.eggs - a.eggs;
                });
            }
            activeSort = sortedJSON;
            displayCards(activeSort);

            // add the active styling to the active button
            for (const btn of sortSet) {
                btn.classList.remove("shiny");
            }
            for (const btn of filterSet) {
                btn.classList.remove("shiny");
                if (btn.id === "all") {
                    btn.classList.add("shiny");
                }
            }
            button.classList.add("shiny");
        }

        // event listeners
        const sortSet = document.getElementsByClassName("sort");
        for (button of sortSet) {
            button.addEventListener("click", function(e){
                sortCards(e);
            });
            button.addEventListener("keydown", function(e){
                sortCards(e);
            });
        }

        // function that filters json data based on input
        function filterCards(e) {

            // if using keyboard navigation, ignore keys other than enter
            if (e.type === "keydown" && e.key !== "Enter") {
                return;
            }

            // account for bubbling; find the target element
            let button;
            if (e.target.classList.contains("icon")) {
                button = e.target.parentNode;
            } else if (e.target.classList.contains("filter")) {
                button = e.target;
            }

            let filteredJSON;
            const id = button.id;

            // filter data by the id 
            if (!button.classList.contains("other")) {                    
                filteredJSON = activeSort.filter(function(pkmn){
                    return pkmn.ball === id;
                });
            } else {
                filteredJSON = activeSort.filter(function(pkmn){
                    return pkmn[id] === true;
                });
            }

            // if the id is all, display all cards
            // otherwise, display filtered cards
            if (id === "all") {
                displayCards(activeSort);
            } else {
                displayCards(filteredJSON);
            }
            
            // add the active styling to the active button
            for (const btn of filterSet) {
                btn.classList.remove("shiny");
            }
            button.classList.add("shiny");
        }

        // event listeners
        const filterSet = document.getElementsByClassName("filter");
        for (button of filterSet) {
            button.addEventListener("click", function(e){
                filterCards(e);
            });
            button.addEventListener("keydown", function(e){
                filterCards(e);
            });
        }

        // create overlay popup
        function popup(element) {
            const overlay = document.createElement("div");
            overlay.id = "overlay";
            overlay.appendChild(element);
            element.classList.add("box");
            document.body.appendChild(overlay);
            return overlay;
        }

        // close overlay popup
        function popdown() {
            const overlay = document.getElementById("overlay");
            overlay.remove();
        }

        // adds hover styling on 4 events at once
        function addHover(el) {
            el.addEventListener("mouseover", function(e){
                hoverIcon(e);
            });
            el.addEventListener("mouseleave", function(e){
                hoverIcon(e);
            });
            el.addEventListener("focusin", function(e){
                hoverIcon(e);
            });
            el.addEventListener("focusout", function(e){
                hoverIcon(e);
            });
        }

        // generates a pair of confirm and close buttons
        // Qcheck is the location the buttons are added to
        // i should instead add them to a .nav-row and return that
        function confirmOrDeny(Qcheck, confirmFunc) {
            const Qsubmit = document.createElement("button");
            Qsubmit.id = "approve-queue";
            Qsubmit.classList.add("small-button");
            Qcheck.appendChild(Qsubmit);
            Qsubmit.addEventListener("click", confirmFunc);

            const Qicon = document.createElement("img");
            Qicon.src = "img/check.png";
            Qicon.classList.add("symbol");
            Qsubmit.appendChild(Qicon);
            addHover(Qicon)

            const Qcancel = document.createElement("button");
            Qcancel.id = "cancel-queue";
            Qcancel.classList.add("small-button");
            Qcheck.appendChild(Qcancel);
            Qcancel.addEventListener("click", popdown);

            const Qx = document.createElement("img");
            Qx.src = "img/x.png";
            Qx.classList.add("symbol");
            Qcancel.appendChild(Qx);
            addHover(Qx);
        }

        // reads the state of the browse buttons and generates simple tiles
        function displayBrowse() {
            const buttons = document.getElementsByClassName("browse-button");
            const bf = {};
            for (btn of buttons) {
                if (btn.classList.contains("include")) {
                    bf[btn.id] = true;
                } else if (btn.classList.contains("exclude")) {
                    bf[btn.id] = false;
                } else {
                    bf[btn.id] = null;
                }
            }

            let filteredPossible = possible.filter(function(pkmn){
                let check = true;
                console.log(pkmn);
                for (game in bf) {
                    console.log(game);
                    if (bf[game] === null) {
                        console.log("not looking");
                        check = true;
                    } else if (bf[game] === pkmn[game]) {
                        console.log("match");
                        check = true;
                    } else {
                        console.log("no match");
                        check = false;
                        break;
                    }
                }
                console.log(check);
                return check;
            });
            if (bf["all-possible"] === true) {
                filteredPossible = possible;
            }
 
            const cardRow = document.getElementById("browse-row");
            cardRow.innerHTML = "";
            filteredPossible.forEach(function(pkmn){
                let id;
                let title;
                if (pkmn.form) {
                    id = pkmn.form + "-" + pkmn.name;
                    title = capitalize(pkmn.form + " " + pkmn.name);
                } else {
                    id = pkmn.name;
                    title = capitalize(pkmn.name);
                }

                const card = document.createElement("div");
                card.classList.add("browse-card");
                card.id = id;
                const image = document.createElement("img");
                image.classList.add("pokemon");
                image.src = "img/" + addLeadingZeros(pkmn.natdex);
                if (pkmn.form) {
                    image.src += "-" + pkmn.form.substr(0, 1);
                }
                image.src += ".png";
                image.alt = title;
                card.appendChild(image);
                cardRow.appendChild(card);
            })

        }

        // changes the state of the browse buttons
        function changeBrowseFilter(e) {
            const target = e.target;

            if (target.id === "all-possible" && !target.classList.contains("include")) {
                const browseBtns = document.getElementsByClassName("browse-button");
                for (btn of browseBtns) {
                    btn.classList.remove("include");
                    btn.classList.remove("exclude");
                }
                target.classList.add("include");
            } else {
                const viewAll = document.getElementById("all-possible");
                viewAll.classList.remove("include");
                if (target.classList.contains("include")) {
                    target.classList.remove("include");
                    target.classList.add("exclude");
                } else if (target.classList.contains("exclude")) {
                    target.classList.remove("exclude");
                } else {
                    target.classList.add("include");
                }
            }

            displayBrowse();
        }

        // opens the browsing popup
        function browseAprimon() {
            const browse = document.createElement("div");
            browse.id = "browse-display";

            const browseTitle = document.createElement("h2");
            browseTitle.innerText = "Browse Pokemon by generation(s) available";
            browse.appendChild(browseTitle);

            const browseControls = document.createElement("div");
            browseControls.classList.add("nav-row", "wide-row");
            browse.appendChild(browseControls);

            const prevGen = document.createElement("div");
            prevGen.id = "prevgen";
            prevGen.classList.add("small-button", "browse-button");
            prevGen.innerText = "7-";
            prevGen.title = "Gen 7 and earlier";
            browseControls.appendChild(prevGen);
            prevGen.addEventListener("click", function(e){
                changeBrowseFilter(e);
            });

            const swsh = document.createElement("div");
            swsh.id = "swsh";
            swsh.classList.add("small-button", "browse-button");
            swsh.innerText = "SWSH";
            swsh.title = "Sword and Shield";
            browseControls.appendChild(swsh);
            swsh.addEventListener("click", function(e){
                changeBrowseFilter(e);
            });

            const bdsp = document.createElement("div");
            bdsp.id = "bdsp";
            bdsp.classList.add("small-button", "browse-button");
            bdsp.innerText = "BDSP";
            bdsp.title = "Brilliant Diamond and Shining Pearl";
            browseControls.appendChild(bdsp);
            bdsp.addEventListener("click", function(e){
                changeBrowseFilter(e);
            });

            const viewAll = document.createElement("div");
            viewAll.id = "all-possible";
            viewAll.classList.add("small-button", "browse-button", "include");
            viewAll.innerText = "ALL";
            viewAll.title = "View all possible aprimon";
            browseControls.appendChild(viewAll);
            viewAll.addEventListener("click", function(e){
                changeBrowseFilter(e);
            });

            const Qcancel = document.createElement("div");
            Qcancel.id = "cancel";
            Qcancel.classList.add("small-button");
            browseControls.appendChild(Qcancel);
            Qcancel.addEventListener("click", popdown);

            const Qx = document.createElement("img");
            Qx.src = "img/x.png";
            Qx.classList.add("symbol");
            Qcancel.appendChild(Qx);
            addHover(Qx);

            const cardRow = document.createElement("div");
            cardRow.classList.add("nav-row");
            cardRow.id = "browse-row";
            browse.appendChild(cardRow);

            popup(browse);
            displayBrowse();

        }

        // event listener
        const browseBtn = document.getElementById("browse");
        browseBtn.addEventListener("click", browseAprimon);

        // adds a new aprimon to the user's collection
        // part 2: change the data
        function addPokemon() {

            let pkmnName = document.getElementById("pokemon").value.toLowerCase();
            const pkmnBall = document.getElementById("ball").value;
            const pkmnNature = document.getElementById("nature").value;
            const ivCheck = document.getElementById("five-iv").checked;
            const haCheck = document.getElementById("hidden-ab").checked;
            const targetCheck = document.getElementById("target-pk").checked;

            if (pkmnName === "") {
                alert("Pokemon name required.");
                popdown();
                return;
            }

            let pkmnForm;
            if (pkmnName.includes(" ")) {
                pkmnArr = pkmnName.split(" ");
                pkmnForm = pkmnArr[0];
                pkmnName = pkmnArr[1];
            } else {
                pkmnForm = null;
            }

            const pkmnDetails = possible.filter(function(pkmn){
                return (pkmn.name === pkmnName && pkmn.form === pkmnForm);
            })[0];

            if (pkmnDetails === undefined) {
                alert("Pokemon not found.");
                popdown();
                return;
            }

            const entry = {
                "pokemon": {
                    "name": pkmnName,
                    "natdex": pkmnDetails.natdex,
                    "form": pkmnForm
                },
                "ball": pkmnBall,
                "nature": pkmnNature,
                "eggs": 0,
                "on-hand": 0,
                "final": null,
                "ha": haCheck,
                "5iv": ivCheck,
                "target": targetCheck
            };
            
            json.push(entry);
            displayCards(json);
            popdown();

        }

        // creates a standardized field with label and container
        // text or number
        function createFormField(name, id, type, value) {
            const nameField = document.createElement("div");
            nameField.classList.add("field");

            const nameLabel = document.createElement("label");
            nameLabel.setAttribute("for", id);
            nameLabel.innerText = capitalize(name) + ":";
            nameField.appendChild(nameLabel);

            const nameEntry = document.createElement("input");
            nameEntry.name = id;
            nameEntry.id = id;
            nameEntry.type = type;
            if (value !== undefined) {
                nameEntry.value = value;
            }
            nameField.appendChild(nameEntry);

            return nameField;
        }

        // creates a standardized checkbox with label and container
        function createCheck(title, id, state) {
            const loc = document.createElement("div");
            loc.classList.add("field");

            const label = document.createElement("label");
            label.setAttribute("for", id);
            label.innerHTML = title;
            loc.appendChild(label);

            const check = document.createElement("input");
            check.type = "checkbox";
            check.name = id;
            check.id = id;
            check.checked = state;
            loc.appendChild(check);

            return loc;
        }

        // creates a standardized drop-down menu with label and container
        function createDrop(title, id, list) {
            const ballField = document.createElement("div");
            ballField.classList.add("field");

            const ballLabel = document.createElement("label");
            ballLabel.setAttribute("for", id);
            ballLabel.innerText = capitalize(title) + ":";
            ballField.appendChild(ballLabel);

            const ballDrop = document.createElement("select");
            ballDrop.name = id;
            ballDrop.id = id;
            ballField.appendChild(ballDrop);

            list.forEach(function(ball){
                const option = document.createElement("option");
                option.value = ball;
                let ballArr = ball.split("-");
                let ballTitle = capitalize(ballArr.join(" "));
                option.innerText = ballTitle;
                ballDrop.appendChild(option);
            });

            return ballField;
        }

        // when the user clicks on an auto-suggestion, fill it in as the field value
        function acceptSuggestion(e) {
            const sug = e.target.innerText;
            const field = document.getElementById("pokemon");
            field.value = sug;

            const location = document.getElementById("auto-suggest");
            location.classList.add("hidden");
        }

        // when the user is typing into a field, generate and display auto-complete suggestions
        function autoComplete(e, list) {
            const value = e.target.value.toLowerCase();
            const length = value.length;
            const location = document.getElementById("auto-suggest");

            if (value !== null && value !== "") {
                location.innerHTML = "";
                const suggests = list.filter(function(pkmn){
                    return pkmn.includes(capitalize(value));
                }).sort(function(a, b){
                    if (a.substr(0, length) === capitalize(value)) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                suggests.forEach(function(sug){
                    const disp = document.createElement("div");
                    disp.classList.add("suggest");
                    disp.innerText = sug;
                    location.appendChild(disp);
                    disp.addEventListener("click", function(e){
                        acceptSuggestion(e);
                    });
                });
                location.classList.remove("hidden");
            } else {
                location.classList.add("hidden");
            }

        }

        // adds a new aprimon to the user's collection
        // part 1: gather input
        function addPokemonDialog() {

            const box = document.createElement("div");
            box.id = "zoom";

            const title = document.createElement("h2");
            title.innerText = "Add an aprimon to your collection";
            box.appendChild(title);
            
            const form = document.createElement("form");
            box.appendChild(form);

            const nameList = possible.map(function(pkmn){
                if (pkmn.form === null) {
                    return capitalize(pkmn.name);
                } else {
                    return capitalize(pkmn.form + " " + pkmn.name);
                }
            });

            const nameField = createFormField("pokemon name", "pokemon", "text");
            nameField.id = "name-field";
            nameField.addEventListener("keydown", function(e){
                if (e.key === "Enter") {
                    e.preventDefault();
                    return false;
                  }
            });
            nameField.addEventListener("input", function(e) {
                autoComplete(e, nameList);
            });
            form.appendChild(nameField);

            const autoSuggest = document.createElement("div");
            autoSuggest.id = "auto-suggest";
            autoSuggest.classList.add("hidden");
            nameField.appendChild(autoSuggest);

            form.appendChild(createDrop("pokeball", "ball", ballTypes));

            form.appendChild(createDrop("nature", "nature", natures));

            const checksRow = document.createElement("div");
            form.appendChild(checksRow);

            checksRow.appendChild(createCheck("5+ IVs?", "five-iv"));
            checksRow.appendChild(createCheck("Hidden ability?", "hidden-ab"))
            checksRow.appendChild(createCheck("Shiny target?", "target-pk"))

            const decision = document.createElement("div");
            decision.classList.add("nav-row");
            confirmOrDeny(decision, addPokemon);
            box.appendChild(decision);

            popup(box);

        }

        // listeners
        const addPkmnBtn = document.getElementById("add-pkmn");
        addPkmnBtn.addEventListener("click", addPokemonDialog);

        // creates a read-only text field
        function createZoomField(title, info) {
            const field = document.createElement("div");
            field.classList.add("display-field");

            const label = document.createElement("span");
            label.innerHTML = title;
            field.appendChild(label);

            const text = document.createElement("span");
            text.innerText = info;
            field.appendChild(text);

            return field;
        }

        // find all information about the pokemon whose details are currently displayed
        function findPokemon() {
            const id = document.getElementById("indv-facts").dataset.id;
            const arr = id.split("-");
            const ball = arr[0];
            const name = arr[1];
            let suffix = null;
            if (arr[2]) {
                suffix = arr[2];
            }

            const pkmnIndv = activeSort.filter(function(pkmn){
                let checkForm = false;
                if (suffix) {
                    if (pkmn.pokemon.form && pkmn.pokemon.form.substr(0, 1) === suffix) {
                        checkForm = true;
                    }
                } else {
                    checkForm = true;
                }
                return (pkmn.ball === ball && pkmn.pokemon.name === name && checkForm);
            })[0];

            const pkmnSpcs = possible.filter(function(pkmn){
                let checkForm = false;
                if (suffix) {
                    if (pkmn.form && pkmn.form.substr(0, 1) === suffix) {
                        checkForm = true;
                    }
                } else {
                    checkForm = true;
                }
                return (pkmn.name === name && checkForm);
            })[0];

            return [pkmnIndv, pkmnSpcs];
        }

        // change the user information about an aprimon
        // part 2: change the data
        function editPokemon() {
            const inHatched = document.getElementById("hatched").value;
            const togShiny = document.getElementById("shiny-get").checked;
            let inShiny = null;
            if (togShiny === true) {
                const inDate = document.getElementById("shiny-date").value;
                let date;
                if (inDate !== "") {
                    date = new Date(inDate);
                } else {
                    date = new Date();
                }
                inShiny = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                console.log(inShiny);
            }
            const inFive = document.getElementById("five-iv").checked;
            const inNature = document.getElementById("nature").value;
            const inHidden = document.getElementById("hidden-ability").checked;

            const indvPkmn = findPokemon()[0];
            indvPkmn.eggs = inHatched;
            indvPkmn.final = inShiny;
            indvPkmn["5iv"] = inFive;
            indvPkmn.nature = inNature;
            indvPkmn.ha = inHidden;

            popdown();
            displayCards(activeSort);
            
        }

        // generates a list of possible egg moves, with those learned emphasized
        function displayEggmoves() {
            const element = document.getElementById("egg-wrapper");
            if (element !== null) {
                element.remove();
            }

            const eggWrapper = document.createElement("p");
            eggWrapper.id = "egg-wrapper";
            
            const pkmnIndv = findPokemon()[0];
            const pkmnSpcs = findPokemon()[1];

            pkmnSpcs.eggmoves.forEach(function(move){
                const moveSpan = document.createElement("span");
                moveSpan.innerText = capitalize(move);
                moveSpan.classList.add("eggmove");
                if (pkmnIndv.eggmoves && pkmnIndv.eggmoves.includes(move)) {
                    moveSpan.classList.add("learned");
                } else {
                    moveSpan.classList.add("missing");
                }
                eggWrapper.appendChild(moveSpan);
                moveSpan.addEventListener("click", function(e){
                    toggleMove(e);
                });
            });
            return eggWrapper;
        }

        // toggles an egg move between learned and not learned
        function toggleMove(e) {
            const move = e.target.innerText;
            const indvPkmn = findPokemon()[0];
            if (!indvPkmn.eggmoves) {
                indvPkmn.eggmoves = [move];
            } else if (indvPkmn.eggmoves.includes(move)) {
                const index = indvPkmn.eggmoves.indexOf(move);
                indvPkmn.eggmoves.splice(index, 1);
            } else {
                indvPkmn.eggmoves.push(move);
            }
            
            const eggMoveBox = document.getElementById("eggmoves");
            eggMoveBox.appendChild(displayEggmoves());
        }

        // change the user information about an aprimon
        // part 1: gather input
        function editPokemonDialog(pkmnIndv, pkmnSpcs) {

            const indvFacts = document.getElementById("indv-facts");
            indvFacts.innerHTML = "";

            indvFacts.appendChild(createCheck("Shiny target", "shiny-target", pkmnIndv.target));

            indvFacts.appendChild(createFormField("Eggs hatched", "hatched", "number", pkmnIndv.eggs));

            let shiny = true;
            if (pkmnIndv.final === null) {
                shiny = false;
            }
            indvFacts.appendChild(createCheck("Shiny obtained", "shiny-get", shiny));
            indvFacts.appendChild(createFormField("Shiny date", "shiny-date", "date"));

            indvFacts.appendChild(createCheck("5+ IVs", "five-iv", pkmnIndv["5iv"]));

            indvFacts.appendChild(createDrop("nature", "nature", natures));

            const hiddenTitle = `Hidden ability:<br>(${capitalize(pkmnSpcs.hidden)})`;
            indvFacts.appendChild(createCheck(hiddenTitle, "hidden-ability", pkmnIndv.ha));

            const eggMoveBox = document.getElementById("eggmoves");
            eggMoveBox.classList.add("move-edit");

            const controls = document.getElementById("zoom-controls");
            controls.innerHTML = "";
            confirmOrDeny(controls, editPokemon);
        }

        function yesNo(bool) {
            if (bool === true) {
                return "yes";
            } else {
                return "no";
            }
        }

        // display a popup with all the information available about an aprimon
        function zoomIn(e) {
            let target = e.target;
            while (!target.classList.contains("card")) {
                target = target.parentNode;
            }
            const id = target.id;

            const idArr = id.split("-");
            const ball = idArr[0];
            const name = idArr[1];
            let suffix = null;
            if (idArr[2]) {
                suffix = idArr[2];
            }
            const pkmnIndv = activeSort.filter(function(pkmn){
                return (pkmn.pokemon.name === name && pkmn.ball === ball);
            })[0];
            const pkmnSpcs = possible.filter(function(pkmn){
                let check1 = true;
                if (suffix !== null) {
                    if (pkmn.form === null) {
                        check1 = false;
                    } else {
                        const pkmnSuffix = pkmn.form.substr(0, 1);
                        if (pkmnSuffix !== suffix) {
                            check1 = false;
                        }
                    }
                }
                return (pkmn.name === name && check1 === true);
            })[0];

            let pkmnTitle = "";
            if (suffix) {
                pkmnTitle = pkmnSpcs.form + " ";
            }
            pkmnTitle += name;
            const fullTitle = capitalize(ball + " " + pkmnTitle);

            const zoom = document.createElement("div");
            zoom.id = "zoom";
            if (pkmnIndv.final !== null) {
                zoom.classList.add("shiny");
            }
            
            const imgRow = document.createElement("div");
            imgRow.classList.add("nav-row", "zoom-img-row");
            zoom.appendChild(imgRow);

            const pkmnImg = document.createElement("img");
            pkmnImg.classList.add("big-pkmn");
            pkmnImg.src = "img/" + addLeadingZeros(pkmnSpcs.natdex);
            if (suffix) {
                pkmnImg.src += "-" + suffix;
            }
            pkmnImg.src += ".png";
            pkmnImg.alt = pkmnTitle;
            imgRow.appendChild(pkmnImg);

            const ballImg = document.createElement("img");
            ballImg.classList.add("ball");
            ballImg.src = `img/${ball}ball.png`;
            ballImg.alt = `${ball} ball`;
            imgRow.appendChild(ballImg);

            const zoomTitle = document.createElement("h2");
            zoomTitle.innerText = fullTitle;
            zoom.appendChild(zoomTitle);

            const colSet = document.createElement("div");
            colSet.classList.add("nav-row");
            zoom.appendChild(colSet);

            const pkmnFacts = document.createElement("div");
            pkmnFacts.classList.add("column");
            colSet.appendChild(pkmnFacts);

            pkmnFacts.appendChild(createZoomField("Natdex #:", pkmnSpcs.natdex));

            const typeField = document.createElement("div");
            typeField.classList.add("display-field");
            const label = document.createElement("span");
            label.innerText = "Types:";
            typeField.appendChild(label);
            const typeWrapper = document.createElement("span");
            typeField.appendChild(typeWrapper)
            pkmnSpcs.types.forEach(function(type){
                const typeDisp = document.createElement("span");
                typeDisp.classList.add("type", type);
                typeDisp.innerText = type.toUpperCase();
                typeWrapper.appendChild(typeDisp);
            });
            pkmnFacts.appendChild(typeField);

            pkmnFacts.appendChild(createZoomField("Evolution(s):", capitalize(pkmnSpcs.evo.join(", "))));

            pkmnFacts.appendChild(createZoomField("Egg cycles:", pkmnSpcs.cycles));

            const indvFacts = document.createElement("div");
            indvFacts.id = "indv-facts";
            indvFacts.dataset.id = id;
            indvFacts.classList.add("column");
            colSet.appendChild(indvFacts);

            indvFacts.appendChild(createZoomField("Eggs hatched:", pkmnIndv.eggs));

            indvFacts.appendChild(createZoomField("Shiny target:", yesNo(pkmnIndv.target)));

            let so = "no";
            if (pkmnIndv.final !== null) {
                so = pkmnIndv.final;
            }
            indvFacts.appendChild(createZoomField("Shiny obtained:", so));

            indvFacts.appendChild(createZoomField("5+ IVs", yesNo(pkmnIndv["5iv"])));

            indvFacts.appendChild(createZoomField("Nature:", capitalize(pkmnIndv.nature)));

            let hiddenTitle = `Hidden ability:`;
            if (pkmnSpcs.hidden !== null) {
                hiddenTitle += `<br>(${capitalize(pkmnSpcs.hidden)})`;
            } else {
                hiddenTitle += `<br>(N/A)`;
            }
            indvFacts.appendChild(createZoomField(hiddenTitle, yesNo(pkmnIndv.ha)));

            const eggMoveBox = document.createElement("div");
            eggMoveBox.id = "eggmoves";
            zoom.appendChild(eggMoveBox);

            const eggTitle = document.createElement("span");
            eggTitle.innerText = "Egg moves:";
            eggMoveBox.appendChild(eggTitle);

            const controls = document.createElement("div");
            controls.id = "zoom-controls";
            controls.classList.add("nav-row");
            zoom.appendChild(controls);

            const editBtn = document.createElement("button");
            editBtn.id = "edit";
            editBtn.classList.add("small-button");
            editBtn.title = "Edit Pokemon";
            const editSym = document.createElement("img");
            editSym.src = "img/edit.png";
            editSym.classList.add("symbol");
            editSym.alt = "pencil edit";
            editBtn.appendChild(editSym);
            controls.appendChild(editBtn);
            addHover(editBtn);

            const close = document.createElement("button");
            close.id = "cancel";
            close.classList.add("small-button");
            close.title = "close";
            const closeSym = document.createElement("img");
            closeSym.src = "img/x.png";
            closeSym.classList.add("symbol");
            closeSym.alt = "x";
            close.appendChild(closeSym);
            controls.appendChild(close);
            addHover(close);

            close.addEventListener("click", popdown);
            editBtn.addEventListener("click", function(){
                editPokemonDialog(pkmnIndv, pkmnSpcs)
            });

            popup(zoom);
            eggMoveBox.appendChild(displayEggmoves());
            
        }

        // listener
        const cardList = document.getElementsByClassName("card");
        for (card of cardList) {
            card.addEventListener("click", function(e){
                zoomIn(e);
            });
        }

        // adds tallies and form functionality
        const tallyURL = "data/" + userInfo.name + ".html";
        function insertTallies() {
            fetch(tallyURL, {cache: "no-store"})
            .then(response => response.text())
            .then(html => {
                const table = document.getElementById("stats");
                table.innerHTML += html;
                apriTotals();

                // read current tallies
                let since = parseInt(document.getElementById("since").innerText);
                const queue = document.getElementById("queue");
                let queueEggs = parseInt(queue.innerText);
                let queuePokemon = queue.dataset.pkmn;

                // add eggs to hatching queue
                // part 2: change the data
                function addQueue() {

                    const num = parseInt(document.getElementById("add-q-eggs").value);
                    const pkmn = document.getElementById("add-q-pkmn").value;
                    if (num !== "" && pkmn !== "SELECT:") {
                        queueEggs = num;
                        queuePokemon = pkmn;
                        queue.innerText = num;
                        queue.dataset.pkmn = pkmn;
                    }
                    popdown();
                } 

                // add eggs to hatching queue
                // part 1: gather input
                function addQueueDialog() {

                    const Qcheck = document.createElement("div");
                    Qcheck.id = "zoom";

                    const Qtitle = document.createElement("h2");
                    Qtitle.innerText = "Add pokemon eggs to hatching queue";
                    Qcheck.appendChild(Qtitle);

                    Qcheck.appendChild(createFormField("Eggs", "add-q-eggs", "number"));

                    Qcheck.appendChild(createDrop("Pokemon", "add-q-pkmn", pkmnList));

                    if (queueEggs > 0) {
                        const overwrite = document.createElement("p");
                        overwrite.innerText = "Overwrite queue?";
                        Qcheck.appendChild(overwrite);
                    }

                    const controlRow = document.createElement("div");
                    controlRow.classList.add("nav-row");
                    Qcheck.appendChild(controlRow);
                    confirmOrDeny(controlRow, addQueue);

                    popup(Qcheck);

                }

                const addButton = document.getElementById("add-queue");
                addButton.addEventListener("click", addQueueDialog);

                // confirm queue hatched
                // part 2: change the data
                function confirmHatch() {
                    since += queueEggs;
                    const pkmnArr = queuePokemon.split("-");
                    const ball = pkmnArr[0];
                    const name = pkmnArr[1];
                    let suffix = null;
                    if (pkmnArr[2]) {
                        suffix = "-" + pkmnArr[2];
                    }
                    json.forEach(function(pkmn){
                        if (pkmn.pokemon.name === name && pkmn.ball === ball && pkmn.pokemon['form-suffix'] === suffix) {
                            pkmn.eggs = parseInt(pkmn.eggs) + parseInt(queueEggs);
                        }
                    });
                    queueEggs = 0;

                    queue.innerText = queueEggs;
                    document.getElementById("since").innerText = since;
                    popdown();
                    displayCards(json);
                    apriTotals();

                }

                // confirm queue hatched
                // part 1: gather input
                function confirmHatchDialog() {

                    const confirm = document.createElement("div");
                    confirm.classList.add("popup");
                    const text = document.createElement("p");
                    text.innerText = "Confirm queue eggs as hatched?";
                    confirm.appendChild(text);

                    confirmOrDeny(confirm, confirmHatch);
                    popup(confirm);

                }
                const checkButton = document.getElementById("queue-hatched");
                checkButton.addEventListener("click", confirmHatchDialog);

                // announce shiny
                // part 2: change the data
                function confirmShiny() {
                    const queuePokemon = document.getElementById("queue").dataset.pkmn;
                    const pkmnArr = queuePokemon.split("-");
                    const ball = pkmnArr[0];
                    const name = pkmnArr[1];
                    let suffix = null;
                    if (pkmnArr[2]) {
                        suffix = "-" + pkmnArr[2];
                    }
                    const date = new Date();
                    const dateStr = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                    json.forEach(function(pkmn){
                        if (pkmn.pokemon.name === name && pkmn.ball === ball && pkmn.pokemon['form-suffix'] === suffix) {
                            pkmn.final = dateStr;
                        }
                    });

                    since = 0;
                    document.getElementById("since").innerText = since;

                    popdown();
                    displayCards(json);
                    apriTotals();

                }

                // announce shiny
                // part 1: gather input
                function confirmShinyDialog() {
                    const confirm = document.createElement("div");
                    confirm.classList.add("popup");
                    const text = document.createElement("p");
                    const pokemon = document.getElementById("queue").dataset.pkmn;
                    const pokemonTitle = capitalize(pokemon.replace(/-/g, " "));
                    text.innerText = `Did you hatch a shiny ${pokemonTitle}?`;
                    confirm.appendChild(text);

                    confirmOrDeny(confirm, confirmShiny);
                    popup(confirm);
                }
                const shinyButton = document.getElementById("shiny-hatched");
                shinyButton.addEventListener("click", confirmShinyDialog);

                // save your progress
                // part 2: send data to server
                function save() {
                    const fieldQueueEggs = document.getElementById("in-queue-eggs");
                    const fieldQueuePokemon = document.getElementById("in-queue-pokemon");
                    const fieldSince = document.getElementById("in-since-last");
                    const fieldJSON = document.getElementById("in-json");
                    const fieldUser = document.getElementById("in-user");
                    const fieldPass = document.getElementById("in-password");
                    const otherPass = document.getElementById("password");

                    fieldQueueEggs.value = queueEggs;
                    fieldQueuePokemon.value = queuePokemon;
                    fieldSince.value = since;
                    fieldJSON.value = JSON.stringify(json);
                    fieldUser.value = userInfo.name;
                    fieldPass.value = otherPass.value;

                    const submit = document.getElementById("submit");
                    submit.click();
                    popdown();
                }

                // save your progress
                // part 1: gather input
                function saveDialog() {
                    const box = document.createElement("div");
                    box.classList.add("popup");

                    const text = document.createElement("p");
                    text.innerText = "Enter your password to save:";
                    box.appendChild(text);

                    const field = document.createElement("input");
                    field.type = "password";
                    field.id = "password";
                    field.name = "password";
                    box.appendChild(field);

                    confirmOrDeny(box, save);
                    popup(box);
                }

                const saveButton = document.getElementById("save");
                saveButton.addEventListener("click", saveDialog);
            })
        }
        insertTallies();
        displayCards(json);
    });

});

};

// initial activation
getPossible();

})();