'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 * # UserLoginService
 * User Service for user authentication
 */
app.factory('UserLoginService', ['$q', '$http', '$cookies','$cookieStore', function ($q, $http, $cookies,$cookieStore) {
    var userDetails = {};

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
            url: 'http://52.73.17.136:3000/login',
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