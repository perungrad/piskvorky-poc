require(["libs/fix", "game"], function (fixJS, game) {
    'use strict';

    fixJS.fixAll();

    game.init();

    game.on('roundEnd', function (winner, stats) {
        console.log(winner);
        console.log(stats);
    });
});
