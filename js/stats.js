define(function() {
    var score = {};
    var names = {};
    var ids = [];

    return {
        addPlayer: function(id, name, points) {
            points = points || 0;

            score[id] = points;
            names[id] = name;

            ids.push(id);
        },

        setScore: function(id, points) {
            if (name[id] === undefined) {
                return;
            }

            score[id] = points;
        },

        increaseScore: function(id, inc) {
            if (name[id] === undefined) {
                return;
            }

            inc = inc || 1;

            score[id] = score[id] + inc;
        },

        decreaseScore: function(id, dec) {
            if (name[id] === undefined) {
                return;
            }

            dec = dec || 1;

            score[id] = score[id] - dec;
        },

        getScore: function(id) {
            return score[id];
        },

        getName: function(id) {
            return names[id];
        },

        reset: function() {
            var i = 0;
            var id = '';

            for (i = 0; i < ids.length; i = i + 1) {
                id = ids[i];
                score[id] = 0;
            }
        },
    };
});
