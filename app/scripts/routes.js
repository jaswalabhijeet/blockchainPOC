'use strict';

/**
 * @ngdoc overview
 * @name blockChainApp routes
 * @description
 * # Routing for the application
 */
angular.module('app.routes',['ui.router']).config(['$stateProvider','$locationProvider','$urlRouterProvider', 
	function ($stateProvider, $locationProvider, $urlRouterProvider) {
	//$locationProvider.html5Mode(true).hashPrefix('!');
	$stateProvider
		.state('secure',{
			template: '<ui-view/>',
            abstract: true,
			resolve: {
				/*isAuthenticated: ['UserLoginService','$q', function(UserLoginService,$q){
					var defered = $q.defer();
					if(UserLoginService.isAuthenticated() == null){
						defered.reject("UNAUTHORIZED");
					}
					return defered.promise;
				}]*/
			}
		})
		.state('login', {
			url: '/login',
			templateUrl: 'views/loginPage.html',
			controller: 'loginCtrl'
		})
		.state('dashboard', {
			parent: 'secure',
			url: '/dashboard',
			templateUrl: 'views/dashboard.html',
			controller: 'dashboardCtrl'
		})
		.state('showBlocks', {
			url: '/showBlocks',
			templateUrl: 'views/showBlocks.html',
			controller: 'showBlocksCtrl'
		})
		.state('addContract', {
			url: '/addContract',
			templateUrl: 'views/addContract.html',
			controller: 'addContractCtrl'
		})
		.state('query', {
			url: '/query',
			templateUrl: 'views/query.html',
			controller: 'queryCtrl'
		});
		$urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get('$state');
			$state.go('dashboard');
		});
}]);

