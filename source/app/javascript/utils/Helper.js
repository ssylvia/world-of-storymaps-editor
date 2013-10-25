define(["lib/spin.min.js","lib/jquery/jquery-1.10.2.min","storymaps/utils/SocialSharing"], 
	function(Spinner){
	/**
	* Helper
	* @class Helper
	* 
	* Collection of helper functions
	*
	* Dependencies: Jquery 1.10.2
	*/

	// Show ajax laoder on load
	var _appLoader = ajaxLoader('loader'),
	_loadingMessage = $("#loading-message"),
	_appLoadScreen = $("#app-load-screen");

	function ajaxLoader(elementId)
	{
		var options = {
			lines: 16, // The number of lines to draw
			length: 7, // The length of each line
			width: 7, // The line thickness
			radius: 30, // The radius of the inner circle
			corners: 0, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb or array of colors
			speed: 1.1, // Rounds per second
			trail: 25, // Afterglow percentage
			shadow: true, // Whether to render a shadow
			hwaccel: true, // Whether to use hardware acceleration
			className: 'ajax-loader', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		};

		var target = document.getElementById(elementId);
		var loader = new Spinner(options).spin(target);

		return loader;
	}

	function regionLayout()
	{
		$(".region-center").each(function(){
			var l = $(this).siblings(".region-left:visible").outerWidth(),
				r = $(this).siblings(".region-right:visible").outerWidth(),
				t = $(this).siblings(".region-top:visible").outerHeight(),
				b = $(this).siblings(".region-bottom:visible").outerHeight(),
				x = l + r,
				y = t + b;
			$(this).css({
				"top": t,
				"left": l,
				"height" : $(this).parent().outerHeight() - y,
				"width" : $(this).parent().outerWidth() - x
			});
		});
	}

	return {

		updateLoadingMessage: function(message)
		{
			_loadingMessage.html(message);
		},

		removeLoadScreen: function()
		{
			_appLoadScreen.fadeOut();
			_appLoader.stop();
		},

		enableRegionLayout: function()
		{
			regionLayout();
			$(window).resize(function(){
				regionLayout();
			});
		},

		syncMaps: function(maps,currentMap,extent)
		{
			dojo.forEach(maps,function(map){
				if (map !== currentMap){
					map.setExtent(extent);
				}
			});
		}
	};
});