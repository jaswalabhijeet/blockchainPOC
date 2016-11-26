'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 * # UserLoginService
 * User Service for user authentication
 */
app.factory('AddContractService', ['$q', '$http', function ($q, $http) {
    var addContractService = {};

    addContractService.getBlockStatus = function () 
	{
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://52.73.17.136:32768/status'
        }).then(function (blockStatus) {
            deferred.resolve(blockStatus);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    addContractService.createContract = function (createContractData) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://52.73.17.136:8083/createContract/',
            data: createContractData,
			json:true,//send the desired json data in the post....
			headers: {'Content-Type':'application/json'} 
        }).then(function (success) {
            setTimeout(function(){
                deferred.resolve(success);
            }, 2000);
            
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    addContractService.fetchBlocks = function (minHeight, maxHeight) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://52.73.17.136:32768/blockchain?minHeight=' + minHeight + '&maxHeight=' + maxHeight
        }).then(function (success) {
            deferred.resolve(success);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    addContractService.fetchBlockData = function (height) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://52.73.17.136:32768/get_block?height=' + height
        }).then(function (success) {
            deferred.resolve(success);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    addContractService.insertBlockData = function (insertData) {
        
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'http://52.73.17.136:3000/insertContract',
            data: insertData,
			json:true,//send the desired json data in the post....
			headers: {'Content-Type':'application/json'} 
        }).then(function (success) {
            setTimeout(function(){
                deferred.resolve(success);
            }, 2000);
            
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }
    return addContractService;
  }]);