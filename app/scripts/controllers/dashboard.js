'use strict';

/**
 * @ngdoc function
 * @description
 * # DashboardCtrl
 */
 
 app.controller('dashboardCtrl', ['DashboardService','UserLoginService', '$scope','$cookieStore','$state','$rootScope',function (DashboardService, UserLoginService, $scope, $cookieStore,$state,$rootScope) 
 {
 	$scope.loggedUser = $cookieStore.get('loginData');
 	$rootScope.logUser = $cookieStore.get('loginTempData').userName;
	$(document).ready(function() {
		var divHeight = $('.col-md-2').height();
		$('.col-md-10').css('min-height', divHeight+'px');
	});
	setTimeout(function(){
		$('#depl_data_tbl').DataTable({
			paging: false,
			ordering: true,
			searching: false,
			info: false
		});
		$('#pend_data_tbl').DataTable({
			paging: false,
			ordering: true,
			searching: false,
			info: false
		});
	}, 0);
	$scope.getContract=function () {
	DashboardService.getContractsDeployedByMe().then(function (response) 
	{
			//var tmpJson = {"row":[{"contractID":3,"contractName":"test","supplierID":3,"supplierName":"test","productID":3,"productName":"test","uom":"test","quantity":3,"pricePerUOM":3,"totalPrice":4,"currency":"$","supplyByDate":"2016-11-17 04:06:10","carrier":"test","pickTo":"us","shipTo":"us","Trackingnumber":"test","signedBy":"supplier","pendingWith":"supplier","createdBy":"buyer","createdDate":"2016-11-17 04:06:10","status":"pending","filler1":"","filler2":"","filler3":"","filler4":"","filler5":""},{"contractID":30,"contractName":"testinsert","supplierID":3,"supplierName":"testinsert","productID":1,"productName":"test","uom":"each","quantity":10,"pricePerUOM":10,"totalPrice":100,"currency":"$","supplyByDate":22112016,"carrier":null,"pickTo":null,"shipTo":null,"Trackingnumber":null,"signedBy":null,"pendingWith":"supplier","createdBy":"buyer","createdDate":"22112016","status":"pending","filler1":null,"filler2":null,"filler3":null,"filler4":null,"filler5":null},{"contractID":40,"contractName":"testinsert1","supplierID":3,"supplierName":"testinsert1","productID":1,"productName":"test","uom":"each","quantity":10,"pricePerUOM":10,"totalPrice":100,"currency":"$","supplyByDate":22112016,"carrier":null,"pickTo":null,"shipTo":null,"Trackingnumber":null,"signedBy":null,"pendingWith":"supplier","createdBy":"buyer","createdDate":"22112016","status":"pending","filler1":null,"filler2":null,"filler3":null,"filler4":null,"filler5":null}]};
			
			$scope.contractsDeply=[];
			$scope.contractsPending=[];
			
			angular.forEach(response.data.row, function(value, key)
			{
				if(value.createdBy == 'buyer')
				{
					$scope.contractsDeply.push(value);
				}
				if(value.pendingWith == $rootScope.logUser)
				{
					$scope.contractsPending.push(value);
				}
			});
			
			/**dummy end */
		
	});
}
$scope.getContract();

	$scope.logout=function()
    {
        $cookieStore.remove('loginData');
          $cookieStore.remove('loginTempData');
        window.history.forward(-1);
            $state.go('login');
    }
}]);



