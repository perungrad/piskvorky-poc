define(function () {
    'use strict';

    var score = {},
        names = {},
        ids = [];

    return {
        addPlayer: function (id, name, points) {
            points = points || 0;

            score[id] = points;
            names[id] = name;

            ids.push(id);
        },

        setScore: function (id, points) {
            if (names[id] === undefined) {
                return;
            }

            score[id] = points;
        },

        increaseScore: function (id, inc) {
            if (names[id] === undefined) {
                return;
            }

            inc = inc || 1;

            score[id] = score[id] + inc;
        },

        decreaseScore: function (id, dec) {
            if (names[id] === undefined) {
                return;
            }

            dec = dec || 1;

            score[id] = score[id] - dec;
        },

        getScore: function (id) {
            return score[id];
        },

        getName: function (id) {
            return names[id];
        },

        reset: function () {
            var i = 0,
                id = '';

            for (i = 0; i < ids.length; i = i + 1) {
                id = ids[i];
                score[id] = 0;
            }
        },
    };
});
