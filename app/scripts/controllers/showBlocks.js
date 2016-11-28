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
						$('.query_tbl').DataTable();
					}, 20);
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
    $scope.logout=function()
    {
        $cookieStore.remove('loginData');
          $cookieStore.remove('loginTempData');
        window.history.forward(-1);
            $state.go('login');
    }
}]);
