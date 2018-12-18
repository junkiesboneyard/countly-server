//#region Requirements
var request = require('supertest');
var should = require('should');
var testUtils = require("../../../test/testUtils");
request = request(testUtils.url);//request with url
//#endregion

//#region Globals
var APP_KEY = "";
var API_KEY_ADMIN = "";
var APP_ID = "";
var DEVICE_ID = "1234567890";
//#endregion

//#region Testing
describe('Testing mymetric plugin', function () {
    //Empty Output
    describe('Get empty mymetric data', function () {
        it('should have no data', function (done) {
            //First we authenticate
            before(function (done) {
                testUtils.login(request);
                testUtils.waitLogin(done);
            });

            //We can retrieve settings
            API_KEY_ADMIN = testUtils.get("API_KEY_ADMIN");
            APP_ID = testUtils.get("APP_ID");
            APP_KEY = testUtils.get("APP_KEY");

            //Make a request
            request
                .get('/o/my-metric?api_key=' + API_KEY_ADMIN + '&app_id=' + APP_ID)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    var ob = JSON.parse(res.text);
                    ob.should.be.empty;
                    done();
                });
        });
    });
});
//#endregion