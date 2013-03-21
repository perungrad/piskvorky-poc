define(function () {
    'use strict';

    return {
        randomFromInterval: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };
});
