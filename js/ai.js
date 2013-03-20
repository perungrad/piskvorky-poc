define(function () {
    return (function () {
        var that = {},
            lineLength = 3,
            intelligenceLevel = 10,
            weightTable = [],
            init,
            initializeWeightTable,
            setIntelligenceLevel,
            getNextMove,
            ownerChanged;

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
            if (newLevel >=0 && newLevel <= 10) {
                intelligenceLevel = newLevel;
            }
        };

        getNextMove = function () {

        };

        ownerChanged = function (row, column, owner) {

        };

        return {
            init: function (board, players, lineLength) {
                init(board, players, lineLength);
            },

            setIntelligenceLevel: function (newLevel) {
                setIntelligenceLevel(newLevel);
            },

            getNextMove: function () {
                getNextMove();
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
    })();
});
