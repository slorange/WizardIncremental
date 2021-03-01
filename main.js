var money = 0;
var worktime = 0;
var wage = 7.25;
var shortLoopFraction = 24;

var currentTech = ['Get A Job'];

window.onload = function start() {
    UpdateTech();
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


const interval = setInterval(shortLoop, 1000 / shortLoopFraction);

function shortLoop() {
    money += worktime/24 * wage;
    updateStats();
}


function updateStats() {
    stats.innerText = "Money: " + parseInt(money);
}


function TechClicked(id) {
    RemoveTech(id);
    switch (id) {
        case 'Get A Job':
            currentTech.push("Shopping");
            stats.innerText = "Money: " + money;
            worktime = 8;
            var newlabel = document.createElement("Label");
            newlabel.innerHTML = "Work: " + worktime;
            time.appendChild(newlabel);
            PrintInfo("You found a job at the local library. The money is rolling in, now you need something to spend it on.");
            break;
        case 'Shopping':

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