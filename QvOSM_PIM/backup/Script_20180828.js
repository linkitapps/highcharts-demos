'use strict'
var ExName = "QvOSM_PIM";
var QvOSM_exUrl = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/"+ExName+"/";

var $target;
var cqv;
var $_VAR = {};
var uId;
var incidentLayer;
var weatherLayer;
var weatherIcons = [];
var ol;
var qvdoc = Qv.GetCurrentDocument();
var QvOSM_PVM_MAP;
var MapTypeGroup = {};
var aniFea = [];
var QvOSM_PVM_Opt = {};
var mapDataType;
var mapAniObj = null;

var broken_aniarr=[];
var incidentLabel = false;
var incidentLabelC = incidentLabel;
var oldZoom = 3;
var incidentZoom=1;
var incidentLabelOverlay=[];
var incidentFeaturelist=[];
/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

var defMap = "layersMb2";

var vNEWS;
var vNEWS_ONOFF_OBJ;
var vNEWS_ONOFF;
var vEXCEPT;
var vEXCEPTION_ONOFF_OBJ;
var vEXCEPTION_ONOFF;
var vMAP;
var vTIC;
var vNEWSICON;

var oldMAPTYPE;
var vMAPTYPE;
var vTicker;
var vNewsIcon;

var vNEWSGRID;

var NEWS_GRID_EVENT_TIM;
var EXCEPT_GRID_EVENT_TIM;

var incidentData = [];
var ticker_incidentData = [];
var news_incidentData = [];
var except_incidentData = [];

var vTYPHOON;
var vTYPHOON_DATA_ARR = new Array();
var TYPHOON_ICON_ARR = new Array();
var typhooniconlayerlist = [];

var vSHOW_TYPHOON;
var vSHOW_TYPHOON_YN = "OFF";

var vSHOW_WEATHER;
var vSHOW_WEATHER_YN = "OFF";

var LAYER_OBJ = {};



var QvOSM_PVM_Design_Opt = JSON.parse('{"typhoon":{"50knot":{"color":"rgba(225, 30, 30, 0.4)"},"34knot":{"color":"rgba(30, 30, 225, 0.1)"},"line":{"color":"rgba(225, 50, 50, 0.9)","width":5}}}');


var IsChkCnt = 0;


function showgridpopup(event,$curr_data){
	
	
   var _x = event.pageX + 50;
   var _y = event.pageY + 50; 
   
   
   if($(window).width()<_x+$("#detail_pointPopup").width()) _x = _x - $("#detail_pointPopup").width() - 100;
   if($(window).height()<_y+250) _y = _y - 250 - 50;  
	
   $("#detail_pointPopup .ol-popup-title").attr("type",$curr_data["type"]);
	
	
	if($curr_data["type"]=="news"){ //news popup 최초 그리는 부분
		
		$("#detail_pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm"]);
		$("#detail_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm"]);
		
		var str = "<table style='width:580px;'>"
			+"<tr>"
				+"<td>"
					+"<div class='occur_dt' style='float:left;'></div>"
					+"<div class='location_icon' style='float:right;'><img style='height:20px;' src='"+QvOSM_exUrl+"icon/location_50.png' /></div>"
					+"<div class='location' style='float:right;'></div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"<div class='valid_dt'></div>"
				+"</td>"
			+"</tr>"			
			+"<tr>"
				+"<td>"
					+"<div class='source'></div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"</br>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"<div class='title'></div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"</br>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
				+"<div class='cont'></div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"<div class='container_cnt'></div>"
				+"</td>"
			+"</tr>"
		+"</table>";
		
		
		$("#detail_pointPopup #popup-content").html(str);
		
		var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
		var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
		$("#detail_pointPopup #popup-content .occur_dt").html("Created on : "+ocdt);
		$("#detail_pointPopup #popup-content .location").html($curr_data["loc_nm"]);
		$("#detail_pointPopup #popup-content .title").html($curr_data["title"]);
		$("#detail_pointPopup #popup-content .source").html("Source: "+$curr_data["source"]);
		$("#detail_pointPopup #popup-content .valid_dt").html("Valid until: "+vdt);
		
		
		var $contents_arr = $curr_data["cont"].split("[read more](");
		console.log($contents_arr);
		
		var $contents = $contents_arr[0];
		var $read_more = "";
		try{
			if($contents_arr[1]!=null){
				var $url = $contents_arr[1].substr(0,$contents_arr[1].length-1);
				$read_more = "<a href='"+$url+"' target=_blank>[read more]</a>";
			}
		}catch(e){
			
		}
		
		$("#detail_pointPopup #popup-content .cont").html($contents+$read_more);
		
	}else{
		
		$("#detail_pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm4"]);
		$("#detail_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm4"]);
		
		var str = "<table style='width:580px;'>"
			+"<tr>"
				+"<td>"
					+"<div class='occur_dt' style='float:left;'></div>"
					+"<div class='location' style='float:right;font-weight:bold;'></div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"</br>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"<div class='title'></div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"<div class='container_cnt'></div>"
				+"</td>"
			+"</tr>"
			/*
			+"<tr>"
				+"<td>"
					+"<div class='vessel_nm'></div>"
				+"</td>"
			+"</tr>"
			*/
			+"<tr>"
				+"<td>"
					+"</br>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td><div style='color:#006ca2;font-weight:bold;'>Reason(s)</div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"<div class='excp_nm4'></div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"</br>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td><div style='color:#006ca2;font-weight:bold;'>Reason Detail</div>"
					+"<div class='reason'></div>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td>"
					+"</br>"
				+"</td>"
			+"</tr>"
			+"<tr>"
				+"<td><div style='color:#006ca2;font-weight:bold;'>Action & Prevention Measure</div>"
					+"<div class='action'></div>"
				+"</td>"
			+"</tr>"
		+"</table>";
		
		
		$("#detail_pointPopup #popup-content").html(str);
		
		var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
		$("#detail_pointPopup #popup-content .occur_dt").html(ocdt);
		$("#detail_pointPopup #popup-content .location").html($curr_data["loc_nm2"]+" ("+$curr_data["step"]+")");
		$("#detail_pointPopup #popup-content .title").html($curr_data["title"]);
		//$("#detail_pointPopup #popup-content .vessel_nm").html($curr_data["vessel_nm"]);
		$("#detail_pointPopup #popup-content .excp_nm4").html($curr_data["excp_nm4"]);
		$("#detail_pointPopup #popup-content .reason").html(($curr_data["reason"] ? $curr_data["reason"] : ""));
		$("#detail_pointPopup #popup-content .action").html(($curr_data["action"] ? $curr_data["action"] : ""));
		$("#detail_pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially affected : "+$curr_data["container_cnt"]+" container(s)" : ""));
			
			
	}
	
	
	
	$("#detail_pointPopup").css("left",_x+"px");
	$("#detail_pointPopup").css("top",_y+"px");
	
	$("#detail_pointPopup").css("display","inline-table");
};


function findHeaderNm(str){
	var ret = "";
	switch(str){
	case "Type Group":
		ret = "incident_type1";
		break;
	case "Type":
		ret = "incident_type2";
		break;
	case "Location":
		ret = "loc_nm3";
		break;
	case "Subject":
		ret = "title";
		break;
	case "Date / Time":
		ret = "occur_dt";
		break;
	case "Date":
		ret = "occur_dt";
		break;
	case "Reason Detail":
		ret = "reason";
		break;
	}
	
	return ret;
}





var setGridPopup = function($ID,type_data){
	
	setTimeout(function(){
		
		
		
		
		//header
		var header_arr = new Array();
		$.each($(".Document_"+$ID+" div[page]:eq(3) div[unselectable='on'][title][style*='left: 0px']"),function(){
			
			header_arr.push(findHeaderNm($(this).attr("title")));
			header_arr.push(findHeaderNm($(this).next().attr("title")));
			header_arr.push(findHeaderNm($(this).next().next().attr("title")));
			header_arr.push(findHeaderNm($(this).next().next().next().attr("title")));
			header_arr.push(findHeaderNm($(this).next().next().next().next().attr("title")));
			
		});
		
		//console.log(header_arr);
		
		//rows
		$.each($(".Document_"+$ID+" div[page]:eq(4) div[unselectable='on'][title][style*='left: 0px']"),function(){

			var $_target = $(this);
			
			var obj = {};

			obj[header_arr[0]]	=	$(this).attr("title");
			obj[header_arr[1]]	=	$(this).next().attr("title");
			obj[header_arr[2]]	=	$(this).next().next().attr("title");
			obj[header_arr[3]]	=	$(this).next().next().next().attr("title");
			obj[header_arr[4]]	=	$(this).next().next().next().next().attr("title");
			
			//console.log(obj);
			
			
			
			$.each(type_data,function($k,$data){
				/*
				console.log(header_arr[0]+" : "+$data[header_arr[0]]+" : "+obj[header_arr[0]]+" : "+($data[header_arr[0]] == obj[header_arr[0]]));
				console.log(header_arr[1]+" : "+$data[header_arr[1]]+" : "+obj[header_arr[1]]+" : "+($data[header_arr[1]] == obj[header_arr[1]]));
				console.log(header_arr[2]+" : "+$data[header_arr[2]]+" : "+obj[header_arr[2]]+" : "+($data[header_arr[2]] == obj[header_arr[2]]));
				console.log(header_arr[3]+" : "+$data[header_arr[3]]+" : "+obj[header_arr[3]]+" : "+($data[header_arr[3]] == obj[header_arr[3]]));
				console.log(header_arr[4]+" : "+$data[header_arr[4]]+" : "+obj[header_arr[4]]+" : "+($data[header_arr[4]] == obj[header_arr[4]]));
				*/
				if($data[header_arr[0]] == obj[header_arr[0]]
				&& $data[header_arr[1]] == obj[header_arr[1]]
				&& $data[header_arr[2]] == obj[header_arr[2]]
				&& $data[header_arr[3]] == obj[header_arr[3]]
				&& $data[header_arr[4]] == obj[header_arr[4]]){
					$($_target).attr("data",JSON.stringify($data));
					return false;
				}
			});
			
			
			//첫번째
			$(this).attr("def",1).unbind("mouseover").bind("mouseover",function(event){
				if($($_target).attr("data")) showgridpopup(event,JSON.parse($($_target).attr("data")));
			});
			
			$(this).unbind("mouseout").bind("mouseout",function(){
				$("#detail_pointPopup").hide();
			});
			
			//두번째
			$(this).next().attr("def",1).unbind("mouseover").bind("mouseover",function(event){
				if($($_target).attr("data")) showgridpopup(event,JSON.parse($($_target).attr("data")));								
			});			
			
			$(this).next().unbind("mouseout").bind("mouseout",function(){
				$("#detail_pointPopup").hide();
			});

			
			//세번째
			$(this).next().next().attr("def",1).unbind("mouseover").bind("mouseover",function(event){
				if($($_target).attr("data")) showgridpopup(event,JSON.parse($($_target).attr("data")));								
			});	

			$(this).next().next().unbind("mouseout").bind("mouseout",function(){
				$("#detail_pointPopup").hide();
			});
			
			
			//네번째
			$(this).next().next().next().attr("def",1).unbind("mouseover").bind("mouseover",function(event){
				if($($_target).attr("data")) showgridpopup(event,JSON.parse($($_target).attr("data")));								
			});	
			
			
			$(this).next().next().next().unbind("mouseout").bind("mouseout",function(){
				$("#detail_pointPopup").hide();
			});
			
			//다섯번째
			$(this).next().next().next().next().attr("def",1).unbind("mouseover").bind("mouseover",function(event){
				if($($_target).attr("data")) showgridpopup(event,JSON.parse($($_target).attr("data")));								
			});	
			
			$(this).next().next().next().next().unbind("mouseout").bind("mouseout",function(){
				$("#detail_pointPopup").hide();
			});
			
			
		});		
		
		
		setTimeout(function(){
			if($(".Document_"+$ID+" div[page]:eq(4) div[unselectable='on'][title] .injected").length==$(".Document_"+$ID+" div[page]:eq(4) div[unselectable='on'][title][def='1']").length) return;
			
			setGridPopup($ID,type_data);
			console.log("setGridPopup work");
		},1500);		
		
	},1200);
	
	

}






var zIndex = 0;
var drawLine = function(id, obj, route_arr, width, zoomlevel, linecolor, linestyle, descript, offsetX, offsetY, textAlign, fontstyle, fontcolor){
	
	if(LAYER_OBJ[id]==null){
		LAYER_OBJ[id] = new Array();
	}
	
	var Layer;
	
	
	
	
	//zoom level에 따른 거리를 수동으로 정리
	var arr = new Array(0, 0.0375, 0.075, 0.2, 0.375, 0.575, 1, 1.8, 3.7, 7, 14.15, 28.3, 55.5, 111, 222, 460, 900, 900);

	var nwidth = zoomlevel==null ?	width	:	arr[zoomlevel]*width*2;//threshold값은 한쪽의 폭을 얘기하므로 2배를 해줘야 한다
	
	var crdnt2 = route_arr; 

	
	var geojsonObject2 = {
			'type': 'FeatureCollection',
			'crs': {
				'type': 'name',
				'properties': {
					'name': 'EPSG:4326'
				}
			},
			'features': []
		};
	
	
	var geoFeatures2 = (new ol.format.GeoJSON()).readFeatures(geojsonObject2);
	
	
	
	var geoStyle_obj;
	
	var style_obj;
	switch(linestyle){
	case "text":
		geoStyle_obj = new ol.geom.Point(crdnt2);
		
		style_obj = 
			new ol.style.Style({
		        text: new ol.style.Text({
		            font: (fontstyle ? fontstyle : ''+nwidth+'px Calibri,sans-serif'),
		            text: descript ? descript+"" : "",
					textAlign: (textAlign ? textAlign : "left"),
					offsetY: (offsetY ? offsetY : 0),
					offsetX: (offsetX ? offsetX : 10),
		            overflow: true,
		            fill: new ol.style.Fill({
		              color: linecolor
		            })
		        })
			});

		break;
	case "polygon":
						
		geoStyle_obj = new ol.geom.Polygon(crdnt2);
		
		
		var feature = {'type': 'Feature',
				 'geometry': {
						'type': 'Polygon',
						'coordinates': obj["polygon"]
						}
				};
		
		geojsonObject2["features"] = [feature];
		
		
		
		var ff;
		//회전
		for(ff in geoFeatures2){
			geoFeatures2[ff].getGeometry().rotate(45 * Math.PI / 180, ol.proj.fromLonLat(obj["ce"]));
		}
		
		
		
		style_obj = 
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: linecolor,
					width: 1
				}),
				fill: new ol.style.Fill({
					color: linecolor
				})
			});
		
		
		break;				
	case "icon":
		geoStyle_obj = new ol.geom.Point(crdnt2);
		
		style_obj = 
			new ol.style.Style({
				image: new ol.style.Icon({
					src: QvOSM_exUrl+'icon/'+obj["icon"]+'.png'
				}),
		        text: new ol.style.Text({
		            font: '14px Calibri,sans-serif',
		            text: descript ? descript+"" : "",
            		textAlign: "left",
					offsetY: 15,
					offsetX: 10,
		            overflow: true,
		            fill: new ol.style.Fill({
		              color: linecolor
		            })
		        })
			});
		break;
	case "point":
		geoStyle_obj = new ol.geom.MultiLineString([[crdnt2,crdnt2]]);
		
		style_obj = 
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: linecolor,
					width: nwidth
				}),
				fill: new ol.style.Fill({
					color: linecolor
				}),
		        text: new ol.style.Text({
		        	font: (fontstyle ? fontstyle : ''+nwidth+'px Calibri,sans-serif'),
		            text: descript ? descript+"" : "",
					textAlign: (textAlign ? textAlign : "left"),
					offsetY: (offsetY ? offsetY : 0),
					offsetX: (offsetX ? offsetX : 10),
		            overflow: true,
		            fill: new ol.style.Fill({
		              color: (fontcolor ? fontcolor : 'rgba(255, 255, 255, 0.5)')
		            })
		        })
			});
		break;
	case "line":
		geoStyle_obj = new ol.geom.MultiLineString(crdnt2);
		
		style_obj = 
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: linecolor,
					width: nwidth
				}),
				fill: new ol.style.Fill({
					color: linecolor
				}),
		        text: new ol.style.Text({
		            font: '10px Calibri,sans-serif',
		            text: descript ? descript+"" : "",
					offsetY: -5,
					offsetX: 0,
		            overflow: true,
		            fill: new ol.style.Fill({
		              color: 'rgba(255, 255, 255, 0.5)'
		            })
		        })
			});
		break;
	case "dash":
		geoStyle_obj = new ol.geom.MultiLineString(crdnt2);
		
		style_obj = 
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: linecolor,
					//lineCap : "square",
					lineCap : "round",
					lineDash: [1, nwidth*1.6],
					width: nwidth
				}),
				fill: new ol.style.Fill({
					color: linecolor
				}),
		        text: new ol.style.Text({
		            font: '10px Calibri,sans-serif',
		            text: descript ? descript+"" : "",
					offsetY: -5,
					offsetX: 0,
		            overflow: true,
		            fill: new ol.style.Fill({
		              color: 'rgba(255, 255, 255, 0.5)'
		            })
		        })
			});
		break;
	}
	

						
	
	
	
	
	
	var lLines2 = [];
	var lSource2 = new ol.source.Vector({
		features: geoFeatures2
	});	
	
	
	
	var lFea2 = new ol.Feature({
			  geometry: geoStyle_obj,
			  name: obj["key"]
		  });
	

	style_obj.setZIndex(zIndex++);
	
	lFea2.set("ref",obj);
	lFea2.set("style", style_obj);
	

	
	
	
	lLines2.push(lFea2);
	lSource2.addFeatures(lLines2);
	

	
	
	//Layer = QvOSM_PVM_MAP.removeLayer(Layer);
	
	
	Layer = new ol.layer.Vector({
		source: lSource2,
		style: function(feature){
			return feature.get("style");
		}
	});
	
	
	
	


	QvOSM_PVM_MAP.addLayer(Layer);	
	
	
	
	LAYER_OBJ[id].push(Layer);
	
	
	return Layer;
};
		








var firstCenter = [];


//console.log(rows);	
//설정값 변수
var zoom = "3";
var center = [127,38];
var typhoonFlag = false;
var aniFlag = false;
var aniInterval = 10;


var defMove = "fly";

var offy = 15;


Qva.LoadCSS(QvOSM_exUrl+"css/Style.css");
Qva.LoadCSS(QvOSM_exUrl+"css/ol.css");
Qva.LoadCSS(QvOSM_exUrl+"css/bootstrap.min.css");

Qva.LoadScript(QvOSM_exUrl+"js/jquery.marquee.js", function(){
	Qva.LoadScript(QvOSM_exUrl+"js/d3.v3.min.js", function(){
		Qva.LoadScript(QvOSM_exUrl+"js/ol.js", function(){
			ol=ol;
			
			var unique = function(array) {
				var result = [];
				$.each(array, function(index, element) {
					if ($.inArray(element, result) == -1) {
						result.push(element);
					}
				});
				return result;
			}
			
			var createIncidentIcon = function(icon, rotation, scale, name,fontstyle,fontcolor) {
				var _font = fontstyle==null ? '10px Calibri,sans-serif' : fontstyle;
				
				var obj = {
					image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
						scale: scale ? scale : 1,
						src: QvOSM_exUrl+'icon/'+icon+'.png',
						rotation : 0//rotation ? rotation * Math.PI / 180 : 0
					})),
			        text: new ol.style.Text({
			            font: fontstyle,
			            text: name ? name+"" : "",
						offsetY: -5,
						offsetX: 0,
			            overflow: true,
			            fill: new ol.style.Fill({
			              color: fontcolor ? fontcolor : '#000'
			            })
			        })
				};
				
				var ret = new ol.style.Style(obj);
				ret.setZIndex(zIndex++);
				
				return ret;
			}
	
			
			
			function makeIncidentLabel(feature){
					
					
					var popupOpt = {};
					var viewtxt=feature.get("tyKey");
					var point = feature.get('point1');
					
				
					
					//console.log(feature);
					if(point){
						if(point[0]<0){
							point[0]=point[0]+360;
						}
						point=ol.proj.fromLonLat(point);
						
						var el = document.createElement("div");
						el.className = "incident_name_box";
						el.style.color = "#000";
						el.innerHTML = viewtxt;
						el.setAttribute("target", feature.get('tyKey'));
						popupOpt = {
							element: el,
							//offset: [30, 0],
							offset: [-60, 30],
							position: point,
							positioning : "center-left",
							autoPan: false
						}
						
						
					
					}
					var overlay= new ol.Overlay(popupOpt)
					//console,log(overlay);
					incidentLabelOverlay.push(overlay);
					return overlay;
			}
			function flash(feature,number) {
				var start = new Date().getTime();
				var listenerKey;
				var duration = 10000;
				
				
				
				function animate(incident) {
					var vectorContext = incident.vectorContext;
				    var frameState = incident.frameState;
					var flashGeom = feature.getGeometry().clone();
					var elapsed = frameState.time - start;
					var elapsedRatio = elapsed / duration;
					// radius will be 5 at start and 30 at end.
					var radius = ol.easing.easeOut(elapsedRatio) * 10 + 5;
					var opacity = ol.easing.easeOut(1 - elapsedRatio);
					var style
					if(true){
						style = new ol.style.Style({
							image: new ol.style.Circle({
								radius: radius,
								snapToPixel: false,
								stroke: new ol.style.Stroke({
									color: 'rgba(255, 0, 0, ' + opacity + ')',
									width: 0.25 + opacity
								})
							})
						});
							  
					}else style = new ol.style.Style();
							
					//style.setZIndex(100000);
					vectorContext.setStyle(style);
					vectorContext.drawGeometry(flashGeom);
					if (elapsed > duration) {
						ol.Observable.unByKey(listenerKey);
								
					}
					 // tell OpenLayers to continue postcompose animation
							  
					QvOSM_PVM_MAP.render();
							  
				}
				listenerKey = QvOSM_PVM_MAP.on('postcompose', animate);
				broken_aniarr[number]=setTimeout(function(){flash(feature,number)},10000);
			}
			
			
			
			
			var drawMAP = function(){
				
				
				QvOSM_PVM_Opt = {
						"zoom":zoom,
						"center":center
				};
				
				
				
				if(mapAniObj != null){
					clearInterval(mapAniObj);
					mapAniObj = null;
				}
				var frmW = $target.GetWidth();
				var frmH = $target.GetHeight();

				incidentLabelC = incidentLabel;
				
				var htmlString = ""; 
				htmlString += '<div id="pointPopup" class="ol-popup" idx="-1" style="display:none;"><div class="ol-popup-title"><div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div><div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"><span id="btn_prev">◀</span><font id="disp_step" style="margin-left:2px;margin-right:2px;font-weight:normal;"></font><span id="btn_next">▶</span></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
				'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
				  '</div>';
				htmlString += '<div id="tooltip"></div>';
				
				$target.Element.innerHTML = htmlString;

				var detail_pointPopup = '<div id="detail_pointPopup" class="ol-popup incident" idx="-1" style="z-index:99;background-color:none !important;position:absolute;left:0px;top:0px;height:10px;display:none;"><div class="ol-popup-title"><div class="ol-popup-headtitle-content"></div><div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
				'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
				  '</div>';	
				$("#detail_pointPopup").remove();
				$("body").append(detail_pointPopup);
				

				console.log("vTicker :: "+vTicker);
				
				
				var ticker_pointPopup = '<div id="ticker_pointPopup" class="ol-popup" idx="-1" style="display:none;"><div class="ol-popup-title"><div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div><div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"><span id="btn_prev">◀</span><font id="disp_step" style="margin-left:2px;margin-right:2px;font-weight:normal;"></font><span id="btn_next">▶</span></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
						'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
						  '</div>';
				$("#ticker_pointPopup").remove();
				$("body").append(ticker_pointPopup);				
				
				
				
				
				
				
				$target.framecreated = true;	
				
				
				
				//맵삭제
				if(QvOSM_PVM_MAP) QvOSM_PVM_MAP.setLayerGroup(new ol.layer.Group());
				QvOSM_PVM_MAP = null;
				
				//맵타입 설정
				MapTypeGroup = [];
				
				if(vMAPTYPE != null){
					switch(vMAPTYPE.toLowerCase()) {
					case "satellite":
						defMap = "layersTn";
						break;
					case "dark":
						defMap = "layersMb";
						break;
					case "basic":
						defMap = "layersMb2";
						break;
					case "lightblue":
						defMap = "layersOSM";
						break;
					default:
						defMap = "layersMb2";
					}
				}	
				

				//OSM
				MapTypeGroup.push(
					new ol.layer.Tile({
						visible: (defMap=="layersOSM" ? true : false),
						source: new ol.source.XYZ({
							tileSize: [512, 512],
//							url: 'https://api.mapbox.com/styles/v1/seungok/ciov2x7gj003qdpnjymn2em34/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
							url: 'https://api.mapbox.com/styles/v1/yhy878/cj0nkfsv7004c2slfyernovxx/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWh5ODc4IiwiYSI6ImNpam04Mm5jaTAwOWJ0aG01d2hlb2FpYXEifQ.kzx9H8IeBBk_zCvvF91Rtg'
						})
					})
				);
				//Tn
				MapTypeGroup.push(
					new ol.layer.Tile({
						visible: (defMap=="layersTn" ? true : false),
						source: new ol.source.XYZ({
							tileSize: [512, 512],
							url: 'https://api.mapbox.com/styles/v1/seungok/ciousf1zl003sdqnfpcpfj19r/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
						})
					})
				);
				//Mb
				MapTypeGroup.push(
					new ol.layer.Tile({
						visible: (defMap=="layersMb" ? true : false),
						source: new ol.source.XYZ({
							tileSize: [512, 512],
							url: 'https://api.mapbox.com/styles/v1/seungok/cip7yoxzy0029dnm5n040qd0q/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
						})
					})
				);
				//Mb2
				MapTypeGroup.push(
					new ol.layer.Tile({
						visible: (defMap=="layersMb2" ? true : false),
						source: new ol.source.XYZ({
							tileSize: [512, 512],
							url: 'https://api.mapbox.com/styles/v1/seungok/ciouskftw003jcpnn296ackea/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
						})
					})
				);
				
				

				
				var mapCenter;
				
				try{
					mapCenter = QvOSM_PVM_Opt["center"];
				}catch(e){
					console.log(e);
				}

				if(mapCenter){
					mapCenter = ol.proj.fromLonLat([parseFloat(mapCenter[0]),parseFloat(mapCenter[1])]);
				}else{
					mapCenter = ol.proj.fromLonLat([127,38]);
				}

				if(firstCenter.length > 0 && aniFlag == true){
					mapCenter = ol.proj.fromLonLat(firstCenter);
				}
				
				
				
				//전체 맵 그리기
				try{
					QvOSM_PVM_MAP = new ol.Map({
						layers: MapTypeGroup,
						controls: ol.control.defaults().extend([
							//new ol.control.FullScreen(),
							//new ol.control.OverviewMap(),
							//new ol.control.ScaleLine(),
							new ol.control.Zoom(),
							//new ol.control.ZoomSlider()
						]),
						interactions : ol.interaction.defaults({doubleClickZoom :false}),
						//renderer: 'canvas',
						//loadTilesWhileAnimating: true,
						target: uId,
						view: new ol.View({
						  center:mapCenter,
						  zoom: QvOSM_PVM_Opt["zoom"]||3,
						  minZoom: 2,
						  maxZoom: 17
						})

					});
				}catch(e){
					console.log(e);
				}
				
				
				
				//QvOSM_PVM_MAP.removeControl(ol.control.Zoom);
				$("#marker").html("");
				QvOSM_PVM_MAP.getOverlays().clear();
			
				
				var pointPopup = new ol.Overlay({
					element: document.getElementById("pointPopup"),
					autoPan: true,
					autoPanAnimation: {
						duration: 250
					 }
				});

				QvOSM_PVM_MAP.addOverlay(pointPopup);
				
				var pointPopupContent = document.getElementById('popup-content');
				var pointPopupCloser = document.getElementById('popup-closer');
				
				pointPopupCloser.onclick = function() {
					
					pointPopup.setPosition(undefined);
					pointPopupCloser.blur();
					$("#pointPopup").hide();
					
					select.getFeatures().clear();
					return false;
				};
				
				
				
				/* 선택 인터랙션 */
				var select = new ol.interaction.Select({
					style: function(feature) {
						return feature.get('sel_style') || feature.get('style');
					}
				});
				
				//QvOSM_PVM_MAP.getInteractions().extend([select]);
				QvOSM_PVM_MAP.addInteraction(select);
				
				
				
				QvOSM_PVM_MAP.un("dblclick");
				QvOSM_PVM_MAP.on("dblclick", function (evt) {
					var info = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
						select.getFeatures().push(feature);
						return feature;
					});
					if(info!=null && info.get("type")){
						try{
							//console.log(info);
							Qv.GetDocument("").SetVariable("vTYPE",info.get("type"));
							Qv.GetDocument("").SetVariable("vLNGTD",info.get("lngtd"));
							Qv.GetDocument("").SetVariable("vLTITDE",info.get("ltitde"));
							Qv.GetDocument("").SetVariable("vINCIDENT_TYPE1",info.get("incident_type1"));
							Qv.GetDocument("").SetVariable("vINCIDENT_TYPE2",info.get("incident_type2"));
						}catch(e){
							console.log("dblclick exception :: ");
							console.log(e);
						}
						
					}

					
					
				});
				
				
				
				
				//싱슬 클릭시 이벤트t
				QvOSM_PVM_MAP.un("singleclick");
				QvOSM_PVM_MAP.on("singleclick", function (evt) {
					
					
					
					select.getFeatures().clear();
					$("#pointPopup").attr("data","");
					$("#pointPopup").height("");
					
					//draggable에 의한 위치 초기화
					$("#pointPopup").attr("style","");
					
					var coordinate = evt.coordinate;
					console.log(coordinate);
					
					var info = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
						select.getFeatures().push(feature);
						
						if(feature.get("type")){
							//console.log(feature);
							//$(".ol-popup-headtitle-content").html("<img style='width:20px;' src='"+QvOSM_exUrl+"icon/ship.png"+"'/>");
							
							$("#pointPopup").addClass("incident");
							
						}else{
							$("#pointPopup").removeClass("incident");
						}
						
						return feature;
						
					});
					
					
					if(info!=null && (info.get("news_arr")!=null || info.get("except_arr")!=null) && (info.get("news_arr").length>0 || info.get("except_arr").length>0)){

						var obj = {
								type		: info.get("type"),
								lngtd		: info.get("lngtd"),
								ltitde		: info.get("ltitde"),
								incident_type1		: info.get("incident_type1"),
								incident_type2		: info.get("incident_type2"),
								news_arr	: info.get("news_arr") ? info.get("news_arr") : new Array(),
								except_arr	: info.get("except_arr") ? info.get("except_arr") : new Array()
						}
						
						$("#pointPopup").attr("type","");
						$("#pointPopup .ol-popup-title").attr("type","");
						$("#pointPopup").attr("idx","-1");
						$("#pointPopup .ol-popup-headtitle-content").attr("title","");
						$("#pointPopup .ol-popup-headtitle-content").html("");
						$("#pointPopup #disp_step").html("");
						$("#pointPopup #popup-content").empty();
						
						function btn_next($data){
							console.log($data);
							
							
							var $type = $("#pointPopup").attr("type")!="" ? $("#pointPopup").attr("type") : $data["type"];
							var $idx = $("#pointPopup").attr("idx");
							
							var $next_idx = parseInt($idx) + 1;
							var $direction = $("#pointPopup").attr("prev")==1 ? "prev" : "next"; 
							
							var $count = 0;
							var $totalcount = $data["news_arr"].length + $data["except_arr"].length;
							
							if($direction=="prev"){
								if($type=="news" && $next_idx == 1){
									console.log("news prev");
									
									if($data["except_arr"].length>0){
										$type = "except";
										$idx = $data["except_arr"].length-1;
										$next_idx = $idx;
									}else{
										$idx = $data["news_arr"].length-1;
										$next_idx = $idx;
									}
								}else if($type=="except" && $next_idx == 1){
									console.log("except prev");
									
									if($data["news_arr"].length>0){
										$type = "news";
										$idx = $data["news_arr"].length-1;
										$next_idx = $idx;
									}else{
										$idx = $data["except_arr"].length-1;
										$next_idx = $idx;
									}
								}else{
									$next_idx = parseInt($idx) - 1;
								}
								
								console.log("direction :: "+$direction+" , "+$("#pointPopup").attr("prev"));
								console.log("news_arr length :: "+$data["news_arr"].length);
								console.log("except_arr length :: "+$data["except_arr"].length);
							}else{
								if($type=="news" && $next_idx == $data["news_arr"].length){
									console.log("news next");
									
									if($data["except_arr"].length>0){
										$type = "except";
									}
									$idx = 0;
									$next_idx = 0;

								}else if($type=="except" && $next_idx == $data["except_arr"].length){
									console.log("except next");
									
									if($data["news_arr"].length>0){
										$type = "news";
									}
									$idx = 0;
									$next_idx = 0;
									
								}else{
									$next_idx = parseInt($idx) + 1;
								}
							}
							console.log("type :: "+$type);
							console.log("next_idx :: "+$next_idx);
							
							
							
							
							//초기 팝업 출력일 경우
							if($idx==-1){
								$idx = 0;
								$next_idx = 0;
							}
							if($type=="mixed"){
								$type = "news";
							}
							
							var $curr_idx = $type=="except" ? ($data["news_arr"].length+$next_idx+1) : ($next_idx+1);
							
							
							var $curr_data;
							if($type=="news"){
								$curr_data = $data["news_arr"][$next_idx];
								$count = $data["news_arr"].length;
							}else{
								$curr_data = $data["except_arr"][$next_idx];
								$count = $data["except_arr"].length;
							}
							
							
							$("#pointPopup").attr("idx",$next_idx);
							$("#pointPopup").attr("totalcount",$totalcount);
							if($totalcount>1) $("#pointPopup #disp_step").html($curr_idx+" of "+$totalcount); else $("#pointPopup #disp_step").html("");
							
							console.log("$idx :: "+$idx);
							console.log("$curr_idx :: "+$curr_idx);
							console.log("$totalcount :: "+$totalcount);
							
							
							if($type=="news"){ //news popup 최초 그리는 부분
								
								$("#pointPopup").attr("type",$curr_data["type"]);
								$("#pointPopup .ol-popup-title").attr("type",$curr_data["type"]);
								$("#pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm"]);
								$("#pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm"]);
								
								var str = "<table style='width:580px;'>"
									+"<tr>"
										+"<td>"
											+"<div class='occur_dt' style='float:left;'></div>"
											+"<div class='location_icon' style='float:right;'><img style='height:20px;' src='"+QvOSM_exUrl+"icon/location_50.png' /></div>"
											+"<div class='location' style='float:right;'></div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"<div class='valid_dt'></div>"
										+"</td>"
									+"</tr>"									
									+"<tr>"
										+"<td>"
											+"<div class='source'></div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"<div class='container_cnt'></div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"</br>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"<div class='title'></div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"</br>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
										+"<div class='cont'></div>"
										+"</td>"
									+"</tr>"
								+"</table>";
								
								
								$("#pointPopup #popup-content").html(str);
								
								var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
								var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
								$("#pointPopup #popup-content .occur_dt").html("Created on : "+ocdt);
								$("#pointPopup #popup-content .location").html($curr_data["loc_nm"]);
								$("#pointPopup #popup-content .title").html($curr_data["title"]);
								$("#pointPopup #popup-content .source").html("Source : "+$curr_data["source"]);
								$("#pointPopup #popup-content .valid_dt").html("Valid until : "+vdt);
								$("#pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially affected : "+$curr_data["container_cnt"]+" container(s)" : ""));
								
								$("#pointPopup #popup-content .container_cnt").css("cursor","").css("text-decoration","").off("click");
								
								if($curr_data["container_cnt"]>0)
								$("#pointPopup #popup-content .container_cnt").css("cursor","pointer").css("text-decoration","underline").off("click").on("click",function(){
									console.log("=====qlikview popup show===================================");
									console.log($curr_data);
									
									//위치를 오른쪽으로 이동하여 왼쪽에 팝업과 나란히 배치한다. 시작
									$("#pointPopup").height("");
									$("#pointPopup").attr("style","");
									QvOSM_PVM_MAP.getView().setZoom(3);
									pointPopup.setPosition(coordinate);
									//위치를 오른쪽으로 이동하여 왼쪽에 팝업과 나란히 배치한다. 끝
									
									QvOSM_PVM_MAP.getView().setCenter([coordinate[0]-6500000,coordinate[1]+3000000]);
									Qv.GetCurrentDocument().SetVariable("vID",$curr_data["id"]);
									Qv.GetCurrentDocument().SetVariable("vLOC_CD",$curr_data["loc_cd"]);
									console.log("=====qlikview popup show===================================");
								});
								
								var $contents_arr = $curr_data["cont"].split("[read more](");
								console.log($contents_arr);
								
								var $contents = $contents_arr[0];
								var $read_more = "";
								try{
									if($contents_arr[1]!=null){
										var $url = $.trim($contents_arr[1]).substr(0,$contents_arr[1].length-1);
										$read_more = "<a href='"+$url+"' target=_blank>[read more]</a>";
									}
								}catch(e){
									
								}
								
								$("#pointPopup #popup-content .cont").html($contents+$read_more);
								
							}else{
								
								$("#pointPopup").attr("type",$curr_data["type"]);
								$("#pointPopup .ol-popup-title").attr("type",$curr_data["type"]);
								$("#pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm4"]);
								$("#pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm4"]);
								
								var str = "<table style='width:580px;'>"
									+"<tr>"
										+"<td>"
											+"<div class='occur_dt' style='float:left;'></div>"
											+"<div class='location_icon' style='float:right;'><img style='height:20px;' src='"+QvOSM_exUrl+"icon/location_50.png' /></div>"
											+"<div class='location' style='float:right;'></div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"</br>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"<div class='title'></div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"<div class='container_cnt'></div>"
										+"</td>"
									+"</tr>"
									/*
									+"<tr>"
										+"<td>"
											+"<div class='vessel_nm'></div>"
										+"</td>"
									+"</tr>"
									*/
									+"<tr>"
										+"<td>"
											+"</br>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td><div style='color:#006ca2;font-weight:bold;'>Reason(s)</div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"<div class='excp_nm4'></div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"</br>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td><div style='color:#006ca2;font-weight:bold;'>Reason Detail</div>"
											+"<div class='reason'></div>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td>"
											+"</br>"
										+"</td>"
									+"</tr>"
									+"<tr>"
										+"<td><div style='color:#006ca2;font-weight:bold;'>Action & Prevention Measure</div>"
											+"<div class='action'></div>"
										+"</td>"
									+"</tr>"
								+"</table>";
								
								
								$("#pointPopup #popup-content").html(str);
								
								var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
								$("#pointPopup #popup-content .occur_dt").html(ocdt);
								$("#pointPopup #popup-content .location").html($curr_data["loc_nm2"]+" ("+$curr_data["step"]+")");
								$("#pointPopup #popup-content .title").html($curr_data["title"]);
								//$("#pointPopup #popup-content .vessel_nm").html($curr_data["vessel_nm"]);
								$("#pointPopup #popup-content .excp_nm4").html($curr_data["excp_nm4"]);
								$("#pointPopup #popup-content .reason").html(($curr_data["reason"] ? $curr_data["reason"] : ""));
								$("#pointPopup #popup-content .action").html(($curr_data["action"] ? $curr_data["action"] : ""));
								$("#pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially affected : "+$curr_data["container_cnt"]+" container(s)" : ""));
									
									
							}								
							
							$("#pointPopup #btn_next").show();
							$("#pointPopup #btn_prev").show();
							if($totalcount>1){
								$("#pointPopup #btn_next").off("click").on("click",function(){
									$("#pointPopup").attr("prev",0);
									btn_next(obj);
								});
								$("#pointPopup #btn_prev").off("click").on("click",function(){
									$("#pointPopup").attr("prev",1);
									btn_next(obj);
								});
							}else{
								$("#pointPopup #btn_next").hide();
								$("#pointPopup #btn_prev").hide();
							}
							
							
							pointPopup.setPosition(coordinate);
							
							$("#pointPopup").draggable();
							$("#pointPopup").height("");
							$("#pointPopup").show();
							$("#Document_CH03").off("click").on("click",function(){
								$("#pointPopup").hide();
								$("#ticker_pointPopup").hide();
							});
							
						}
						
						
						
						btn_next(obj);

						
						
						
					} else {
						
						$("#popup-closer").trigger("click");
						$("#pointPopup").hide();
						
					}				
					
					
				});
				
				
				// 툴팁
				var overlay = new ol.Overlay({
					element: document.getElementById("tooltip"),
				    positioning: 'bottom-left',
				    offset: [20,20]
				});
				
				overlay.setMap(QvOSM_PVM_MAP);
				
				
				// 툴팁
				QvOSM_PVM_MAP.un("pointermove");
				QvOSM_PVM_MAP.on('pointermove', function(evt) {
					
					var ret = false;
					
					  var feature = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function(feature) {
						    overlay.setPosition(evt.coordinate);
						    
						    if(feature.get("tooltip")!=null){
						    	overlay.getElement().innerHTML = feature.get("tooltip");
						    	if(feature.get("type")){
						    		$("#tooltip").attr("type",feature.get("type"));
						    		ret = true;
						    	}
						    }
						    
						    if(feature.get("popup")!=null){
						    	overlay.getElement().innerHTML = feature.get("popup");
						    	$("#tooltip").attr("type","news");
						    	ret = true;
						    }
						    

						    return feature;
						  });
					  	
						  overlay.getElement().style.display = ret ? 'inline-block' : 'none';
						  document.body.style.cursor = ret ? 'pointer' : '';
				});
				
				
				
				
				
				
				oldMAPTYPE = vMAPTYPE;
				
				
				
			};
			
			
			
			
			
			
			var drawINCIDENT = function(){
				zIndex = 0;
				
				incidentLayer = QvOSM_PVM_MAP.removeLayer(incidentLayer);
				if(incidentData.length>0){
					
					var vIconFeas = [];
					
					//console.log(incidentData.length);
					
					//var incidentDetail = JSON.parse(docObj.GetVariable(0).text);
					$.each(incidentData,function($key,incidentObj){
						var truepoint=incidentObj["pos"];
						var point = ol.proj.fromLonLat(incidentObj["pos"]);
						

						
						var vIconFea = new ol.Feature(new ol.geom.Point(point));
						vIconFea.set('type', incidentObj["type"]);
						vIconFea.set('lngtd', incidentObj["lngtd"]);
						vIconFea.set('ltitde', incidentObj["ltitde"]);
						vIconFea.set('incident_type1', incidentObj["incident_type1"]);
						vIconFea.set('incident_type2', incidentObj["incident_type2"]);
						vIconFea.set('icon', incidentObj["icon"]);
						vIconFea.set('color', incidentObj["color"]);
						vIconFea.set('loc_nm', incidentObj["loc_nm"]);
						vIconFea.set('excp_nm4', incidentObj["excp_nm4"]);
						vIconFea.set('news_arr', incidentObj["news_arr"]);
						vIconFea.set('except_arr', incidentObj["except_arr"]);
						vIconFea.set('total_cnt', incidentObj["total_cnt"]);
						vIconFea.set('pos',truepoint);
						vIconFea.set('pos_org',point);
						
						var tooltip = "";

						if(incidentObj["news_arr"]!=null && incidentObj["news_arr"].length>0){
							var obj = incidentObj["news_arr"][0];
							
							var ocdt = obj["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
							
							tooltip = "<div class='tooltip_title' style='font-weight:bold;'>"+obj["title"]+"</div>"
							+"<div class='tooltip_loc' style='float:left;width:200px;'>"+obj["loc_nm"]+"</div>"
							+"<div class='tooltip_dt' style='float:right;width:150px;text-align:right;'>"+ocdt+"</div>";
							
						}
						
						if(tooltip=="" && incidentObj["except_arr"]!=null && incidentObj["except_arr"].length>0){
							var obj = incidentObj["except_arr"][0];
							
							var ocdt = obj["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
							
							tooltip = "<div class='tooltip_title' style='font-weight:bold;'>"+obj["title"]+"</div>"
							+"<div class='tooltip_loc' style='float:left;width:200px;'>"+obj["loc_nm"]+"</div>"
							+"<div class='tooltip_dt' style='float:right;width:150px;text-align:right;'>"+ocdt+"</div>";
							
						}
						
						
						vIconFea.set('tooltip', tooltip);
						
						
						offy = (offy === 15) ? 22: 15;
						
						//icon, rotation, scale, name, offx, offy
						var fontstyle = 'bold 16px Calibri,sans-serif';
						var fontcolor = incidentObj["color"];
						
						if(incidentObj["total_cnt"]>1){
							vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 0.7, incidentObj["total_cnt"],fontstyle,fontcolor));
						}else{
							if(incidentObj["news_on"] == 1) vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 0.5));
							else vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 0.7));
						}

						
						
						//console.log(vIconFea);
						if(incidentObj["news_arr"].length>0 || incidentObj["except_arr"].length>0){
							vIconFeas.push(vIconFea);
						}

						
						
					});
					
					var vIconVector = new ol.source.Vector({
										features: vIconFeas
									});
					
					//console.log(vIconVector);
					
					incidentLayer = QvOSM_PVM_MAP.removeLayer(incidentLayer);
					
					//if(incidentLayer){incidentLayer.getSource().clear();}
					incidentLayer = new ol.layer.Vector({
									style : function(feature) {
												return feature.get('style');
											},
									source:vIconVector
								});	
					incidentLayer.setZIndex(200);
					QvOSM_PVM_MAP.addLayer(incidentLayer);

				}
				
				
				
				
				
				
				
				
				
				
				
				
				
				//ticker
				function ticker_position(){
					//var $left_pos = ($(".Document_LEFT_LAYER").css("display")=="none") ? 0 : $(".Document_LEFT_LAYER").width();
					var $top_pos = $(window).height();
					//var $ticker_w = $(window).width()-$left_pos;
					var $ticker_w = $(window).width();
					$("#ticker_cont").width($ticker_w);
					//$("#ticker_div").width($ticker_w);
					//$("#ticker_div").css("left",$left_pos);
					//$("#ticker_div").css("top",$top_pos-50);
					//$("#ticker_div").css("bottom",false);
				}

				console.log("ticker_incidentData :: ");
				console.log(ticker_incidentData);
				
				$.ticker_next = function(){
					var ticker_step = $("#ticker_cont").attr("ticker_step")==-1 ? -1 : parseInt($("#ticker_cont").attr("ticker_step"));
					ticker_step++;
					
					try{
						if(ticker_step >= ticker_incidentData.length -1){
							ticker_step = 0;
						}
						
						
						
						var incidentObj = ticker_incidentData[ticker_step];
						var news_arr	= incidentObj["news_arr"];
						var except_arr	= incidentObj["except_arr"];
						var obj;
						var type = "";
						
						if(news_arr!=null && news_arr.length>0) obj = news_arr[0];
						if(except_arr!=null && except_arr.length>0) obj = except_arr[0];


						console.log(obj);
						
						var ocdt = obj["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
						
						switch(incidentObj["type"]){
						case "news":
							
							var title = obj["title"];
							if(title.length>100){
								title = title.substr(0,100) + "...";
							}
							$("#ticker_cont").html("[NEWS] "+title+" ("+ocdt+")");
							break;
						case "except":
							
							var title = obj["reason"];
							if(title.length>100){
								title = title.substr(0,100) + "...";
							}
							$("#ticker_cont").html("[EXCEPTION] "+title+" ("+ocdt+")");
							break;
						}
						
						console.log($("#ticker_cont").text());
						
						$('#ticker_cont').marquee('reset');
						$('#ticker_cont').marquee({
							speed: 80,
							gap: 0,
							delayBeforeStart: 0,
							direction: 'left',
							duplicated: false,
							pauseOnHover: true
						});
						
						$("#ticker_cont").attr("ticker_step",ticker_step);
					}catch(e){
						
					}

				}
				
				
				ticker_position();
				$(window).resize(function(){
					ticker_position();
				});
				
				$('#ticker_cont').remove();
				$(".Document_vTICKER_COLOR .QvContent .TextObject TD:first").append('<div id="ticker_cont" ticker_step="0" class="marquee" style="color:#ffffff;width:100%;height:40px;font-family:Calibri;font-size:24px;font-weight:bold;position:relative;left:0px;top:0px;"></div>');
				$.ticker_next();
				
				
				$("#ticker_pointPopup").off("mouseover").on("mouseover",function(evt){
					$(this).attr("sel",1);
					$("#ticker_pointPopup").show();
				});

				$("#ticker_pointPopup").off("mouseout").on("mouseout",function(evt){
					$(this).attr("sel",0);
					$("#ticker_cont").attr("sel",0);
					$("#ticker_pointPopup #popup-closer").trigger("click");
					$("#ticker_pointPopup").hide();
				});
				
				$('#ticker_cont').off("mouseout").on("mouseout",function(evt){
					$(this).attr("sel",0);
					
					setTimeout(function(){
						if($("#ticker_pointPopup").attr("sel")==1) return;
						
						$("#ticker_pointPopup #popup-closer").trigger("click");
						$("#ticker_pointPopup").hide();
					},500);
				});
				
				$('#ticker_cont').off("mouseover").on("mouseover",function(evt){
					$("#ticker_pointPopup #popup-closer").trigger("click");
					//$("#ticker_pointPopup").hide();
					console.log(evt);

					$(this).attr("sel",1);
					
					$("#ticker_pointPopup").attr("data","");
					$("#ticker_pointPopup").height("");
					
					//draggable에 의한 위치 초기화
					$("#ticker_pointPopup").attr("style","");
					
					$("#ticker_pointPopup").addClass("incident");
					
					var ticker_pointPopup = new ol.Overlay({
						element: document.getElementById("ticker_pointPopup"),
						autoPan: true,
						autoPanAnimation: {
							duration: 250
						 }
					});
					
					QvOSM_PVM_MAP.addOverlay(ticker_pointPopup);
					
					

					
					var ticker_step = $("#ticker_cont").attr("ticker_step");
					
					var incidentObj = ticker_incidentData[ticker_step];
					var news_arr	= new Array();
					try{
						news_arr = incidentObj["news_arr"] ? incidentObj["news_arr"] : new Array();
					}catch(e){
						
					}
					
					var except_arr	= new Array();
					try{
						except_arr = incidentObj["except_arr"] ? incidentObj["except_arr"] : new Array();
					}catch(e){
						
					}
					
					
					var obj = {
							type		: incidentObj["type"],
							lngtd		: incidentObj["lngtd"],
							ltitde		: incidentObj["ltitde"],
							news_arr	: news_arr,
							except_arr	: except_arr
					}
					
					var coordinate = [0, 0];
					
					
					
					$("#ticker_pointPopup").attr("type","");
					$("#ticker_pointPopup .ol-popup-title").attr("type","");
					$("#ticker_pointPopup").attr("idx","-1");
					$("#ticker_pointPopup .ol-popup-headtitle-content").attr("title","");
					$("#ticker_pointPopup .ol-popup-headtitle-content").html("");
					$("#ticker_pointPopup #popup-content").empty();
					
					function btn_next($data){
						console.log($data);
						
						var $type = $("#ticker_pointPopup").attr("type")!="" ? $("#ticker_pointPopup").attr("type") : $data["type"];
						var $idx = $("#ticker_pointPopup").attr("idx");
						
						var $next_idx = parseInt($idx) + 1;
						var $direction = $("#ticker_pointPopup").attr("prev")==1 ? "prev" : "next"; 
						
						var $count = 0;
						var $totalcount = $data["news_arr"].length + $data["except_arr"].length;
						
						if($direction=="prev"){
							if($type=="news" && $next_idx == 1){
								console.log("news prev");
								
								if($data["except_arr"].length>0){
									$type = "except";
									$idx = $data["except_arr"].length-1;
									$next_idx = $idx;
								}else{
									$idx = 0;
									$next_idx = 0;
								}
							}else if($type=="except" && $next_idx == 1){
								console.log("except prev");
								
								if($data["news_arr"].length>0){
									$type = "news";
									$idx = $data["news_arr"].length-1;
									$next_idx = $idx;
								}else{
									$idx = 0;
									$next_idx = 0;
								}
							}else{
								$next_idx = parseInt($idx) - 1;
							}
							
							console.log("direction :: "+$direction+" , "+$("#pointPopup").attr("prev"));
							console.log("news_arr length :: "+$data["news_arr"].length);
							console.log("except_arr length :: "+$data["except_arr"].length);
						}else{
							if($type=="news" && $next_idx == $data["news_arr"].length){
								console.log("news next");
								
								if($data["except_arr"].length>0){
									$type = "except";
								}
								$idx = 0;
								$next_idx = 0;

							}else if($type=="except" && $next_idx == $data["except_arr"].length){
								console.log("except next");
								
								if($data["news_arr"].length>0){
									$type = "news";
								}
								$idx = 0;
								$next_idx = 0;
								
							}else{
								$next_idx = parseInt($idx) + 1;
							}
						}
						console.log("type :: "+$type);
						console.log("next_idx :: "+$next_idx);
						
						
						
						
						//초기 팝업 출력일 경우
						if($idx==-1){
							$idx = 0;
							$next_idx = 0;
						}
						if($type=="mixed"){
							$type = "news";
						}
						
						var $curr_idx = $type=="except" ? ($data["news_arr"].length+$next_idx+1) : ($next_idx+1);
						
						
						
						var $curr_data;
						if($type=="news"){
							$curr_data = $data["news_arr"][$next_idx];
							$count = $data["news_arr"].length;
						}else{
							$curr_data = $data["except_arr"][$next_idx];
							$count = $data["except_arr"].length;
						}
						
						
						$("#ticker_pointPopup").attr("type",$type);
						$("#ticker_pointPopup").attr("idx",$next_idx);
						$("#ticker_pointPopup").attr("totalcount",$totalcount);
						$("#ticker_pointPopup #disp_step").html("["+$curr_idx+"/"+$totalcount+"]");
						$("#ticker_pointPopup .ol-popup-title").attr("type",$type);	
						
						console.log("$type :: "+$type);
						console.log("$idx :: "+$idx);
						console.log("$curr_idx :: "+$curr_idx);
						console.log("$totalcount :: "+$totalcount);
						
						
						if($type=="news"){ //news popup 최초 그리는 부분
							
							$("#ticker_pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm"]);
							$("#ticker_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm"]);
							
							var str = "<table style='width:580px;'>"
								+"<tr>"
									+"<td>"
										+"<div class='occur_dt' style='float:left;'></div>"
										+"<div class='location_icon' style='float:right;'><img style='height:20px;' src='"+QvOSM_exUrl+"icon/location_50.png' /></div>"
										+"<div class='location' style='float:right;'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"<div class='valid_dt'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"<div class='source'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"</br>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"<div class='title'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"</br>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
									+"<div class='cont'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"<div class='container_cnt'></div>"
									+"</td>"
								+"</tr>"
							+"</table>";
							
							
							$("#ticker_pointPopup #popup-content").html(str);
							
							var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
							var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
							$("#ticker_pointPopup #popup-content .occur_dt").html("Created on : "+ocdt);
							$("#ticker_pointPopup #popup-content .location").html($curr_data["loc_nm"]);
							$("#ticker_pointPopup #popup-content .title").html($curr_data["title"]);
							$("#ticker_pointPopup #popup-content .source").html("Source: "+$curr_data["source"]);
							$("#ticker_pointPopup #popup-content .valid_dt").html("Valid until: "+vdt);
							
							
							var $contents_arr = $curr_data["cont"].split("[read more](");
							console.log($contents_arr);
							
							var $contents = $contents_arr[0];
							var $read_more = "";
							try{
								if($contents_arr[1]!=null){
									var $url = $.trim($contents_arr[1]).substr(0,$contents_arr[1].length-1);
									$read_more = "<a href='"+$url+"' target=_blank>[read more]</a>";
								}
							}catch(e){
								
							}
							
							$("#ticker_pointPopup #popup-content .cont").html($contents+$read_more);
							
						}else{
							
							$("#ticker_pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm4"]);
							$("#ticker_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm4"]);
							
							var str = "<table style='width:580px;'>"
								+"<tr>"
									+"<td>"
										+"<div class='occur_dt' style='float:left;'></div>"
										+"<div class='location_icon' style='float:right;'><img style='height:20px;' src='"+QvOSM_exUrl+"icon/location_50.png' /></div>"
										+"<div class='location' style='float:right;'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"</br>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"<div class='title'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"<div class='container_cnt'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"<div class='vessel_nm'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"</br>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"<div class='excp_nm4'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"</br>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td><div style='color:#006ca2;font-weight:bold;'>Reason Detail</div>"
										+"<div class='reason'></div>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td>"
										+"</br>"
									+"</td>"
								+"</tr>"
								+"<tr>"
									+"<td><div style='color:#006ca2;font-weight:bold;'>Action & Prevention Measure</div>"
										+"<div class='action'></div>"
									+"</td>"
								+"</tr>"
							+"</table>";
							
							
							$("#ticker_pointPopup #popup-content").html(str);
							
							var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
							$("#ticker_pointPopup #popup-content .occur_dt").html(ocdt);
							$("#ticker_pointPopup #popup-content .location").html($curr_data["loc_nm2"]+" ("+$curr_data["step"]+")");
							$("#ticker_pointPopup #popup-content .title").html($curr_data["title"]);
							$("#ticker_pointPopup #popup-content .vessel_nm").html($curr_data["vessel_nm"]);
							$("#ticker_pointPopup #popup-content .excp_nm4").html($curr_data["excp_nm4"]);
							$("#ticker_pointPopup #popup-content .reason").html(($curr_data["reason"] ? $curr_data["reason"] : ""));
							$("#ticker_pointPopup #popup-content .action").html(($curr_data["action"] ? $curr_data["action"] : ""));
							$("#ticker_pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially affected : "+$curr_data["container_cnt"]+" container(s)" : ""));
								
								
						}								
						
						
						$("#ticker_pointPopup #btn_next").show();
						$("#ticker_pointPopup #btn_prev").show();
						if($totalcount>1){
							$("#ticker_pointPopup #btn_next").off("click").on("click",function(){
								$("#ticker_pointPopup").attr("prev",0);
								btn_next(obj);
							});
							$("#ticker_pointPopup #btn_prev").off("click").on("click",function(){
								$("#ticker_pointPopup").attr("prev",1);
								btn_next(obj);
							});
						}else{
							$("#ticker_pointPopup #btn_next").hide();
							$("#ticker_pointPopup #btn_prev").hide();
						}
						
						
						ticker_pointPopup.setPosition(coordinate);

						$("#ticker_pointPopup").parent().css("left",parseInt($(window).width())/2);
						$("#ticker_pointPopup").parent().css("bottom",$(".Document_vTICKER_COLOR").height()-12);
						
						$("#ticker_pointPopup").draggable();
						$("#ticker_pointPopup").height("");
						$("#ticker_pointPopup").show();

					}
					
					
					
					
					
					btn_next(obj);
					
					
					
					
				});
				
				
				$('#ticker_cont').unbind('finished').bind('finished', function(){
					/*
					if($(this).attr("sel")==0){
						$("#popup-closer").trigger("click");
						$("#ticker_pointPopup").hide();
					}
					*/
					$.ticker_next();
				});
				
				
				
				$("#rader_div").remove();
				$(".Document_TITLE_LAYER").append('<div id="rader_div" style="position:absolute;left: 250px;top: 8px;text-align:center;">'
						+'<img style="width:45px;" src="'+QvOSM_exUrl+'icon/radar_white.png"/>'
					+'</div>');					

				

				
				$(".Document_TOP_LAYER").css("border-right","1px solid #191919");
				$(".Document_TOP_LAYER").css("border-left","1px solid #191919");
				

				
				/* qlikview 개발과 운영의 버전이 달라서 mouseover logic 제외
				
				
				$(".Document_TX182").unbind("click").bind("click",function(){
					
					
					console.log("news");
					
						
					
					//news grid mouseover logic ============================================================================================ start
					
					setGridPopup("TB03",news_incidentData);
					
					//news grid mouseover logic ============================================================================================ end				
						
					
					
					
					
				});
				
				
				//news grid mouseover logic ============================================================================================ start
				
				setGridPopup("TB03",news_incidentData);
				
				//news grid mouseover logic ============================================================================================ end	
				
				
				
				$(".Document_TX177").unbind("click").bind("click",function(){
					
					
					console.log("except");
					
						
					
					//except grid mouseover logic ============================================================================================ start
					
					setGridPopup("TB07",except_incidentData);
					
					//except grid mouseover logic ============================================================================================ end				
						
					
					
					
					
				});
				
					
				
				//except grid mouseover logic ============================================================================================ start
				
				setGridPopup("TB07",except_incidentData);
				
				//except grid mouseover logic ============================================================================================ end				
				
				
				*/
				
				
			};
			
			
			
			
			
			
			
			
			
			
			var clearWeather = function(){
				if(weatherLayer) weatherLayer.getSource().clear();
			};
			
			
			
			
			
			var drawWeather = function(){
				
				
				zIndex = 0;
				
				
				
				
				
				
				
				
				
				
				d3.csv(QvOSM_exUrl+"data/weather.csv", function(d){
					weatherIcons = [];
					var pos;
					var weatherGroup = {};
					//d의 길이만큼 날씨 값을 받아 각각 맵상에 표시
					$(d).each(function(){
						//console.log(this);
						var country = this.country;
						var lon = this.lon;
						var lat = this.lat;
						var icon = this.icon;
						var tempt = this.temperature;
						var iconId = this.number;
						var windDir = this.windDirNm;
						var windSpeed = this.windSpeedVal;
						var minTempt = this.minTemperature;
						var maxTempt = this.maxTemperature;
						var portName = this.PORT_NAME;
						var desc = this.WEATHER_DESC;
						var weatherG = this.WEATHER_GRP;
						if(!weatherGroup[weatherG])weatherGroup[weatherG] = [];
						weatherGroup[weatherG].push(icon);
						if(iconId == "781"){
							icon = iconId;
						}


						pos = new ol.Feature({
							geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(lon),parseFloat(lat)]))
						});
						pos.setStyle(new ol.style.Style({
							image: new ol.style.Icon( ({
								opacity: 0.9,
								scale:0.6,
								//size : [100,100],
								color: '#ffffff',
								src: QvOSM_exUrl+'icon/'+icon+'.png'
							}))
						}));
						pos.set("t", icon);

						pos.set("popup","Port : "+portName+"<br/>Weather : "+desc+"<br/>Temperature : "+tempt+" ºC<br/>Wind Speed : "+windSpeed+"(km/h)");
						//pos.set("i",{"ty":"w","t":tempt,"c":country,"port":portName,"minTempt":minTempt,"maxTempt":maxTempt,"wDir":windDir,"wSpeed":windSpeed,"desc":desc});
						weatherIcons.push(pos);
					});

					var iconVector = new ol.source.Vector({
						features: weatherIcons
					});
					/*
					var cluster = new ol.source.Cluster({
						distance  : 15,
						source: iconVector
					});
					*/
					if(weatherLayer)weatherLayer.getSource().clear();
					/*
					weatherLayer = new ol.layer.Vector({
						source:cluster,
						style: function(features){
							var feature = features.get('features');
							var style = null;
							if(feature[0]){
								style = feature[0].getStyle();

							}
							return style;
						}
					});
					*/
					weatherLayer = new ol.layer.Vector({
						source:iconVector
					});
					weatherLayer.setZIndex(zIndex++);
					QvOSM_PVM_MAP.addLayer(weatherLayer);


				});


				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
			};
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			Qva.AddExtension(ExName, function() {
				
				$target = this;
				cqv = Qv.GetDocument("");
				
				
	
				
				//Qv.GetCurrentDocument().binder.Set("Document.TabRow.Document\\MAIN", "action", "", true);
				
				//onload와 같은 기능 --------------------------------------시작
				var varsRetrieved = false;
				cqv.SetOnUpdateComplete(function(){
				if(!varsRetrieved){
					
					
					//news row data;
					if(vNEWS==null) vNEWS = cqv.GetObject("vNEWS");
					try{
						vNEWS.Data.SetPagesizeY(vNEWS.Data.TotalSize.y);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					var vNewsObj = vNEWS.Data.Rows;
					console.log(vNewsObj);
					//console.log(JSON.stringify(vNewsObj));
					
					//exception row data;
					if(vEXCEPT==null) vEXCEPT = cqv.GetObject("vEXCEPT");
					try{
						vEXCEPT.Data.SetPagesizeY(vEXCEPT.Data.TotalSize.y);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					var vExceptObj = vEXCEPT.Data.Rows;
					console.log(vExceptObj);	
					
					
					//news grid row data;
					if(vNEWSGRID==null) vNEWSGRID = cqv.GetObject("TB03");
					try{
						vNEWSGRID.Data.SetPagesizeY(vNEWSGRID.Data.TotalSize.y);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					
					
					
					
					//maptype row data;
					if(vMAP==null) vMAP = cqv.GetObject("vMAP");
					var vMapObj = vMAP.Data.Rows;
					console.log(vMapObj);	
		
					
					
					//ticker row data;
					if(vTIC==null) vTIC = cqv.GetObject("vTIC");
					var vTicObj = vTIC.Data.Rows;
					console.log(vTicObj);	
					
					
					
					
					//icon row data;
					if(vNEWSICON==null) vNEWSICON = cqv.GetObject("vICON");
					var vNewsIconObj = vNEWSICON.Data.Rows;
					console.log(vNewsIconObj);	
					

					if(vSHOW_TYPHOON==null) vSHOW_TYPHOON = cqv.GetObject("vTYPHOON");
					if(vSHOW_WEATHER==null) vSHOW_WEATHER = cqv.GetObject("vWEATHER");
					
					
					//태풍 데이터
					if(vTYPHOON==null) vTYPHOON = cqv.GetObject("vTYPHOON_LO_NEW");
					try{
						vTYPHOON.Data.SetPagesizeY(vTYPHOON.Data.TotalSize.y);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					console.log(vTYPHOON);
					
					
					//vNEWS_ONOFF row data;
					if(vNEWS_ONOFF_OBJ==null) vNEWS_ONOFF_OBJ = cqv.GetObject("vNEWS_ONOFF");
					try{
						vNEWS_ONOFF = vNEWS_ONOFF_OBJ.GetVariable()["text"];
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					
					if(vEXCEPTION_ONOFF_OBJ==null) vEXCEPTION_ONOFF_OBJ = cqv.GetObject("vEXCEPTION_ONOFF");
					try{
						vEXCEPTION_ONOFF = vEXCEPTION_ONOFF_OBJ.GetVariable()["text"];
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					
					
					cqv.GetAllVariables(function(variables){
					//onload와 같은 기능 --------------------------------------시작
				
						$_VAR = {};
						$.each(variables,function($key,$value){
							$_VAR[$value["name"]] = $value["value"];
						});
						
						
					try {
						incidentZoom=1;
						
						try{
							vMAPTYPE = vMAP.GetVariable()["text"];
							console.log("vMAPTYPE :: "+vMAPTYPE);
							
							vTicker = vTIC.GetVariable()["text"];
							console.log("vTicker :: "+vTicker);
							
							vNewsIcon = vNEWSICON.GetVariable()["text"];
							console.log("vNewsIcon :: "+vNewsIcon);
							
							vSHOW_TYPHOON_YN = vSHOW_TYPHOON.GetVariable()["text"];
							console.log("vSHOW_TYPHOON_YN :: "+vSHOW_TYPHOON_YN);
							
							vSHOW_WEATHER_YN = vSHOW_WEATHER.GetVariable()["text"];
							console.log("vSHOW_WEATHER_YN :: "+vSHOW_WEATHER_YN);
						}catch(e){
							console.log(e);
							//location.reload();
						}
						

						
						var $element = $($target.Element);				
						uId = $target.Layout.ObjectId.replace("\\", "_");
						if(!window[uId])window[uId] = {};
						window[uId]["id"] = uId;
						
						//Dimensions 데이터
						try{
							$target.Data.SetPagesizeY($target.Data.TotalSize.y);
						}catch(e){
							console.log($target.Data);
							console.log(e);
						}
						var rows = $target.Data.Rows;
						//console.log(rows);
						
						if(mapAniObj === null)aniFea = [];
						

						

						
						
						
						incidentData = [];
						ticker_incidentData = [];
						news_incidentData = [];
						except_incidentData = [];
						
						
						
						
						
						
						
						
						
						//Typhoon icon
						var setTyphoonIcon = function(){
							
							
							
							
							
							
							
							vTYPHOON_DATA_ARR = new Array();
							try{
								$.each(vTYPHOON.Data.Rows,function(){
									
									
									var obj = {
											NAME			:	this[0]["text"],
											KEY_TYPHOON		:	this[0]["text"]+""+this[18]["text"],//KEY_TYPHOON+CREATE_YEAR 로 과거 태풍과 중복되는 문제 처리, vTY_STATUS / vLAST_TYP / vTYP2 객체에서 넘어오는 값도 동일하게 처리되어 와야함
											VSL_NAME		:	this[1]["text"],
											LATEST_YN		:	this[2]["text"],
											LOCAL_DT_TTHH	:	this[3]["text"],
											ROUT_SEQ		:	this[4]["text"],
											LOCAL_DT		:	this[5]["text"],
											LTITDE			:	(this[6] && $.isNumeric(this[6]["text"]))	?	parseFloat(this[6]["text"])	:	"-",//위도
											LNGTD			:	(this[7] && $.isNumeric(this[7]["text"]))	?	parseFloat(this[7]["text"])	:	"-",//경도
											DIRECTION		:	this[8]["text"],
											MAX_WINDSPEED	:	parseInt(this[9]["text"]),
											GUST			:	this[10]["text"],
											RADIUS			:	JSON.parse(this[11]["text"]),
											CURR_YN			:	this[12]["text"],
											PLAY_YN			:	this[13]["text"],
											TYPN_SEQ		:	this[14]["text"],
											TYPN_ICON		:	this[15]["text"],
											DESC			:	this[16]["text"],
											IS_CURR			:	this[17]["text"],
											CREATE_YEAR		:	this[18]["text"]
									}
									
									vTYPHOON_DATA_ARR.push(obj);
								});

							}catch(e){
								console.log(e);
							}	
							
							
							
							
							
							
							TYPHOON_ICON_ARR = new Array();
							
							
							
							
							
							
							
							
							
							//변수, 함수 초기화
							var pi2 = Math.PI/2;
							var pi2Q = [];
							for(var oi = 1; oi<5; oi++){	//원 4등분;
								pi2Q.push(pi2*oi);
							}
							var rotate = 45;
							var step = 0.1;	//좌표의 간격;
							//distance - meter, bearing - 방위 360도
							var destinationPoint = function(lon, lat, distance, bearing, radius) {
								radius = (radius === undefined) ? 6371e3 : Number(radius);

								// φ2 = asin( sinφ1⋅cosδ + cosφ1⋅sinδ⋅cosθ )
								// λ2 = λ1 + atan2( sinθ⋅sinδ⋅cosφ1, cosδ − sinφ1⋅sinφ2 )
								// see http://williams.best.vwh.net/avform.htm#LL

								var δ = Number(distance) / radius; // angular distance in radians
								var θ = Number(bearing) * Math.PI / 180;

								var φ1 = lat.toRadians();
								var λ1 = lon.toRadians();

								var φ2 = Math.asin(Math.sin(φ1)*Math.cos(δ) + Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));
								var x = Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2);
								var y = Math.sin(θ) * Math.sin(δ) * Math.cos(φ1);
								var λ2 = λ1 + Math.atan2(y, x);
								
								//[lon, lat]
								return [(λ2.toDegrees()+540)%360-180, φ2.toDegrees()]; // normalise to −180..+180°
							};
							
							//거리 구하기, x,y 값 배열 두개;
							var getDistance = function(pt, pt2){
								//경위도 거리 차이 보정 X
								var x2 = Math.pow((pt[0]-pt2[0]),2);
								var y2 = Math.pow((pt[1]-pt2[1]),2);
								return Math.sqrt((x2+y2));
							}
							
							//원 좌표구하기, 태풍위치, 북쪽, 남쪽, 동쪽, 서쪽 거리
							var getTypoonCoordinates = function(center, north, south, east, west){
								
								//반경이 1/2 밖에 안되서 *2를 처리함 => km 단위 인거 같습니다. 2 => 1.852 로 변경합니다.
								var $unit = 1.852;
								
								north = north*$unit;
								south = south*$unit;
								east = east*$unit;
								west = west*$unit;
								
								
								var radiusN = north;
								var radiusS = south;
								var radiusE = east;
								var radiusW = west;
				
								
								var pointNE = destinationPoint(center[0], center[1], north*1000, 45);
								var pointSW = destinationPoint(center[0], center[1], south*1000, 225);
								
								center = ol.proj.fromLonLat(center);
								
								var radiusSN = [getDistance(center, ol.proj.fromLonLat(pointSW)), getDistance(center, ol.proj.fromLonLat(pointNE))]; //남북 거리;
								var elipse_R = [];
								
								//타원 비율
								elipse_R.push(radiusE/radiusS);	//[0] 남동;
								elipse_R.push(radiusW/radiusS); //[1] 남서
								elipse_R.push(radiusW/radiusN);//[2] 북서
								elipse_R.push(radiusE/radiusN);//[3] 북동
								
								var xCent = center[0];
								var yCent = center[1];
								
								var list = [];
								var theta=0;
								
								for(var j = 0; j < 4; j++){							
									var radius = radiusSN[parseInt(j/2)];
									var elipseR = elipse_R[j];
									
									for(; theta < pi2Q[j]; theta+=step){
										var x = xCent + (elipseR * radius * Math.cos(theta));
										var y = yCent - radius*Math.sin(theta);
										list.push([x, y]);
									}
								}
								
								//list.push(ol.proj.fromLonLat([xCent, yCent]));

//								console.log(list);
								
								
								return list;
								//return {"list":list, "center": ol.proj.fromLonLat([center[0], center[1]])};
							}
							
							
							
							
							
							
							
							
							
							
							
							
							
							
							

							
							var $key = "";
							var std_arr = new Array();
							var $IsCurr = false;
							var $lineStyle = "line";
							var $b4value = null;
							
							$.each(vTYPHOON_DATA_ARR,function($k,$v){

								
								if($key != $v["KEY_TYPHOON"]){
									
									if(std_arr.length>0)
									TYPHOON_ICON_ARR.push({
										key			:	$key,
										data		:	std_arr,
									});
									
									std_arr = new Array();
									$key = $v["KEY_TYPHOON"];
									$b4value = null;
									
									$lineStyle = "line";
								}
								
								if($v["IS_CURR"]=="Y"){
									$IsCurr = true;//현재 태풍, 그 이후에는 예상경로
								}else{
									$IsCurr = false;//현재 태풍, 그 이후에는 예상경로
								}
								

								
								var ty_icon = "ty1_40_30";
								var ty_txt = $v["LOCAL_DT_TTHH"]+" (Grade : VS)";
								if($v["MAX_WINDSPEED"]>=85){
									ty_icon = "ty4_40_30";
									ty_txt = $v["LOCAL_DT_TTHH"]+" (Grade : VS)";
								}else if($v["MAX_WINDSPEED"]<85 && $v["MAX_WINDSPEED"]>=64){
									ty_icon = "ty3_40_30";
									ty_txt = $v["LOCAL_DT_TTHH"]+" (Grade : S)";
								}else if($v["MAX_WINDSPEED"]<64 && $v["MAX_WINDSPEED"]>=48){
									ty_icon = "ty2_40_30";
									ty_txt = $v["LOCAL_DT_TTHH"]+" (Grade : M)";
								}else if($v["MAX_WINDSPEED"]<48 && $v["MAX_WINDSPEED"]>=34){
									ty_icon = "ty1_40_30";
									ty_txt = $v["LOCAL_DT_TTHH"]+" (Grade : W)";
								}
								
								
								var $line_obj = null;
								if($b4value!=null){
									$line_obj = {
										key			:	$key,
										data		:	[[ol.proj.fromLonLat([$b4value["LNGTD"],$b4value["LTITDE"]]),ol.proj.fromLonLat([$v["LNGTD"],$v["LTITDE"]])]],
										width		:	3,
										color		:	"rgba(255, 0, 0, 0.4)",
										linestyle	:	$lineStyle
									};
								}
								$b4value = $v;//line 그리기 위해 이전 값을 저장한다
								if($v["IS_CURR"]=="Y"){//이후 경로는 예상경로
									$lineStyle = "dash";
								}else{
								}
								
								
								
								std_arr.push({
									type		:	"typhoon",
									data		:	ol.proj.fromLonLat([$v["LNGTD"],$v["LTITDE"]]),
									icon		:	ty_icon,
									text		:	ty_txt,
									key			:	$key,
									name		:	$v["NAME"],
									color		:	"rgba(255, 255, 255, 1)",
									curr		:	$IsCurr,
									speed		:	$v["MAX_WINDSPEED"] || 34,
									polygon		:	[
										[getTypoonCoordinates([$v["LNGTD"],$v["LTITDE"]], $v["RADIUS"][0], $v["RADIUS"][1], $v["RADIUS"][2], $v["RADIUS"][3])],//34note
										[getTypoonCoordinates([$v["LNGTD"],$v["LTITDE"]], $v["RADIUS"][4], $v["RADIUS"][5], $v["RADIUS"][6], $v["RADIUS"][7])]//50note
									],
									line		:	$line_obj
								});
								
								
								
								
									
									
								if($k == vTYPHOON_DATA_ARR.length -1)
									TYPHOON_ICON_ARR.push({
										key			:	$key,
										data		:	std_arr,
									});
								
							});
							
								

								
								
							
							
							
							
						};
						
						
						
						var showTyphoonIcon = function(){

							try{
								if(typhooniconlayerlist.length>0)
									$.each(typhooniconlayerlist,function($k,$v){
										typhooniconlayerlist[$k].getSource().removeFeature(typhooniconlayerlist[$k].getSource().getFeatures()[0]);
									});
								typhooniconlayerlist.length = 0;
							}catch(e){
								//console.log(e);
							}
							
							if(LAYER_OBJ!=null){
								$.each(LAYER_OBJ,function($key,$value){
									$.each($value,function($k,$v){
										
											try{
												$value[$k].getSource().removeFeature($value[$k].getSource().getFeatures()[0]);
											}catch(e){
												//console.log(e);
											}
											$value[$k].getSource().clear();
											$value[$k].setSource(undefined);
											delete LAYER_OBJ[$key][$k];
										
									});
									delete LAYER_OBJ[$key];
								});
							}
							
							
							
							if(TYPHOON_ICON_ARR.length>0){
								$.each(TYPHOON_ICON_ARR,function($key,$value){
									
									$.each($value["data"],function($k,$v){
										
										if($v["line"]!=null){
											var $obj = $v["line"];
											typhooniconlayerlist.push(drawLine("typhoon", $obj, $obj["data"], $obj["width"], null, $obj["color"], $obj["linestyle"]));
										}
										
										
										//34note 태풍영향도 그리기 파란색
										typhooniconlayerlist.push(drawLine("typhoon", $v, $v["polygon"][0], null, null, QvOSM_PVM_Design_Opt["typhoon"]["34knot"]["color"], "polygon"));
										
										//50note 태풍영향도 그리기 빨간색
										typhooniconlayerlist.push(drawLine("typhoon", $v, $v["polygon"][1], null, null, QvOSM_PVM_Design_Opt["typhoon"]["50knot"]["color"], "polygon"));
										
										//태풍 아이콘 그리기
										typhooniconlayerlist.push(drawLine("typhoon", $v, $v["data"], null, null, $v["color"], "icon",$v["text"]));
										
										//현재 태풍 아이콘 위치에 태풍 이름 출력
										if($k == 0) typhooniconlayerlist.push(drawLine("typhoon", $v, $v["data"], null, null, "#006ca2", "text",$v["name"], 20, 0, null, 'bold 16px Calibri,sans-serif'));
									});
									
								});
							}
							
							
							
							
						};
						
						
						
						
		
	
						var dataCnt = rows.length>0 ? rows[0].length : 0;
						if(dataCnt>= 3){
							console.log(rows.length);
							$(rows).each(function(i){
								//console.log(this);
								
								//넘어오는 데이터
								var lngtd			= (this[0] && $.isNumeric(this[0].text))	?	parseFloat(this[0].text)	:	"-";//경도
								var ltitde			= (this[1] && $.isNumeric(this[1].text))	?	parseFloat(this[1].text)	:	"-";//위도
								var loc_nm			= (this[2])	?	this[2].text						:	"";//명칭
								var except_cnt		= (this[3] && $.isNumeric(this[3].text))	?	parseInt(this[3].text)				:	0;//exception 갯수
								var news_cnt		= (this[4] && $.isNumeric(this[4].text))	?	parseInt(this[4].text)				:	0;//news 갯수
								var total_cnt		= news_cnt + except_cnt;
								var type = "news";
								var icon = "news_marker";
								var color = "#ed7d31";
	
								if(news_cnt==0 && except_cnt==0) return true;
								if(lngtd=="-") return true;
								if(ltitde=="-") return true;
	
								if(news_cnt>0 && except_cnt>0){
									type = "mixed";
									icon = "news_marker_n";
									color = "#ed7d31";
								}else if(news_cnt>0 && except_cnt==0){
									type = "news";
									color = "#ed7d31";
									
									if(news_cnt>1){
										icon = "news_marker_n";
									}else{
										icon = "news_marker";
									}
									
								}else if(news_cnt==0 && except_cnt>0){
									type = "except";
									color = "#eb4e8d";
									
									if(except_cnt>1){
										icon = "except_marker_n";
									}else{
										icon = "except_marker";
									}
									
								}else{
									type = "none";
								}
								
								
								var incidentObj = {
										type		: type,
										lngtd		: lngtd,
										ltitde		: ltitde,
										icon		: icon,
										color		: color,
										loc_nm		: loc_nm,
										pos			: [lngtd,ltitde],
										news_cnt  	: news_cnt,
										total_cnt	: total_cnt,
										except_cnt	: except_cnt,
										news_arr	: new Array(),
										except_arr	: new Array()
									};	
								//console.log(incidentObj);
								incidentData.push(incidentObj);
								
								
							});
						} else {
							//$target.Element.innerHTML = "Input Dimension, Expression";
							//return false;
						}
	
						
						console.log(incidentData);
						
	
						//exception 정보 정리
						//console.log(vNewsObj);
						if(incidentData.length>0)
						$.each(vNewsObj,function($key,$value){
							
							var news_no 		= ($value[0]) 									?	$value[0].text 	: 	"";
							var lngtd			= ($value[1] && $.isNumeric($value[1].text))	?	parseFloat($value[1].text)	:	"-";//경도
							var ltitde			= ($value[2] && $.isNumeric($value[2].text))	?	parseFloat($value[2].text)	:	"-";//위도
							var loc_nm			= ($value[3])									?	$value[3].text	:	"";//명칭
							var incident_type1	= ($value[4])									?	$value[4].text	:	"";//분류1
							var incident_type2	= ($value[5])									?	$value[5].text	:	"";//분류2
							var title			= ($value[6])									?	$value[6].text	:	"";//exception title
							var loc_nm2			= ($value[7])									?	$value[7].text	:	"";//발생도시
							var occur_dt		= ($value[8])									?	$value[8].text	:	"";//발생일
							var source			= ($value[9])									?	$value[9].text	:	"";//source
							var valid_dt		= ($value[10])									?	$value[10].text	:	"";//valid_dt
							var cont			= ($value[11])									?	$value[11].text	:	"";//cont
							var excp_nm			= ($value[12])									?	$value[12].text	:	"";//excp_nm
							var excp_cd			= ($value[13])									?	$value[13].text	:	"";//excp_cd
							var category		= ($value[14])									?	$value[14].text	:	"";//category
							var container_cnt	= ($value[15] && $.isNumeric($value[15].text))	?	$value[15].text	:	"";//container_cnt
							var crt_dt_loc_sort	= ($value[16])									?	$value[16].text	:	"";//crt_dt_loc_sort ticker에서 날짜 정렬하기 위한 용도로 다른데 사용하지 않음.
							var id				= ($value[17])									?	$value[17].text	:	"";//id container_no를 통해 팝업을 보여주기 위한 키로 id + loc_cd로 이루어져야 unique 하다
							var loc_cd			= ($value[18])									?	$value[18].text	:	"";//loc_cd
							
							
							
							
							
							var newsObj = {
									type			:	"news",
									news_no			:	news_no,
									lngtd			:	lngtd,
									ltitde			:	ltitde,
									loc_nm			:	loc_nm,
									incident_type1	:	incident_type1,
									incident_type2	:	incident_type2,
									title			:	title,
									loc_nm2			:	loc_nm2,
									loc_nm3			:	loc_nm2,
									occur_dt		:	occur_dt,
									source			:	source,
									valid_dt		:	valid_dt,
									cont			:	cont,
									excp_nm			:	excp_nm,
									category		:	category,
									container_cnt	:	container_cnt,
									id				:	id,
									loc_cd			:	loc_cd
							};
							news_incidentData.push(newsObj);
							
							
							
							var ticker_incidentObj = {
									type		: "news",
									lngtd		: lngtd,
									ltitde		: ltitde,
									color		: "#ed7d31",
									loc_nm		: loc_nm,
									pos			: [lngtd,ltitde],
									news_cnt  	: 1,
									total_cnt	: 1,
									except_cnt	: 0,
									news_arr	: new Array(),
									except_arr	: new Array()
								};	
							ticker_incidentObj["news_arr"].push(newsObj);
							ticker_incidentData.push(ticker_incidentObj);
							
							
							if(news_no.length<4) return true;
							if(lngtd=="-") return true;
							if(ltitde=="-") return true;
							
							
							//console.log("===newsObj===================");
							//console.log(newsObj);
							//console.log("======================");
							
							//incident에 exception을 위치와 분류기준으로 집어넣기 
							$.each(incidentData,function($k,$v){
								if($v["news_cnt"]>0 && newsObj["lngtd"]==$v["lngtd"] && newsObj["ltitde"]==$v["ltitde"]
									//&& incident_type1==$v["incident_type1"] && incident_type2==$v["incident_type2"]
								){
									//console.log("news :: "+$k+" :: "+newsObj["lngtd"]+"=="+$v["lngtd"]+" :: "+newsObj["ltitde"]+"=="+$v["ltitde"]+" :: "+incident_type1+"=="+$v["incident_type1"]+" :: "+incident_type2+"=="+$v["incident_type2"]);
									incidentData[$k]["news_arr"].push(newsObj);
									//console.log("===newsObj selected===================");
									//console.log(newsObj);
									//console.log("===newsObj===================");
									//return true;
									
									
									
									//단일 news icon 일 경우 news icon category 분류 기준 아이콘을 표시한다.
									if(vNewsIcon=="ON")
									if($v["news_cnt"]==1 && $v["except_cnt"]==0){
										switch(newsObj["category"]){
										
										
											
											
										case "Socio-political":
											incidentData[$k]["icon"] = "Socio-political_50";
											break;
										case "Weather":
											incidentData[$k]["icon"] = "Weather_50";
											break;
										case "Natural Disaster":
											incidentData[$k]["icon"] = "Natural_Disaster_50";
											break;
										case "Operational":
											incidentData[$k]["icon"] = "Operational_50";
											break;
										case "Carrier accident":
											incidentData[$k]["icon"] = "Carrier_Accident_50";
											break;
											default:
												incidentData[$k]["icon"] = "news_marker";
										}
										
										
										
										console.log("icon :: "+incidentData[$k]["icon"]);
										
										
										
										
										
										
										
										
										
										
										
										
									}
									
									
									
									
									
									if($v["news_cnt"]==1 && $v["except_cnt"]==0 && vNEWS_ONOFF=="ON" && vEXCEPTION_ONOFF=="OFF"){
										switch(newsObj["incident_type2"].trim()){
										
										case "Civil Unrest":
											incidentData[$k]["icon"] = "CivilUnrest";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Customs Issue":
											incidentData[$k]["icon"] = "Customs";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Cyclonic Storms":
											incidentData[$k]["icon"] = "CyclonicStorms";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Dense Fog":
											incidentData[$k]["icon"] = "DenseFog";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Diplomatic Crisis":
											incidentData[$k]["icon"] = "DiplomaticCrisis";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Earthquake":
											incidentData[$k]["icon"] = "Earthquake";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Fire on Ship":
											incidentData[$k]["icon"] = "FireOnShip";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Floods":
											incidentData[$k]["icon"] = "Floods";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Heavy Rain":
											incidentData[$k]["icon"] = "HeavyRain";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Heavy Snow":
											incidentData[$k]["icon"] = "HeavySnow";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Holiday":
											incidentData[$k]["icon"] = "Holiday";
											incidentData[$k]["news_on"] = 1;
											break;
										case "IT/Cyber Attack":
											incidentData[$k]["icon"] = "ITCyberAttack";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Labor Dispute":
											incidentData[$k]["icon"] = "LaborDispute";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Law Enforcement":
											incidentData[$k]["icon"] = "LawEnforcement";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Port Infrastructure":
											incidentData[$k]["icon"] = "PortInfrastructure";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Regulation":
											incidentData[$k]["icon"] = "Regulatory";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Ship/Airplane Trouble":
											incidentData[$k]["icon"] = "ShipAirplaneFailure";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Ship Collision":
											incidentData[$k]["icon"] = "ShipCollision";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Strong Wind":
											incidentData[$k]["icon"] = "StrongWind";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Terror":
											incidentData[$k]["icon"] = "Terror";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Volcano":
											incidentData[$k]["icon"] = "Volcano";
											incidentData[$k]["news_on"] = 1;
											break;
										case "War":
											incidentData[$k]["icon"] = "War";
											incidentData[$k]["news_on"] = 1;
											break;
											
										}
									}			
									
									
									
									
									
									
									
									
									
									
									
									
									
									
								}
							});
							
						});
						
						
						
						//exception 정보 정리
						if(incidentData.length>0)
						$.each(vExceptObj,function($key,$value){
							
							var except_no 		= ($value[0]) 									?	$value[0].text 	: 	"";
							var lngtd			= ($value[1] && $.isNumeric($value[1].text))	?	parseFloat($value[1].text)	:	"-";//경도
							var ltitde			= ($value[2] && $.isNumeric($value[2].text))	?	parseFloat($value[2].text)	:	"-";//위도
							var loc_nm			= ($value[3])									?	$value[3].text	:	"";//명칭
							var incident_type1	= ($value[4])									?	$value[4].text	:	"";//분류1
							var incident_type2	= ($value[5])									?	$value[5].text	:	"";//분류2
							var title			= ($value[6])									?	$value[6].text	:	"";//exception title
							var loc_nm2			= ($value[7])									?	$value[7].text	:	"";//발생도시
							var occur_dt		= ($value[8])									?	$value[8].text	:	"";//발생일
							var vessel_nm		= ($value[9])									?	$value[9].text	:	"";//vessel name
							var action			= ($value[10])									?	$value[10].text	:	"";//action
							var reason			= ($value[11])									?	$value[11].text	:	"";//reason
							var step			= ($value[12])									?	$value[12].text	:	"";//step
							var excp_nm			= ($value[13])									?	$value[13].text	:	"";//excp_nm
							var container_cnt	= ($value[14] && $.isNumeric($value[14].text))	?	$value[14].text	:	"";//container_cnt
							var excp_nm4		= ($value[15])									?	$value[15].text	:	"";//excp_nm4
							var excp_cd			= ($value[16])									?	$value[16].text	:	"";//excp_cd
							
							
							var exceptObj = {
									type			:	"except",
									except_no		:	except_no,
									lngtd			:	parseFloat(lngtd),
									ltitde			:	parseFloat(ltitde),
									loc_nm			:	loc_nm,
									incident_type1	:	incident_type1,
									incident_type2	:	incident_type2,
									title			:	title,
									loc_nm2			:	loc_nm2,
									loc_nm3			:	loc_nm,
									occur_dt		:	occur_dt,
									vessel_nm		:	vessel_nm,
									action			:	action,
									reason			:	reason,
									step			:	step,
									excp_nm			:	excp_nm,
									container_cnt	:	parseInt(container_cnt),
									excp_nm4		:	excp_nm4
							};
							except_incidentData.push(exceptObj);
							
							
							
							
							
							var ticker_incidentObj = {
									type		: "except",
									lngtd		: lngtd,
									ltitde		: ltitde,
									color		: "#eb4e8d",
									loc_nm		: loc_nm,
									pos			: [lngtd,ltitde],
									news_cnt  	: 1,
									total_cnt	: 1,
									except_cnt	: 0,
									news_arr	: new Array(),
									except_arr	: new Array()
								};	
							ticker_incidentObj["except_arr"].push(exceptObj);
							ticker_incidentData.push(ticker_incidentObj);
							
							
							if(except_no.length<4) return true;
							if(lngtd=="-") return true;
							if(ltitde=="-") return true;
							
							
							
							
							
							//console.log("===exceptObj===================");
							//console.log(exceptObj);
							//console.log("======================");
							
							//incident에 exception을 위치와 분류기준으로 집어넣기 
							$.each(incidentData,function($k,$v){
								if($v["except_cnt"]>0 && exceptObj["lngtd"]==$v["lngtd"] && exceptObj["ltitde"]==$v["ltitde"]
									//&& incident_type1==$v["incident_type1"] && incident_type2==$v["incident_type2"]
								){
									//console.log("except :: "+$k+" :: "+exceptObj["lngtd"]+"=="+$v["lngtd"]+" :: "+exceptObj["ltitde"]+"=="+$v["ltitde"]+" :: "+incident_type1+"=="+$v["incident_type1"]+" :: "+incident_type2+"=="+$v["incident_type2"]);
									incidentData[$k]["except_arr"].push(exceptObj);
									//console.log("===exceptObj selected===================");
									//console.log(exceptObj);
									//console.log("======================");
									//return true;
								}
							});
							
						});
					
						
						
						

									
						if(!$target.framecreated){
							

							
							
	
						}
						
						
						$.each($("div#Document_CH03"),function(){
							if($(this).html()=="") $(this).remove();
						});
						
						

						if(IsChkCnt>0){
							console.log("====refresh====");
							setTimeout(function(){
								IsChkCnt = 0;
								Qv.GetCurrentDocument().SetVariable("vREFRESH","1");
							},1100);
						}else{
							console.log("====data loading success====");
							
							setTimeout(function(){
								
								if(vSHOW_TYPHOON_YN=="ON") setTyphoonIcon();
								
								if(oldMAPTYPE!=vMAPTYPE){
									drawMAP();
								}
								
								clearWeather();
								if(vSHOW_WEATHER_YN=="ON") drawWeather();
								showTyphoonIcon();
								drawINCIDENT();
								
							},1200);
						}

					}catch(e){
						console.log(e);
					}
				


					
					
					
					
				
				//onload와 같은 기능 --------------------------------------끝
	                });
				varsRetrieved = true;
				
				}
				       
				
				});
				//onload와 같은 기능 --------------------------------------끝
				
			});
	
		});
	});	
});