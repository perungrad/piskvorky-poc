define(function() {
    var createConstructor = function() {
        if (typeof Object.create !== 'function') {
            Object.create = function(o) {
                var F = function() {};
                F.prototype = o;
                return new F();
            }
        }
    };

    return  {
        fixAll: function() {
            createConstructor();
        }
    };
});
