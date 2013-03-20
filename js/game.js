define(["kineticContext", "players", "stats", "board", "ai"], function(drawingContext, players, stats, board, ai) {
    stats.addPlayer(players.TYPE_NONE, 'Ties');
    stats.addPlayer(players.TYPE_HUMAN, 'Player');
    stats.addPlayer(players.TYPE_AI, 'AI');

    var newRound = function() {
    };

    var restart = function() {
        stats.reset();
    };

    var placeToken = function (row, column, playerType) {
        var owner = board.getPositionOwner(row, column);

        if (owner === players.TYPE_NONE) {
            drawingContext.drawToken(row, column, playerType);
            board.setPositionOwner(row, column, playerType);
        }
    };

    return {
        init: function() {
            board.init({
                rows: 5,
                columns: 5
            });

            drawingContext.init(board, players);

            ai.init(board, players, 3);

            ai.writeWeightTable();

            //board.setPositionOwner(1, 1, players.TYPE_HUMAN);
            //board.setPositionOwner(0, 1, players.TYPE_AI);

            drawingContext.createStage();

            drawingContext.drawBoard(function(row, column) {
                placeToken(row, column, players.TYPE_HUMAN);
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
