'use strict';

/**
 * @ngdoc function
 * @name blockChainApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the blockChainApp
 */
app.controller('showBlocksCtrl', ['$scope','$rootScope','$cookieStore','AddContractService','ShowBlockService','$state', function ($scope,$rootScope,$cookieStore,AddContractService,ShowBlockService,$state) {

    $scope.loggedUser = $cookieStore.get('loginData');
    $rootScope.logUser = $cookieStore.get('loginTempData').userName;
    $(document).ready(function() {
   			 $('.set-hgt').attr('style','min-height:652px');
  	});
    
    $('ul li a').click(function() 
    {
    	$('ul.tabs li.active').removeClass('active');
   		$(this).closest('li').addClass('active');
	});

    $scope.showBlockBtnClick = function (tab) 
    {
    	$scope.allBlocks=[];
		$scope.dataBlocks=[];
    	$scope.displayLoading = true;
        AddContractService.getBlockStatus().then(function (response) 
        {    
        	$scope.newBlockHeight = response.data.result[1].latest_block_height;
            $scope.prevBlockHeight = $scope.newBlockHeight-300;
				AddContractService.fetchBlocks($scope.prevBlockHeight, $scope.newBlockHeight).then(function (blocksData) 
                {            
                	angular.forEach(blocksData.data.result[1].block_metas, function (value, key) 
                    {
                    	if(tab==1)
                    	{
                    		if(value.header.num_txs <1)
                    		{
                    			$scope.allBlocks.push(value.header);
                    		}
                    	}
                    	else if(tab==2)
                    	{
                    		if (value.header.num_txs >=1) 
                        	{
                        		$scope.allBlocks.push(value.header);
                			}	
                		}
                    });
                    setTimeout(function()
					{
						$('.blocks_tbl').DataTable();
					}, 20);
              $scope.displayLoading = false;
            	}, function (error) {
            		console.log("Error while fetching block data: " + error);
            		$scope.displayLoading = false;
        		});
        }, function (error) {
            console.log("Error while fetching block data: " + error);
            $scope.displayLoading = false;
        });
    }
    $scope.showBlockBtnClick(1);


  $scope.showModal = false;
  $scope.buttonClicked = "";
  $scope.insertDet={};
    $scope.insertDet={};
  $scope.toggleModal = function(height)
  {
    
    AddContractService.fetchBlockData(height).then(function (blockData) 
    {
        $scope.insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
        $scope.insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
        $scope.insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
        $scope.insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
       // $scope.insertDet["block_data"]=blockData.data.result[1].block.data.txs[0].data;
        $scope.insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
        $scope.insertDet["block_time"]=blockData.data.result[1].block.header.time;
        $scope.insertDet["fees"]=blockData.data.result[1].block.header.fees;
        $scope.insertDet["last_block_hash"]=blockData.data.result[1].block.header.last_block_hash;
        $scope.insertDet["last_block_parts"]=blockData.data.result[1].block.header.last_block_parts;
        $scope.insertDet["last_validation_hash"]=blockData.data.result[1].block.header.last_validation_hash;
        $scope.insertDet["state_hash"]=blockData.data.result[1].block.header.state_hash;
        //console.log($scope.insertDet);
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
          $cookieStore.remove('totAmnt');
        window.history.forward(-1);
            $state.go('login');
    }
}]);


app.directive('modals', function () {
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

