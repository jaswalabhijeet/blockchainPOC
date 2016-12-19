'use strict';

/**
 * @ngdoc overview
 * @name blockChainApp
 * @description
 * # blockChainApp
 *
 * Main module of the application.
 */
var app = angular.module('blockChainApp', [
'ui.router',
'ngAnimate',
'ngCookies',
'ngResource',
'ngSanitize',
'ngTouch',
'app.routes',
'ui.bootstrap'
]);

app.controller('MainCtrl', ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) 
{
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) 
    {
        if (error === "UNAUTHORIZED") 
        {
            $state.go("login");
        }
    });
}]);