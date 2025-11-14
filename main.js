var shortLoopFraction = 20;

var currentTech = ["job"];
var boughtTech = [];
var currentHours = [];
var currentLab = [];
var LabName = "Sub Basement";
var LabTotalSpace = 50;
var dayLength = 100;

var gameState = {
    lastDayChecked: -1,
    potionHours: 0,
    potionWisdom: 0,
    booksRead: 0,
    booksBought: 0,
    timeWorked: 0,
}

var debug = true;
if (window.location.hostname.includes("github.io")) {
    debug = false;
}
else {
    gameState.booksRead = 40;
}

window.onload = function start() {
    UpdateTech();
    UpdateHours();
    InitStats();
    AcquireStat("Day");
    AcquireStat("Money");
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
    // Days
    S("Day").value += 1 / dayLength;

    // Wisdom
    wisdomMult = 1;
    if (boughtTech["wisdomTheory"]) {
        const wisdomStat = S("Wisdom");
        const wisdomPotionMult = 1 + (gameState.potionWisdom ?? 0);
        wisdomStat.value = Math.round(S("Books").value / 10 * wisdomPotionMult); //TODO sources need to be tracked in stat.js for mouseover
        wisdomMult = 1 + Math.log(wisdomStat.value / 10 + 1);
    }

    // Money
    const moneyStat = S("Money");
    const worktime = currentHours["Work"];
    if (worktime) {
        moneyStat.AddBase(worktime * 0.25, "Work");
        workEfficiency = 1 + 0.25 * (boughtTech["workEfficiency"] || 0);
        moneyStat.AddMultiplier(workEfficiency, "Efficiency");
        moneyStat.AddMultiplier(wisdomMult, "Wisdom");
    }

    // Shopping, Books, Vials, Ingredients
    const booksStat = S("Books");
    const vialsStat = S("Vials");
    const ingredStat = S("Ingredients");
    const shoptime = currentHours["Shop"] * 0.025;
    
    if (shoptime > 0) {
        cost = 100;
        if (boughtTech["employeeDiscount"]) cost *= 0.75;
        if (boughtTech["customerRewards"]) cost *= 0.85;
        if (boughtTech["customerRewards2"]) cost *= 0.85;
        if (boughtTech["customerRewards3"]) cost *= 0.85;
        if (boughtTech["customerRewards4"]) cost *= 0.85;

        const spent = shoptime * cost;
        if (spent <= moneyStat.value) {
            moneyStat.Subtract(spent, "Shopping");
            const shoppingEfficiency = 1 + 0.25 * (boughtTech["shoppingEfficiency"] || 0);

            booksStat.AddBase(shoptime, "Shopping");
            booksStat.AddMultiplier(shoppingEfficiency, "Efficiency");
            booksStat.AddMultiplier(wisdomMult, "Wisdom");
            gameState.booksBought += shoptime * shoppingEfficiency * wisdomMult;

            if (vialsStat.acquired) {
                vialsStat.AddBase(shoptime, "Shopping");
                vialsStat.AddMultiplier(shoppingEfficiency, "Efficiency");
                vialsStat.AddMultiplier(wisdomMult, "Wisdom");
            }
            if (ingredStat.acquired) {
                ingredStat.AddBase(shoptime, "Shopping");
                ingredStat.AddMultiplier(shoppingEfficiency, "Efficiency");
                ingredStat.AddMultiplier(wisdomMult, "Wisdom");
            }
        }
    }

    // Reading
    const readingtime = currentHours["Reading"] * 0.002;
    if (readingtime > 0) {
        const readingSpeed = 1 + 0.25 * (boughtTech["readingEfficiency"] || 0);
        const knowledgeRatio = 5;
        const booksRead = readingtime * readingSpeed;

        if (booksStat.value >= booksRead) {
            gameState.booksRead = booksRead;
            booksStat.Subtract(booksRead, "Reading");
            if (boughtTech["bookReselling"]) {
                const resale = booksRead * cost / 4;
                moneyStat.AddBase(resale, "Book Reselling");
            }
            
            S("Knowledge").AddBase(readingtime * knowledgeRatio, "Reading");
            S("Knowledge").AddMultiplier(readingSpeed, "Efficiency");
            S("Knowledge").AddMultiplier(wisdomMult, "Wisdom");
        }
    }

    // Focus
    const magicTime = currentHours["Practice Magic"];
    if (magicTime > 0) {
        const focusGain = magicTime / 100;
        S("Focus").AddBase(focusGain, "Practice Magic");
        S("Focus").AddMultiplier(wisdomMult, "Wisdom");
    }

    HandlePotionProduction();

    // Daily actions
    const currentDay = Math.floor(S("Day").value);
    if (currentDay > (gameState.lastDayChecked ?? -1)) {
        gameState.lastDayChecked = currentDay;
        HandlePotionUsage();
    }

    ResolveAllStats();
    UpdateStats();

    if ((gameState.booksRead > 100 || debug) && !boughtTech['mysteriousBook'] && !currentTech.includes('mysteriousBook')) {
        PrintInfo("You've found a mysterious book written in very old English");
        currentTech.push('mysteriousBook');
        UpdateTech();
    }

    if (gameState.timeWorked > 10000 && !boughtTech['employeeDiscount'] && !currentTech.includes('employeeDiscount')) {
        currentTech.push('employeeDiscount');
        UpdateTech();
    }
    if (gameState.booksBought > 20 && !boughtTech['customerRewards'] && !currentTech.includes('customerRewards')) {
        currentTech.push('customerRewards');
        UpdateTech();
    }
    if (gameState.booksBought > 100 && !boughtTech['customerRewards2'] && !currentTech.includes('customerRewards2')) {
        currentTech.push('customerRewards2');
        UpdateTech();
    }
    if (gameState.booksBought > 500 && !boughtTech['customerRewards3'] && !currentTech.includes('customerRewards3')) {
        currentTech.push('customerRewards3');
        UpdateTech();
    }
    if (gameState.booksBought > 2500 && !boughtTech['customerRewards4'] && !currentTech.includes('customerRewards4')) {
        currentTech.push('customerRewards4');
        UpdateTech();
    }
}

function ln(n) {
    return Math.log(n + 1);
}


function AddTime(job, time = 0) {
    if (job in currentHours) return;
    currentHours[job] = time;
    UpdateHours();
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
    if (!hasRequirement(costs)) return;

    for (cost in costs) {
        S(cost).value -= costs[cost];
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

function hasRequirement(costs) {
    for (cost in costs) {
        if (S(cost).value < costs[cost]) return false;
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
    info.innerHTML += "<br><div display: inline-block; style='color: " + colors[infoColor] + "'>" + text + "</div>";

    // autoscroll
    const container = info.closest('div');
    if (container) container.scrollTop = container.scrollHeight;
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

    const booksStat = S("Books");
    if (booksStat.acquired) {
        booksStat.cap = 10 + currentLab["Bookshelves"][1] * 100;
    }

    if (boughtTech['potionTheory'])
        UpdatePotions();
}

function LabUseTotal() {
    var sum = 0;
    for (obj in currentLab) {
        sum += currentLab[obj][1] * currentLab[obj][0];
    }
    return sum;
}

