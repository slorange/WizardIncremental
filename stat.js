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

        //mouse over displays
        this.ttBaseContribs = [];
        this.ttMultipliers = [];
        this.ttSubtractions = [];

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

        // Update tooltip
        this.ttBaseContribs = this.baseContribs;
        this.ttMultipliers = this.multipliers;
        this.ttSubtractions = this.subtractions;

        // Clear temporary lists
        this.baseContribs = [];
        this.multipliers = [];
        this.subtractions = [];
    }

    // Display helpers

    GetDiffText() {
        if (this.ttBaseContribs.length === 0 && this.ttMultipliers.length === 0 && this.ttSubtractions.length === 0) return "";
        var diff = this.diff * dayLength;
        const sign = diff > 0 ? "" : "";
        const color = diff > 0 ? "white" : "crimson";
        return ` <span style="color:${color};font-size:0.9em;">${sign}${diff.toFixed(2)}</span>`;
    }

    GetBreakdown() {
        const b = this.baseContribs.map(x => `${x.source}: +${x.amount.toFixed(2)}`);
        const m = this.multipliers.map(x => `${x.source}: ×${x.factor.toFixed(2)}`);
        const s = this.subtractions.map(x => `${x.source}: -${x.amount.toFixed(2)}`);
        return [...b, ...m, ...s].join("<br>");
    }
    
    GetBreakdownHtml() {
        if (this.ttBaseContribs.length === 0 && this.ttMultipliers.length === 0 && this.ttSubtractions.length === 0) return;

        let html = `<b>${this.name}</b><hr style="border:0;border-top:1px solid #555;margin:4px 0;">`;

        const makeRow = (label, value, color) => `
        <div style="display:flex;justify-content:space-between;gap:10px;">
            <span>${label}</span>
            <span style="color:${color};text-align:right;min-width:70px;">${value}</span>
        </div>`;

        // --- Base contributions (green)
        for (const b of this.ttBaseContribs) {
            const val = `+${(b.amount * dayLength).toFixed(2)}`;
            html += makeRow(`${b.source}`, val, "#00ff80");
        }

        // --- Multipliers (white or orange if < 1)
        for (const m of this.ttMultipliers) {
            const color = m.factor >= 1 ? "#00ff80" : "#ff6060";
            const val = `×${m.factor.toFixed(2)}`;
            html += makeRow(`${m.source}`, val, color);
        }

        // --- Subtractions (red)
        for (const s of this.ttSubtractions) {
            const val = `–${(s.amount * dayLength).toFixed(2)}`;
            html += makeRow(`${s.source}`, val, "#ff6060");
        }

        return html;
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
        grid.id = "innerRow" + def.name;
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

        grid.onmouseenter = (e) => ShowStatTooltip(e, s);
        grid.onmouseleave = HideTooltip;

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

function ShowStatTooltip(event, stat) {
    const rect = event.currentTarget.getBoundingClientRect();
    const html = stat.GetBreakdownHtml();
    if (!html) return;

    tooltip.innerHTML = html;
    tooltip.style.left = rect.right + "px";
    tooltip.style.top = rect.top + 18 + "px";
    tooltip.style.display = "block";

    // next frame, adjust to account for width if overflowing
    requestAnimationFrame(() => {
        const tipRect = tooltip.getBoundingClientRect();
        tooltip.style.left = rect.right - tipRect.width + "px";
    });
}

function HideTooltip() {
    tooltip.style.display = "none";
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