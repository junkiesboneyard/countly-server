(function (myMetricPlugin, $) {
    //Private properties
    var _data = {};
    var fnGetMyMetricDone = (obResult) => {
        if (obResult.arMyMetric && obResult.arMyMetric.length) {
            let HASH = Object.create(null);
            obResult.arMyMetric.forEach(function (obMyMetric) {
                let hashKey = obMyMetric.name + moment(obMyMetric.date).startOf('day').format('ll');
                if (!HASH[hashKey]) {
                    HASH[hashKey] = {
                        "date": moment(obMyMetric.date).startOf('day')._d,
                        "dateString": moment(obMyMetric.date).startOf('day').format('ll'),
                        "name": obMyMetric.name,
                        "metricCount": 0
                    }
                }
                HASH[hashKey].metricCount += parseInt(obMyMetric.count);
            });
            let ARRAY = [];
            Object.keys(HASH).forEach(function (hashKey) {
                ARRAY.push(HASH[hashKey]);
            });
            ARRAY.sort(function (a, b) {
                aDate = new Date(a.date);
                bDate = new Date(b.date);
                if (aDate.getTime() > bDate.getTime()) {
                    return -1;
                }
                else if (aDate.getTime() < bDate.getTime()) {
                    return 1;
                }
                return 0;
            });
            _data = ARRAY;
        }
        else {
            _data = [];
        }
    };
    var fnAjaxCall = (obAjax, fnDone, fnFail, fnAlways) => {
        //Inputs    : obAjax:{ szUrl(R), obData(O), szTyp(R) }, fnDone(R), fnFail(O), fnAlways(O)
        //Outputs   : returns function
        //Definition: Function make ajax call with parameters.
        try {
            if (obAjax.szUrl == undefined || obAjax.szUrl == null) {
                throw (new Error("Missing 'szUrl' parameter."));
            }
            if (typeof obAjax.szUrl != "string") {
                throw (new Error("'szUrl' parameter must be string."));
            }
            if (obAjax.szTyp == undefined || obAjax.szTyp == null) {
                throw (new Error("Missing 'szTyp' parameter."));
            }
            if (fnDone == undefined || fnDone == null) {
                throw (new Error("Missing 'fnDone' parameter."));
            }
            switch (obAjax.szTyp) {
                case "GET":
                    let url = obAjax.szUrl;
                    if (obAjax.obData) {
                        url += "?";
                        Object.keys(obAjax.obData).forEach(function (key, index) {
                            url += key + "=" + obAjax.obData[key];
                            if (index != Object.keys(obAjax.obData).length - 1) {
                                url += "&";
                            }
                        });
                    }
                    let obGET = {
                        "type": "GET",
                        "url": url,
                        "dataType": "json",
                        "contentType": "application/json; charset=utf-8"
                    }
                    return $.ajax(obGET)
                        .done(obResult => {
                            fnDone(obResult);
                        })
                        .fail(obError => {
                            if (fnFail) {
                                fnFail(obError);
                            }
                            else {
                                console.log(obAjax.szUrl + " ajax call failed. Status: " + obError.status + ". Status Text: " + obError.statusText);
                            }
                        })
                        .always(() => {
                            if (fnAlways) {
                                fnAlways();
                            }
                        });
                    break;
                case "POST":
                    let obPOST = {
                        "type": "POST",
                        "url": obAjax.szUrl,
                        "dataType": "json",
                        "contentType": "application/json; charset=utf-8"
                    }
                    if (obAjax.obData) {
                        obPOST["data"] = JSON.stringify(obAjax.obData)
                    }
                    return $.ajax(obPOST)
                        .done(obResult => {
                            fnDone(obResult);
                        })
                        .fail(obError => {
                            if (fnFail) {
                                fnFail(obError);
                            }
                            else {
                                console.log(obAjax.szUrl + " ajax call failed. Status: " + obError.status + ". Status Text: " + obError.statusText);
                            }
                        })
                        .always(() => {
                            if (fnAlways) {
                                fnAlways();
                            }
                        });
                    break;
                default:
                    throw (new Error("Ajax type not identified."));
            }
        }
        catch (e) {
            console.log("fnAjaxCall failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
        }
    };

    //Public methods
    myMetricPlugin.initialize = () => {
        console.log("myMetricPlugin model initializing...");
        return myMetricPlugin.fnGetMyMetric("week");
    };

    myMetricPlugin.fnGetMyMetric = (periodString) => {
        //we can initialize stuff here
        return fnAjaxCall({
            "szUrl": "/mymetric",
            "szTyp": "GET",
            "obData": {
                "period": periodString
            }
        }, fnGetMyMetricDone);
    };

    myMetricPlugin.fnGetData = () => {
        return _data;
    };

}(window.myMetricPlugin = window.myMetricPlugin || {}, jQuery));