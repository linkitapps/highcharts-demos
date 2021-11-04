'use strict'
var ExName = "QvOSM_RISKSCORE";
var QvOSM_exUrl = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/"+ExName+"/";

var DRAW_TIM;

var uId;
var ol;
var cqv;
var $_VAR = {};
var QvOSM_PVM_MAP;
var MapTypeGroup = [];
var MapTypeNameList;
var QvOSM_PVM_Opt = {};

var oldZoom = 3;


var defMap = "layersMb2";

var vROUTE;
var vSHOW;
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


//console.log(rows);	
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




var incidentLayer;
var incidentData = [];
var ticker_incidentData = [];




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



//거리 구하기, x,y 값 배열 두개;
var getDistance = function(pt, pt2){
	//경위도 거리 차이 보정 X
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
			console.log("기존경로 :: "+org_arr);
			console.log("기존경로 거리 :: "+org_dist);
			console.log("변경경로 :: "+r360_arr);
			console.log("변경경로 거리 :: "+r360_dist);
			console.log("getroutepathCoord :: 변경 경로가 기존 경로 보다 짧아서 변경경로 사용");
			return r360_arr;
		}
	}else{
		if(min_cnt == datarow.length){
			return org_arr;
		}else{
			console.log("getroutepathCoord :: 변동 경로 사용");
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
		            stroke: new ol.style.Stroke({color: "#333", width:0.5})
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
		SOURCE_OBJ[$target].removeFeature(SOURCE_OBJ[$target].getFeatures()[0]);
		SOURCE_OBJ[$target].clear();
		LAYER_OBJ[$target] = QvOSM_PVM_MAP.removeLayer(LAYER_OBJ[$target]);
		delete LAYER_OBJ[$target];
	}
};



var removeAllLayer = function(){
	QvOSM_PVM_MAP.removeLayer(vesselLayer);
	QvOSM_PVM_MAP.removeLayer(incidentLayer);
	
	$.each(LAYER_OBJ,function($k,$v){
		removeLayer($k);
	});
};









var setRiskScore = function(){
	
	console.log("setRiskScore start");
	
	if($target.Data.Rows!=null && $target.Data.Rows.length>0 && $target.Data.Rows[0].length==6)
	$.each($target.Data.Rows,function($k,$v){
		var obj = {
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
		};
		
		obj["point"] = ol.proj.fromLonLat([obj["lngtd"],obj["ltitde"]]);
		
		obj["tooltip"] = "<div style='font-size:12px;font-weight:bold;'>"+obj["port_nm"]+"</div>"
						+"<div style='font-size:12px;'>Score : "+obj["score"]+"</div>";
		
		
		if(obj["score"]=="-") return true;
		
		
		
		obj["color"] = "rgba(0, 159, 60, 1)";
		if(obj["score"]<1){
			obj["color"] = "rgba(0, 159, 60, 1)";
			obj["icon"] = "0";
		}else if(obj["score"]>=1 && obj["score"]<2){
			obj["color"] = "rgba(124, 198, 35, 1)";
			obj["icon"] = "1";
		}else if(obj["score"]>=2 && obj["score"]<3){
			obj["color"] = "rgba(249, 244, 0, 1)";
			obj["icon"] = "2";
		}else if(obj["score"]>=3 && obj["score"]<4){
			obj["color"] = "rgba(255, 210, 65, 1)";
			obj["icon"] = "3";
		}else if(obj["score"]>=4 && obj["score"]<6){
			obj["color"] = "rgba(235, 125, 49, 1)";
			obj["icon"] = "4-5";
		}else if(obj["score"]>=6 && obj["score"]<8){
			obj["color"] = "rgba(255, 0, 0, 1)";
			obj["icon"] = "6-7";
		}else if(obj["score"]>=9){
			obj["color"] = "rgba(150, 0, 20, 1)";
			obj["icon"] = "8";
		}
		
		
		
		
		ROUTE_LINE_ARR.push(obj);
		
	});
	
	
};


var showRiskScore = function(){
	zIndex = 0;
	
	console.log("showRiskScore start");
	
	
	if(ROUTE_LINE_ARR.length>0){
		
		var zoom = QvOSM_PVM_MAP.getView().getZoom();
		
		$.each(ROUTE_LINE_ARR,function($k,$v){
			
			
			
			var offsetX = -0.1;
			var offsetY = -4;
			var descript = $v["score"];
			var fontstyle = "10px Calibri,sans-serif";
			
			
			if(zoom>4){
				fontstyle = 'bold 14px Calibri,sans-serif';
				drawLine($v["type"] ,$v, $v["point"], 0.8, null, null,"icon", descript, offsetX, offsetY, "center", fontstyle, "rgba(54, 54, 54, 1)");
			}else{
				var $v2 = JSON.parse(JSON.stringify($v));
				$v2["icon"] = $v2["icon"]+"_15";
				drawLine($v["type"] ,$v2, $v["point"], 0.8, null, null,"icon");
			}
			
			
			
			
		});
		
		
		if(vSHOW_NEWS!="N" && $_VAR["vLOC_CD"]!=""){
			if(ltitde!="" && lngtd!=""){
				var ltitde = ROUTE_LINE_ARR[0]["ltitde"];
				var lngtd = ROUTE_LINE_ARR[0]["lngtd"];
				
				if(lngtd<0){
					lngtd = 360+lngtd;
				}
				QvOSM_PVM_MAP.getView().setZoom(8);
				var center = ol.proj.fromLonLat([lngtd,ltitde]);
				QvOSM_PVM_MAP.getView().setCenter(center);
			}
			
		}
		
		addLayer("score");
		
	}
	
	
};












//standard route
//history route
var setRouteLine = function(){
	
	
	console.log("setRouteLine start");
	
	
	vSTD_DATA = {};
	$.each(vSTD.Data.Rows,function($k,$v){
		
		if($v[1]["text"]=="-") return true;
		
		vSTD_DATA[$v[0]["text"]] = JSON.parse($v[1]["text"]);

	});
	
	
	vSEA_DATA = {};
	$.each(vSEA.Data.Rows,function($k,$v){
		
		if($v[1]["text"]=="-") return true;
		
		vSEA_DATA[$v[0]["text"]] = JSON.parse($v[1]["text"]);

	});
	
	
	console.log(vROUTE.Data.Rows);
	
	ROUTE_LINE_ARR = new Array();
	var b4obj = null;
	var route_cd = "";
	$.each(vROUTE.Data.Rows,function($key,$value){
		/*
		 * 1 : port name
		 * 2 : 경도
		 * 3 : 위도
		 * 4 : 시퀀스 (순서)
		 * 5 : eta
		 * 6 : etd
		 * 
		 */
		
		
		var obj = {
				type		:	"route",
				port_nm		:	$value[0]["text"],
				port_cd		:	$value[1]["text"],
				port_type	:	$value[2]["text"],
				lngtd		:	($.isNumeric($value[3]["text"]) ? parseFloat($value[3]["text"]) : ""),
				ltitde		:	($.isNumeric($value[4]["text"]) ? parseFloat($value[4]["text"]) : ""),
				point		:	new Array(),
				eta			:	$value[5]["text"],
				etd			:	$value[6]["text"],
				color		:	"rgba(51, 204, 51, 1)",
				score		:	$value[7]["text"],
				sch_seq		:	$value[8]["text"],//스케줄번호
				mmsi		:	$value[9]["text"],
				vsl_nm		:	$value[10]["text"],
				stdroute	:	new Array(),
				searate		:	new Array(),
				line		:	new Array(),
				tooltip		:	null
		};
		
		console.log("vPORT_NEWS.Data.Rows.length :: "+vPORT_NEWS.Data.Rows.length);
		
		$.each(vPORT_NEWS.Data.Rows,function($k,$v){
			
			var news_no 		= ($v[0]) 									?	$v[0].text 	: 	"";
			var lngtd			= ($v[1] && $.isNumeric($v[1].text))	?	parseFloat($v[1].text)	:	"-";//경도
			var ltitde			= ($v[2] && $.isNumeric($v[2].text))	?	parseFloat($v[2].text)	:	"-";//위도
			var loc_nm			= ($v[3])									?	$v[3].text	:	"";//명칭
			var title			= ($v[4])									?	$v[4].text	:	"";//exception title
			var loc_nm2			= ($v[5])									?	$v[5].text	:	"";//발생도시
			var occur_dt		= ($v[6])									?	$v[6].text	:	"";//발생일
			var source			= ($v[7])									?	$v[7].text	:	"";//source
			var valid_dt		= ($v[8])									?	$v[8].text	:	"";//valid_dt
			var cont			= ($v[9])									?	$v[9].text	:	"";//cont
			var container_cnt	= ($v[10] && $.isNumeric($v[10].text))	?	$v[10].text	:	"";//container_cnt
			var crt_dt_loc_sort	= ($v[11])									?	$v[11].text	:	"";//crt_dt_loc_sort ticker에서 날짜 정렬하기 위한 용도로 다른데 사용하지 않음.
			var excp_nm			= ($v[12])									?	$v[12].text	:	"";//excp_nm
			var id				= ($v[13])									?	$v[13].text	:	"";//id container_no를 통해 팝업을 보여주기 위한 키로 id + loc_cd로 이루어져야 unique 하다
			var excp_cd			= ($v[16])									?	$v[16].text	:	"";//excp_cd
			//var incident_type1	= ($v[4])									?	$v[4].text	:	"";//분류1
			//var category		= ($v[14])									?	$v[14].text	:	"";//category
			//var loc_cd			= ($v[18])									?	$v[18].text	:	"";//loc_cd
			var port_cd			= ($v[21])									?	$v[21].text	:	"";//port_nm
			var incident_type2	= ($v[22])									?	$v[22].text	:	"";//분류2
			
			
			
			var newsObj = {
					type			:	"news",
					news_no			:	news_no,
					lngtd			:	lngtd,
					ltitde			:	ltitde,
					loc_nm			:	loc_nm,
					//incident_type1	:	incident_type1,
					//incident_type2	:	incident_type2,
					title			:	title,
					loc_nm2			:	loc_nm2,
					loc_nm3			:	loc_nm2,
					occur_dt		:	occur_dt,
					source			:	source,
					valid_dt		:	valid_dt,
					cont			:	cont,
					excp_nm			:	excp_nm,
					//category		:	category,
					container_cnt	:	container_cnt,
					id				:	id,
					/*loc_cd			:	loc_cd,*/
					port_cd			:	port_cd,
					incident_type2	:	incident_type2
			};
			
			
			console.log(newsObj);
			
			if(news_no.length<4) return true;
			if(lngtd=="-") return true;
			if(ltitde=="-") return true;
			
			
			
			//포트가 같은 뉴스이면 이 뉴스를 가지고 아이콘과 팝업을 처리해야한다.
			console.log("port_nm :: "+obj["port_cd"]+" , "+newsObj["port_cd"]);
			if(obj["port_cd"]==newsObj["port_cd"]){
				
			
				switch(newsObj["incident_type2"].trim()){
				
				case "Civil Unrest":
					obj["news_icon"] = "CivilUnrest";
					obj["color"] = "rgba(0, 113, 160, 1)";
					obj["news_on"] = 1;
					break;
				case "Customs Issue":
					obj["news_icon"] = "Customs";
					obj["color"] = "rgba(143, 66, 174, 1)";
					obj["news_on"] = 1;
					break;
				case "Cyclonic Storms":
					obj["news_icon"] = "CyclonicStorms";
					obj["color"] = "rgba(239, 85, 41, 1)";
					obj["news_on"] = 1;
					break;
				case "Dense Fog":
					obj["news_icon"] = "DenseFog";
					obj["color"] = "rgba(246, 157, 10, 1)";
					obj["news_on"] = 1;
					break;
				case "Diplomatic Crisis":
					obj["news_icon"] = "DiplomaticCrisis";
					obj["color"] = "rgba(0, 113, 160, 1)";
					obj["news_on"] = 1;
					break;
				case "Earthquake":
					obj["news_icon"] = "Earthquake";
					obj["color"] = "rgba(239, 85, 41, 1)";
					obj["news_on"] = 1;
					break;
				case "Fire on Ship":
					obj["news_icon"] = "FireOnShip";
					obj["color"] = "rgba(228, 0, 124, 1)";
					obj["news_on"] = 1;
					break;
				case "Floods":
					obj["news_icon"] = "Floods";
					obj["color"] = "rgba(239, 85, 41, 1)";
					obj["news_on"] = 1;
					break;
				case "Heavy Rain":
					obj["news_icon"] = "HeavyRain";
					obj["color"] = "rgba(246, 157, 10, 1)";
					obj["news_on"] = 1;
					break;
				case "Heavy Snow":
					obj["news_icon"] = "HeavySnow";
					obj["color"] = "rgba(246, 157, 10, 1)";
					obj["news_on"] = 1;
					break;
				case "Holiday":
					obj["news_icon"] = "Holiday";
					obj["color"] = "rgba(143, 66, 174, 1)";
					obj["news_on"] = 1;
					break;
				case "IT/Cyber Attack":
					obj["news_icon"] = "ITCyberAttack";
					obj["color"] = "rgba(143, 66, 174, 1)";
					obj["news_on"] = 1;
					break;
				case "Labor Dispute":
					obj["news_icon"] = "LaborDispute";
					obj["color"] = "rgba(239, 85, 41, 1)";
					obj["news_on"] = 1;
					break;
				case "Law Enforcement":
					obj["news_icon"] = "LawEnforcement";
					obj["color"] = "rgba(0, 113, 160, 1)";
					obj["news_on"] = 1;
					break;
				case "Port Infrastructure":
					obj["news_icon"] = "PortInfrastructure";
					obj["color"] = "rgba(143, 66, 174, 1)";
					obj["news_on"] = 1;
					break;
				case "Regulation":
					obj["news_icon"] = "Regulatory";
					obj["color"] = "rgba(143, 66, 174, 1)";
					obj["news_on"] = 1;
					break;
				case "Ship/Airplane Trouble":
					obj["news_icon"] = "ShipAirplaneFailure";
					obj["color"] = "rgba(228, 0, 124, 1)";
					obj["news_on"] = 1;
					break;
				case "Ship Collision":
					obj["news_icon"] = "ShipCollision";
					obj["color"] = "rgba(228, 0, 124, 1)";
					obj["news_on"] = 1;
					break;
				case "Strong Wind":
					obj["news_icon"] = "StrongWind";
					obj["color"] = "rgba(246, 157, 10, 1)";
					obj["news_on"] = 1;
					break;
				case "Terror":
					obj["news_icon"] = "Terror";
					obj["color"] = "rgba(0, 113, 160, 1)";
					obj["news_on"] = 1;
					break;
				case "Volcano":
					obj["news_icon"] = "Volcano";
					obj["color"] = "rgba(239, 85, 41, 1)";
					obj["news_on"] = 1;
					break;
				case "War":
					obj["news_icon"] = "War";
					obj["color"] = "rgba(0, 113, 160, 1)";
					obj["news_on"] = 1;
					break;
				case "Etc":
					obj["news_icon"] = "Etc";
					obj["color"] = "rgba(116, 116, 116, 1)";
					obj["news_on"] = 1;
					break;
				}
								
				
				
				if(obj["news_arr"]==null) obj["news_arr"] = new Array();
				obj["news_arr"].push(newsObj);
				
				
			}
			
			
		});
		
		
		
		obj["color"] = "rgba(0, 159, 60, 1)";
		if(obj["score"]<1){
			obj["color"] = "rgba(0, 159, 60, 1)";
			obj["icon"] = "0";
		}else if(obj["score"]>=1 && obj["score"]<2){
			obj["color"] = "rgba(124, 198, 35, 1)";
			obj["icon"] = "1";
		}else if(obj["score"]>=2 && obj["score"]<3){
			obj["color"] = "rgba(249, 244, 0, 1)";
			obj["icon"] = "2";
		}else if(obj["score"]>=3 && obj["score"]<4){
			obj["color"] = "rgba(255, 210, 65, 1)";
			obj["icon"] = "3";
		}else if(obj["score"]>=4 && obj["score"]<6){
			obj["color"] = "rgba(235, 125, 49, 1)";
			obj["icon"] = "4-5";
		}else if(obj["score"]>=6 && obj["score"]<8){
			obj["color"] = "rgba(255, 0, 0, 1)";
			obj["icon"] = "6-7";
		}else if(obj["score"]>=9){
			obj["color"] = "rgba(150, 0, 20, 1)";
			obj["icon"] = "8";
		}
		
		obj["point"] = ol.proj.fromLonLat([obj["lngtd"],obj["ltitde"]]);
		
		obj["tooltip"] = "<div style=''>"+obj["port_nm"]+" ("+obj["port_cd"]+") "+obj["port_type"]+"</div>"
		+"<div style=''>Risk Score: "+obj["score"]+"</div>"
		+"<div style=''>"+obj["eta"]+"→"+obj["etd"]+"</div>"
		
		
		if(b4obj!=null){
			route_cd = b4obj["port_cd"]+"_"+obj["port_cd"];
		}
		
		
		if(vSTD_DATA[route_cd]!=null && vSTD_DATA[route_cd].length>0){
			
			obj["stdroute"] = [getroutepathCoord(vSTD_DATA[route_cd])];
			
		}

		
		if(vSEA_DATA[route_cd]!=null && vSEA_DATA[route_cd].length>0){
			
			obj["searate"] = [getroutepathCoord(vSEA_DATA[route_cd])];
			
		}
		
		
		console.log("구간 :: "+route_cd);
		if(b4obj!=null && b4obj["lngtd"]!=null && b4obj["lngtd"]!=null) obj["line"] = [getroutepathCoord([[b4obj["lngtd"],b4obj["ltitde"]],[obj["lngtd"],obj["ltitde"]]])];
		
		

		ROUTE_LINE_ARR.push(obj);
		
		
		b4obj = null;
		b4obj = JSON.parse(JSON.stringify(obj));
		
		
		
	});
	
	
	
	
};


var removeRouteLine = function(){
	$.each(ROUTE_LINE_ARR,function($k,$v){
		removeLayer("stdroute_"+$k);
		removeLayer("searate_"+$k);
		removeLayer("line_"+$k);
		removeLayer("icon_"+$k);
	});
};


var showRouteLine = function(){
	zIndex = 0;

	console.log("showRouteLine start");
	
	
	if(ROUTE_LINE_ARR.length>0){
		var $mmsi = "";
		var $vsl_nm = "";
		var $odd = 0;
		$.each(ROUTE_LINE_ARR,function($k,$v){
			var $color = (vMAPTYPE=="basic" || vMAPTYPE=="lightblue") ? "rgba(197, 90, 17, 0.8)" : "rgba(244, 177, 131, 0.8)";
			
			if($mmsi=="") $mmsi = $v["mmsi"];
			if($vsl_nm=="") $vsl_nm = $v["vsl_nm"];
			
			if($mmsi!=$v["mmsi"]){
				if($odd == 0){
					$odd = 1;
				}else {
					$odd = 0;
				}
			}else if($vsl_nm!=$v["vsl_nm"]){
				if($odd == 0){
					$odd = 1;
				}else {
					$odd = 0;
				}
			}
			
			if($odd==0){
				$color = (vMAPTYPE=="basic" || vMAPTYPE=="lightblue") ? "rgba(197, 90, 17, 0.8)" : "rgba(244, 177, 131, 0.8)";
			}else{
				$color = (vMAPTYPE=="basic" || vMAPTYPE=="lightblue") ? "rgba(46, 117, 182, 0.8)" : "rgba(157, 195, 230, 0.8)";
			}
			
			$mmsi = $v["mmsi"];
			
			console.log("mmsi :: "+$mmsi);
			console.log("$odd :: "+$odd);
			console.log("$color :: "+$color);
			
			var IS_ROUTE = false;
			
			var routeobj = JSON.parse(JSON.stringify($v));
			routeobj["tooltip"] = null;
			
			
			if($v["searate"].length>0){
				console.log("searate 사용 :: ");
				console.log(routeobj);
				drawLine("searate_"+$k ,routeobj, routeobj["searate"], 3, null, $color,"dash");
				addLayer("searate_"+$k);
				IS_ROUTE = true;
				
			}	
			
			
			if(IS_ROUTE==false && $v["stdroute"].length>0){
				console.log("stdroute 사용 :: ");
				console.log(routeobj);
				drawLine("stdroute_"+$k ,routeobj, routeobj["stdroute"], 3, null, $color,"dash");
				addLayer("stdroute_"+$k);
				IS_ROUTE = true;
				
			}
			
			
			if(IS_ROUTE==false){
				if(routeobj["line"].length==0 || routeobj["line"][0][0][0]==null || routeobj["line"][0][0][1]==null || routeobj["line"][0][1][0]==null || routeobj["line"][0][1][1]==null){
					console.log("vROUTE 그릴수 없는 좌표 발견 :: ");
					console.log(routeobj);
				}else{
					
					if(routeobj["line"][0].length>0){

						console.log("vROUTE 표준도 searate도 없는 구간으로 직선처리 :: ");
						console.log(routeobj);
						

						drawLine("line_"+$k ,routeobj, routeobj["line"], 3, null, $color,"dash");
						addLayer("line_"+$k);
						
					}
					
				}
				

			}
			

		});
		
		//아이콘 그릴때 뉴스가 있으면 뉴스 아이콘으로 변경하는 로직이 들어가야 한다.
		//그리고 마우스 오버시 그에 대한 툴팁이 나오고, 클릭하면 해당 뉴스의 내용이 팝업으로 나타난다. singleclick에서 툴팁기능 추가해야 한다.
		$.each(ROUTE_LINE_ARR,function($k,$v){
			drawLine("icon_"+$k ,$v, $v["point"], 0.8, null, null,"icon", $v["score"], -0.1, -4, "center", 'bold 14px Calibri,sans-serif', "rgba(54, 54, 54, 1)");
			addLayer("icon_"+$k);
			
			
			if($v["news_on"]==1){
				var $v2 = JSON.parse(JSON.stringify($v));
				$v2["type"] = "news";
				$v2["icon"] = $v2["news_icon"];
				$v2["tooltip"] = $v2["news_arr"][0]["title"];
				$v2["incident_type2"] = $v2["news_arr"][0]["incident_type2"];
				$v2["lngtd"] = $v2["lngtd"] + 0.5;
				
				console.log($v2);
				
				if($v2["news_arr"].length>1){
					drawLine("news_icon_"+$k ,$v2, ol.proj.fromLonLat([$v2["lngtd"],$v2["ltitde"]]), 0.5, null, null,"icon", $v2["news_arr"].length, -10, 22, "left", 'bold 18px Calibri,sans-serif', $v2["color"]);
				}else{
					drawLine("news_icon_"+$k ,$v2, ol.proj.fromLonLat([$v2["lngtd"],$v2["ltitde"]]), 0.5, null, null,"icon");
				}
				addLayer("news_icon_"+$k);
			}
			
		});
		
		
		
		var ltitde = (ROUTE_LINE_ARR[0]["ltitde"] + ROUTE_LINE_ARR[ROUTE_LINE_ARR.length-1]["ltitde"])*2/3;
		var lngtd = (ROUTE_LINE_ARR[0]["lngtd"] + ROUTE_LINE_ARR[ROUTE_LINE_ARR.length-1]["lngtd"])*2/3;
		
		if(lngtd<0){
			lngtd = 360+lngtd;
		}
		
		if(ltitde!="" && lngtd!=""){
			var center = ol.proj.fromLonLat([lngtd,ltitde]);
			QvOSM_PVM_MAP.getView().setCenter(center);
		}
		
		
	}
	
	
	
	
};

















var offy = 15;
var mapAniObj = null;
var aniFea = [];
var vesselZoom=1;
var vesselLabel = false;
var vesselLabelC = vesselLabel;

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
	return new ol.style.Style(obj);
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


function getDistance(pt, pt2){
	var x2 = Math.pow((pt[0]-pt2[0]),2);
	var y2 = Math.pow((pt[1]-pt2[1]),2);
	return Math.sqrt((x2+y2));
}











var showVessel = function(){

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

//		console.log(list);
		
		
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
				drawLine($v["type"]+"_"+$key+"_icon_"+$k, $v, $v["data"], 1, null, null, "icon",$v["text"],null,null,null,"12px Calibri,sans-serif",$v["color"]);
				addLayer($v["type"]+"_"+$key+"_icon_"+$k);
				
			});
			
			
			var typhoon_nm = "";
			$.each($value["data"],function($k,$v){
				
				//현재 태풍 아이콘 위치에 태풍 이름 출력
				if($v["curr"]==true && typhoon_nm==""){
					typhoon_nm = $v["name"];
					drawLine($v["type"]+"_"+$key+"_text_"+$k, $v, $v["data"], null, null, "#006ca2", "text",$v["name"],20,null,null,"bold 20px Calibri,sans-serif","#006ca2");
					addLayer($v["type"]+"_"+$key+"_text_"+$k);
				}
				
				
			});
			
			
		});
		
		
		
		
	}
	
	
	
	
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
			
			if(incidentObj["news_arr"].length>1){
				if(incidentObj["news_on"] == 1){
					fontstyle = 'bold 18px Calibri,sans-serif';
					vIconFea.set('style', createIncidentIcon2(incidentObj["icon"], 0, 0.5, incidentObj["news_arr"].length,fontstyle,fontcolor));
				}
				else vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 0.7, incidentObj["news_arr"].length,fontstyle,fontcolor));
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
	
	
	
/*	$("#rader_div").remove();
	$(".Document_TITLE_LAYER").append('<div id="rader_div" style="position:absolute;left: 250px;top: 8px;text-align:center;">'
			+'<img style="width:45px;" src="'+QvOSM_exUrl+'icon/radar_white.png"/>'
		+'</div>');					
*/
	

	
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



//news icon 용
var createIncidentIcon2 = function(icon, rotation, scale, name,fontstyle,fontcolor) {
	var _font = fontstyle==null ? '10px Calibri,sans-serif' : fontstyle;
	
	var obj = {
		image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
			scale: scale ? scale : 1,
			src: QvOSM_exUrl+'icon/'+icon+'.png',
			rotation : 0//rotation ? rotation * Math.PI / 180 : 0
		})),
        text: new ol.style.Text({
            font: fontstyle,
            textAlign: "left",
            text: name ? name+"" : "",
			offsetY: -10,
			offsetX: 18,
            overflow: true,
            fill: new ol.style.Fill({
              color: fontcolor ? fontcolor : '#000'
            }),
            stroke: new ol.style.Stroke({color: "#333", width:0.5})
        })
	};
	
	var ret = new ol.style.Style(obj);
	ret.setZIndex(zIndex++);
	
	return ret;
}








//grid click logic ============================================================================================ end	



Qva.LoadCSS(QvOSM_exUrl+"css/Style.css");
Qva.LoadCSS(QvOSM_exUrl+"css/ol.css");
Qva.LoadCSS(QvOSM_exUrl+"css/bootstrap.min.css");

Qva.LoadScript(QvOSM_exUrl+"js/jquery.marquee.js", function(){
	Qva.LoadScript(QvOSM_exUrl+"js/d3.v3.min.js", function(){
		Qva.LoadScript(QvOSM_exUrl+"js/ol.js", function(){
			ol=ol;
			
			
			

			

			
			
			
			
			
			
			
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
				
				console.log(defMap);
				
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
				
				pointPopupCloser.onclick = function() {
					
					pointPopup.setPosition(undefined);
					pointPopupCloser.blur();
					$("#pointPopup").hide();
					$("#pointPopup2").hide();
					
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
				
				
				
				QvOSM_PVM_MAP.un("dblclick");
				QvOSM_PVM_MAP.on("dblclick", function (evt) {
					select.getFeatures().clear();
					var info = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
						select.getFeatures().push(feature);
						return feature;
					});

					
					
				});
				
				
				
				
				//싱슬 클릭시 이벤트t
				QvOSM_PVM_MAP.un("singleclick");
				QvOSM_PVM_MAP.on("singleclick", function (evt) {
					select.getFeatures().clear();
					
					var coordinate = evt.coordinate;
					console.log(coordinate);
					
					$("#pointPopup").attr("data","");
					$("#pointPopup").height("");
					
					//draggable에 의한 위치 초기화
					$("#pointPopup").attr("style","");
					
					
					
					
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
						
						if(feature.get("type") || (feature.get("ref") && feature.get("ref")["type"])){
							//console.log(feature);
							//$(".ol-popup-headtitle-content").html("<img style='width:20px;' src='"+QvOSM_exUrl+"icon/ship.png"+"'/>");
							
							$("#pointPopup").addClass("incident");
							
						}else{
							$("#pointPopup").removeClass("incident");
						}
						
						
						
						
						
						

						
						if(feature.get("type")=="vessel"){
							
							popup = feature.get("popup") ? feature.get("popup") : feature.get("ref")["popup"];
							type = 	feature.get("type") ? feature.get("type") : feature.get("ref")["type"];
							vsl_nm = feature.get("tyKey") ? feature.get("tyKey") : feature.get("ref")["vsl_name"];
							
							
							//console.log(feature);
							//$(".ol-popup-headtitle-content").html("<img style='width:20px;' src='"+QvOSM_exUrl+"icon/ship.png"+"'/>");
							$("#pointPopup2 .ol-popup-headtitle-content").html("");
							$("#pointPopup2 .ol-popup-title-content").text(vsl_nm);
							
							//typhoon rader :: popup and mmsi_no set
							$("#pointPopup2 .ol-popup-title-content").off("click").on("click",function(){
								//Qv.GetDocument("").SetVariable("vMMSI_NO",feature.get("mmsi"));
								$("#pointPopup2 #popup-closer").trigger("click");
							});
							
							$("#pointPopup2").addClass("vessel");
							$("#pointPopup2").removeClass("incident");
							
						}else{
							$("#pointPopup2").removeClass("vessel");
						}
						
						
						
						
						
						
						return feature;
						
					});
					
					
					
					
					
					
					
					if(info!=null && popup){
						
						$("#pointPopup2 #popup-content").html('<p class="popup_content" style="width:300px;word-break: break-all;">'+popup+'</p>');
						$("#pointPopup2 .ol-popup-title-content").attr("def",type);
						$("#pointPopup2 .ol-popup .popup_content").attr("def",type);
						pointPopup2.setPosition(coordinate);
						$("#pointPopup2").show();
						return;
					} else {
						
						$("#pointPopup2 #popup-closer").trigger("click");
					}				
					
					$("#pointPopup").css("top",_top);
					$("#pointPopup").css("left",_left);
					$("#pointPopup").draggable();
					
					
					
					
					
					
					
					var IsNews = info!=null && (info.get("news_arr")!=null || info.get("except_arr")!=null) && (info.get("news_arr").length>0 || info.get("except_arr").length>0);
					
					if(IsNews==false){
						var $info = info!=null && info.get("ref")!=null ? info.get("ref") : null;
						IsNews = $info!=null && ($info["news_arr"]!=null || $info["except_arr"]!=null) && ($info["news_arr"].length>0 || $info["except_arr"].length>0);
					}
					
					
					
					if(IsNews){
						var obj = {};
						var $info = info.get("ref")!=null ? info.get("ref") : null;
						if($info!=null){
							obj = {
									type		: "news",
									lngtd		: $info["lngtd"],
									ltitde		: $info["ltitde"],
									incident_type1		: $info["incident_type1"],
									incident_type2		: $info["incident_type2"],
									news_arr	: $info["news_arr"] ? $info["news_arr"] : new Array(),
									except_arr	: $info["except_arr"] ? $info["except_arr"] : new Array()
							}
						}else{
							obj = {
									type		: "news",
									lngtd		: info.get("lngtd"),
									ltitde		: info.get("ltitde"),
									incident_type1		: info.get("incident_type1"),
									incident_type2		: info.get("incident_type2"),
									news_arr	: info.get("news_arr") ? info.get("news_arr") : new Array(),
									except_arr	: info.get("except_arr") ? info.get("except_arr") : new Array()
							}
						}
						
						console.log(obj);
						
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
									//QvOSM_PVM_MAP.getView().setZoom(3);
									//pointPopup.setPosition(coordinate);
									//위치를 오른쪽으로 이동하여 왼쪽에 팝업과 나란히 배치한다. 끝
									
									//QvOSM_PVM_MAP.getView().setCenter([coordinate[0]-6500000,coordinate[1]+3000000]);
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
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					if(vVIEWTYPE=="N"){
						if(info!=null && info.get("ref")!=null){
							if(info.get("ref")["loc_cd"]!=null){
								Qv.GetCurrentDocument().SetVariable("vLOC_CD",info.get("ref")["loc_cd"]);
							}
						}else if($_VAR["vLOC_CD"]!=""){
							Qv.GetCurrentDocument().SetVariable("vLOC_CD","");
						}
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
					select.getFeatures().clear();
					
					  var info = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function(feature) {
						  overlay.setPosition(evt.coordinate);
						    return feature;
						  });
					  	
					  
						var coordinate = evt.coordinate;
						var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
						$("#map_position").html("[ "+coord[1].toFixed(6)+" , "+coord[0].toFixed(6)+" ]");
					  
					  
					if(info!=null && info.get("ref") && info.get("ref")["tooltip"] || info!=null && info.get("tooltip")){
						document.body.style.cursor = 'pointer';
						overlay.getElement().innerHTML = info.get("tooltip")!=null ? info.get("tooltip") : info.get("ref")["tooltip"];
						overlay.getElement().style.display = 'inline-block';
					}else{
						overlay.getElement().style.display = 'none';
						document.body.style.cursor = '';
					}
					  
					  
					  
				});
				
				
				
				
				
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
							if(vVIEWTYPE=="N"){
								removeLayer("score");
								showRiskScore();
							}
						},500);
						
					}
					
					
					oldZoom=view.getZoom();
					
					
					
					
				}
				//console.log(vesselZoom);
				QvOSM_PVM_MAP.getView().on('propertychange', onZoom);		
				
				
				
				
				
				
				
				
				
				oldMAPTYPE = vMAPTYPE;
				
			};

			
			
			
			
			
			
			
			
			
			
			
			
			

			
			
			
			
			
			
			

			


			
			
			
			
			
			
			
			
			
			
			Qva.AddExtension(ExName, function() {
				
				$target = this;
				cqv = Qv.GetDocument("");
				
				
	
				
				
				
				//Qv.GetCurrentDocument().binder.Set("Document.TabRow.Document\\MAIN", "action", "", true);
				
				//onload와 같은 기능 --------------------------------------시작
				var varsRetrieved = false;
				cqv.SetOnUpdateComplete(function(){
				if(!varsRetrieved){
					
					
					IsChkCnt = 0;
					
					
					if(vVIEW==null) vVIEW = cqv.GetObject("vVIEW");
					
					if(vSHOW==null) vSHOW = cqv.GetObject("vSHOW_ROUTE");
					
					if(vSHOW_NEWS_OBJ==null) vSHOW_NEWS_OBJ = cqv.GetObject("vSHOW_NEWS");
					
					
					
					//maptype row data;
					if(vMAP==null) vMAP = cqv.GetObject("vMAP");
					
					if(vVIEW==null) vVIEW = cqv.GetObject("vVIEW");
					
					//태풍 데이터
					if(vTYPHOON==null) vTYPHOON = cqv.GetObject("vTYPHOON_LO_NEW");
					try{
						vTYPHOON.Data.SetPagesizeY(vTYPHOON.Data.TotalSize.y);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					console.log(vTYPHOON);
					
					//vessel 데이터
					if(vVESSEL_OBJ==null) vVESSEL_OBJ = cqv.GetObject("vVESSEL_CURR_LOC");
					try{
						vVESSEL_OBJ.Data.SetPagesizeY(vVESSEL_OBJ.Data.TotalSize.y);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					console.log(vVESSEL_OBJ);
					
					
					
					
					
					
					
					
					
					
					
					
					//INCIDENT 데이터
					if(vINCIDENT_OBJ==null) vINCIDENT_OBJ = cqv.GetObject("vINCIDENT");
					try{
						vINCIDENT_OBJ.Data.SetPagesizeY(vINCIDENT_OBJ.Data.TotalSize.y);
					}catch(e){
						IsChkCnt++;
						console.log(e);
					}
					console.log(vINCIDENT_OBJ);
					
					
					cqv.GetAllVariables(function(variables){
					//onload와 같은 기능 --------------------------------------시작
				
						
						$_VAR = {};
						$.each(variables,function($key,$value){
							$_VAR[$value["name"]] = $value["value"];
						});
						
						
						
						
					try {
						
						
						
						try{
							vVIEWTYPE = (vVIEW.GetVariable()["text"]!=null && vVIEW.GetVariable()["text"]!="") ? vVIEW.GetVariable()["text"] : "N";
							console.log("vVIEWTYPE :: "+vVIEWTYPE);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}
						
						
						try{
							vSHOW_NEWS = (vSHOW_NEWS_OBJ.GetVariable()["text"]!=null && vSHOW_NEWS_OBJ.GetVariable()["text"]!="") ? vSHOW_NEWS_OBJ.GetVariable()["text"] : "N";
							console.log("vSHOW_NEWS :: "+vSHOW_NEWS);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}
						
						
						try{
							vMAPTYPE = (vMAP.GetVariable()["text"]!=null && vMAP.GetVariable()["text"]!="") ? vMAP.GetVariable()["text"] : "basic";
							console.log("vMAPTYPE :: "+vMAPTYPE);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}
						
						
						
						try{
							vSHOW_ROUTE = vSHOW.GetVariable()["text"];
							console.log("vSHOW_ROUTE :: "+vSHOW_ROUTE);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}

						
						if(vSHOW_ROUTE!=null && vSHOW_ROUTE=="Y"){
							if(vROUTE==null) vROUTE = cqv.GetObject("vROUTE");
							try{//40개를 넘지 않는다는 전제하에 페이징 해제 처리 안함
								vROUTE.Data.SetPagesizeY(vROUTE.Data.TotalSize.y);
							}catch(e){
								IsChkCnt++;
								console.log(e);
							}						

							//표준route
							if(vSTD==null) vSTD = cqv.GetObject("vSTD");
							try{//40개를 넘지 않는다는 전제하에 페이징 해제 처리 안함
								vSTD.Data.SetPagesizeY(vSTD.Data.TotalSize.y);
							}catch(e){
								IsChkCnt++;
								console.log(e);
							}

							

							//sea rate
							if(vSEA==null) vSEA = cqv.GetObject("vSEA");
							try{//40개를 넘지 않는다는 전제하에 페이징 해제 처리 안함
								vSEA.Data.SetPagesizeY(vSEA.Data.TotalSize.y);
							}catch(e){
								IsChkCnt++;
								console.log(e);
							}
							
							
						}
						console.log("====vROUTE============");
						console.log(vROUTE);
						
						
						
						if(vNEWS==null) vNEWS = cqv.GetObject("vNEWS");
						try{
							vNEWS.Data.SetPagesizeY(vNEWS.Data.TotalSize.y);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}


						if(vPORT_NEWS==null) vPORT_NEWS = cqv.GetObject("vPORT_NEWS");
						try{
							vPORT_NEWS.Data.SetPagesizeY(vPORT_NEWS.Data.TotalSize.y);
						}catch(e){
							IsChkCnt++;
							console.log(e);
						}
						
						
						
						vesselData = new Array();
						$.each(vVESSEL_OBJ.Data.Rows,function(i){
							//console.log(this);
							
							//넘어오는 데이터
							var name = (this[1])?this[1].text:"-";
							var lat = (this[2])?this[2].text:"0";
							var lon = (this[3])?this[3].text:"0";
							var vDirect = (this[4])?this[4].text:"0";
							var inout = (this[5])?this[5].text:"-";
							var type = (this[6])?this[6].text:"-";
							var mmsi = (this[7])?this[7].text:"0";
							var aniYN = "Y";
							var popup = (this[8])?this[8].text:"-";
							
						
							
							
							if(type === "VESSEL"){
								
								inout = inout.replace("BROKEN","MOVING");
								inout = inout.replace("NOTMOVING","MOVING");
								inout = inout.replace("MOVING","MOVING");
								inout = inout.replace("Gray","MOVING");
								
								
								
								var vesselObj = {
									name : name,
									point : [parseFloat(lon),parseFloat(lat)],
									direction : vDirect,
									inout : inout,
									popup : popup,
									mmsi  : mmsi,
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
						
						
						
						
						
						
						
						
						
						
						
						
						
						vTYPHOON_DATA_ARR = new Array();
						
						try{
							$.each(vTYPHOON.Data.Rows,function(){
								
								
								var obj = {
										NAME			:	this[1]["text"],
										KEY_TYPHOON		:	this[0]["text"],
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
						
						
						

						
						
						
						
						
						
						
						
						incidentData = new Array();
						$.each(vINCIDENT_OBJ.Data.Rows,function(i){
							//console.log(this);
							
							//넘어오는 데이터
							var lngtd			= (this[0] && $.isNumeric(this[0].text))	?	parseFloat(this[0].text)	:	"-";//경도
							var ltitde			= (this[1] && $.isNumeric(this[1].text))	?	parseFloat(this[1].text)	:	"-";//위도
							var loc_nm			= (this[2])	?	this[2].text						:	"";//명칭
							var incident_type2	= (this[3])	?	this[3].text						:	"";//명칭
							var except_cnt		= (this[3] && $.isNumeric(this[4].text))	?	parseInt(this[4].text)				:	0;//exception 갯수
							var news_cnt		= (this[4] && $.isNumeric(this[5].text))	?	parseInt(this[5].text)				:	0;//news 갯수
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
									incident_type2: incident_type2,
									news_cnt  	: news_cnt,
									total_cnt	: total_cnt,
									except_cnt	: except_cnt,
									news_arr	: new Array(),
									except_arr	: new Array()
								};	
							//console.log(incidentObj);
							incidentData.push(incidentObj);
							
							
						});
	
						
						console.log(incidentData);
						
	
						//exception 정보 정리
						//console.log(vNewsObj);
						if(incidentData.length>0)
						$.each(vNEWS.Data.Rows,function($key,$value){
							
							var news_no 		= ($value[0]) 									?	$value[0].text 	: 	"";
							var lngtd			= ($value[1] && $.isNumeric($value[1].text))	?	parseFloat($value[1].text)	:	"-";//경도
							var ltitde			= ($value[2] && $.isNumeric($value[2].text))	?	parseFloat($value[2].text)	:	"-";//위도
							var loc_nm			= ($value[3])									?	$value[3].text	:	"";//명칭
							var title			= ($value[4])									?	$value[4].text	:	"";//exception title
							var loc_nm2			= ($value[5])									?	$value[5].text	:	"";//발생도시
							var occur_dt		= ($value[6])									?	$value[6].text	:	"";//발생일
							var source			= ($value[7])									?	$value[7].text	:	"";//source
							var valid_dt		= ($value[8])									?	$value[8].text	:	"";//valid_dt
							var cont			= ($value[9])									?	$value[9].text	:	"";//cont
							var container_cnt	= ($value[10] && $.isNumeric($value[10].text))	?	$value[10].text	:	"";//container_cnt
							var crt_dt_loc_sort	= ($value[11])									?	$value[11].text	:	"";//crt_dt_loc_sort ticker에서 날짜 정렬하기 위한 용도로 다른데 사용하지 않음.
							var excp_nm			= ($value[12])									?	$value[12].text	:	"";//excp_nm
							var id				= ($value[13])									?	$value[13].text	:	"";//id container_no를 통해 팝업을 보여주기 위한 키로 id + loc_cd로 이루어져야 unique 하다
							var excp_cd			= ($value[16])									?	$value[16].text	:	"";//excp_cd
							//var incident_type1	= ($value[4])									?	$value[4].text	:	"";//분류1
							//var incident_type2	= ($value[5])									?	$value[5].text	:	"";//분류2
							//var category		= ($value[14])									?	$value[14].text	:	"";//category
							//var loc_cd			= ($value[18])									?	$value[18].text	:	"";//loc_cd
							
							
							
							
							
							var newsObj = {
									type			:	"news",
									news_no			:	news_no,
									lngtd			:	lngtd,
									ltitde			:	ltitde,
									loc_nm			:	loc_nm,
									//incident_type1	:	incident_type1,
									//incident_type2	:	incident_type2,
									title			:	title,
									loc_nm2			:	loc_nm2,
									loc_nm3			:	loc_nm2,
									occur_dt		:	occur_dt,
									source			:	source,
									valid_dt		:	valid_dt,
									cont			:	cont,
									excp_nm			:	excp_nm,
									//category		:	category,
									container_cnt	:	container_cnt,
									id				:	id/*,
									loc_cd			:	loc_cd*/
							};
							
							
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
									
									
									
									
									
									//if(incidentData[$k]["news_arr"]==1){
										switch(incidentData[$k]["incident_type2"].trim()){
										
										case "Civil Unrest":
											incidentData[$k]["icon"] = "CivilUnrest";
											incidentData[$k]["color"] = "rgba(0, 113, 160, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Customs Issue":
											incidentData[$k]["icon"] = "Customs";
											incidentData[$k]["color"] = "rgba(143, 66, 174, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Cyclonic Storms":
											incidentData[$k]["icon"] = "CyclonicStorms";
											incidentData[$k]["color"] = "rgba(239, 85, 41, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Dense Fog":
											incidentData[$k]["icon"] = "DenseFog";
											incidentData[$k]["color"] = "rgba(246, 157, 10, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Diplomatic Crisis":
											incidentData[$k]["icon"] = "DiplomaticCrisis";
											incidentData[$k]["color"] = "rgba(0, 113, 160, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Earthquake":
											incidentData[$k]["icon"] = "Earthquake";
											incidentData[$k]["color"] = "rgba(239, 85, 41, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Fire on Ship":
											incidentData[$k]["icon"] = "FireOnShip";
											incidentData[$k]["color"] = "rgba(228, 0, 124, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Floods":
											incidentData[$k]["icon"] = "Floods";
											incidentData[$k]["color"] = "rgba(239, 85, 41, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Heavy Rain":
											incidentData[$k]["icon"] = "HeavyRain";
											incidentData[$k]["color"] = "rgba(246, 157, 10, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Heavy Snow":
											incidentData[$k]["icon"] = "HeavySnow";
											incidentData[$k]["color"] = "rgba(246, 157, 10, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Holiday":
											incidentData[$k]["icon"] = "Holiday";
											incidentData[$k]["color"] = "rgba(143, 66, 174, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "IT/Cyber Attack":
											incidentData[$k]["icon"] = "ITCyberAttack";
											incidentData[$k]["color"] = "rgba(143, 66, 174, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Labor Dispute":
											incidentData[$k]["icon"] = "LaborDispute";
											incidentData[$k]["color"] = "rgba(143, 66, 174, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Law Enforcement":
											incidentData[$k]["icon"] = "LawEnforcement";
											incidentData[$k]["color"] = "rgba(0, 113, 160, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Port Infrastructure":
											incidentData[$k]["icon"] = "PortInfrastructure";
											incidentData[$k]["color"] = "rgba(143, 66, 174, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Regulation":
											incidentData[$k]["icon"] = "Regulatory";
											incidentData[$k]["color"] = "rgba(143, 66, 174, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Ship/Airplane Trouble":
											incidentData[$k]["icon"] = "ShipAirplaneFailure";
											incidentData[$k]["color"] = "rgba(228, 0, 124, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Ship Collision":
											incidentData[$k]["icon"] = "ShipCollision";
											incidentData[$k]["color"] = "rgba(228, 0, 124, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Strong Wind":
											incidentData[$k]["icon"] = "StrongWind";
											incidentData[$k]["color"] = "rgba(246, 157, 10, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Terror":
											incidentData[$k]["icon"] = "Terror";
											incidentData[$k]["color"] = "rgba(0, 113, 160, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Volcano":
											incidentData[$k]["icon"] = "Volcano";
											incidentData[$k]["color"] = "rgba(239, 85, 41, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "War":
											incidentData[$k]["icon"] = "War";
											incidentData[$k]["color"] = "rgba(0, 113, 160, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
										case "Etc":
											incidentData[$k]["icon"] = "Etc";
											incidentData[$k]["color"] = "rgba(116, 116, 116, 1)";
											incidentData[$k]["news_on"] = 1;
											break;
											
										}
									//}		
									
									
									
									
									
									
									
									
									
									
									
									
									
									
								}
							});
							
						});
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
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
						
						
						
						
						
						
						
						var setNEWS = function(){
							
							if(vSHOW_NEWS=="N"){
								vNEWS_DATA = new Array();
								return;
							}
							
							
							vNEWS_DATA = new Array();
							
							$.each(vNEWS.Data.Rows,function($key,$value){
								
								var news_no 		= ($value[0]) 									?	$value[0].text 	: 	"";
								var lngtd			= ($value[1] && $.isNumeric($value[1].text))	?	parseFloat($value[1].text)	:	"-";//경도
								var ltitde			= ($value[2] && $.isNumeric($value[2].text))	?	parseFloat($value[2].text)	:	"-";//위도
								var loc_nm			= ($value[3])									?	$value[3].text	:	"";//명칭
								var title			= ($value[4])									?	$value[4].text	:	"";//subject
								var loc_nm2			= ($value[5])									?	$value[5].text	:	"";//발생도시
								var occur_dt		= ($value[6])									?	$value[6].text	:	"";//발생일
								var source			= ($value[7])									?	$value[7].text	:	"";//source
								var valid_dt		= ($value[8])									?	$value[8].text	:	"";//valid_dt
								var cont			= ($value[9])									?	$value[9].text	:	"";//cont body
								var container_cnt	= ($value[10] && $.isNumeric($value[10].text))	?	$value[10].text	:	"";//container_cnt
								var crt_dt_loc_sort	= ($value[11])									?	$value[11].text	:	"";//crt_dt_loc_sort ticker에서 날짜 정렬하기 위한 용도로 다른데 사용하지 않음.
								var excp_nm			= ($value[12])									?	$value[12].text	:	"";//excp_nm
								
								var newsObj = {
										type			:	"news",
										news_no			:	news_no,
										lngtd			:	lngtd,
										ltitde			:	ltitde,
										loc_nm			:	loc_nm,
										title			:	title,
										loc_nm2			:	loc_nm2,
										loc_nm3			:	loc_nm2,
										occur_dt		:	occur_dt,
										source			:	source,
										valid_dt		:	valid_dt,
										cont			:	cont,
										excp_nm			:	excp_nm,
										container_cnt	:	container_cnt
								};
								
								
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
								vNEWS_DATA.push(ticker_incidentObj);
								
								
							});
							
							console.log(vNEWS_DATA);
						};
						
						
						
						var showNEWS = function(){
							
							$("#news_pointPopup").hide();
							
							if(vNEWS_DATA.length==0) return;
							
							$("#news_pointPopup #popup-closer").trigger("click");

							$(this).attr("sel",1);
							
							$("#news_pointPopup").attr("data","");
							
							//draggable에 의한 위치 초기화
							$("#news_pointPopup").attr("style","");
							
							$("#news_pointPopup").addClass("incident");
							
							
							var ticker_step = 0;
							
							var incidentObj = vNEWS_DATA[ticker_step];
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
							
							
							
							$("#news_pointPopup").attr("type","");
							$("#news_pointPopup .ol-popup-title").attr("type","");
							$("#news_pointPopup").attr("idx","-1");
							$("#news_pointPopup .ol-popup-headtitle-content").attr("title","");
							$("#news_pointPopup .ol-popup-headtitle-content").html("");
							$("#news_pointPopup #disp_step").html("");
							$("#news_pointPopup #popup-content").empty();
							
							function btn_next($data){
								console.log($data);
								
								var $type = $("#news_pointPopup").attr("type")!="" ? $("#news_pointPopup").attr("type") : $data["type"];
								var $idx = $("#news_pointPopup").attr("idx");
								
								var $next_idx = parseInt($idx) + 1;
								var $direction = $("#news_pointPopup").attr("prev")==1 ? "prev" : "next"; 
								
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
									
									console.log("direction :: "+$direction+" , "+$("#news_pointPopup").attr("prev"));
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
								
								
								$("#news_pointPopup").attr("type",$type);
								$("#news_pointPopup").attr("idx",$next_idx);
								$("#news_pointPopup").attr("totalcount",$totalcount);
								if($totalcount>1) $("#news_pointPopup #disp_step").html($curr_idx+" of "+$totalcount); else $("#pointPopup #disp_step").html("");
								$("#news_pointPopup .ol-popup-title").attr("type",$type);	
								
								console.log("$type :: "+$type);
								console.log("$idx :: "+$idx);
								console.log("$curr_idx :: "+$curr_idx);
								console.log("$totalcount :: "+$totalcount);
								
								
								if($type=="news"){ //news popup 최초 그리는 부분
									
									$("#news_pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm"]);
									$("#news_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm"]);
									
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
												+"<div class='source'></div>"
											+"</td>"
										+"</tr>"
										+"<tr>"
											+"<td>"
												+"<div class='valid_dt'></div>"
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
									
									
									$("#news_pointPopup #popup-content").html(str);
									
									var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
									var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
									$("#news_pointPopup #popup-content .occur_dt").html("Created on : "+ocdt);
									$("#news_pointPopup #popup-content .location").html($curr_data["loc_nm"]);
									$("#news_pointPopup #popup-content .title").html($curr_data["title"]);
									$("#news_pointPopup #popup-content .source").html("Source: "+$curr_data["source"]);
									$("#news_pointPopup #popup-content .valid_dt").html("Valid until: "+vdt);
									
									
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
									
									$("#news_pointPopup #popup-content .cont").html($contents+$read_more);
									
								}else{
									
									$("#news_pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm4"]);
									$("#news_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm4"]);
									
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
									
									
									$("#news_pointPopup #popup-content").html(str);
									
									var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
									$("#news_pointPopup #popup-content .occur_dt").html(ocdt);
									$("#news_pointPopup #popup-content .location").html($curr_data["loc_nm2"]+" ("+$curr_data["step"]+")");
									$("#news_pointPopup #popup-content .title").html($curr_data["title"]);
									$("#news_pointPopup #popup-content .vessel_nm").html($curr_data["vessel_nm"]);
									$("#news_pointPopup #popup-content .excp_nm4").html($curr_data["excp_nm4"]);
									$("#news_pointPopup #popup-content .reason").html(($curr_data["reason"] ? $curr_data["reason"] : ""));
									$("#news_pointPopup #popup-content .action").html(($curr_data["action"] ? $curr_data["action"] : ""));
									$("#news_pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially affected : "+$curr_data["container_cnt"]+" container(s)" : ""));
										
										
								}								
								
								
								$("#news_pointPopup #btn_next").show();
								$("#news_pointPopup #btn_prev").show();
								if($totalcount>1){
									$("#news_pointPopup #btn_next").off("click").on("click",function(){
										$("#news_pointPopup").attr("prev",0);
										btn_next(obj);
									});
									$("#news_pointPopup #btn_prev").off("click").on("click",function(){
										$("#news_pointPopup").attr("prev",1);
										btn_next(obj);
									});
								}else{
									$("#news_pointPopup #btn_next").hide();
									$("#news_pointPopup #btn_prev").hide();
								}
								
								

								//$("#news_pointPopup").parent().css("left",parseInt($(window).width())/2);
								//$("#news_pointPopup").parent().css("bottom",$(".Document_vTICKER_COLOR").height()-12);
								
								//$("#news_pointPopup").draggable();
								$("#news_pointPopup").height(0);
								$("#news_pointPopup").show();

							}
							
							
							
							
							
							btn_next(obj);
							
							
							
						};
						
						
						
						ROUTE_LINE_ARR = new Array();	
						

							
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
						
/*						
						if($("#rader_div").length==0)
						$(".Document_TITLE_LAYER").append('<div id="rader_div" style="position:absolute;left: 250px;top: 6px;text-align:center;">'
								+'<img style="width:45px;" src="'+QvOSM_exUrl+'icon/radar_white.png"/>'
							+'</div>');					
*/
						
						$(".Document_TOP_LAYER").css("border-right","1px solid #191919");
						$(".Document_TOP_LAYER").css("border-left","1px solid #191919");
						
		
						
						$(".Document_TX294").css("cursor","pointer").off("mouseover").on("mouseover",function(){
							$(".Document_SCORE_INFO1").css("z-index",45).show();
							$(".Document_SCORE_INFO2").css("z-index",40).show();
						});
						
						$(".Document_TX294").off("mouseout").on("mouseout",function(){
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
								
								if(vVIEWTYPE=="N") setRiskScore();
								
								
								//vessel 먼저 화면에서 지운다.
								if(vesselLayer) QvOSM_PVM_MAP.removeLayer(vesselLayer);
								
								if(vVIEWTYPE=="R" && vSHOW_ROUTE=="Y"){
									setRouteLine();
								}
								
								if(vVIEWTYPE=="R" && vSHOW_ROUTE=="N"){
									setTyphoonIcon();
								}

								removeAllLayer();
								
								if(vVIEWTYPE=="R" && vSHOW_ROUTE=="N"){
									showTyphoonIcon();
									showVessel();
									drawINCIDENT();
								}
								
								removeLayer("score");
								if(vVIEWTYPE=="N"){
									showRiskScore();
								}
								
								removeRouteLine();
								if(vVIEWTYPE=="R"){
									showRouteLine();
								}
								
								$("#news_pointPopup").hide();
								if(vVIEWTYPE=="N") showNEWS();
								
								
								
								//익스텐션 중복 추가되는 부분 제거
								$.each($("div#"+$target.Layout.ObjectId.replace("\\","_")),function(){
									if($(this).html()=="") $(this).remove();
								});
								
								/* 데이터가 성공적으로 다 로딩되었어도, qlikview loading modal이 존재하면, fadeout */
								if( $('.ModalDialog') ){
									$(".ModalDialog").fadeOut(500);
									$('.popupMask').fadeOut(500);
								}
								
								
								
								
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