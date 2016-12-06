'use strict';

/**
 * @ngdoc function
 * @description
 * # DashboardCtrl
 */
 
 app.controller('dashboardCtrl', ['DashboardService','UserLoginService', '$scope','$cookieStore','$state','$rootScope','AddContractService','$filter',function (DashboardService, UserLoginService, $scope, $cookieStore,$state,$rootScope,AddContractService,$filter)
 {
 	$scope.loggedUser = $cookieStore.get('loginData');
 	$rootScope.logUser = $cookieStore.get('loginTempData').userName;
 	$rootScope.logType = $cookieStore.get('loginTempData').profileType;
 	$scope.totAmount=$cookieStore.get('totAmnt');

	$(document).ready(function() {
    	$('.set-hgt').attr('style','min-height:652px');
  	});
	setTimeout(function(){
		$('#depl_data_tbl').DataTable({
			paging: false,
			ordering: true,
			searching: false,
			info: false
		});
		$('#pend_data_tbl').DataTable({
			paging: false,
			ordering: true,
			searching: false,
			info: false
		});
	}, 0);
	$scope.dateFormat=function(dt,oid)
	{
		var supDt="supDt"+oid;
    	dt = dt.slice(0,2)+"-"+ dt.slice(2,4)+"-"+ dt.slice(4,8);
    	$("#"+supDt).html(dt);
	}
	$scope.dateTimeFormat=function(dt,oid)
	{
		var supDt="supDtTm"+oid;
    	dt = dt.slice(0,1)+"-"+ dt.slice(1,3)+"-"+ dt.slice(3,7)+" "+ dt.slice(7,9)+":"+ dt.slice(9,11)+":"+ dt.slice(11,13);
    	$("#"+supDt).html(dt);
	}
	$scope.getContract=function () 
	{

		$scope.displayLoading = true;
		DashboardService.getContractsDeployedByMe().then(function (response) 
		{
			$scope.contractsDeply=[];
			$scope.contractsPending=[];
			angular.forEach(response.data.row, function(value, key)
			{
				if(value.createdBy == $rootScope.logUser)
				{
					$scope.contractsDeply.push(value);
				}
				if(value.pendingWith == $rootScope.logUser)
				{
					$scope.contractsPending.push(value);
				}
			});
			$scope.displayLoading = false;
		});
	}
	$scope.generateBatchId=function (pname,oid) 
	{
		var div="bid"+oid;
		var btn="btnbid"+oid;
		
		$rootScope.batchId=pname.substr(0, 3)+""+$filter('date')(new Date(), "ddMMyyyyHHmmss");
		$("#"+div).html($rootScope.batchId);
		$("#"+btn).hide();
	}
	$scope.generateTrackNum=function (oid) 
	{
		var div="tno"+oid;
		var btn="btntno"+oid;
		$rootScope.trackNum=$rootScope.logUser+""+$filter('date')(new Date(), "ddMMyyyyHHmmss");
		$("#"+div).html($rootScope.trackNum);
		$("#"+btn).hide();
	}

	$scope.prevBlockHeight = "";
	$scope.newBlockHeight = "";
    
$scope.approveBtnClick = function (contractDetails,cname) 
{	
	$scope.displayLoading = true;
	if($rootScope.logType=='Distributor')
	{
		var hdnbid="bidhdn"+contractDetails.orderID;
		$scope.approvalData={
	  			"ContractID":contractDetails.orderID,
	  			"supplierName":contractDetails.supplierName,
	  			"productName": contractDetails.productName,
	  			"batchID": $('#'+hdnbid).val(),
	  			"carrierName":cname,
	  			"approvestatus":1};
		AddContractService.getBlockStatus().then(function (response) 
	    {
	    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
	    	DashboardService.approveContract(JSON.stringify($scope.approvalData)).then(function (approvalResponse) 
	    	{
	    		var insertDet={};
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
	                            	insertDet["orderID"]=parseInt(contractDetails.orderID);
                                    insertDet["contractName"]=contractDetails.contractName;
                                    insertDet["supplierID"]=parseInt(contractDetails["supplierID"]);
                                    insertDet["supplierName"]=contractDetails["supplierName"];
                                    insertDet["productID"]=parseInt(contractDetails["productID"]);
                                    insertDet["productName"]=contractDetails["productName"];
                                    insertDet["uom"]=contractDetails["uom"];
                                    insertDet["quantity"]=parseInt(contractDetails["quantity"]);
                                    insertDet["pricePerUOM"]=parseInt(contractDetails["pricePerUOM"]);
                                    insertDet["totalPrice"]=parseInt(contractDetails["totalPrice"]);
                                    insertDet["batchID"]=$scope.approvalData.batchID;
                                    insertDet["carrierName"]=cname;
                                    insertDet["trackingNumber"]="";
                                    insertDet["supplyByDate"]=contractDetails["supplyByDate"];
                                    insertDet["createdDate"]=contractDetails.createdDate;
                                    insertDet["createdBy"]=contractDetails.createdBy;
                                    insertDet["profileType"]=$rootScope.logType;
                                    insertDet["pendingWith"]=cname;
                                    insertDet["status"]=contractDetails["status"];
                                    insertDet["loginuser"]=$rootScope.logUser;
                                    insertDet["signedBy"]="";
                                    insertDet["approvalstatus"]=1;
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
	                                    $scope.displayError = "Approved Successfully!";
	                                    location.reload(); 
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: " + error);
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: " + error);
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: " + error);
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: " + error);
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: " + error);
	            $scope.displayLoading = false;
	        });
	}
	else if($rootScope.logType=='Carriers')
	{
		var hdntno="tnohdn"+contractDetails.orderID;
		$scope.approvalData={
	  			"contractID":contractDetails.orderID,
	  			"supplierName":contractDetails.supplierName,
	  			"productName":contractDetails.productName,
	  			"shipmentstatus":1,
	  			"carrierName":contractDetails.carrierName,
	  			"trackingNumber": $('#'+hdntno).val()};
		AddContractService.getBlockStatus().then(function (response) 
	    {
	    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
	    	
	    	DashboardService.shipmentNotify(JSON.stringify($scope.approvalData)).then(function (approvalResponse) 
	    	{	
	    		var insertDet={};
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
	                            	insertDet["orderID"]=parseInt(approvalResponse.data[0]);
	                            	insertDet["contractName"]=contractDetails.contractName;
	                                insertDet["supplierID"]=parseInt(contractDetails.supplierID);
	                                insertDet["supplierName"]=contractDetails.supplierName;
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=contractDetails.productName;
	                                insertDet["uom"]=contractDetails.uom;
                                    insertDet["quantity"]=parseInt(contractDetails.quantity);
                                    insertDet["pricePerUOM"]=parseInt(contractDetails.pricePerUOM);
                                    insertDet["totalPrice"]=parseInt(contractDetails.totalPrice);
                                    insertDet["batchID"]=approvalResponse.data[1];
                                    insertDet["carrierName"]=contractDetails.carrierName;
                                    insertDet["trackingNumber"]=$scope.approvalData['trackingNumber'];
                                    insertDet["supplyByDate"]=contractDetails.supplyByDate;
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
                                    insertDet["createdBy"]=contractDetails.createdBy;
                                    insertDet["profileType"]=$rootScope.logType;
                                    insertDet["pendingWith"]=contractDetails.createdBy;
                                    insertDet["status"]=contractDetails["status"];
                                    insertDet["loginuser"]=$rootScope.logUser;
                                    insertDet["signedBy"]="";
                                    insertDet["approvalstatus"]=1;
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
	                                    $scope.displayError = "Approved Successfully!";
	                                    location.reload();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: " + error);
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: " + error);
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: " + error);
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: " + error);
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: " + error);
	            $scope.displayLoading = false;
	        });	
	}
	else if($rootScope.logType=='Retailer')
	{
		$scope.approvalData={
	  			"finalsignoff":1,
	  			"contractID":contractDetails.orderID,
	  			"supplierName":contractDetails.supplierName,
  				"TotalPrice": contractDetails.totalPrice};
	  	$scope.totAmount="";
		AddContractService.getBlockStatus().then(function (response) 
	    {
	    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
	    	DashboardService.signOffByContractOwner($scope.approvalData).then(function (approvalResponse) 
	    	{
	    		var insertDet={};
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
	                            	$scope.totAmount=$cookieStore.get('totAmnt');
	                     			$cookieStore.put('totAmnt',($scope.totAmount+contractDetails.totalPrice));
					                $scope.totAmount=$cookieStore.get('totAmnt');

	                            	insertDet["orderID"]=parseInt(approvalResponse.data[0]);
	                            	insertDet["contractName"]=contractDetails.contractName;
	                                insertDet["supplierID"]=parseInt(contractDetails.supplierID);
	                                insertDet["supplierName"]=contractDetails.supplierName;
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=contractDetails.productName;
	                                insertDet["uom"]=contractDetails.uom;
                                    insertDet["quantity"]=parseInt(contractDetails.quantity);
                                    insertDet["pricePerUOM"]=parseInt(contractDetails.pricePerUOM);
                                    insertDet["totalPrice"]=parseInt(contractDetails.totalPrice);
                                    insertDet["batchID"]=contractDetails.batchID;
                                    insertDet["carrierName"]=contractDetails.carrierName;
                                    insertDet["trackingNumber"]=contractDetails.trackingNumber;
                                    insertDet["supplyByDate"]=contractDetails.supplyByDate;
                                    insertDet["createdDate"]=contractDetails.createdDate;
                                    insertDet["createdBy"]=contractDetails.createdBy;
                                    insertDet["profileType"]=$rootScope.logType;
                                    insertDet["pendingWith"]=contractDetails.pendingWith;
                                    insertDet["status"]=contractDetails["status"];
                                    insertDet["loginuser"]=$rootScope.logUser;
                                    insertDet["signedBy"]="";
                                    insertDet["approvalstatus"]=1;
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
	                                    $scope.displayError = "Approved Successfully!";
	                                    location.reload();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: " + error);
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: " + error);
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: " + error);
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: " + error);
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: " + error);
	            $scope.displayLoading = false;
	        });	
	}
}

$scope.cancelBtnClick=function (contractDetails) 
{
	$scope.displayLoading = true;
	if($rootScope.logUser=='supplier')
	{
		$scope.approvalData={
	  			"approvestatus":"false",
				"ContractName":contractDetails.contractName,
	  			"ContractID":contractDetails.contractID,
	  			"supplier": contractDetails.supplierName,
	  			"supplierID":contractDetails.supplierID};
		AddContractService.getBlockStatus().then(function (response) 
	    {
	    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
	    	DashboardService.approveContract($scope.approvalData).then(function (approvalResponse) 
	    	{
	    		var insertDet={};
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
	                     			insertDet["contractID"]=parseInt(approvalResponse.data[2]);
	                            	insertDet["contractName"]=approvalResponse.data[1];
	                                insertDet["supplierID"]=parseInt(approvalResponse.data[4]);
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=approvalResponse.data[6];
	                                insertDet["approvestatus"]=approvalResponse.data[0];
	                                insertDet["carrier"]=approvalResponse.data[5];
	                                insertDet["shipto"]=approvalResponse.data[8];
	                                insertDet["pickto"]=approvalResponse.data[7];
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
	                                insertDet["pendingWith"]=contractDetails.pendingWith;
	                                insertDet["loginuser"]=$rootScope.logUser;
	                                insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
	                                insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
	                                insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
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
	                                    $scope.displayError = "Approved Successfully!";
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: " + error);
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: " + error);
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: " + error);
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: " + error);
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: " + error);
	            $scope.displayLoading = false;
	        });
	}
	else if($rootScope.logUser=='carrier')
	{
		$scope.approvalData={
	  			"shipmentstatus":"false",
	  			"ContractID":contractDetails.contractID,
	  			"carriers":contractDetails.carrier,
	  			"supplierID":contractDetails.supplierID};
		AddContractService.getBlockStatus().then(function (response) 
	    {
	    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
	 		// 	console.log($scope.prevBlockHeight);
	    	DashboardService.shipmentNotify($scope.approvalData).then(function (approvalResponse) 
	    	{
	    		var insertDet={};
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
	                     			insertDet["contractID"]=parseInt(approvalResponse.data[2]);
	                            	insertDet["contractName"]=approvalResponse.data[2];
	                                insertDet["supplierID"]=parseInt(approvalResponse.data[4]);
	                                insertDet["supplierName"]=approvalResponse.data[3];
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=approvalResponse.data[6];
	                                insertDet["trackingNumber"]=approvalResponse.data[0];
	                                insertDet["shipmentstatus"]=approvalResponse.data[1];
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
	                                insertDet["pendingWith"]=contractDetails.pendingWith;
	                                insertDet["loginuser"]=$rootScope.logUser;
	                                insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
	                                insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
	                                insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
	                                insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
	                                insertDet["block_data"]=blockData.data.result[1].block.data.txs[0][1].data;
	                                insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;

	                                var temp=[];
	                                temp.push(insertDet);
	                                var jsonObj={};
	                                jsonObj["row"]=temp;
	                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
	                                {
	                                    $scope.displayLoading = false;
	                                    $scope.displayError = "Approved Successfully!";
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: " + error);
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: " + error);
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: " + error);
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: " + error);
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: " + error);
	            $scope.displayLoading = false;
	        });	
	}
	else if($rootScope.logUser=='buyer')
	{
		$scope.approvalData={
	  			"finalsignoff":"false",
	  			"ContractID":contractDetails.contractID,
	  			"ContractName":contractDetails.contractName};
		AddContractService.getBlockStatus().then(function (response) 
	    {
	    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
	 		// 	console.log($scope.prevBlockHeight);
	    	DashboardService.signOffByContractOwner($scope.approvalData).then(function (approvalResponse) 
	    	{
	    		var insertDet={};
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
	                     			insertDet["contractID"]=parseInt(contractDetails.contractID);
	                            	insertDet["contractName"]=contractDetails.contractName;
	                                insertDet["supplierID"]=parseInt(contractDetails.supplierID);
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=contractDetails.productName;
	                                insertDet["totalamount"]=approvalResponse.data[0];
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
	                                insertDet["pendingWith"]=contractDetails.pendingWith;
	                                insertDet["loginuser"]=$rootScope.logUser;
	                                insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
	                                insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
	                                insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
	                                insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
	                                insertDet["block_data"]=blockData.data.result[1].block.data.txs[0][1].data;
	                                insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;

	                                var temp=[];
	                                temp.push(insertDet);
	                                var jsonObj={};
	                                jsonObj["row"]=temp;
	                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
	                                {
	                                    $scope.displayLoading = false;
	                                    $scope.displayError = "Approved Successfully!";
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: " + error);
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: " + error);
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: " + error);
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: " + error);
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: " + error);
	            $scope.displayLoading = false;
	        });	
	}
}

$scope.getContract();

	$scope.logout=function()
    {
        $cookieStore.remove('loginData');
          $cookieStore.remove('loginTempData');
          $cookieStore.remove('totAmnt');
        window.history.forward(-1);
            $state.go('login');
    }
}]);



