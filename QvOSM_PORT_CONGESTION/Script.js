'use strict'
var ExName = "QvOSM_PORT_CONGESTION";
var QvOSM_exUrl = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/"+ExName+"/";

var DRAW_TIM;

var uId;
var ol;
var cqv = Qv.GetDocument("");
// var cqv;
var vEXT_RISK_SCORE = cqv.GetObject("vEXT_RISK_SCORE") ;
// console.log(vEXT_RISK_SCORE.GetVariable(10));
var $_VAR = {};
var QvOSM_PVM_MAP;
var MapTypeGroup = [];
var MapTypeNameList;
var QvOSM_PVM_Opt = {};

var oldZoom = 3;

//김민근 
var overlayTooltip;
var PORT_ARR_LAYER;
var PORT_AGING_LAYER;
var zIndex = 0;

var defMap = "layersMb2";

var vROUTE;
// var vSHOW;
var vRoute_YN;
var vSHOW_ROUTE;
var vSHOW_NEWS_OBJ;
var vSHOW_NEWS = "N";

var vMAP;

var vSTD;
var vSTD_DATA = {};

var vSEA;
var vSEA_DATA = {};

var vMAPTYPE;
var oldMAPTYPE;

var vSCORE;


var vNEWS;
var vNEWS_DATA = new Array();

var vPORT_NEWS;
var vPORT_NEWS_DATA = new Array();

var firstCenter = [];


//설정값 변수
var zoom = "3";
var center = [127,38];

var defMove = "fly";


var vVIEW;
var vVIEWTYPE;

var $target;
var IsChkCnt = 0;

var vTYPHOON;
var vTYPHOON_DATA_ARR = new Array();
var TYPHOON_ICON_ARR = new Array();
var typhooniconlayerlist = [];

var vVESSEL_OBJ;
var vINCIDENT_OBJ;

var broken_aniarr=[];
var vesselData = [];
var vesselLayer;

var currentZoomLevel;

var incidentLayer;
var incidentData = [];
var ticker_incidentData = [];

var vPOLYGON;
var vPolygonArr;
var polygonLayers = [];




/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}



var QvOSM_PVM_Design_Opt = JSON.parse('{"typhoon":{"50knot":{"color":"rgba(225, 30, 30, 0.4)"},"34knot":{"color":"rgba(30, 30, 225, 0.1)"},"line":{"color":"rgba(225, 50, 50, 0.9)","width":5}}}');



//grid click logic ============================================================================================ start

var setClickEvent = function($ID,$STEP,$DATA,$TARGET_ID){

	var $IDX = 0;
	//".Document_vTSLU .QvGrid div[style*='position: relative']:eq(2) div[unselectable='on'][title][style*='left: 0px']"
	$.each($(".Document_"+$ID+" div[page]:eq(1) div[unselectable='on'][title][style*='left: 0px']"),function(){

		var $_target = $(this);


		//첫번째
		$(this).attr("idx",$IDX).unbind("click").bind("click",function(event){
			Qv.GetDocument("").SetVariable($TARGET_ID,$DATA[$(this).attr("idx")][$STEP]["text"]);
		});


		//두번째
		$(this).next().attr("idx",$IDX).unbind("click").bind("click",function(event){
			Qv.GetDocument("").SetVariable($TARGET_ID,$DATA[$(this).attr("idx")][$STEP]["text"]);
		});


		//세번째
		$(this).next().next().attr("idx",$IDX).unbind("click").bind("click",function(event){
			Qv.GetDocument("").SetVariable($TARGET_ID,$DATA[$(this).attr("idx")][$STEP]["text"]);
		});


		//네번째
		$(this).next().next().next().attr("idx",$IDX).unbind("click").bind("click",function(event){
			Qv.GetDocument("").SetVariable($TARGET_ID,$DATA[$(this).attr("idx")][$STEP]["text"]);
		});


		//다섯번째
		$(this).next().next().next().next().attr("idx",$IDX).unbind("click").bind("click",function(event){
			Qv.GetDocument("").SetVariable($TARGET_ID,$DATA[$(this).attr("idx")][$STEP]["text"]);
		});


		//여섯번째
		$(this).next().next().next().next().next().attr("idx",$IDX).unbind("click").bind("click",function(event){
			Qv.GetDocument("").SetVariable($TARGET_ID,$DATA[$(this).attr("idx")][$STEP]["text"]);
		});


		//일곱번째
		$(this).next().next().next().next().next().next().attr("idx",$IDX).unbind("click").bind("click",function(event){
			Qv.GetDocument("").SetVariable($TARGET_ID,$DATA[$(this).attr("idx")][$STEP]["text"]);
		});

		$IDX++;
	});


	setTimeout(function(){
		if($(".Document_"+$ID+" div[page]:eq(1) div[unselectable='on'][title] .injected").length==$(".Document_"+$ID+" div[page]:eq(1) div[unselectable='on'][title][idx]").length) return;

		setClickEvent($ID,$STEP,$DATA,$TARGET_ID);
	},1500);


};








var SOURCE_OBJ = {};
var LAYER_OBJ = {};


//김민근 작업
var ROUTE_LINE_ARR = new Array();
var PORT_ARR = new Array();

var removeLayer = function($target){
	if(LAYER_OBJ[$target]){
		SOURCE_OBJ[$target].removeFeature(SOURCE_OBJ[$target].getFeatures()[0]);
		SOURCE_OBJ[$target].clear();
		LAYER_OBJ[$target] = QvOSM_PVM_MAP.removeLayer(LAYER_OBJ[$target]);
		delete LAYER_OBJ[$target];
	}
};



var setRiskScore = function loaddata(){

	ROUTE_LINE_ARR = [];
	PORT_ARR = [];
	zIndex = 0;

	console.log("setRiskScore start : " + $target.Data.Rows[0].length);
    // node의 score 데이터는 프로퍼티에서 넘어오는 데이터 이다.
	if($target.Data.Rows!=null && $target.Data.Rows.length>0 && $target.Data.Rows[0].length==13)
	$.each($target.Data.Rows,function($k,$v){
		var obj = {
				port_cd		:	$v[0]["text"],
				port_nm		:	$v[1]["text"],
				lngtd		:	($.isNumeric($v[2]["text"]) ? parseFloat($v[2]["text"]) : ""),
				ltitde		:	($.isNumeric($v[3]["text"]) ? parseFloat($v[3]["text"]) : ""),
				anch_stdev  :	($.isNumeric($v[4]["text"]) ? parseFloat($v[4]["text"]) : ""),
				port_stdev	:	($.isNumeric($v[5]["text"]) ? parseFloat($v[5]["text"]) : ""),
				port_natn	:	$v[6]["text"],
				ship_type	: 	$v[7]["text"],
				port_aging  :   ($.isNumeric($v[8]["text"]) ? parseFloat($v[8]["text"]) : ""),
				sum_anch    :   ($.isNumeric($v[9]["text"]) ? parseFloat($v[9]["text"]) : ""),
				sum_port    :   ($.isNumeric($v[10]["text"]) ? parseFloat($v[10]["text"]) : ""),
				vessels     :   $v[11]["text"],
				port_aging_h:   Math.round($v[12]["text"]),
				//score       :   ($.isNumeric($v[12]["text"]) ? parseFloat($v[12]["text"]) : ""),	
                //SUM({<YW={'$(vMaxWeek)'}, MARKET={'$(vSHIPTYPE)'}>}PORT_AGING)				
				color		:	"rgba(0, 159, 60, 1)",
				width		:	10,
				icon		:	"0",
				point		:	null,
				tooltip		:	null
		};
		 console.log($v[0]["text"],$v[1]["text"],$v[2]["text"],$v[3]["text"],$v[4]["text"],$v[5]["text"],$v[6]["text"],$v[7]["text"],$v[8]["text"],$v[9]["text"],$v[10]["text"],$v[11]["text"],$v[12]["text"]);
		/*var obj = {
				type		:	"score",
				date		:	$v[0]["text"],
				loc_cd		:	$v[1]["text"],
				port_nm		:	$v[2]["text"],
				lngtd		:	($.isNumeric($v[3]["text"]) ? parseFloat($v[3]["text"]) : ""),
				ltitde		:	($.isNumeric($v[4]["text"]) ? parseFloat($v[4]["text"]) : ""),
				score		:	parseFloat($v[5]["text"]),
				color		:	"rgba(0, 159, 60, 1)",
				width		:	10,
				icon		:	"0",
				point		:	null,
				tooltip		:	null
		};*/

		obj["point"] = ol.proj.fromLonLat([obj["lngtd"],obj["ltitde"]]);

		//김민근 port 호버시 사용되는 값인거같음 주석후 아래 코딩 툴팁 -  css 는 화면설계서에 맡게 변경 필요 Style.css 에서 tooltip 검색, hrs 계산필요
		// obj["tooltip"] = "<div style='font-size:12px;font-weight:bold;'>"+obj["port_nm"]+"</div>"
		// 				+"<div style='font-size:12px;'>Score : "+obj["score"]+"</div>";
		
		obj["tooltip"] = "<div style='font-size:13px;font-weight:bold;'>&nbsp"+obj["port_cd"] + " (" + obj["port_nm"] + ", " + obj["port_natn"] + ")" + "</div>"
		+"<div style='font-size:12px;'>&nbsp "+obj["ship_type"]+" ("+obj["vessels"] + " vessels)"+"</div>"
		+"<div style='font-size:12px;'>&nbsp&nbsp"+obj["port_aging"]  +" days ("+  obj["port_aging_h"] +" hrs)" + "</div>"
		+"<div style='font-size:12px;'>&nbsp&nbsp - Anchorage: "+obj["sum_anch"] + " days (" + Math.round(obj["sum_anch"]*24) + " hrs)" + "</div>"
		+"<div style='font-size:12px;'>&nbsp&nbsp - Port: "+obj["sum_port"] + " days (" + Math.round(obj["sum_port"]*24) + " hrs)" + "</div>";



		//김민근 코드보고 수정한 본
		if(obj["port_aging"]=="-") return true;

		obj["color"] = "rgba(0, 159, 60, 1)";
		if(obj["port_aging"]<1){
			obj["color"] = "rgba(0, 159, 60, 1)";
			obj["icon"] = "0";
		}else if(obj["port_aging"]>=1 && obj["port_aging"]<2){
			obj["color"] = "rgba(124, 198, 35, 1)";
			obj["icon"] = "1";
		}else if(obj["port_aging"]>=2 && obj["port_aging"]<3){
			obj["color"] = "rgba(249, 244, 0, 1)";
			obj["icon"] = "2";
		}else if(obj["port_aging"]>=3 && obj["port_aging"]<4){
			obj["color"] = "rgba(255, 210, 65, 1)";
			obj["icon"] = "3";
		}else if(obj["port_aging"]>=4 && obj["port_aging"]<6){
			obj["color"] = "rgba(235, 125, 49, 1)";
			obj["icon"] = "4-5";
		}else if(obj["port_aging"]>=6 && obj["port_aging"]<=8){
			obj["color"] = "rgba(255, 0, 0, 1)";
			obj["icon"] = "6-7";
		}else if(obj["port_aging"]>=9){
			obj["color"] = "rgba(150, 0, 20, 1)";
			obj["icon"] = "8";
		}




		ROUTE_LINE_ARR.push(obj);

		
		//김민근 작업
		var iconFeature = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.transform([obj["lngtd"],obj["ltitde"]], 'EPSG:4326', 'EPSG:3857')),
			port_cd		:	obj["port_cd"], //0
			port_nm		:	obj["port_nm"], //1
			lngtd		:	obj["lngtd"],	//2
			ltitde		:	obj["ltitde"],	//3
			anch_stdev  :	obj["anch_stdev"],	//4
			port_stdev	:	obj["port_stdev"],	//5
			port_natn	:	obj["port_natn"],	//6
			ship_type	: 	obj["ship_type"],	//7
			port_aging  :   obj["port_aging"],	//8
			sum_anch    :  	obj["sum_anch"],	//9
			sum_port    :   obj["sum_port"],	//10
			vessels     :   obj["vessels"],     //11

			port_aging_h:   obj["port_aging_h"], //12
			//
			color		:	obj["color"],
			width		:	obj["width"],
			icon		:	obj["icon"],
			point		:	obj["point"],
			tooltip		:	obj["tooltip"]
		});

		PORT_ARR.push(iconFeature);

	});

	console.log("port_arr 갯수: " + PORT_ARR.length)

	QvOSM_PVM_MAP.removeLayer(PORT_ARR_LAYER);
	QvOSM_PVM_MAP.removeLayer(PORT_AGING_LAYER);

	var PORT_ARR_SOURCE = new ol.source.Vector({
        features: PORT_ARR 
    });


	PORT_ARR_LAYER = new ol.layer.Vector({
		source: PORT_ARR_SOURCE,
		style: getStyle,
		// declutter: true
	
	});


	PORT_AGING_LAYER = new ol.layer.Vector({
		source: PORT_ARR_SOURCE,
		style: getStyle2
		
	
	});



	
	function getStyle(feature, resolution) {

		// console.log(feature.get('color'));
		var color = feature.get('color');
		var style = new ol.style.Style({
			image: new ol.style.Circle({
			  radius: 5,
			  fill: new ol.style.Fill({color: color}),
			  stroke: new ol.style.Stroke({
				color: [0,0,0], width: 0.5
			  })
			})
		  });


		return style;
	}



	// 	//feature, resolution
	// //$k,$v
	// function getStyle2(feature, resolution) {
	// 	// function getStyle2($k,$v) {
	
	// 		// console.log(feature.get('color'));
	// 		var point = feature.get('point');
	// 		var zoom = QvOSM_PVM_MAP.getView().getZoom();
	// 		var offsetX = -0.1;
	// 		var offsetY = -4;
	// 		var descript = feature.get('port_aging');
	// 		var fontstyle = 'bold 14px Calibri,sans-serif';
	// 		var style;
	// 		var icon = feature.get('icon');
	// 		var textAlign = "center";
	// 		var fontcolor = "rgba(54, 54, 54, 1)";
	// 		var nwidth = 0.8;
	
	// 		style =
	// 		new ol.style.Style({
	// 			image: new ol.style.Icon({
	// 				src: QvOSM_exUrl+'icon/'+icon+'.png',
	// 				scale: nwidth
	// 			}),
	// 			text: new ol.style.Text({
	// 				font: (fontstyle ? fontstyle : '14px Calibri,sans-serif'),
	// 				text: descript ? descript+"" : "",
	// 				textAlign: (textAlign ? textAlign : "left"),
	// 				offsetY: (offsetY ? offsetY : 15),
	// 				offsetX: (offsetX ? offsetX : 10),
	// 				overflow: true,
	// 				fill: new ol.style.Fill({
	// 				  color: fontcolor
	// 				}),
	// 				stroke: new ol.style.Stroke({color: "#333", width:0.5})
	// 			})
	// 		});
	
			
	// 		// var style;
	// 		// var zoom = QvOSM_PVM_MAP.getView().getZoom();
	// 		// var offsetX = -0.1;
	// 		// var offsetY = -4;
	// 		// var descript = $k.get('port_aging');
	// 		// var fontstyle = "10px Calibri,sans-serif";
	
	
	// 		// if(zoom>4){
	// 		// 	fontstyle = 'bold 14px Calibri,sans-serif';
	// 		// 	style = drawLine($v["type"] ,$v, $v["point"], 0.8, null, null,"icon", descript, offsetX, offsetY, "center", fontstyle, "rgba(54, 54, 54, 1)");
	// 		// }else{
	// 		// 	// var $v2 = JSON.parse(JSON.stringify($v));
	// 		// 	// $v2["icon"] = $v2["icon"]+"_15";
	// 		// 	style = drawLine($v["type"] ,$v, $v["point"], 0.8, null, null,"icon");
	// 		// }
	
	// 		return style;
	// 	}



	//feature, resolution
	//$k,$v
	var zoom = QvOSM_PVM_MAP.getView().getZoom();
	function getStyle2(feature, resolution) {
		// function getStyle2($k,$v) {

			var offsetX = -0.1;
			var offsetY = -4;
			var descript = feature.get('port_aging');
			var fontstyle = "10px Calibri,sans-serif";
			var icon = feature.get('icon')
			
			// if(zoom>4){
				fontstyle = 'bold 14px Calibri,sans-serif';
				return drawLine(resolution["type"] ,icon, resolution["point"], 0.8, null, null,"icon", descript, offsetX, offsetY, "center", fontstyle, "rgba(54, 54, 54, 1)");
			// }else{
			// 	// var resolution2 = JSON.parse(JSON.stringify(resolution));
			// 	// resolution2["icon"] = resolution2["icon"]+"_15";
			// 	return drawLine(resolution["type"] ,icon, resolution["point"], 0.8, null, null,"icon");
			// }

	}



	//동작안됨
	var drawLine = function(id, obj, route_arr, width, zoomlevel, linecolor, linestyle, descript, offsetX, offsetY, textAlign, fontstyle, fontcolor){

		var arr = new Array(0, 0.0375, 0.075, 0.2, 0.375, 0.575, 1, 1.8, 3.7, 7, 14.15, 28.3, 55.5, 111, 222, 460, 900, 900);

		var nwidth = zoomlevel==null ?	width	:	arr[zoomlevel]*width*2;//threshold값은 한쪽의 폭을 얘기하므로 2배를 해줘야 한다
		// console.log(obj)
		// console.log(descript);
		
		var style_obj = new ol.style.Style({
			image: new ol.style.Icon({
				src: QvOSM_exUrl+'icon/'+obj+'.png',
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
				stroke: new ol.style.Stroke({color: "#333", width:0.5})
			})
		});
		// console.log(style_obj);

		style_obj.setZIndex(zIndex++);

		return style_obj;
	}



	QvOSM_PVM_MAP.addLayer(PORT_ARR_LAYER);
	QvOSM_PVM_MAP.addLayer(PORT_AGING_LAYER);

	var zoomlevel = QvOSM_PVM_MAP.getView().getZoom();

	if(zoomlevel > 4){
		PORT_AGING_LAYER.setVisible(true);
		PORT_ARR_LAYER.setVisible(false);
	  }else if(zoomlevel <= 4){       
		PORT_AGING_LAYER.setVisible(false);
		PORT_ARR_LAYER.setVisible(true);
	}

	
	QvOSM_PVM_MAP.on("moveend", function(e) {
		var zoomlevel = QvOSM_PVM_MAP.getView().getZoom();
		// console.log("줌레벨 측정" + zoomlevel)
		if(zoomlevel > 4){
			
		  PORT_AGING_LAYER.setVisible(true);
		 

		  PORT_ARR_LAYER.setVisible(false);
		  

		}else{     

		  PORT_AGING_LAYER.setVisible(false);

		  PORT_ARR_LAYER.setVisible(true);
		}
	});


	// 툴팁
	overlayTooltip = new ol.Overlay({
		element: document.getElementById("tooltip"),
		positioning: 'bottom-left',
		offset: [20,20]
	});

	overlayTooltip.setMap(QvOSM_PVM_MAP);




	// 툴팁
	QvOSM_PVM_MAP.un("pointermove");
	QvOSM_PVM_MAP.on('pointermove', function(evt) {
		// select.getFeatures().clear();cqv.GetAllVariables

			var info = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function(feature) {
			overlayTooltip.setPosition(evt.coordinate);
				return feature;
				});


			var coordinate = evt.coordinate;
			var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
			$("#map_position").html("[ "+coord[1].toFixed(6)+" , "+coord[0].toFixed(6)+" ]");


		if(info!=null && info.get("ref") && info.get("ref")["tooltip"] || info!=null && info.get("tooltip")){
			document.body.style.cursor = 'pointer';
			overlayTooltip.getElement().innerHTML = info.get("tooltip")!=null ? info.get("tooltip") : info.get("ref")["tooltip"];
			overlayTooltip.getElement().style.display = 'inline-block';
		}else{
			overlayTooltip.getElement().style.display = 'none';
			document.body.style.cursor = '';
		}



	});




};




//grid click logic ============================================================================================ start? 김민근


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

//grid click logic ============================================================================================ end



Qva.LoadCSS(QvOSM_exUrl+"css/Style.css");
Qva.LoadCSS(QvOSM_exUrl+"css/ol.css");
Qva.LoadCSS(QvOSM_exUrl+"css/bootstrap.min.css");

Qva.LoadScript(QvOSM_exUrl+"js/jquery.marquee.js", function(){
	Qva.LoadScript(QvOSM_exUrl+"js/d3.v3.min.js", function(){
		Qva.LoadScript(QvOSM_exUrl+"js/ol.js", function(){
			ol=ol;


			//김민근 맵을 그려주는 코드인 같음
			var drawMAP = function(){


				QvOSM_PVM_Opt = {
						"zoom":zoom,
						"center":center
					};





				var frmW = $target.GetWidth();
				var frmH = $target.GetHeight();


				var htmlString = "";
				htmlString += '<div id="pointPopup2" class="ol-popup"><div class="ol-popup-title"><span class="ol-popup-headtitle-content" style="color:#FFFFFF;"></span><span class="ol-popup-title-content" style="color:#FFFFFF;"></span></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;"></a><div id="popup-content" style="white-space:pre-line;"></div></div><div id="geo-marker"></div>'+
				'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
			  '</div>';
				htmlString += '<div id="pointPopup" class="ol-popup" idx="-1" style="display:none;"><div class="ol-popup-title"><div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div><div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"><span id="btn_prev">◀</span><font id="disp_step" style="margin-left:2px;margin-right:2px;font-weight:normal;"></font><span id="btn_next">▶</span></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
				'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
				  '</div>';
				htmlString += '<div id="map_position" style="position:absolute;bottom: 10px;right: 50px;color:#ffffff;background:rgba(131, 151, 169, 0.5);"></div>';
				htmlString += '<div id="map_position_append_wrap" style="display:none;position:absolute;bottom:10px;right:50px;background:rgba(131, 151, 169, 0.5);max-height:150px;padding-top:10px;padding-left:10px;"><textarea id="map_position_append" style="width:180px;height:110px;border:none;background: transparent;" readonly="readonly"></textarea></div>';
				htmlString += '<div id="tooltip"></div>';

				$target.Element.innerHTML = htmlString;

				var detail_pointPopup = '<div id="detail_pointPopup" class="ol-popup incident" idx="-1" style="z-index:99;background-color:none !important;position:absolute;left:0px;top:0px;height:10px;display:none;"><div class="ol-popup-title"><div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div><div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
				'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
				  '</div>';
				$("#detail_pointPopup").remove();
				$("body").append(detail_pointPopup);



				var news_pointPopup = '<div id="news_pointPopup" class="ol-popup" idx="-1" style="z-index:99;background-color:none !important;position:absolute;left:0px;top:0px;height:0px;display:none;"><div class="ol-popup-title"><div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div><div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"><font id="disp_step" style="margin-right:10px;font-weight:normal;"></font><span id="btn_next">NEXT</span></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
				'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
				  '</div>';
				$("#news_pointPopup").remove();
				$("body").append(news_pointPopup);




				//좌표 보여주는 로직
				$("#map_position").off("mouseover").on("mouseover",function(){
					$("#map_position_append_wrap").show()
				});

				$("#map_position_append_wrap").off("mouseout").on("mouseout",function(){
					$("#map_position_append_wrap").hide()
				});




				//맵타입 설정
				MapTypeGroup = [];
				//OSM
				MapTypeGroup.push(
					new ol.layer.Tile({
						visible: false,
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
						visible: false,
						source: new ol.source.XYZ({
							tileSize: [512, 512],
							url: 'https://api.mapbox.com/styles/v1/seungok/ciousf1zl003sdqnfpcpfj19r/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
						})
					})
				);
				//Mb
				MapTypeGroup.push(
					new ol.layer.Tile({
						visible: false,
						source: new ol.source.XYZ({
							tileSize: [512, 512],
							url: 'https://api.mapbox.com/styles/v1/seungok/cip7yoxzy0029dnm5n040qd0q/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
						})
					})
				);
				//Mb2
				MapTypeGroup.push(
					new ol.layer.Tile({
						visible: false,
						source: new ol.source.XYZ({
							tileSize: [512, 512],
							url: 'https://api.mapbox.com/styles/v1/seungok/ciouskftw003jcpnn296ackea/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
						})
					})
				);


				MapTypeNameList = ["layersOSM", "layersTn", "layersMb", "layersMb2"];




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

				for (var i = 0, ii = MapTypeGroup.length; i < ii; ++i) {
					MapTypeGroup[i].setVisible(MapTypeNameList[i] === defMap);
				}

				// console.log(defMap);

				var mapCenter;

				try{
					mapCenter = QvOSM_PVM_Opt["center"];
				}catch(e){
					console.log(e);
				}

				if(mapCenter){
					//mapCenter = ol.proj.fromLonLat([parseFloat(mapCenter[0]),parseFloat(mapCenter[1])]);
					mapCenter = ol.proj.transform([parseFloat(mapCenter[0]),parseFloat(mapCenter[1])], 'EPSG:4326', 'EPSG:3857');
				}else{
					//mapCenter = ol.proj.fromLonLat([127,38]);
					mapCenter = ol.proj.transform([127,38], 'EPSG:4326', 'EPSG:3857');
				}

				if(firstCenter.length > 0){
					//mapCenter = ol.proj.fromLonLat(firstCenter);
					mapCenter = ol.proj.transform(firstCenter, 'EPSG:4326', 'EPSG:3857');
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

				var pointPopup2 = new ol.Overlay({
					element: document.getElementById("pointPopup2"),
					autoPan: true,
					autoPanAnimation: {
						duration: 250
					 }
				});

				QvOSM_PVM_MAP.addOverlay(pointPopup);
				QvOSM_PVM_MAP.addOverlay(pointPopup2);


				var pointPopupContent = document.getElementById('popup-content');
				var pointPopupCloser = document.getElementById('popup-closer');

				// pointPopupCloser.onclick = function() {

				// 	pointPopup.setPosition(undefined);
				// 	pointPopupCloser.blur();
				// 	$("#pointPopup").hide();
				// 	$("#pointPopup2").hide();

				// 	select.getFeatures().clear();
				// 	return false;
				// };



				/* 선택 인터랙션 */
				// var select = new ol.interaction.Select({
				// 	style: function(feature) {
				// 		return feature.get('sel_style') || feature.get('style');
				// 	}
				// });

				//팝업위치 틀어짐 방지
				var _top = $("#pointPopup").css("top");
				var _left = $("#pointPopup").css("left");

				//QvOSM_PVM_MAP.getInteractions().extend([select]);
				// QvOSM_PVM_MAP.addInteraction(select);



				// QvOSM_PVM_MAP.un("dblclick");
				// QvOSM_PVM_MAP.on("dblclick", function (evt) {
				// 	select.getFeatures().clear();
				// 	var info = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
				// 		select.getFeatures().push(feature);
				// 		return feature;
				// 	});



				// });


				oldMAPTYPE = vMAPTYPE;

			};
			

			Qva.AddExtension(ExName, function() {

				$target = this;
				// cqv = Qv.GetDocument("");


				//Qv.GetCurrentDocument().binder.Set("Document.TabRow.Document\\MAIN", "action", "", true);

				//onload와 같은 기능 --------------------------------------시작
				var varsRetrieved = false;
				cqv.SetOnUpdateComplete(function(){
					
				if(!varsRetrieved){
					IsChkCnt = 0;

                    if( vEXT_RISK_SCORE.Data.Rows.length > 0 ){
                        //console.log( 'vEXT_RISK_SCORE : ', vEXT_RISK_SCORE );

                        // GetVariable(0) : vRoute_YN
                        if( vEXT_RISK_SCORE.GetVariable(0).text ){
                            try{
                                //vRoute_YN
                                vRoute_YN = vEXT_RISK_SCORE.GetVariable(0).text;
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vRoute_YN data : ", e );
                            }
                        }

                        // // GetVariable(1) : vSHOW_NEWS
                        if( vEXT_RISK_SCORE.GetVariable(1).text ){
                            try{
                                vSHOW_NEWS_OBJ = vEXT_RISK_SCORE.GetVariable(1).text;
                                // console.log( 'vSHOW_NEWS_OBJ : ', vSHOW_NEWS_OBJ );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vSHOW_NEWS data : ", e );
                            }
                        }
                        // // GetVariable(2) : vMAP
                        if( vEXT_RISK_SCORE.GetVariable(2).text ){
                            try{
                                vMAP = vEXT_RISK_SCORE.GetVariable(2).text;
                                // console.log( 'vMAP : ', vMAP );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vMAP data : ", e );
                            }
                        }
                        // // GetVariable(3) : vVIEW
                        if( vEXT_RISK_SCORE.GetVariable(3).text ){
                            try{
                                vVIEW = vEXT_RISK_SCORE.GetVariable(3).text;
                                // console.log( 'vVIEW : ', vVIEW );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vVIEW data : ", e );
                            }
                        }
                        // // GetVariable(4) : vTYPHOON_LO_NEW
                        if( vEXT_RISK_SCORE.GetVariable(4).text ){
                            try{
                                // console.log( vEXT_RISK_SCORE.GetVariable(4).text );
                                
								if( '-' != vEXT_RISK_SCORE.GetVariable(4).text && '' != vEXT_RISK_SCORE.GetVariable(4).text && null != vEXT_RISK_SCORE.GetVariable(4).text ){
									vTYPHOON = JSON.parse( vEXT_RISK_SCORE.GetVariable(4).text );
								}else{
									vTYPHOON = [];
								}
                                // console.log( 'vTYPHOON : ', vTYPHOON );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vTYPHOON_LO_NEW data : ", e );
                            }
                        }
                        // // GetVariable(5) : vVESSEL_CURR_LOC
                        if( vEXT_RISK_SCORE.GetVariable(5).text ){
                            try{
                                //vVESSEL_OBJ = JSON.parse( vEXT_RISK_SCORE.GetVariable(5).text );
								if( '-' != vEXT_RISK_SCORE.GetVariable(5).text && '' != vEXT_RISK_SCORE.GetVariable(5).text && null != vEXT_RISK_SCORE.GetVariable(5).text ){
									vVESSEL_OBJ = JSON.parse( vEXT_RISK_SCORE.GetVariable(5).text );
								}else{
									vVESSEL_OBJ = [];
								}
                                // console.log( 'vVESSEL_OBJ : ', vVESSEL_OBJ );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vVESSEL_CURR_LOC data : ", e );
                            }
                        }

                        // // GetVariable(6) : vINCIDENT
                        if( vEXT_RISK_SCORE.GetVariable(6).text ){
                            try{
                                //vINCIDENT_OBJ = JSON.parse( vEXT_RISK_SCORE.GetVariable(6).text );
								if( '-' != vEXT_RISK_SCORE.GetVariable(6).text && '' != vEXT_RISK_SCORE.GetVariable(6).text && null != vEXT_RISK_SCORE.GetVariable(6).text ){
									vINCIDENT_OBJ = JSON.parse( vEXT_RISK_SCORE.GetVariable(6).text );
								}else{
									vINCIDENT_OBJ = [];
								}
                                //console.log( 'vINCIDENT_OBJ : ', vINCIDENT_OBJ );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vINCIDENT data : ", e );
                            }
                        }

                        // GetVariable(8) : vPOLYGON : polygon(다각형) 그릴 데이터
                        if( vEXT_RISK_SCORE.GetVariable(10).text ){
                            try{
                                //vPOLYGON
                                // console.log( '12 : ', vEXT_RISK_SCORE.GetVariable(10).text );
                                if( '-' != vEXT_RISK_SCORE.GetVariable(10).text && '' != vEXT_RISK_SCORE.GetVariable(10).text && null != vEXT_RISK_SCORE.GetVariable(10).text ){
                                    vPOLYGON = JSON.parse( vEXT_RISK_SCORE.GetVariable(10).text );
                                }else{
                                    vPOLYGON = []; // 데이터가 없으면 담지 않는다.
                                }
                                // console.log( 'vPOLYGON : ', vPOLYGON );
                                // console.log( 'vPOLYGON.length : ', vPOLYGON.length );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vPOLYGON data : ", e );
                            }
                        }



                    }else{
                        IsChkCnt++;
                        console.log( 'No Data..' );
                    }


					cqv.GetAllVariables(function(variables){
					//onload와 같은 기능 --------------------------------------시작

						$_VAR = {};
						$.each(variables,function($key,$value){
							$_VAR[$value["name"]] = $value["value"];
						});


					try {

						try{
							vVIEWTYPE = (vVIEW != null && vVIEW != "") ? vVIEW : "N";
							// console.log("vVIEWTYPE :: "+vVIEWTYPE);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}


						try{
							vSHOW_NEWS = (vSHOW_NEWS_OBJ != null && vSHOW_NEWS_OBJ != "") ? vSHOW_NEWS_OBJ : "N";
							// console.log("vSHOW_NEWS :: "+vSHOW_NEWS);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}


						try{
							vMAPTYPE = (vMAP != null && vMAP != "") ? vMAP : "basic";
							// console.log("vMAPTYPE :: "+vMAPTYPE);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}



						try{
							vSHOW_ROUTE = vRoute_YN;
							// console.log("vSHOW_ROUTE :: "+vSHOW_ROUTE);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}


						if(vSHOW_ROUTE!=null && vSHOW_ROUTE=="Y"){
                            // GetVariable(7) : vROUTE
                            if( vEXT_RISK_SCORE.GetVariable(7).text ){
                                try{
									
									if( '-' != vEXT_RISK_SCORE.GetVariable(7).text && '' != vEXT_RISK_SCORE.GetVariable(7).text && null != vEXT_RISK_SCORE.GetVariable(7).text){
										vROUTE = JSON.parse( vEXT_RISK_SCORE.GetVariable(7).text );
									}else{
										vROUTE = [];
									}
									
                                    //vROUTE = JSON.parse( vEXT_RISK_SCORE.GetVariable(7).text );
                                    // console.log( 'vROUTE : ', vROUTE );
                                }catch( e ){
                                    IsChkCnt++;
                                    console.log( "can't get vROUTE data : ", e );
                                }
                            }

/*                             // // GetVariable(8) : vSTD //표준 route
                            if( vEXT_RISK_SCORE.GetVariable(8).text ){
                                try{
                                    //vSTD = JSON.parse( vEXT_RISK_SCORE.GetVariable(8).text );
									if( '-' != vEXT_RISK_SCORE.GetVariable(8).text && '' != vEXT_RISK_SCORE.GetVariable(8).text && null != vEXT_RISK_SCORE.GetVariable(8).text){
										vSTD = JSON.parse( vEXT_RISK_SCORE.GetVariable(8).text );
									}else{
										vSTD = [];
									}
                                    // console.log( 'vSTD : ', vSTD );
                                }catch( e ){
                                    IsChkCnt++;
                                    console.log( "can't get vSTD data : ", e );
                                }
                            }

                            // GetVariable(9) : vSEA , sea rate
                            if( vEXT_RISK_SCORE.GetVariable(9).text ){
                                try{
                                    //vSEA = JSON.parse( vEXT_RISK_SCORE.GetVariable(9).text );
									if( '-' != vEXT_RISK_SCORE.GetVariable(9).text && '' != vEXT_RISK_SCORE.GetVariable(9).text && null != vEXT_RISK_SCORE.GetVariable(9).text){
										vSEA = JSON.parse( vEXT_RISK_SCORE.GetVariable(9).text );
									}else{
										vSEA = [];
									}
                                    // console.log( 'vSEA : ', vSEA );
                                }catch( e ){
                                    IsChkCnt++;
                                    console.log( "can't get vSEA data : ", e );
                                }
                            } */
							
						}


                        // // GetVariable(8) : vNEWS
                        if( vEXT_RISK_SCORE.GetVariable(8).text ){
                            try{
								
								if( '-' != vEXT_RISK_SCORE.GetVariable(8).text && '' != vEXT_RISK_SCORE.GetVariable(8).text && null != vEXT_RISK_SCORE.GetVariable(8).text){
									vNEWS = JSON.parse( vEXT_RISK_SCORE.GetVariable(8).text );
								}else{
									vNEWS = [];
								}
								
                                
                                //console.log( 'vNEWS : ', vNEWS );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vNEWS data : ", e );
                            }
                        }


                        // // GetVariable(9) : vPORT_NEWS
                        if( vEXT_RISK_SCORE.GetVariable(9).text ){
                            try{                             
                                //vPORT_NEWS = JSON.parse( vEXT_RISK_SCORE.GetVariable(9).text );
								if( '-' != vEXT_RISK_SCORE.GetVariable(9).text && '' != vEXT_RISK_SCORE.GetVariable(9).text && null != vEXT_RISK_SCORE.GetVariable(9).text){
								//	console.log(vEXT_RISK_SCORE.GetVariable(9).text );
									vPORT_NEWS = JSON.parse( vEXT_RISK_SCORE.GetVariable(9).text );
								}else{
									vPORT_NEWS = [];
								}
                                 console.log( 'vPORT_NEWS : ', vPORT_NEWS );
                            }catch( e ){
                                IsChkCnt++;
                                console.log( "can't get vPORT_NEWS data : ", e );
                            }
                        }

						var $element = $($target.Element);
						uId = $target.Layout.ObjectId.replace("\\", "_");
						if(!window[uId])window[uId] = {};
						window[uId]["id"] = uId;

						//Dimensions 데이터
						try{
							$target.Data.SetPagesizeY($target.Data.TotalSize.y);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}


						ROUTE_LINE_ARR = new Array();

						$(".Document_TOP_LAYER").css("border-right","1px solid #191919");
						$(".Document_TOP_LAYER").css("border-left","1px solid #191919");

							
	                    
						$(".Document_TX595").css("cursor","pointer").off("mouseover").on("mouseover",function(){
							$(".Document_SCORE_INFO1").css("z-index",65).show();
							$(".Document_SCORE_INFO2").css("z-index",60).show();
						});

						$(".Document_TX595").off("mouseout").on("mouseout",function(){
							$(".Document_SCORE_INFO1").hide();
							$(".Document_SCORE_INFO2").hide();
						});



					
					

						//if(vSTD_DATA.legnth != vSTD.Data.Rows.length) IsChkCnt++;
						//if(vSEA_DATA.legnth != vSEA.Data.Rows.length) IsChkCnt++;




						if(!$target.framecreated){


							drawMAP();

							$target.framecreated = true;
						}


						//클릭뷰 데스크탑에서 무한 리프레시 금지
						var browser_str = navigator.userAgent;
						if(browser_str.indexOf("Mozilla/4")>-1 && browser_str.indexOf("InfoPath")>-1) IsChkCnt = 0;
						

						if(IsChkCnt>0){
							console.log("====refresh====");
							setTimeout(function(){
								Qv.GetCurrentDocument().SetVariable("vREFRESH","1");
							},1200);
						}else{
							console.log("====data loading success====");
							if(DRAW_TIM) clearTimeout(DRAW_TIM);
							DRAW_TIM = setTimeout(function(){

								if(oldMAPTYPE!=vMAPTYPE) drawMAP();

								if(vVIEWTYPE=="N") setNEWS();

								//if(vVIEWTYPE=="N") setRiskScore();
								// removeAllLayer();
								setRiskScore();
							
							

								//김민근 테스트겸 추가
								// showRiskScore();
								
                                if(vVIEWTYPE=="R") //drawPolygon();


								//vessel 먼저 화면에서 지운다.
								if(vesselLayer) QvOSM_PVM_MAP.removeLayer(vesselLayer);

								if(vVIEWTYPE=="R" && vSHOW_ROUTE=="Y"){
									// setRouteLine();
								}

								if(vVIEWTYPE=="R" && vSHOW_ROUTE=="N"){
									// setTyphoonIcon();
								}

								// removeAllLayer();

								if(vVIEWTYPE=="R" && vSHOW_ROUTE=="N"){

								}
								// removeLayer("score");
								if(vVIEWTYPE=="N"){

								}

								// removeRouteLine();
								if(vVIEWTYPE=="R"){

								}

								// $("#news_pointPopup").hide();
								if(vVIEWTYPE=="N") //showNEWS();
								


								//익스텐션 중복 추가되는 부분 제거
								$.each($("div#"+$target.Layout.ObjectId.replace("\\","_")),function(){
									if($(this).html()=="") $(this).remove();
								});

								// setRiskScore();


							},1200);

						}

					}catch(e){
						console.log(e);
						//alert(e.message);
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


// console.log(vEXT_RISK_SCORE.GetVariable(12).text);
// vEXT_RISK_SCORE.GetVariable(7).text 