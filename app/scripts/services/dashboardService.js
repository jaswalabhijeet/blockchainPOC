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
            url: 'http://34.192.232.173:3000/contractDetails?username='+$rootScope.logUser
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
            url: 'http://34.192.232.173:8085/approveContract/',
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
            url: 'http://34.192.232.173:8085/shipmentNotification/',
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
            url: 'http://34.192.232.173:8085/signofByContractOwner/',
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

    dashboardService.signOffByDistributor = function (signOffDetails) 
    {    
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://34.192.232.173:8085/signofByDistributor/',
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

    dashboardService.approvalBySupplier = function (approvalData) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://34.192.232.173:8085/approveBySupplier/',
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

    dashboardService.approvalByManufacturer = function (approvalData) {

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://34.192.232.173:8085/signofByManufacturer/',
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

    dashboardService.approvalByManufacturerDist = function (approvalData) 
    {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://34.192.232.173:8085/approveByManufacturer/',
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

    dashboardService.getDrugDetails = function () 
    {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://34.192.232.173:3000/batchIDDetails'
        }).then(function (pdtDetails) {
            deferred.resolve(pdtDetails);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    dashboardService.getBatchIDDetails = function (pname) 
    {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://34.192.232.173:3000/batchIDForproductName?productName='+pname
        }).then(function (pdtDetails) {
            deferred.resolve(pdtDetails);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    return dashboardService;
  }]);