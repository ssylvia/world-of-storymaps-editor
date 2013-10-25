define(["storymaps/utils/MovableGraphic","dojo/_base/array","esri/arcgis/utils","esri/arcgis/Portal","esri/map","esri/dijit/Geocoder","esri/layers/GraphicsLayer","esri/graphic","esri/symbols/PictureMarkerSymbol","lib/jquery/jquery-1.10.2.min"],
	function(MoveableGraphic,array,arcgisUtils,arcgisPortal,Map,Geocoder,GraphicsLayer,Graphic,PictureMarkerSymbol){

		/**
		* Core
		* @class Core
		*
		* Main class for story map application
		*
		* Dependencies: Jquery 1.10.2
		*/

		var _portal,
		_location;

		function init ()
		{
			_portal = new arcgisPortal.Portal("http://www.arcgis.com");
			login();
		}

		function login()
		{
			// _portal.signIn().then(function(result){
			// 	var load = false;
			// 	array.forEach(esri.id.credentials,function(user){
			// 		if($.inArray(user.userId,configOptions.authorizedEditors) >= 0){
			// 			load = true;
			// 		}
			// 	});

			// 	if (load){
					addFormEvents();
			// 	}
			// 	else{
			// 		alert("You do not have permission to edit the World of Story Maps App.");
			// 		location.reload();
			// 	}
			// });
		}

		function addFormEvents()
		{
			$("#item-search").click(function(){
				queryItem(getItemId($("#form-item").val()));
			});

			$("#item-error-close").click(function(){
				$("#item-error").hide();
			});

			$("#form-thumbnail").change(function(){
				$("#thumbnail-preview").attr("src",$("#form-thumbnail").val());
			});

			createMap();
		}

		function createMap()
		{
			var map = new Map("map",{
				basemap: "topo",
				center: [-19,32],
				zoom: 2
			});

			if(map.loaded){
				addMapInterface(map);
			}
			else{
				map.on("load",function(){
					addMapInterface(map);
				});
			}
		}

		function addMapInterface(map)
		{
			var graphicsLayer = new GraphicsLayer();
			map.addLayer(graphicsLayer);

			var pt = map.extent.getCenter();
			var sym = new PictureMarkerSymbol("resources/images/RedPin.png",30,35).setOffset(14,7);

			var location = new Graphic(pt,sym);
			graphicsLayer.add(location);

			_location = pt;

			var movable = new MoveableGraphic(map,graphicsLayer,location,null,function(graphic){
				_location = graphic.geometry;
			});

			var geocoder = new Geocoder({
				map: map,
				maxLocations: 1
			},"geocoder");

			geocoder.on("select",function(result){
				console.log(result);
				_location = result.result.feature.geometry;
				location.setGeometry(_location);
			});
		}

		function getItemId(str)
		{
			if (str.length === 32){
				return str;
			}
			else{
				var index = (str.search("id=") + 3);
				var newStr = str.slice(index,(index + 32));

				return newStr;
			}
		}

		function queryItem(item)
		{
			var deferred = arcgisUtils.getItem(item).then(function(result){
				$("#item-error").hide();
				var item = result.item;
				if (item.type === "Web Mapping Application"){
					var thumbnail = "http://www.arcgis.com/sharing/rest/content/items/" + item.id + "/info/" + item.thumbnail;
					$("#form-name").val(item.title);
					$("#form-description").val(item.snippet);
					$("#form-publisher").val(item.owner);
					$("#form-url").val(item.url);
					$("#form-thumbnail").val(thumbnail);
					$("#thumbnail-preview").attr("src",thumbnail);
					window.portal = _portal;
				}
			},function(){
				$("#item-error").show();
			});
		}

		return {
			init: init
		};
});