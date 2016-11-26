'use strict';

/**
 * @ngdoc function
 * @description
 * # addContractCtrl
 * Add Contract Controller of the blockChainApp
 */
angular.module('blockChainApp').controller('addContractCtrl', ['$scope', 'AddContractService','$cookieStore','$state','$filter', function ($scope, AddContractService,$cookieStore,$state,$filter) 
{
	$(document).ready(function() {
		var divHeight = $('.col-md-2').height();
		$('.col-md-10').css('min-height', divHeight+'px');
	});
	
	$scope.findTotal = function () {
		$scope.totalPrice=$scope.quantity*$scope.pricePerUOM;
		
	}
	
    $scope.prevBlockHeight = "";
    $scope.newBlockHeight = "";
    
    $scope.createContractBtnClick = function () {
        $scope.displayLoading = true;
        AddContractService.getBlockStatus().then(function (response) 
        {    
            $scope.prevBlockHeight = response.data.result[1].latest_block_height;

            //console.log(response);
            var dateAsString = $filter('date')(new Date(), "ddMMyyyyHHmmss");
            var supDate = $filter('date')($scope.supDate, "ddMMyyyy");
            
            var createContractData = {};
            createContractData["contractName"] = $scope.contractName;
            createContractData["contractID"] = dateAsString;
            createContractData["supplyByDate"] = supDate;
            createContractData["supplier"] = $scope.supplierName;
			createContractData["supplierID"] = $scope.supplierID;
            createContractData["productName"] = $scope.productName;
            createContractData["productID"] = $scope.productID;
            createContractData["uom"] = $scope.uom;
            createContractData["quantity"] = $scope.quantity;
            createContractData["pricePerUOM"] = $scope.pricePerUOM;
            createContractData["totalPrice"] = $scope.totalPrice;
            createContractData["currency"] = $scope.currency;
            
            AddContractService.createContract(createContractData).then(function (createContractResponse) {
                //console.log(createContractResponse);exit;
                AddContractService.getBlockStatus().then(function (newBlockChainStatus) {
                    
                    $scope.newBlockHeight = newBlockChainStatus.data.result[1].latest_block_height;
                    //console.log(newBlockChainStatus);exit
                    AddContractService.fetchBlocks($scope.prevBlockHeight, $scope.newBlockHeight).then(function (blocksData) {

                           //console.log(blocksData);exit;
                        angular.forEach(blocksData.data.result[1].block_metas, function (value, key) 
                        {
                            //console.log(value.header.num_txs);
                            if (value.header.num_txs >=1) 
                            {
                                AddContractService.fetchBlockData(value.header.height).then(function (blockData) {
                                
                                   console.log(blockData);exit;
                                   // console.log(blockData.data.result[1]);
                                    AddContractService.insertBlockData(blockData.data.result[1]).then(function (insertResponse) {
                                        //console.log(insertResponse);
                                        $scope.displayLoading = false;
                                        $state.go('dashboard');
                                    }, function (error) {
                                        console.log("Error while inserting block data: " + error);
                                        $scope.displayLoading = false;
                                    });
                                }, function (error) {
                                    console.log("Error while fetching block data: " + error);
                                    $scope.displayLoading = false;
                                });
                            }
                        });

                    }, function (error) {
                        console.log("Error while fetching blocks data: " + error);
                        $scope.displayLoading = false;
                    });
                }, function (error) {
                    console.log("Error while fetching new block chain status: " + error);
                    $scope.displayLoading = false;
                });
            }, function (error) {
                console.log("Error while creating contract: " + error);
                $scope.displayLoading = false;
            });
        }, function (error) {
            console.log("Error while fetching block chain status: " + error);
            $scope.displayLoading = false;
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