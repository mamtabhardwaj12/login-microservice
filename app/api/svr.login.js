/**
 * Created By :- Akshay
 * Created Date :- 29-11-2017 01:00 pm
 * Version :- 1.0.0
 */
var config = require('../../config/config.json');                       // call configration file
var _ = require('lodash');                                              // Load the full build. for manipulating objects and collections
var jwt = require('jsonwebtoken');                                      // for creating token
var bcrypt = require('bcryptjs');                                       // for hashing
var Q = require('q');                                                   // for promise 
var mongo = require('mongoskin');                                       // call mongodb    
var db = mongo.db(config.connectionString, { native_parser: true });    // mongodb connectivity
db.bind('users');                                                       // bind the collection

var service = {};

service.authenticate = authenticate;
service.getUser = getUser;

module.exports = service;

function authenticate(req, res) {
    var deferred = Q.defer();
    var username = req.body.username;
    var password = req.body.password;
    var collectionName = req.body.appName;                              // create the collection based on appName
    db.bind(collectionName);                                            // bind the collection based on appName

    // console.log("collectionName : : ", collectionName);

    db.collection(collectionName).findOne({ username: username }, function (err, user) {
        // console.log("mongo error : ", err);
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            deferred.resolve(jwt.sign({ sub: user._id }, config.secret));    // authentication successful
        } else {
            deferred.resolve();                                              // authentication failed
        }
    });
    return deferred.promise;
}


function getUser(req, res) {
    var deferred = Q.defer();
    var username = req.body.username;
    var collectionName = req.body.appName;                              // create the collection based on appName
    db.bind(collectionName);                                            // bind the collection based on appName
    db.collection(collectionName).findOne({ username: username }, function (err, user) {
        // console.log("mongo error : ", err);
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(user);
    });
    return deferred.promise;
}