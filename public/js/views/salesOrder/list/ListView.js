define([
    'jQuery',
    'Underscore',
    'views/listViewBase',
    'text!templates/salesQuotation/list/ListHeader.html',
    'text!templates/salesOrder/list/ListHeader.html',
    'text!templates/stages.html',
    'views/salesQuotation/CreateView',
    'views/salesOrder/list/ListItemView',
    'views/supplierPayments/list/ListTotalView',
    'views/salesOrder/EditView',
    'models/QuotationModel',
    'collections/salesQuotation/filterCollection',
    'dataService',
    'constants',
    'helpers',
    'helpers'
], function ($,
             _,
             ListViewBase,
             listTemplate,
             listForWTrack,
             stagesTemplate,
             CreateView,
             ListItemView,
             ListTotalView,
             EditView,
             QuotationModel,
             ContentCollection,
             dataService,
             CONSTANTS,
             helpers) {
    'use strict';

    var OrdersListView = ListViewBase.extend({

        listTemplate: listTemplate,
        ListItemView: ListItemView,

        ContentCollection: ContentCollection,
        CreateView       : CreateView,
        EditView         : EditView,

        contentType: 'salesOrder', // needs in view.prototype.changeLocationHash

        initialize: function (options) {
            this.filter = options.filter || {};
            this.filter.forSales = {
                key  : 'forSales',
                value: ['true']
            };

            this.startTime = options.startTime;
            this.collection = options.collection;
            this.parrentContentId = options.collection.parrentContentId;
            this.sort = options.sort;
            this.page = options.collection.currentPage;

            this.render();
        },

        showFilteredPage: function (filter) {
            var itemsNumber = $('#itemsNumber').text();
            
            $('#top-bar-deleteBtn').hide();
            $('#checkAll').prop('checked', false);

            this.startTime = new Date();
            this.newCollection = false;

            this.filter = Object.keys(filter).length === 0 ? {} : filter;

            this.filter.forSales = {
                key  : 'forSales',
                value: ['true']
            };

            this.changeLocationHash(1, itemsNumber, filter);
            this.collection.showMore({count: itemsNumber, page: 1, filter: filter});
            this.getTotalLength(null, itemsNumber, filter);
        },

        events: {
            'click .stageSelect'                 : 'showNewSelect',
            'click  .list tbody td:not(.notForm)': 'goToEditDialog',
            'click .newSelectList li'            : 'chooseOption'
        },

        chooseOption: function (e) {
            var self = this;
            var $target = $(e.target);
            var $targetElement = $target.parents('td');
            var id = $targetElement.attr('id');
            var model = this.collection.get(id);

            model.save({
                workflow: $target.attr('id')
            }, {
                headers: {
                    mid: 55
                },

                patch   : true,
                validate: false,
                success : function () {
                    self.showFilteredPage(self.filter, self);
                }
            });

            this.hideNewSelect();
            return false;
        },

        recalcTotal: function () {
            var total = 0;

            _.each(this.collection.toJSON(), function (model) {
                total += parseFloat(model.paymentInfo.total);
            });

            this.$el.find('#total').text(helpers.currencySplitter(total.toFixed(2)));
        },

        render: function () {
            var self = this;
            var $thisEl = this.$el;

            $('.ui-dialog ').remove();

            $thisEl.html('');
            $thisEl.append(_.template(listForWTrack));

            var itemView = new ListItemView({
                collection : this.collection,
                page       : this.page,
                itemsNumber: this.collection.namberToShow
            });

            $thisEl.append(itemView.render());

            // added two parameters page and items number
            $thisEl.append(new ListTotalView({
                element : this.$el.find('#listTable'),
                cellSpan: 5
            }).render());

            this.renderFilter();
            this.renderPagination($thisEl, this);
            
            $thisEl.append('<div id="timeRecivingDataFromServer">Created in ' + (new Date() - this.startTime) + ' ms</div>');

            dataService.getData(CONSTANTS.URLS.WORKFLOWS_FETCH, {
                wId         : 'Sales Order',
                source      : 'purchase',
                targetSource: 'order'
            }, function (stages) {
                self.stages = stages;
            });
        },

        goToEditDialog: function (event) {
            var self = this;
            var $eventTarget = $(event.target);
            var $closestTr = $eventTarget.closest('tr');
            var dataId = $closestTr.data('id');
            var isNotEditable = $closestTr.hasClass('notEditable');
            var quotationModel = new QuotationModel({
                validate: false
            });
            var onlyView;

            event.preventDefault();

            if (isNotEditable) {
                onlyView = true;
            }

            quotationModel.urlRoot = '/Order/';
            quotationModel.fetch({
                data: {
                    contentType: self.contentType,
                    id         : dataId
                },

                success: function (model) {
                    return new self.EditView({
                        model   : model,
                        onlyView: onlyView
                    });
                },
                
                error: function () {
                    App.render({
                        type   : 'error',
                        message: 'Please refresh browser'
                    });
                }
            });
        }

    });

    return OrdersListView;
});
