const chalk = require("chalk");
const fs = require("fs");
const rn = require("random-number");
const { makerMenu } = require("./itemMaker");

const createGame = function () {
    //Todo: check if save.json already exists, and list stats.
    var templateUnparsed = fs.readFileSync("data/templates/saveTemplate.json");
    var templateUnparsedInv = fs.readFileSync("data/templates/playerInventoryTemplate.json");
    fs.writeFileSync("data/save.json", templateUnparsed);
    fs.writeFileSync("data/inventory.json", templateUnparsedInv);
    loadGame();
};

const loadGame = function () {
    var dataUnparsed = fs.readFileSync("data/save.json");
    var dataUnparsedInv = fs.readFileSync("data/inventory.json");
    api.data = JSON.parse(dataUnparsed);
    api.playerInv = JSON.parse(dataUnparsedInv)
};

const saveGame = function () {
    fs.writeFileSync("data/save.json", JSON.stringify(api.data));
};



const displayMainMenu = function() {
    console.log(chalk.green('Welcome to nodeAttack!'));
    console.log(chalk.yellow('Main menu:'));
    console.log(chalk.cyan("new       - New game"));
    console.log(chalk.blue("load      - Load saved game"));
    console.log(chalk.magenta("changelog - Show what was added"))
    console.log(chalk.red("exit      - Exit game"));
    console.log("");

    api.readline.question("Please enter a command: ", (command) => {
        //console.log(`You have entered ${command}.`);
        if(command == "new") {
            api.readline.question("Are you sure you want to begin a new game? (y/n) ", (answer) => {
                if(answer === "y") {
                    console.log(chalk.green("Alright, starting a new game for you."));
                    api.createGame()
                    api.gameLoop()
                } else if (answer === "n") {
                    console.log("Good, your save wasn't over written. Bringing you back to the main menu.")
                    api.displayMainMenu();
                } else {
                    console.log("Your response is not valid.")
                    console.log("Please provide a valid response.")
                    api.displayMainMenu();
                }
            })

        } else if(command == "load") {
            console.log(chalk.cyan(`Your save has been loaded.`));   
            api.loadGame()
            api.gameLoop()
    
        } else if(command == "exit") {
            console.log(chalk.yellow(`Goodbye, dear player.`));   
            process.exit(0);
        } else if (command == "changelog") {
            console.log(chalk.gray("---Version 1.2.1---"))
            console.log("- Small bug fixes")
            console.log("- More items")
            console.log("- Enemy scaling")
            console.log(chalk.gray("---Version 1.2.0---"))
            console.log("- Started change log")
            console.log("- Reworked whole game")
            console.log("- Menus and shop")
            console.log("")
            api.displayMainMenu()
        } else { 
            console.log(chalk.red(`Command "${command}" is not a valid command!`));   
            console.log("");
            api.displayMainMenu();     
        }
    
    });    
}

const gameLoop = function () {

    console.log(chalk.grey("----Game menu----"))
    console.log(chalk.redBright("fight  - Fight next NPC"));
    console.log(chalk.blueBright("shop   - Enter shop and buy/sell"));
    console.log(chalk.greenBright("back   - Back to main menu"));
    console.log(chalk.yellow("stats  - Displays your character stats"));
    console.log(chalk.magentaBright("inv    - Displays your inventory"))
    console.log(chalk.white("equip  - Equips an item from ur inventory"));
    console.log(chalk.green("save   - Saves the game"));
    console.log(chalk.cyan("reload - Check stats for change"));
    console.log("");

    api.readline.question("Please enter a command: ", (command) => {
        //console.log(`You have entered ${command}.`);
        switch (command) {
            case "stats":
                console.log(chalk.grey("=========="))
                console.log("Displaying your stats: ");
                console.log(chalk.green(`Level: ${api.data.player.level}`))
                console.log(chalk.yellow(`Gold: ${api.data.player.gold}`))
                console.log(chalk.red(`Health points: ${api.data.player.health}`))
                console.log(chalk.blue(`Strength points: ${api.data.player.strength}`))
                console.log(chalk.magenta(`Current weapon: ${api.data.player.heldWeapon}`))
                console.log(chalk.grey("=========="))
                console.log(chalk.cyan(`You have ${api.data.player.currentxp}/${api.data.player.xpforlevelup} experience points required to level up to the next level.`))
                api.gameLoop();
                //Stats done
                break;

            case "shop":
                console.log("Shopkeeper: Welcome to my shop.")
                api.warpShop()
                break;

            case "dev":
                api.readline.question("Whats the password? \n>", (password) => {
                    if(password === api.devPassword) {
                        devmenu()
                    } else {
                        console.log("no!")
                        gameLoop()
                    }
                })
                break;
            case "fight":
                console.log(chalk.cyanBright("You have entered a fight."))
                generateEnemy()
                battleLoop()
                // console.log(api.data)
                break;

            case "save":
                console.log(chalk.green("Your stats have been saved!"));
                api.saveGame()
                api.gameLoop()
                //saving is done(handled by save and load functions)
                break;

            case "reload":
                    console.log(chalk.blue("Stats reloaded!"));
                    api.loadGame()
                    api.gameLoop()
                    //saving is done(handled by save and load functions)
                break;

            case "back":
                console.log(chalk.green("Sending you to the main menu."));
                api.displayMainMenu();
                //sends to mainmenu
                break;

            case "inv":
                showInventory()
                break;

            case "equip":
                equipItemFromGameLoop()
                break;

            default:
                console.log(chalk.red(`Command "${command}" is not a valid command!`));
                console.log("");
                api.gameLoop();
                break;
        }
    });
};

const devmenu = function() {
    console.log(chalk.magenta("Developer menu. :D"))
    console.log(chalk.yellow("givegold - Gives the player 20 gold"))
    console.log(chalk.red("givedevitem - U get developer item :)"))
    console.log(chalk.green("levelup   - Levels the player up"))
    console.log(chalk.blue("back       - Back to main menu :)"))
    console.log(chalk.redBright("makeitem      - Creates an item for shop(can be used to add more items :))"))
    api.readline.question("Input command: ", (command) => {
        if(command === "givegold") {
            var newdevelopermadegold = api.data.player.gold + 20
            console.log(chalk.red(`You now have ${newdevelopermadegold} gold.`))
            api.data.player.gold = newdevelopermadegold
            saveGame()
            loadGame()
            devmenu()
        } else if (command === "levelup") {
            var newdevelopermadelvl = api.data.player.level + 1
            console.log(chalk.red(`You are now level ${newdevelopermadelvl}.`))
            api.data.player.level = newdevelopermadelvl
            saveGame()
            loadGame()
            devmenu()
        } else if (command === "back") {
            gameLoop()
        } else if (command === "makeitem") {
            api.makerMenu()
        } else if (command === "givedevitem") {
            var playerInv = JSON.parse(fs.readFileSync("data/inventory.json"))
            playerInv.push({
                "name" :"iamdev",
                "description": "Instantly kills anything. Developer item.",
                "type": "weapon",
                "level": 1,
                "value": 69420,
                "strength": 42069
        })
        console.log("recieve dev item")
            var playerInvStringified = JSON.stringify(playerInv)
            fs.writeFileSync("data/inventory.json", playerInvStringified)
            saveGame()
            loadGame()
            devmenu()
        }
        else {
            console.log(chalk.cyan(`${command} is not a valid command.`))
            devmenu()
        }
    })
}

// const inventoryLoop = function() {
//     console.log("Please make a choice: ")
//     console.log("inventory - Displays you your inventory")
//     console.log("equip     - Lets you equip and item from your inventory")
//     console.log("back      - Back to the main menu")
//     api.readline.question("Please enter a command: ", (command) => {
//         if(command === "inventory") {

//         } else if (command === "equip") {

//         } else if (command === "back") {

//         } else {

//         }
//     })
// }


const showInventory = function() {
    api.playerInv = JSON.parse(fs.readFileSync("data/inventory.json"))
    console.log(chalk.grey("--------------------"))
    console.log(chalk.cyan(`In your inventory you have ${api.playerInv.length} item(s) in your inventory.`))
    console.log("Here are their stats individualy.")
    console.log(chalk.grey("--------------------"))
    api.playerInv.forEach(item => {
        if(item.type == "armor") {
            console.log(chalk.blue(`Type: ${item.type}`))
            console.log(chalk.red(`Name: ${item.name}`))
            console.log(chalk.green(`Description: ${item.description}`))
            console.log(chalk.cyan(`Required level: ${item.level}`))
            console.log(chalk.yellow(`Value: ${item.value}`))
            console.log(chalk.magenta(`Protection: ${item.protection}`))
            console.log(chalk.grey("--------------------"))
        } else if (item.type == "weapon") {
            console.log(chalk.blueBright(`Type: ${item.type}`))
            console.log(chalk.redBright(`Name: ${item.name}`))
            console.log(chalk.greenBright(`Description: ${item.description}`))
            console.log(chalk.cyanBright(`Required level: ${item.level}`))
            console.log(chalk.yellowBright(`Value: ${item.value}`))
            console.log(chalk.magentaBright(`Strength: ${item.strength}`))
            console.log(chalk.grey("--------------------"))
        }

    });
    gameLoop()
}

const equipItem = function() {
    api.playerInv.forEach(item => {
        if(item.type == "armor") {
            console.log(chalk.blue(`Type: ${item.type}`))
            console.log(chalk.red(`Name: ${item.name}`))
            console.log(chalk.green(`Description: ${item.description}`))
            console.log(chalk.cyan(`Required level: ${item.level}`))
            console.log(chalk.yellow(`Value: ${item.value}`))
            console.log(chalk.magenta(`Protection: ${item.protection}`))
            console.log(chalk.grey("--------------------"))
        } else if (item.type == "weapon") {
            console.log(chalk.blueBright(`Type: ${item.type}`))
            console.log(chalk.redBright(`Name: ${item.name}`))
            console.log(chalk.greenBright(`Description: ${item.description}`))
            console.log(chalk.cyanBright(`Required level: ${item.level}`))
            console.log(chalk.yellowBright(`Value: ${item.value}`))
            console.log(chalk.magentaBright(`Strength: ${item.strength}`))
            console.log(chalk.grey("--------------------"))
        }
    });
    api.readline.question("What item would you like to equip? ", (itemToEquip) => {
        let item = api.playerInv.find((item) => {return item.name === itemToEquip})
        if(item === "undefined") {
            console.log("Item not found.")
            equipItem()
            //item not found
        } else {
            //equip item
            if(item.type == "weapon") {
                api.data.player.heldWeapon = item.name
                console.log("Successfully equiped " + api.data.player.heldWeapon)
                saveGame()
                loadGame()
                battleLoop()
            } else if (item.type == "armor") {
                api.data.player.equipedArmor = item.name
                console.log(chalk.blueBright(`Successfully equiped ${api.data.player.equipedArmor}.`))
                saveGame()
                loadGame()
                battleLoop()
            }

        }
    })
}
const equipItemFromGameLoop = function() {
    api.playerInv.forEach(item => {
        console.log(chalk.blue(`Type: ${item.type}`))
        console.log(chalk.red(`Name: ${item.name}`))
        console.log(chalk.green(`Description: ${item.description}`))
        console.log(chalk.cyan(`Required level: ${item.level}`))
        console.log(chalk.yellow(`Value: ${item.value}`))
        console.log(chalk.magenta(`Strength: ${item.strength}`))
        console.log(chalk.grey("--------------------"))
    });
    api.readline.question("What item would you like to equip? ", (itemToEquip) => {
        let item = api.playerInv.find((item) => {return item.name === itemToEquip})
        if(item === "undefined") {
            console.log("Item not found.")
            equipItem()
            //item not found
        } else {
            //equip item
            api.data.player.heldWeapon = item.name
            console.log("Successfully equiped " + api.data.player.heldWeapon)
            saveGame()
            loadGame()
            gameLoop()
        }
    })
}
const attackEnemy = function() {
    //check hp before attacking
    var genP = rn.generator({
        min: 1,
        max: 2,
        integer: true
    })
    var hitchance = genP()
    if(hitchance === 1) {
        let heldItem = api.playerInv.find((item) => {return item.name === api.data.player.heldWeapon})
        var strengthWweapon = api.data.player.strength + heldItem.strength
        // console.log(strengthWweapon)
        // console.log(api.data.enemy.health)
        var newenemyhp = api.data.enemy.health - strengthWweapon
        console.log(chalk.redBright("Hit!"))
        console.log(`${chalk.green("They have")} ${api.data.enemy.health} ${chalk.green("health.")}`)
        console.log(`${chalk.green("You dealt ")}` + `${chalk.magentaBright(strengthWweapon)}` + `${chalk.green(" damage to the enemy.")}`)
        console.log(chalk.green("After hitting them they have " + `${chalk.yellow(newenemyhp)} health.`))
        console.log(chalk.grey(`(${api.data.enemy.health} - ${strengthWweapon} = ${newenemyhp})`))
        api.data.enemy.health = newenemyhp
        saveGame()
        loadGame()
        checkHp()
        // console.log(newenemyhp)
    } else {
        //attack fails
        console.log(chalk.redBright("Your attack failed. They didn't take any damage."))
    }
    if(api.data.enemy.health <= 0) {
        //hp gets checked already in attacking phase
    } else {
        console.log(chalk.blueBright("The enemy is thinking about what they should do..."))
        setTimeout(() => {
            enemyAi()
        }, 2500);
    }
}

const healSelf = function() {
    var genP = rn.generator({
        min: 1,
        max: 2,
        integer: true
    })
    var healchance = genP()
    if(healchance === 1) {
        //heals
        var newhptoadd = api.data.player.level + 5 - 2 + api.data.player.level
        var newhp = api.data.player.health + newhptoadd
        console.log(chalk.greenBright("Success!"))
        console.log(chalk.green("You have " + api.data.player.health + " health."))
        console.log(chalk.green("After healing you have gotten " + newhptoadd + " health points."))
        console.log(chalk.green("You now have " + newhp + " health."))
        api.data.player.health = newhp
        saveGame()
        loadGame()
    } else {
        //heal fails
        console.log("Your heal failed. You didn't gain any health.")
    }
    if(api.data.enemy.health <= 0) {
        //nothing here xd
    } else {
        console.log(chalk.blueBright("The enemy is thinking about what they should do..."))
        setTimeout(() => {
            enemyAi()
        }, 2500);
    }

}

const enemyAi = function() {
    if(api.data.enemy.health <= 0) {

    }
    var gen = rn.generator({
        min: 1,
        max: 4,
        integer: true
    })
    var chance = gen()
    if(chance === 1 || 2) {
        //attack
        var genP = rn.generator({
            min: 1,
            max: 2,
            integer: true
        })
        var hitchance = genP()
        if(hitchance === 1) {
            // let heldItem = api.playerInv.find((item) => {return item.name === api.data.player.heldWeapon})
            // var strengthWweapon = api.data.player.strength + heldItem.strength
            // console.log(strengthWweapon)
            // console.log(api.data.enemy.health)
            var newplayerhp = api.data.player.health - api.data.enemy.strength
            console.log(chalk.redBright("Hit!"))
            console.log(`${chalk.green("You have")} ${api.data.player.health} ${chalk.green("health.")}`)
            console.log(`${chalk.green("They dealt ")}` + `${chalk.magentaBright(api.data.enemy.strength)}` + `${chalk.green(" damage to you.")}`)
            console.log(chalk.green("After hitting you, you are left with " + `${chalk.yellow(newplayerhp)} health.`))
            console.log(chalk.grey(`(${api.data.player.health} - ${api.data.enemy.strength} = ${newplayerhp})`))
            api.data.player.health = newplayerhp
            saveGame()
            loadGame()
            checkHp()
            // console.log(newenemyhp)
        } else {
            //attack fails
            console.log(chalk.redBright("Their attack failed. You didn't take any damage."))
        }
    } else {
        //heal
        var genP = rn.generator({
            min: 1,
            max: 2,
            integer: true
        })
        var healchance = genP()
        if(healchance === 1) {
            //heals
            var newhptoadd = api.data.enemy.health + 5 - 2 + api.data.player.level
            var newhp = api.data.enemy.health + newhptoadd
            console.log(chalk.greenBright("Success!"))
            console.log(chalk.green("They have " + api.data.enemy.health + " health."))
            console.log(chalk.green("After healing they have gotten " + newhptoadd + " health points."))
            console.log(chalk.green("They now have " + newhp + " health."))
            api.data.enemy.health = newhp
            saveGame()
            loadGame()
        } else {
            //heal fails
            console.log("Their heal failed. They didn't gain any health.")
        }
    }
    console.log(chalk.blueBright("It is your turn!"))
    setTimeout(() => {
        battleLoop()
    }, 1000);
}

const checkHp = function() {
    if(api.data.player.health <= 0) {
        //player loses, nothing much happens
        console.log(chalk.red("Sorry there lad, you lost."))
        console.log(chalk.redBright("Better luck next time. Sending you to the lobby."))
        gameLoop()
    } else if (api.data.enemy.health <= 0) {
        api.data.player.health = 20
        saveGame()
        loadGame()
        //player wins !! after winning give player gold, xp and check if player can level up
        console.log(chalk.green("Great job, you won! For your efforts, you got some experience and gold."))
        console.log(chalk.gray("-------------"))
        giveGold()
        giveXP()
        gameLoop()
    }
}

const giveXP = function() {
    var randomxpgen = rn.generator({
        min: 12,
        max: 31,
        integer: true
    })
    var xptogive = randomxpgen()
    api.data.player.currentxp = api.data.player.currentxp + xptogive
    saveGame()
    loadGame()
    console.log(chalk.greenBright(`You got ${xptogive} xp points.`))
    if(api.data.player.currentxp >= api.data.player.xpforlevelup) {
        api.data.player.currentxp = api.data.player.currentxp - api.data.player.xpforlevelup
        api.data.player.strength = api.data.player.strength + 2
        api.data.player.health = api.data.player.health + 5
        api.data.player.maxhealth = api.data.player.maxhealth + 5
        api.data.player.xpforlevelup = api.data.player.xpforlevelup + 10
        saveGame()
        loadGame()
        console.log(chalk.redBright(`Great job, you leveled up! You now have ${api.data.player.strength} base strength and you have ${api.data.player.maxhealth} base health.`))
    } else {
        console.log(chalk.gray("(You don't have enough xp to level up.)"))
    }
}

const giveGold = function() {
    var randomgoldgen = rn.generator({
        min: 6,
        max: 17,
        integer: true
    })
    var goldtogive = randomgoldgen()
    api.data.player.gold = api.data.player.gold + goldtogive
    saveGame()
    loadGame()
    console.log(chalk.yellow(`You got ${goldtogive} gold.`))
}

const generateEnemy = function() {
    var genEstrength = rn.generator({
        min: 3,
        max: 6,
        integer: true
    })
    var genEhealth = rn.generator({
        min: 17,
        max: 28,
        integer: true
    })
    var eStrength = genEstrength()
    var eHealth = genEhealth()
    var newehealth = api.data.player.level * 2 + eHealth
    var newestrength = api.data.player.level * 1.5 + eStrength
    api.data.enemy.health = newehealth
    api.data.enemy.strength = newestrength
    api.data.player.health = api.data.player.maxhealth
    saveGame()
    console.log(chalk.green("Enemy stats successfully generated!"))
}

const showStatsInGame = function() {
    console.log(chalk.gray("------------------"))
    console.log(chalk.green(`Your health: ${api.data.player.health}`))
    console.log(chalk.green(`Your strength: ${api.data.player.strength}`))
    console.log(chalk.green(`Your weapon: ${api.data.player.heldWeapon}`))
    console.log(chalk.gray("------------------"))
    console.log(chalk.magentaBright(`Enemy health: ${api.data.enemy.health}`))
    console.log(chalk.magentaBright(`Enemy strength: ${api.data.enemy.strength}`))
    console.log(chalk.gray("------------------"))
}

const battleLoop = function() {
    console.log(chalk.yellowBright("attack   - Attacks the enemy (50% chance to fail)"))
    console.log(chalk.blueBright("heal - Heals you (50% chance to fail)"))
    console.log(chalk.redBright("stats - Shows your and the enemies stats"))
    console.log(chalk.white("equip   - Equips an item from your inventory"))
    console.log(chalk.cyanBright("back        - Leaves the fight(resets the enemy stats btw)"))
    api.readline.question("Make a choice: ", (choice) => {
        if(choice === "attack") {
            if(api.data.player.health <= 0) {
                checkHp()
            } else {
                attackEnemy()
            }
        } else if(choice === "heal") {
            healSelf()
        } else if (choice === "stats") {
            showStatsInGame()
            battleLoop()
        } else if (choice === "equip") {
            equipItem()
        } else if (choice === "back") {
            gameLoop()
        } else {
            console.log(`${choice} is not valid. Try again.`)
            battleLoop()
        }
    })
}

module.exports = {
    checkHp: checkHp,
    enemyAi: enemyAi,
    attackEnemy: attackEnemy,
    healSelf: healSelf,
    createGame,
    gameLoop,
    loadGame,
    saveGame,
    displayMainMenu,
    // inventoryLoop
};