'use strict'
var ExName = "QvOSM_PIM";
var QvOSM_PVM_exUrl = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/"+ExName+"/";

var uId;
var incidentLayer;
var ol;
var qvdoc = Qv.GetCurrentDocument();
var QvOSM_PVM_MAP;
var MapType = {};
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


var vNEWS;
var vEXCEPT;


Qva.LoadCSS(QvOSM_PVM_exUrl+"css/Style.css");
Qva.LoadCSS(QvOSM_PVM_exUrl+"css/ol.css");
Qva.LoadCSS(QvOSM_PVM_exUrl+"css/bootstrap.min.css");

Qva.LoadScript(QvOSM_PVM_exUrl+"js/d3.v3.min.js", function(){
	Qva.LoadScript(QvOSM_PVM_exUrl+"js/ol.js", function(){
		ol=ol;
		
		
		var createIncidentIcon = function(icon, rotation, scale, name,fontstyle,fontcolor) {
			var _font = fontstyle==null ? '10px Calibri,sans-serif' : fontstyle;
			
			var obj = {
				image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
					scale: scale ? scale : 1,
					src: QvOSM_PVM_exUrl+'icon/'+icon+'.png',
					rotation : 0//rotation ? rotation * Math.PI / 180 : 0
				})),
		        text: new ol.style.Text({
		            font: fontstyle,
		            text: name ? name+"" : "",
		            overflow: true,
		            fill: new ol.style.Fill({
		              color: fontcolor ? fontcolor : '#000'
		            })
		        })
			};
			
			
			return new ol.style.Style(obj);
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
						
				style.setZIndex(100000);
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
		
		
		Qva.AddExtension(ExName, function() {
			
			var $target = this;
			var cqv = Qv.GetDocument("");
			
			

			
			
			
			//Qv.GetCurrentDocument().binder.Set("Document.TabRow.Document\\MAIN", "action", "", true);
			
			//onload와 같은 기능 --------------------------------------시작
			var varsRetrieved = false;
			cqv.SetOnUpdateComplete(function(){
			if(!varsRetrieved){
				
				
				var IsChk = false;
				
				//news row data;
				
				if(vNEWS==null) vNEWS = Qv.GetDocument("").GetObject("vNEWS");
				try{
					vNEWS.Data.SetPagesizeY(vNEWS.Data.TotalSize.y);
				}catch(e){
					console.log(e);
				}
				var vNewsObj = vNEWS.Data.Rows;
				console.log(vNewsObj);
				//console.log(JSON.stringify(vNewsObj));
				
				//exception row data;
				if(vEXCEPT==null) vEXCEPT = Qv.GetDocument("").GetObject("vEXCEPT");
				try{
					vEXCEPT.Data.SetPagesizeY(vEXCEPT.Data.TotalSize.y);
					IsChk = true;
				}catch(e){
					console.log(e);
				}
				var vExceptObj = vEXCEPT.Data.Rows;
				console.log(vExceptObj);	
				
				
				cqv.GetAllVariables(function(variables){
				//onload와 같은 기능 --------------------------------------시작
			
				try {
					incidentZoom=1;
					//console.log(docObj.GetVariable(2).text);
			
					
					
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
					
					var incidentData = [];
					
					var firstCenter = [];
					

					//console.log(rows);	
					//설정값 변수
					var zoom = "3";
					var center = [127,38];
					var typhoonFlag = false;
					var aniFlag = false;
					var aniInterval = 10;
					
					var defMap = "layersMb";
					var defMove = "fly";
					
					var offy = 15;
					
	


					var dataCnt = rows.length>0 ? rows[0].length : 0;
					if(dataCnt>= 8){
						console.log(rows.length);
						$(rows).each(function(i){
							//console.log(this);
							
							//넘어오는 데이터
							var lngtd			= (this[0] && $.isNumeric(this[0].text))	?	parseFloat(this[0].text)	:	"-";//경도
							var ltitde			= (this[1] && $.isNumeric(this[1].text))	?	parseFloat(this[1].text)	:	"-";//위도
							var loc_nm			= (this[2])	?	this[2].text						:	"";//명칭
							var incident_type1	= (this[3])	?	this[3].text						:	"";//분류1
							var incident_type2	= (this[4])	?	this[4].text						:	"";//분류2
							var except_cnt		= (this[5] && $.isNumeric(this[5].text))	?	parseInt(this[5].text)				:	0;//exception 갯수
							var news_cnt		= (this[6] && $.isNumeric(this[6].text))	?	parseInt(this[6].text)				:	0;//news 갯수
							var exp_cd			= (this[7])	?	this[7].text						:	"";//exp_cd
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
								color = "#70ad48";
								
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
									incident_type1 : incident_type1,
									incident_type2 : incident_type2,
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
						var lngtd			= ($value[1] && $.isNumeric($value[1].text))	?	$value[1].text	:	"-";//경도
						var ltitde			= ($value[2] && $.isNumeric($value[2].text))	?	$value[2].text	:	"-";//위도
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
						
						if(news_no.length<4) return true;
						if(lngtd=="-") return true;
						if(ltitde=="-") return true;
						
						var newsObj = {
								news_no			:	news_no,
								lngtd			:	parseFloat(lngtd),
								ltitde			:	parseFloat(ltitde),
								loc_nm			:	loc_nm,
								incident_type1	:	incident_type1,
								incident_type2	:	incident_type2,
								title			:	title,
								loc_nm2			:	loc_nm2,
								occur_dt		:	occur_dt,
								source			:	source,
								valid_dt		:	valid_dt,
								cont			:	cont,
								excp_nm			:	excp_nm
						};
						
						//console.log("===newsObj===================");
						//console.log(newsObj);
						//console.log("======================");
						
						//incident에 exception을 위치와 분류기준으로 집어넣기 
						$.each(incidentData,function($k,$v){
							if($v["news_cnt"]>0 && newsObj["lngtd"]==$v["lngtd"] && newsObj["ltitde"]==$v["ltitde"] && incident_type1==$v["incident_type1"] && incident_type2==$v["incident_type2"]){
								//console.log("news :: "+$k+" :: "+newsObj["lngtd"]+"=="+$v["lngtd"]+" :: "+newsObj["ltitde"]+"=="+$v["ltitde"]+" :: "+incident_type1+"=="+$v["incident_type1"]+" :: "+incident_type2+"=="+$v["incident_type2"]);
								incidentData[$k]["news_arr"].push(newsObj);
								//console.log("===newsObj selected===================");
								//console.log(newsObj);
								//console.log("===newsObj===================");
								//return true;
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
						
						if(except_no.length<4) return true;
						if(lngtd=="-") return true;
						if(ltitde=="-") return true;
						
						var exceptObj = {
								except_no		:	except_no,
								lngtd			:	parseFloat(lngtd),
								ltitde			:	parseFloat(ltitde),
								loc_nm			:	loc_nm,
								incident_type1	:	incident_type1,
								incident_type2	:	incident_type2,
								title			:	title,
								loc_nm2			:	loc_nm2,
								occur_dt		:	occur_dt,
								vessel_nm		:	vessel_nm,
								action			:	action,
								reason			:	reason,
								step			:	step,
								excp_nm			:	excp_nm,
								container_cnt	:	parseInt(container_cnt),
								excp_nm4		:	excp_nm4
						};
						
						//console.log("===exceptObj===================");
						//console.log(exceptObj);
						//console.log("======================");
						
						//incident에 exception을 위치와 분류기준으로 집어넣기 
						$.each(incidentData,function($k,$v){
							if($v["except_cnt"]>0 && exceptObj["lngtd"]==$v["lngtd"] && exceptObj["ltitde"]==$v["ltitde"] && incident_type1==$v["incident_type1"] && incident_type2==$v["incident_type2"]){
								//console.log("except :: "+$k+" :: "+exceptObj["lngtd"]+"=="+$v["lngtd"]+" :: "+exceptObj["ltitde"]+"=="+$v["ltitde"]+" :: "+incident_type1+"=="+$v["incident_type1"]+" :: "+incident_type2+"=="+$v["incident_type2"]);
								incidentData[$k]["except_arr"].push(exceptObj);
								//console.log("===exceptObj selected===================");
								//console.log(exceptObj);
								//console.log("======================");
								//return true;
							}
						});
						
					});
				
					
					
					
					QvOSM_PVM_Opt = {
						"zoom":zoom,
						"center":center
					};
								
					if(!$target.framecreated){
						if(mapAniObj != null){
							clearInterval(mapAniObj);
							mapAniObj = null;
						}
						var frmW = $target.GetWidth();
						var frmH = $target.GetHeight();

						incidentLabelC = incidentLabel;
						
						var htmlString = ""; 
						htmlString += '<div id="pointPopup" class="ol-popup" idx="-1"><div class="ol-popup-title"><div class="ol-popup-headtitle-content"></div><div class="ol-popup-title-content" style="float:right;"><span id="btn_next">NEXT</span></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
						'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
						  '</div>';
						htmlString += '<div id="tooltip"></div>';
							
						$target.Element.innerHTML = htmlString;
						
						$target.framecreated = true;	
						
						
						
						
						
						
						
						
						
						
						MapType["layersOSM"] = new ol.layer.Group({
							layers: [
								new ol.layer.Tile({
								  source: new ol.source.XYZ({
									tileSize: [512, 512],
									url: 'https://api.mapbox.com/styles/v1/seungok/ciov2x7gj003qdpnjymn2em34/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
								  })
								})
							]
						});
											
						MapType["layersTn"] = new ol.layer.Group({
							layers: [
								new ol.layer.Tile({
								  source: new ol.source.XYZ({
									tileSize: [512, 512],
									url: 'https://api.mapbox.com/styles/v1/seungok/ciousf1zl003sdqnfpcpfj19r/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
								  })
								})
							]
						});
						
						MapType["layersMb"] = new ol.layer.Group({
							layers: [
								new ol.layer.Tile({
								  source: new ol.source.XYZ({
									tileSize: [512, 512],
									url: 'https://api.mapbox.com/styles/v1/seungok/cip7yoxzy0029dnm5n040qd0q/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
								  })
								})
							]
						});
						MapType["layersMb2"] = new ol.layer.Group({
							layers: [
								new ol.layer.Tile({
								  source: new ol.source.XYZ({
									tileSize: [512, 512],
									url: 'https://api.mapbox.com/styles/v1/seungok/ciouskftw003jcpnn296ackea/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'
								  })
								})
							]
						});
	
	
						var mapCenter = QvOSM_PVM_Opt["center"];
	
						if(mapCenter){
							mapCenter = ol.proj.fromLonLat([parseFloat(mapCenter[0]),parseFloat(mapCenter[1])]);
						}else{
							mapCenter = ol.proj.fromLonLat([127,38]);
						}
						
						if(firstCenter.length > 0 && aniFlag == true){
							mapCenter = ol.proj.fromLonLat(firstCenter);
						}
						
						QvOSM_PVM_MAP = new ol.Map({
							layers: [
								//MapType["layersTn"]
								MapType[defMap]
							],
							controls: ol.control.defaults().extend([
								//new ol.control.FullScreen(),
								//new ol.control.OverviewMap(),
								//new ol.control.ScaleLine(),
								new ol.control.Zoom()
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
							
							
							var info = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
								select.getFeatures().push(feature);
								
								if(feature.get("type")){
									//console.log(feature);
									//$(".ol-popup-headtitle-content").html("<img style='width:20px;' src='"+QvOSM_PVM_exUrl+"icon/ship.png"+"'/>");
									
									$("#pointPopup").addClass("incident");
									
								}else{
									$("#pointPopup").removeClass("incident");
								}
								
								return feature;
								
							});
							
							
							if(info!=null && (info.get("news_arr").length>0 || info.get("except_arr").length>0)){

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
								$("#pointPopup #popup-content").empty();
								
								function btn_next($data){
									console.log($data);
									
									
									var $type = $("#pointPopup").attr("type")!="" ? $("#pointPopup").attr("type") : $data["type"];
									var $idx = $("#pointPopup").attr("idx");
									var $next_idx = parseInt($idx) + 1;
									
									var $count = 0;
									var $totalcount = $data["news_arr"].length + $data["except_arr"].length;
									

									
									

									
									
									//초기 팝업 출력일 경우
									if($type != "except" && $idx==-1){
										
										if($count>0){
											$type = "news";
										}
									
										$idx = 0;
										$next_idx = 0;
									}
									
									if($type == "except" && $idx==-1){
										$idx = 0;
										$next_idx = 0;
									}
									
									
									
									
									
									
									var $curr_data;
									if($type=="news"){
										$curr_data = $data["news_arr"][$next_idx];
										$count = $data["news_arr"].length;
									}else{
										$curr_data = $data["except_arr"][$next_idx];
										$count = $data["except_arr"].length;
									}
									
									
									$("#pointPopup").attr("type",$type);
									$("#pointPopup").attr("idx",$next_idx);
									$("#pointPopup .ol-popup-title").attr("type",$type);	
									
									console.log("$type :: "+$type);
									console.log("$idx :: "+$idx);
									console.log("$next_idx :: "+$next_idx);
									console.log("$totalcount :: "+$totalcount);
									
									
									if($type=="news"){ //news popup 최초 그리는 부분
										
										$("#pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm"]);
										$("#pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm"]);
										
										var str = "<table style='width:580px;'>"
											+"<tr>"
												+"<td>"
													+"<div class='occur_dt' style='float:left;'></div>"
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
										
										
										$("#pointPopup #popup-content").html(str);
										
										var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
										var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
										$("#pointPopup #popup-content .occur_dt").html("Created on : "+ocdt);
										$("#pointPopup #popup-content .location").html($curr_data["loc_nm"]);
										$("#pointPopup #popup-content .title").html($curr_data["title"]);
										$("#pointPopup #popup-content .source").html("Source: "+$curr_data["source"]);
										$("#pointPopup #popup-content .valid_dt").html("Valid until: "+vdt);
										
										
										var $contents_arr = $curr_data["cont"].split("[read more](");
										var $contents = $contents_arr[0];
										var $read_more = "";
										try{
											if($contents_arr[1]!=null){
												var $url = $contents_arr[1].substr(0,$contents_arr[1].length-2);
												$read_more = "<a href='"+$url+"' target=_blank>[read more]</a>";
											}
										}catch(e){
											
										}
										
										$("#pointPopup #popup-content .cont").html($contents+$read_more);
										
									}else{
										
										$("#pointPopup .ol-popup-headtitle-content").attr("title",$curr_data["excp_nm4"]);
										$("#pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm4"]);
										
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
										
										
										$("#pointPopup #popup-content").html(str);
										
										var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
										$("#pointPopup #popup-content .occur_dt").html(ocdt);
										$("#pointPopup #popup-content .location").html($curr_data["loc_nm2"]+" ("+$curr_data["step"]+")");
										$("#pointPopup #popup-content .title").html($curr_data["title"]);
										$("#pointPopup #popup-content .vessel_nm").html($curr_data["vessel_nm"]);
										$("#pointPopup #popup-content .excp_nm4").html($curr_data["excp_nm4"]);
										$("#pointPopup #popup-content .reason").html(($curr_data["reason"] ? $curr_data["reason"] : ""));
										$("#pointPopup #popup-content .action").html(($curr_data["action"] ? $curr_data["action"] : ""));
										$("#pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? $curr_data["container_cnt"]+" Containers" : ""));
											
											
									}								
									
									//마지막 기사이면
									console.log("last :: "+$count+" , "+($next_idx+1)+" , "+$data["except_arr"].length);
									if($count == $next_idx+1){
										if($type=="news"){
											if($data["except_arr"].length>0){
												$("#pointPopup").attr("type","except");
											}
										}else{
											if($data["news_arr"].length>0){
												$("#pointPopup").attr("type","news");
											}										
										}
										$("#pointPopup").attr("idx",-1);
									}
									
									console.log("next type :: "+$("#pointPopup").attr("type"));
									
									$("#pointPopup #btn_next").show();
									if($totalcount>1){
										$("#pointPopup #btn_next").off("click").on("click",function(){
											btn_next(obj);
										});
									}else{
										$("#pointPopup #btn_next").hide();
									}
									
									
									pointPopup.setPosition(coordinate);
									
									$("#pointPopup").draggable();
									$("#pointPopup").height("");
									$("#pointPopup").show();
									$("#Document_CH03").off("click").on("click",function(){
										$("#pointPopup").hide();
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
							  var feature = QvOSM_PVM_MAP.forEachFeatureAtPixel(evt.pixel, function(feature) {
								    overlay.setPosition(evt.coordinate);
								    overlay.getElement().innerHTML = feature.get("tooltip");
								    if(feature.get("type")){
								    	$("#tooltip").attr("type",feature.get("type"));
								    }
								    return feature;
								  });
							  	
								  overlay.getElement().style.display = feature ? 'inline-block' : 'none';
								  document.body.style.cursor = feature ? 'pointer' : '';
						});
						
						

				}
					
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
							var fontstyle = 'bold 12px Calibri,sans-serif';
							var fontcolor = incidentObj["color"];
							
							if(incidentObj["total_cnt"]>1){
								vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 1, incidentObj["total_cnt"],fontstyle,fontcolor));
							}else{
								vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 0.6));
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
						incidentLayer.setZIndex(9999);
						QvOSM_PVM_MAP.addLayer(incidentLayer);
	
					}
					
					
					
					
					
					$("#rader_div").remove();
					$(".Document_TITLE_LAYER").append('<div id="rader_div" style="position:absolute;left:  300px;top: 8px;text-align:center;">'
							+'<img style="width:45px;" src="'+QvOSM_PVM_exUrl+'icon/radar_white.png"/>'
						+'</div>');					

					

					
					$(".Document_TOP_LAYER").css("border-right","1px solid #191919");
					$(".Document_TOP_LAYER").css("border-left","1px solid #191919");
					
	
					

					if(IsChk==false){
						setTimeout(function(){
							var mydoc = Qv.GetCurrentDocument();
							mydoc.Clear();
						},1000);
					}
					
					
					
				}catch(e){
					console.log(e.message);
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
