Finding CIRI!
===
About the game
---
You are Geralt of Rivia, Ciri has ran away, find her!

---
Basic Rules
---
- You can move **1 step per turn** and you have **15 POWER**
- The map is laid out randomly, each card is kept face down, each card is a tile on which you move.
- When you move to a tile, it could be a monster, boss, weather/special or a friend!
- When in a fight, the winner is decided by randomness.
    - taking your **POWER** and the monster/boss **POWER**
    - Chance formula of you winning the fight is : GERALT'S **POWER**/(MOSTER/BOSS **POWER** + GERALT'S **POWER**)
        - Example, you encounter 4 **POWER** monster, so your chance of winning would be *(15/4+15)\*100* that is *79%*, so take a random number generator, and hit the generate button, if the number is lower than or equal to 79 then you win, else the monster wins.
- When a friend joins your party, thier **POWER** is added to your power for next fights.

Friends
---
- Triss Merigold : If you encounter a monster next, you don't have to fight it. Join's your party.
- Yennefer of Vengerberg : Yennefer opens a portal, Your next step will be to a random position. She can Join your party.

How to run?
---
1. clone repo
2. `npm install`
3. `node app.js`

![Preview](./assets/example.gif?raw=true "Preview")

About the development
---
This is a hobby project inspired by Gwent cards and was supposed to be played using those until I decided to make this CLI game. I will add more info here as the development continues. Currently the game does have some on going bugs e.g. player indicator on the map not in sync, game closes on move when character is not in sync with map display, etc. ¯\\\_(ツ)_/¯ However, it still gives a good idea on how to make a CLI application.

- `lib/` : Contains data about all the cards.
- `battle-engine.js` : Mainly responsible for battle stages.
- `app.js` : entry point of the game, does everything possible cause why not.
- `config.js` : Used for default values and map size initalization.
- `debug.js` : Used for pretty printing stuff on the console.