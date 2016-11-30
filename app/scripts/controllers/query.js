'use strict';

/**
 * @ngdoc function
 * @description
 * # queryCtrl
 */
app.controller('queryCtrl',['$scope','$rootScope','$cookieStore','QueryService','$state','$timeout','AddContractService','$filter', function ($scope,$rootScope,$cookieStore,QueryService,$state,$timeout,AddContractService,$filter) {
	
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
		  $scope.displayLoading = false;
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
        	console.log(response);
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
			$scope.auditResult = $filter('orderBy')($scope.auditResult, 'height', false);
         
			setTimeout(function()
			{
				$('.query_tbl').DataTable();
			}, 20);
			$scope.displayLoading = false;
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
  $scope.showModalBlock = false;
  $scope.insertDet={};
  $scope.toggleModal = function(height)
  {
    
    AddContractService.fetchBlockData(height).then(function (blockData) 
    {
		console.log(blockData);
        $scope.insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
        $scope.insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
        $scope.insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
        $scope.insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
        $scope.insertDet["block_data"]=blockData.data.result[1].block.data.txs[0][1].data;
        $scope.insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
        $scope.insertDet["block_time"]=blockData.data.result[1].block.header.time;
        $scope.insertDet["fees"]=blockData.data.result[1].block.header.fees;
        $scope.insertDet["last_block_hash"]=blockData.data.result[1].block.header.last_block_hash;
        $scope.insertDet["last_block_parts"]=blockData.data.result[1].block.header.last_block_parts;
        $scope.insertDet["last_validation_hash"]=blockData.data.result[1].block.header.last_validation_hash;
        $scope.insertDet["state_hash"]=blockData.data.result[1].block.header.state_hash;
        
        setTimeout(function(){
      $scope.showModal = !$scope.showModal;
      }, 200);
        
    }, function (error) {
            console.log("Error while fetching block data: " + error);
            $scope.displayLoading = false;
    });
    
  };

  $scope.toggleModalBlock = function(blkDat)
  {
    
    AddContractService.fetchBlockData(blkDat).then(function (blockData) 
    {
        $scope.insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
        $scope.insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
        $scope.insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
        $scope.insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
        $scope.insertDet["block_data"]=blockData.data.result[1].block.data.txs[0][1].data;
        $scope.insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
        $scope.insertDet["block_time"]=blockData.data.result[1].block.header.time;
        $scope.insertDet["fees"]=blockData.data.result[1].block.header.fees;
        $scope.insertDet["last_block_hash"]=blockData.data.result[1].block.header.last_block_hash;
        $scope.insertDet["last_block_parts"]=blockData.data.result[1].block.header.last_block_parts;
        $scope.insertDet["last_validation_hash"]=blockData.data.result[1].block.header.last_validation_hash;
        $scope.insertDet["state_hash"]=blockData.data.result[1].block.header.state_hash;
        //console.log($scope.insertDet);
        setTimeout(function(){
      $scope.showModalBlock = !$scope.showModalBlock;
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
          $cookieStore.remove('totAmnt');
        window.history.forward(-1);
            $state.go('login');
    }
}]);

app.directive('modal', function () {
    return {
      transclude: true,
      restrict: 'E',
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">Height Results</h4>' + 
              '</div>' + 
              '<div class="modal-body modal-scroll" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
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

  
app.directive('modalBlock', function () {
  console.log("sd");
    return {
      transclude: true,
      restrict: 'E',
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">Height Results</h4>' + 
              '</div>' + 
              '<div class="modal-body modal-scroll" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      replace:true,
      
      link: function postLink(scope, element, attrs) 
      {
          scope.$watch(attrs.visibleBlk,function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

      },

    };
  });


            