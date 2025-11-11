
var allTech = {
    job: {
        name: "Get A Job",
        unlocks: ['shopping'],
        output: "You found a job at a local bookstore. The money is rolling in, now you need something to spend it on.",
        action() {
            if (debug) stats["Money"] = 10000;
            AddTime("Work", 8);
        }
    },
    shopping: {
        name: "Shopping",
        cost: {
            Money: 100
        },
        unlocks: ['reading', 'apartment'],
        output: "You can now spend some time shopping. You'll be buying books, because that's all you know.",
        action() {
            AddStat("Books", 0, 10);
            if (debug) stats["Books"] = 10000;
            AddTime("Shop");
        }
    },
    reading: {
        name: "Reading",
        cost: {
            Books: 5
        },
        unlocks: ['workEfficiency', 'readingEfficiency', 'bookReselling'],
        output: "You now know how to read. Unfortunately, some books were lost in the process (Don't ask)",
        action() {
            AddStat("Knowledge");
            if (debug) stats["Knowledge"] = 10000;
            AddTime("Reading");
        }
    },
    employeeDiscount: {
        name: "Employee Discount",
        output: "You've passed your probation period at the bookstore. Books will now be cheaper thanks to the employee discount.",
    },
    customerRewards: {
        name: "Customer Rewards",
        output: "You've just discovered the customer loyalty card. You will now get books at a discounted rate.",
    },
    customerRewards2: {
        name: "Customer PLUS",
        output: "You've reached the next level of the loyalty program at the bookstore.",
    },
    customerRewards3: {
        name: "Customer ULTRA",
        output: "You've reached the next level of the loyalty program at the bookstore.",
    },
    customerRewards4: {
        name: "Customer SUPREME",
        output: "You've reached VIP level customer at the bookstore.",
    },
    workEfficiency: {
        name: "Work Efficiency",
        cost: {
            Knowledge: 20
        },
        output: "You have learned how to be more efficient as a librarian. Luckily your boss has decided to share the increased profits with you in the form of a raise.",
        repeatable: true
    },
    readingEfficiency: {
        name: "Reading Efficiency",
        cost: {
            Knowledge: 20
        },
        output: "You can now read more quickly.",
        repeatable: true
    },
    bookReselling: {
        name: "Book Reselling",
        cost: {
            Knowledge: 20
        },
        output: "You just realised that after you read books, you can resell them instead of throwing them out. Whoops"
    },
    apartment: {
        name: "Apartment",
        cost: {
            Money: 3000
        },
        unlocks: ['basement'],
        output: "You now have a nice basement apartment."
    },
    basement: {
        name: "Sub Basement",
        cost: {
            Knowledge: 40
        },
        unlocks: ['bookshelves'],
        output: "The sub-basement will make a nice place to store all the books you haven't read yet. If only you had something to put them on."
    },
    bookshelves: {
        name: "Bookshelves",
        cost: {
            Knowledge: 40
        },
        output: "You've just learned about this interesting thing called a shelf.",
        action() {
            CreateLab();
        }
    },
    mysteriousBook: {
        name: "Study Mysterious Book",
        cost: {
            Knowledge: 80
        },
        unlocks: ['magicTheory']
    },
    magicTheory: {
        name: "Magic Theory",
        cost: {
            Knowledge: 100
        },
        unlocks: ['circleTheory'],
        output: "Apparently some people called mages have a special ability to absorb the energy around them and manipulate it in ways science cannot explain."

    },
    circleTheory: {
        name: "Magic Circle Theory",
        cost: {
            Knowledge: 100
        },
        unlocks: ['spellTheory'],
        output: "You follow the book's instructions and are able to use a Magic Circle to feel the ambient power in the air around you."
    },
    spellTheory: {
        name: "Spell Theory",
        cost: {
            Knowledge: 100
        },
        unlocks: ['manaTheory', 'intelligenceTheory', 'focusTheory', 'potionTheory', 'wisdomTheory'],
        output: "You are able to use the magic circle and the energy in the air around you to cast spells."
    },
    manaTheory: {
        name: "Mana Theory",
        cost: {
            Knowledge: 100
        },
        output: "Mages are limited by their capacity to hold magic.",
        action() {
            AddStat("Mana");
        }
    },
    intelligenceTheory: {
        name: "Intelligence Theory",
        cost: {
            Knowledge: 100
        },
        output: "The strength of a Mage's spells is determined by their intelligence.",
        action() {
            AddStat("Intelligence");
        }
    },
    wisdomTheory: {
        name: "Wisdom Theory",
        cost: {
            Knowledge: 100
        },
        unlocks: ['wisdomPotion'],
        output: "Wisdom increases overall productivity. It is determined by the size of a wizards book collection.",
        action() {
            AddStat("Wisdom");
        }
    },
    focusTheory: {
        name: "Focus Theory",
        cost: {
            Knowledge: 100
        },
        output: "The speed at which Mages cast spells is determined by their focus.",
        action() {
            AddStat("Focus", 100);
            currentHours["Practice Magic"] = 0;
            UpdateHours();
        }
    },
    potionTheory: {
        name: "Potion Theory",
        cost: {
            Knowledge: 100
        },
        unlocks: ['potionTable', 'shelves'],
        output: "Using certain ingredients and your power you should be able to create potions. But you'll need vials, ingredients and a place to store them."
    },
    potionTable: {
        name: "Potion Table",
        cost: {
            Money: 1000
        },
        unlocks: ['energyPotion', 'wisdomPotion'],
        output: "You now have a place to make potions and store vials.",
        action() {
            AddLabRow("Potion Table", "10");
            AddStat("Vials");
            UpdatePotions();
        }
    },
    shelves: {
        name: "Shelves",
        cost: {
            Money: 1000
        },
        unlocks: ['energyPotion', 'wisdomPotion'],
        output: "You now have a place to store potion ingredients.",
        action() {
            AddLabRow("Shelves", "10");
            AddStat("Potion Ingredients");
        }
    },
    energyPotion: {
        name: "Energy Potion",
        cost: {
            Knowledge: 300
        },
        output: "You can now create energy potions to reduce your sleep time. They taste like coffee and redbull.",
        required: ['potionTable', 'shelves'],
        action() {
            AddStat("Energy Potion");
            AddTime("Make Potions");
            UpdatePotions();
        }
    },
    wisdomPotion: {
        name: "Wisdom Potion",
        cost: {
            Knowledge: 300
        },
        output: "You can now create wisdom potions to enhance your wisdom from books.",
        required: ['potionTable', 'shelves', 'wisdomTheory'],
        action() {
            AddStat("Wisdom Potion");
            AddTime("Make Potions");
            UpdatePotions();
        }
    }
};

//add stats gained/sec
//add stats production on mouseover
//show potions in lab and add option to drink or sell them