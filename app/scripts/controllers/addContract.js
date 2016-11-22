'use strict';

/**
 * @ngdoc function
 * @description
 * # addContractCtrl
 * Add Contract Controller of the blockChainApp
 */
angular.module('blockChainApp').controller('addContractCtrl', ['$scope', 'AddContractService', function ($scope, AddContractService) {

    $scope.prevBlockHeight = "";
    $scope.newBlockHeight = "";
    
    $scope.createContractBtnClick = function () {
        $scope.displayLoading = true;
        AddContractService.getBlockStatus().then(function (response) {
            console.log(response);
            $scope.prevBlockHeight = response["latest_block_height"];
            var createContractData = {};
            createContractData["contractName"] = $scope.contractName;
            createContractData["contractID"] = $scope.contractID;
            createContractData["supplier"] = $scope.supplier;
            createContractData["supplierID"] = $scope.supplierID;
            createContractData["productName"] = $scope.productName;
            createContractData["productID"] = $scope.productID;
            createContractData["uom"] = $scope.uom;
            createContractData["quantity"] = $scope.quantity;
            createContractData["pricePerUOM"] = $scope.pricePerUOM;
            createContractData["totalPrice"] = $scope.totalPrice;
            createContractData["currency"] = $scope.currency;
            AddContractService.createContract(createContractData).then(function (createContractResponse) {
                console.log(createContractResponse);
                AddContractService.getBlockStatus().then(function (newBlockChainStatus) {
                    console.log(newBlockChainStatus);
                    $scope.newBlockHeight = newBlockChainStatus["latest_block_height"];
                    AddContractService.fetchBlocks($scope.prevBlockHeight, $scope.newBlockHeight).then(function (blocksData) {
                        console.log(blocksData);
                        angular.forEach(blocksData.result.block_metas, function (value, key) {
                            if (value.header.num_txs >= 1) {
                                AddContractService.fetchBlockData(value.header.height).then(function (blockData) {
                                    console.log(blockData);
                                    AddContractService.insertBlockData(blockData).then(function (insertResponse) {
                                        console.log(insertResponse);
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
}]);