'use strict';

/**
 * @ngdoc function
 * @description
 * # queryCtrl
 */
app.controller('queryCtrl',['$scope','$rootScope','$cookieStore', function ($scope,$rootScope,$cookieStore) {

    $scope.loggedUser = $cookieStore.get('loginData');
    $rootScope.logUser = $cookieStore.get('loginTempData').userName;
    $(document).ready(function() 
	{
		var divHeight = $('.col-md-2').height();
		$('.col-md-10').css('min-height', divHeight+'px');
	});
	setTimeout(function(){
		$('.query_tbl').DataTable( {
		paging: true,
		ordering: true,
		searching: false,
		info: true,
		"columnDefs": [
				{ "orderable": false, "targets": 1 }
		  ],
		
	} );
	}, 0);
	
}]);
