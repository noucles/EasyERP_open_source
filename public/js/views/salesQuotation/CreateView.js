/**
 * Created by soundstorm on 27.05.15.
 */
define([
    'views/Quotation/CreateView'
],
function(CreateView) {
    var salesQuotation = CreateView.extend({
        canBeSold: true
    });

    return salesQuotation;
})