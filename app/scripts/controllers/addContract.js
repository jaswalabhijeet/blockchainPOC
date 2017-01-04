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
    $rootScope.logType = $cookieStore.get('loginTempData').profileType;

    $scope.pdctId="";
    $scope.pdctPrice="";
	$scope.findTotal = function () {
		$scope.totalPrice=$scope.quantity*$scope.pricePerUOM;
	}
	
    $scope.getProductName=function () 
    {
        $scope.displayLoading = true;
        AddContractService.getPdctDetails().then(function (response) 
        {
            $scope.pdctName=[];
            $scope.pdctDetails=[];
            angular.forEach(response.data.row, function(value, key)
            {
                    $scope.pdctName.push(value.product_name);
                    $scope.pdctDetails.push(value);
            });
            $scope.displayLoading = false;
        });
    }
    $scope.getProductDetails=function (pname) 
    {
        $scope.displayLoading = true;
        angular.forEach($scope.pdctDetails, function(value, key)
        {
                if(value.product_name==pname)
                {
                    $scope.productID=value.product_id;  
                     $scope.pricePerUOM=value.price;
                     $scope.contractName="Suply "+pname;
                }   
        });
        $scope.displayLoading = false;
    }

    $scope.getSupplierName=function () 
    {
        $scope.displayLoading = true;
        AddContractService.getSupplierDetails().then(function (response) 
        {
            $scope.supName=[];
            $scope.supDetails=[];
            angular.forEach(response.data.row, function(value, key)
            {
                $scope.supName.push(value.username);   
                $scope.supDetails.push(value);               
            });
            $scope.displayLoading = false;
        });
    }
    $scope.getSupplierDetails=function (sname) 
    {
        $scope.displayLoading = true;
        angular.forEach($scope.supDetails, function(value, key)
        {
                if(value.username==sname)
                {
                    $scope.supplierID=value.id;  
                }   
        });
        $scope.displayLoading = false;
    }

    $scope.getProductName();
    $scope.getSupplierName();

    $scope.prevBlockHeight = "";
    $scope.newBlockHeight = "";
    $scope.createContractBtnClick = function () 
    {
        $scope.displayLoading = true;

        if($rootScope.logType=='Manufacturer')
        {
            AddContractService.getBlockStatus().then(function (response) 
            {
                $scope.prevBlockHeight = response.data.result[1].latest_block_height;
                var cid = $filter('date')(new Date(), "ddMMyyyyHHmmss");
                var insertDet={};
                var createContractData = {};
                createContractData["contractID"] = parseInt(cid);
                createContractData["contractName"] = $scope.contractName;
                createContractData["supplierID"] = parseInt($scope.supplierID);
                createContractData["supplier"] = $scope.supplierName;
                createContractData["productName"] = $scope.productName;
                createContractData["productID"] = parseInt($scope.productID);
                createContractData["uom"] = $scope.uom;
                createContractData["quantity"] = parseInt($scope.quantity);
                createContractData["pricePerUOM"] = $scope.pricePerUOM;
                createContractData["totalPrice"] = $scope.totalPrice;

                AddContractService.createContractManufacturer(createContractData).then(function (createContractResponse) 
                {
                    AddContractService.getBlockStatus().then(function (newBlockChainStatus) 
                    {
                        $scope.newBlockHeight = newBlockChainStatus.data.result[1].latest_block_height;
                        AddContractService.fetchBlocks($scope.prevBlockHeight, $scope.newBlockHeight).then(function (blocksData) 
                        {
                            angular.forEach(blocksData.data.result[1].block_metas, function (value, key) 
                            {
                                if (value.header.num_txs >=1) 
                                {
                                    AddContractService.fetchBlockData(value.header.height).then(function (blockData) 
                                    {
                                        $rootScope.displayError="";
                                        $rootScope.displaySuccess="";
                                        insertDet["orderID"]=parseInt(createContractData["contractID"]);
                                        insertDet["contractName"]=createContractData["contractName"];
                                        insertDet["supplierID"]=parseInt(createContractData["supplierID"]);
                                        insertDet["supplierName"]=createContractData["supplier"];
                                        insertDet["productID"]=parseInt(createContractData["productID"]);
                                        insertDet["productName"]=createContractData["productName"];
                                        insertDet["uom"]=createContractData["uom"];
                                        insertDet["quantity"]=parseInt(createContractData["quantity"]);
                                        insertDet["pricePerUOM"]=parseInt(createContractData["pricePerUOM"]);
                                        insertDet["totalPrice"]=parseInt(createContractData["totalPrice"]);
                                        insertDet["batchID"]="";
                                        insertDet["carrierName"]="";
                                        insertDet["trackingNumber"]="";
                                        insertDet["supplyByDate"]=$filter('date')($scope.supDate, "ddMMyyyy");
                                        insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
                                        insertDet["createdBy"]=$rootScope.logUser;
                                        insertDet["profileType"]=$rootScope.logType;
                                        insertDet["pendingWith"]="";
                                        insertDet["status"]="";
                                        insertDet["loginuser"]=$rootScope.logUser;
                                        insertDet["signedBy"]="";
                                        insertDet["approvalstatus"]="";
                                        insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
                                        insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
                                        insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
                                        insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
                                        insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
                                        insertDet["block_time"]=blockData.data.result[1].block.header.time;
                                        insertDet["drugName"]="";
                                        insertDet["filler1"]="";
                                        insertDet["filler2"]="";
                                        insertDet["filler3"]="";
                                        insertDet["filler4"]="";
                                        insertDet["filler5"]="";
                                        var temp=[];
                                        temp.push(insertDet);
                                        var jsonObj={};
                                        jsonObj["row"]=temp;
                                        AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
                                        {
                                            $scope.displayLoading = false;
                                            $rootScope.displaySuccess = "Contract added successfully!";
                                            $rootScope.getContract();
                                            $state.go('dashboard');
                                        }, function (error) {
                                            console.log("Error while inserting block data: " + error);
                                            $rootScope.displayError = "Error in add contract!";
                                            $scope.displayLoading = false;
                                        });

                                    }, function (error) {
                                        console.log("Error while fetching block data: " + error);
                                        $rootScope.displayError = "Error in add contract!";
                                        $scope.displayLoading = false;
                                    });  
                                }
                                else
                                {
                                    $scope.displayLoading = false;
                                    $rootScope.displayError = "Error in add contract!";
                                    $state.go('dashboard');
                                }
                            });

                        }, function (error) {
                            console.log("Error while fetching blocks data: " + error);
                            $rootScope.displayError = "Error in add contract!";
                            $scope.displayLoading = false;
                        });    
                    }, function (error) {
                        console.log("Error while fetching new block chain status: " + error);
                        $rootScope.displayError = "Error in add contract!";
                        $scope.displayLoading = false;
                    });
                }, function (error) {
                    console.log("Error while creating contract: " + error);
                    $rootScope.displayError = "Error in add contract!";
                    $scope.displayLoading = false;
                });

            }, function (error) {
                console.log("Error while fetching block chain status: " + error);
                $rootScope.displayError = "Error in add contract!";
                $scope.displayLoading = false;
            });
        }
        else if($rootScope.logType=='Distributor')
        {
            AddContractService.getBlockStatus().then(function (response) 
            {
                $scope.prevBlockHeight = response.data.result[1].latest_block_height;
                var cid = $filter('date')(new Date(), "ddMMyyyyHHmmss");
                var insertDet={};
                var createContractData = {};
                createContractData["contractID"] = parseInt(cid);
                createContractData["contractName"] = $scope.contractName;
                createContractData["supplierID"] = parseInt($scope.supplierID);
                createContractData["supplier"] = $scope.supplierName;
                createContractData["productName"] = $scope.productName;
                createContractData["productID"] = parseInt($scope.productID);
                createContractData["uom"] = $scope.uom;
                createContractData["quantity"] = parseInt($scope.quantity);
                createContractData["pricePerUOM"] = $scope.pricePerUOM;
                createContractData["totalPrice"] = $scope.totalPrice;
                AddContractService.createContractDistributor(JSON.stringify(createContractData)).then(function (createContractResponse) 
                {
                    AddContractService.getBlockStatus().then(function (newBlockChainStatus) 
                    {
                        $scope.newBlockHeight = newBlockChainStatus.data.result[1].latest_block_height;
                        AddContractService.fetchBlocks($scope.prevBlockHeight, $scope.newBlockHeight).then(function (blocksData) 
                        {
                            angular.forEach(blocksData.data.result[1].block_metas, function (value, key) 
                            {
                                if (value.header.num_txs >=1) 
                                {
                                    AddContractService.fetchBlockData(value.header.height).then(function (blockData) 
                                    {
                                        $rootScope.displayError="";
                                        $rootScope.displaySuccess="";
                                        insertDet["orderID"]=parseInt(createContractData["contractID"]);
                                        insertDet["contractName"]=createContractData["contractName"];
                                        insertDet["supplierID"]=parseInt(createContractData["supplierID"]);
                                        insertDet["supplierName"]=createContractData["supplier"];
                                        insertDet["productID"]=parseInt(createContractData["productID"]);
                                        insertDet["productName"]=createContractData["productName"];
                                        insertDet["uom"]=createContractData["uom"];
                                        insertDet["quantity"]=parseInt(createContractData["quantity"]);
                                        insertDet["pricePerUOM"]=parseInt(createContractData["pricePerUOM"]);
                                        insertDet["totalPrice"]=parseInt(createContractData["totalPrice"]);
                                        insertDet["batchID"]="";
                                        insertDet["carrierName"]="";
                                        insertDet["trackingNumber"]="";
                                        insertDet["supplyByDate"]=$filter('date')($scope.supDate, "ddMMyyyy");
                                        insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
                                        insertDet["createdBy"]=$rootScope.logUser;
                                        insertDet["profileType"]=$rootScope.logType;
                                        insertDet["pendingWith"]="";
                                        insertDet["status"]="";
                                        insertDet["loginuser"]=$rootScope.logUser;
                                        insertDet["signedBy"]="";
                                        insertDet["approvalstatus"]="";
                                        insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
                                        insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
                                        insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
                                        insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
                                        insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
                                        insertDet["block_time"]=blockData.data.result[1].block.header.time;
                                        insertDet["drugName"]="";
                                        insertDet["filler1"]="";
                                        insertDet["filler2"]="";
                                        insertDet["filler3"]="";
                                        insertDet["filler4"]="";
                                        insertDet["filler5"]="";
                                        var temp=[];
                                        temp.push(insertDet);
                                        var jsonObj={};
                                        jsonObj["row"]=temp;
                                        AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
                                        {
                                            $scope.displayLoading = false;
                                            $rootScope.displaySuccess = "Contract added successfully!";
                                            $rootScope.getContract();
                                            $state.go('dashboard');
                                        }, function (error) {
                                            console.log("Error while inserting block data: " + error);
                                            $rootScope.displayError = "Error in add contract!";
                                            $scope.displayLoading = false;
                                        });

                                    }, function (error) {
                                        console.log("Error while fetching block data: " + error);
                                        $rootScope.displayError = "Error in add contract!";
                                        $scope.displayLoading = false;
                                    });  
                                }
                                else
                                {
                                    $scope.displayLoading = false;
                                    $rootScope.displayError = "Error in add contract!";
                                    $state.go('dashboard');
                                }
                            });

                        }, function (error) {
                            console.log("Error while fetching blocks data: " + error);
                            $rootScope.displayError = "Error in add contract!";
                            $scope.displayLoading = false;
                        });    
                    }, function (error) {
                        console.log("Error while fetching new block chain status: " + error);
                        $rootScope.displayError = "Error in add contract!";
                        $scope.displayLoading = false;
                    });

                }, function (error) {
                    console.log("Error while fetching block chain status: " + error);
                    $rootScope.displayError = "Error in add contract!";
                    $scope.displayLoading = false;
                });
            }, function (error) {
                console.log("Error while fetching block chain status: " + error);
                $rootScope.displayError = "Error in add contract!";
                $scope.displayLoading = false;
            });    
        }
        else
        {
            AddContractService.getBlockStatus().then(function (response) 
            {    
                $scope.prevBlockHeight = response.data.result[1].latest_block_height;
                var cid = $filter('date')(new Date(), "ddMMyyyyHHmmss");
                var insertDet={};
                var createContractData = {};
                createContractData["contractID"] = parseInt(cid);
                createContractData["contractName"] = $scope.contractName;
                createContractData["supplierID"] = parseInt($scope.supplierID);
                createContractData["supplier"] = $scope.supplierName;
                createContractData["productName"] = $scope.productName;
                createContractData["productID"] = parseInt($scope.productID);
                createContractData["uom"] = $scope.uom;
                createContractData["quantity"] = parseInt($scope.quantity);
                createContractData["pricePerUOM"] = $scope.pricePerUOM;
                createContractData["totalPrice"] = $scope.totalPrice;
                
                AddContractService.createContract(createContractData).then(function (createContractResponse) 
                {
                    AddContractService.getBlockStatus().then(function (newBlockChainStatus) 
                    {
                        $scope.newBlockHeight = newBlockChainStatus.data.result[1].latest_block_height;
                        AddContractService.fetchBlocks($scope.prevBlockHeight, $scope.newBlockHeight).then(function (blocksData) 
                        {
                            angular.forEach(blocksData.data.result[1].block_metas, function (value, key) 
                            {
                                if (value.header.num_txs >=1) 
                                {
                                    AddContractService.fetchBlockData(value.header.height).then(function (blockData) 
                                    {
                                        $rootScope.displayError="";
                                        $rootScope.displaySuccess="";
                                        insertDet["orderID"]=parseInt(createContractData["contractID"]);
                                        insertDet["contractName"]=createContractData["contractName"];
                                        insertDet["supplierID"]=parseInt(createContractData["supplierID"]);
                                        insertDet["supplierName"]=createContractData["supplier"];
                                        insertDet["productID"]=parseInt(createContractData["productID"]);
                                        insertDet["productName"]=createContractData["productName"];
                                        insertDet["uom"]=createContractData["uom"];
                                        insertDet["quantity"]=parseInt(createContractData["quantity"]);
                                        insertDet["pricePerUOM"]=parseInt(createContractData["pricePerUOM"]);
                                        insertDet["totalPrice"]=parseInt(createContractData["totalPrice"]);
                                        insertDet["batchID"]="";
                                        insertDet["carrierName"]="";
                                        insertDet["trackingNumber"]="";
                                        insertDet["supplyByDate"]=$filter('date')($scope.supDate, "ddMMyyyy");
                                        insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
                                        insertDet["createdBy"]=$rootScope.logUser;
                                        insertDet["profileType"]=$rootScope.logType;
                                        insertDet["pendingWith"]="";
                                        insertDet["status"]="";
                                        insertDet["loginuser"]=$rootScope.logUser;
                                        insertDet["signedBy"]="";
                                        insertDet["approvalstatus"]="";
                                        insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
                                        insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
                                        insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
                                        insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
                                        insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
                                        insertDet["block_time"]=blockData.data.result[1].block.header.time;
                                        insertDet["filler1"]="";
                                        insertDet["filler2"]="";
                                        insertDet["filler3"]="";
                                        insertDet["filler4"]="";
                                        insertDet["filler5"]="";
                                        var temp=[];
                                        temp.push(insertDet);
                                        var jsonObj={};
                                        jsonObj["row"]=temp;
                                        AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
                                        {
                                            $scope.displayLoading = false;
                                            $rootScope.displaySuccess = "Contract added successfully!";
                                            $rootScope.getContract();
                                            $state.go('dashboard');
                                        }, function (error) {
                                            console.log("Error while inserting block data: " + error);
                                            $rootScope.displayError = "Error in add contract!";
                                            $scope.displayLoading = false;
                                        });
                                    }, function (error) {
                                        console.log("Error while fetching block data: " + error);
                                        $rootScope.displayError = "Error in add contract!";
                                        $scope.displayLoading = false;
                                    });
                                }
                                else
                                {
                                    $scope.displayLoading = false;
                                    $rootScope.displayError = "Error in add contract!";
                                    $state.go('dashboard');
                                }
                            });

                        }, function (error) {
                            console.log("Error while fetching blocks data: " + error);
                            $rootScope.displayError = "Error in add contract!";
                            $scope.displayLoading = false;
                        });
                    }, function (error) {
                        console.log("Error while fetching new block chain status: " + error);
                        $rootScope.displayError = "Error in add contract!";
                        $scope.displayLoading = false;
                    });
                }, function (error) {
                    console.log("Error while creating contract: " + error);
                    $rootScope.displayError = "Error in add contract!";
                    $scope.displayLoading = false;
                });
            }, function (error) {
                console.log("Error while fetching block chain status: " + error);
                $rootScope.displayError = "Error in add contract!";
                $scope.displayLoading = false;
            });
        }
        
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