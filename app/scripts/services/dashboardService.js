 'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 * # UserLoginService
 * User Service for user authentication
 */
app.factory('DashboardService', ['$q', '$http','$rootScope', function ($q, $http, $rootScope) {
    var dashboardService = {};

    dashboardService.getContractsDeployedByMe = function () 
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
	
    dashboardService.approveContract = function (approvalData) {

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
    dashboardService.shipmentNotify = function (notificationDetails) {
        
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://52.73.17.136:8083/shipmentNotification/',
            data: notificationDetails,
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
    dashboardService.signOffByContractOwner = function (signOffDetails) {
        
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://52.73.17.136:8083/signofByContractOwner/',
            data: signOffDetails,
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

    return dashboardService;
  }]);