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
    { name: "Potion Ingredients", color: "#ff8888" },

    { name: "Energy Potion", color: "#88ff88" },
    { name: "Strength Potion", color: "#88ff88" },
    { name: "Sleeping Potion", color: "#88ff88" },
    { name: "Wisdom Potion", color: "#88ff88" }
];

function InitStats() {
    const container = document.getElementById("statsDiv");

    for (const def of statDefinitions) {
        const s = GetStat(def.name);
        s.color = def.color || "white";
        s.cap = def.cap ?? null;
        s.value = def.initial ?? 0;

        const div = document.createElement("div");
        div.className = "stat";
        div.id = "stat" + def.name;
        div.style.color = s.color;
        div.style.display = "none"; // invisible and collapsed
        container.appendChild(div);
    }
}

function AcquireStat(statName, def = 0, cap = -1) {
    const s = S(statName);
    s.acquired = true;

    s.value = def;
    if (cap >= 0) s.cap = cap;

    const div = document.getElementById("stat" + statName);
    if (div) div.style.display = "block"; // visible

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
    const div = document.getElementById("stat" + statName);

    let text = `${statName}: ${parseInt(s.value)}`;
    if (s.cap !== null && s.cap !== undefined) {
        text += ` / ${s.cap}`;
    }
    text += s.GetDiffText();

    div.innerHTML = text;
}

// Make accessible globally
window.Stat = Stat;
window.stats = stats;