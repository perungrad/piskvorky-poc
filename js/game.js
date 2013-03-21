define(["kineticContext", "players", "stats", "board", "ai"], function (drawingContext, players, stats, board, ai) {
    'use strict';

    var ROWS = 5,
        COLUMNS = 5,
        LINE_LENGTH = 3,
        gameRunning = true,
        newRound,
        endRound,
        restart,
        placeToken,
        prepareLinesForCheck,
        checkLines,
        checkFilledBoard,
        checkVictory,
        callbacks = {},
        setCallback,
        fireEvent;

    stats.addPlayer(players.TYPE_NONE, 'Ties');
    stats.addPlayer(players.TYPE_HUMAN, 'Player');
    stats.addPlayer(players.TYPE_AI, 'AI');

    newRound = function () {
    };

    endRound = function (winner) {
        gameRunning = false;

        stats.increaseScore(winner);

        fireEvent('roundEnd', winner, stats);
    };

    restart = function () {
        stats.reset();
    };

    checkFilledBoard = function () {
        var row,
            column;

        for (row = 0; row < board.getRowsCount(); row = row + 1) {
            for (column = 0; column < board.getColumnsCount(); column = column + 1) {
                if (board.getPositionOwner(row, column) === players.TYPE_NONE) {
                    return false;
                }
            }
        }

        return true;
    };

    prepareLinesForCheck = function (placedOnRow, placedOnColumn) {
        var row,
            column,
            initRow,
            initColumn,
            endRow,
            endColumn,
            line,
            lines = [];

        // riadok
        line = [];
        for (column = placedOnColumn - LINE_LENGTH + 1; column < placedOnColumn + LINE_LENGTH; column = column + 1) {
            line.push({
                row: placedOnRow,
                column: column
            });
        }

        lines.push(line);

        // stlpec
        line = [];
        for (row = placedOnRow - LINE_LENGTH + 1; row < placedOnRow + LINE_LENGTH; row = row + 1) {
            line.push({
                row: row,
                column: placedOnColumn
            });
        }

        lines.push(line);

        // diagonala zlava hore doprava dole
        line = [];

        initRow    = placedOnRow - LINE_LENGTH + 1;
        initColumn = placedOnColumn - LINE_LENGTH + 1;
        endRow     = placedOnRow + LINE_LENGTH;
        endColumn  = placedOnColumn + LINE_LENGTH;

        for (row = initRow, column = initColumn; (row < endRow) && (column < endColumn); row = row + 1, column = column + 1) {
            line.push({
                row: row,
                column: column
            });
        }

        lines.push(line);

        // diagonala zprava hore dolava dole

        line = [];

        initRow    = placedOnRow - LINE_LENGTH + 1;
        initColumn = placedOnColumn + LINE_LENGTH - 1;
        endRow     = placedOnRow + LINE_LENGTH;
        endColumn  = placedOnColumn - LINE_LENGTH + 1;

        for (row = initRow, column = initColumn; (row < endRow) && (column >= endColumn); row = row + 1, column = column - 1) {
            line.push({
                row: row,
                column: column
            });
        }

        lines.push(line);
        return lines;
    };

    checkLines = function (lines, playerType) {
        var i,
            j,
            owner,
            previous = null,
            foundLength = 0,
            line;

        for (i = 0; i < lines.length; i = i + 1) {
            line = lines[i];

            foundLength = 0;
            previous    = null;

            for (j = 0; j < line.length; j = j + 1) {
                owner = board.getPositionOwner(line[j].row, line[j].column);
                if (owner !== undefined) {
                    if (owner !== previous) {
                        foundLength = 0;
                    }

                    if (owner === playerType) {
                        foundLength = foundLength + 1;
                    }

                    if (foundLength >= LINE_LENGTH) {
                        return true;
                    }
                }

                previous = owner;
            }
        }

        return false;
    };

    checkVictory = function (placedOnRow, placedOnColumn, playerType) {
        return checkLines(
            prepareLinesForCheck(placedOnRow, placedOnColumn),
            playerType
        );
    };

    placeToken = function (row, column, playerType) {
        var owner,
            nextMove;

        if (!gameRunning) {
            return;
        }

        owner = board.getPositionOwner(row, column);

        if (owner === players.TYPE_NONE) {
            drawingContext.drawToken(row, column, playerType);
            board.setPositionOwner(row, column, playerType);
            ai.ownerChanged(row, column, playerType);

            // ak nie je koniec
            if (checkVictory(row, column, playerType)) {
                endRound(playerType);
            } else if (checkFilledBoard()) {
                endRound(players.TYPE_NONE);
            } else if (playerType === players.TYPE_HUMAN) {
                // na rade je ai
                nextMove = ai.getNextMove();

                if (nextMove === undefined) {
                    endRound(players.TYPE_NONE);
                } else {
                    placeToken(nextMove.row, nextMove.column, players.TYPE_AI);
                }
            }
        }
    };

    setCallback = function (eventName, callbackFunction) {
        if (callbacks[eventName] === undefined) {
            callbacks[eventName] = [];
        }

        callbacks[eventName].push(callbackFunction);
    };

    fireEvent = function (eventName) {
        var i;

        if (callbacks[eventName] === undefined) {
            return;
        }

        for (i = 0; i < callbacks[eventName].length; i = i + 1) {
            callbacks[eventName][i].apply(
                callbacks[eventName][i],
                Array.prototype.slice.apply(arguments, [1])
            );
        }
    };

    return {
        init: function () {
            board.init({
                rows: ROWS,
                columns: COLUMNS
            });

            drawingContext.init(board, players);

            ai.init(board, players, LINE_LENGTH);

            ai.setIntelligenceLevel(5);

            //ai.writeWeightTable();

            //board.setPositionOwner(1, 1, players.TYPE_HUMAN);
            //board.setPositionOwner(0, 1, players.TYPE_AI);

            drawingContext.createStage();

            drawingContext.drawBoard(function (row, column) {
                placeToken(row, column, players.TYPE_HUMAN);
            });
        },

        newRound: function () {
            newRound();
        },

        restart: function () {
            restart();
        },

        on: function (eventName, callbackFunction) {
            setCallback(eventName, callbackFunction);
        }
    };
});
