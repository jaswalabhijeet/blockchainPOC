'use strict';

/**
 * @ngdoc function
 * @name blockChainApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the blockChainApp
 */
angular.module('blockChainApp').controller('addContractCtrl', function () {
	$(document).ready(function() 
	{
		var divHeight = $('.col-md-3').height();
		$('.col-md-9').css('min-height', divHeight+'px');
	});
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
