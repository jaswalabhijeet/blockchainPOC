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
	
    return dashboardService;
  }]);