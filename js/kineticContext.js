define(["libs/kinetic"], function(Kinetic) {
    var that;
    var init, createStage;
    var drawToken, drawLines, drawInteractiveTile, drawBoard;
    var drawEmptyToken, drawHumanToken, drawAIToken, placeToken;

    that = {
        board: null,
        players: null,
        stage: null,
        boardLayer: null,
        interactiveLayer: null,
        stageWidth: 0,
        stageHeight: 0,
        cellWidth: 0,
        cellHeight: 0,
        rows: 0,
        columns: 0
    };

    init = function(board, players) {
        that.board   = board;
        that.players = players;

        that.rows    = that.board.getRowsCount();
        that.columns = that.board.getColumnsCount();

    };

    createStage = function() {
        that.stage = new Kinetic.Stage({
            container: 'stage',
            width: 400,
            height: 400
        });

        that.boardLayer = new Kinetic.Layer();

        that.interactiveLayer = new Kinetic.Layer();

        that.stage.add(that.boardLayer);
        that.stage.add(that.interactiveLayer);

        that.width  = that.stage.getWidth();
        that.height = that.stage.getHeight();

        that.cellWidth  = Math.round(that.width / that.rows);
        that.cellHeight = Math.round(that.height / that.columns);
    };

    drawLines = function() {
        var i, line;

        for (i = 0; i <= that.rows; i = i + 1) {
            line = new Kinetic.Line({
                points: [0, i * that.cellHeight, that.width, i * that.cellHeight],
                stroke: 'black',
                strokeWidth: 2
            });

            that.boardLayer.add(line);
        }

        for (i = 0; i <= that.columns; i = i + 1) {
            line = new Kinetic.Line({
                points: [i * that.cellWidth, 0, i * that.cellWidth, that.height],
                stroke: 'black',
                strokeWidth: 2
            });

            that.boardLayer.add(line);
        }

        that.boardLayer.draw();
    };

    drawEmptyToken = function(row, column) {
        return;
    };

    drawHumanToken = function(row, column) {
        var circle = new Kinetic.Ellipse({
            x: (column * that.cellWidth) + (that.cellWidth / 2),
            y: (row * that.cellHeight) + (that.cellHeight / 2),
            radius: [
                (that.cellWidth / 10) * 4,
                (that.cellHeight / 10) * 4
            ],
            stroke: "green",
            strokeWidth: 6
        });

        that.boardLayer.add(circle);
    };

    drawAIToken = function(row, column) {
        var line = new Kinetic.Line({
            points: [
                (column * that.cellWidth) + (that.cellWidth  * 0.1),
                (row * that.cellHeight) + (that.cellHeight * 0.1),
                (column * that.cellWidth) + (that.cellWidth * 0.9),
                (row * that.cellHeight) + (that.cellHeight * 0.9)
            ],
            stroke: "red",
            strokeWidth: 6
        });

        that.boardLayer.add(line);

        line = new Kinetic.Line({
            points: [
                (column * that.cellWidth) + (that.cellWidth  * 0.1),
                (row * that.cellHeight) + (that.cellHeight * 0.9),
                (column * that.cellWidth) + (that.cellWidth * 0.9),
                (row * that.cellHeight) + (that.cellHeight * 0.1)
            ],
            stroke: "red",
            strokeWidth: 6
        });

        that.boardLayer.add(line);
    };

    placeToken = function(row, column, owner) {
        if (owner === that.players.TYPE_HUMAN) {
            drawHumanToken(row, column);
        } else if (owner === that.players.TYPE_AI) {
            drawAIToken(row, column);
        } else {
            drawEmptyToken();
        }
    };

    drawToken = function (row, column, owner) {
        placeToken(row, column, owner);
        that.boardLayer.draw();
    }

    drawInteractiveTile = function(row, column, onTileClick) {
        var tile = new Kinetic.Rect({
            x: column * that.cellWidth,
            y: row * that.cellHeight,
            width: that.cellWidth,
            height: that.cellHeight,
            stroke: 'black',
            strokeWidth: 0
        });

        if (onTileClick !== undefined) {
            tile.on("click touch", function() {
                onTileClick(row, column);
            });
        }

        that.interactiveLayer.add(tile);
    };

    drawBoard = function(onTileClick) {
        drawLines();

        for (row = 0; row < that.rows; row = row + 1) {
            for (column = 0; column < that.columns; column = column + 1) {
                placeToken(row, column, that.board.getPositionOwner(row, column));

                drawInteractiveTile(row, column, onTileClick);
            }
        }

        that.boardLayer.draw();
        that.interactiveLayer.draw();
    };

    return {
        init: function(board, players) {
            init(board, players);
        },

        createStage: function() {
            createStage();
        },

        drawBoard: function(onTileClick) {
            drawBoard(onTileClick);
        },

        drawToken: function(row, column, owner) {
            drawToken(row, column, owner);
        }
    };
});
