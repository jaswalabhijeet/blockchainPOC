'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 * # UserLoginService
 * User Service for user authentication
 */
app.factory('UserLoginService', ['$q', '$http', '$cookies','$cookieStore', function ($q, $http, $cookies,$cookieStore) 
{
    var userDetails = {};

    userDetails.getUsernameDetails = function () 
    {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://34.192.232.173:3000/username'
        }).then(function (usernameDetails) {
            deferred.resolve(usernameDetails);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    userDetails.isAuthenticated = function () {
        if ($cookieStore.get('loginData') != null) {
            return $cookieStore.get('loginData');
        } else if (userDetails.userData != null) {
            return userDetails.userData;
        } else {
            return null;
        }
    }
    userDetails.authenticateUser = function (userName, passWord) {
        
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://34.192.232.173:3000/login',
            data: {
                username: userName,
                password: passWord
            },
			json:true,//send the desired json data in the post....
			headers: {'Content-Type':'application/json'} 
        }).then(function (userInfo) {

            userDetails.userData = userInfo;
            deferred.resolve(userInfo);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    return userDetails;
  }]);