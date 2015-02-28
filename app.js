var cartApp = angular.module('cartApp', []);

var CartController = cartApp.controller('CartController', ['$scope', function($scope){
    //update $scope total when the scanned input value changes
    $scope.$watch('scanned', function(newVal){
        $scope.total = Supermarket.checkout(newVal);
    });
}]);

function getSubtotal(quantity, rules, subtotal){
    //using the quantity of a product, the pricing rules, and a current subtotal (optional) determine what the subtotal of this product or subset of products should be
    subtotal = subtotal || 0;

    //get the largest [at] that is less than the quantity
    var rule = rules.filter(function(r){if(r.at <= quantity) return r;}).sort(function(a, b){return a.at > b.at}).slice(-1)[0];

    //if there is no rule the quantity was probably 0, return the subtotal provided
    if(rule == undefined){
        return subtotal;
    }
    //a rule.at 1 is most common and it must have a price, multiply it by the quantity
    if(rule.at == 1){
        return subtotal + rule.price * quantity;
    }
    //a rule.at another value should have one of [price, quantityLike]
    //TODO: add discount and other types of promotions to a product
    if(rule.quantityLike != undefined){
        var times = Math.floor(quantity / rule.at);//how many times should this rule be used?
        var minus = rule.at * times;//use this to subtract from the quantity only the products of this type that have not been priced yet
        subtotal += getSubtotal(rule.quantityLike, rules, subtotal) * times;
        return getSubtotal(quantity - minus, rules, subtotal);//after pricing all products that may use the selected rule getSubtotal for any remaining products
    }
}

function getTotal(scanned, products){
    scanned = (scanned || '').toLowerCase().split('');//separate the string into characters

    var total = 0;

    //look at each product and get the subTotal for the quantity of that product
    products.map(function(prod){
        var quantity = scanned.filter(function(val){return val == prod.name}).length;
        total += getSubtotal(quantity, prod.prices);
    });

    return total;
}

var Supermarket = {
    //TODO: us an AJAX call to get products and their pricing rules (temporarily define the rules inline)
    products: [
                {name: 'a', prices: [{at: 1, price: 20}]},
                {
                    name: 'b',
                    prices: [
                        {at: 5, quantityLike: 3},//price 5 items of this type as if they had a quantity like 3
                        {at: 1, price: 50}
                    ]
                },
                {name: 'c', prices: [{at: 1, price: 30}]}
              ],

    //using the items passed in, get the total
    checkout: function(items){
        return getTotal(items, this.products);
    }
}