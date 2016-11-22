'use strict';

/**
 * @ngdoc function
 * @description
 * # DashboardCtrl
 */
app.controller('dashboardCtrl', function () 
{
	$(document).ready(function() 
	{
		var divHeight = $('.col-md-3').height();
		$('.col-md-9').css('min-height', divHeight+'px');
	});
	$('.data_tbl').DataTable( {
		paging: false,
		ordering: true,
		searching: false,
		info: false
	} );
});
