(function(){

    // months, for hatch dates
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // types of pokeball
    const ballTypes = ["beast", "dream", "fast", "friend", "heavy", "level", "love", "lure", "moon", "safari", "sport"];

    // natures
    const natures = ["random", "hardy", "lonely", "adamant", "naughty", "brave",
                    "bold", "docile", "impish", "lax", "relaxed",
                    "modest", "mild", "bashful", "rash", "quiet",
                    "calm", "gentle", "careful", "quirky", "sassy",
                    "timid", "hasty", "jolly", "naive", "serious"];

    // site users
    // passwords stored elsewhere
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

    // if searching for a user, find that user's info
    // otherwise, use mine
    if (qString.user) {
        userInfo = users.filter(function(user){
            return user.name === qString.user;
        })[0];
        if (userInfo === undefined) {
            userInfo = users[0];
        }
    }

    // capitalize the first letter of each word in a string
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

    // change the header to display a username
    function displayUser() {
        const nameSpace = document.getElementById("user-display");
        nameSpace.innerText = capitalize(userInfo.name) + "'s ";
    }
    displayUser();

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

        // find where the cards are; the styling is based on the "compact" class for this element
        const cardRows = document.getElementById("card-rows");

        // find the expand / collapse button image, to be changed when toggled
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

    // if the user prefers collapsed cards, collapse them automatically
    // this can be activated before the cards are generated, since the styling is applied to the container
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

        // pokemon list is used for the dropdown when adding eggs to queue
        let pkmnList = ["SELECT:"];

        // function that renders cards based on a json input (user data)
        function displayPokemon(data) {

            // find the place where cards are displayed and wipe it
            const cardBox = document.getElementById("card-rows");
            cardBox.innerHTML = "";

            // loop through the data
            data.forEach(function(pkmn){

                // title variable is used for the header and alt text
                let title;
                if (pkmn.pokemon.form === null) {
                    title = capitalize(pkmn.pokemon.name);
                } else {
                    title = capitalize(`${pkmn.pokemon.form} ${pkmn.pokemon.name}`);
                }

                // create the card div
                const card = document.createElement("div");
                card.classList.add("box", "card");

                // final is the date of shiny hatching; if null, no shiny yet
                // shiny pokemon get brighter cards; the same styling is used for active buttons
                if (pkmn.final !== null) {
                    card.classList.add("shiny");

                    // the zoom in function is a popup with additional info
                    card.addEventListener("click", function(e){
                        zoomIn(e);
                    });
                
                // if the user doesn't have the pokemon yet, but it's on their wishlist
                // then there's no additional information, so the hover function is irrelevant
                // wishlist styling removes hover and makes the card paler
                } else if (pkmn.wishlist === true) {
                    card.classList.add("wishlist");
                } else {

                    // if the pokemon is not shiny or wishlist, add event handler
                    card.addEventListener("click", function(e){
                        zoomIn(e);
                    });
                }

                // id is important here
                let id = pkmn.ball + "-" + pkmn.pokemon.name;
                cardBox.appendChild(card);

                // image of the pokemon
                const image = document.createElement("img");
                image.classList.add("pokemon");
                
                // if the pokemon has a form, their image with have that form as a hyphenated suffix
                // ex 570.png is regular gen5 zorua, 570-h.png is hisuian zorua
                // all images are in the same folder for now
                if (pkmn.pokemon["form"] === null) {
                    image.src = `img/${addLeadingZeros(pkmn.pokemon.natdex)}.png`;
                } else {
                    let suffix = "-" + pkmn.pokemon.form.split("")[0];
                    image.src = `img/${addLeadingZeros(pkmn.pokemon.natdex)}${suffix}.png`;
                    id += suffix;
                }

                // image details, card id
                image.alt = title;
                card.appendChild(image);
                card.id = id;

                // add pokemon to possible queue list if they have been obtained
                if (pkmn.wishlist !== true) {
                    pkmnList.push(id);
                }
                
                // ball icon
                const ball = document.createElement("img");
                ball.classList.add("ball");
                ball.src = `img/${pkmn.ball}ball.png`;
                ball.alt = pkmn.ball + " ball";
                card.appendChild(ball);

                // header of card
                const cardTitle = document.createElement("h3");
                cardTitle.innerText = title;
                card.appendChild(cardTitle);

                // row with 3 toggles and an egg count, bottom of card
                const smallRow = document.createElement("div");
                smallRow.classList.add("small-row");
                card.appendChild(smallRow);

                // whether the pokemon has high IVs (good base stats)
                const ivs = document.createElement("p");
                ivs.classList.add("info");
                ivs.innerText = "5+";
                ivs.title = "5+ IVs";
                if (pkmn["5iv"] === false) {
                    ivs.classList.add("missing");
                }
                smallRow.appendChild(ivs);

                // whether the pokemon has its hidden ability
                const ha = document.createElement("p");
                ha.classList.add("info");
                ha.innerText = "HA";
                ha.title = "Hidden ability";
                if (pkmn.ha === false) {
                    ha.classList.add("missing");

                // some pokemon don't have a possible hidden ability; in that case it shouldn't be displayed
                } else if (pkmn.ha === null) {
                    ha.classList.add("hidden");
                }
                smallRow.appendChild(ha);

                // in order to align the sparkle symbol, it needs a container element
                const sparkleWrap = document.createElement("div");
                sparkleWrap.classList.add("info", "missing");

                // if the user is not trying for a shiny, don't display the toggle
                if (pkmn.target === false) {
                    sparkleWrap.classList.add("hidden");
                }
                smallRow.appendChild(sparkleWrap);

                // the icon itself can be active or inactive / greyed out
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

                // number of eggs hatched, marked as "missing" if the user isn't planning to hatch them until they get a shiny
                const count = document.createElement("p");
                count.classList.add("info");
                count.title = "eggs hatched";
                count.innerText = pkmn.eggs;
                if (pkmn.target === false) {
                    count.classList.add("missing");
                }
                smallRow.appendChild(count);

            // end of foreach loop
            });
        }

        // function that calculates and displays stats
        function apriTotals() {

            // number of aprimon varieties the user has
            const apriTotal = document.getElementById("apri-total");
            const counter = activeSort.filter(function(pkmn){
                return pkmn.wishlist !== true;
            })
            apriTotal.innerText = counter.length;

            // tally up the number of eggs hatched and shinies obtained
            const shinies = document.getElementById("shinies");
            const eggs = document.getElementById("eggs");
            let shinyCount = 0;
            let eggCount = 0;
            activeSort.forEach(function(pkmn){
                if (pkmn.final !== null) {
                    shinyCount++;
                }

                // remember to parse as int
                eggCount += parseInt(pkmn.eggs);
            });

            // display the tallies
            shinies.innerText = shinyCount;
            eggs.innerText = eggCount;

            // the standard shiny ratio is 1:512
            // the ratio here is displayed in the same format for ease of evaluation
            const ratioDisplay = document.getElementById("ratio");
            const ratio = eggCount / shinyCount;

            // it doesn't need to be super precise
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

            // target id is the sorting method
            const id = button.id;

            // alphabetical by pokemon name
            if (id === "alpha") {
                activeSort = activeSort.sort(function(a, b){
                    let x = a.pokemon.name;
                    let y = b.pokemon.name;
                    if (x < y) { return -1; }
                    if (x > y) { return 1; }
                    return 0;
                });

            // numerically by national dex number (pokemon species id)
            } else if (id === "numer") {
                activeSort = activeSort.sort(function(a, b){
                    return a.pokemon.natdex - b.pokemon.natdex;
                });

            // group pokemon in the same ball together, sort ball groups alphabetically
            } else if (id === "balls") {
                activeSort = activeSort.sort(function(a, b){
                    let x = a.ball;
                    let y = b.ball;
                    if (x < y) { return -1; }
                    if (x > y) { return 1; }
                    return 0;
                });

            // show pokemon the user is trying to get shinies of first
            } else if (id === "target") {
                activeSort = activeSort.sort(function(a, b){
                    return b.target - a.target;
                });

            // show pokemon the user has shinies of first
            // sorted by most recent first
            } else if (id === "shiny") {
                activeSort = activeSort.sort(function(a, b){
                    return new Date(b.final) - new Date(a.final);
                });

            // show pokemon with hidden ability first
            } else if (id === "ha") {
                activeSort = activeSort.sort(function(a, b){
                    return b.ha - a.ha;
                });
            
            // show pokemon with 5+ ivs first
            } else if (id === "five") {
                activeSort = activeSort.sort(function(a, b){
                    return b["5iv"] - a["5iv"];
                });

            // from most to least eggs hatched
            } else if (id === "count") {
                activeSort = activeSort.sort(function(a, b){
                    return b.eggs - a.eggs;
                });
            }

            // once the data has been sorted, re-generate the visuals
            displayCards(activeSort);

            // add the active styling to the active button
            for (const btn of sortSet) {
                btn.classList.remove("shiny");
            }
            button.classList.add("shiny");

            // sorting the data resets the filtering to display all
            // so the active button of the filtering subgroup needs to be changed
            for (const btn of filterSet) {
                btn.classList.remove("shiny");
                if (btn.id === "all") {
                    btn.classList.add("shiny");
                }
            }
            
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
        // currently only sorts by pokeball used
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

            // filteredJSON can't be allowed to overwrite activeSort, since filtering is temporary
            let filteredJSON;
            const id = button.id;

            // filter data by the id                  
            filteredJSON = activeSort.filter(function(pkmn){
                return pkmn.ball === id;
            });

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

        // wishlist button toggles display of wishlist pokemon
        // wishlist pokemon are never displayed alongside the collection
        const wishButton = document.getElementById("wish");
        function displayWishlist() {
            if (!wishButton.classList.contains("shiny")){
                const data = activeSort.filter(function(pkmn){
                    return pkmn.wishlist === true;
                });
                wishButton.classList.add("shiny");
                displayPokemon(data);
            } else {
                wishButton.classList.remove("shiny");
                displayCards(activeSort);
            }
        } 
        wishButton.addEventListener("click", displayWishlist);

        // displayPokemon was originally displayCards
        // but needed to be adjusted when wishlist cards were added
        function displayCards(input) {
            const noWish = input.filter(function(pkmn){
                return !pkmn.wishlist || pkmn.wishlist === false;
            });
            wishButton.classList.remove("shiny");
            displayPokemon(noWish);
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
            

            // bf = browse filter
            const bf = {};

            // each button is a game or gen in which specific pokemon may have been included
            // clicking them toggles through "include pokemon from this gen" "exclude" "either way"
            // this information is passed by the styling class
            const buttons = document.getElementsByClassName("browse-button");
            for (btn of buttons) {
                if (btn.classList.contains("include")) {
                    bf[btn.id] = true;
                } else if (btn.classList.contains("exclude")) {
                    bf[btn.id] = false;
                } else {
                    bf[btn.id] = null;
                }
            }

            // possible is all the pokemon available in gen9
            let filteredPossible = possible.filter(function(pkmn){

                // include them by default
                let check = true;

                // for each game
                for (game in bf) {

                    // if we're not checking for it, leave check alone
                    if (bf[game] === null) {
                        check = true;
                    
                    // if we are checking for it, make sure it matches
                    // this will catch both true or both false
                    } else if (bf[game] === pkmn[game]) {
                        check = true;

                    // if one is true and the other is false, don't include the pokemon
                    } else {
                        check = false;

                        // break the loop: it doesn't matter if the pokemon passes other checks
                        break;
                    }
                }

                // return check to the filter
                return check;
            });

            // if the "all" button is checked, overwrite the filter with the full list
            if (bf["all-possible"] === true) {
                filteredPossible = possible;
            }
 
            // find and empty the card container
            const cardRow = document.getElementById("browse-row");
            cardRow.innerHTML = "";

            // for each pokemon that passed the check
            filteredPossible.forEach(function(pkmn){
                
                // i don't think id is used, but it matches the id format of the collection cards
                // title is for the alt text
                let id;
                let title;
                if (pkmn.form) {
                    id = pkmn.form + "-" + pkmn.name;
                    title = capitalize(pkmn.form + " " + pkmn.name);
                } else {
                    id = pkmn.name;
                    title = capitalize(pkmn.name);
                }

                // create a very simple tile with the pokemon's image
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

                // add the tile to the container
                card.appendChild(image);
                cardRow.appendChild(card);
            })

        }

        // changes the state of the browse buttons
        function changeBrowseFilter(e) {
            const target = e.target;

            // if the all button was clicked, strip active classes from the other buttons
            if (target.id === "all-possible" && !target.classList.contains("include")) {
                const browseBtns = document.getElementsByClassName("browse-button");
                for (btn of browseBtns) {
                    btn.classList.remove("include");
                    btn.classList.remove("exclude");
                }
                target.classList.add("include");

            // otherwise, strip active classes from the all button
            } else {
                const viewAll = document.getElementById("all-possible");
                viewAll.classList.remove("include");

                // flip through states: exclude, neutral, include
                if (target.classList.contains("include")) {
                    target.classList.remove("include");
                    target.classList.add("exclude");
                } else if (target.classList.contains("exclude")) {
                    target.classList.remove("exclude");
                } else {
                    target.classList.add("include");
                }
            }

            // once the buttons are all in their new states, activate the display function
            displayBrowse();
        }

        // opens the browsing popup
        function browseAprimon() {
            const browse = document.createElement("div");
            browse.id = "browse-display";

            // title
            const browseTitle = document.createElement("h2");
            browseTitle.innerText = "Browse Pokemon by generation(s) available";
            browse.appendChild(browseTitle);

            // container for buttons
            const browseControls = document.createElement("div");
            browseControls.classList.add("nav-row", "wide-row");
            browse.appendChild(browseControls);

            // four buttons
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

            // cancel button
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

            // container for tiles
            const cardRow = document.createElement("div");
            cardRow.classList.add("nav-row");
            cardRow.id = "browse-row";
            browse.appendChild(cardRow);

            // put the whole thing in a popup and call the function to populate it
            popup(browse);
            displayBrowse();

        }

        // event listener
        const browseBtn = document.getElementById("browse");
        browseBtn.addEventListener("click", browseAprimon);

        // adds a new aprimon to the user's collection
        // part 2: change the data
        function addPokemon() {

            // gather information from the form
            let pkmnName = document.getElementById("pokemon").value.toLowerCase();
            const pkmnBall = document.getElementById("ball").value;
            const pkmnNature = document.getElementById("nature").value;
            const ivCheck = document.getElementById("five-iv").checked;
            const haCheck = document.getElementById("hidden-ab").checked;
            const targetCheck = document.getElementById("target-pk").checked;
            const wishlistCheck = document.getElementById("wishlist").checked;

            // if the pokemon name is blank, give an error message and close the popup
            if (pkmnName === "") {
                alert("Pokemon name required.");
                popdown();
                return;
            }

            // pokemon names can be typed in or selected from the autofill menu
            // the autofill menu lists form first, then name: "Hisuian Zorua" etc
            let pkmnForm;
            if (pkmnName.includes(" ")) {
                pkmnArr = pkmnName.split(" ");
                pkmnForm = pkmnArr[0];
                pkmnName = pkmnArr[1];
            } else {
                pkmnForm = null;
            }

            // find the pokemon selected on the list of possible pokemon
            const pkmnDetails = possible.filter(function(pkmn){
                return (pkmn.name === pkmnName && pkmn.form === pkmnForm);
            })[0];

            // if it can't be found, give an error message and close the popup
            if (pkmnDetails === undefined) {
                alert("Pokemon not found.");
                popdown();
                return;
            }

            // format the data into an object
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
                "target": targetCheck,
                "wishlist": wishlistCheck
            };
            
            // add it to the working dataset, redraw the tiles, and close the popup
            json.push(entry);
            displayCards(json);
            popdown();

        }

        // creates and returns a standardized field with label and container
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

        // creates and returns a standardized checkbox with label and container
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

        // creates and returns a standardized drop-down menu with label and container
        function createDrop(title, id, list) {

            // this function was originally written for the list of balls
            // but it can take any kind of list
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
        // this only works for the pokemon text field currently
        function acceptSuggestion(e) {
            const sug = e.target.innerText;
            const field = document.getElementById("pokemon");
            field.value = sug;

            // hides the autoselect menu when a suggestion is chosen
            const location = document.getElementById("auto-suggest");
            location.classList.add("hidden");
        }

        // when the user is typing into a field, generate and display auto-complete suggestions
        // this event fires every time the field value changes
        function autoComplete(e, list) {

            // convert the value to lower case
            const value = e.target.value.toLowerCase();
            const length = value.length;

            // find the autofill container
            const location = document.getElementById("auto-suggest");

            // if a value is found
            if (value !== null && value !== "") {

                // wipe whatever was in the autofill menu before
                location.innerHTML = "";

                // the list is generated from "titles" of pokemon, which have correct capitalization
                // if the value, with upper case first letter, is found anywhere in the title
                // it passes the filter
                const suggests = list.filter(function(pkmn){
                    return pkmn.includes(capitalize(value));

                // sort the suggestions so that list items that start with the typed value
                // are ranked higher than list items that contain, but do not start with, the typed value
                // the reason mid-string matches are counted is to account for forms
                }).sort(function(a, b){
                    if (a.substr(0, length) === capitalize(value)) {
                        return -1;
                    } else {
                        return 1;
                    }
                });

                // add each suggestion to the autofill suggestions container
                suggests.forEach(function(sug){
                    const disp = document.createElement("div");
                    disp.classList.add("suggest");
                    disp.innerText = sug;
                    location.appendChild(disp);

                    // give them event listeners
                    disp.addEventListener("click", function(e){
                        acceptSuggestion(e);
                    });
                });

                // show the suggestions
                location.classList.remove("hidden");

            // if the typed value is a blank string or null
            // hide the suggestions container
            } else {
                location.classList.add("hidden");
            }

        }

        // adds a new aprimon to the user's collection
        // part 1: gather input
        function addPokemonDialog() {

            // create a popup window and style it
            const box = document.createElement("div");
            box.id = "zoom";

            // add a title
            const title = document.createElement("h2");
            title.innerText = "Add an aprimon to your collection";
            box.appendChild(title);
            
            // create the form
            const form = document.createElement("form");
            box.appendChild(form);

            // create the list of possible pokemon names
            const nameList = possible.map(function(pkmn){
                if (pkmn.form === null) {
                    return capitalize(pkmn.name);
                } else {
                    return capitalize(pkmn.form + " " + pkmn.name);
                }
            });

            // create it as a text field
            const nameField = createFormField("pokemon name", "pokemon", "text");
            nameField.id = "name-field";

            // make sure that pressing "enter" does not submit the form
            nameField.addEventListener("keydown", function(e){
                if (e.key === "Enter") {
                    e.preventDefault();
                    return false;
                  }
            });

            // add the autofill listener to the field
            nameField.addEventListener("input", function(e) {
                autoComplete(e, nameList);
            });

            // add it to the popup
            form.appendChild(nameField);

            // create the container for autofill suggestions
            const autoSuggest = document.createElement("div");
            autoSuggest.id = "auto-suggest";
            autoSuggest.classList.add("hidden");
            nameField.appendChild(autoSuggest);

            // create drop-down menus for the pokeball and nature
            form.appendChild(createDrop("pokeball", "ball", ballTypes));
            form.appendChild(createDrop("nature", "nature", natures));

            // container for the yes/no options
            const checksRow = document.createElement("div");
            form.appendChild(checksRow);

            // the yes/no options
            checksRow.appendChild(createCheck("5+ IVs?", "five-iv"));
            checksRow.appendChild(createCheck("Hidden ability?", "hidden-ab"));
            checksRow.appendChild(createCheck("Shiny target?", "target-pk"));
            checksRow.appendChild(createCheck("Wishlist only?", "wishlist"));

            // decision is the container for the confirm or cancel buttons
            const decision = document.createElement("div");
            decision.classList.add("nav-row");
            confirmOrDeny(decision, addPokemon);
            box.appendChild(decision);

            // once everything is in place, add the popup to the window
            popup(box);

        }

        // listener
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
            let inHidden = document.getElementById("hidden-ability").checked;
            const spcsPkmn = findPokemon()[1];
            if (spcsPkmn.hidden === null) {
                inHidden = null;
            }
            const inTarget = document.getElementById("shiny-target").checked;

            const indvPkmn = findPokemon()[0];
            
            indvPkmn.eggs = inHatched;
            indvPkmn.final = inShiny;
            indvPkmn["5iv"] = inFive;
            indvPkmn.nature = inNature;
            indvPkmn.ha = inHidden;
            indvPkmn.target = inTarget;

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
            const move = e.target.innerText.toLowerCase();
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

            let hiddenTitle = `Hidden ability:`;
            if (pkmnSpcs.hidden !== null) {
                hiddenTitle += `<br>(${capitalize(pkmnSpcs.hidden)})`;
            } else {
                hiddenTitle += `<br>(N/A)`;
            }
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
                        suffix = pkmnArr[2];
                    }

                    json.forEach(function(pkmn){
                        if (pkmn.pokemon.name === name && pkmn.ball === ball && (suffix === null || pkmn.pokemon.form.substr(0, 1) === suffix)) {
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
                        if (pkmn.pokemon.name === name && pkmn.ball === ball && (suffix === null || pkmn.pokemon.form.substr(0, 1) === suffix)) {
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