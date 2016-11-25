'use strict';

/**
 * @ngdoc function
 * @description
 * # DashboardCtrl
 */
 
 app.controller('dashboardCtrl', ['DashboardService','UserLoginService', '$scope',function (DashboardService, UserLoginService, $scope) 
 {
	 
	$(document).ready(function() {
		var divHeight = $('.col-md-2').height();
		$('.col-md-10').css('min-height', divHeight+'px');
	});
	$('.data_tbl').DataTable({
		paging: false,
		ordering: true,
		searching: false,
		info: false
	});
	
	DashboardService.getContractsDeployedByMe().then(function (response) 
	{
			//var tmpJson = {"row":[{"contractID":3,"contractName":"test","supplierID":3,"supplierName":"test","productID":3,"productName":"test","uom":"test","quantity":3,"pricePerUOM":3,"totalPrice":4,"currency":"$","supplyByDate":"2016-11-17 04:06:10","carrier":"test","pickTo":"us","shipTo":"us","Trackingnumber":"test","signedBy":"supplier","pendingWith":"supplier","createdBy":"buyer","createdDate":"2016-11-17 04:06:10","status":"pending","filler1":"","filler2":"","filler3":"","filler4":"","filler5":""},{"contractID":30,"contractName":"testinsert","supplierID":3,"supplierName":"testinsert","productID":1,"productName":"test","uom":"each","quantity":10,"pricePerUOM":10,"totalPrice":100,"currency":"$","supplyByDate":22112016,"carrier":null,"pickTo":null,"shipTo":null,"Trackingnumber":null,"signedBy":null,"pendingWith":"supplier","createdBy":"buyer","createdDate":"22112016","status":"pending","filler1":null,"filler2":null,"filler3":null,"filler4":null,"filler5":null},{"contractID":40,"contractName":"testinsert1","supplierID":3,"supplierName":"testinsert1","productID":1,"productName":"test","uom":"each","quantity":10,"pricePerUOM":10,"totalPrice":100,"currency":"$","supplyByDate":22112016,"carrier":null,"pickTo":null,"shipTo":null,"Trackingnumber":null,"signedBy":null,"pendingWith":"supplier","createdBy":"buyer","createdDate":"22112016","status":"pending","filler1":null,"filler2":null,"filler3":null,"filler4":null,"filler5":null}]};
			
			/*dummy*/
			$scope.contractsDeply=[];
			$scope.contractsPending=[];
			
			angular.forEach(response.row, function(value, key)
			{
				if(value.createdBy == 'buyer')
				{
					$scope.contractsDeply.push(value);
				}
				if(value.pendingWith == UserLoginService.isAuthenticated().username)
				{
					$scope.contractsPending.push(value);
				}
			});
			console.log($scope.contractsDeply);
			/**dummy end */
		
	});
}]);



