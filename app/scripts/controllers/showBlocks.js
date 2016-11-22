'use strict';

/**
 * @ngdoc function
 * @name blockChainApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the blockChainApp
 */
app.controller('showBlocksCtrl', function () {
    $(document).ready(function() 
	{
		var divHeight = $('.col-md-3').height();
		$('.col-md-9').css('min-height', divHeight+'px');
	});
  });
