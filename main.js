var stats = [];
var shortLoopFraction = 24;

var currentTech = ['Get A Job'];
var currentHours = [];

window.onload = function start() {
    UpdateTech();
    UpdateHours();
    AddStat("Money");
}

function UpdateTech() {
    techDiv.innerHTML = currentTech.length < 1 ? '&nbsp;' : '';
    for (i in currentTech) {
        tech = currentTech[i];
        var newButton = document.createElement("Button");
        newButton.innerHTML = tech;
        newButton.id = tech;
        newButton.onclick = function () { TechClicked(newButton.id); };
        techDiv.appendChild(newButton);
    }
}

function UpdateHours() {
    hoursDiv.innerHTML = currentHours.length < 1 ? '&nbsp;' : '';
    for (actName in currentHours) {
        var div = document.createElement("Div");
        actTime = currentHours[actName];
        var activityLabel = document.createElement("Label");
        activityLabel.innerHTML = actName + ": " + actTime;
        activityLabel.id = actName + "Lbl";
        div.appendChild(activityLabel);
        var downButton = document.createElement("Button");
        downButton.innerHTML = "<";
        downButton.id = "down" + actName;
        downButton.onclick = HoursClicked;
        div.appendChild(downButton);
        var upButton = document.createElement("Button");
        upButton.innerHTML = ">";
        upButton.id = "up" + actName;
        upButton.onclick = HoursClicked;
        div.appendChild(upButton);
        hoursDiv.appendChild(div);
    }
}

const interval = setInterval(shortLoop, 1000 / shortLoopFraction);

function shortLoop() {
    worktime = currentHours["Work"];
    if(worktime > 0)
        stats["Money"] += worktime / 10;
    shoptime = currentHours["Shop"];
    if (shoptime > 0 && stats["Money"] > 0) {
        stats["Money"] -= shoptime;
        stats["Books"] += shoptime / 100;
    }
    updateStats(); 
}


function updateStats() {
    for (stat in stats) {
        div = document.getElementById("stat" + stat);
        div.innerText = stat + ": " + parseInt(stats[stat]);
    }

    /*statsDiv.innerHTML = '';
    var moneylbl = document.createElement("Label");
    moneylbl.class = "stat";
    moneylbl.innerText = "Money: " + parseInt(money);
    statsDiv.appendChild(moneylbl);
    if (book > 0) {
        var bookslbl = document.createElement("Label");
        bookslbl.class = "stat";
        bookslbl.innerText = "Books: " + parseInt(book);
        statsDiv.appendChild(bookslbl);
    }*/
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
        currentHours[id]++;
    }
    else if (id.startsWith("down")){
        id = id.substring(4);
        currentHours[id]--;
    }
    UpdateHours();
}


function TechClicked(id) {
    RemoveTech(id);
    switch (id) {
        case 'Get A Job':
            currentTech.push("Shopping");
            currentHours["Work"] = 8;
            UpdateHours();
            PrintInfo("You found a job at the local library. The money is rolling in, now you need something to spend it on.");
            break;
        case 'Shopping':
            currentHours["Shop"] = 0;
            AddStat("Books");
            UpdateHours();
            PrintInfo("You can now spend some time shopping. You'll be buying books, because that's all you know.");
            break;
        default:
    }
    UpdateTech();
}

function RemoveTech(id) {
    var index = currentTech.indexOf(id);
    if (index !== -1) {
        currentTech.splice(index, 1);
    }
}

function PrintInfo(text) {
    info.innerHTML += "<br />" + text;
}