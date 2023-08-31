(function(){

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const ballTypes = ["beast", "dream", "fast", "friend", "heavy", "level", "love", "lure", "moon", "safari", "sport"];

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

    const sizeButton = document.getElementById("size-toggle");
    function toggleSize() {
        console.log("toggling");
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

    fetch("aprimon.json", {cache: "no-store"})
    .then(response => response.json())
    .then(json => {

        let activeSort = json;
        let pkmnList = ["SELECT:"];

        // function that renders cards from a json
        function displayCards(data) {

            const cardBox = document.getElementById("card-rows");
            cardBox.innerHTML = "";

            data.forEach(function(pkmn){

                let title = "hup";
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
                if (pkmn.pokemon["form-suffix"] === null) {
                    image.src = `img/${addLeadingZeros(pkmn.pokemon.natdex)}.png`;
                } else {
                    image.src = `img/${addLeadingZeros(pkmn.pokemon.natdex)}${pkmn.pokemon["form-suffix"]}.png`;
                    id += pkmn.pokemon["form-suffix"];
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
                eggCount += pkmn.eggs;
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

        function popdown() {
            const overlay = document.getElementById("overlay");
            overlay.remove();
        }

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
            Qicon.addEventListener("mouseover", function(e){
                hoverIcon(e);
            });
            Qicon.addEventListener("mouseleave", function(e){
                hoverIcon(e);
            });
            Qicon.addEventListener("focusin", function(e){
                hoverIcon(e);
            });
            Qicon.addEventListener("focusout", function(e){
                hoverIcon(e);
            });

            const Qcancel = document.createElement("button");
            Qcancel.id = "cancel-queue";
            Qcancel.classList.add("small-button");
            Qcheck.appendChild(Qcancel);
            Qcancel.addEventListener("click", popdown);

            const Qx = document.createElement("img");
            Qx.src = "img/x.png";
            Qx.classList.add("symbol");
            Qcancel.appendChild(Qx);
            Qx.addEventListener("mouseover", function(e){
                hoverIcon(e);
            });
            Qx.addEventListener("mouseleave", function(e){
                hoverIcon(e);
            });
            Qx.addEventListener("focusin", function(e){
                hoverIcon(e);
            });
            Qx.addEventListener("focusout", function(e){
                hoverIcon(e);
            });
        }

        function addPokemon() {

            const pkmnName = document.getElementById("name").value;
            let pkmnForm = document.getElementById("form").value;
            const pkmnNum = parseInt(document.getElementById("natdex").value);
            const pkmnBall = document.getElementById("ball").value;
            let pkmnNature = document.getElementById("nature").value;
            const ivCheck = document.getElementById("five-iv").checked;
            const haCheck = document.getElementById("hidden-ab").checked;
            const targetCheck = document.getElementById("target-pk").checked;

            if (pkmnName === "" || isNaN(pkmnNum) ) {
                alert("Pokemon name and number required.");
                popdown();
                return;
            }

            let pkmnSuffix;
            if (pkmnForm == "") {
                pkmnForm = null;
                pkmnSuffix = null;
            } else {
                pkmnSuffix = "-" + pkmnForm.split("")[0]
            }

            if (pkmnNature == "") {
                pkmnNature = "random";
            }

            const entry = {
                "pokemon": {
                    "name": pkmnName.toLowerCase(),
                    "natdex": pkmnNum,
                    "form": pkmnForm,
                    "form-suffix": pkmnSuffix
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

        function createFormField(name, type) {
            const nameField = document.createElement("div");
            nameField.classList.add("field");

            const nameLabel = document.createElement("label");
            nameLabel.setAttribute("for", name);
            nameLabel.innerText = capitalize(name) + ":";
            nameField.appendChild(nameLabel);

            const nameEntry = document.createElement("input");
            nameEntry.name = name;
            nameEntry.id = name;
            nameEntry.type = type;
            nameField.appendChild(nameEntry);

            return nameField;
        }

        function createCheck(title, id, location) {
            const label = document.createElement("label");
            label.setAttribute("for", id);
            label.innerText = title;
            location.appendChild(label);

            const check = document.createElement("input");
            check.type = "checkbox";
            check.name = id;
            check.id = id;
            location.appendChild(check);
        }

        function addPokemonDialog() {

            const box = document.createElement("div");
            
            const form = document.createElement("form");
            box.appendChild(form);

            form.appendChild(createFormField("name", "text"));
            form.appendChild(createFormField("form", "text"));
            form.appendChild(createFormField("natdex", "number"));

            const ballField = document.createElement("div");
            ballField.classList.add("field");
            form.appendChild(ballField);

            const ballLabel = document.createElement("label");
            ballLabel.setAttribute("for", "ball");
            ballLabel.innerText = "Ball:";
            ballField.appendChild(ballLabel);

            const ballDrop = document.createElement("select");
            ballDrop.name = "ball";
            ballDrop.id = "ball";
            ballField.appendChild(ballDrop);

            ballTypes.forEach(function(ball){
                const option = document.createElement("option");
                option.value = ball;
                option.innerText = capitalize(ball) + " ball";
                ballDrop.appendChild(option);
            });

            form.appendChild(createFormField("nature", "text"));

            const checksRow = document.createElement("div");
            form.appendChild(checksRow);

            createCheck("5+ IVs?", "five-iv", checksRow);
            createCheck("Hidden ability?", "hidden-ab", checksRow);
            createCheck("Shiny hunting target?", "target-pk", checksRow);

            const decision = document.createElement("div");
            decision.classList.add("nav-row");
            confirmOrDeny(decision, addPokemon);
            box.appendChild(decision);

            popup(box);

        }

        const addPkmnBtn = document.getElementById("add-pkmn");
        addPkmnBtn.addEventListener("click", addPokemonDialog);

        // adds tallies and form functionality
        function insertTallies() {
            fetch("tallies.html", {cache: "no-store"})
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

                // change tallies
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

                // add to queue
                function addQueueDialog() {

                    const Qcheck = document.createElement("div");
                    Qcheck.classList.add("popup");

                    const Qnumber = document.createElement("input");
                    Qnumber.type = "number";
                    Qnumber.id = "add-q-eggs";
                    Qnumber.name = "add-q-eggs";
                    Qcheck.appendChild(Qnumber);

                    const Qdropdown = document.createElement("select");
                    Qdropdown.name = "add-q-pkmn";
                    Qdropdown.id = "add-q-pkmn";
                    Qcheck.appendChild(Qdropdown);

                    pkmnList.forEach(function(pkmn){
                        const option = document.createElement("option");
                        option.value = pkmn;
                        option.innerText = pkmn;
                        Qdropdown.appendChild(option);
                    });

                    if (queueEggs > 0) {
                        const overwrite = document.createElement("p");
                        overwrite.innerText = "Overwrite queue?";
                        Qcheck.appendChild(overwrite);
                    }

                    confirmOrDeny(Qcheck, addQueue);

                    popup(Qcheck);

                }

                const addButton = document.getElementById("add-queue");
                addButton.addEventListener("click", addQueueDialog);

                // confirm queue hatched
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
                            pkmn.eggs += queueEggs;
                        }
                    });
                    queueEggs = 0;

                    queue.innerText = queueEggs;
                    document.getElementById("since").innerText = since;
                    popdown();
                    displayCards(json);
                    apriTotals();
                }

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
                    console.log(date);
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
                function save() {
                    const fieldQueueEggs = document.getElementById("in-queue-eggs");
                    const fieldQueuePokemon = document.getElementById("in-queue-pokemon");
                    const fieldSince = document.getElementById("in-since-last");
                    const fieldJSON = document.getElementById("in-json");

                    fieldQueueEggs.value = queueEggs;
                    fieldQueuePokemon.value = queuePokemon;
                    fieldSince.value = since;
                    fieldJSON.value = JSON.stringify(json);

                    const submit = document.getElementById("submit");
                    submit.click();
                }

                const saveButton = document.getElementById("save");
                saveButton.addEventListener("click", save);
            })
        }

        // initial activation
        insertTallies();
        displayCards(json);

    });

})();