window.MyMetricView = countlyView.extend({
    initialize: function () {
        //we can initialize stuff here
        CountlyHelpers.loadJS("mymetric/javascripts/daterangepicker.js");
        CountlyHelpers.loadJS("mymetric/javascripts/chartist.js");
        CountlyHelpers.loadCSS("mymetric/stylesheets/daterangepicker.css");
        CountlyHelpers.loadCSS("mymetric/stylesheets/chartist.css");
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
                        //Update Data
                        let myMetricDataNew = myMetricPlugin.fnGetData();
                        //Update Table
                        $('#dataTableOne').dataTable().fnClearTable();
                        $('#dataTableOne').dataTable().fnAddData(myMetricDataNew);
                        $('#dataTableOne').dataTable().fnDraw();
                        //Update Graph
                        let graphData = self.fnPrepareGraphData(myMetricDataNew);
                        let graphOptions = self.fnGetGraphOptions();
                        this.graph = new Chartist.Line('.ct-chart', graphData, graphOptions);
                    });
                });
                rangePickerInput.val(moment(rangePicker.startDate).startOf("week").format('ll') + ' - ' + moment(rangePicker.endDate).endOf("week").format('ll'));
                //Prepare Graph
                let graphData = self.fnPrepareGraphData(myMetricData);
                let graphOptions = self.fnGetGraphOptions();
                this.graph = new Chartist.Line('.ct-chart', graphData, graphOptions);
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
    },
    fnPrepareGraphData: (arData) => {
        //Take 3 most metric values defined date range.
        let obMostMetric = {}, arMostMetric = [], arGraphData = [];
        //Calculate each metric count values.
        arData.forEach(function (each) {
            if (!obMostMetric[each.name]) {
                obMostMetric[each.name] = {
                    name: each.name,
                    metricCount: 0,
                    totalData: []
                }
            }
            obMostMetric[each.name].metricCount += each.metricCount;
            obMostMetric[each.name].totalData.push(each);
        });
        //Put these values into array for sorting
        for (key in obMostMetric) {
            arMostMetric.push(obMostMetric[key]);
        }
        //Sort according to metric count
        arMostMetric.sort(function (a, b) {
            if (aDate.metricCount > bDate.metricCount) {
                return 1;
            }
            if (aDate.metricCount < bDate.metricCount) {
                return -1;
            }
            return 0;
        });
        //Take 3 
        arMostMetric = arMostMetric.splice(arMostMetric.length - 3, 3);
        console.log(arMostMetric);

        let obLabels = {}, arTemp = [], arLabels = [];
        arData.forEach(function (each) {
            if (!obLabels[each.dateString]) {
                obLabels[each.dateString] = {
                    "dateString": each.dateString,
                    "date": each.date
                }
            }
        });
        for (key in obLabels) {
            arTemp.push(obLabels[key]);
        }
        arTemp.sort(function (a, b) {
            let aDate = new Date(a.date);
            let bDate = new Date(b.date);
            if (aDate.getTime() > bDate.getTime()) {
                return 1;
            }
            if (aDate.getTime() < bDate.getTime()) {
                return -1;
            }
            return 0;
        });
        arTemp.forEach(function (each) { arLabels.push(each.dateString) });

        arMostMetric.forEach(function (eachMetric) {
            let ARRAY = [];
            arLabels.forEach(function (eachLabel) {
                let index = eachMetric.totalData.findIndex(function (data) {
                    return data.dateString == eachLabel
                });
                if (index == -1) {
                    ARRAY.push(0);
                }
                else {
                    ARRAY.push(eachMetric.totalData[index].metricCount);
                }
            });
            arGraphData.push(ARRAY);
        });

        return {
            "labels": arLabels,
            "series": arGraphData
        };
    },
    fnGetGraphOptions: () => {
        return {
            fullWidth: true,
            chartPadding: { right: 40 }
        };
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