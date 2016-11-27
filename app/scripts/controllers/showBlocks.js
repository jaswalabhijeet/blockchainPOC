'use strict';

/**
 * @ngdoc function
 * @name blockChainApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the blockChainApp
 */
app.controller('showBlocksCtrl', ['$scope','$rootScope','$cookieStore', function ($scope,$rootScope,$cookieStore) {

    $scope.loggedUser = $cookieStore.get('loginData');
    $rootScope.logUser = $cookieStore.get('loginTempData').userName;
    $(document).ready(function() 
	{
		var divHeight = $('.col-md-2').height();
		$('.col-md-10').css('min-height', divHeight+'px');
	});
  }]);
