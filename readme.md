Finding CIRI!
===
About the game
---
You are Geralt of Rivia, Ciri has ran away, find her!

---
Basic Rules (Can be played using Gwent Cards)
---
- You can move **1 step per turn** and you have **15 POWER**
- The map is laid out randomly based on the cards in the `lib` folder, player can move in a given direction at once.
- When you move to a tile, it could be a monster, boss, weather/special or a friend, based on that you will enter the interaction screen.
- When in a fight, the winner is decided by taking your power into consideration, more power = more chance of winning.
    - take your **POWER** and the monster/boss **POWER**
    - Chance formula of you winning the fight is : `YOUR-POWER/(MOSTER/BOSS-POWER + YOUR-POWER)%`
        - Example, you encounter 4 **POWER** monster, so your chance of winning would be *(15/4+15)%* that is *79%*, so take a random number generator, and hit the generate button, if the number is lower than or equal to 79 then you win, else the monster wins.
- When a friend joins your party, thier **POWER** is added to your power for next fights.

Friends (To be implemented)
---
- Triss Merigold : If you encounter a monster next, you don't have to fight it. Join's your party.
- Yennefer of Vengerberg : Yennefer opens a portal, Your next step will be to a random position. She can Join your party.

How to run?
---
1. clone repo
2. `npm install`
3. `npm run serve`

![Preview](./assets/example.gif?raw=true "Preview")

About the development
---
This is a hobby project inspired by Gwent cards and was supposed to be played using those until I decided to make this CLI game. I will add more info here as the development continues. Currently the game does have some on going bugs e.g. player indicator on the map not in sync, game closes on move when character is not in sync with map display, etc. ¯\\\_(ツ)_/¯ However, it still gives a good idea on how to make a CLI application.

- `lib/` : Contains data about all the cards and player.
- `battle-engine.js` : Mainly responsible for battle stages.
- `app.js` : entry point of the game, does everything possible cause why not.
- `config.js` : Used for default values and map size initalization.
- `debug.js` : Used for pretty printing stuff on the console.

Debugging (using VSCode)
---
- Go to preferences and search for `node debug`
- Set `auto attach` to `on`
- Toggle a breakpoint
- On terminal you can run  `node --inspect src/app.js`