'use strict';

/**
 * @ngdoc function
 * @description
 * # addContractCtrl
 * Add Contract Controller of the blockChainApp
 */
angular.module('blockChainApp').controller('addContractCtrl', ['$scope', 'AddContractService','$cookieStore','$state','$filter','$rootScope', function ($scope, AddContractService,$cookieStore,$state,$filter,$rootScope) 
{
	$(document).ready(function() {
    $('.set-hgt').attr('style','min-height:652px');
  });
	
    $scope.loggedUser = $cookieStore.get('loginData');
    $rootScope.logUser = $cookieStore.get('loginTempData').userName;
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
            var insertDet={};
            var createContractData = {};
            createContractData["contractID"] = dateAsString;
            createContractData["contractName"] = $scope.contractName;
            createContractData["supplierID"] = $scope.supplierID;
            createContractData["supplier"] = $scope.supplierName;
            createContractData["supplyByDate"] = supDate;
            
			
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
                    //console.log(newBlockChainStatus);
                    AddContractService.fetchBlocks($scope.prevBlockHeight, $scope.newBlockHeight).then(function (blocksData) 
                    {
                        angular.forEach(blocksData.data.result[1].block_metas, function (value, key) 
                        {
                            if (value.header.num_txs >=1) 
                            {
                                AddContractService.fetchBlockData(value.header.height).then(function (blockData) 
                                {

                                    insertDet["contractID"]=parseInt(createContractData["contractID"]);
                                    insertDet["contractName"]=createContractData["contractName"];
                                    insertDet["supplierID"]=parseInt(createContractData["supplierID"]);
                                    insertDet["supplierName"]=createContractData["supplier"];
                                    insertDet["productID"]=parseInt(createContractData["productID"]);
                                    insertDet["productName"]=createContractData["productName"];
                                    insertDet["uom"]=createContractData["uom"];
                                    insertDet["quantity"]=parseInt(createContractData["quantity"]);
                                    insertDet["pricePerUOM"]=parseInt(createContractData["pricePerUOM"]);
                                    insertDet["totalPrice"]=parseInt(createContractData["totalPrice"]);
                                    insertDet["currency"]=createContractData["currency"];
                                    insertDet["supplyByDate"]=createContractData["supplyByDate"];
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
                                    insertDet["loginuser"]=$rootScope.logUser;
                                    insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
                                    insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
                                    insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
                                    insertDet["pendingWith"]="";
                                    
                                    insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
                                    insertDet["block_data"]=blockData.data.result[1].block.data.txs[0][1].data;
                                    insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
                                    insertDet["block_time"]=blockData.data.result[1].block.header.time;
                                    var temp=[];
                                    temp.push(insertDet);
                                    var jsonObj={};
                                    jsonObj["row"]=temp;
                                    
                                    AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
                                    {
                                        $scope.displayLoading = false;
                                        $scope.displayError = "Contract added successfully!";
                                        
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
          $cookieStore.remove('totAmnt');
        window.history.forward(-1);
            $state.go('login');
    }
}]);