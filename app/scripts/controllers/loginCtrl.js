'use strict';

/**
 * @ngdoc function
 * @description
 * # LoginCtrl
 */
app.controller('loginCtrl', ['UserLoginService', '$scope', '$cookieStore','$state','$rootScope',
	function (UserLoginService, $scope, $cookieStore,$state,$rootScope) {

        $scope.loginButtonClick = function () {
            if ($scope.remeberMe == true) {
                $cookieStore.put('loginData', {
                    userName: $scope.username,
                    password: $scope.password
                });
               

            }

             UserLoginService.authenticateUser($scope.username, $scope.password).then(function (response) {

 $cookieStore.put('loginTempData', {
                    userName: response.config.data.username,
                    password: response.config.data.password
                });

                $rootScope.logUser=$cookieStore.get('loginTempData').userName;
                $state.go('dashboard');
            }, function (error) {
                $scope.displayError = "username or password is incorrect";
            });
        }

window.history.forward(-1);
}]);