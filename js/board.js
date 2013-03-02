define(["libs/kinetic"], function(Kinetic) {
    var Board = {
        PLAYER_NONE: 0,
        PLAYER_HUMAN: 1,
        PLAYER_AI: 2,

        board: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ],

        weights: [
            [1, 0, 1],
            [0, 2, 0],
            [1, 0, 1]
        ],

        tiles: [
            [],
            [],
            []
        ],

        layer: null,

        stage: null,

        playerColor: {},

        gameOver: false,

        setStage: function(stage) {
            this.stage = stage;
        },

        setLayer: function(layer) {
            this.layer = layer;
        },

        draw: function() {
            var rect = new Kinetic.Rect({
                x: 0,
                y: 0,
                width: this.stage.getWidth(),
                height: this.stage.getHeight(),
                stroke: 'black',
                strokeWidth: 4
            });

            this.layer.add(rect);

            var i, j;
            var columns = this.board[0].length;
            var rows = this.board.length;

            var x, y;
            var columnWidth = rect.getWidth() / columns;
            var rowHeight = rect.getHeight() / rows;

            for (i = 0; i < columns; i++) {
                x = rect.getX() + columnWidth * i;
                for (j = 0; j < rows; j++) {
                    y = rect.getY() + rowHeight * j;

                    var tile = new Kinetic.Rect({
                        x: x,
                        y: y,
                        width: columnWidth,
                        height: rowHeight,
                        stroke: 'black',
                        strokeWidth: 2,
                        custom: {
                            x: i,
                            y: j
                        }
                    });

                    this.tiles[i][j] = tile;

                    tile.on("click touch", function() {
                        if (Board.gameOver) {
                            return false;
                        }

                        var x = this.attrs.custom.x;
                        var y = this.attrs.custom.y;

                        if (Board.board[x][y] === Board.PLAYER_NONE) {
                            Board.placeToken(x, y, Board.PLAYER_HUMAN);

                            if (!Board.gameOver) {
                                Board.AIMove(Board.layer);
                            }
                        }
                    });

                    this.layer.add(tile);
                }
            }
        },

        calcWeights: function(x, y, increment) {
            var i = 0;

            var newWeights = [
                {vx: -1, vy: 0},
                {vx: 0, vy: -1},
                {vx: 0, vy: 1},
                {vx: 1, vy: 0}
            ];

            var doNotIncrementDiagonalsFor = [
                {x: 0, y: 1},
                {x: 1, y: 0},
                {x: 1, y: 2},
                {x: 2, y: 1}
            ];

            var diagonals = true;

            for (i = 0; i < doNotIncrementDiagonalsFor.length; i++) {
                if (x == doNotIncrementDiagonalsFor[i].x) {
                    if (y == doNotIncrementDiagonalsFor[i].y) {
                        diagonals = false;
                        break;
                    }
                }
            }

            if (diagonals) {
                newWeights.push({vx: -1, vy: -1});
                newWeights.push({vx: -1, vy: 1});
                newWeights.push({vx: 1, vy: -1});
                newWeights.push({vx: 1, vy: 1});
            }

            var cx = 0;
            var cy = 0;

            this.weights[x][y] = 0;

            for (i = 0; i < newWeights.length; i++) {
                cx = x + newWeights[i].vx;
                cy = y + newWeights[i].vy;

                if (this.board[cx] === undefined) {
                    continue;
                }

                if (this.board[cx][cy] === undefined) {
                    continue;
                }

                if (this.board[cx][cy] === this.PLAYER_NONE) {
                    this.weights[cx][cy] += increment;
                } else if (this.board[cx][cy] === this.PLAYER_NONE) {
                    this.weights[cx][cy] = 0;
                } else if (this.board[cx][cy] === this.PLAYER_NONE) {
                    this.weights[cx][cy] = 0;
                }
            }
        },

        placeToken: function(x, y, player) {
            // umiestnit
            this.board[x][y] = player;

            // vyfarbit
            this.tiles[x][y].setFill(this.playerColor[player]);

            this.layer.draw();

            // zvysit vahu
            this.weights[x][y] = 0;

            this.calcWeights(x, y, (player === this.PLAYER_AI) ? 2 : 1);

            this.isVictory();
        },

        nextMove: function(player) {
            var that = this;

            var tileContainer = function() {
                var container = {};

                return {
                    getContainer: function() {
                        return container;
                    },

                    coor: function(x, y) {
                        return String(x) + ':' + String(y);
                    },

                    deCoor: function(coorStr) {
                        var arr = coorStr.split(':');

                        return {
                            x: parseInt(arr[0], 10),
                            y: parseInt(arr[1], 10)
                        };
                    },

                    push: function(tile) {
                        var coorStr = this.coor(tile.x, tile.y);

                        if (typeof container[coorStr] === 'number') {
                            container[coorStr]++;
                        }
                        else {
                            container[coorStr] = 1;
                        }
                    },

                    getMax: function() {
                        var name;
                        var max = 0;
                        var maxIndex = '';

                        for (name in container) {
                            if (container.hasOwnProperty(name)) {
                                if (container[name] > max) {
                                    max = container[name];
                                    maxIndex = name;
                                }
                            }
                        }

                        if (maxIndex !== '') {
                            return this.deCoor(maxIndex);
                        }

                        return;
                    }
                }
            };

            var winningMoves = tileContainer();
            var blockingMoves = tileContainer();

            var canWinLines = function() {
                var i, j;
                var emptyTiles = [];
                var playerTiles = [];
                var enemyTiles = [];
                var tile;

                for (j = 0; j < that.board[0].length; j++) {
                    playerTiles = [];
                    emptyTiles = [];
                    enemyTiles = [];

                    for (i = 0; i < that.board.length; i++) {
                        tile = {
                            x: i,
                            y: j
                        };

                        if (that.board[i][j] === that.PLAYER_NONE) {
                            emptyTiles.push(tile);
                        }
                        else if (that.board[i][j] === player) {
                            playerTiles.push(tile);
                        } else {
                            enemyTiles.push(tile);
                        }
                    }

                    if (emptyTiles.length == 1) {
                        if (playerTiles.length == 2) {
                            // hrac moze vyhrat jednym tahom
                            winningMoves.push(emptyTiles[0]);
                        }
                        else if (enemyTiles.length == 2) {
                            // protivnik moze vyhrat jednym tahom
                            blockingMoves.push(emptyTiles[0]);
                        }
                    }
                }
            };

            var canWinColumns = function() {
                var i, j;
                var emptyTiles = [];
                var playerTiles = [];
                var enemyTiles = [];
                var tile;

                for (i = 0; i < that.board.length; i++) {
                    playerTiles = [];
                    emptyTiles = [];
                    enemyTiles = [];

                    for (j = 0; j < that.board[i].length; j++) {
                        tile = {
                            x: i,
                            y: j
                        };

                        if (that.board[i][j] === that.PLAYER_NONE) {
                            emptyTiles.push(tile);
                        } else if (that.board[i][j] === player) {
                            playerTiles.push(tile);
                        } else {
                            enemyTiles.push(tile);
                        }
                    }

                    if (emptyTiles.length === 1) {
                        if (playerTiles.length === 2) {
                            // hrac moze vyhrat jednym tahom
                            winningMoves.push(emptyTiles[0]);
                        } else if (enemyTiles.length === 2) {
                            // protivnik moze vyhrat jednym tahom
                            blockingMoves.push(emptyTiles[0]);
                        }
                    }
                }
            };

            var canWinDiagonals = function() {
                var diagonals = [
                    [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}],
                    [{x: 0, y: 2}, {x: 1, y: 1}, {x: 2, y: 0}]
                ];

                var i, j;
                var emptyTiles = [];
                var playerTiles = [];
                var enemyTiles = [];
                var tile, checkingTile;

                for (i = 0; i < diagonals.length; i++) {
                    playerTiles = [];
                    emptyTiles = [];
                    enemyTiles = [];

                    for (j = 0; j < diagonals[i].length; j++) {
                        tile = {
                            x: diagonals[i][j].x,
                            y: diagonals[i][j].y
                        };

                        checkingTile = that.board[diagonals[i][j].x][diagonals[i][j].y];

                        if (checkingTile === that.PLAYER_NONE) {
                            emptyTiles.push(tile);
                        }
                        else if (checkingTile === player) {
                            playerTiles.push(tile);
                        } else {
                            enemyTiles.push(tile);
                        }
                    }

                    if (emptyTiles.length == 1) {
                        if (playerTiles.length == 2) {
                            // hrac moze vyhrat jednym tahom
                            winningMoves.push(emptyTiles[0]);
                        }
                        else if (enemyTiles.length == 2) {
                            // protivnik moze vyhrat jednym tahom
                            blockingMoves.push(emptyTiles[0]);
                        }
                    }
                }
            };

            canWinLines();
            canWinColumns();
            canWinDiagonals();

            var winningMove = winningMoves.getMax();
            var blockingMove = blockingMoves.getMax();

            if (winningMove) {
                return winningMove;
            }

            if (blockingMove) {
                return blockingMove;
            }

            return;
        },

        isVictory: function() {
            var i, j, numFree = 0;

            if (((winner = this.checkLines()) !== this.PLAYER_NONE)
            || ((winner = this.checkColumns()) !== this.PLAYER_NONE)
            || ((winner = this.checkDiagonals()) !== this.PLAYER_NONE)) {
                console.log("Vyhral hrac: " + winner);
                this.gameOver = true;

                return true;
            }
            else {
                // zistime, ci bola zaplnena hracia plocha
                for (i = 0; i < this.board.length; i++) {
                    for (j = 0; j < this.board[i].length; j++) {
                        if (this.board[i][j] === this.PLAYER_NONE) {
                            numFree++;
                        }
                    }
                }

                if (numFree === 0) {
                    console.log("remiza");
                    this.gameOver = true;

                    return true;
                }
            }

            return false;
        },

        checkLines: function() {
            var i = 0;
            var j = 0;

            var last = 0;
            var found = false;

            var winner = this.PLAYER_NONE;

            // preverime riadky
            for (i = 0; i < this.board.length; i++) {
                last = this.board[i][0];
                found = false;
                for (j = 1; j < this.board[i].length; j++) {
                    if (this.board[i][j] == last) {
                        found = true;
                    } else {
                        found = false;
                        break;
                    }
                }

                if (found) {
                    winner = last;
                    break;
                }
            }

            return winner;
        },

        checkColumns: function() {
            var i = 0;
            var j = 0;

            var last = 0;
            var found = false;

            var winner = this.PLAYER_NONE;

            var rows = this.board.length;
            var cols = this.board[0].length;

            // preverime riadky
            for (i = 0; i < cols; i++) {
                last = this.board[0][i];
                found = false;
                for (j = 1; j < rows; j++) {
                    if (this.board[j][i] == last) {
                        found = true;
                    } else {
                        found = false;
                        break;
                    }
                }

                if (found) {
                    winner = last;
                    break;
                }
            }

            return winner;
        },

        checkDiagonals: function() {
            var centralPlayer = this.board[1][1];

            if (centralPlayer != this.PLAYER_NONE) {
                if ((this.board[0][0] == centralPlayer)
                && (this.board[2][2] == centralPlayer)) {
                    return centralPlayer;
                }

                if ((this.board[0][2] == centralPlayer)
                && (this.board[2][0] == centralPlayer)) {
                    return centralPlayer;
                }
            }

            return this.PLAYER_NONE;
        },

        AIMove: function(layer) {
            var i = 0;
            var j = 0;

            //zistime, ci vieme doplnit poslednu piskvorku
            var next = this.nextMove(this.PLAYER_AI);

            if (next) {
                this.placeToken(next.x, next.y, this.PLAYER_AI);
                return;
            }

            // najdeme policko s najvyssou vahou
            var max = 0;
            var maxList = [];

            for (i = 0; i < this.board.length; i++) {
                for (j = 0; j < this.board[i].length; j++) {
                    if (this.weights[i][j] > max) {
                        max = this.weights[i][j];
                        maxList = [ {x: i, y: j} ];
                    } else if (this.weights[i][j] == max) {
                        if (max > 0) {
                            maxList.push({x: i, y: j});
                        }
                    }
                }
            }

            if (maxList.length > 0)  {
                var position = Math.floor(Math.random() * maxList.length);

                var x = maxList[position].x;
                var y = maxList[position].y;

                if (this.tiles[x][y]) {
                    this.placeToken(x, y, this.PLAYER_AI);
                }
            }
        }
    };

    Board.playerColor[Board.PLAYER_HUMAN] = 'green';
    Board.playerColor[Board.PLAYER_AI]    = 'red';

    return Board;
});
