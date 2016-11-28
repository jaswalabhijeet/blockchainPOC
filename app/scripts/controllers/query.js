'use strict';

/**
 * @ngdoc function
 * @description
 * # queryCtrl
 */
app.controller('queryCtrl',['$scope','$rootScope','$cookieStore','QueryService','$state', function ($scope,$rootScope,$cookieStore,QueryService,$state) {

    $scope.loggedUser = $cookieStore.get('loginData');
 	$rootScope.logUser = $cookieStore.get('loginTempData').userName;
    $(document).ready(function() 
	{
		var divHeight = $('.col-md-2').height();
		$('.col-md-10').css('min-height', divHeight+'px');
	});

	$scope.queryFunction = function (qryOption) 
	{
		$scope.displayLoading = true;
        QueryService.getProductDetails(qryOption).then(function (response) 
        {
        	$scope.availableTags=response.data.row;
        	console.log($scope.availableTags);

    	}, function (error) {
            console.log("Error while fetching block data: " + error);
            $scope.displayLoading = false;
        });
	}
	$scope.auditResult=[];
	$scope.queryBtnClick = function (qryOption,search) 
	{
		$scope.displayLoading = true;
		$scope.auditResult=[];
        QueryService.getAuditDetails().then(function (response) 
        {
        	
			angular.forEach(response.data.row, function(value, key)
			{
				
				if(qryOption=='contractID')
				{
					if(value.contractID == search)
					{
						$scope.auditResult.push(value);
					}
				}
				else if(qryOption=='productName')
				{
					if(value.productName == search)
					{
						$scope.auditResult.push(value);
					}
				}
			});

			setTimeout(function()
			{
				$('.query_tbl').DataTable();
			}, 20);
    	}, function (error) {
            console.log("Error while fetching block data: " + error);
            $scope.displayLoading = false;
        });
	}
	$scope.availableTags = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    $scope.complete=function(){console.log("sd");
    $( "#tags" ).autocomplete({
      source: $scope.availableTags
    });
    } 
 
	$scope.logout=function()
    {
        $cookieStore.remove('loginData');
          $cookieStore.remove('loginTempData');
        window.history.forward(-1);
            $state.go('login');
    }
}]);
