define(["libs/myMath"], function (myMath) {
    'use strict';

    return (function () {
        var that = {},
            lineLength = 3,
            weightTable = [],
            init,
            initializeWeightTable,
            setIntelligenceLevel,
            getNextMove,
            ownerChanged,
            findMoveInLine,
            findMoveInLines,
            findMoveInWeightTable,
            isIntelligentEnough,
            MAX_INTELLIGENCE = 10,
            intelligenceLevel = MAX_INTELLIGENCE,
            MOVE_TYPE_WINNING = 1,
            MOVE_TYPE_BLOCKING = 2;

        init = function (board, players, lengthOfLine) {
            that.board   = board;
            that.players = players;
            lineLength   = lengthOfLine;

            initializeWeightTable();
        };

        // Inicializacne hodnoty vo vahovej tabulke budu zodpovedat
        // poctu piskvoriek, ktore je mozne na danom poli urobit
        initializeWeightTable = function () {
            var row,
                column,
                weight,
                rows,
                columns,
                delimiter,
                opaqueDelimiter,
                rowMatch,
                columnMatch;

            rows = that.board.getRowsCount();
            columns = that.board.getColumnsCount();

            for (row = 0; row < columns; row = row + 1) {
                weightTable[row] = [];

                for (column = 0; column < columns; column = column + 1) {
                    weight = 0;

                    for (delimiter = 0; delimiter < lineLength; delimiter = delimiter + 1) {
                        opaqueDelimiter = lineLength - delimiter - 1;

                        rowMatch    = false;
                        columnMatch = false;

                        // kolko sltpcovych piskvoriek vieme urobit
                        if (row - delimiter >= 0) {
                            if (row + (lineLength - delimiter) <= rows) {
                                weight = weight + 1;

                                rowMatch = true;
                            }
                        }

                        // kolko riadkovych piskvoriek vieme urobit
                        if (column - delimiter >= 0) {
                            if (column + (lineLength - delimiter) <= columns) {
                                weight = weight + 1;

                                columnMatch = true;
                            }
                        }

                        // kolko diagonalovych zlava hora doprava dole
                        if (rowMatch && columnMatch) {
                            weight = weight + 1;
                        }

                        // kolko diagonalovych zprava hore dolava dole
                        if (column - opaqueDelimiter >= 0) {
                            if (column + (lineLength - opaqueDelimiter) <= columns) {
                                if (rowMatch) {
                                    weight = weight + 1;
                                }
                            }
                        }
                    }

                    weightTable[row][column] = weight;
                }
            }
        };

        setIntelligenceLevel = function (newLevel) {
            if (newLevel >= 0 && newLevel <= 10) {
                intelligenceLevel = newLevel;
            }
        };

        // @param line Línia, v ktorej sa hľadá vhodná pozícia na umiestnenie
        // @param fast Príznak, či má funkcia hneď vrátiť (true), keď nájde miesto, alebo hľadať ďalej
        findMoveInLine = function (line, fast) {
            var i,
                j,
                owner,
                position,
                queue = [],
                counts = {},
                winningMoves = [],
                blockingMoves = [];

            fast = fast || true;

            counts[that.players.TYPE_NONE]  = 0;
            counts[that.players.TYPE_HUMAN] = 0;
            counts[that.players.TYPE_AI]    = 0;

            for (i = 0; i < line.length; i = i + 1) {
                owner = that.board.getPositionOwner(line[i].row, line[i].column);

                if (queue.length >= lineLength) {
                    position = queue.shift();
                    counts[position.player] = counts[position.player] - 1;
                }

                queue.push({
                    row:    line[i].row,
                    column: line[i].column,
                    player: owner
                });

                counts[owner] = counts[owner] + 1;

                position = null;

                if (counts[that.players.TYPE_NONE] === 1) {
                    if (counts[that.players.TYPE_AI] === lineLength - 1) {
                        // vitazny pohyb
                        for (j = 0; j < queue.length; j = j + 1) {
                            if (queue[j].player === that.players.TYPE_NONE) {
                                position = {
                                    row:    queue[j].row,
                                    column: queue[j].column,
                                    type:   MOVE_TYPE_WINNING
                                };
                            }
                        }
                    }

                    if (counts[that.players.TYPE_HUMAN] === lineLength - 1) {
                        // blokujuci pohyb
                        for (j = 0; j < queue.length; j = j + 1) {
                            if (queue[j].player === that.players.TYPE_NONE) {
                                position = {
                                    row:    queue[j].row,
                                    column: queue[j].column,
                                    type:   MOVE_TYPE_BLOCKING
                                };
                            }
                        }
                    }
                }

                if (position !== null) {
                    if (position.type === MOVE_TYPE_WINNING) {
                        winningMoves.push(position);

                        if (fast) {
                            break;
                        }
                    } else {
                        blockingMoves.push(position);
                    }
                }
            }

            return {
                winning:  winningMoves,
                blocking: blockingMoves
            };
        };

        findMoveInLines = function (lines, fast) {
            var i,
                moves,
                winningMoves = [],
                blockingMoves = [];

            for (i = 0; i < lines.length; i = i + 1) {
                moves = findMoveInLine(lines[i], fast);

                winningMoves  = winningMoves.concat(moves.winning);
                blockingMoves = blockingMoves.concat(moves.blocking);

                if (winningMoves.length && fast) {
                    break;
                }
            }

            return {
                winning:  winningMoves,
                blocking: blockingMoves
            };
        };

        findMoveInWeightTable = function () {
            var max = 0,
                row,
                column,
                positions = [];

            for (row = 0; row < weightTable.length; row = row + 1) {
                for (column = 0; column < weightTable[row].length; column = column + 1) {
                    if (weightTable[row][column] > max) {
                        positions = [];
                        max = weightTable[row][column];
                    }

                    if (weightTable[row][column] === max) {
                        positions.push({
                            row: row,
                            column: column
                        });
                    }
                }
            }

            if (positions.length) {
                return positions[myMath.randomFromInterval(0, positions.length - 1)];
            }

            return undefined;
        };

        getNextMove = function (fast) {
            var lines,
                i,
                moves,
                winningMoves = [],
                blockingMoves = [];

            fast = fast || true;

            // riadky
            lines = that.board.getRows();

            moves = findMoveInLines(lines, fast);

            winningMoves  = winningMoves.concat(moves.winning);
            blockingMoves = blockingMoves.concat(moves.blocking);

            if (!(winningMoves.length && fast)) {
                // stlpce
                lines = that.board.getColumns();

                moves = findMoveInLines(lines, fast);

                winningMoves  = winningMoves.concat(moves.winning);
                blockingMoves = blockingMoves.concat(moves.blocking);

                if (!(winningMoves.length && fast)) {
                    // diagonaly
                    lines = that.board.getDiagonals();

                    moves = findMoveInLines(lines, fast);

                    winningMoves  = winningMoves.concat(moves.winning);
                    blockingMoves = blockingMoves.concat(moves.blocking);
                }
            }

            if (winningMoves.length) {
                if (isIntelligentEnough()) {
                    return winningMoves[myMath.randomFromInterval(0, winningMoves.length - 1)];
                }
            }

            if (blockingMoves.length) {
                if (isIntelligentEnough()) {
                    return blockingMoves[myMath.randomFromInterval(0, blockingMoves.length - 1)];
                }
            }

            // najdeme pohyb podla vahovej tabulky
            return findMoveInWeightTable();
        };

        ownerChanged = function (row, column, owner) {
            var i,
                player,
                posRow,
                posColumn,
                vectors = [
                    {row: -1, column: -1},
                    {row: -1, column: 0},
                    {row: -1, column: 1},
                    {row: 0, column: -1},
                    {row: 0, column: 1},
                    {row: 1, column: -1},
                    {row: 1, column: 0},
                    {row: 1, column: 1}
                ];

            for (i = 0; i < vectors.length; i = i + 1) {
                posRow = row + vectors[i].row;
                posColumn = column + vectors[i].column;

                player = that.board.getPositionOwner(posRow, posColumn);

                if (player === that.players.TYPE_NONE) {
                    weightTable[posRow][posColumn] = weightTable[posRow][posColumn] + 1;
                }
            }

            weightTable[row][column] = 0;
        };

        isIntelligentEnough = function () {
            return myMath.randomFromInterval(0, MAX_INTELLIGENCE) >= (MAX_INTELLIGENCE - intelligenceLevel);
        };

        return {
            init: function (board, players, lineLength) {
                init(board, players, lineLength);
            },

            setIntelligenceLevel: function (newLevel) {
                setIntelligenceLevel(newLevel);
            },

            getNextMove: function () {
                return getNextMove();
            },

            ownerChanged: function (row, column, owner) {
                ownerChanged(row, column, owner);
            },

            writeWeightTable: function () {
                var i = 0;
                for (i = 0; i < that.board.getRowsCount(); i = i + 1) {
                    console.log(weightTable[i]);
                }
            }
        };
    }());
});
