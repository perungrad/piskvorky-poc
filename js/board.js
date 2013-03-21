define(["players"], function (players) {
    'use strict';

    var board = [],
        boardOptions = {
            rows: 3,
            columns: 3
        },
        init,
        findDiagonalCells;

    init = function (options) {
        var row,
            column;

        boardOptions.rows    = options.rows || boardOptions.rows;
        boardOptions.columns = options.columns || boardOptions.columns;

        board = [];

        for (row = 0; row < boardOptions.rows; row = row + 1) {
            board[row] = [];

            for (column = 0; column < boardOptions.columns; column = column + 1) {
                board[row][column] = players.TYPE_NONE;
            }
        }
    };

    findDiagonalCells = function (startRow, startColumn, rightToLeft) {
        var cells = [],
            row = startRow,
            column = startColumn;

        rightToLeft = rightToLeft || false;

        while ((row >= 0) && (column >= 0) && (row < boardOptions.rows) && (column < boardOptions.columns)) {
            cells.push({
                row: row,
                column: column
            });

            row    = row + 1;

            if (rightToLeft) {
                column = column - 1;
            } else {
                column = column + 1;
            }
        }

        return cells;
    };

    return {
        init: function (options) {
            init(options);
        },

        getRowsCount: function () {
            return boardOptions.rows;
        },

        getColumnsCount: function () {
            return boardOptions.columns;
        },

        getRows: function () {
            var rows = [],
                row,
                column;

            for (row = 0; row < boardOptions.rows; row = row + 1) {
                rows[row] = [];
                for (column = 0; column < boardOptions.columns; column = column + 1) {
                    rows[row].push({
                        row: row,
                        column: column
                    });
                }
            }

            return rows;
        },

        getColumns: function () {
            var columns = [],
                row,
                column;

            for (column = 0; column < boardOptions.columns; column = column + 1) {
                columns[column] = [];
                for (row = 0; row < boardOptions.rows; row = row + 1) {
                    columns[column].push({
                        row: row,
                        column: column
                    });
                }
            }

            return columns;
        },

        getDiagonals: function (minLength) {
            var diagonals = [],
                row,
                column,
                startRow,
                startColumn,
                idx = 0;

            minLength = minLength || 3;

            // najskor pozrieme diagonaly od laveho okraja plochy smerom dole
            for (startRow = 0; startRow <= boardOptions.rows - minLength; startRow = startRow + 1) {
                diagonals[idx] = findDiagonalCells(startRow, 0);
                idx = idx + 1;
            }

            // teraz pozrieme diagonaly od horneho riadku smerom doprava
            for (startColumn = 1; startColumn <= boardOptions.columns - minLength; startColumn = startColumn + 1) {
                diagonals[idx] = findDiagonalCells(0, startColumn);
                idx = idx + 1;
            }

            // od praveho okraja smerom vlavo dole
            for (startRow = 0; startRow <= boardOptions.rows - minLength; startRow = startRow + 1) {
                diagonals[idx] = findDiagonalCells(startRow, boardOptions.columns - 1, true);
                idx = idx + 1;

            }

            // od horneho okraja smerom vlavo dole
            for (startColumn = minLength - 1; startColumn < boardOptions.columns - 1; startColumn = startColumn + 1) {
                diagonals[idx] = findDiagonalCells(0, startColumn, true);
                idx = idx + 1;
            }

            return diagonals;
        },

        getPositionOwner: function (row, column) {
            if (board[row] !== undefined) {
                return board[row][column];
            }

            return undefined;
        },

        setPositionOwner: function (row, column, playerType) {
            if ((row >= 0) && (row < boardOptions.rows)) {
                if ((column >= 0) && (column < boardOptions.columns)) {
                    board[row][column] = playerType;
                }
            }
        }
    };
});
