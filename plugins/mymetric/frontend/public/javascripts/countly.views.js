window.MyMetricView = countlyView.extend({
    initialize: function () {
        //we can initialize stuff here
        CountlyHelpers.loadJS("mymetric/javascripts/daterangepicker.js");
        CountlyHelpers.loadJS("mymetric/javascripts/bootstrap-table.js");
        CountlyHelpers.loadCSS("mymetric/stylesheets/daterangepicker.css");
        CountlyHelpers.loadCSS("mymetric/stylesheets/bootstrap-table.css");
    },
    beforeRender: function () {
        console.log("MyMetric plugin beforeRender called");
        if (this.template) {
            return $.when(myMetricPlugin.initialize()).then(function () { });
        }
        else {
            var self = this;
            return $.when($.get(countlyGlobal.path + 'mymetric/templates/mymetric.html', function (src) {
                self.template = Handlebars.compile(src);
            }), myMetricPlugin.initialize()).then(function () { });
        }
    },
    renderCommon: function (isRefresh) {
        var myMetricData = myMetricPlugin.fnGetData();
        this.templateData = {
            "page-title": "My Metric"
        };
        var self = this;

        if (!isRefresh) {
            $(this.el).html(this.template(this.templateData));
            setTimeout(function () {
                //Prepare Range Picker
                this.dpicker = $("#inputMyMetricRangePicker").daterangepicker({
                    maxDate: moment(),
                    opens: "left",
                    timePicker24Hour: false,
                    autoUpdateInput: true,
                    autoApply: true,
                    timePicker: false,
                    timePickerIncrement: 1,
                    locale: {
                        "format": "ll",
                        "separator": " - ",
                        "firstDay": 1
                    },
                    ranges: {
                        'Today': [moment().startOf('day'), moment()],
                        'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                        'This Week': [moment().startOf('week'), moment().endOf('week')],
                        'This Month': [moment().startOf('month'), moment().endOf('month')],
                        'This Year': [moment().startOf('year'), moment().endOf('year')],
                        'Last 7 Days': [moment().subtract(7, 'days').startOf('day'), moment().endOf('day')],
                        'Last 15 Days': [moment().subtract(15, 'days').startOf('day'), moment().endOf('day')],
                        'Last 30 Days': [moment().subtract(30, 'days').startOf('day'), moment().endOf('day')],
                        'Last 60 Days': [moment().subtract(60, 'days').startOf('day'), moment().endOf('day')]
                    }
                }).on('apply.daterangepicker', function (event, picker) {
                    var rangePickerInput = $(this);
                    var rangePicker = $(this).data('daterangepicker');

                    rangePickerInput.val(moment(rangePicker.startDate).format('ll') + ' - ' + moment(rangePicker.endDate).format('ll'));

                    let filter = moment(rangePicker.startDate)._d.getTime() + "," + moment(rangePicker.endDate)._d.getTime();
                    $.when(myMetricPlugin.fnGetMyMetric(filter)).done(function () {
                        let myMetricDataNew = myMetricPlugin.fnGetData();
                        $('#dataTableOne').dataTable().fnClearTable();
                        $('#dataTableOne').dataTable().fnAddData(myMetricDataNew);
                        $('#dataTableOne').dataTable().fnDraw();
                    });
                });
                //Prepare Data Table
                this.dtable = $('#dataTableOne').dataTable($.extend({}, $.fn.dataTable.defaults, {
                    "aaData": myMetricData,
                    "aoColumns": [
                        {
                            "mData": "dateString",
                            "sTitle": "Date"
                        },
                        {
                            "mData": "name",
                            "sTitle": "Metric"
                        },
                        {
                            "mData": "metricCount",
                            "sTitle": "Count"
                        }
                    ]
                }));
                $("#dataTableOne").stickyTableHeaders();
            }, 250);
        }
    },
    refresh: function () {
        if (app.activeView !== self) {
            return false;
        }
        self.renderCommon(true);
    }
});

//register views
app.myMetricView = new MyMetricView();
app.route("/mymetric", "mymetric", function () {
    this.renderWhenReady(this.myMetricView);
});

$(document).ready(function () {
    let a = document.createElement("a");
    a.className = "item";
    a.setAttribute("href", "#/mymetric");

    let divLogo = document.createElement("div");
    divLogo.className = "logo management fa fa-paper-plane";
    a.appendChild(divLogo);

    let divText = document.createElement("div");
    divText.className = "text";
    divText.innerHTML = "My Metric";
    a.appendChild(divText);

    $('#web-type').append(a);
});