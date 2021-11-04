'use strict'
var ExName = "QvOSM_PTM";
var QvOSM_exUrl = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/"+ExName+"/";

var $target;
var uId;
var vesselLayer;
var ol;
var doc2 = Qv.GetCurrentDocument();

var cqv;
var $_VAR = {};

var port_YN="N";
var QvOSM_PVM_MAP;
var MapTypeGroup = {};
var moveArea = [];
var aniFea = [];
var QvOSM_PVM_Opt = {};
var mapAniObj = null;
var firstCenter = [];

var IsChkCnt = 0;
var Refresh_cnt = 0;

var defMap = "layersMb2";

var vMAP;
var vMAPTYPE;
var oldMAPTYPE;

var vCURR_TYPHOON;
var vCURR_TYPHOON_ARR;
var vCURR;
var vVIEWTYPE;

var vSTD_ROUTE_YN;
var vSTD_YN;

var vSTD_THRE_YN;
var vTHRE_YN;

var vHIS;
var vSTD = null;
var vSEA;
var vTHRE;
var vNTHRE;
var vTHRE_CNT;

var vSEL_STD_THRES;
var vSTD_ROUTE_ARR = new Array();

var vSTD_ROWS;
var vSTD_DATA = new Array();

var vSEA_ROWS;
var vSEA_DATA = new Array();

var vHIS_ROWS;
var vHIS_DATA = new Array();

var vFROMTO;
var vFROM_PORT;
var vTO_PORT;

var vTHRESHOLD;
var vNEWTHRESHOLD;

var ROUTE_LINE_ARR = new Array();

var vSELECT;
var vSEL;

var vTY_STATUS_DATA;
var vTY_STATUS = {};

var vLAST_TYPHOON;
var vLAST_TYPHOON_NM;
var vLAST_TYPHOON_ARR = new Array();

var TYPHOON_ICON_ARR = new Array();

var vTYPHOON;
var vTYPHOON_DATA_ARR = new Array();
var vTYPHOON_CNT = 0;

var typhoonData;

var scaleLineControl;

var DRAW_TIM;
var oldVIEWTYPE;
var VESSEL_STATUS = {};

var typoonObj={};
var typhoon_info = [];
var broken_aniarr=[];
var tyDateLabel = false;
var vesselLabel = false;
var tyDateLabelC = tyDateLabel;
var vesselLabelC = vesselLabel;
var oldZoom = 3;
var vesselZoom=1;
var vesselFeaturelist=[];
/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

var typhooniconlayerlist = [];

var routelinelayerlist = [];
var mouseover_route_obj;


var mouseclick_typhoon_tim = new Array();
var mouseclick_typhoon_obj;




//설정값 변수
var zoom = "3";
var center = [127,38];
var weatherFlag = false;
var vesselFlag = false;
var typhoonFlag = false;
var aniFlag = false;
var aniInterval = 10;

var defMove = "fly";

var offy = 15;

var weatherLayerDs = "none";


//perfect scrollar plugin
var ps;






function getDistance(pt, pt2){
	var x2 = Math.pow((pt[0]-pt2[0]),2);
	var y2 = Math.pow((pt[1]-pt2[1]),2);
	return Math.sqrt((x2+y2));
}






//+에서 -로 가는 route 보정
function getroutepathCoord(datarow){

	var route_arr =[];
	var org_arr = [];
	var r360_arr = [];

	var min_cnt = 0;
	$.each(datarow,function($k,$v){

		if($v[0]<0) min_cnt++;

		org_arr.push(ol.proj.fromLonLat($v));
		if($v[0]<0) r360_arr.push(ol.proj.fromLonLat([360+$v[0],$v[1]])); else r360_arr.push(ol.proj.fromLonLat($v));

	});



	for(var i=0;i<datarow.length-1;i++){

		if((datarow[i][0]+datarow[i+1][0])<-200){

			datarow[i][0]=datarow[i][0]+360;
			if(i==(datarow.length-2)){
				datarow[i+1][0]=datarow[i+1][0]+360;
			}
		}else{

			if(Math.abs(datarow[i][0] - datarow[(i+1)][0]) > 200){
				if(datarow[i][0] > 0 && datarow[(i+1)][0] < 0){
					datarow[(i+1)][0]=datarow[(i+1)][0]+360;
				}else if(datarow[i][0] < 0 && datarow[(i+1)][0] > 0){
					datarow[i][0]=datarow[i][0]+360;
				}

			}
		}
		if(i==(datarow.length-2)){
			route_arr.push(ol.proj.fromLonLat(datarow[i]));
			route_arr.push(ol.proj.fromLonLat(datarow[(i+1)]));
		}else{
			route_arr.push(ol.proj.fromLonLat(datarow[i]));
		}


	}


	//직선경로일경우 짧은 경로를 선택
	if(r360_arr.length>0 && datarow.length==2){
		var org_dist = getDistance(org_arr[0],org_arr[1]);
		var route_dist = getDistance(route_arr[0],route_arr[1]);
		var r360_dist = getDistance(r360_arr[0],r360_arr[1]);
		if(org_dist <= r360_dist){
			return org_arr;
		}else{
			//console.log("기존경로 :: "+org_arr);
			//console.log("기존경로 거리 :: "+org_dist);
			//console.log("변경경로 :: "+r360_arr);
			//console.log("변경경로 거리 :: "+r360_dist);
			//console.log("getroutepathCoord :: 변경 경로가 기존 경로 보다 짧아서 변경경로 사용");
			return r360_arr;
		}
	}else{
		if(min_cnt == datarow.length){
			return org_arr;
		}else{
			//console.log("getroutepathCoord :: 변동 경로 사용");
			return route_arr;
		}
	}






}












var SOURCE_OBJ = {};
var LAYER_OBJ = {};
var ROUTE_LINE_ARR = new Array();


var zIndex = 0;
var drawLine = function(id, obj, route_arr, width, zoomlevel, linecolor, linestyle, descript, offsetX, offsetY, textAlign, fontstyle, fontcolor){


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
		              color: fontcolor
		            }),
					stroke: new ol.style.Stroke({
						color: 'rgba(0, 0, 0, 0.5)',
						width: (nwidth ? nwidth : 0.5)
					})
		        }),
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
					src: QvOSM_exUrl+'icon/'+obj["icon"]+'.png',
					scale: nwidth
				}),
		        text: new ol.style.Text({
		            font: (fontstyle ? fontstyle : '14px Calibri,sans-serif'),
		            text: descript ? descript+"" : "",
            		textAlign: (textAlign ? textAlign : "left"),
					offsetY: (offsetY ? offsetY : 15),
					offsetX: (offsetX ? offsetX : 10),
		            overflow: true,
		            fill: new ol.style.Fill({
		              color: fontcolor
		            }),
					stroke: new ol.style.Stroke({
						color: 'rgba(0, 0, 0, 0.5)',
						width: (nwidth ? nwidth : 0.5)
					})
		        })
			});

		break;
	case "stroke_point":
		geoStyle_obj = new ol.geom.Point(crdnt2);

		style_obj =
			new ol.style.Style({
			    image: new ol.style.Circle({
			        radius: nwidth,
			        fill: new ol.style.Fill({
								color: linecolor
							}),
			        stroke: new ol.style.Stroke({
			            color: 'rgba(0, 0, 0, 0.5)',
			            width: nwidth/20
			        })
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

	if(SOURCE_OBJ[id]==null){
		SOURCE_OBJ[id] = new ol.source.Vector({
			features: geoFeatures2
		});
	}




	var lFea2 = new ol.Feature({
			  geometry: geoStyle_obj,
			  name: obj["key"]
		  });


	style_obj.setZIndex(zIndex++);

	lFea2.set("ref",obj);
	lFea2.set("style", style_obj);





	lLines2.push(lFea2);
	SOURCE_OBJ[id].addFeatures(lLines2);


};



var addLayer = function($target){
	if(LAYER_OBJ[$target]==null){
		LAYER_OBJ[$target] = new ol.layer.Vector({
			source: SOURCE_OBJ[$target],
			style: function(feature){
				return feature.get("style");
			}
		});
	}else{
		QvOSM_PVM_MAP.removeLayer(LAYER_OBJ[$target]);
	}

	try{
		QvOSM_PVM_MAP.addLayer(LAYER_OBJ[$target]);
	}catch(e){
		console.log(e);
	}
};


var removeLayer = function($target){
	if(LAYER_OBJ[$target]){
		try{
			SOURCE_OBJ[$target].removeFeature(SOURCE_OBJ[$target].getFeatures()[0]);
		}catch(e){
			console.log(e);
		}
		try{
			SOURCE_OBJ[$target].clear();
		}catch(e){
			console.log(e);
		}
		try{
			LAYER_OBJ[$target] = QvOSM_PVM_MAP.removeLayer(LAYER_OBJ[$target]);
		}catch(e){
			console.log(e);
		}
		try{
			delete LAYER_OBJ[$target];
		}catch(e){
			console.log(e);
		}
	}
};


var clearTyphoonIcon = function(){

	try{
		removeLayer("mouseover");
	}catch(e){

	}


	$.each(TYPHOON_ICON_ARR,function($key,$value){

		$.each($value["data"],function($k,$v){
			try{
				if(LAYER_OBJ[$v["type"]+"_"+$key+"_line_"+$k]!=null) removeLayer($v["type"]+"_"+$key+"_line_"+$k);
			}catch(e){

			}

			try{
				if(LAYER_OBJ[$v["type"]+"_"+$key+"_dash_"+$k]!=null) removeLayer($v["type"]+"_"+$key+"_dash_"+$k);
			}catch(e){

			}

			try{
				if(LAYER_OBJ[$v["type"]+"_"+$key+"_34knot_"+$k]!=null) removeLayer($v["type"]+"_"+$key+"_34knot_"+$k);
			}catch(e){

			}

			try{
				if(LAYER_OBJ[$v["type"]+"_"+$key+"_50knot_"+$k]!=null) removeLayer($v["type"]+"_"+$key+"_50knot_"+$k);
			}catch(e){

			}

			try{
				if(LAYER_OBJ[$v["type"]+"_"+$key+"_icon_"+$k]!=null) removeLayer($v["type"]+"_"+$key+"_icon_"+$k);
			}catch(e){

			}

			try{
				if(LAYER_OBJ[$v["type"]+"_"+$key+"_text_"+$k]!=null) removeLayer($v["type"]+"_"+$key+"_text_"+$k);
			}catch(e){

			}
		});
	});



};



var clearRouteLine = function(){

	$.each(ROUTE_LINE_ARR,function($k,$v){

		try{
			if(LAYER_OBJ[$v["type"]+"_"+$k]!=null) removeLayer($v["type"]+"_"+$k);
		}catch(e){

		}

	});

};

var removeAllLayer = function(){
	$.each(LAYER_OBJ,function($k,$v){
		removeLayer($k);
	});
};



var removeTyphoonVessel = function(){


	$.each(vTY_STATUS[$_VAR["vSEL_TYPHOON"]],function($key,$value){

		var $v2 = null;
		$.each($value,function($k,$v){//vessel line

			$v2 = JSON.parse(JSON.stringify($v));

		});

		removeLayer($v2["key_typhoon"]+"_vessel_dash_"+$v2["mmsi_no"]);


		$.each($value,function($k,$v){//vessel icon

			removeLayer($v["key_typhoon"]+"_vessel_icon_"+$v["mmsi_no"]+"_"+$k);
			removeLayer($v["key_typhoon"]+"_vsl_name_"+$v["mmsi_no"]+"_"+$k);
			removeLayer($v["key_typhoon"]+"_vessel_icon_"+$v["mmsi_no"]+"_"+$k);

		});


	});



};


var drawTyphoonVessel = function(){
	if(vesselLayer) QvOSM_PVM_MAP.removeLayer(vesselLayer);


	if(vTY_STATUS[$_VAR["vSEL_TYPHOON"]]){
		$.each(vTY_STATUS[$_VAR["vSEL_TYPHOON"]],function($key,$value){//vessel

			//vessel의 경로가 하나만 있는데 Gray인 경우에는 제외
			if($value.length==1 && ($value[0]["status"]=="Z" || $value[0]["status"]=="G")) return true;

			var $arr = new Array();
			var $v2 = null;
			$.each($value,function($k,$v){//vessel line

				$v2 = JSON.parse(JSON.stringify($v));
				$arr.push($v2["point"]);

			});

			$v2["type"] = "vessel_dash";
			$v2["linestyle"] = "dash";
			$v2["line"] = ($arr.length>0 ? [getroutepathCoord($arr)] : new Array());
			$v2["tooltip"] = null;


			drawLine($v2["key_typhoon"]+"_vessel_dash_"+$v2["mmsi_no"], $v2, $v2["line"], 3, null, "rgba(56, 87, 35, 0.5)", "dash");
			addLayer($v2["key_typhoon"]+"_vessel_dash_"+$v2["mmsi_no"]);


			$.each($value,function($k,$v){//vessel icon

				var point = ol.proj.fromLonLat($v["point"]);


				if(QvOSM_PVM_MAP.getView().getZoom()>4){
					drawLine($v["key_typhoon"]+"_vessel_icon_"+$v["mmsi_no"]+"_"+$k, $v, point, 0.6, null, null, "icon",$v["date"],null,null,null,"12px Calibri,sans-serif","rgba(255, 255, 255, 0.8)");
					addLayer($v["key_typhoon"]+"_vessel_icon_"+$v["mmsi_no"]+"_"+$k);

					if($k==0){
						drawLine($v["key_typhoon"]+"_vsl_name_"+$v["mmsi_no"]+"_"+$k, $v, point, 0.5, null, null, "text",$v["vsl_name"],null,null,null,"bold 14px Calibri,sans-serif","rgba(255, 248, 0, 1)");
						addLayer($v["key_typhoon"]+"_vsl_name_"+$v["mmsi_no"]+"_"+$k);
					}
				}else{
					drawLine($v["key_typhoon"]+"_vessel_icon_"+$v["mmsi_no"]+"_"+$k, $v, point, 0.5, null, null, "icon");
					addLayer($v["key_typhoon"]+"_vessel_icon_"+$v["mmsi_no"]+"_"+$k);
				}

			});



		});
	}



};








Qva.LoadCSS(QvOSM_exUrl+"css/perfect-scrollbar.css");
Qva.LoadCSS(QvOSM_exUrl+"css/Style.css");
Qva.LoadCSS(QvOSM_exUrl+"css/ol.css");
Qva.LoadCSS(QvOSM_exUrl+"css/bootstrap.min.css");

Qva.LoadScript(QvOSM_exUrl+"Options.js", function(){
Qva.LoadScript(QvOSM_exUrl+"js/perfect-scrollbar.js", function(){
Qva.LoadScript(QvOSM_exUrl+"js/d3.v3.min.js", function(){
	Qva.LoadScript(QvOSM_exUrl+"js/ol.js", function(){
		ol=ol;

		//typhoon rader :: weather disabled
		//var drawWtLayer;





		var createvesselIcon = function(style,icon, rotation, scale, name, offx, offy) {
			var imageicon;
			var opacity;

			if(style=="normal"){
				var isEX = icon.split("_")[1];
				switch(isEX) {
					case "EXCEPTION":
						imageicon = "Vessel_EXCEPTION_S";
					break;
					case "BROKEN":
						imageicon = "Vessel_BROKEN_S";
						break;
					case "NOTMOVING":
						imageicon = "Vessel_NOTMOVING_S";
						break;
					case "MOVING":
						imageicon = "Vessel_MOVING_S";
						break;
					case "Gray":
						imageicon = "Vessel_Gray_S";
						break;
					default:
						imageicon = "Vessel_Gray_S";
						break;
				}
				scale=0.6;
				opacity=0.6;
			}else{
				imageicon=icon;
				opacity=0.6;
			}


			var obj = {
				image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
					scale: scale ? scale : 1,
					src: QvOSM_exUrl+'icon/'+imageicon+'.png',
					rotation : 0,//rotation ? rotation * Math.PI / 180 : 0
					opacity : opacity
				}))
			};
			//레이블 폰트
			if(name){

				obj.text = new ol.style.Text({
						text: name,
						scale:1,
						offsetY: offy || 22,
						offsetX: offx || 0,
						stroke: new ol.style.Stroke({color: "#333", width:0.5}),
						fill: new ol.style.Fill({
						  color: '#eee'
						})
					});
			};

			var ret = new ol.style.Style(obj);
			ret.setZIndex(zIndex++);

			return ret;
		}

		function flash(feature,number) {
			var start = new Date().getTime();
			var listenerKey;
			var duration = 10000;



			function animate(event) {
				var vectorContext = event.vectorContext;
			    var frameState = event.frameState;
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

				style.setZIndex(zIndex++);

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



		function typhoon_flash(feature,number) {
			var start = new Date().getTime();
			var listenerKey;
			var duration = 10000;

			var win_speed = feature.get("speed");

			var win_color = "255, 217, 0";

			if(feature.color){
				win_color = feature.color;
			}else{
				if(win_speed>=50){
					win_color = "205, 60, 0";
				}else{
					win_color = "255, 217, 0";
				}
			}

			//console.log(feature);


			function animate(event) {
				var cycle_zoom = QvOSM_PVM_MAP.getView().getZoom();
				var ratio = 10;//만약에 태풍 폴리곤 대신 태풍 아이콘으로 간다면 이 값은 20
				var default_size = 15; //만약에 태풍 폴리곤 대신 태풍 아이콘으로 간다면 이 값은 31
				switch(cycle_zoom){
				case 2:
					default_size = 0;//만약에 태풍 폴리곤 대신 태풍 아이콘으로 간다면 이 값은 15
					ratio = 5;//만약에 태풍 폴리곤 대신 태풍 아이콘으로 간다면 이 값은 10
					break;
				case 3:
					default_size = default_size;
					break;
				case 4:
					default_size = default_size*(cycle_zoom-1)-10;
					break;
				case 5:
					default_size = default_size*(cycle_zoom-1)*1.5;
					break;
				case 6:
					default_size = default_size*(cycle_zoom-1)*2.5;
					break;
				case 7:
					default_size = default_size*(cycle_zoom-1)*4.5;
					break;
				}

				var vectorContext = event.vectorContext;
			    var frameState = event.frameState;
				var flashGeom = feature.getGeometry().clone();
				var elapsed = frameState.time - start;
				var elapsedRatio = elapsed / duration;
				// radius will be 5 at start and 30 at end.
				var radius = ol.easing.easeOut(elapsedRatio) * ratio + default_size;
				var opacity = ol.easing.easeOut(1 - elapsedRatio);
				var style
				if(true){
					style = new ol.style.Style({
						image: new ol.style.Circle({
							radius: radius,
							snapToPixel: false,
							stroke: new ol.style.Stroke({
								color: 'rgba('+win_color+', ' + opacity + ')',
								width: 0.5 + opacity
							})
						})
					});

				}else style = new ol.style.Style();

				style.setZIndex(zIndex++);
				vectorContext.setStyle(style);
				vectorContext.drawGeometry(flashGeom);
				if (elapsed > duration) {
					ol.Observable.unByKey(listenerKey);

				}
				 // tell OpenLayers to continue postcompose animation

				QvOSM_PVM_MAP.render();

			}
			listenerKey = QvOSM_PVM_MAP.on('postcompose', animate);
			broken_aniarr[number]=setTimeout(function(){typhoon_flash(feature,number)},10000);
		}



		if (Qva.Mgr.mySelect == undefined) {

			Qva.Mgr.mySelect = function (e, t, n, r) {

				if (!Qva.MgrSplit(this, n, r)) return;
				e.AddManager(this);
				this.Element = t;
				this.ByValue = true;
				t.binderid = e.binderid;
				t.Name = this.Name;
				t.onchange = Qva.Mgr.mySelect.OnChange;
				t.onclick = Qva.CancelBubble
			};
			Qva.Mgr.mySelect.OnChange = function () {
				var e = Qva.GetBinder(this.binderid);
				if (!e.Enabled) return;
				if (this.selectedIndex < 0) return;
				var t = this.options[this.selectedIndex];
				e.Set(this.Name, "text", t.value, true)
			};
			Qva.Mgr.mySelect.prototype.Paint = function (e, t) {
				this.Touched = true;
				var n = this.Element;
				var r = t.getAttribute("value");
				if (r == null) r = "";
				var i = n.options.length;
				n.disabled = e != "e";
				for (var s = 0; s < i; ++s) {
					if (n.options[s].value === r) {
						n.selectedIndex = s
					}
				}
				n.style.display = Qva.MgrGetDisplayFromMode(this, e)
			}
		}




















		var drawMAP = function(){

			QvOSM_PVM_Opt = {
					"weather":weatherFlag,
					"vessel":vesselFlag,
					"typhoon":typhoonFlag,
					"zoom":zoom,
					"center":center,
					"ani":aniFlag,
					"port":vesselFlag
				};

			if(mapAniObj != null){
				clearInterval(mapAniObj);
				mapAniObj = null;
			}
			var frmW = $target.GetWidth();
			var frmH = $target.GetHeight();

			tyDateLabelC = tyDateLabel;
			vesselLabelC = vesselLabel;

			var htmlString = "";

			htmlString += '<div id="pointPopup" class="ol-popup"><div class="ol-popup-title"><span class="ol-popup-headtitle-content"></span><span class="ol-popup-title-content"></span></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;"></a><div id="popup-content" style="white-space:pre-line;"></div></div><div id="geo-marker"></div>'+
							'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
						  '</div>';
			htmlString += '<div id="map_position" style="position:absolute;bottom: 10px;right: 50px;color:#ffffff;background:rgba(131, 151, 169, 0.5);"></div>';
			htmlString += '<div id="map_position_append_wrap" style="display:none;position:absolute;bottom:10px;right:50px;background:rgba(131, 151, 169, 0.5);max-height:150px;padding-top:10px;padding-left:10px;"><textarea id="map_position_append" style="width:180px;height:110px;border:none;background: transparent;" readonly="readonly"></textarea></div>';
			htmlString += '<div id="tooltip"></div>';


			$target.Element.innerHTML = htmlString;

			$target.framecreated = true;



			//좌표 보여주는 로직
			$("#map_position").off("mouseover").on("mouseover",function(){
				$("#map_position_append_wrap").show()
			});

			$("#map_position_append_wrap").off("mouseout").on("mouseout",function(){
				$("#map_position_append_wrap").hide()
			});

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
//						url: 'https://api.mapbox.com/styles/v1/seungok/ciov2x7gj003qdpnjymn2em34/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
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



			var mapCenter = QvOSM_PVM_Opt["center"];

			if(mapCenter){
				mapCenter = ol.proj.fromLonLat([parseFloat(mapCenter[0]),parseFloat(mapCenter[1])]);
			}else{
				mapCenter = ol.proj.fromLonLat([127,38]);
			}

			if(firstCenter.length > 0 && aniFlag == true){
				mapCenter = ol.proj.fromLonLat(firstCenter);
			}

			//전체 맵 그리기

			scaleLineControl = new ol.control.ScaleLine();


			try{
				QvOSM_PVM_MAP.setLayerGroup(new ol.layer.Group());
//				console.log("==============================맵삭제=================================");
			}catch(e){
				console.log(e);
			}


			try{
				QvOSM_PVM_MAP = new ol.Map({
					layers: MapTypeGroup,
					controls: ol.control.defaults().extend([
						//new ol.control.FullScreen(),
						//new ol.control.OverviewMap(),
						scaleLineControl,
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

			scaleLineControl.setUnits("nautical");

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

			// 툴팁
			var overlay = new ol.Overlay({
				element: document.getElementById("tooltip"),
			    positioning: 'bottom-left',
			    offset: [20,20]
			});
			overlay.setMap(QvOSM_PVM_MAP);



			QvOSM_PVM_MAP.addOverlay(pointPopup);

			var pointPopupContent = document.getElementById('popup-content');
			var pointPopupCloser = document.getElementById('popup-closer');

			pointPopupCloser.onclick = function() {

				pointPopup.setPosition(undefined);
				pointPopupCloser.blur();
				if(port_YN=="Y"){
					doc2.SetVariable("vCALL_PORT","");
					port_YN="N";
				}


				select.getFeatures().clear();
				return false;
			};





			/* 선택 인터랙션 */
			var select = new ol.interaction.Select({
				style: function(feature) {
					return feature.get('sel_style') || feature.get('style');
				}
			});

			//팝업위치 틀어짐 방지
			var _top = $("#pointPopup").css("top");
			var _left = $("#pointPopup").css("left");

			//QvOSM_PVM_MAP.getInteractions().extend([select]);
			QvOSM_PVM_MAP.addInteraction(select);
			//싱슬 클릭시 이벤트
			QvOSM_PVM_MAP.on("singleclick", function (evt) {
				select.getFeatures().clear();

				//draggable에 의한 위치 초기화
				$("#pointPopup").attr("style","");

				var coordinate = evt.coordinate;


				//좌표로직
				var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
				var str = $("#map_position_append").text();
				var str_arr = str.split("\n");
				var appnd = "";

				if(str_arr.length>4){
					delete str_arr[0];
					str_arr = $.grep(str_arr,function(n){ return(n) });
				}
				$.each(str_arr,function($k,$v){

					appnd+=appnd=="" ? $v : "\n"+$v;

				});
				appnd+=appnd=="" ? "[ "+coord[1].toFixed(6)+" , "+coord[0].toFixed(6)+" ]" : "\n"+"[ "+coord[1].toFixed(6)+" , "+coord[0].toFixed(6)+" ]";
				$("#map_position_append").text(appnd);



				var popup = null;
				var type = 	null;
				var vsl_nm = null;

				var info = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
					select.getFeatures().push(feature);

					popup = feature.get("popup") ? feature.get("popup") : feature.get("ref")["popup"];
					type = 	feature.get("type") ? feature.get("type") : feature.get("ref")["type"];
					vsl_nm = feature.get("tyKey") ? feature.get("tyKey") : feature.get("ref")["vsl_name"];

					if(type=="vessel"){
						//console.log(feature);
						//$(".ol-popup-headtitle-content").html("<img style='width:20px;' src='"+QvOSM_exUrl+"icon/ship.png"+"'/>");
						$(".ol-popup-headtitle-content").html("");
						$(".ol-popup-title-content").text(vsl_nm);

						//typhoon rader :: popup and mmsi_no set
						$(".ol-popup-title-content").off("click").on("click",function(){
							//Qv.GetDocument("").SetVariable("vMMSI_NO",feature.get("mmsi"));
							$("#popup-closer").trigger("click");
						});

						$("#pointPopup").addClass("vessel");


					}else{
						$("#pointPopup").removeClass("vessel");
					}

					return feature;

				});



				//history route 선택 해제시 vSEL_ROUTE_KEY 변수 값 전달
				if(info!=null && info.get("ref")){

					var $obj = info.get("ref");




					switch($obj["type"]){
					case "typhoon":

						if(vVIEWTYPE == "1"){
							Qv.GetCurrentDocument().SetVariable("vSEL_TYPHOON",$obj["key"]);
						}

						break;
					case "stdroute":
						Qv.GetCurrentDocument().SetVariable("vSEL_ROUTE_KEY","");
						Qv.GetCurrentDocument().SetVariable("vSEL_STD_ROUTE_NUM",$obj["route_no"]);//엑셀 export 하기 위해 사용하는 키
						break;
					case "hisroute":
						Qv.GetCurrentDocument().SetVariable("vSEL_STD_ROUTE_NUM","");
						Qv.GetCurrentDocument().SetVariable("vSEL_ROUTE_KEY",$obj["key"]); //마우스로 클릭했을때 qlikview에 값을 전달하여 선택한 route만 보이게 한다.
						break;
					}

				}else{

					if($_VAR["vSEL_TYPHOON"]){
						Qv.GetCurrentDocument().SetVariable("vSEL_TYPHOON","");
					}


					if($_VAR["vSEL_ROUTE_KEY"]!="" || $_VAR["vSEL_STD_ROUTE_NUM"]!=""){
						Qv.GetCurrentDocument().SetVariable("vSEL_ROUTE_KEY","");
						Qv.GetCurrentDocument().SetVariable("vSEL_STD_ROUTE_NUM","");
					}

				}





				//history route 선택 해제시 vSEL_ROUTE_KEY 변수 값 초기화
				if(vVIEWTYPE==3 && info==null){
					Qv.GetCurrentDocument().SetVariable("vSEL_ROUTE_KEY","");
				}

//				console.log(info);
				if(info!=null && popup){



					pointPopupContent.innerHTML = '<p class="popup_content" style="width:300px;word-break: break-all;">'+popup+'</p>';
					$(".ol-popup-title-content").attr("def",type);
					$(".ol-popup .popup_content").attr("def",type);
					pointPopup.setPosition(coordinate);
				} else {

					$("#popup-closer").trigger("click");
				}

				$("#pointPopup").css("top",_top);
				$("#pointPopup").css("left",_left);
				$("#pointPopup").draggable();

				//console.log(coordinate);

			});

			QvOSM_PVM_MAP.on("dblclick", function (evt) {
				//var mouseCoordInMapPixels = [evt.originalEvent.offsetX, evt.originalEvent.offsetY];
				var coordinate = evt.coordinate;
				var tyKey = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {

					if(feature.get("type")=="vessel"){
						return [feature.get("popup"),feature.get("tyKey")];
					}


				});

				if(tyKey){

						$(".ol-popup-title-content").text(tyKey[1]);
						$("#pointPopup").removeClass("vessel");
						$("#pointPopup").addClass("vessel");
						pointPopupContent.innerHTML = '<p class="popup_content">'+tyKey[0]+'</p>';
						pointPopup.setPosition(coordinate);

						doc2.SetVariable("vDimension_YN","Y");
						doc2.SetVariable("vVessel",tyKey[1]);
						evt.preventDefault();

				}else{
					if($_VAR["vVessel"]!=""){
						doc2.SetVariable("vDimension_YN","N");
						doc2.SetVariable("vVessel","");
						$("#popup-closer").trigger("click");
					}
				}
			});



			QvOSM_PVM_MAP.un("pointermove");
			QvOSM_PVM_MAP.on('pointermove', function(evt) {

				if (evt.dragging) return;

				select.getFeatures().clear();

				var coordinate = evt.coordinate;
				var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
				$("#map_position").html("[ "+coord[1].toFixed(6)+" , "+coord[0].toFixed(6)+" ]");



				var $obj = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function(feature) {
					overlay.setPosition(evt.coordinate);
					return feature;
				});


			  document.body.style.cursor = $obj ? 'pointer' : '';



			  if(LAYER_OBJ["mouseover"]!=null) removeLayer("mouseover");

				if($obj!=null && $obj.get("ref")!=null){
					switch($obj.get("ref")["type"]){
					case "typhoon":
						break;
					case "stdroute":
						drawLine("mouseover", $obj.get("ref"), $obj.get("ref")["data"], 5, null, "rgba(10, 219, 255, 0.5)", $obj.get("ref")["linestyle"]);
						addLayer("mouseover");

						if($obj!=null && $obj.get("ref")!=null && $obj.get("ref")["tooltip"]!=null){
//							console.log($obj.get("ref")["tooltip"]);
							overlay.getElement().innerHTML = $obj.get("ref")["tooltip"];
						}

						break;
					case "hisroute":
						drawLine("mouseover", $obj.get("ref"), $obj.get("ref")["data"], 5,  null, "rgba(84, 130, 53, 0.5)","line");
						addLayer("mouseover");
						break;
					case "vessel":
						overlay.getElement().innerHTML = $obj.get("ref")["tooltip"];
						break;
					case "vessel_dash":
						drawLine("mouseover", $obj.get("ref"), $obj.get("ref")["line"], 15, null, "rgba(82, 176, 222, 0.5)", "line");
						addLayer("mouseover");
						break;
					}


				}

				overlay.getElement().style.display = ($obj && $obj.get("ref") && $obj.get("ref")["tooltip"]) ? 'inline-block' : 'none';

			});















		};



		Qva.AddExtension(ExName, function() {



			if($("#loading_div").length==0)
				$("body").append('<div id="loading_div" style="position: absolute;z-index: 999;text-align: center;vertical-align: middle;width:100%;height:100%;background:#000000;opacity:0.5;display:none;">'
						+'<div style="position: absolute; left: 50%; top: 50%;"><img style="width:150px;" src="'+QvOSM_exUrl+'icon/Loading_icon.gif"/></div>'
						+'</div>');

			$("#loading_div").show();

            cqv = Qv.GetDocument("");
            var vTyphoon_Var_Lisr = cqv.GetObject("vTyphoon_Var_Lisr") ;
            //console.log( 'vTyphoon_Var_Lisr : ', cqv.GetObject("vTyphoon_Var_Lisr") );
            //console.log( 'vTyphoon_Var_Lisr length : ', vTyphoon_Var_Lisr.Data.Rows.length );



			$target = this;

			//onload와 같은 기능 --------------------------------------시작
			// cqv = Qv.GetDocument("");
			var varsRetrieved = false;
			cqv.SetOnUpdateComplete(function(){
			if(!varsRetrieved){

				console.log( 'vTyphoon_Var_Lisr : ', vTyphoon_Var_Lisr );
				console.log( 'vTyphoon_Var_Lisr length : ', vTyphoon_Var_Lisr.Data.Rows.length );

                if( vTyphoon_Var_Lisr.Data.Rows.length > 0 ){

                    //GetVariable(0) vCURR : 현재 시트 값 가져오기
                    //현재화면 /히스토리 화면 전환용;
    				oldVIEWTYPE = vVIEWTYPE;
                    if( vTyphoon_Var_Lisr.GetVariable(0).text ){
                        try{
                            if(vCURR==null) vCURR = vTyphoon_Var_Lisr.GetVariable(0).text;
                            vVIEWTYPE = ( ( vCURR=="-" || vCURR=="1") || vCURR==null ) ? "1" : vCURR;
                            // console.log( 'vVIEWTYPE : ', vVIEWTYPE );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(0).text get Error', e );
                        }
                    }
                    //GetVariable(1) vMAP2 : Map Type 가져오기
                    if( vTyphoon_Var_Lisr.GetVariable(1).text ){
                        // console.log( 'vTyphoon_Var_Lisr.GetVariable(1).text 들어옴' );
                        try{
                            //maptype row data;
                            if(vMAP==null) vMAP = vTyphoon_Var_Lisr.GetVariable(1).text;
                            // console.log( 'vMAP : ', vMAP );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(1).text get Error', e );
                        }
                    }
                    //GetVariable(2) vSetup_Flag : 현재 시트 값 가져오기

                    //GetVariable(3) vSTD_ROUTE_YN : 메인 화면에서 standard route 를 보여줄건지 여부
                    if( vTyphoon_Var_Lisr.GetVariable(3).text ){
                        // console.log( 'vTyphoon_Var_Lisr.GetVariable(3).text 들어옴' );
                        try{
                            if(vSTD_ROUTE_YN==null) vSTD_ROUTE_YN = vTyphoon_Var_Lisr.GetVariable(3).text;
                            // console.log( 'vSTD_ROUTE_YN : ', vSTD_ROUTE_YN );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(3).text get Error', e );
                        }
                    }


                    //GetVariable(4) vLAST_TYP : 현재 태풍이 없으면 제일 마지막으로 발생한 태풍을 가져와서 보여준다
                    if( vTyphoon_Var_Lisr.GetVariable(4).text ){
                        // console.log( 'vTyphoon_Var_Lisr.GetVariable(4).text 들어옴' );
                        try{
                            if(vLAST_TYPHOON==null) vLAST_TYPHOON = vTyphoon_Var_Lisr.GetVariable(4).text;
                            // console.log( 'vLAST_TYPHOON : ', vLAST_TYPHOON );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(4).text get Error', e );
                        }
                    }

                    //GetVariable(5) vTYPHOON_LO_NEW : 태풍데이터 값 가져오기
                    if( vTyphoon_Var_Lisr.GetVariable(5).text ){
                        //console.log( 'vTyphoon_Var_Lisr.GetVariable(5).text 들어옴' );
                        try{
                            //typhoon row data;
                            if(vTYPHOON==null) vTYPHOON = JSON.parse(vTyphoon_Var_Lisr.GetVariable(5).text);
                            //console.log( 'vTYPHOON : ', vTYPHOON );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(5).text get Error', e );
                        }
                    }
                    //GetVariable(6) vSTD : threshold 화면에서 표준 route data
    				//if(vSTD==null) vSTD = cqv.GetObject("vSTD");
                    if( vTyphoon_Var_Lisr.GetVariable(6).text ){
                        try{

                            if(vSTD==null) vSTD = JSON.parse(vTyphoon_Var_Lisr.GetVariable(6).text);
                            // console.log( 'vSTD : ', vSTD );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(6).text get Error', e );
                        }
                    }

                    //7 : vTYP2 //현재 보여줄 수 있는 태풍 배열
                    if( vTyphoon_Var_Lisr.GetVariable(7).text ){
                        try{

                            if(vCURR_TYPHOON==null) vCURR_TYPHOON = JSON.parse(vTyphoon_Var_Lisr.GetVariable(7).text);
                            // console.log( 'vCURR_TYPHOON : ', vCURR_TYPHOON );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(7).text get Error', e );
                        }
                    }

                    //8 : vTY_STATUS_DATA
                    if( vTyphoon_Var_Lisr.GetVariable(8).text ){
                        try{

                            if(vTY_STATUS_DATA == null) vTY_STATUS_DATA = JSON.parse(vTyphoon_Var_Lisr.GetVariable(8).text);
                            // console.log( 'vTY_STATUS_DATA : ', vTY_STATUS_DATA );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(8).text get Error', e );
                        }
                    }
                    //9 vFROM_PORT
                    if( vTyphoon_Var_Lisr.GetVariable(9).text ){
                        try{

                            if(vFROM_PORT  == null) vFROM_PORT  = vTyphoon_Var_Lisr.GetVariable(9).text;
                            // console.log( 'vFROM_PORT  : ', vFROM_PORT  );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(9).text get Error', e );
                        }
                    }
                    //10 vTO_PORT
                    if( vTyphoon_Var_Lisr.GetVariable(10).text ){
                        try{

                            if(vTO_PORT == null) vTO_PORT = vTyphoon_Var_Lisr.GetVariable(10).text;
                            // console.log( 'vTO_PORT : ', vTO_PORT );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(10).text get Error', e );
                        }
                    }
                    //11 vSELECT //현재 선택된 정보가 있으면 출력, 없으면 전체를 보여주지 않기 위함. 히스토리 페이지 에서만 사용;
                    if( vTyphoon_Var_Lisr.GetVariable(11).text ){
                        try{

                            if(vSELECT == null) vSELECT = vTyphoon_Var_Lisr.GetVariable(11).text;
                            // console.log( 'vSELECT : ', vSELECT );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(11).text get Error', e );
                        }
                    }
                    //12 vHIS //threshold 화면에서 route histroy data
                    if( vTyphoon_Var_Lisr.GetVariable(12).text ){
                        try{

                            if(vHIS == null) vHIS = JSON.parse(vTyphoon_Var_Lisr.GetVariable(12).text);
                            // console.log( 'vHIS : ', vHIS );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(12).text get Error', e );
                        }
                    }
                    //13 vSEA //threshold 화면에서 Searate Route data
                    if( vTyphoon_Var_Lisr.GetVariable(13).text ){
                        try{

                            if(vSEA == null) vSEA = JSON.parse(vTyphoon_Var_Lisr.GetVariable(13).text);
                            // console.log( 'vSEA : ', vSEA );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(13).text get Error', e );
                        }
                    }
                    //14 vSEL_STD_THRES //threshold 화면에서 threshold를 보여주기 위헤 route_no를 받는다.
                    if( vTyphoon_Var_Lisr.GetVariable(14).text ){
                        try{

                            if(vSEL_STD_THRES == null) vSEL_STD_THRES = JSON.parse(vTyphoon_Var_Lisr.GetVariable(14).text);
                            // console.log( 'vSEL_STD_THRES : ', vSEL_STD_THRES );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(14).text get Error', e );
                        }
                    }
                    //15 vSTD_THRE_YN //메인 화면에서 standard route의 threshold 를 보여줄건지 여부
                    if( vTyphoon_Var_Lisr.GetVariable(15).text ){
                        try{

                            if(vSTD_THRE_YN == null) vSTD_THRE_YN = vTyphoon_Var_Lisr.GetVariable(15).text;
                            // console.log( 'vSTD_THRE_YN : ', vSTD_THRE_YN );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(15).text get Error', e );
                        }
                    }

                    //18 vNEW_THRE
                    if( vTyphoon_Var_Lisr.GetVariable(18).text ){
                        try{
                            console.log( 'vNTHRE : ',vTyphoon_Var_Lisr.GetVariable(18).text );
                            if(vNTHRE == null) vNTHRE = vTyphoon_Var_Lisr.GetVariable(18).text;
                            console.log( 'vNTHRE : ', vNTHRE );
                        }catch( e ){
                            console.log( 'vTyphoon_Var_Lisr.GetVariable(18).text get Error', e );
                        }
                    }

                }else{
                    IsChkCnt++;
                }
				//모든 그렸던 레이어 삭제
				removeAllLayer();



				//display typhoon row data;
				// vCURR_TYPHOON = cqv.GetObject("vTYP2");
                // console.log( 'vCURR_TYPHOON, cqv.GetObject("vTYP2"): ', cqv.GetObject("vTYP2") );


				// if(vTY_STATUS_DATA==null) vTY_STATUS_DATA = cqv.GetObject("vTY_STATUS_VALUE");
                // console.log( 'cqv.GetObject("vTY_STATUS_VALUE") : ', cqv.GetObject("vTY_STATUS_VALUE") );


// 				//threshold 화면에서 from port data
// 				if(vFROMTO==null) vFROMTO = cqv.GetObject("vFROMTO");
//
// 				try{
// 					vFROM_PORT = vFROMTO.GetVariable(0)["text"];
// 					vTO_PORT =  vFROMTO.GetVariable(1)["text"];
// //					console.log("vFROM_PORT :: "+vFROM_PORT);
// //					console.log("vTO_PORT :: "+vTO_PORT);
// 				}catch(e){
// 					IsChkCnt++;
// 					console.log(e);
// 					//location.reload();
// 				}






				//현재 선택된 정보가 있으면 출력, 없으면 전체를 보여주지 않기 위함. 히스토리 페이지 에서만 사용;
				// if(vSELECT==null) vSELECT = cqv.GetObject("vSELECT");





				//threshold 화면에서 route histroy data
				// if(vHIS==null) vHIS = cqv.GetObject("vHIS");



				//threshold 화면에서 Searate Route data
				// if(vSEA==null) vSEA = cqv.GetObject("vSEA");





				//threshold 화면에서 threshold를 보여주기 위헤 route_no를 받는다.
				// if(vSEL_STD_THRES==null) vSEL_STD_THRES = cqv.GetObject("vSEL_STD_THRES");
                //수정 필요
				if(vVIEWTYPE==3)
					try{
						// vSEL_STD_THRES.Data.SetPagesizeY(vSEL_STD_THRES.Data.TotalSize.y);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}





				//메인 화면에서 standard route 를 보여줄건지 여부
				// if(vSTD_ROUTE_YN==null) vSTD_ROUTE_YN = cqv.GetObject("vSTD_ROUTE_YN");

				//메인 화면에서 standard route의 threshold 를 보여줄건지 여부
				// if(vSTD_THRE_YN==null) vSTD_THRE_YN = cqv.GetObject("vSTD_THRE_YN");

				//threshold 화면에서 threshold data
				// if(vTHRE==null) vTHRE = cqv.GetObject("vTHRE");
                // console.log( 'test : ', cqv.GetObject("vTHRE") );


				//threshold 화면에서 threshold data
				// if(vNTHRE==null) vNTHRE = cqv.GetObject("vNEWTHRE");






				cqv.GetAllVariables(function(variables){
				//onload와 같은 기능 --------------------------------------시작


					$_VAR = {};
					$.each(variables,function($key,$value){
						$_VAR[$value["name"]] = $value["value"];
					});




				try {

					vesselZoom=1;


					//현재 보여줄 수 있는 태풍 배열
					vCURR_TYPHOON_ARR = new Array();
					try{
						vCURR_TYPHOON_ARR = (vCURR_TYPHOON!=null && vCURR_TYPHOON.GetText()!=null && vCURR_TYPHOON.GetText()!="") ? vCURR_TYPHOON.GetText().split(",") : new Array();
					}catch(e){
						console.log(e);
					}
//					console.log("vCURR_TYPHOON_ARR :: ");
//					console.log(vCURR_TYPHOON_ARR);



					try{
						vMAPTYPE = (vMAP!=null && vMAP!="") ? vMAP : "basic";
//						console.log("vMAPTYPE :: "+vMAPTYPE);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}

					try{
						vSTD_YN = vSTD_ROUTE_YN;
//						console.log("vSTD_YN :: "+vSTD_YN);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}

					try{
						vTHRE_YN = vSTD_THRE_YN;
//						console.log("vTHRE_YN :: "+vTHRE_YN);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}

					try{
						vSEL = vSELECT;
//						console.log("vSEL :: "+vSEL);
					}catch(e){
						IsChkCnt++;
						console.log(e);
						//location.reload();
					}


					vLAST_TYPHOON_NM;;
					try{
						vLAST_TYPHOON_NM = vLAST_TYPHOON;
//						console.log("vLAST_TYPHOON_NM :: "+vLAST_TYPHOON_NM);
					}catch(e){
						IsChkCnt++;
						console.log(e);
						//location.reload();
					}

                    //수정 필요
					if((vVIEWTYPE==1 && vSTD_YN=="Y") || (vVIEWTYPE==3 && vTHRE_CNT>0 && vFROM_PORT!="-" && vTO_PORT!="-")){
						try{
							// vSTD.Data.SetPagesizeY(vSTD.Data.TotalSize.y);
							// if(vSTD.Data.Rows.length!=vSTD.Data.TotalSize.y){
							// 	IsChkCnt++;
							// }
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}
					}

                    // 수정 필요
					if(vVIEWTYPE==3 && vTHRE_CNT>0 && vFROM_PORT!="-" && vTO_PORT!="-")
						try{
							// vHIS.Data.SetPagesizeY(vHIS.Data.TotalSize.y);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}

                    // 수정 필요
					if(vVIEWTYPE==3 && vTHRE_CNT>0 && vFROM_PORT!="-" && vTO_PORT!="-")
						try{
							// vSEA.Data.SetPagesizeY(vSEA.Data.TotalSize.y);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}


					try{
						vTY_STATUS = {};
						//var vTY_STATUS_CNT = 0;

						//vTY_STATUS_DATA.Data.Rows
                        // if( vTY_STATUS_DATA === undefined ) return;
                        if( vTY_STATUS_DATA )
                        for( var i = 0 ; i < vTY_STATUS_DATA.length ; i++ ){
                            // vTY_STATUS_DATA

                            if(vTY_STATUS_DATA[i]["key_typhoon"]=="-") return;
							if(vTY_STATUS_DATA[i]["ltitde"]=="-" || vTY_STATUS_DATA[i]["ltitde"]=="-") return;


							vTY_STATUS_DATA[i]["lngtd"] = (vTY_STATUS_DATA[i]["lngtd"] && $.isNumeric(vTY_STATUS_DATA[i]["lngtd"]))	?	parseFloat(vTY_STATUS_DATA[i]["lngtd"])	:	"-";
							vTY_STATUS_DATA[i]["ltitde"] = (vTY_STATUS_DATA[i]["ltitde"] && $.isNumeric(vTY_STATUS_DATA[i]["ltitde"]))	?	parseFloat(vTY_STATUS_DATA[i]["ltitde"])	:	"-";


							vTY_STATUS_DATA[i]["point"] = [vTY_STATUS_DATA[i]["lngtd"],vTY_STATUS_DATA[i]["ltitde"]];
							vTY_STATUS_DATA[i]["direction"] = $.isNumeric(vTY_STATUS_DATA[i]["direction"].replace("_","")) ? vTY_STATUS_DATA[i]["direction"].replace("_","") : "00";
							vTY_STATUS_DATA[i]["popup"] = "Vessel Name : "+vTY_STATUS_DATA[i]["vsl_name"]+"<br/>"
											+"MMSI : "+vTY_STATUS_DATA[i]["mmsi_no"]+"<br/>"
											+"Lat : "+vTY_STATUS_DATA[i]["ltitde"]+"<br/>"
											+"Lon : "+vTY_STATUS_DATA[i]["lngtd"]+"<br/>"
											+"Next Port : "+vTY_STATUS_DATA[i]["nx_port_nm"]+"<br/>"
											+(vTY_STATUS_DATA[i]["typhoon_nm"]!="-" ? "Typhoon : "+vTY_STATUS_DATA[i]["typhoon_nm"]+"("+vTY_STATUS_DATA[i]["typhoon_nm"]+")"+"<br/>" : "")
											+"Typhoon Time : "+vTY_STATUS_DATA[i]["date"];

							switch(vTY_STATUS_DATA[i]["status"]){
							case "R": //red
								vTY_STATUS_DATA[i]["icon"] = "Vessel_EXCEPTION"+(vTY_STATUS_DATA[i]["direction"]!="" ? "_"+vTY_STATUS_DATA[i]["direction"] : "00");
								break;
							case "Y": //yellow
								vTY_STATUS_DATA[i]["icon"] = "Vessel_NOTMOVING"+(vTY_STATUS_DATA[i]["direction"]!="" ? "_"+vTY_STATUS_DATA[i]["direction"] : "00");
								break;
							case "G": //yellow
								vTY_STATUS_DATA[i]["icon"] = "Vessel_MOVING"+(vTY_STATUS_DATA[i]["direction"]!="" ? "_"+vTY_STATUS_DATA[i]["direction"] : "00");
								break;
							case "Z": //gray
								vTY_STATUS_DATA[i]["icon"] = "Vessel_Gray"+(vTY_STATUS_DATA[i]["direction"]!="" ? "_"+vTY_STATUS_DATA[i]["direction"] : "00");
								break;
							};

							if(vTY_STATUS[vTY_STATUS_DATA[i]["key_typhoon"]]==null){
								vTY_STATUS[vTY_STATUS_DATA[i]["key_typhoon"]] = {};
							}

							if(vTY_STATUS[vTY_STATUS_DATA[i]["key_typhoon"]][vTY_STATUS_DATA[i]["mmsi_no"]]==null){
								vTY_STATUS[vTY_STATUS_DATA[i]["key_typhoon"]][vTY_STATUS_DATA[i]["mmsi_no"]] = new Array();
							}

							vTY_STATUS[vTY_STATUS_DATA[i]["key_typhoon"]][vTY_STATUS_DATA[i]["mmsi_no"]].push(vTY_STATUS_DATA[i]);
                        }
					}catch(e){
						console.log(e);
					}






					vTYPHOON_DATA_ARR = new Array();
					vLAST_TYPHOON_ARR = new Array();

					try{
						vTYPHOON_CNT = 0;

                        for( var i = 0 ; i < vTYPHOON.length ; i++ ){
                            vTYPHOON_CNT++;

                            var obj = {
                                NAME			:	vTYPHOON[i].VSL_NAME_TYP,
                                KEY_TYPHOON		:	vTYPHOON[i].KEY_TYPHOON_TYP,
                                VSL_NAME		:	vTYPHOON[i].VSL_NAME_TYP,
                                LATEST_YN		:	vTYPHOON[i].LATEST_YN_TYPLTITDE_TYP,
                                LOCAL_DT_TTHH	:	vTYPHOON[i].LOCAL_DT_TTHH_TYP,
                                LOCAL_DT		:	vTYPHOON[i].LOCAL_DT_TYP,
                                ROUT_SEQ		:	vTYPHOON[i].ROUT_SEQ_TYP,
                                LTITDE			:	parseFloat( vTYPHOON[i].LTITDE_TYP ),//위도
                                LNGTD			:	parseFloat( vTYPHOON[i].LNGTD_TYP ),//경도
                                DIRECTION		:	vTYPHOON[i].DIRECTION_TYP,
                                MAX_WINDSPEED	:	vTYPHOON[i].MAX_WINDSPEED_TYP,
                                GUST			:	vTYPHOON[i].GUST_TYP,
                                RADIUS			:	vTYPHOON[i].RADIUS_TYP,
                                CURR_YN			:   vTYPHOON[i].CURR_YN_TYP,
                                PLAY_YN			:	vTYPHOON[i].PLAY_YN_TYP,
                                TYPN_SEQ		:	vTYPHOON[i].TYPN_SEQ,
                                TYPN_ICON		:	vTYPHOON[i].TYPN_ICON_TYP,
                                DESC			:	vTYPHOON[i].DESC_TYP,
                                IS_CURR			:	vTYPHOON[i].LAST_YN_TYP,
                                CREATE_YEAR		:	vTYPHOON[i].CRT_YY_TYP
                            };

                            //vVIEWTYPE == "1" 일때 적어도 하나의 태풍은 보여줘야 한다. 태풍정보에 담았다가
							if(vVIEWTYPE == "1" && vLAST_TYPHOON_NM == obj["KEY_TYPHOON"]){
								vLAST_TYPHOON_ARR.push(obj);
							}

							//현재 태풍만 보여줄때는 과거 태풍은 건너뛴다
							if(vVIEWTYPE == "1" && obj["CURR_YN"]!="Y") return true;

							//태풍이 필터링에 의해 선택된것만 보여줌
							if(vVIEWTYPE == "2" && vSEL=="N") return true;

							if(vVIEWTYPE == "2" && vSEL=="Y" && $.inArray(obj["KEY_TYPHOON"],vCURR_TYPHOON_ARR)==-1) return true;

							if(vVIEWTYPE == "3") return true;




							vTYPHOON_DATA_ARR.push(obj);
                        }

					}catch(e){
						console.log(e);
					}




					//메인화면에서 현재 그릴 태풍이 없으면 마지막 태풍을 그린다
					if(vVIEWTYPE == "1" && vTYPHOON_DATA_ARR.length==0) vTYPHOON_DATA_ARR = vLAST_TYPHOON_ARR;












					var $element = $($target.Element);

					uId = $target.Layout.ObjectId.replace("\\", "_");
					if(!window[uId])window[uId] = {};
					window[uId]["id"] = uId;
					var rows = $target.Data.Rows;

					//console.log(rows);

					moveArea = [];

					if(mapAniObj === null)aniFea = [];

					var vesselData = [];
					typhoonData = {
						tyPos : [],
						tyLine : {},
						tyRadi : []
					};













					firstCenter = [];


					if(rows.length < 1){
						$target.Element.innerHTML = "No Data";
						return false;
					}
					//console.log(rows);


					if($target.Layout.Text0 != null){
						if($target.Layout.Text0.text != ""){
							zoom = $target.Layout.Text0.text;
						}
					}

					if($target.Layout.Text1 != null){
						if($target.Layout.Text1.text != ""){
							center = $target.Layout.Text1.text.split(",");
						}
					}


					if($target.Layout.Text3 != null){
						if($target.Layout.Text3.text == "1"){
							vesselFlag = true;
						}
					}

					if($target.Layout.Text4 != null){
						if($target.Layout.Text4.text == "1"){
							typhoonFlag = true;
						}
					}
					if($target.Layout.Text5 != null){
						if($target.Layout.Text5.text != "1"){
							aniFlag = true;
						}
					}


					if($target.Layout.Text6 != null){
						if($target.Layout.Text6.text != ""){
							QvOSM_PVM_Design_Opt["typhoon"]["50knot"]["color"] = $target.Layout.Text6.text;
						}
					}

					if($target.Layout.Text7 != null){
						if($target.Layout.Text7.text != ""){
							QvOSM_PVM_Design_Opt["typhoon"]["34knot"]["color"] = $target.Layout.Text7.text;
						}
					}
					if($target.Layout.Text8 != null){
						if($target.Layout.Text8.text != ""){
							QvOSM_PVM_Design_Opt["typhoon"]["line"]["color"] = $target.Layout.Text8.text;
						}
					}
					if($target.Layout.Text9 != null){
						if($target.Layout.Text9.text != ""){
							QvOSM_PVM_Design_Opt["typhoon"]["line"]["width"] = $target.Layout.Text9.text;
						}
					}

					if($target.Layout.Text10 != null){
						if($target.Layout.Text10.text == "1"){
							tyDateLabel = true;
						}
					}
					if($target.Layout.Text11 != null){
						if($target.Layout.Text11.text == "1"){
							vesselLabel = true;
						}
					}
					if($target.Layout.Text12 != null){
						if($target.Layout.Text12.text != ""){
							defMove = $target.Layout.Text12.text.toLowerCase();
							//console.log(defMove);
						}
					}






					if(vVIEWTYPE==1 || vVIEWTYPE==2){ // 첫번째 화면에서만 현재 vessel 위치를 출력한다

						$(rows).each(function(i){
							//console.log(this);

							//넘어오는 데이터
							var typhoonKey = (this[0])?this[0].text:"-";
							var name = (this[1])?this[1].text:"-";
							var lat = (this[2])?this[2].text:"0";
							var lon = (this[3])?this[3].text:"0";
							var vDirect = (this[4])?this[4].text:"0";
							var inout = (this[5])?this[5].text:"-";
							var type = (this[6])?this[6].text:"-";
							var mmsi = (this[7])?this[7].text:"0";
							var aniYN = "Y";
							var status = (this[8])?this[8].text:"-";
							var popup = (this[9])?this[9].text:"-";




							if(type === "VESSEL"){



								//typhoon rader :: vessel arrow all green , inout => image icon filename
								inout = inout.replace("BROKEN","Gray");
								inout = inout.replace("NOTMOVING","Gray");
								inout = inout.replace("MOVING","Gray");

								//태풍에 영향이 있는 vessel이면 태풍속도에 따라 red / yellow로 표시
								switch(status){
								case "R": //red
									inout = inout.replace("Gray","EXCEPTION");
									break;
								case "Y": //yellow
									inout = inout.replace("Gray","NOTMOVING");
									break;
								case "G": //yellow
									inout = inout.replace("Gray","MOVING");
									break;
								case "Z": //gray
									inout = inout.replace("Gray","Gray");
									break;
								};



								var vesselObj = {
									typhoonKey : typhoonKey,
									name : name,
									point : [parseFloat(lon),parseFloat(lat)],
									direction : vDirect,
									inout : inout,
									popup : popup,
									mmsi  : mmsi,
									status : status,
									aniYN : aniYN
								};

								vesselData.push(vesselObj);
							}
							/*
							if(aniYN === "Y"){
								moveArea.push({"k":typhoonKey, "t":type, "p":[parseFloat(lon),parseFloat(lat)]});
							}
							*/
						});
					} else {
						//$target.Element.innerHTML = "Input Dimension, Expression";
						//return false;
					}








					if(!$target.framecreated){


						//drawMAP();


					}










					var showVessel = function(){
						zIndex = 0;

						// Vessel 레이어
						for(var i=0;i<broken_aniarr.length;i++){
							clearTimeout(broken_aniarr[i]);

						}

						var vIconFeas = [];


						var vd_i = 0, vdLength = vesselData.length;
						var broken_aniarr_i=0;
						for(;vd_i < vdLength; vd_i++){
							var truepoint=vesselData[vd_i].point;

							var point = ol.proj.fromLonLat(vesselData[vd_i].point);
							//console.log(vesselData[vd_i].name+" : "+truepoint+" : "+point);

							var vIconFea = new ol.Feature(new ol.geom.Point(point));
							vIconFea.set('mmsi', vesselData[vd_i].mmsi);
							vIconFea.set('tyKey', vesselData[vd_i].name);
							vIconFea.set('popup', vesselData[vd_i].popup);
							vIconFea.set('point1',truepoint);
							vIconFea.set('type',"vessel");
							//icon, rotation, scale, name, offx, offy


								vIconFea.set('style', createvesselIcon("normal","Vessel_"+vesselData[vd_i].inout, vesselData[vd_i].direction, 0.8));
								vIconFea.set('sel_style', createvesselIcon("zoom","Vessel_"+vesselData[vd_i].inout+"", vesselData[vd_i].direction, 0.8));
								vIconFea.set('zoom_style', createvesselIcon("zoom","Vessel_"+vesselData[vd_i].inout+"", vesselData[vd_i].direction, 0.8));
								vIconFea.set('namestyle', createvesselIcon("normal","Vessel_"+vesselData[vd_i].inout, vesselData[vd_i].direction, 0.8, vesselData[vd_i].name, 0, offy));
								vIconFea.set('zoom_namestyle', createvesselIcon("zoom","Vessel_"+vesselData[vd_i].inout, vesselData[vd_i].direction, 0.8, vesselData[vd_i].name, 0, offy));


							//vIconFea.set('importance', vd_i);
							offy = (offy === 15) ? 22: 15;
							if(vesselData[vd_i].aniYN === 'Y' && mapAniObj === null){
								vIconFea.set('key', vesselData[vd_i].name);
								vIconFea.set('point', point);
								aniFea.push(vIconFea);
							}
							//console.log(vIconFea);

							vIconFeas.push(vIconFea);


						}

						var vIconVector = new ol.source.Vector({
											features: vIconFeas
										});

						vesselLayer = QvOSM_PVM_MAP.removeLayer(vesselLayer);

						vesselLayer = new ol.layer.Vector({
										style : function(feature) {
													//return feature.get('style')
													if(vesselZoom==1){
														return (vesselLabelC)? feature.get('namestyle'):feature.get('style');
													}else {
														return (vesselLabelC)? feature.get('zoom_namestyle'):feature.get('zoom_style');

													}


												},
										source:vIconVector/*,
										renderOrder: function(a, b) {
												if (a.get('importance') < b.get('importance')) {
												  return -1;
												} else if (b.get('importance') > a.get('importance')) {
												  return 1;
												}
												return 0;
											}*/
									});
						//vesselLayer.setZIndex(9999);
						QvOSM_PVM_MAP.addLayer(vesselLayer);

						//vesselLayer.set('selectable', true);
					};








					//Typhoon icon
					var setTyphoonIcon = function(){


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

//							console.log(list);


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
						zIndex = 0;


						if(TYPHOON_ICON_ARR.length>0){
							$.each(TYPHOON_ICON_ARR,function($key,$value){

								$.each($value["data"],function($k,$v){

									if($v["line"]!=null){
										var $obj = $v["line"];
										drawLine($v["type"]+"_"+$key+"_"+$obj["linestyle"]+"_"+$k, $obj, $obj["data"], $obj["width"], null, $obj["color"], $obj["linestyle"]);
										addLayer($v["type"]+"_"+$key+"_"+$obj["linestyle"]+"_"+$k);
									}


								});




								$.each($value["data"],function($k,$v){

									//34note 태풍영향도 그리기 파란색
									drawLine($v["type"]+"_"+$key+"_34knot_"+$k, $v, $v["polygon"][0], null, null, QvOSM_PVM_Design_Opt["typhoon"]["34knot"]["color"], "polygon");
									addLayer($v["type"]+"_"+$key+"_34knot_"+$k);

									//50note 태풍영향도 그리기 빨간색
									drawLine($v["type"]+"_"+$key+"_50knot_"+$k, $v, $v["polygon"][1], null, null, QvOSM_PVM_Design_Opt["typhoon"]["50knot"]["color"], "polygon");
									addLayer($v["type"]+"_"+$key+"_50knot_"+$k);

								});



								$.each($value["data"],function($k,$v){

									//태풍 아이콘 그리기
									if(QvOSM_PVM_MAP.getView().getZoom()>4){
										drawLine($v["type"]+"_"+$key+"_icon_"+$k, $v, $v["data"], 1, null, null, "icon",$v["text"],null,null,null,"12px Calibri,sans-serif",$v["color"]);
									}else{
										drawLine($v["type"]+"_"+$key+"_icon_"+$k, $v, $v["data"], 1, null, null, "icon");
									}
									addLayer($v["type"]+"_"+$key+"_icon_"+$k);

								});


								var typhoon_nm = "";
								$.each($value["data"],function($k,$v){

									//현재 태풍 아이콘 위치에 태풍 이름 출력
									if(($v["curr"]==true && typhoon_nm=="") || ($k==$value["data"].length-1 && typhoon_nm=="")){
										typhoon_nm = $v["name"];
										drawLine($v["type"]+"_"+$key+"_text_"+$k, $v, $v["data"], null, null, "#006ca2", "text",$v["name"],20,null,null,"bold 20px Calibri,sans-serif","#006ca2");
										addLayer($v["type"]+"_"+$key+"_text_"+$k);
									}


								});


							});




						}




					};































					ROUTE_LINE_ARR = new Array();

					//standard route
					//history route
					var setStdRouteLine = function(){

//						console.log("setStdRouteLine start");
//						console.log(vSTD_ROWS);
//						console.log(vSTD_DATA);

						$.each(vSTD_DATA,function($key,$value){


							var $color = "rgba(255, 255, 0, 0.5)";

							//이 부분에 시스템이 정한 표준라우트 이면 기존 색깔로 보여주고 사용자가 정한 데이터이면 보라색으로 보여주는 로직이 들어간다. main화면에서는 제외
							var route_no = $value["route_no"];
							if(vVIEWTYPE==3 && route_no.substring(0,1).toUpperCase()=="A"){//searate
								$color = "rgba(9, 191, 255, 0.5)";//파랑
							}
							if(vVIEWTYPE==3 && route_no.substring(0,1).toUpperCase()=="B"){//system auto
								$color = "rgba(255, 51, 153, 0.5)";//분홍
							}
							if(vVIEWTYPE==3 && route_no.substring(0,1).toUpperCase()=="C"){//system auto
								$color = "rgba(255, 51, 153, 0.5)";//분홍
							}
							if(vVIEWTYPE==3 && route_no.substring(0,1).toUpperCase()=="D"){//user defined
								$color = "rgba(255, 255, 0, 0.8)";//노랑
							}

							ROUTE_LINE_ARR.push({
								type		:	"stdroute",
								key			:	$value["key"],
								route_no	:	$value["route_no"],
								data		:	[getroutepathCoord($value["data"])],
								width		:	1,
								threshold	:	$value["threshold"],
								color		:	$color,
								linestyle	:	"line",
								tooltip		:	$value["tooltip"]
							});

						});

					};


					//Searate Route
					var setSeaRouteLine = function(){

						if(vFROM_PORT=="-" || vTO_PORT=="-") return;


						var std_arr = new Array();
						var key;
						var $b4value = null;
						$.each(vSEA_DATA,function($key,$value){
							if($b4value != null){
								std_arr.push([[$b4value["lngtd"],$b4value["ltitde"]],[$value["lngtd"],$value["ltitde"]]]);
								key = $value["key"];
							}
							$b4value = null;
							$b4value = $value;


						});


						if(std_arr.length>0){
							ROUTE_LINE_ARR.push({
								type		:	"searoute",
								key			:	key,
								data		:	getroutepathCoord([std_arr]),
								width		:	3,
								color		:	"rgba(9, 191, 255, 0.5)",
								linestyle	:	"dash"
							});
						}

					};


					//history route
					var setHisRouteLine = function(){

						if(vFROM_PORT=="-" || vTO_PORT=="-") return;


//						console.log("setHisRouteLine start");
//						console.log(vHIS_ROWS);
//						console.log(vHIS_DATA);

						// $.each(vHIS_DATA,function($key,$value){
                        //
						// 	ROUTE_LINE_ARR.push({
						// 		type		:	"hisroute",
						// 		key			:	$value["key"],
						// 		data		:	[getroutepathCoord($value["data"])],
						// 		width		:	1,
						// 		color		:	"rgba(255, 255, 255, 0.5)",
						// 		linestyle	:	"line"
						// 	});
                        //
						// });
                        try{
                            for( var i = 0 ; i < vHIS_DATA.length; i++ ){
                                ROUTE_LINE_ARR.push({
                                    type		:	"hisroute",
                                    key			:	vHIS_DATA[i]["key"],
                                    data		:	[getroutepathCoord(vHIS_DATA[i]["data"])],
                                    width		:	1,
                                    color		:	"rgba(255, 255, 255, 0.5)",
                                    linestyle	:	"line"
                                });
                            }
                        }catch( e ){
                            console.log(e)
                        }

					};





					var setRouteLine = function(){

						try{
                            //threshold 화면에서 threshold data
                            vTHRESHOLD = vTyphoon_Var_Lisr.GetVariable(16).text;
                            vTHRE_CNT = vTyphoon_Var_Lisr.GetVariable(17).text;
						}catch(e){
							IsChkCnt++;
							console.log(e);
							//location.reload();
						}


						try{
							vNEWTHRESHOLD = vNTHRE.length>0 ? vNTHRE : "N/A";
//							console.log("vNEWTHRESHOLD :: "+vNEWTHRESHOLD);
						}catch(e){
							//IsChkCnt++;
							console.log(e);
							//location.reload();
						}


						vSTD_ROUTE_ARR = new Array();
                        try{
                            for( var i = 0 ; i < vSEL_STD_THRES.length ; i++ ){
                                vSTD_ROUTE_ARR.push( vSEL_STD_THRES[i]['THRESHOLD_T'] );
                                console.log( 'vSTD_ROUTE_ARR : ', vSTD_ROUTE_ARR );
                            }
                        }catch( e ){
                            console.log( e );
                        }
						// $.each(vSEL_STD_THRES.Data.Rows,function($k,$v){
						// 	vSTD_ROUTE_ARR.push($v[0]["text"]);
						// });






						if(vVIEWTYPE==1 && vSTD_YN=="Y"){

						}else{
							if(vVIEWTYPE!=3) return;
						}


						try{
							vSTD_ROWS = vSTD.length;
                            console.log( 'vSTD_ROWS :',vSTD_ROWS  );
						}catch(e){
							IsChkCnt++;
						}
//						console.log("vSTD_ROWS :: ");
//						console.log(vSTD_ROWS);


						//표준 route
						vSTD_DATA = new Array();
						if(vSTD_ROWS!=null && vSTD_ROWS.length>0)
                        for( var i = 0 ; i < vSTD_ROWS ; i++  ){
                            var $data = vSTD[i].STD_LNGTD_LTITDE != "-" ? JSON.parse( vSTD[i].STD_LNGTD_LTITDE ) : new Array();

                            var obj = {
								key			:	vSTD[i].PRTY + "_" + vSTD[i].STD_ROUT_NUM,
								data		:	$data,
								route_no	:	vSTD[i].STD_ROUT_NUM,
								threshold	:	vSTD[i].THRESHOLD_T,
								vessel_cnt	:	vSTD[i].VSL_CNT,
								name		:	vSTD[i].ROUT_CD,
								distance	:	vSTD[i].DIST_NN,
								tooltip		:	null
							};

                            obj["tooltip"] = "Route : "+obj["name"]+"<br>"
											+"Distance : "+obj["distance"]+" (N/M)"+"<br>"
											//+"Vessels : "+obj["vessel_cnt"]+"<br>" //2018-08-07 조영대책임 크게 필요없다고 제외요청
											+"Threshold : "+obj["threshold"]+" (N/M)";

							vSTD_DATA.push(obj);
                        }

						// $.each(vSTD_ROWS,function($key,$value){
                        //
						// 	var $data = $value[1]["text"]!="-" ? JSON.parse($value[1]["text"]) : new Array();
                        //     console.log( $value );
                        //
						// 	var obj = {
						// 		key			:	$value[0]["text"]+"_"+$value[2]["text"],
						// 		data		:	$data,
						// 		route_no	:	$value[2]["text"],
						// 		threshold	:	$value[3]["text"],
						// 		vessel_cnt	:	$value[4]["text"],
						// 		name		:	$value[5]["text"],
						// 		distance	:	$value[6]["text"],
						// 		tooltip		:	null
						// 	};
                        //
						// 	obj["tooltip"] = "Route : "+obj["name"]+"<br>"
						// 					+"Distance : "+obj["distance"]+" (N/M)"+"<br>"
						// 					//+"Vessels : "+obj["vessel_cnt"]+"<br>" //2018-08-07 조영대책임 크게 필요없다고 제외요청
						// 					+"Threshold : "+obj["threshold"]+" (N/M)";
                        //
						// 	vSTD_DATA.push(obj);
                        //
						// });
//						console.log(vSTD_DATA);



						//standard route line
						if((vVIEWTYPE==1 && vSTD_YN=="Y") || (vVIEWTYPE==3 && vTHRE_CNT>0 && vFROM_PORT!="-" && vTO_PORT!="-")) setStdRouteLine();





						if(vVIEWTYPE!=3) return;
						if(vFROM_PORT=="-" || vTO_PORT=="-") return;










						try{
							vHIS_ROWS = vHIS;
						}catch(e){
							IsChkCnt++;
						}
//						console.log("vHIS_ROWS :: ");
//						console.log(vHIS_ROWS);


						//history route
						vHIS_DATA = new Array();
						$.each(vHIS_ROWS,function($key,$value){

							var $data = $value[2]["text"]!="-" ? JSON.parse($value[2]["text"]) : new Array();

							var obj = {
								route_cd	:	$value[0]["text"],
								key			:	$value[1]["text"],
								data		:	$data
							};

							vHIS_DATA.push(obj);

						});
//						console.log(vHIS_DATA);










						try{
							vSEA_ROWS = vSEA.Data.Rows;
						}catch(e){
							IsChkCnt++;
						}
//						console.log("vSEA_ROWS :: ");
//						console.log(vSEA_ROWS);


						//sea route
						vSEA_DATA = new Array();
						$.each(vSEA_ROWS,function($key,$value){


							var obj = {
								key			:	$value[0]["text"],
								lngtd		:	parseFloat($value[1]["text"]),
								ltitde		:	parseFloat($value[2]["text"]),
								seq			:	$value[3]["text"]
							};

							vSEA_DATA.push(obj);

						});
//						console.log(vSEA_DATA);






						//history Route
						setHisRouteLine();


						//Searate Route
						setSeaRouteLine();




					};



					var showRouteLine = function(){
						zIndex = 0;

						//if(vVIEWTYPE!=3) return;
						//if(vFROM_PORT=="-" || vTO_PORT=="-") return;

						//console.log("showRouteLine start");
//						console.log("vVIEWTYPE :: "+vVIEWTYPE+" , vTHRE_YN :: "+vTHRE_YN);

						if(ROUTE_LINE_ARR.length>0){
							$.each(ROUTE_LINE_ARR,function($k,$v){


								if($_VAR["vSEL_ROUTE_KEY"]!="" && $v["type"]=="stdroute") return true;
								if($_VAR["vSEL_STD_ROUTE_NUM"]!="" && $v["type"]=="hisroute") return true;


								var $width = $v["width"];
								var zoom   = null;

								if($v["type"]=="stdroute"){

									if((vVIEWTYPE==1 && vTHRE_YN=="Y") || vVIEWTYPE==3){//threshold 화면이면 적용
										zoom   = QvOSM_PVM_MAP.getView().getZoom();


										if(vVIEWTYPE==1 && vTHRE_YN=="Y"){
											if($.isNumeric($v["threshold"])) $width = parseFloat($v["threshold"]);
										}else{

											if($.isNumeric(vTHRESHOLD)){
												$width = parseFloat(vTHRESHOLD);
											}

											if($.isNumeric(vNEWTHRESHOLD)){
												$width = parseFloat(vNEWTHRESHOLD);
											}

										}

									}


									//threshold를 선택하면 선택한 threshold에 해당하는 route_no에 대해 화면에 trehshold를 표현한다.
									if((vVIEWTYPE==1 && vTHRE_YN=="Y") || $.inArray($v["route_no"],vSTD_ROUTE_ARR)>-1){
										//console.log("threshold 그린다 :: "+$width);
										//console.log($v);
										drawLine($v["type"]+"_"+$k, $v, $v["data"], $width, zoom, $v["color"],$v["linestyle"]);
									}

									drawLine($v["type"]+"_"+$k, $v, $v["data"], (vVIEWTYPE==1 ? 1 : 3), null, $v["color"], $v["linestyle"]);
								}else{
									//$v["key"], $v["data"], $width, zoom, $v["color"],$v["linestyle"]
									drawLine($v["type"]+"_"+$k, $v, $v["data"], $width, null, $v["color"],$v["linestyle"]);
								}


								try{
									addLayer($v["type"]+"_"+$k);
								}catch(e){
									console.log(e);
								}


							});






						}




					};













					//map button
					$(".Document_LB27 .QvListbox div[unselectable='on'][title]").unbind("click").bind("click",function(){


						setTimeout(function(){

							try{
								vMAPTYPE = (vMAP.GetText()!=null && vMAP.GetText()!="") ? vMAP.GetText() : "basic";
//								console.log("vMAPTYPE :: "+vMAPTYPE);
							}catch(e){
								IsChkCnt++;
								console.log(e);
							}

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
									defMap = "layersMb";
								}
							}


//							console.log("vMAPTYPE :: "+vMAPTYPE);
//							console.log("defMap :: "+defMap);

							for (var i = 0, ii = MapTypeGroup.length; i < ii; ++i) {
								MapTypeGroup[i].setVisible(MapTypeNameList[i] === defMap);
							}


						},1200);




					});








/*
					if($("#rader_div").length==0)
					$(".Document_TX84").append('<div id="rader_div" style="position:absolute;left:  300px;top: 8px;text-align:center;">'
							+'<img style="width:45px;" src="'+QvOSM_exUrl+'icon/radar_white.png"/>'
						+'</div>');
*/
/*
					if($("#ty_img_div").length==0)
					$(".Document_TX128").append('<div id="ty_img_div" style="position:absolute;left:  10px;top: 58px;text-align:center;">'
							+'<img src="'+QvOSM_exUrl+'icon/typhoon2.png"/>'
						+'</div>');
*/

					if($("#typhoon_div").length==0)
					$(".Document_TX128").append('<div id="typhoon_div" style="position:absolute;left:  18px;top: 500px;">'
						+'</div>');

					if($("#typhoon_div_wrapper_top").length==0)
					$("#typhoon_div").append('<div id="typhoon_div_wrapper_top" style="font-family:Calibri;font-size:18px;font-weight:bold;color:#ffffff;margin-left:-14px;">Typhoon</div><div id="typhoon_desc_wrapper" style="width:100%;height:390px;overflow-x:hidden;overflow-y:auto;"><div id="typhoon_desc" style="width:100%;"></div></div>');

					try{
						if(ps){
							ps.destroy();
							ps = null;
						}
					}catch(e){

					}
					$(".ps__rail-x").remove();
					$(".ps__rail-y").remove();
					if($('#typhoon_desc_wrapper').length>0) ps = new PerfectScrollbar('#typhoon_desc_wrapper',{wheelSpeed	:	0.1});
					$(".ps__rail-y").css("width","10px");
					//$(".ps__rail-y").css("background-color","#FFFFFF");
					$(".ps__rail-y").css("opacity",1);

					/*
					$(".Document_CH31 .Qv_ScrollbarVerticalDivider").hide();
					$(".Document_CH31 .TouchScrollbar span").hide();
					$(".Document_CH31 .TouchScrollbar").css("left","384px");
					$(".Document_CH31 .Qv_ScrollbarBackground").css("background-color","transparent");
					*/

					$("#typhoon_desc").empty();
					$.each(vTYPHOON_DATA_ARR,function($key,$data){

						//현재 태풍만 보여줄때는 과거 태풍은 건너뛴다
						if(vVIEWTYPE == "1" && $data["CURR_YN"]!="Y"){
							//vVIEWTYPE == "1" 일태 적어도 하나의 태풍은 보여줘야 한다.
							if(vLAST_TYPHOON_NM == $data["KEY_TYPHOON"]){

							}else{
								return true;
							}
						}


						//현재 태풍
						if($data["IS_CURR"]=="Y"){
							$("#typhoon_desc").append('<div class="typhoon_info" target="'+$data["KEY_TYPHOON"]+'" style="padding-top:5px;"><div id="ty_title" NAME="'+$data["NAME"]+'" KEY_TYPHOON="'+$data["KEY_TYPHOON"]+'" style="color:#52b0de;font-size:18px;font-family:Calibri;font-weight:bold;cursor:pointer;">'+$data["NAME"]+'</div><div id="ty_cont" style="color:#ffffff;font-size:14px;font-family:Calibri;">'+$data["DESC"]+'</div></div>');
						}
					});

					if($("#typhoon_desc").html()==""){

						$.each(vLAST_TYPHOON_ARR,function($key,$data){

							//현재 태풍만 보여줄때는 과거 태풍은 건너뛴다
							if(vVIEWTYPE == "1" && $data["CURR_YN"]!="Y"){
								//vVIEWTYPE == "1" 일태 적어도 하나의 태풍은 보여줘야 한다.
								if(vLAST_TYPHOON_NM == $data["KEY_TYPHOON"]){

								}else{
									return true;
								}
							}


							//마지막 태풍의 결과
							if($key == vLAST_TYPHOON_ARR.length-1){
								$("#typhoon_desc").append('<div class="typhoon_info" target="'+$data["KEY_TYPHOON"]+'" style="padding-top:5px;"><div id="ty_title" NAME="'+$data["NAME"]+'" KEY_TYPHOON="'+$data["KEY_TYPHOON"]+'" style="color:#006ca2;font-size:18px;font-family:Calibri;font-weight:bold;cursor:pointer;">'+$data["NAME"]+'</div><div id="ty_cont" style="color:#ffffff;font-size:14px;font-family:Calibri;">'+$data["DESC"]+'</div></div>');
							}
						});

					}




					$("#typhoon_desc div#ty_title").off("click").on("click",function(){
						Qv.GetCurrentDocument().SetVariable("vSEL_TYPHOON",$(this).attr("key_typhoon"));
					});


					if($("#typhoon_grade_div").length==0)
					$(".Document_TX128").append('<div id="typhoon_grade_div" style="position:absolute;left:  258px;top: 504px;color:#ffffff;cursor:pointer;font-weight:bold;">Typhoon Grade <font style="font-size:16px;">ⓘ</font>'
						+'</div><div id="typhoon_grade" style="display:none;position:absolute;left:  258px;top: 500px;z-index:999;">'
						+'<table border=1 borderColor="#cccccc" cellpadding="2" style="background-color:#989090;width:280px;text-align:center;" align=center>'
						+'<tr><td align=center style="font-family:Calibri;color:#ffffff;font-weight:bold;width:130px;">Grade</td><td align=center style="font-family:Calibri;color:#ffffff;font-weight:bold;">Max Wind Speed</td></tr>'
						+'<tr><td align=left style="font-family:Calibri;color:#ffffff;font-weight:bold;"><div style="float:left;padding-top:2px;padding-left:10px;"><img style="width:18px;" src="'+QvOSM_exUrl+'icon/ty4_40_30.png" /></div><div style="float:right;padding-right:10px;">Very Strong</div></td><td align=center style="font-size:12px;font-family:SANS-SERIF;color:#ffffff;">85kn~</td></tr>'
						+'<tr><td align=left style="font-family:Calibri;color:#ffffff;font-weight:bold;"><div style="float:left;padding-top:2px;padding-left:10px;"><img style="width:18px;" src="'+QvOSM_exUrl+'icon/ty3_40_30.png" /></div><div style="float:right;padding-right:10px;">Strong</div></td><td align=centerr style="font-size:12px;font-family:SANS-SERIF;color:#ffffff;">64∼85 kn</td></tr>'
						+'<tr><td align=left style="font-family:Calibri;color:#ffffff;font-weight:bold;"><div style="float:left;padding-top:2px;padding-left:10px;"><img style="width:18px;" src="'+QvOSM_exUrl+'icon/ty2_40_30.png" /></div><div style="float:right;padding-right:10px;">Middle</div></td><td align=centerr style="font-size:12px;font-family:SANS-SERIF;color:#ffffff;">48~64 kn</td></tr></tr>'
						+'<tr><td align=left style="font-family:Calibri;color:#ffffff;font-weight:bold;"><div style="float:left;padding-top:2px;padding-left:10px;"><img style="width:18px;" src="'+QvOSM_exUrl+'icon/ty1_40_30.png" /></div><div style="float:right;padding-right:10px;">Weak</div></td><td align=center style="font-size:12px;font-family:SANS-SERIF;color:#ffffff;">34~48 kn</td></tr></table></div>');
					$("#typhoon_grade_div").off("mouseover").on("mouseover",function(){
						$("#typhoon_grade").show();
					});
					$("#typhoon_grade_div").off("mouseout").on("mouseout",function(){
						$("#typhoon_grade").hide();
					});


					$("#ty_img_div").width($(".Document_TX128").width()-20);
					$("#typhoon_div").width($(".Document_TX128").width()-20);
					$("#typhoon_grade").css("left",$(".Document_TX128").width()+10);



					//nautical mile unit display hidden
					setTimeout(function(){
						$(".ol-scale-line").hide();
					},1000);

				//	console.log("===========================================================================================");
				//	console.log("IsChkCnt :: "+IsChkCnt);
				//	console.log("Refresh_cnt :: "+Refresh_cnt);
				//	console.log("===========================================================================================");




					var drawObj = function(){

						clearRouteLine();
						showRouteLine();


						//페이지가 이동되었다면 애니메이션 초기화
						if(oldVIEWTYPE!=vVIEWTYPE){
							oldVIEWTYPE = vVIEWTYPE;
						}



						clearTyphoonIcon();
						showTyphoonIcon();


						//태풍을 선택했으면 해당 태풍에 대한 vessel을 그린다.
						if(vVIEWTYPE=="1" && $_VAR["vSEL_TYPHOON"]){
							removeTyphoonVessel();
							drawTyphoonVessel();
						} else showVessel();



					};








					//맵 그리기
					if(oldVIEWTYPE != vVIEWTYPE || oldMAPTYPE!=vMAPTYPE){
						drawMAP();




						function onZoom(evt) {
							var view = evt.target;

							if(oldZoom==view.getZoom()){

							}else if(view.getZoom()>4){
								vesselZoom=2
								if(vesselLayer) vesselLayer.changed();
							}else{
								vesselZoom=1
								if(vesselLayer) vesselLayer.changed();
							}


							if(oldZoom!=view.getZoom()){


								if(DRAW_TIM) clearTimeout(DRAW_TIM);

								DRAW_TIM = setTimeout(function(){
									if(vVIEWTYPE==1 || vVIEWTYPE==3){
										clearRouteLine();
										showRouteLine();
									}

									if(vVIEWTYPE==1 || vVIEWTYPE==2){
										clearTyphoonIcon();
										showTyphoonIcon();
									}

									if(vVIEWTYPE==1 && $_VAR["vSEL_TYPHOON"]){
										removeTyphoonVessel();
										drawTyphoonVessel();
									}
								},1000);



							}


							oldZoom=view.getZoom();




						}
						//console.log(vesselZoom);
						QvOSM_PVM_MAP.getView().on('propertychange', onZoom);




						oldMAPTYPE = vMAPTYPE;



					}















					if(oldVIEWTYPE != vVIEWTYPE || IsChkCnt>0){
				//		console.log("oldVIEWTYPE :: "+oldVIEWTYPE);
				//		console.log("vVIEWTYPE :: "+vVIEWTYPE);
				//		console.log("====refresh====");

						//if(Refresh_cnt>15) return;


						setTimeout(function(){
							IsChkCnt = 0;
							Refresh_cnt++;
							Qv.GetCurrentDocument().SetVariable("vREFRESH","1");
						},1200);


					}else{

						if(DRAW_TIM) clearTimeout(DRAW_TIM);

						DRAW_TIM = setTimeout(function(){

							try{
				//				console.log("vTYPHOON_CNT :: "+vTYPHOON_CNT);
				//				console.log("vTYPHOON.Data.Rows.length :: "+vTYPHOON.Data.Rows.length);
				//				console.log("=====================");
								//console.log("vTY_STATUS.length :: "+vTY_STATUS_CNT);
								//console.log("vTY_STATUS_DATA.Data.Rows.length :: "+vTY_STATUS_DATA.Data.Rows.length);
								if(vTYPHOON_CNT != vTYPHOON.Data.Rows.length){
									setTimeout(function(){
										IsChkCnt++;
										Qv.GetCurrentDocument().SetVariable("vREFRESH","1");
									},1200);
									return;
								}
							}catch(e){

							}


				//			console.log("====data loading success====");



							setTyphoonIcon();
							setRouteLine();


							drawObj();



							//익스텐션 중복 추가되는 부분 제거
							$.each($("div#"+$target.Layout.ObjectId.replace("\\","_")),function(){
								if($(this).html()=="") $(this).remove();
							});


							$("#loading_div").fadeOut(500);
							/* 데이터가 성공적으로 다 로딩되었어도, qlikview loading modal이 존재하면, fadeout */
							if( $('.ModalDialog') ){
								$(".ModalDialog").fadeOut(500);
								$('.popupMask').fadeOut(500);
							}


						},1200);


					}








				}catch(e){
					console.log(e);
					//alert(e);
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
});
