define(["kineticContext", "players", "stats", "board"], function(drawingContext, players, stats, board) {
    stats.addPlayer(players.TYPE_NONE, 'Ties');
    stats.addPlayer(players.TYPE_HUMAN, 'Player');
    stats.addPlayer(players.TYPE_AI, 'AI');

    var newRound = function() {
    };

    var restart = function() {
        stats.reset();
    };

    return {
        init: function() {
            board.init({
                rows: 3,
                columns: 3
            });


            drawingContext.init(board, players);

            board.setPositionOwner(1, 1, players.TYPE_HUMAN);
            board.setPositionOwner(0, 1, players.TYPE_AI);

            drawingContext.createStage();

            drawingContext.drawBoard(function(row, column) {
                console.log("klikol si na "+row+":"+column);
            });
        },

        newRound: function() {
            newRound();
        },

        restart: function() {
            restart();
        }
    };
});
