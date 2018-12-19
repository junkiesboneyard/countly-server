var plugin = {};
var common = require('../../../api/utils/common.js');
var countlyCommon = require('../../../api/lib/countly.common.js');
var plugins = require('../../pluginManager.js');
var configMyMetric = require('./config.js');
var utilsMyMetric = require('./utils.js');

(function () {
    //Write api call
    plugins.register("/i/my-metric", function (ob) {
        try {
            //Get request parameters
            let obParams = ob.params;

            //Check parameters.
            let obCheckSyntax = utilsMyMetric.fnCheckWriteAPISyntax(obParams.qstring);
            if (!obCheckSyntax.state) {//Syntax is incorrect
                common.returnMessage(obParams, 400, obCheckSyntax.errorText);
                return true;
            }

            //Create new metric, then save metric.
            let now = new Date();
            let obMyMetric = {
                "name": obParams.qstring.my_metric,
                "count": parseInt(obParams.qstring.my_metric_count),
                "app_key": obParams.qstring.app_key,
                "device_id": obParams.qstring.device_id,
                "date": now
            }
            common.db.collection(configMyMetric["db"].collectionName).insertOne(obMyMetric, function (obErr, obRes) {
                if (!obErr) {
                    common.returnMessage(obParams, 200, "Success");
                    return true;
                }
                else {
                    common.returnMessage(obParams, 500, obErr.message);
                    return false;
                }
            });
        }
        catch (e) {
            common.returnMessage(ob.params, 500, "Failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
            return true;
        }
    });

    //Read api call
    plugins.register("/o/my-metric", function (ob) {
        try {
            //Get request parameters
            let obParams = ob.params;

            //Check parameters.
            let obCheckSyntax = utilsMyMetric.fnCheckReadAPISyntax(obParams.qstring);
            if (!obCheckSyntax.state) {//Syntax is incorrect
                common.returnMessage(obParams, 400, obCheckSyntax.errorText);
                return true;
            }

            //Get period for output data
            let obPeriod = utilsMyMetric.fnGetPeriod(obParams.qstring.period);
            if (!obPeriod.state) {//Syntax is incorrect
                common.returnMessage(obParams, 400, obPeriod.errorText);
                return true;
            }

            //Get metric information
            common.db.collection(configMyMetric["db"].collectionName).find({ "date": { "$gt": obPeriod.dStart, "$lt": obPeriod.dEnd } }).toArray(function (obErr, arDocs) {
                try {
                    if (!obErr) {
                        console.log(arDocs);
                        common.returnOutput(obParams, arDocs);
                        return true;
                    }
                    else {
                        common.returnMessage(obParams, 500, obErr.message);
                        return false;
                    }
                }
                catch (e) {
                    common.returnMessage(obParams, 500, "Failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
                    return true;
                }
            });
        }
        catch (e) {
            common.returnMessage(ob.params, 500, "Failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
            return true;
        }
    });

}(plugin));

module.exports = plugin;