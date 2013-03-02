require(["libs/kinetic", "board"], function(Kinetic, Board) {
    var stage = new Kinetic.Stage({
        container: 'stage',
        width: 400,
        height: 400
    });

    var boardLayer = new Kinetic.Layer();

    Board.setStage(stage);
    Board.setLayer(boardLayer);
    Board.draw();

    stage.add(boardLayer);
});
