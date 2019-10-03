Node CLI game example
===
About the project
---
There is a 4x4 map laid out with with each tile unexplored, players are required to explore the map and encounter beasts, firends, bosses and blockages.

The concept is called "Finding Ciri", where you are Geralt of Rivia, Ciri has ran away and you have to find her! You can also play this with [Gwent cards](https://i.ytimg.com/vi/SkfzMVySZ74/maxresdefault.jpg).

Basic Rules
---
- Main objective is to find Ciri 'tile'.
- You can move **1 step per turn** and you have **15 POWER**
- The map is laid out randomly based on the cards in the `lib` folder, player can move in a given direction at once.
- When you move to a tile, it could be a monster, boss, weather/special or a friend, based on that you will enter the interaction screen.
- When in a fight, the winner is decided by taking your power into consideration, more power = more chance of winning.
    - take your **POWER** and the monster/boss **POWER**
    - Chance formula of you winning the fight is : `YOUR-POWER/(MOSTER/BOSS-POWER + YOUR-POWER)%`
        - Example, you encounter 4 **POWER** monster, so your chance of winning would be *(15/4+15)%* that is *79%*, so take a random number generator, and hit the generate button, if the number is lower than or equal to 79 then you win, else the monster wins.
- When a friend joins your party, thier **POWER** is added to your power for next fights.
- If you encounter a boss, you fight them in a set of best of 3. After defating the boss you may gain a reward or complete an objective.

# How to run?

1. clone repo
2. `npm install`
3. `npm run serve` or `node src/app.js`

![Preview](./assets/example.gif?raw=true "Preview")

About the development
---
This is a hobby project inspired by Gwent cards and was supposed to be played using those until I decided to make this CLI game. I will add more info here as the development continues. Currently the game does have some on going bugs e.g. player indicator on the map not in sync, game closes on move when character is not in sync with map display, etc. ¯\\\_(ツ)_/¯ However, it still gives a good idea on how to make a CLI application.

- `lib/` : Contains data about all the cards and player.
- `battle-engine.js` : Mainly responsible for battle stages.
- `app.js` : entry point of the game, does everything possible cause why not.
- `config.js` : Used for default values and map size initalization.
- `debug.js` : Used for pretty printing stuff on the console.
- `map-engine.js` : Mainly responsible for drawing map array, movement, etc.

Debugging (using [VSCode](https://code.visualstudio.com/))
---
- Go to preferences and search for `node debug`
- Set `auto attach` to `on`
- Toggle a breakpoint
- On terminal you can run  `node --inspect src/app.js`

License
---
[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)

_Note: Only the names have been referenced from [The Witcher](https://en.wikipedia.org/wiki/The_Witcher) Universe. I don't own any of the characters, this project is not releated in any way to [CD Projekt Red](https://en.cdprojektred.com/) or [The Witcher](https://en.wikipedia.org/wiki/The_Witcher) Universe._