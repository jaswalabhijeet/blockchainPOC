'use strict';

/**
 * @ngdoc function
 * @description
 * # LoginCtrl
 */
app.controller('loginCtrl', ['UserLoginService','$scope','$cookies', 
	function (UserLoginService, $scope, $cookies) {
	$scope.loginButtonClick = function (){
		if($scope.remeberMe == true){
			$cookies.put('loginData',{userName:$scope.username, password:$scope.password});
		}
		UserLoginService.authenticateUser($scope.username, $scope.password).then(function(response){
			$state.go('dashboard');
		}, function(error){
			$scope.displayError = true;
		});
	}
}]);
