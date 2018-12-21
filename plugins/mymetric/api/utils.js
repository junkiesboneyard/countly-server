const fs = require('fs');
const moment = require('moment');

/**
* Function take anyMessage(string,object etc.), then write log on console
* @param {anyType} anyMessage - text log
* @returns -
*/
let fnPrintLog = (anyMessage) => {
    try {
        let szTime = '[' + new Date() + ']';
        if (typeof anyMessage == "object") {
            anyMessage = JSON.stringify(anyMessage);
        }
        console.log(szTime + " " + anyMessage);
    }
    catch (e) {
        console.log("MyMetric plugin utils.js/fnPrintLog failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
    }
}

/**
* Function take anyMessage(string,object etc.), then write log on console and write log on file
* @param {anyType} anyMessage - text log
* @returns -
*/
let fnSaveLog = (anyMessage) => {
    try {
        //Firstly print log 
        fnPrintLog(anyMessage);
        //Secondly save log
        let szTime = '[' + new Date() + ']';
        if (typeof anyMessage == "object") {
            anyMessage = JSON.stringify(anyMessage);
        }
        let szErrorText = szTime + " " + anyMessage + '\r\n';
        fs.appendFileSync('myMetricError.log', szErrorText);
    }
    catch (e) {
        console.log("MyMetric plugin utils.js/fnSaveLog failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
    }
};

/**
* Function take queryString, then check save mymetric request query syntax is correct
* @param {string} queryString - Request query string
* @returns {object} checkStatus - state(R) property for check operation status, errorText(O)
*/
let fnCheckSaveWriteAPISyntax = (queryString) => {
    try {
        if (!queryString.hasOwnProperty('app_key')) {
            return { "state": false, "errorText": "Missing request parameter: app_key" };
        }
        if (!queryString.hasOwnProperty('device_id')) {
            return { "state": false, "errorText": "Missing request parameter: device_id" };
        }
        if (!queryString.hasOwnProperty('my_metric')) {
            return { "state": false, "errorText": "Missing request parameter: my_metric" };
        }
        if (!queryString.hasOwnProperty('my_metric_count')) {
            return { "state": false, "errorText": "Missing request parameter: my_metric_count" };
        }
        //Syntax is correct
        return { "state": true };
    }
    catch (e) {
        fnSaveLog("MyMetric plugin fnCheckSaveWriteAPISyntax failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
        return { "state": false, "errorText": "Query string syntax check failed." };
    }
}

/**
* Function take queryString, then check reset mymetric request query syntax is correct
* @param {string} queryString - Request query string
* @returns {object} checkStatus - state(R) property for check operation status, errorText(O)
*/
let fnCheckResetWriteAPISyntax = (queryString) => {
    try {
        if (!queryString.hasOwnProperty('app_key')) {
            return { "state": false, "errorText": "Missing request parameter: app_key" };
        }
        //Syntax is correct
        return { "state": true };
    }
    catch (e) {
        fnSaveLog("MyMetric plugin fnCheckResetWriteAPISyntax failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
        return { "state": false, "errorText": "Query string syntax check failed." };
    }
}

/**
* Function take queryString, then check read mymetric request query syntax is correct
* @param {string} queryString - Request query string
* @returns {object} checkStatus - state(R) property for check operation status, errorText(O)
*/
let fnCheckReadAPISyntax = (queryString) => {
    try {
        if (!queryString.hasOwnProperty('app_key')) {
            return { "state": false, "errorText": "Missing request parameter: app_key" };
        }
        if (!queryString.hasOwnProperty('api_key')) {
            return { "state": false, "errorText": "Missing request parameter: api_key" };
        }
        if (!queryString.hasOwnProperty('period')) {
            return { "state": false, "errorText": "Missing request parameter: period" };
        }
        //Syntax is correct
        return { "state": true };
    }
    catch (e) {
        fnSaveLog("MyMetric plugin fnCheckReadAPISyntax failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
        return { "state": false, "errorText": "Query string syntax check failed." };
    }
}

/**
* Function take periodString, then prepare period start and end date
* @param {string} periodString - Request query string
* @returns {object} checkStatus - state(R) property for check operation status, errorText(O), dStart, dEnd
*/
let fnGetPeriod = (periodString) => {
    try {
        if (!periodString) {
            throw (new Error("periodString is undefined"));
        }
        if (typeof periodString != "string") {
            throw (new Error("periodString is not a string"));
        }
        switch (periodString) {
            case "today":
                return {
                    "state": true,
                    "dStart": moment().startOf('day')._d,
                    "dEnd": moment().endOf('day')._d
                }
            case "yesterday":
                return {
                    "state": true,
                    "dStart": moment().subtract(1, 'days').startOf('day')._d,
                    "dEnd": moment().subtract(1, 'days').endOf('day')._d
                }
            case "week":
                return {
                    "state": true,
                    "dStart": moment().startOf('week')._d,
                    "dEnd": moment().endOf('week')._d
                }
            case "month":
                return {
                    "state": true,
                    "dStart": moment().startOf('month')._d,
                    "dEnd": moment().endOf('month')._d
                }
            case "year":
                return {
                    "state": true,
                    "dStart": moment().startOf('year')._d,
                    "dEnd": moment().endOf('year')._d
                }
            case "last7":
                return {
                    "state": true,
                    "dStart": moment().subtract(7, 'days').startOf('day')._d,
                    "dEnd": moment().endOf('day')._d
                }
            case "last15":
                return {
                    "state": true,
                    "dStart": moment().subtract(15, 'days').startOf('day')._d,
                    "dEnd": moment().endOf('day')._d
                }
            case "last30":
                return {
                    "state": true,
                    "dStart": moment().subtract(30, 'days').startOf('day')._d,
                    "dEnd": moment().endOf('day')._d
                }
            case "last60":
                return {
                    "state": true,
                    "dStart": moment().subtract(60, 'days').startOf('day')._d,
                    "dEnd": moment().endOf('day')._d
                }
            default:
                //Check manuel, start and end date must be split with ','
                if (periodString.indexOf(",") == -1) {
                    return { "state": false, "errorText": "Bad request parameter: period" };
                }
                let arTime = periodString.split(","),dStart,dEnd;
                if (arTime.length != 2) {//Expected 2 item, start and end date
                    return { "state": false, "errorText": "Bad request parameter: period" };
                }
                dStart = new Date(parseFloat(arTime[0]));
                dEnd = new Date(parseFloat(arTime[1]));
                if (!dStart || dStart == "Invalid Date" || !dEnd || dEnd == "Invalid Date") {
                    return { "state": false, "errorText": "Bad request parameter: period" };
                }
                return {
                    "state": true,
                    "dStart": dStart,
                    "dEnd": dEnd
                }
        }
    }
    catch (e) {
        fnPrintLog("MyMetric plugin fnGetPeriod failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
        return { "state": false, "errorText": "Period preparing is failed." };
    }
}

module.exports = {
    "fnPrintLog": fnPrintLog,
    "fnSaveLog": fnSaveLog,
    "fnCheckSaveWriteAPISyntax": fnCheckSaveWriteAPISyntax,
    "fnCheckResetWriteAPISyntax": fnCheckResetWriteAPISyntax,
    "fnCheckReadAPISyntax": fnCheckReadAPISyntax,
    "fnGetPeriod": fnGetPeriod
};