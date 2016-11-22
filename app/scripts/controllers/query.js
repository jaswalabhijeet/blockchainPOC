'use strict';

/**
 * @ngdoc function
 * @description
 * # queryCtrl
 */
app.controller('queryCtrl', function () {
    $(document).ready(function() 
	{
		var divHeight = $('.col-md-3').height();
		$('.col-md-9').css('min-height', divHeight+'px');
	});
	$('.query_tbl').DataTable( {
		paging: true,
		ordering: true,
		searching: false,
		info: true
	} );
  });
