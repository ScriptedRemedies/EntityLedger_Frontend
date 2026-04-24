export const VARIANTS = [
    {
        id: "STANDARD",
        name: "Standard",
        difficultyLevel: "Normal",
        // TODO: Fix below
        rulesDescription: "The classic gauntlet.",
        rules: [
            {
                id: 1,
                title: "GRADE REQUIREMENT",
                description: "Ash IV to Iridescent I."
            },
            {
                id: 2,
                title: "TRIAL WIN",
                description: "A trial is considered won if at least 3 survivors are sacrificed and the last survivor does not escape through a gate."
            },
            {
                id: 3,
                title: "PERMADEATH",
                description: "A Killer is considered dead if any survivor escapes through a gate, hatch is ok. Dead killers cannot be used again throughout the challenge."
            }
        ]
    },
    {
        id: "ADEPT",
        name: "Adept",
        // TODO: Fix below
        difficultyLevel: "Very Hard",
        rulesDescription: "No second chances. The Entity demands perfection.",
        rules: [
            {
                id: 1,
                title: "GRADE REQUIREMENT",
                description: "Ash IV to Iridescent I."
            },
            {
                id: 2,
                title: "RUTHLESS WIN",
                description: "A trial is only won on a Merciless Killer (4K) result. Anything less is a failure."
            }
        ]
    },
    {
        id: "BLOOD_MONEY",
        name: "Blood Money",
        difficultyLevel: "",
        rulesDescription: "",
        rules: [
            {
                id: 1,
                title: "",
                description: ""
            }
        ]
    },
    {
        id: "AFTERBURN",
        name: "Afterburn",
        difficultyLevel: "",
        rulesDescription: "",
        rules: [
            {
                id: 1,
                title: "",
                description: ""
            }
        ]
    },
    {
        id: "CHAOS_SHUFFLE",
        name: "Chaos Shuffle",
        difficultyLevel: "",
        rulesDescription: "",
        rules: [
            {
                id: 1,
                title: "",
                description: ""
            }
        ]
    },
    {
        id: "IRON_MAN",
        name: "Iron Man",
        difficultyLevel: "",
        rulesDescription: "",
        rules: [
            {
                id: 1,
                title: "",
                description: ""
            }
        ]
    }
];
