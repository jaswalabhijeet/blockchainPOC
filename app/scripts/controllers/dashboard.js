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
 	$rootScope.displaySuccess="";
 	$rootScope.displayError="";
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
		if(dt.length==13)
    		dt = dt.slice(0,1)+"-"+ dt.slice(1,3)+"-"+ dt.slice(3,7)+" "+ dt.slice(7,9)+":"+ dt.slice(9,11)+":"+ dt.slice(11,13);
    	else
    		dt = dt.slice(0,2)+"-"+ dt.slice(2,4)+"-"+ dt.slice(4,8)+" "+ dt.slice(8,10)+":"+ dt.slice(10,12)+":"+ dt.slice(12,14);
    	$("#"+supDt).html(dt);
	}
	$rootScope.getContract=function () 
	{

		$scope.displayLoading = true;
		$rootScope.manDist = 0;$rootScope.manSup = 0;
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
				if($rootScope.logType =='Manufacturer')
				{
					if(value.filler2 =='Distributor')
					{
						$rootScope.manDist++;
					}
				}
				if($rootScope.logType =='Distributor')
				{
					if(value.filler2 =='Distributor')
					{
						$rootScope.manSup++;
					}
				}
			});
			console.log($rootScope.manSup);
			$scope.displayLoading = false;
			  setTimeout(function() 
	          {
	            var hgt=$('.set-hgt').height()+'px';
	            $('.navbar-inverse').attr('style','min-height:'+hgt);
	          }, 1000);
		});
	}
	$scope.getDrugName=function () 
    {
        $scope.displayLoading = true;
        DashboardService.getDrugDetails().then(function (response) 
        {
            $scope.drgName=[];
            $scope.drgDetails=[];
            angular.forEach(response.data.row, function(value, key)
            {
                    $scope.drgName.push(value.productName);
                    $scope.drgDetails.push(value);
            });
            $scope.displayLoading = false;
        });
    }
    $scope.getBatchID=function (pname,oid) 
    {
        $scope.displayLoading = true;
        DashboardService.getBatchIDDetails(pname).then(function (response) 
        {
            $scope.batchName=[];
            $scope.batchDetails=[];
            angular.forEach(response.data.row, function(value, key)
            {
                    $scope.batchName.push(value.batchID);
                    $scope.batchDetails.push(value);
            });
            $scope.displayLoading = false;
        });
    }
	$scope.generateBatchId=function (pname,oid) 
	{
		var div="bid"+oid;
		var btn="btnbid"+oid;
		var btnhd="bidhdn"+oid;
		$rootScope.batchId=pname.substr(0, 3)+""+$filter('date')(new Date(), "ddMMyyyyHHmmss");
		$("#"+btnhd).val($rootScope.batchId);
		$("#"+div).html($rootScope.batchId);
		$("#"+btn).hide();
	}
	$scope.generateTrackNum=function (oid) 
	{
		var div="tno"+oid;
		var btn="btntno"+oid;
		var btnhd="tnohdn"+oid;
		$rootScope.trackNum=$rootScope.logUser+""+$filter('date')(new Date(), "ddMMyyyyHHmmss");
		$("#"+div).html($rootScope.trackNum);
		$("#"+btnhd).val($rootScope.trackNum);
		$("#"+btn).hide();
	}

	$scope.prevBlockHeight = "";
	$scope.newBlockHeight = "";
    $scope.getDrugName();
$scope.approveBtnClick = function (contractDetails,cname) 
{	
	$scope.displayLoading = true;
	$scope.displayAprvSuccess="";
	if($rootScope.logType=='Distributor')
	{
		if(contractDetails.filler2=='Distributor')
		{
			$scope.approvalData={
	  			"contractID":contractDetails.orderID,
	  			"supplierName":contractDetails.supplierName,
	  			"productName": contractDetails.productName,
	  			"batchID": contractDetails.batchID,
	  			"approvestatus":1};	
	  		AddContractService.getBlockStatus().then(function (response) 
		    {
		    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
		    	DashboardService.signOffByDistributor(JSON.stringify($scope.approvalData)).then(function (approvalResponse) 
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
	                                    insertDet["batchID"]=contractDetails.batchID;
	                                    insertDet["carrierName"]=cname;
	                                    insertDet["trackingNumber"]="";
	                                    insertDet["supplyByDate"]=contractDetails["supplyByDate"];
	                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//contractDetails.createdDate;
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
	                                    insertDet["filler1"]=contractDetails.filler1;
	                                    insertDet["filler2"]=contractDetails.filler2;
	                                    insertDet["filler3"]=contractDetails.filler3;
	                                    insertDet["filler4"]=contractDetails.filler4;
	                                    insertDet["filler5"]=contractDetails.filler5;
		                                var temp=[];
		                                temp.push(insertDet);
		                                var jsonObj={};
		                                jsonObj["row"]=temp;
		                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
		                                {
		                                    $scope.displayLoading = false;
		                                    $rootScope.displaySuccess = "Approved Successfully!";
		                                    $rootScope.getContract();
		                                    $state.go('dashboard');
		                                }, function (error) {
		                                	$rootScope.displayError="Error while inserting block data";
		                                    $scope.displayLoading = false;
		                                });
		                        	}, function (error) {
		            					$rootScope.displayError="Error while fetching block chain status: ";
		            					$scope.displayLoading = false;
		        					});
		                    	}
		                	});
	                	}, function (error) {
		            		$rootScope.displayError="Error while fetching block chain status: ";
		            		$scope.displayLoading = false;
		    			});	
		    		}, function (error) {
	            		$rootScope.displayError="Error while fetching block chain status: ";
	            		$scope.displayLoading = false;
	    			});	
		    	}, function (error) {
            		$rootScope.displayError="Error while fetching block chain status: ";
            		$scope.displayLoading = false;
    			});	
	    	}, function (error) {
            		$rootScope.displayError="Error while fetching block chain status: ";
            		$scope.displayLoading = false;
    		});
		}
		else
		{
			var hdnbid="bidhdn"+contractDetails.orderID;
			$scope.approvalData={
	  			"contractID":contractDetails.orderID,
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
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//contractDetails.createdDate;
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
                                    insertDet["filler1"]=contractDetails.filler1;
                                    insertDet["filler2"]=contractDetails.filler2;
                                    insertDet["filler3"]=contractDetails.filler3;
                                    insertDet["filler4"]=contractDetails.filler4;
                                    insertDet["filler5"]=contractDetails.filler5;
	                                var temp=[];
	                                temp.push(insertDet);
	                                var jsonObj={};
	                                jsonObj["row"]=temp;
	                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
	                                {
	                                    $scope.displayLoading = false;
	                                    $rootScope.displaySuccess = "Approved Successfully!";
	                                    $rootScope.getContract();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                	$rootScope.displayError="Error while inserting block data";
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					$rootScope.displayError="Error while fetching block chain status: ";
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		$rootScope.displayError="Error while fetching block chain status: ";
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	$rootScope.displayError="Error while fetching block chain status: ";
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            $rootScope.displayError="Error while approval: ";
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            $rootScope.displayError="Error while fetching block chain status: ";
	            $scope.displayLoading = false;
	        });
		}
	}
	else if($rootScope.logType=='Carriers')
	{
		var hdntno="tnohdn"+contractDetails.orderID;
		var txtBid="bidtxt"+contractDetails.orderID;
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
                                    insertDet["batchID"]=$('#'+txtBid).val();
                                    insertDet["carrierName"]=contractDetails.carrierName;
                                    insertDet["trackingNumber"]=$scope.approvalData['trackingNumber'];
                                    insertDet["supplyByDate"]=contractDetails.supplyByDate;
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//$filter('date')(new Date(), "ddMMyyyyHHmmss");
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
                                    insertDet["filler1"]=contractDetails.filler1;
                                    insertDet["filler2"]=contractDetails.filler2;
                                    insertDet["filler3"]=contractDetails.filler3;
                                    insertDet["filler4"]=contractDetails.filler4;
                                    insertDet["filler5"]=contractDetails.filler5;
	                                var temp=[];
	                                temp.push(insertDet);
	                                var jsonObj={};
	                                jsonObj["row"]=temp;
	                                //console.log(JSON.stringify(jsonObj));exit;
	                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
	                                {
	                                    $scope.displayLoading = false;
	                                    $rootScope.displaySuccess = "Approved Successfully!";
	                                    $rootScope.getContract();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    $rootScope.displayError="Error while inserting block data: ";
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					$rootScope.displayError="Error while fetching block chain status: ";
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		$rootScope.displayError="Error while fetching block chain status: ";
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	$rootScope.displayError="Error while fetching block chain status: ";
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            $rootScope.displayError="Error while approval: ";
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            $rootScope.displayError="Error while fetching block chain status: ";
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
	  	$scope.totAmount=0;
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
	                     			$cookieStore.put('totAmnt',(contractDetails.totalPrice));
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
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//contractDetails.createdDate;
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
                                    insertDet["filler1"]=contractDetails.filler1;
                                    insertDet["filler2"]=contractDetails.filler2;
                                    insertDet["filler3"]=contractDetails.filler3;
                                    insertDet["filler4"]=contractDetails.filler4;
                                    insertDet["filler5"]=contractDetails.filler5;
	                                var temp=[];
	                                temp.push(insertDet);
	                                var jsonObj={};
	                                jsonObj["row"]=temp;
	                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
	                                {
	                                    $scope.displayLoading = false;
	                                    $rootScope.displaySuccess = "Approved Successfully!";
	                                    $rootScope.getContract();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    $rootScope.displayError="Error while inserting block data: ";
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					$rootScope.displayError="Error while fetching block chain status: ";
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		$rootScope.displayError="Error while fetching block chain status: ";
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	$rootScope.displayError="Error while fetching block chain status: ";
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            $rootScope.displayError="Error while approval: ";
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            $rootScope.displayError="Error while fetching block chain status: ";
	            $scope.displayLoading = false;
	        });	
	}
	else if($rootScope.logType=='Supplier')
	{
		$scope.approvalData={
	  			"contractID":contractDetails.orderID,
	  			"supplierName":contractDetails.supplierName,
	  			"productName":contractDetails.productName,
  				"approvestatus": 1};
	  	$scope.totAmount=0;
	  	AddContractService.getBlockStatus().then(function (response) 
	    {
	    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
	    	DashboardService.approvalBySupplier($scope.approvalData).then(function (approvalResponse) 
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
	                     			$cookieStore.put('totAmnt',(contractDetails.totalPrice));
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
                                    insertDet["batchID"]="";
                                    insertDet["carrierName"]="";
                                    insertDet["trackingNumber"]="";
                                    insertDet["supplyByDate"]=contractDetails.supplyByDate;
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//contractDetails.createdDate;
                                    insertDet["createdBy"]=contractDetails.createdBy;
                                    insertDet["profileType"]=$rootScope.logType;
                                    insertDet["pendingWith"]=contractDetails.pendingWith;
                                    insertDet["status"]=contractDetails["status"];
                                    insertDet["loginuser"]=$rootScope.logUser;
                                    insertDet["signedBy"]="";
                                    insertDet["approvalstatus"]="true";
                                    insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
                                    insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
                                    insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
                                    insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
                                    insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
                                    insertDet["block_time"]=blockData.data.result[1].block.header.time;
                                    insertDet["drugName"]="";
                                    insertDet["filler1"]=contractDetails.filler1;
                                    insertDet["filler2"]=contractDetails.filler2;
                                    insertDet["filler3"]=contractDetails.filler3;
                                    insertDet["filler4"]=contractDetails.filler4;
                                    insertDet["filler5"]=contractDetails.filler5;
	                                var temp=[];
	                                temp.push(insertDet);
	                                var jsonObj={};
	                                jsonObj["row"]=temp;
	                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
	                                {
	                                    $scope.displayLoading = false;
	                                    $rootScope.displaySuccess = "Approved Successfully!";
	                                    $rootScope.getContract();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    $rootScope.displayError="Error while inserting block data: ";
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					$rootScope.displayError="Error while fetching block chain status: ";
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
			            $rootScope.displayError="Error while approval: ";
			            $scope.displayLoading = false;
		        	});	
    			}, function (error) {
		            $rootScope.displayError="Error while approval: ";
		            $scope.displayLoading = false;
	        	});
    		}, function (error) {
	            $rootScope.displayError="Error while approval: ";
	            $scope.displayLoading = false;
	        });
    	}, function (error) {
            $rootScope.displayError="Error while fetching block chain status: ";
            $scope.displayLoading = false;
        });	
	}
	else if($rootScope.logType=='Manufacturer')
	{
		$scope.displayLoading = true;
		if(contractDetails.filler2=="Distributor")
		{
			$scope.approvalData={
		  			"contractID":contractDetails.orderID,
		  			"supplierName":contractDetails.supplierName,
		  			"productName": contractDetails.productName,
		  			"batchID": cname,
		  			"approvestatus":1};
  			$scope.totAmount=0;
		  	AddContractService.getBlockStatus().then(function (response) 
		    {
		    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
		    	DashboardService.approvalByManufacturerDist($scope.approvalData).then(function (approvalResponse) 
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
		                     			$cookieStore.put('totAmnt',(contractDetails.totalPrice));
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
	                                    insertDet["batchID"]=cname;
	                                    insertDet["carrierName"]="";
	                                    insertDet["trackingNumber"]="";
	                                    insertDet["supplyByDate"]=contractDetails.supplyByDate;
	                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//contractDetails.createdDate;
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
	                                    insertDet["drugName"]='';
	                                    insertDet["filler1"]=contractDetails.filler1;
	                                    insertDet["filler2"]=contractDetails.filler2;
	                                    insertDet["filler3"]=contractDetails.filler3;
	                                    insertDet["filler4"]=contractDetails.filler4;
	                                    insertDet["filler5"]=contractDetails.filler5;
		                                var temp=[];
		                                temp.push(insertDet);
		                                var jsonObj={};
		                                jsonObj["row"]=temp;
		                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
		                                {
		                                    $scope.displayLoading = false;
		                                    $rootScope.displaySuccess = "Approved Successfully!";
		                                    $rootScope.getContract();
		                                    $state.go('dashboard');
		                                }, function (error) {
		                                    $rootScope.displayError="Error while inserting block data: ";
		                                    $scope.displayLoading = false;
		                                });
		                        	}, function (error) {
		            					$rootScope.displayError="Error while fetching block chain status: ";
		            					$scope.displayLoading = false;
		        					});
		                    	}
		                	});
	                	}, function (error) {
							$rootScope.displayError="Error while fetching block chain status: ";
							$scope.displayLoading = false;
						});
	    			}, function (error) {
						$rootScope.displayError="Error while fetching block chain status: ";
						$scope.displayLoading = false;
					});
		    	}, function (error) {
					$rootScope.displayError="Error while fetching block chain status: ";
					$scope.displayLoading = false;
				});	
		    }, function (error) {
				$rootScope.displayError="Error while fetching block chain status: ";
				$scope.displayLoading = false;
			});

		}
		else
		{
			var hdnbid="bidhdn"+contractDetails.orderID;
			$scope.approvalData={
		  			"contractID":contractDetails.orderID,
		  			"supplierName":contractDetails.supplierName,
		  			"productName": contractDetails.productName,
		  			"drugName":cname,
		  			"batchID": $('#'+hdnbid).val(),
		  			"approvestatus":1};
		  	$scope.totAmount=0;
		  	AddContractService.getBlockStatus().then(function (response) 
		    {
		    	$scope.prevBlockHeight = response.data.result[1].latest_block_height;
		    	DashboardService.approvalByManufacturer($scope.approvalData).then(function (approvalResponse) 
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
		                     			$cookieStore.put('totAmnt',(contractDetails.totalPrice));
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
	                                    insertDet["batchID"]=$('#'+hdnbid).val();
	                                    insertDet["carrierName"]="";
	                                    insertDet["trackingNumber"]="";
	                                    insertDet["supplyByDate"]=contractDetails.supplyByDate;
	                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//contractDetails.createdDate;
	                                    insertDet["createdBy"]=contractDetails.createdBy;
	                                    insertDet["profileType"]=$rootScope.logType;
	                                    insertDet["pendingWith"]=contractDetails.pendingWith;
	                                    insertDet["status"]=contractDetails["status"];
	                                    insertDet["loginuser"]=$rootScope.logUser;
	                                    insertDet["signedBy"]="";
	                                    insertDet["approvalstatus"]="true";
	                                    insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
	                                    insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
	                                    insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
	                                    insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
	                                    insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
	                                    insertDet["block_time"]=blockData.data.result[1].block.header.time;
	                                    insertDet["drugName"]=cname;
	                                    insertDet["filler1"]=contractDetails.filler1;
	                                    insertDet["filler2"]=contractDetails.filler2;
	                                    insertDet["filler3"]=contractDetails.filler3;
	                                    insertDet["filler4"]=contractDetails.filler4;
	                                    insertDet["filler5"]=contractDetails.filler5;
		                                var temp=[];
		                                temp.push(insertDet);
		                                var jsonObj={};
		                                jsonObj["row"]=temp;
		                                AddContractService.insertBlockData(JSON.stringify(jsonObj)).then(function (insertResponse) 
		                                {
		                                    $scope.displayLoading = false;
		                                    $rootScope.displaySuccess = "Approved Successfully!";
		                                    $rootScope.getContract();
		                                    $state.go('dashboard');
		                                }, function (error) {
		                                    $rootScope.displayError="Error while inserting block data: ";
		                                    $scope.displayLoading = false;
		                                });
		                        	}, function (error) {
		            					$rootScope.displayError="Error while fetching block chain status: ";
		            					$scope.displayLoading = false;
		        					});
		                    	}
		                	});
		                }, function (error) {
				            $rootScope.displayError="Error while fetching block chain status: ";
				            $scope.displayLoading = false;
				        });		
		    		}, function (error) {
			            $rootScope.displayError="Error while fetching block chain status: ";
			            $scope.displayLoading = false;
			        });	
		    	}, function (error) {
		            $rootScope.displayError="Error while fetching block chain status: ";
		            $scope.displayLoading = false;
		        });	
		    }, function (error) {
	            $rootScope.displayError="Error while fetching block chain status: ";
	            $scope.displayLoading = false;
	        });			
		}
	}
}

$scope.cancelBtnClick=function (contractDetails) 
{
	$scope.displayLoading = true;
	if($rootScope.logUser=='Distributor')
	{
		var hdnbid="bidhdn"+contractDetails.orderID;
		$scope.approvalData={
	  			"contractID":contractDetails.orderID,
	  			"supplierName":contractDetails.supplierName,
	  			"productName": contractDetails.productName,
	  			"batchID": $('#'+hdnbid).val(),
	  			"carrierName":cname,
	  			"approvestatus":0};
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
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//contractDetails.createdDate;
                                    insertDet["createdBy"]=contractDetails.createdBy;
                                    insertDet["profileType"]=$rootScope.logType;
                                    insertDet["pendingWith"]=cname;
                                    insertDet["status"]=contractDetails["status"];
                                    insertDet["loginuser"]=$rootScope.logUser;
                                    insertDet["signedBy"]="";
                                    insertDet["approvalstatus"]=0;
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
	                                    $scope.displayError = "Cancelled Successfully!";
	                                    $rootScope.getContract();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: ");
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: ");
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: ");
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: ");
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: ");
	            $scope.displayLoading = false;
	        });
	}
	else if($rootScope.logUser=='Carriers')
	{
		var hdntno="tnohdn"+contractDetails.orderID;
		$scope.approvalData={
	  			"contractID":contractDetails.orderID,
	  			"supplierName":contractDetails.supplierName,
	  			"productName":contractDetails.productName,
	  			"shipmentstatus":0,
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
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");//$filter('date')(new Date(), "ddMMyyyyHHmmss");
                                    insertDet["createdBy"]=contractDetails.createdBy;
                                    insertDet["profileType"]=$rootScope.logType;
                                    insertDet["pendingWith"]=contractDetails.createdBy;
                                    insertDet["status"]=contractDetails["status"];
                                    insertDet["loginuser"]=$rootScope.logUser;
                                    insertDet["signedBy"]="";
                                    insertDet["approvalstatus"]=0;
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
	                                    $rootScope.getContract();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: ");
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: ");
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: ");
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: ");
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: ");
	            $scope.displayLoading = false;
	        });	
	}
	else if($rootScope.logUser=='Retailer')
	{
		$scope.approvalData={
	  			"finalsignoff":0,
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
                                    insertDet["createdDate"]=$filter('date')(new Date(), "ddMMyyyyHHmmss");
                                    insertDet["createdBy"]=contractDetails.createdBy;
                                    insertDet["profileType"]=$rootScope.logType;
                                    insertDet["pendingWith"]=contractDetails.pendingWith;
                                    insertDet["status"]=contractDetails["status"];
                                    insertDet["loginuser"]=$rootScope.logUser;
                                    insertDet["signedBy"]="";
                                    insertDet["approvalstatus"]=0;
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
	                                    $rootScope.getContract();
	                                    $state.go('dashboard');
	                                }, function (error) {
	                                    console.log("Error while inserting block data: ");
	                                    $scope.displayLoading = false;
	                                });
	                        	}, function (error) {
	            					console.log("Error while fetching block chain status: ");
	            					$scope.displayLoading = false;
	        					});
	                    	}
	                	});
	                }, function (error) {
	            		console.log("Error while fetching block chain status: ");
	            		$scope.displayLoading = false;
	        		});
				}, function (error) {
	            	console.log("Error while fetching block chain status: ");
	            	$scope.displayLoading = false;
	        	});
	    	}, function (error) {
	            console.log("Error while approval: " + error);
	            $scope.displayLoading = false;
	        });
	    }, function (error) {
	            console.log("Error while fetching block chain status: ");
	            $scope.displayLoading = false;
	        });	
	}
}

$rootScope.getContract();

	$scope.logout=function()
    {
        $cookieStore.remove('loginData');
          $cookieStore.remove('loginTempData');
          $cookieStore.remove('totAmnt');
        window.history.forward(-1);
            $state.go('login');
    }
}]);



