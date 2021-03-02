
var allTech = {
    job: {
        name: "Get A Job",
        unlocks: ['shopping'],
        output: "You found a job at the local library. The money is rolling in, now you need something to spend it on."
    },
    shopping: {
        name: "Shopping",
        cost: {
            Money: 100
        },
        unlocks: ['reading', 'apartment'],
        output: "You can now spend some time shopping. You'll be buying books, because that's all you know."
    },
    reading: {
        name: "Reading",
        cost: {
            Books: 10
        },
        unlocks: ['workEfficiency', 'readingEfficiency', 'bookReselling'],
        output: "You now know how to read. Unfortunately, some books were lost in the process (Don't ask)"
    },
    workEfficiency: {
        name: "Work Efficiency",
        cost: {
            Knowledge: 20
        },
        output: "You have learned how to be more efficient as a librarian. Luckily your boss has decided to share the increased profits with you in the form of a raise."
    },
    readingEfficiency: {
        name: "Reading Efficiency",
        cost: {
            Knowledge: 20
        },
        output: "You can now read more quickly."
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
        output: "You've just learned about this interesting thing called a shelf."
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
        unlocks: ['manaTheory', 'intelligenceTheory', 'focusTheory', 'circleTheory']
    },
    manaTheory: {
        name: "Mana Theory",
        cost: {
            Knowledge: 100
        }
    },
    intelligenceTheory: {
        name: "Intelligence Theory",
        cost: {
            Knowledge: 100
        }
    },
    focusTheory: {
        name: "Focus Theory",
        cost: {
            Knowledge: 100
        }
    },
    circleTheory: {
        name: "Magic Circle Theory",
        cost: {
            Knowledge: 100
        }
    }
}
