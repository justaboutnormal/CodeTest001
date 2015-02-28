var cartApp = angular.module('cartApp', []);

var CartController = cartApp.controller('CartController', ['$scope', function($scope){
    var products = [{name: 'a', prices: [{at: 1, price: 20}]},
                    {
                        name: 'b',
                        prices: [
                            {at: 5, quantityLike: 3},
                            {at: 1, price: 50}
                        ]
                    },
                    {name: 'c', prices: [{at: 1, price: 30}]}];

    $scope.$watch('scanned', function(newVal){
        $scope.total = getTotal(newVal, products);
    });
}]);

function getSubtotal(quantity, rules, subtotal){
    subtotal = subtotal || 0;

    //filter to the largest [at] that is less than the quantity
    var rule = rules.filter(function(r){if(r.at <= quantity) return r;}).sort(function(a, b){return a.at > b.at}).slice(-1)[0];

    if(rule == undefined){
        return subtotal;
    }
    if(rule.at == 1){
        return subtotal + rule.price * quantity;
    }
    if(rule.quantityLike != undefined){
        var times = Math.floor(quantity / rule.at);
        var minus = rule.at * times
        subtotal += getSubtotal(rule.quantityLike, rules, subtotal) * times;
        return getSubtotal(quantity - minus, rules, subtotal);
    }
}

function getTotal(scanned, products){
    scanned = (scanned || '').toLowerCase().split('');

    var total = 0;
    products.map(function(prod){
        var quantity = scanned.filter(function(val){return val == prod.name}).length;
        total += getSubtotal(quantity, prod.prices);
    });

    return total;
}