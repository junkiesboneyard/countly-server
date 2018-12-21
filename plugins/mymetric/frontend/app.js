var plugin = {};
var countlyConfig = require('../../../frontend/express/config');
var configMyMetric = require('../api/config.js');
var utilsMyMetric = require('../api/utils.js');

(function (plugin) {
    plugin.init = function (app, countlyDb, express) {
        //Get MyMetric Plugin initial page
        app.get(countlyConfig.path + '/mymetric', function (req, res, next) {
            try {
                //Get period for output data
                let obPeriod = utilsMyMetric.fnGetPeriod(req.query.period);
                if (!obPeriod.state) {//If period information not exists, set current default
                    res.send({
                        "status": "Fail",
                        "errorText": obPeriod.errorText
                    });
                    return;
                }

                //Get metric information
                countlyDb.collection(configMyMetric["db"].collectionName).find({ "date": { "$gt": obPeriod.dStart, "$lt": obPeriod.dEnd } }).toArray(function (obErr, arDocs) {
                    try {
                        if (!obErr) {
                            res.send({
                                "status": "Success",
                                "arMyMetric": arDocs
                            });
                        }
                        else {
                            res.send({
                                "status": "Fail",
                                "errorText": obErr.message
                            });
                        }
                    }
                    catch (e) {
                        res.send({
                            "status": "Fail",
                            "errorText": "Failed. Error Message: " + e.message + ". Stack trace: " + e.stack
                        });
                    }
                });
            }
            catch (e) {
                res.send({
                    "status": "Fail",
                    "errorText": "Failed. Error Message: " + e.message + ". Stack trace: " + e.stack
                });
            }
        });
    };
}(plugin));

module.exports = plugin;