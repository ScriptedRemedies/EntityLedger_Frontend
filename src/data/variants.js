export const VARIANTS = [
    {
        id: "STANDARD",
        name: "Standard",
        difficultyLevel: "Normal",
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
            },
            {
                id: 4,
                title: "VARIATIONS",
                description: "Player can choose to turn on or off the settings listed below:",
                bullets: [
                    "LoadOut Restrictions: Edit what, if any, perks and add-ons are allowed and at what grades.",
                    "Consecutive Matches: Once you start a match with a killer, you must continue playing that killer until they die.",
                    "Same Build: Player must use the same perks with each killer throughout the entire challenge."
                ]
            },
            {
                id: 5,
                title: "GAMEPLAY",
                description: "You cannot quit or turn off the game to saver a killer if a match goes poorly. Severe hacking, lag-switching, or teaming from survivors is an exception in which the killer would not die if the match resulted in a loss."
            },
            {
                id: 6,
                title: "CHALLENGE FAILURE",
                description: "Challenge results in a failure if player does not have any killers left before reaching Iridescent I."
            }
        ]
    },
    {
        id: "ADEPT",
        name: "Adept",
        difficultyLevel: "Normal",
        rulesDescription: "Master their true power.",
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
                description: "A killer is considered dead if any survivor escapes through a gate, hatch is ok. Dead killers cannot be used again throughout the challenge."
            },
            {
                id: 4,
                title: "LOADOUT RESTRICTIONS",
                description: "Players must use the 3 unique (adept) perks for the killer they've selected for a trial. No fourth perk slot is allowed."
            },
            {
                id: 5,
                title: "RANK-BASED RESTRICTIONS",
                bullets: [
                    "Ash to Bronze: Adept perks + Yellow add-ons + Hatch offering allowed.",
                    "Bronze to Silver: Adept perks + No add-ons + Hatch offering allowed.",
                    "Silver to Gold: Adept perks + No add-ons + No offerings allowed.",
                    "Gold to Iridescent: Adept perks + No add-ons + No slugging + No hatch offering.",
                    "Iridescent IV to Iridescent I: All previous restrictions, plus a 20-second AFK start to the trial."
                ]
            },
            {
                id: 6,
                title: "GAMEPLAY",
                description: "You cannot quit or turn off the game to saver a killer if a match goes poorly. Severe hacking, lag-switching, or teaming from survivors is an exception in which the killer would not die if the match resulted in a loss."
            },
            {
                id: 7,
                title: "CHALLENGE FAILURE",
                description: "Challenge results in a failure if player does not have any killers left before reaching Iridescent I."
            }
        ]
    },
    {
        id: "BLOOD_MONEY",
        name: "Blood Money",
        difficultyLevel: "Hard",
        rulesDescription: "Pay to play.",
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
                description: "A killer is considered dead if any survivor escapes through a gate, hatch is ok. Dead killers cannot be used again throughout the challenge."
            },
            {
                id: 4,
                title: "LOADOUT RESTRICTIONS",
                description: "Players can have up to 4 perks but each perk and add-on has it's own price to pay before starting the trial."
            },
            {
                id: 5,
                title: "KILLER COOLDOWN",
                description: "After 2 wins in a row with the same killer, that killer must go on cooldown and cannot be used for 2 consecutive trials."
            },
            {
                id: 6,
                title: "STARTING FUNDS",
                description: "Player will start with $20."
            },
            {
                id: 7,
                title: "BONUS CASH",
                bullets: [
                    "4K with 5 Gens Left",
                    "4K with 4 Gens Left",
                    "Close Hatch"
                ]
            },
            {
                id: 8,
                title: "PENALTIES",
                bullets: [
                    "Generator is completed before first hook",
                    "The last generator is completed",
                    "One gate is opened",
                    "Survivor escapes through hatch"
                ]
            },
            {
                id: 9,
                title: "SELLING KILLERS",
                description: "If a player does not have enough funds to start a trial they must sell enough killers to afford the new trial."
            },
            {
                id: 10,
                title: "GAMEPLAY",
                description: "You cannot quit or turn off the game to saver a killer if a match goes poorly. Severe hacking, lag-switching, or teaming from survivors is an exception in which the killer would not die if the match resulted in a loss."
            },
            {
                id: 11,
                title: "CHALLENGE FAILURE",
                description: "Challenge results in a failure if player does not have any killers left or reaches a negative balance before reaching Iridescent I."
            }
        ]
    },
    {
        id: "AFTERBURN",
        name: "Afterburn",
        difficultyLevel: "Very Hard",
        rulesDescription: "The redemption run.",
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
                description: "A killer is considered dead if any survivor escapes through a gate, hatch is ok. Dead killers cannot be used again throughout the challenge."
            },
            {
                id: 4,
                title: "KILLER COOLDOWN",
                description: "After 2 wins in a row with the same killer, that killer must go on cooldown and cannot be used for 3 consecutive trials."
            },
            {
                id: 5,
                title: "KILLER ROSTER",
                description: "The Killer roster at the start of the season will include all alive killers from the Blood Money Season they have chosen."
            },
            {
                id: 6,
                title: "PERK RESTRICTIONS",
                description: "Perks from dead Killers cannot be used."
            },
            {
                id: 7,
                title: "STARTING FUNDS",
                description: "Player will start the season with the remaining funds they have from the Blood Money Season they have chosen."
            },
            {
                id: 8,
                title: "BONUS CASH",
                bullets: [
                    "4K with 5 Gens Left",
                    "4K with 4 Gens Left",
                    "4K with 3 Gens Left",
                    "Close Hatch"
                ]
            },
            {
                id: 9,
                title: "PENALTIES",
                bullets: [
                    "Generator is completed before first hook",
                    "The last generator is completed",
                    "One gate is opened",
                    "Survivor escapes through hatch"
                ]
            },
            {
                id: 10,
                title: "GAMEPLAY",
                description: "You cannot quit or turn off the game to saver a killer if a match goes poorly. Severe hacking, lag-switching, or teaming from survivors is an exception in which the killer would not die if the match resulted in a loss."
            },
            {
                id: 11,
                title: "CHALLENGE FAILURE",
                description: "Challenge results in a failure if player does not have any killers left or reaches a negative balance before reaching Iridescent I."
            }
        ]
    },
    {
        id: "CHAOS_SHUFFLE",
        name: "Chaos Shuffle",
        difficultyLevel: "Very Hard",
        rulesDescription: "Leave it to the Entity",
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
            },
            {
                id: 4,
                title: "LOADOUT RESTRICTIONS",
                description: "All four perk slots must be completely randomized before every trial. No add-ons or offerings are allowed. If the randomizer selects a perk you do not have unlocked on your chosen killer, you must re-roll that specific perk slot until you land on one you own."
            },
            {
                id: 5,
                title: "KILLER COOLDOWN",
                description: "After 2 wins in a row with the same killer, that killer must go on cooldown and cannot be used for 2 consecutive trials."
            },
            {
                id: 6,
                title: "STARTING TOKENS",
                description: "Player will start with 3 Re-roll Tokens. A token can be spent to completely re-roll a terrible perk loadout before a trial begins. You must re-roll the entire build; you cannot re-roll individual perks."
            },
            {
                id: 7,
                title: "BONUS TOKENS",
                bullets: [
                    "4K with 5 Gens Left",
                    "4K with 4 Gens Left"
                ]
            },
            {
                id: 8,
                title: "PENALTIES",
                description: "If a player forgets to randomize their perks and loads into a match with a custom build, that killer is immediately considered dead and the trial counts as a loss."
            },
            {
                id: 9,
                title: "GAMEPLAY",
                description: "You cannot quit or turn off the game to saver a killer if a match goes poorly. Severe hacking, lag-switching, or teaming from survivors is an exception in which the killer would not die if the match resulted in a loss."
            },
            {
                id: 10,
                title: "CHALLENGE FAILURE",
                description: "Challenge results in a failure if player does not have any killers left before reaching Iridescent I."
            }
        ]
    },
    {
        id: "IRON_MAN",
        name: "Iron Man",
        difficultyLevel: "Impossible",
        rulesDescription: "The ultimate endurance test.",
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
                description: "There is no individual Killer Permadeath - there is only Run Death. If any survivor escapes through an exit gate (hatch is acceptable), the trial is considered a loss and the entire challenge is immediately failed."
            },
            {
                id: 4,
                title: "LOADOUT RESTRICTIONS",
                description: "Players may use any perks and add-ons they wish, but with a strict singleton rule: no single perk or add-on can be used more than once across the entire challenge. Once a perk or add-on is equipped for for a trial, it is permanently locked for the remainder of the run."
            },
            {
                id: 5,
                title: "KILLER COOLDOWN",
                description: "A Killer can only be played once per rotation. You must cycle through the entire roster sequentially. You cannot repeat a Killer until you have played every single available killer in the game at least once."
            },
            {
                id: 6,
                title: "THE MARATHON TIMER",
                description: "The entire challenge must be complete in a single, continuous sitting. The player cannot go to sleep or stop the run for the dat. Breaks are strictly limited to a maximum of 15 minutes between matches for food or bathroom use."
            },
            {
                id: 7,
                title: "MULLIGAN SAFETY NET",
                description: "A Mulligan can be spent to forgive a single exit gate escape and keep the run alive. A player can only hold a maximum of 1 Mulligan at any given time. Players can earn back a Mulligan by:",
                bullets: [
                    "4K with 5 Gens Left"
                ]
            },
            {
                id: 8,
                title: "PENALTIES",
                description: "If a player accidentally equipes a perk or add-ong that was already used in a previous match, the run is instantly forfeited."
            },
            {
                id: 9,
                title: "GAMEPLAY",
                description: "You cannot quit or turn off the game to saver a killer if a match goes poorly. Severe hacking, lag-switching, or teaming from survivors is an exception in which the killer would not die if the match resulted in a loss."
            },
            {
                id: 10,
                title: "CHALLENGE FAILURE",
                description: "The challenge results in a failure if a survivor escapes through an exit gate (and you have no Mulligans to use), is you violate the Marathon Timer by taking too long of a break, or if you accidentally use a locked-out perk or add-on."
            }
        ]
    }
];
