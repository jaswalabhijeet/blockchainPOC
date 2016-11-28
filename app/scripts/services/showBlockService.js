 'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 * # UserLoginService
 * User Service for user authentication
 */
app.factory('ShowBlockService', ['$q', '$http','$rootScope', function ($q, $http, $rootScope) {
    var showBlockService = {};

    showBlockService.getContractsDeployedByMe = function () 
	{
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://52.73.17.136:3000/contractDetails?username='+$rootScope.logUser
        }).then(function (blockStatus) {
            deferred.resolve(blockStatus);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }
	
    showBlockService.approveContract = function (approvalData) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://52.73.17.136:8083/approveContract/',
            data: approvalData,
            json:true,//send the desired json data in the post....
            headers: {'Content-Type':'application/json'} 
        }).then(function (success) 
        {
            deferred.resolve(success);  
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }
    
    return showBlockService;
  }]);