var stats = [];
var shortLoopFraction = 24;

var currentTech = ["job"];
var boughtTech = [];
var currentHours = [];
var debug = true;
var booksRead = 40;

window.onload = function start() {
    UpdateTech();
    UpdateHours();
    AddStat("Day");
    AddStat("Money");
    const interval = setInterval(shortLoop, 1000 / shortLoopFraction);
};

function UpdateTech() {
    techDiv.innerHTML = currentTech.length < 1 ? '&nbsp;' : '';
    for (i in currentTech) {
        techId = currentTech[i];
        tech = allTech[techId];
        var newButton = document.createElement("Button");

        newButton.innerHTML = tech.name;
        costs = tech.cost;
        for (cost in costs) {
            newButton.innerHTML += "<br /> " + cost + ": " + costs[cost];
        }
        newButton.id = techId;
        newButton.onclick = TechClicked;
        techDiv.appendChild(newButton);
    }
}

function UpdateHours() {
    hoursDiv.innerHTML = currentHours.length < 1 ? '&nbsp;' : '';
    for (actName in currentHours) {
        var div = document.createElement("Div");
        actTime = currentHours[actName];
        //label
        var activityLabel = document.createElement("Label");
        activityLabel.innerHTML = actName + ": " + actTime;
        activityLabel.id = actName + "Lbl";
        div.appendChild(activityLabel);
        //down button
        var downButton = document.createElement("Button");
        downButton.innerHTML = "<";
        downButton.id = "down" + actName;
        downButton.onclick = HoursClicked;
        div.appendChild(downButton);
        //up button
        var upButton = document.createElement("Button");
        upButton.innerHTML = ">";
        upButton.id = "up" + actName;
        upButton.onclick = HoursClicked;
        div.appendChild(upButton);
        hoursDiv.appendChild(div);
    }
}

function shortLoop() {
    stats["Day"] += 0.01;
    worktime = currentHours["Work"];
    if (worktime > 0) {
        moremoney = worktime * (boughtTech.includes("workEfficiency") ? 0.2 : 0.1);
        stats["Money"] += moremoney;
    }
    shoptime = currentHours["Shop"];
    bookcost = 100;
    if (shoptime > 0 && stats["Money"] > 0) {
        stats["Money"] -= shoptime;
        stats["Books"] += shoptime / bookcost;
    }
    readingtime = currentHours["Reading"];
    if (readingtime > 0 && stats["Books"] > 0) {
        readingSpeed = boughtTech.includes("readingEfficiency") ? 0.01 : 0.005;
        knowledgeRatio = 2;
        stats["Books"] -= readingtime * readingSpeed;
        booksRead += readingtime * readingSpeed;
        if (boughtTech.includes("bookReselling")) {
            stats["Money"] += readingtime * readingSpeed * bookcost / 2;
        }
        stats["Knowledge"] += readingtime * readingSpeed * knowledgeRatio;
    }
    updateStats();

    if (booksRead > 50 && !boughtTech.includes('mysteriousBook') && !currentTech.includes('mysteriousBook')) {
        PrintInfo("You've found a mysterious book written in very old English");
        currentTech.push('mysteriousBook');
        UpdateTech();
    }
}


function updateStats() {
    for (stat in stats) {
        div = document.getElementById("stat" + stat);
        div.innerText = stat + ": " + parseInt(stats[stat]);
    }
}

function AddStat(stat) {
    stats[stat] = 0;
    var div = document.createElement("Div");
    div.class = "stat"; 
    div.id = "stat" + stat;
    div.innerText = stat + ": " + stats[stat];
    statsDiv.appendChild(div);
}

function HoursClicked() {
    id = event.srcElement.id;
    if (id.startsWith("up")) {
        id = id.substring(2);
        if (HoursTotal() < 16) {
            currentHours[id]++;
        }
    }
    else if (id.startsWith("down")){
        id = id.substring(4);
        if (currentHours[id] > 0) {
            currentHours[id]--;
        }
    }
    UpdateHours();
}

function HoursTotal() {
    sum = 0;
    for (hour in currentHours) {
        sum += currentHours[hour];
    }
    return sum;
}


function TechClicked() {
    id = event.srcElement.id;
    tech = allTech[id];
    costs = tech.cost;
    if (!hasStats(costs)) return;

    for (cost in costs) {
        stats[cost] -= costs[cost];
    }
    RemoveTech(id);
    boughtTech.push(id);

    if (tech.unlocks) {
        for (t of tech.unlocks) {
            currentTech.push(t);
        }
    }
    PrintInfo(tech.output);

    switch (id) {
        case 'job':
            currentHours["Work"] = 8;
            UpdateHours();
            break;
        case 'shopping':
            AddStat("Books");
            if(debug) stats["Books"] = 10;
            currentHours["Shop"] = 0;
            UpdateHours();
            break;
        case 'reading':
            AddStat("Knowledge");
            currentHours["Reading"] = 0;
            if (debug) stats["Knowledge"] = 100;
            UpdateHours();
            break;
        default:
    }

    UpdateTech();
}

function hasStats(costs) {
    for (cost in costs) {
        if (stats[cost] < costs[cost]) {
            return false;
        }
    }
    return true;
}

function RemoveTech(id) {
    var index = currentTech.indexOf(id);
    if (index !== -1) {
        currentTech.splice(index, 1);
    }
}

function PrintInfo(text) {
    if (!text) return;
    info.innerHTML += "<br />" + text;
}
