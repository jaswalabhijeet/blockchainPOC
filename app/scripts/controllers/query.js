'use strict';

/**
 * @ngdoc function
 * @description
 * # queryCtrl
 */
app.controller('queryCtrl',['$scope','$rootScope','$cookieStore','QueryService','$state','$timeout','AddContractService', function ($scope,$rootScope,$cookieStore,QueryService,$state,$timeout,AddContractService) {

    $scope.loggedUser = $cookieStore.get('loginData');
 	$rootScope.logUser = $cookieStore.get('loginTempData').userName;
  $scope.availableTags={};


  $(document).ready(function() {
    $('.set-hgt').attr('style','min-height:652px');
  });

	$scope.queryFunction = function (qryOption) 
	{
    $scope.result=[];
		$scope.displayLoading = true;
        QueryService.getProductDetails(qryOption).then(function (response) 
        {
        	$scope.availableTags=response.data.row;
      
          angular.forEach($scope.availableTags, function(value, key)
          {

            if(qryOption=='productName')
              $scope.result.push(value.productName);
            else if(qryOption=='contractID')
            {
              var val=value.contractID.toString();
              $scope.result.push(val);
            }
              
          });
          $scope.complete();
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
					if(value.contractID == parseInt(search))
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
	
    $scope.complete=function(){

    $( "#tags" ).autocomplete({
      source: $scope.result,
      select: function( event, ui ) {
          $timeout(function(){
            $scope.search = ui.item.value;
            
          }, 0);
        }
    });
    } 
  
  $scope.showModal = false;
  $scope.buttonClicked = "";
  
  $scope.toggleModal = function(height)
  {
    
    AddContractService.fetchBlockData(height).then(function (blockData) 
    {
        $scope.wholeData=blockData;
        console.log($scope.wholeData);
        setTimeout(function(){
      $scope.showModal = !$scope.showModal;
      }, 200);
        
    }, function (error) {
            console.log("Error while fetching block data: " + error);
            $scope.displayLoading = false;
    });
    
  };

	$scope.logout=function()
    {
        $cookieStore.remove('loginData');
          $cookieStore.remove('loginTempData');
        window.history.forward(-1);
            $state.go('login');
    }
}]);

app.directive('modal', function () {
    return {
      
      template: '<div class="modal fade">' +
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">Height Results</h4>' + 
              '</div>' + 
              '<div class="modal-body modal-body-min">'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Height:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Chain Id:</div>'+
                        '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Block Hash:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Number of transactions:</div>'+
                        '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Hash:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Data Hash:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Block Data:</div>'+
                        '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Block Time:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Fees:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Last Block Hash:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Last Block Parts:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">Last Validation Hash:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
                  '<div class="col-md-12">'+
                      '<div class="col-md-5 text-bold">State Hash:</div>'+
                          '<div class="col-md-7">123456</div>'+
                  '</div>'+
              '</div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      
      link: function postLink(scope, element, attrs) 
      {
          scope.$watch(attrs.visible,function(value){
          
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

      },

    };
  });


            