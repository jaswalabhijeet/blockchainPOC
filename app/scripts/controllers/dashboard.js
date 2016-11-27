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
	$(document).ready(function() {
		var divHeight = $('.col-md-2').height();
		$('.col-md-10').css('min-height', divHeight+'px');
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
	$scope.getContract=function () 
	{
		DashboardService.getContractsDeployedByMe().then(function (response) 
		{
			//var tmpJson = {"row":[{"contractID":3,"contractName":"test","supplierID":3,"supplierName":"test","productID":3,"productName":"test","uom":"test","quantity":3,"pricePerUOM":3,"totalPrice":4,"currency":"$","supplyByDate":"2016-11-17 04:06:10","carrier":"test","pickTo":"us","shipTo":"us","Trackingnumber":"test","signedBy":"supplier","pendingWith":"supplier","createdBy":"buyer","createdDate":"2016-11-17 04:06:10","status":"pending","filler1":"","filler2":"","filler3":"","filler4":"","filler5":""},{"contractID":30,"contractName":"testinsert","supplierID":3,"supplierName":"testinsert","productID":1,"productName":"test","uom":"each","quantity":10,"pricePerUOM":10,"totalPrice":100,"currency":"$","supplyByDate":22112016,"carrier":null,"pickTo":null,"shipTo":null,"Trackingnumber":null,"signedBy":null,"pendingWith":"supplier","createdBy":"buyer","createdDate":"22112016","status":"pending","filler1":null,"filler2":null,"filler3":null,"filler4":null,"filler5":null},{"contractID":40,"contractName":"testinsert1","supplierID":3,"supplierName":"testinsert1","productID":1,"productName":"test","uom":"each","quantity":10,"pricePerUOM":10,"totalPrice":100,"currency":"$","supplyByDate":22112016,"carrier":null,"pickTo":null,"shipTo":null,"Trackingnumber":null,"signedBy":null,"pendingWith":"supplier","createdBy":"buyer","createdDate":"22112016","status":"pending","filler1":null,"filler2":null,"filler3":null,"filler4":null,"filler5":null}]};
			
			$scope.contractsDeply=[];
			$scope.contractsPending=[];
			angular.forEach(response.data.row, function(value, key)
			{
				if(value.createdBy == 'buyer')
				{
					$scope.contractsDeply.push(value);
				}
				if(value.pendingWith == $rootScope.logUser)
				{
					$scope.contractsPending.push(value);
				}
			});
			
			/**dummy end */
		
	});
	}

$scope.prevBlockHeight = "";
$scope.newBlockHeight = "";
    
$scope.approveBtnClick = function (contractDetails) 
{
	
	$scope.displayLoading = true;
	if($rootScope.logUser=='supplier')
	{
		$scope.approvalData={
	  			"approvestatus":"true",
				"ContractName":contractDetails.contractName,
	  			"ContractID":contractDetails.contractID,
	  			"supplier": contractDetails.supplierName,
	  			"supplierID":contractDetails.supplierID};
		AddContractService.getBlockStatus().then(function (response) 
	    {
	    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
	 		// 	console.log($scope.prevBlockHeight);
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
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyy");
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
	else if($rootScope.logUser=='carrier')
	{
		$scope.approvalData={
	  			"shipmentstatus":"true",
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
	                            	insertDet["contractName"]=approvalResponse.data[1];
	                                insertDet["supplierID"]=parseInt(approvalResponse.data[4]);
	                                insertDet["supplierName"]=approvalResponse.data[3];
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=approvalResponse.data[6];
	                                insertDet["trackingNumber"]=approvalResponse.data[6];
	                                insertDet["shipmentstatus"]=approvalResponse.data[6];
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyy");
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
	  			"finalsignoff":"true",
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
	                     		
	                            	insertDet["contractID"]=parseInt(approvalResponse.data[2]);
	                            	insertDet["contractName"]=approvalResponse.data[1];
	                                insertDet["supplierID"]=parseInt(approvalResponse.data[4]);
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=approvalResponse.data[6];
	                                insertDet["totalamount"]=approvalResponse.data[6];
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyy");
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
	 		// 	console.log($scope.prevBlockHeight);
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
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyy");
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
	                            	insertDet["contractName"]=approvalResponse.data[1];
	                                insertDet["supplierID"]=parseInt(approvalResponse.data[4]);
	                                insertDet["supplierName"]=approvalResponse.data[3];
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=approvalResponse.data[6];
	                                insertDet["trackingNumber"]=approvalResponse.data[6];
	                                insertDet["shipmentstatus"]=approvalResponse.data[6];
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyy");
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
	                     		
	                            	insertDet["contractID"]=parseInt(approvalResponse.data[2]);
	                            	insertDet["contractName"]=approvalResponse.data[1];
	                                insertDet["supplierID"]=parseInt(approvalResponse.data[4]);
	                                insertDet["productID"]=contractDetails.productID;
	                                insertDet["productName"]=approvalResponse.data[6];
	                                insertDet["totalamount"]=approvalResponse.data[6];
	                                insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyy");
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
        window.history.forward(-1);
            $state.go('login');
    }
}]);



