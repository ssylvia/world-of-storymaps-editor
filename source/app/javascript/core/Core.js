define(["storymaps/utils/MovableGraphic","esri/layers/FeatureLayer","dojo/_base/array","esri/arcgis/utils","esri/arcgis/Portal","esri/map","esri/tasks/query","esri/tasks/QueryTask","esri/dijit/Geocoder","esri/layers/GraphicsLayer","esri/graphic","esri/symbols/PictureMarkerSymbol","lib/jquery/jquery-1.10.2.min"],
	function(MoveableGraphic,FeatureLayer,array,arcgisUtils,arcgisPortal,Map,Query,QueryTask,Geocoder,GraphicsLayer,Graphic,PictureMarkerSymbol){

		/**
		* Core
		* @class Core
		*
		* Main class for story map application
		*
		* Dependencies: Jquery 1.10.2
		*/

		var _portal = new arcgisPortal.Portal("http://www.arcgis.com"),
		_storyLayer = new FeatureLayer(configOptions.featureService),
		_location,
		_tempLocation,
		_tempGraphic,
		map;

		function init ()
		{
			login();
		}

		function login()
		{
			_portal.signIn().then(function(){
				var load = false;
				array.forEach(esri.id.credentials,function(user){
					if($.inArray(user.userId,configOptions.authorizedEditors) >= 0){
						load = true;
					}
				});

				if (load){
					esri.id.getCredential(_storyLayer.url);
					addFormEvents();
				}
				else{
					alert("You do not have permission to edit the World of Story Maps App.");
					location.reload();
				}
			});
		}

		function addFormEvents()
		{
			$("#item-search").click(function(){
				queryItem(getItemId($("#form-item").val()));
			});

			$("#form-item").keypress(function(event){
				if(event.which === 13){
					queryItem(getItemId($("#form-item").val()));
				}
			});

			$("#item-search-submit").click(function(){
				searchItems($("#form-item-search").val());
			});

			$("#form-item-search").keypress(function(event){
				if(event.which === 13){
					searchItems($("#form-item-search").val());
				}
			});

			$("#item-add").click(function(){
				addApplicaton();
			});

			$("#item-edit").click(function(){
				editApplicaton();
			});

			$("#item-delete").click(function(){
				deleteApplicaton();
			});

			$("#item-error-close").click(function(){
				$("#item-error").hide();
			});

			$("#form-thumbnail").change(function(){
				$("#thumbnail-preview").attr("src",$("#form-thumbnail").val());
			});

			$("body").scroll(function(){
				map.resize();
				map.reposition();
			});

			createMap();
		}

		function createMap()
		{
			map = new Map("map",{
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

		function addMapInterface()
		{
			var graphicsLayer = new GraphicsLayer();
			map.addLayer(graphicsLayer);

			var pt = map.extent.getCenter();
			var sym = new PictureMarkerSymbol("resources/images/RedPin.png",30,35).setOffset(0,7);

			_tempLocation = new Graphic(pt,sym);
			graphicsLayer.add(_tempLocation);

			_location = pt;

			new MoveableGraphic(map,graphicsLayer,_tempLocation,function(graphic){
				_location = graphic.geometry;
			});

			var geocoder = new Geocoder({
				map: map,
				maxLocations: 1
			},"geocoder");

			geocoder.on("select",function(result){
				_location = result.result.feature.geometry;
				_tempLocation.setGeometry(_location);
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

		function searchItems(str)
		{
			$(".search-message").show();
			var query = new Query();
			query.outFields = ["*"];
			query.returnGeometry = true;
			query.where = "Name LIKE '%" + str + "%' OR TemplateText LIKE '%" + str + "%' OR Description LIKE '%" + str + "%' OR Publisher LIKE '%" + str + "%'";

			var queryTask = new QueryTask(_storyLayer.url);
			queryTask.execute(query,function(result){			

				$(".results tbody").empty();

				array.forEach(result.features,function(ftr){
					$(".results tbody").append('\
						<tr>\
							<td><span class="icon-edit btn">Edit</span></td>\
							<td>' + ftr.attributes.Name + '</td>\
							<td>' + ftr.attributes.Description + '</td>\
							<td>' + ftr.attributes.Publisher + '</td>\
						</tr>\
					');

					$(".results tbody .icon-edit").last().data("graphic",ftr).click(function(){
						var item = $(this).data("graphic").attributes;
						_tempGraphic = $(this).data("graphic");
						$("#form-name").val(item.Name);
						$("#form-description").val(item.Description);
						$("#form-publisher").val(item.Publisher);
						$("#form-url").val(item.Story_URL);
						$("#form-thumbnail").val(item.Image_URL);
						$("#form-template").val(item.TemplateText);
						$("#thumbnail-preview").attr("src",item.Image_URL);
						_tempLocation.setGeometry(_tempGraphic.geometry);

						map.resize();
						map.reposition();
					});

				});

				$(".results").show();
				$(".search-message").hide();

				map.resize();
				map.reposition();
			});
		}

		function queryItem(item)
		{
			$(".search-message").show();
			arcgisUtils.getItem(item).then(function(result){
				$(".search-message").hide();
				var item = result.item;
				console.log(item);
				if (item.type === "Web Mapping Application"){
					var thumbnail = "http://www.arcgis.com/sharing/rest/content/items/" + item.id + "/info/" + item.thumbnail;
					$("#item-error").hide();
					$("#form-name").val(item.title);
					$("#form-description").val(item.description);
					$("#form-publisher").val(item.owner);
					$("#form-url").val(item.url);
					$("#form-thumbnail").val(thumbnail);
					$("#thumbnail-preview").attr("src",thumbnail);
				}
				else{
					$("#item-error").show();
				}
			},function(){
				$("#item-error").show();
			});
		}

		function addApplicaton()
		{
			if(errorCheck()){
				var attr = {
					Name: $("#form-name").val(),
					Description: $("#form-description").val(),
					Publisher: $("#form-publisher").val(),
					Story_URL: $("#form-url").val(),
					Image_URL: $("#form-thumbnail").val(),
					TemplateText: $("#form-template").val()
				};

				var app = new Graphic(_location,null,attr);
				console.log(app);

				$(".upload-message").hide();
				$(".upload-message.sync").show();

				_storyLayer.applyEdits([app]).then(function(result){
					var error = false;
					array.forEach(result,function(r){
						if (!r.success){
							error = true;
							console.log(r.error);
						}
					});
					if(error){
						$(".upload-message").hide();
						$(".upload-message.error").show();
					}
					else{
						$(".upload-message").hide();
						$(".upload-message.success").show();
					}
				},function(){
					$(".upload-message").hide();
					$(".upload-message.error").show();
				});
			}
		}

		function editApplicaton()
		{
			if(errorCheck()){
				var attr = {
					OBJECTID: _tempGraphic.attributes.OBJECTID,
					Name: $("#form-name").val(),
					Description: $("#form-description").val(),
					Publisher: $("#form-publisher").val(),
					Story_URL: $("#form-url").val(),
					Image_URL: $("#form-thumbnail").val(),
					TemplateText: $("#form-template").val()
				};

				var app = new Graphic(_location,null,attr);

				$(".edit-message").hide();
				$(".delete-message").hide();
				$(".edit-message.sync").show();

				_storyLayer.applyEdits(null,[app]).then(function(result){
					var error = false;
					array.forEach(result,function(r){
						if (!r.success){
							error = true;
							console.log(r.error);
						}
					});
					if(error){
						$(".edit-message").hide();
						$(".edit-message.error").show();
					}
					else{
						$(".edit-message").hide();
						$(".edit-message.success").show();
					}
				},function(){
					$(".edit-message").hide();
					$(".edit-message.error").show();
				});
			}
		}

		function deleteApplicaton()
		{
			if(confirm("Are you sure you want to delete this application from the World of Story Maps?")){

				$(".edit-message").hide();
				$(".delete-message").hide();
				$(".delete-message.sync").show();

				_storyLayer.applyEdits(null,null,[_tempGraphic]).then(function(result){
					var error = false;
					array.forEach(result,function(r){
						if (!r.success){
							error = true;
							console.log(r.error);
						}
					});
					if(error){
						$(".delete-message").hide();
						$(".delete-message.error").show();
					}
					else{
						$(".delete-message").hide();
						$(".delete-message.success").show();
					}
				},function(){
					$(".delete-message").hide();
					$(".delete-message.error").show();
				});
			}
		}

		function errorCheck()
		{
			var noErrors = true;

			if ($("#form-name").val() !== ""){
				$("#name-error").hide();
			}
			else{
				$("#name-error").show();
				noErrors = false;
			}

			if ($("#form-description").val() !== ""){
				$("#description-error").hide();
			}
			else{
				$("#description-error").show();
				noErrors = false;
			}

			if ($("#form-publisher").val() !== ""){
				$("#publisher-error").hide();
			}
			else{
				$("#publisher-error").show();
				noErrors = false;
			}

			if ($("#form-url").val() !== ""){
				$("#url-error").hide();
			}
			else{
				$("#url-error").show();
				noErrors = false;
			}

			if ($("#form-thumbnail").val() !== ""){
				$("#thumbnail-error").hide();
			}
			else{
				$("#thumbnail-error").show();
				noErrors = false;
			}


			return noErrors;
		}

		return {
			init: init
		};
});