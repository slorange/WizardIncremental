class Stat {
    constructor(name, initialValue = 0, cap = null) {
        this.name = name;
        this.value = initialValue;
        this.cap = cap;
        this.acquired = false;

        // contribution tracking
        this.baseContribs = [];
        this.multipliers = [];
        this.subtractions = [];

        // display tracking
        this.diff = 0;
    }

    // Input methods
    AddBase(amount, source = "Base") {
        this.baseContribs.push({ amount, source });
    }

    AddMultiplier(factor, source) {
        this.multipliers.push({ factor, source });
    }

    Subtract(amount, source) {
        this.subtractions.push({ amount, source });
    }

    // Calculation phase
    Resolve() {
        const baseSum = this.baseContribs.reduce((sum, x) => sum + x.amount, 0);
        const subSum = this.subtractions.reduce((sum, x) => sum + x.amount, 0);
        const multTotal = this.multipliers.reduce((total, x) => total * x.factor, 1);

        this.diff = baseSum * multTotal - subSum;
        const newValue = this.value + this.diff;

        // Cap
        this.value = this.cap !== null ? Math.min(newValue, this.cap) : newValue;

        // Clear temporary lists
        this.baseContribs = [];
        this.multipliers = [];
        this.subtractions = [];
    }

    // Display helpers

    GetDiffText() {
        var diff = this.diff * 100;
        if (Math.abs(diff) < 0.001) return "";
        const sign = diff > 0 ? "+" : "";
        const color = diff > 0 ? "white" : "crimson";
        return ` <span style="color:${color};font-size:0.9em;">(${sign}${diff.toFixed(2)})</span>`;
    }

    GetBreakdown() {
        const b = this.baseContribs.map(x => `${x.source}: +${x.amount.toFixed(2)}`);
        const m = this.multipliers.map(x => `${x.source}: ×${x.factor.toFixed(2)}`);
        const s = this.subtractions.map(x => `${x.source}: -${x.amount.toFixed(2)}`);
        return [...b, ...m, ...s].join("<br>");
    }
}

// Global stat manager

const stats = {};

const statDefinitions = [
    { name: "Day", color: "white" },
    { name: "Knowledge", color: "#8888ff" },
    { name: "Mana", color: "#8888ff" },
    { name: "Intelligence", color: "#8888ff" },
    { name: "Wisdom", color: "#8888ff" },
    { name: "Focus", color: "#8888ff" },

    { name: "Money", color: "#ff8888" },
    { name: "Books", color: "#ff8888", cap: 10 },
    { name: "Vials", color: "#ff8888" },
    { name: "Ingredients", color: "#ff8888" },

    { name: "Energy Potion", color: "#88ff88" },
    { name: "Strength Potion", color: "#88ff88" },
    { name: "Sleeping Potion", color: "#88ff88" },
    { name: "Wisdom Potion", color: "#88ff88" }
];

function InitStats() {
    const container = document.getElementById("statsDiv");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "2px"; // small spacing between rows

    for (const def of statDefinitions) {
        const s = GetStat(def.name);
        s.color = def.color || "white";
        s.cap = def.cap ?? null;
        s.value = def.initial ?? 0;
        s.acquired = false;

        // --- Row wrapper ---
        const row = document.createElement("div");
        row.id = "row" + def.name;
        row.style.display = "none"; // hidden until acquired
        row.style.color = s.color;

        // --- Inner 3-column layout ---
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "1fr 1fr 1fr";
        grid.style.columnGap = "8px";
        grid.style.alignItems = "baseline";

        const nameDiv = document.createElement("div");
        nameDiv.innerText = def.name + ":";
        nameDiv.style.color = s.color;

        const valueDiv = document.createElement("div");
        valueDiv.id = "value" + def.name;
        valueDiv.style.textAlign = "right";

        const diffDiv = document.createElement("div");
        diffDiv.id = "diff" + def.name;
        diffDiv.style.textAlign = "right";

        grid.append(nameDiv, valueDiv, diffDiv);
        row.appendChild(grid);
        container.appendChild(row);
    }
}

function AcquireStat(statName, def = 0, cap = -1) {
    const s = S(statName);
    s.acquired = true;
    s.value = def;
    if (cap >= 0) s.cap = cap;

    const row = document.getElementById("row" + statName);
    if (row) row.style.display = "contents"; // unhide full row cleanly

    UpdateStat(statName);
}

function GetStat(name) {
    return S(name);
}

function S(name) {
    if (!stats[name]) stats[name] = new Stat(name);
    return stats[name];
}

function GetStatValue(name) {
    const s = S(name);
    return s ? s.value : 0;
}

function ResolveAllStats() {
    for (const key in stats) stats[key].Resolve();
}

function UpdateStats() {
    for (stat in stats) {
        UpdateStat(stat);
    }
}

function UpdateStat(statName) {
    const s = S(statName);
    if (!s.acquired) return; // skip unacquired stats

    const valueDiv = document.getElementById("value" + statName);
    const diffDiv = document.getElementById("diff" + statName);
    if (!valueDiv) return;

    const valueText = parseInt(s.value);
    const capText = (s.cap !== null && s.cap !== undefined) ? ` / ${s.cap}` : "";

    valueDiv.innerText = valueText + capText;
    diffDiv.innerHTML = s.GetDiffText();
}

// Make accessible globally
window.Stat = Stat;
window.stats = stats;