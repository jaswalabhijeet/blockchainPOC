 'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 * # UserLoginService
 * User Service for user authentication
 */
app.factory('QueryService', ['$q', '$http','$rootScope', function ($q, $http, $rootScope) {
    var queryService = {};

    queryService.getProductDetails = function (qryOption) 
	{
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://52.73.17.136:3000/productDetails?columnname='+qryOption
        }).then(function (blockStatus) {
            deferred.resolve(blockStatus);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }
    queryService.getAuditDetails = function () 
    {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://34.192.232.173:3000/auditDetails'
        }).then(function (blockStatus) {
            deferred.resolve(blockStatus);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }
    queryService.getDetailsBlockData = function (blkData) 
    {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://52.73.17.136:3000/productDetails?columnname='+blkData
        }).then(function (dataStatus) {
            deferred.resolve(dataStatus);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    return queryService;
  }]);