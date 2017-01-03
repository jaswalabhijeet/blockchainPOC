'use strict';

/**
 * @ngdoc function
 * @description
 * # queryCtrl
 */
app.controller('queryCtrl',['$scope','$rootScope','$cookieStore','QueryService','$state','$timeout','AddContractService','$filter', function ($scope,$rootScope,$cookieStore,QueryService,$state,$timeout,AddContractService,$filter) 
{
	$scope.loggedUser = $cookieStore.get('loginData');
 	$rootScope.logUser = $cookieStore.get('loginTempData').userName;
  $rootScope.logType = $cookieStore.get('loginTempData').profileType;
  $scope.availableTags={};

  $(document).ready(function() {
    $('.set-hgt').attr('style','min-height:652px');
  });
  
  $scope.dateTimeFormat=function(dt,oid)
  {
    var supDt="supDtTm"+oid;
      if(dt.length==13)
        dt = dt.slice(0,1)+"-"+ dt.slice(1,3)+"-"+ dt.slice(3,7)+" "+ dt.slice(7,9)+":"+ dt.slice(9,11)+":"+ dt.slice(11,13);
      else
        dt = dt.slice(0,2)+"-"+ dt.slice(2,4)+"-"+ dt.slice(4,8)+" "+ dt.slice(8,10)+":"+ dt.slice(10,12)+":"+ dt.slice(12,14);
      $("#"+supDt).html(dt);
  }

  $scope.moveLeft = function () 
  {
        $(".modal-body").animate({scrollLeft: "-="+100});
  }
  $scope.moveRight = function () 
  {
        $(".modal-body").animate({scrollLeft: "+="+100});
  }

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
	$scope.queryBtnClick = function () 
	{
		$scope.displayLoading = true;
		$scope.auditResult=[];
        QueryService.getAuditDetails().then(function (response) 
        {
    			angular.forEach(response.data.row, function(value, key)
    			{
              if(value.createdBy==$rootScope.logUser)
              {
                $scope.auditResult.push(value);
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
	
  $scope.complete=function()
  {

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
  $scope.toggleModal = function(oid)
  {
    var flag='';var temp='';var cnt=0;
    QueryService.fetchDataOrderId(oid).then(function (blockData) 
    {
        $scope.orderDetails=[];$scope.orderDetails2=[];
        angular.forEach(blockData.data.row, function(value, key)
        {
          if(cnt==0)
          {
            if(value.batchID!="" && value.batchID!='undefined')
            {
              temp=value.batchID;
              cnt++;
            }
          } 
          $scope.orderDetails.push(value);
        });
        angular.forEach($scope.orderDetails, function(value, key)
        {
            var cnt2=0;
            if(value.batchID!="" && value.batchID!='undefined')
            {
              if(temp!=value.batchID)
              {
                cnt2++;
              }
              temp=value.batchID;
              if(cnt2>0)
              {
                value.flag=1;
              }
            }
            else
              value.flag=0;
           $scope.orderDetails2.push(value);
        });
          $scope.showModal = !$scope.showModal;
        
    }, function (error) {
            console.log("Error while fetching block data: " + error);
            $scope.displayLoading = false;
    });
    
  };
  
  $scope.queryBtnClick();

	$scope.logout=function()
    {
        $cookieStore.remove('loginData');
          $cookieStore.remove('loginTempData');
          $cookieStore.remove('totAmnt');
        window.history.forward(-1);
            $state.go('login');
    }
}]);

app.directive('modal', function () 
{
    return {
      transclude: true,
      restrict: 'E',
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' +  
            '<div class="modal-header" style="background-color:#f5f5f5;border-bottom:#f5f5f5;">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title"></h4>' + 
                '<span ng-click="moveLeft();" style="color:#000">'+
                '<i class="fa fa-caret-left left-arrow" aria-hidden="true"></i>'+
                '</span>'+
                '<span class="pull-right" ng-click="moveRight();" style="color:#000;cursor:pointer;">'+
                '<i class="fa fa-caret-right left-arrow" aria-hidden="true"></i>'+
                '</span>'+
              '</div>' + 
              '<div class="modal-body modal-body-cus modal-scroll" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      replace:true,
      
                
      link: function postLink(scope, element, attrs) 
      {
          scope.$watch(attrs.visible,function(value){
          if(value == true)
          {
            $('.left-arrow').hide();
            $(element).modal('show');
            setTimeout(function() 
            {
              var hgt= $(".modal-content").height();
              hgt=(hgt/2)+'px';
              $('.left-arrow').attr('style','margin-top:'+hgt);
              $('.left-arrow').show();
            }, 1000);
            
          }
          else
            $(element).modal('hide');
        });

      },

    };
  });

  
app.directive('modalBlock', function () 
{
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


            