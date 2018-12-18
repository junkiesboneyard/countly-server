//#region Requirements
var mongo = require('../../frontend/express/node_modules/mongoskin');
var async = require('../../api/utils/async.min.js');
var fs = require('fs');
var path = require("path");
var countlyConfig = require('../../frontend/express/config');
//#endregion

//#region Globals
var dbName;
var countlyDb;
//#endregion

//#region Creating Directories
//Inputs    : -
//Outputs   : -
//Definition: When neccessary call this function. Function creates needed directories.
let fnCreateNeededDirectories = () => {
    try {
        console.log("MyMetric Plugin: Creating needed directories");
        var dir = path.resolve(__dirname, '');
        fs.mkdir(dir + '/../../frontend/express/public/folder', function () {
            //Implement for requirements.
        });
    }
    catch (e) {
        throw (e);
    }
}
//#endregion

//#region Modifying Database
//Inputs    : -
//Outputs   : -
//Definition: Modify database according to plugin
let fnModifyDatabase = () => {
    try {
        console.log("MyMetric Plugin: Modifying database");
        if (typeof countlyConfig.mongodb === "string") {
            dbName = countlyConfig.mongodb;
        }
        else if (typeof countlyConfig.mongodb.replSetServers === 'object') {
            countlyConfig.mongodb.db = countlyConfig.mongodb.db || 'countly';
            //mongodb://db1.example.net,db2.example.net:2500/?replicaSet=test
            dbName = countlyConfig.mongodb.replSetServers.join(",") + "/" + countlyConfig.mongodb.db;
        }
        else {
            dbName = (countlyConfig.mongodb.host + ':' + countlyConfig.mongodb.port + '/' + countlyConfig.mongodb.db);
        }
        if (dbName.indexOf("mongodb://") !== 0) {
            dbName = "mongodb://" + dbName;
        }
        countlyDb = mongo.db(dbName);

        countlyDb.collection('apps').find({}).toArray(function (err, apps) {
            try {
                if (!apps || err) {
                    console.log("MyMetric Plugin: No apps to upgrade");
                    countlyDb.close();
                    return;
                }
                function upgrade(app, done) {
                    console.log("Adding indexes to " + app.name);
                    countlyDb.collection('app_users' + app._id).ensureIndex({ "name": 1 }, done);
                }
                async.forEach(apps, upgrade, function () {
                    console.log("Plugin installation finished");
                    countlyDb.close();
                });
            }
            catch (e) {
                console.log("MyMetric Plugin failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
                countlyDb.close();
                return;
            }
        });
    }
    catch (e) {
        throw (e);
    }
}
//#endregion

//#region Install Plugin
try {
    console.log("MyMetric Plugin: Installing...");
    //fnCreateNeededDirectories();
    fnModifyDatabase();
}
catch (e) {
    console.log("MyMetric Plugin installing failed. Error Message: " + e.message + ". Stack trace: " + e.stack);
    if(countlyDb){//When error occured, if countlyDb is connected, then close connection.
        countlyDb.close();
    }
}
//#endregion