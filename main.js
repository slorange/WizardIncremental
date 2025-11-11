var stats = [];
var statsCap = [];
var shortLoopFraction = 24;

var currentTech = ["job"];
var boughtTech = [];
var currentHours = [];
var currentLab = [];
var timeWorked = 0;
var booksRead = 0;
var booksBought = 0;
var LabName = "Sub Basement";
var LabTotalSpace = 50;

var gameState = {
    lastDayChecked: -1,
    potionHours: 0,
    potionWisdom: 0,
}

var debug = true;
if (window.location.hostname.includes("github.io")) {
    debug = false;
}
else {
    booksRead = 40;
}

window.onload = function start() {
    UpdateTech();
    UpdateHours();
    InitStats();
    AddStat("Day");
    AddStat("Money");
    const interval = setInterval(shortLoop, 1000 / shortLoopFraction);
};

function UpdateTech() {
    techDiv.innerHTML = currentTech.length < 1 ? '&nbsp;' : '';
    for (techId of currentTech) {
        tech = allTech[techId];
        var newButton = document.createElement("Button");

        newButton.innerHTML = tech.name;
        costs = GetCosts(techId);
        for (cost in costs) {
            newButton.innerHTML += "<br /> " + cost + ": " + costs[cost];
        }
        newButton.id = techId;
        newButton.onclick = TechClicked;
        techDiv.appendChild(newButton);
    }
}

function GetCosts(techId) {
    ret = [];
    tech = allTech[techId];
    bought = boughtTech[techId] || 0;

    costs = tech.cost;
    for (cost in costs) {
        ret[cost] = parseInt(costs[cost] * Math.pow(1.3, bought));
    }
    return ret;
}

function UpdateHours() {
    hoursDiv.innerHTML = currentHours.length < 1 ? '&nbsp;' : '';
    for (actName in currentHours) {
        var div = document.createElement("Div");
        actTime = currentHours[actName];
        //label text
        var nameLabel = document.createElement("span");
        nameLabel.className = "activity-name";
        nameLabel.innerText = actName + ":";
        div.appendChild(nameLabel);
        //value text
        var valueLabel = document.createElement("span");
        valueLabel.className = "activity-value";
        valueLabel.id = actName + "Lbl";
        valueLabel.innerText = actTime;
        div.appendChild(valueLabel);
        //down button
        var downButton = document.createElement("Button");
        downButton.innerHTML = "<";
        downButton.id = "down" + actName;
        downButton.onclick = HoursClicked;
        div.appendChild(downButton);
        //up button
        var upButton = document.createElement("Button");
        upButton.innerHTML = ">";
        upButton.id = "upup" + actName;
        upButton.onclick = HoursClicked;
        div.appendChild(upButton);
        hoursDiv.appendChild(div);
    }
}


function shortLoop() {
    stats["Day"] += 0.01;

    wisdomMult = 1;
    if (boughtTech['wisdomTheory']) {
        stats["Wisdom"] = stats["Books"] / 10 * gameState.potionWisdom;
        wisdomMult = 1 + ln(stats["Wisdom"]/10+1);
    }

    worktime = currentHours["Work"];
    if (worktime > 0) {
        timeWorked += worktime;
        workEfficiency = 0.1 + 0.1 * (boughtTech["workEfficiency"] || 0);
        moremoney = worktime * workEfficiency * wisdomMult;
        stats["Money"] += moremoney;
    }
    shoptime = currentHours["Shop"] * 0.01;
    bookcost = 100, vialcost = 100, ingredientcost = 100;
    if (shoptime > 0 && stats["Money"] > 0) {
        if (boughtTech["employeeDiscount"]) bookcost *= 0.75;
        if (boughtTech["customerRewards"]) bookcost *= 0.85;
        if (boughtTech["customerRewards2"]) bookcost *= 0.85;
        if (boughtTech["customerRewards3"]) bookcost *= 0.85;
        if (boughtTech["customerRewards4"]) bookcost *= 0.85;
        stats["Money"] -= shoptime * bookcost;
        booksBought += shoptime * wisdomMult;
        stats["Books"] += shoptime * wisdomMult;
        if ("Vials" in stats) {
            stats["Vials"] += shoptime * wisdomMult;
        }
        if ("Potion Ingredients" in stats) {
            stats["Potion Ingredients"] += shoptime * wisdomMult;
        }
    }
    readingtime = currentHours["Reading"];
    if (readingtime > 0 && stats["Books"] > 0) {
        readingSpeed = 0.005 + 0.005 * (boughtTech["readingEfficiency"] || 0);
        knowledgeRatio = 2;
        stats["Books"] -= readingtime * readingSpeed;
        booksRead += readingtime * readingSpeed;
        if (boughtTech["bookReselling"]) {
            stats["Money"] += readingtime * readingSpeed * bookcost / 2;
        }
        stats["Knowledge"] += readingtime * readingSpeed * knowledgeRatio * wisdomMult;
    }
    magicTime = currentHours["Practice Magic"];
    if (magicTime > 0) {
        stats["Focus"] += magicTime * wisdomMult / 100;
    }

    HandlePotionProduction();

    // Daily actions
    const currentDay = Math.floor(stats["Day"]);
    if (currentDay > (gameState.lastDayChecked ?? -1)) {
        gameState.lastDayChecked = currentDay;
        HandlePotionUsage();
    }

    // Resource Caps
    if (stats["Books"] > statsCap["Books"]) {
        stats["Books"] = statsCap["Books"];
    }

    updateStats();

    if ((booksRead > 50 || debug) && !boughtTech['mysteriousBook'] && !currentTech.includes('mysteriousBook')) {
        PrintInfo("You've found a mysterious book written in very old English");
        currentTech.push('mysteriousBook');
        UpdateTech();
    }

    if (timeWorked > 15000 && !boughtTech['employeeDiscount'] && !currentTech.includes('employeeDiscount')) {
        currentTech.push('employeeDiscount');
        UpdateTech();
    }
    if (booksBought > 100 && !boughtTech['customerRewards'] && !currentTech.includes('customerRewards')) {
        currentTech.push('customerRewards');
        UpdateTech();
    }
    if (booksBought > 1000 && !boughtTech['customerRewards2'] && !currentTech.includes('customerRewards2')) {
        currentTech.push('customerRewards2');
        UpdateTech();
    }
    if (booksBought > 10000 && !boughtTech['customerRewards3'] && !currentTech.includes('customerRewards3')) {
        currentTech.push('customerRewards3');
        UpdateTech();
    }
    if (booksBought > 100000 && !boughtTech['customerRewards4'] && !currentTech.includes('customerRewards4')) {
        currentTech.push('customerRewards4');
        UpdateTech();
    }
}

function ln(n) {
    return Math.log(n + 1);
}


function updateStats() {
    for (stat in stats) {
        updateStat(stat);
    }
}

function updateStat(stat) {
    div = document.getElementById("stat" + stat);
    div.innerText = stat + ": " + parseInt(stats[stat]);
    if (statsCap[stat] != undefined) {
        div.innerText += " / " + statsCap[stat];
    }
}

var blueStats = ['Knowledge', 'Mana', 'Intelligence', 'Wisdom', 'Focus'];
var redStats = ['Money', 'Books', 'Vials', 'Potion Ingredients'];
var greenStats = ['Energy Potion', 'Strength Potion', 'Sleeping Potion', 'Wisdom Potion'];

function AddStat(stat, def = 0, cap = -1) {
    stats[stat] = def;
    updateStat(stat);
    div = document.getElementById("stat" + stat);
    div.style.visibility = 'visible';
    if (cap >= 0) {
        statsCap[stat] = cap;
    }
}

function AddTime(job, time = 0) {
    if (job in currentHours) return;
    currentHours[job] = time;
    UpdateHours();
}

function InitStats() {
    InitStatDiv("Day");
    for (stat of blueStats) {
        InitStatDiv(stat, "#8888ff");
    }
    for (stat of redStats) {
        InitStatDiv(stat, "#ff8888");
    }
    for (stat of greenStats) {
        InitStatDiv(stat, "#88ff88");
    }
}

function InitStatDiv(stat, color = "white") {
    var div = document.createElement("Div");
    div.class = "stat";
    div.id = "stat" + stat;
    div.style.visibility = 'collapsed';
    div.style.color = color;
    statsDiv.appendChild(div);
}

function HoursClicked() {
    id = event.srcElement.id;
    mod = GetModifierKeys();
    dir = id.startsWith("up") ? true : false;
    id = id.substring(4);
    for (i = 0; i < mod; i++) {
        if (dir) {
            if (HoursUsed() >= TotalHours()) break;
            currentHours[id]++;
        }
        else {
            if (currentHours[id] <= 0) break;
            currentHours[id]--;
        }
    }
    UpdateHours();
}

function GetModifierKeys() {
    m = 1;
    if (window.event.ctrlKey) {
        m *= 10;
    }
    if (window.event.shiftKey) {
        m *= 25;
    }
    if (window.event.altKey) {
        m *= 100;
    }
    return m;
}

function TotalHours() {
    return 16 + gameState.potionHours;
}

function HoursUsed() {
    sum = 0;
    for (hour in currentHours) {
        sum += currentHours[hour];
    }
    return sum;
}

function HasAllTech() {
    for (r of allTech[t].required) {
        if (!boughtTech[r]) return false;
    }
    return true;
}

function TechClicked() {
    id = event.srcElement.id;
    tech = allTech[id];
    costs = GetCosts(id);
    if (!hasStats(costs)) return;

    for (cost in costs) {
        stats[cost] -= costs[cost];
    }
    if (!tech.repeatable) {
        RemoveTech(id);
    }
    if (!boughtTech[id]) {
        boughtTech[id] = 0;
    }
    boughtTech[id]++;

    if (tech.unlocks) {
        for (t of tech.unlocks) {
            if (!allTech[t].required || HasAllTech(allTech[t].required)) {
                currentTech.push(t);
            }
        }
    }
    PrintInfo(tech.output);

    if (allTech[id].action) {
        allTech[id].action();
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

infoColor = 0;
lines = 0;
function PrintInfo(text) {
    if (!text) return;
    infoColor = (infoColor + 1) % 2;
    colors = ["#ffffff", "#cccccc"];
    if (lines > 50) {
        txt = info.innerHTML;
        i = txt.indexOf("<br>");
        txt = txt.substring(i + 4);
        info.innerHTML = txt;
    }
    lines++;
    info.innerHTML += "<br><div display: inline-block; style='color: " + colors[infoColor] +"'>" + text + "</div>";
}

function CreateLab() {
    var tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    var tbdy = document.createElement('tbody');
    tbdy.id = 'labTableBody';
    tbl.appendChild(tbdy);
    labDiv.appendChild(tbl);

    tr = document.createElement('tr');
    tbdy.appendChild(tr);
    td = document.createElement('td');
    td.colSpan = 5;
    tr.appendChild(td);

    var labSpaceLbl = document.createElement('label');
    labSpaceLbl.id = 'labSpaceLbl';
    td.appendChild(labSpaceLbl);

    AddLabRow("Item", "Space", "Count");
    AddLabRow("Bookshelves", "10");

    SetLabLabel();
}
//Lab	Total Space	50

//Item		Space Count
//Bookshelves	10  4
//Potion Table	10	1
//Shelves		

function SetLabLabel() {
    labSpaceLbl = document.getElementById('labSpaceLbl');
    labSpaceLbl.innerText = LabName + " Total Space: " + LabTotalSpace;
}

function AddLabRow(string, size, count) {
    body = document.getElementById('labTableBody');
    tr = document.createElement('tr');
    body.appendChild(tr);
    var td = [];
    for (var i = 0; i < 5; i++) {
        td[i] = document.createElement('td');
        tr.appendChild(td[i]);
    }
    td[0].innerText = string;
    td[1].innerText = size;
    if (count) {
        td[2].innerText = count;
        return;
    }
    currentLab[string] = [size, 0];
    //label
    var objectLabel = document.createElement("Label");
    objectLabel.innerHTML = '0';
    objectLabel.id = string + "Lbl";
    td[2].appendChild(objectLabel);
    //down button
    var downButton = document.createElement("Button");
    downButton.innerHTML = "<";
    downButton.id = "down" + string;
    downButton.onclick = LabClicked;
    td[3].appendChild(downButton);
    //up button
    var upButton = document.createElement("Button");
    upButton.innerHTML = ">";
    upButton.id = "upup" + string;
    upButton.onclick = LabClicked;
    td[4].appendChild(upButton);
}

function LabClicked() {
    id = event.srcElement.id;
    mod = GetModifierKeys();
    dir = id.startsWith("up") ? true : false;
    id = id.substring(4);
    for (i = 0; i < mod; i++) {
        if (dir) {
            if (LabUseTotal() >= LabTotalSpace) break;
            currentLab[id][1]++;
        }
        else {
            if (currentLab[id][1] <= 0) break;
            currentLab[id][1]--;
        }
    }
    objectLabel = document.getElementById(id + 'Lbl');
    objectLabel.innerHTML = currentLab[id][1];

    statsCap["Books"] = 10 + currentLab["Bookshelves"][1] * 100;

    UpdatePotions();
}

function LabUseTotal() {
    var sum = 0;
    for (obj in currentLab) {
        sum += currentLab[obj][1] * currentLab[obj][0];
    }
    return sum;
}

