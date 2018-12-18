var plugin = {};
var common = require('../../../api/utils/common.js');
var plugins = require('../../pluginManager.js');

(function (plugin) {
    //Write api call
    plugins.register("/i/my-metric", function (ob) {
        //Get request parameters
        let obParams = ob.params;
        //Check parameters
        if (!obParams.qstring.app_key) {
            common.returnMessage(obParams, 400, 'Missing request parameter: app_key');
            return true;
        }
        if (!obParams.qstring.api_key) {
            common.returnMessage(obParams, 400, 'Missing request parameter: api_key');
            return true;
        }
        if (!obParams.qstring.device_id) {
            common.returnMessage(obParams, 400, 'Missing request parameter: device_id');
            return true;
        }
        if (!obParams.qstring.my_metric) {
            common.returnMessage(obParams, 400, 'Missing request parameter: my_metric');
            return true;
        }
        if (!obParams.qstring.my_metric_count) {
            common.returnMessage(obParams, 400, 'Missing request parameter: my_metric_count');
            return true;
        }
        //Check user authorization
        //let validateUserForWrite = ob.validateUserForWriteAPI;
        //validateUserForWrite(function (params) {
        let collectionName = "MyMetric";
        let now = new Date();
        let obMyMetric = {
            "name": params.qstring.my_metric,
            "count": parseInt(params.qstring.my_metric_count),
            "app_key": params.qstring.app_key,
            "device_id": params.qstring.device_id,
            "date": now
        }
        common.db.collection(collectionName).insertOne(obMyMetric, function (obErr, obRes) {
            if (!obErr) {
                common.returnMessage(ob.params, 201, "Success");
                return true;
            }
            else {
                common.returnMessage(ob.params, 500, obErr.message);
                return false;
            }
        });
        //}, obParams);

        return true;//need to return true, so core does not repond that path does not exist
    });

    //Read api call
    plugins.register("/o/my-metric", function (ob) {
        try {
            //Get request parameters
            let obParams = ob.params;
            //Check parameters
            if (!obParams.qstring.app_key) {
                common.returnMessage(obParams, 400, 'Missing request parameter: app_key');
                return true;
            }
            if (!obParams.qstring.api_key) {
                common.returnMessage(obParams, 400, 'Missing request parameter: api_key');
                return true;
            }
            if (!obParams.qstring.device_id) {
                common.returnMessage(obParams, 400, 'Missing request parameter: device_id');
                return true;
            }
            if (!obParams.qstring.period) {
                common.returnMessage(obParams, 400, 'Missing request parameter: period');
                return true;
            }
            if (obParams.qstring.period.indexOf(",") !== -1) {
                try {
                    obParams.qstring.period = JSON.parse(obParams.qstring.period);
                }
                catch (SyntaxError) {
                    common.returnMessage(obParams, 400, 'Bad request parameter: period');
                    return true;
                }
            }
            else {
                switch (obParams.qstring.period) {
                    case "month":
                    case "day":
                    case "yesterday":
                    case "hour":
                        break;
                    default:
                        if (!/([0-9]+)days/.test(obParams.qstring.period)) {
                            common.returnMessage(obParams, 400, 'Bad request parameter: period');
                            return true;
                        }
                        break;
                }
            }
            //Check user authorization
            //let validateUserForRead = ob.validateUserForDataReadAPI;
            //validateUserForRead(params, function () {
            countlyCommon.setPeriod(params.qstring.period, true);
            let collectionName = "MyMetric";
            let periodObj = countlyCommon.periodObj;
            let documents = [];
            for (var i = 0; i < periodObj.reqZeroDbDateIds.length; i++) {
                documents.push("no-segment_" + periodObj.reqZeroDbDateIds[i]);
                for (var m = 0; m < common.base64.length; m++) {
                    documents.push("no-segment_" + periodObj.reqZeroDbDateIds[i] + "_" + common.base64[m]);
                }
            }

            common.db.collection(collectionName).find({ "_id": { "$in": documents } }).toArray(function (obErr, arDocs) {
                try{
                    if (!obErr) {
                        common.returnOutput(params, arDocs);
                        return true;
                    }
                    else {
                        common.returnMessage(params, 500, obErr.message);
                        return false;
                    }
                }
                catch(e){
                    common.returnMessage(obParams, 500, "Failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
                    return true;
                }
            });
            //});

            common.returnMessage(obParams, 400, 'Nothing return. So run only return true.');
            return true;//need to return true, so core does not repond that path does not exist
        }
        catch(e){
            common.returnMessage(obParams, 500, "Failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
            return true;
        }
    });
}(plugin));

module.exports = plugin;