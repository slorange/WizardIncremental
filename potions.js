
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
        const stockValue = stats[potion.name] ?? 0;
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
    potionTime = currentHours["Make Potions"];
    if (potionTime > 0 && stats["Vials"] > 0 && stats["Potion Ingredients"] > 0) {
        potionMult = 100;
        focus = 1 + ln(stats["Focus"] + 1);

        // Determine total number of potion tables in lab
        var tables = currentLab["Potion Table"] ? currentLab["Potion Table"][1] : 0;

        for (let i = 0; i < tables; i++) {
            let potionKey = potionAssignments[i]; // what this table is making
            if (!potionKey) continue; // skip unassigned tables

            let potionStat = allTech[potionKey]?.name; // get display name, like “Energy Potion”
            if (!(potionStat in stats)) continue; // skip if player hasn’t unlocked it

            let amount = potionTime * focus * wisdomMult / potionMult;
            stats[potionStat] += amount;
            stats["Vials"] -= amount;
            stats["Potion Ingredients"] -= amount;
        }
    }
}

function HandlePotionUsage() {
    const unlockedPotions = getUnlockedPotions();

    for (const potion of unlockedPotions) {
        const potionName = potion.name;
        const { drink, sell } = getPotionUseAmounts(potionName);

        let available = stats[potionName] || 0;
        if (available <= 0) continue;

        // --- Drink ---
        const drinkAmt = Math.min(drink, available);
        available -= drinkAmt;
        stats[potionName] = available;
        // apply effects
        applyPotionEffect(potionName, drinkAmt);

        // --- Sell ---
        if (sell > 0) {
            const sellAmt = Math.min(sell, available);
            available -= sellAmt;
            stats[potionName] = available;

            // gain money for selling
            const sellPrice = 100; // placeholder value
            stats["Money"] += sellAmt * sellPrice;
        }
    }
}

function getPotionUseAmounts(potionName) {
    const setting = potionUseSettings[potionName];
    if (!setting) return { drink: 0, sell: 0 };

    const total = stats[potionName] || 0;

    function parseValue(raw) {
        if (!raw) return 0;
        raw = raw.trim();

        if (raw.endsWith("%")) {
            const percent = parseFloat(raw.slice(0, -1));
            if (isNaN(percent)) return 0;
            return Math.floor(total * percent / 100);
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
            gameState.potionWisdom = 1 + 0.1 * bonus;
            break;
        }
    }
}