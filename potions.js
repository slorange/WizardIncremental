
var potionAssignments = {};
var potionUseSettings = {}; 


function UpdatePotions() {
    potionsDiv.innerHTML = '';

    const tableCount = currentLab["Potion Table"] ? currentLab["Potion Table"][1] : 0;

    // Header
    const header = document.createElement("h3");
    header.innerText = "Potion Production";
    potionsDiv.appendChild(header);

    const unlockedPotions = getUnlockedPotions();

    if (tableCount == 0) {
        const label = document.createElement("label");
        label.innerText = 'No active Potion Tables';
        potionsDiv.appendChild(label);
    }

    for (let i = 0; i < tableCount; i++) {
        const div = document.createElement("div");
        div.className = "potion-table-row";

        const label = document.createElement("label");
        label.innerText = `Potion Table ${i + 1}: `;
        div.appendChild(label);

        const select = document.createElement("select");
        select.id = `potionTable${i}`;
        for (const potion of unlockedPotions) {
            const option = document.createElement("option");
            option.value = potion.id;
            option.innerText = potion.name;
            select.appendChild(option);
        }

        if (!potionAssignments[i] && unlockedPotions.length > 0) { // Default to the first unlocked potion (if any)
            potionAssignments[i] = unlockedPotions[0].id;
        }
        select.onchange = function () {
            potionAssignments[i] = this.value;
        };
        if (potionAssignments[i]) {
            select.value = potionAssignments[i];
        }

        div.appendChild(select);
        potionsDiv.appendChild(div);
    }

    UpdatePotionManagement();
}

function UpdatePotionManagement() {

    const unlockedPotions = getUnlockedPotions();

    // Header
    const header = document.createElement("h3");
    header.innerText = "Potion Management";
    potionsDiv.appendChild(header);

    if (unlockedPotions.length === 0) {
        const label = document.createElement("label");
        label.innerText = 'No available Potions';
        potionsDiv.appendChild(label);
        return;
    }

    // Table container
    const table = document.createElement("table");
    table.className = "potion-management-table";
    table.style.width = '100%';
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Potion", "Stock", "Drink / day", "Sell / day"].forEach(txt => {
        const th = document.createElement("th");
        th.innerText = txt;
        th.style.textAlign = "left";
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const potion of unlockedPotions) {
        const row = document.createElement("tr");

        // Potion name
        const nameCell = document.createElement("td");
        nameCell.innerText = potion.name;
        row.appendChild(nameCell);

        // Current stock
        const stockCell = document.createElement("td");
        const stockValue = S(potion.name) ? S(potion.name).value : 0;
        stockCell.innerText = parseInt(stockValue);
        row.appendChild(stockCell);

        // Drink per day
        const drinkCell = document.createElement("td");
        const drinkInput = document.createElement("input");
        drinkInput.type = "text";
        drinkInput.value = potionUseSettings[potion.name]?.drink || "";
        drinkInput.onchange = () => {
            if (!potionUseSettings[potion.name]) potionUseSettings[potion.name] = {};
            potionUseSettings[potion.name].drink = drinkInput.value.trim();
        };
        drinkCell.appendChild(drinkInput);
        row.appendChild(drinkCell);

        // Sell per day
        const sellCell = document.createElement("td");
        const sellInput = document.createElement("input");
        sellInput.type = "text";
        sellInput.value = potionUseSettings[potion.name]?.sell || "";
        sellInput.onchange = () => {
            if (!potionUseSettings[potion.name]) potionUseSettings[potion.name] = {};
            potionUseSettings[potion.name].sell = sellInput.value.trim();
        };
        sellCell.appendChild(sellInput);
        row.appendChild(sellCell);

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    potionsDiv.appendChild(table);
}


function getUnlockedPotions() {
    const potions = [];
    for (const id in allTech) {
        const t = allTech[id];
        if (t.name.toLowerCase().endsWith("potion") && boughtTech[id]) {
            potions.push({ id, name: t.name });
        }
    }
    return potions;
}

function HandlePotionProduction() {
    const potionTime = currentHours["Make Potions"];
    const VialsStat = S("Vials");
    const IngreStat = S("Ingredients");
    if (potionTime <= 0 || !VialsStat.acquired || !IngreStat.acquired) return;

    const potionMult = 500;
    const focus = 1 + ln(GetStatValue("Focus") + 1);
    const tables = currentLab["Potion Table"] ? currentLab["Potion Table"][1] : 0; // number of potion tables in use
    if (tables <= 0) return;

    // Gather potion totals per potion type
    const potionTotals = {};
    for (let i = 0; i < tables; i++) {
        const potionKey = potionAssignments[i]; // what this table is making
        if (!potionKey) continue; // skip unassigned tables

        const potionStat = allTech[potionKey]?.name; // get display name, like “Energy Potion”
        const PotionStat = S(potionStat);
        if (!PotionStat.acquired) continue; // skip if player hasn’t unlocked it

        const amount = potionTime / potionMult;
        potionTotals[potionStat] = (potionTotals[potionStat] || 0) + amount; // keep track of production in dictionary
    }

    // Total up all ingredients/vials cost for the entire batch
    const totalVialUse = totalIngreUse = Object.values(potionTotals).reduce((a, b) => a + b, 0);

    // If not enough resources, don't make potions
    if (totalVialUse > VialsStat.value || totalIngreUse > IngreStat.value) return;

    //  Apply production per potion type
    for (const [potionName, amount] of Object.entries(potionTotals)) {
        const PotionStat = S(potionName);
        PotionStat.AddBase(amount, "Potion Crafting");
        PotionStat.AddMultiplier(wisdomMult, "Wisdom");
        PotionStat.AddMultiplier(focus, "Focus");
    }

    // Subtractions
    if (totalVialUse > 0) VialsStat.Subtract(totalVialUse, "Potion Crafting");
    if (totalIngreUse > 0) IngreStat.Subtract(totalIngreUse, "Potion Crafting");
}

function HandlePotionUsage() {
    const unlockedPotions = getUnlockedPotions();

    let sold = 0;
    for (const potion of unlockedPotions) {
        const potionName = potion.name;
        const { drink, sell } = getPotionUseAmounts(potionName);

        const PotionStat = S(potionName);
        if (!PotionStat.acquired) continue;

        let available = PotionStat.value || 0;
        if (available <= 0) continue;


        // --- Drink ---
        const drinkPerTick = (drink || 0) / dayLength;
        const drinkAmt = Math.min(drinkPerTick, available);
        if (drinkAmt > 0) {
            PotionStat.Subtract(drinkAmt, "Potion Consumed");
            applyPotionEffect(potionName, drinkAmt * dayLength); // Potion effects are measured in number used per day
            available -= drinkAmt;
        }

        // --- Sell ---
        const sellPerTick = (sell || 0) / dayLength;
        const sellAmt = Math.min(sellPerTick, available);
        if (sellAmt > 0) {
            PotionStat.Subtract(sellAmt, "Potion Sold");
            sold += sellAmt;
        }
    }
    if (sold == 0) return;

    const sellPrice = 10; // placeholder value
    S("Money").AddBase(sold * sellPrice, "Potion Sales");
}

// User can enter a number "5", 5 potions used per day, or a percent "50%", 50% of all potions sold per day
function getPotionUseAmounts(potionName) {
    const setting = potionUseSettings[potionName];
    if (!setting) return { drink: 0, sell: 0 };

    function parseValue(raw) {
        if (!raw) return 0;
        raw = raw.trim();

        if (raw.endsWith("%")) {
            const percent = parseFloat(raw.slice(0, -1));
            if (isNaN(percent)) return 0;
            return Math.floor(GetStatValue(potionName) * percent / 100);
        }

        const fixed = parseFloat(raw);
        return isNaN(fixed) ? 0 : Math.floor(fixed);
    }

    return {
        drink: parseValue(setting.drink),
        sell: parseValue(setting.sell)
    };
}

function applyPotionEffect(potionName, count) {
    switch (potionName) {
        case "Energy Potion": {
            // First potion gives 1 additional hour. Each hour after costs double the last. Cap of 8
            const bonus = Math.min(Math.floor(Math.log2(count + 1)), 8);
            gameState.potionHours = Math.min(bonus, 8);
            break;
        }
        case "Wisdom Potion": {
            // First potion gives +10% wisdom. Each 10% after costs double the last.
            const bonus = Math.log2(count + 1);
            gameState.potionWisdom = 0.1 * bonus;
            break;
        }
    }
}