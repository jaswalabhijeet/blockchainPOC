 'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 * # UserLoginService
 * User Service for user authentication
 */
app.factory('DashboardService', ['$q', '$http', function ($q, $http) {
    var dashboardService = {};

    dashboardService.getContractsDeployedByMe = function () 
	{
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: 'http://52.73.17.136:3000/contractDetails?username=usr'
        }).then(function (blockStatus) {
            deferred.resolve(blockStatus);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }
	
    return dashboardService;
  }]);