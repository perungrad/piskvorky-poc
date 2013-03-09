require(["libs/kinetic", "jquery", "bootstrap", "board"], function(Kinetic, $, Bootstrap, Board) {
    var stage = new Kinetic.Stage({
        container: 'stage',
        width: 400,
        height: 400
    });

    var boardLayer = new Kinetic.Layer();

    Board.init();

    Board.setStage(stage);
    Board.setLayer(boardLayer);
    Board.draw();

    stage.add(boardLayer);

    Board.onInit = function(victories) {
        $("#player-victories").html(victories[Board.PLAYER_HUMAN]);
        $("#ai-victories").html(victories[Board.PLAYER_AI]);
        $("#ties").html(victories[Board.PLAYER_NONE]);
    };

    Board.onGameOver = function(winner, victories) {
        $("#player-victories").html(victories[Board.PLAYER_HUMAN]);
        $("#ai-victories").html(victories[Board.PLAYER_AI]);
        $("#ties").html(victories[Board.PLAYER_NONE]);
    };

    $("#btnReload").on("click", function() {
        Board.reload();
    });

    $("#btnReset").on("click", function() {
        Board.reset();
    });
});
