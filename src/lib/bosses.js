var bosses = [
    {
        name : "Imlerith",
        power : 10,
        reward : {
            property : 'freePass',
            depth: 0,
            type : 'number',
            assignment : 'add',
            value : 3,
            description : 'You don\'t have to fight next 3 monsters'
        }
    },
    {
        name : "Eredin",
        power : 15,
        reward : {
            property : 'objectives.wildHunt',
            depth : 1,
            type : 'boolean',
            assignment : 'update',
            value : true,
            description : 'Objective complete: You have defeated the wildhunt!'
        }
    }
];

module.exports = bosses;