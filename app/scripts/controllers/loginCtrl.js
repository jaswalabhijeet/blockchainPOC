'use strict';

/**
 * @ngdoc function
 * @description
 * # LoginCtrl
 */
app.controller('loginCtrl', ['UserLoginService', '$scope', '$cookieStore','$state','$rootScope','$timeout',
	function (UserLoginService, $scope, $cookieStore,$state,$rootScope,$timeout) 
    {
        $scope.getUsername = function () 
        {
            $scope.result=[];
            $scope.displayLoading = true;
            UserLoginService.getUsernameDetails().then(function (response) 
            {
                $scope.availableTags=response.data.row;
      
                angular.forEach($scope.availableTags, function(value, key)
                {
                      $scope.result.push(value.username);            
                });
                $scope.complete();
                $scope.displayLoading = false;
            }, function (error) {
                $scope.displayError="Error while fetching username details: ";
                $scope.displayLoading = false;
            });
        }
        $scope.complete=function()
        {
            $( "#uname" ).autocomplete(
            {
                source: $scope.result,
                select: function( event, ui ) 
                {
                    $timeout(function(){
                        $scope.username = ui.item.value;      
                    }, 0);
                }
            });
        }
        $scope.getUsername();
        $scope.blockHover = function (height) 
        {
            AddContractService.fetchBlockData(height).then(function (blockData) 
            {
                $scope.insertDet["chain_id"]=blockData.data.result[1].block.header.chain_id;
                $scope.insertDet["height"]=parseInt(blockData.data.result[1].block.header.height);
                $scope.insertDet["num_txs"]=parseInt(blockData.data.result[1].block.header.num_txs);
                $scope.insertDet["block_hash"]=blockData.data.result[1].block.last_validation.precommits[0].block_hash;
                $scope.insertDet["data_hash"]=blockData.data.result[1].block.header.data_hash;
                $scope.insertDet["block_time"]=blockData.data.result[1].block.header.time;
                $scope.insertDet["fees"]=blockData.data.result[1].block.header.fees;
                $scope.insertDet["last_block_hash"]=blockData.data.result[1].block.header.last_block_hash;
                $scope.insertDet["last_block_parts"]=blockData.data.result[1].block.header.last_block_parts;
                $scope.insertDet["last_validation_hash"]=blockData.data.result[1].block.header.last_validation_hash;
                $scope.insertDet["state_hash"]=blockData.data.result[1].block.header.state_hash;
                
            }, function (error) {
                    console.log("Error while fetching block data: ");
                    $scope.displayLoading = false;
            });
        }
        $scope.loginButtonClick = function () 
        {
            $scope.displayLoading = true;
            if ($scope.remeberMe == true) 
            {
                $cookieStore.put('loginData', {
                    userName: $scope.username,
                    password: $scope.password
                });
            }
            UserLoginService.authenticateUser($scope.username, $scope.password).then(function (response) 
            {
                $cookieStore.put('loginTempData', 
                {
                    userName: response.config.data.username,
                    password: response.config.data.password,
                    profileType: response.data.rows[0].profile_type
                });

                $rootScope.logUser=$cookieStore.get('loginTempData').userName;
                $scope.displayLoading = false;
                $state.go('dashboard');
            }, function (error) {
                $scope.displayError = "username or password is incorrect";
                $scope.displayLoading = false;
            });
        }

        window.history.forward(-1);

        //for block movement start

        $('.carousel').carousel({interval:0.6,pause: "hover"});
        $('.carousel .item').each(function()
        {
          var next = $(this).next();
          if (!next.length) {
            next = $(this).siblings(':first');
          }
          next.children(':first-child').clone().appendTo($(this));
          
          for (var i=0;i<12;i++) {
            next=next.next();
            if (!next.length) {
                next = $(this).siblings(':first');
            }
            
            next.children(':first-child').clone().appendTo($(this));
          }
        });

        //for block movement close

}]);