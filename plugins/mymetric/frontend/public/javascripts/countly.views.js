window.MyMetricView = countlyView.extend({
    initialize: function () {
        //we can initialize stuff here
        CountlyHelpers.loadJS("mymetric/javascripts/daterangepicker.js");
        CountlyHelpers.loadCSS("mymetric/stylesheets/daterangepicker.css");
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
        console.log("MyMetric plugin renderCommon called");
        var myMetricData = myMetricPlugin.fnGetData();
        this.templateData = {
            "page-title": "My Metric",
            "title": "My Metric",
            "content": "Content__",
            "footer": "Footer__"
        };

        var self = this;

        if (!isRefresh) {
            $(this.el).html(this.template(this.templateData));
            setTimeout(function () {
                $("#inputMyMetricRangePicker").daterangepicker({
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
                })
                    .on('apply.daterangepicker', function (event, picker) {
                        var rangePickerInput = $(this);
                        var rangePicker = $(this).data('daterangepicker');

                        rangePickerInput.val(moment(rangePicker.startDate).format('ll') + ' - ' + moment(rangePicker.endDate).format('ll'));
                    })
            }, 250);
        }
        console.log(myMetricData);
    },
    refresh: function () {
        console.log("MyMetric plugin refresh called");
        return;
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