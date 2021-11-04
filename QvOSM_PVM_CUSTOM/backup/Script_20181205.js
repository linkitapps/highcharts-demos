'use strict'
var ExName = "QvOSM_PVM_CUSTOM";
var QvOSM_PVM_CUSTOM_exUrl = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/"+ExName+"/";

var uId;
var weatherLayer;
var vesselLayer;
var portLayer;
var tyPolyLayer;
var ol;
var points_map_layer;
var pointDesc_map_layer;
var layerFeatures;
var doc2 = Qv.GetCurrentDocument();

var IB02 = doc2.GetObject("EXT_VAR");
//var IB02 = doc2.GetObject("IB01");
var port_YN="N";
var QvOSM_PVM_CUSTOM_MAP;
var MapType = {};
var moveArea = [];
var aniFea = [];
var weatherIcons = [];
var QvOSM_PVM_CUSTOM_Opt = {};
var mapDataType;
var mapAniObj = null;
var mb_chk= false;


var showRoute;
var routeObj={};
var vesselrouteObj={};
var typoonObj={};
var portObj={};
var broken_aniarr=[];
var tyDateLabel = false;
var vesselLabel = false;
var tyDateLabelC = tyDateLabel;
var vesselLabelC = vesselLabel;
var portLabelC = true;
var oldZoom = 3;
var vesselZoom=1;
var routeZoom=false;
var routeOverlay=[];
var vesselrouteOverlay=[];
var vesselLabelOverlay=[];
var vesselFeaturelist=[];
var saveFeature;
/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}


Qva.LoadCSS(QvOSM_PVM_CUSTOM_exUrl+"css/Style.css");
Qva.LoadCSS(QvOSM_PVM_CUSTOM_exUrl+"css/ol.css");
Qva.LoadCSS(QvOSM_PVM_CUSTOM_exUrl+"css/bootstrap.min.css");

Qva.LoadScript(QvOSM_PVM_CUSTOM_exUrl+"Options.js", function(){
Qva.LoadScript(QvOSM_PVM_CUSTOM_exUrl+"js/d3.v3.min.js", function(){
	Qva.LoadScript(QvOSM_PVM_CUSTOM_exUrl+"js/ol.js", function(){
		ol=ol;

		var drawWtLayer;
		var routeLayer;
		var vesselrouteLayer;
		var portInfo = {};


		var unique =  function(array) {
			var result = [];
			$.each(array, function(index, element) {
				if ($.inArray(element, result) == -1) {
					result.push(element);
				}
			});
			return result;
		}

		var createIconStyle = function(icon, rotation, scale, name, offx, offy) {



			var obj = {
				image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
					scale: scale ? scale : 1,
					src: QvOSM_PVM_CUSTOM_exUrl+'icon/'+icon+'.png',
					rotation : 0//rotation ? rotation * Math.PI / 180 : 0
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


		var createvesselIcon = function(style,icon, rotation, scale, name, offx, offy) {
			var imageicon;
			var opacity;
			if(style=="normal"){
				var isEX = icon.split("_")[1];
				switch(isEX) {
					case "BROKEN":
						imageicon = "Vessel_BROKEN_S";
						break;
					case "NOTMOVING":
						imageicon = "Vessel_NOTMOVING_S";
						break;
					case "MOVING":
						imageicon = "Vessel_MOVING_S";
						break;
					default:
						imageicon = "Vessel_MOVING_S";
						break;
				}
				scale=0.6;
				opacity=0.7;
			}else{
				imageicon=icon;
				opacity=1;
			}



			var obj = {
				image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
					scale: scale ? scale : 1,
					src: QvOSM_PVM_CUSTOM_exUrl+'icon/'+imageicon+'.png',
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

		function makeVesselLabel(feature){


				var popupOpt = {};
				var viewtxt=feature.get("tyKey");
				var point = feature.get('point1');


				//console.log(feature);
				if(point){
					if(point[0]<-160){
						point[0]=point[0]+360;
					}
					point=ol.proj.fromLonLat(point);

					var el = document.createElement("div");

					el.className = (mb_chk)? "vessel_name_box mobile":"vessel_name_box";
					el.style.color = "#000";
					el.innerHTML = viewtxt;
					el.setAttribute("target", feature.get('tyKey'));
					popupOpt = {
						element: el,
						//offset: [30, 0],
						offset: (mb_chk)?[-60, 60] :[-60, 30],
						position: point,
						positioning : "center-left",
						autoPan: false
					}



				}
				var overlay= new ol.Overlay(popupOpt)
				//console,log(overlay);
				vesselLabelOverlay.push(overlay);
				return overlay;
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

				style.setZIndex(100000);
				vectorContext.setStyle(style);
				vectorContext.drawGeometry(flashGeom);
				if (elapsed > duration) {
					ol.Observable.unByKey(listenerKey);

				}
				 // tell OpenLayers to continue postcompose animation

				QvOSM_PVM_CUSTOM_MAP.render();

			}
			listenerKey = QvOSM_PVM_CUSTOM_MAP.on('postcompose', animate);
			broken_aniarr[number]=setTimeout(function(){flash(feature,number)},10000);
		}
		var Func = {
			moveArea : function(item, select, pointPopup, pointPopupContent){
				var doc = Qv.GetCurrentDocument();
				var loc = item.get('point');
				var cd = item.get('key');
				//var loc = item["p"];
				//var cd = item["k"];
				//var type = item["t"];
				var	area = loc;
				var view = QvOSM_PVM_CUSTOM_MAP.getView();
				var duration = 2000;
				var start = +new Date();



				/*
				var zoom = ol.animation.zoom({
					duration: duration,
					resolution: 2 * view.getResolution(),
					start: start
				});
				*/

				//view.setCenter(area);

				setTimeout(function(){
					select.getFeatures().clear();
					select.getFeatures().push(item);
					console.log(item);
					var info = {popup:item.get("popup"),	tyKey:item.get("tyKey")};


					if(info.popup){
						pointPopupContent.innerHTML = '<div class="popup_content">'+info.popup+'</div>';
						pointPopup.setPosition(area);
					} else {
						$("#popup-closer").trigger("click");
					}

					if(info.tyKey){
						//var doc = Qv.GetCurrentDocument();
						doc.SetVariable("vKEY_TYPHOON",info.tyKey);
						//evt.preventDefault();
					}


				}, duration);

				//var doc = Qv.GetCurrentDocument();
				doc.SetVariable("vMap_CD","S");
				doc.SetVariable("vMapCode",cd);

			},
			setMapType : function(newType) {
				if(newType == 'OSM') {
					QvOSM_PVM_CUSTOM_MAP.setLayerGroup(MapType["layersOSM"]);
				} else if (newType == 'TN') {
					QvOSM_PVM_CUSTOM_MAP.setLayerGroup(MapType["layersTn"]);
				} else if (newType == 'MB') {
					QvOSM_PVM_CUSTOM_MAP.setLayerGroup(MapType["layersMb"]);
				} else if (newType == 'MB2') {
					QvOSM_PVM_CUSTOM_MAP.setLayerGroup(MapType["layersMb2"]);
				}
				Func.refresh();
				drawWtLayer();
			},
			refresh:function(){
				var doc = Qv.GetCurrentDocument();
				doc.SetVariable("vMapRefresh","1");
			}
		}
		// port 시간 표시
		function makerouteLabel(name,coord,type){

				//console.log(name);
				//console.log(coord);
				var popupOpt = {};
				var viewtxt= name;
				//var point;



				if(type==1){
					viewtxt=viewtxt.replace( /\(/gi,"(<span class='alert-red'>");
					viewtxt=viewtxt.replace( /\)/gi, "</span>)");
				}

				if(coord){
					//point = ol.proj.fromLonLat(coord);

					var el = document.createElement("div");
					el.className = (mb_chk)? "route_time_box mobile":"route_time_box";
					el.style.color = "#a6cef4";
					el.innerHTML = viewtxt;

					popupOpt = {
						element: el,
						//offset: [30, 0],
						offset: [40, -10],
						position: coord,
						positioning : "center-left",
						autoPan: false
					}

					//var pixcelPoint = map.getPixelFromCoordinate(point);
					//popupPosition.push(pixcelPoint);

				}
				//console,log(popupOpt);
				var overlay= new ol.Overlay(popupOpt)
				routeOverlay.push(overlay);
				return overlay;
		}

		function makevesselrouteLabel(name,coord){

				//console.log(name);
				//console.log(coord);
				var popupOpt = {};
				var viewtxt= name;
				//var point;




				if(coord){
					//point = ol.proj.fromLonLat(coord);

					var el = document.createElement("div");
					el.className = (mb_chk)? "vesselroute_name_box mobile":"vesselroute_name_box";
					el.style.color = "#a6cef4";
					el.innerHTML = viewtxt;

					popupOpt = {
						element: el,
						//offset: [30, 0],
						offset: [-20, -20],
						position: coord,
						positioning : "center-left",
						autoPan: false
					}

					//var pixcelPoint = map.getPixelFromCoordinate(point);
					//popupPosition.push(pixcelPoint);

				}
				//console,log(popupOpt);
				var overlay= new ol.Overlay(popupOpt)
				vesselrouteOverlay.push(overlay);
				return overlay;
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

		function getroutepathCoord(datarow){
			var route_arr=[];
			var data =JSON.parse(datarow);

			for(var i=0;i<data.length;i++){

				route_arr.push(data[i]);
			}

			return route_arr;
		}

		function getroutepathCoordstyle(datarow,indata){
			var route_arr=[];
			var data =datarow;

			for(var i=0;i<data;i++){

				route_arr.push(indata);

			}


			return route_arr;
		}

		function getroutepathCoord2( datarow, portNum ){
			var route_arr=[];
      var flag = false; // 화살표 선분이 모두 양수 or 음수 인지 확인 flag

      /* portNum는 port 좌표 수 */
      /* 2018.04.30 추후, 개선되어야 하는 소스  */
      for( var i=0;i<datarow.length-( portNum+1 );i++ ){
        /* datarow에서 port 수 만큼 빼고 좌표 확인 */
        if( datarow[i][0] * datarow[i+1][0] < 0 ){
          flag = true;
          break;
        }
      }//for end


			for(var i=0;i<datarow.length-1;i++){
        if( flag ){ // 화살표 선분이 모두 + or - 이면, 아래와 같은 계산식은 필요 없음
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
  				} // else end
        } // flag if end

				if(i==(datarow.length-2)){
					route_arr.push(ol.proj.fromLonLat(datarow[i]));
					route_arr.push(ol.proj.fromLonLat(datarow[(i+1)]));
				}else{
					route_arr.push(ol.proj.fromLonLat(datarow[i]));
				}
			}
			return route_arr;
		}

		function getCircleCenter(point1, point2, radius){
			//반지름이 0보다 작으면 리턴
			if(radius < 0){
				console.log("Negative radius.");
				return false;
			}
			//반지름이 0일경우 두점이 같은 위치 일떄 센터는 두 점, 아니면 리턴
			if(radius === 0){
				if(point1[0] === point2[0] && point1[1] === point2[1]){
					return point1;
				} else {
					console.log("No circles.")
					return false;
				}
			}
			//두점이 같은 위치면 안됨
			if(point1[0] === point2[0] && point1[1] === point2[1]){
				console.log("Infinite number of circles.");
				return false
			}

			var sqDistance = Math.pow(point1[0]- point2[0],2) + Math.pow(point1[1]- point2[1], 2);
			var sqDiameter = 4 * radius * radius;
			if (sqDistance > sqDiameter){
				console.log("Points are too far apart.");
				return false;
			}

			var midPoint = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
			if (sqDistance == sqDiameter) {return midPoint;}

			var d = Math.sqrt(radius * radius - sqDistance / 4);
			var distance = Math.sqrt(sqDistance);

			var ox = d * (point2[0] - point1[0]) / distance;
			var oy = d * (point2[1] - point1[1]) / distance;
			return [[midPoint[0] - oy, midPoint[1] + ox],[midPoint[0] + oy, midPoint[1] - ox]];

		}
		function getDistance(pt, pt2){
			var x2 = Math.pow((pt[0]-pt2[0]),2);
			var y2 = Math.pow((pt[1]-pt2[1]),2);
			return Math.sqrt((x2+y2));
		}
		//Arc 좌표 만들기
		function getArcCoordinates(center, sPoint, ePoint, radius){

			//center = ol.proj.fromLonLat(center);
			//sPoint = ol.proj.fromLonLat(sPoint);
			//ePoint = ol.proj.fromLonLat(ePoint);

			var xCent = center[0];
			var yCent = center[1];

			var list = [];
			var step = 0.003;
			var pi2 = 2*Math.PI;

			//시작 값 구하기
			var theta = Math.atan2(sPoint[1] - yCent, sPoint[0] - xCent);
			theta = (theta  < 0) ? 2*Math.PI + theta : theta;

			var endTheta =  Math.atan2(ePoint[1] - yCent, ePoint[0] - xCent);
			endTheta = (endTheta  < 0) ? 2*Math.PI + endTheta : endTheta;

			//시작, 끝 만들기...
			var end = Math.abs(theta - endTheta);
			var end2 = pi2 - end;
			end = end > end2 ? end2 : end;

			//list.push(ol.proj.fromLonLat(sPoint));
			//list.push(sPoint);
			for(var i = 0; i < end; i+=step,theta-=step){
				if(theta < 0){theta = pi2}

				var x = xCent + (radius * Math.cos(theta));
				var y = yCent + (radius * Math.sin(theta));

				//if(x<=180 && x >= -180 && y<=90 && y >= -90){
					//list.push(ol.proj.fromLonLat([x, y]));
					list.push([x, y]);
				//}
			}
			//console.log(list);

			//태평양 건너는 경우
			list.forEach(function(t,i){
				//if(t[0] > 180){
					//list[i][0] = t[0]-360;
				//}
				list[i] = ol.proj.fromLonLat(list[i]);
			});


			//list.push(ol.proj.fromLonLat(ePoint));
			return list;
			//return {"list":list, "center": ol.proj.fromLonLat([center[0], center[1]])};
		}

		Qva.AddExtension(ExName, function() {

			try {


				vesselZoom=1;
				routeZoom=false;
				//console.log(routeZoom);
				// console.log(IB02);
				//console.log(IB02.GetVariable(2).text);

				var portNames = [];

				if(IB02.GetVariable(4).text){
					//console.log(IB02.GetVariable(4).text);
					try{

						routeObj = JSON.parse(IB02.GetVariable(4).text);

					} catch(e) {
						console.log("json parse erorr", e);
						routeObj = {};
					}
					//console.log(routeObj);

					for(i=0; i<routeObj.length; i++){
						//좌표 숫자 배열로 변환
						routeObj[i].XY = routeObj[i].XY.split(",");
						routeObj[i].XY[0] = parseFloat(routeObj[i].XY[0]);
						routeObj[i].XY[1] = parseFloat(routeObj[i].XY[1]);
						portNames.push(routeObj[i].PORT_NAME.toLowerCase());
					}



				}
				//console.log(IB02.GetVariable(4).text);
				// console.log(IB02.GetVariable(9).text);
				if((IB02.GetVariable(9).text!="[]"&&IB02.GetVariable(9).text!="-"&&IB02.GetVariable(9).text!="[\"\"]")&&IB02.GetVariable(2).text=="N"){

					var routeObject
					try{

						routeObject = JSON.parse(IB02.GetVariable(9).text);

					} catch(e) {
						console.log("json parse erorr", e);
						vesselrouteObj = {};
					}


					vesselrouteObj=routeObject;
					if(vesselrouteObj[0].FROM_LNGTD){

					}else{

						for(i=0; i<vesselrouteObj.length-1; i++){
							//좌표 숫자 배열로 변환


							vesselrouteObj[i].XY = vesselrouteObj[i].XY.split(",");
							vesselrouteObj[i].XY[0] = parseFloat(vesselrouteObj[i].XY[0]);
							vesselrouteObj[i].XY[1] = parseFloat(vesselrouteObj[i].XY[1]);

						}
						//console.log(vesselrouteObj);
					}

				}

				if(IB02.GetVariable(6).text){
					showRoute=IB02.GetVariable(6).text;

				}
				var $element = $(this.Element);

				uId = this.Layout.ObjectId.replace("\\", "_");
				if(!window[uId])window[uId] = {};
				window[uId]["id"] = uId;

				var rows = this.Data.Rows;

				moveArea = [];

				if(mapAniObj === null)aniFea = [];

				var vesselData = [];
				var portData = [];
				var typhoonData = {
					tyPos : [],
					tyLine : {},
					tyRadi : []
				};

				//태풍데이터 가공
				if(IB02.GetVariable(1).text){
					//console.log(IB02.GetVariable(1).text);
					try{

						typoonObj = JSON.parse(IB02.GetVariable(1).text);

					} catch(e) {
						console.log("json parse erorr", e);
						typoonObj = {};
					}
					//console.log(typoonObj);

					if(typoonObj.length>0){
						for(var ti=0;ti<typoonObj.length;ti++){
							typoonObj[ti]
							var radius=JSON.parse(typoonObj[ti].RADIUS)

							var tyPos = {
								typhoonKey : typoonObj[ti].KEY_TYPHOON,
								point : [parseFloat(typoonObj[ti].LNGTD),parseFloat(typoonObj[ti].LTITDE)],
								icon : typoonObj[ti].TYPN_ICON,
								popup : typoonObj[ti].DESC,
								aniYN : typoonObj[ti].PLAY_YN,
								tyDate : typoonObj[ti].LOCAL_DT_TTHH
							};
							var tyLine = {
								icon : typoonObj[ti].TYPN_ICON,
								seq : parseInt(typoonObj[ti].ROUT_SEQ),
								point : [parseFloat(typoonObj[ti].LNGTD),parseFloat(typoonObj[ti].LTITDE)]
							};
							var ty34 = {
								point : [parseFloat(typoonObj[ti].LNGTD),parseFloat(typoonObj[ti].LTITDE)],
								radius : 34,
								radiusNE : parseInt(radius[0]),
								radiusSE : parseInt(radius[1]),
								radiusSW : parseInt(radius[2]),
								radiusNW : parseInt(radius[3])
							};

							var ty50 = {
								point : [parseFloat(typoonObj[ti].LNGTD),parseFloat(typoonObj[ti].LTITDE)],
								radius : 50,
								radiusNE : parseInt(radius[4]),
								radiusSE : parseInt(radius[5]),
								radiusSW : parseInt(radius[6]),
								radiusNW : parseInt(radius[7])
							};

							if(!typhoonData.tyLine[typoonObj[ti].KEY_TYPHOON]) {typhoonData.tyLine[typoonObj[ti].KEY_TYPHOON] = [];}
								typhoonData.tyPos.push(tyPos);
								typhoonData.tyLine[typoonObj[ti].KEY_TYPHOON].push(tyLine);
								typhoonData.tyRadi.push(ty34);
								typhoonData.tyRadi.push(ty50);

							if(typoonObj[ti].PLAY_YN === "Y"){
								moveArea.push({"k":typhoonKey, "t":type, "p":[parseFloat(typoonObj[ti].LNGTD),parseFloat(typoonObj[ti].LTITDE)]});
							}
						}
					}
				}
				//port 데이터 가공
				if(IB02.GetVariable(0).text){

					try{

						portObj = JSON.parse(IB02.GetVariable(0).text);

					} catch(e) {
						console.log("json parse erorr", e);
						portObj = {};
					}
					//console.log(portObj);

					if(portObj.length>0){
						for(var pi=0;pi<portObj.length;pi++){

							var portarr = {
								typhoonKey : portObj[pi].KEY_TYPHOON,
								name : portObj[pi].KEY_TYPHOON,
								point : [parseFloat(portObj[pi].LNGTD),parseFloat(portObj[pi].LTITDE)],
								direction : portObj[pi].DIRECTION,
								inout : portObj[pi].INOUT_IMG_NO,
								popup : portObj[pi].DESC,
								aniYN : portObj[pi].PLAY_YN
							};
							//console.log(portarr);
							portData.push(portarr);
							if(portObj[pi].PLAY_YN === "Y"){
								moveArea.push({"k":typhoonKey, "t":type, "p":[parseFloat(portObj[pi].LNGTD),parseFloat(portObj[pi].LTITDE)]});
							}
						}

					}



				}








				var firstCenter = [];
				// console.log(rows.length);

				/*if(rows.length < 1){
					this.Element.innerHTML = "No Data";
					return false;
				}*/
				//console.log(rows);
				//설정값 변수
				var zoom = "3";
				var center = [127,38];
				var weatherFlag = false;
				var vesselFlag = false;
				var typhoonFlag = false;
				var aniFlag = false;
				var aniInterval = 10;

				var defMap = "layersTn";
				var defMove = "fly";

				var offy = 15;

				var weatherLayerDs = "none";


				if(this.Layout.Text0 != null){
					if(this.Layout.Text0.text != ""){
						zoom = this.Layout.Text0.text;
					}
				}

				if(this.Layout.Text1 != null){
					if(this.Layout.Text1.text != ""){
						center = this.Layout.Text1.text.split(",");
					}
				}


				if(this.Layout.Text2 != null){
					if(this.Layout.Text2.text == "1"){
						weatherFlag = true;
						weatherLayerDs = "";
					}
				}

				if(this.Layout.Text3 != null){
					if(this.Layout.Text3.text == "1"){
						vesselFlag = true;
					}
				}

				if(this.Layout.Text4 != null){
					if(this.Layout.Text4.text == "1"){
						typhoonFlag = true;
					}
				}
				if(this.Layout.Text5 != null){
					if(this.Layout.Text5.text != "1"){
						aniFlag = true;
					}
				}


				if(this.Layout.Text6 != null){
					if(this.Layout.Text6.text != ""){
						QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["50knot"]["color"] = this.Layout.Text6.text;
					}
				}

				if(this.Layout.Text7 != null){
					if(this.Layout.Text7.text != ""){
						QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["34knot"]["color"] = this.Layout.Text7.text;
					}
				}
				if(this.Layout.Text8 != null){
					if(this.Layout.Text8.text != ""){
						QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["line"]["color"] = this.Layout.Text8.text;
					}
				}
				if(this.Layout.Text9 != null){
					if(this.Layout.Text9.text != ""){
						QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["line"]["width"] = this.Layout.Text9.text;
					}
				}

				if(this.Layout.Text10 != null){
					if(this.Layout.Text10.text == "1"){
						tyDateLabel = true;
					}
				}
				if(this.Layout.Text11 != null){
					if(this.Layout.Text11.text == "1"){
						vesselLabel = true;
					}
				}
				if(this.Layout.Text12 != null){
					if(this.Layout.Text12.text != ""){
						defMove = this.Layout.Text12.text.toLowerCase();
						//console.log(defMove);
					}
				}
				if(this.Layout.Text13 != null){
					if(this.Layout.Text13.text != ""){
						switch(this.Layout.Text13.text.toLowerCase()) {
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
								defMap = "layersTn";
						}
						//console.log(defMap);
					}
				}


				if( rows.length < 1 ){
                    console.log( 'No data to draw.' );
                }else{
					var dataCnt = rows[0].length;
					//console.log(rows);
					if(dataCnt ===9){
						$(rows).each(function(i){
							//넘어오는 데이터
							var typhoonKey = (this[0])?this[0].text:"-";
							var name = (this[1])?this[1].text:"-";
							var lat = (this[2])?this[2].text:"0";
							var lon = (this[3])?this[3].text:"0";
							var vDirect = (this[4])?this[4].text:"0";
							var inout = (this[5])?this[5].text:"-";
							var type = (this[6])?this[6].text:"-";
							var aniYN = (this[7])?this[7].text:"N";
							var popup = (this[8])?this[8].text:"-";

							if(type === "VESSEL"||type==="FLT"){

								var vesselObj = {
									typhoonKey : typhoonKey,
									name : name,
									point : [parseFloat(lon),parseFloat(lat)],
									direction : vDirect,
									inout : inout,
									popup : popup,
									type  : type,
									aniYN : aniYN
								};

								vesselData.push(vesselObj);
							}

							if(aniYN === "Y"){
								moveArea.push({"k":typhoonKey, "t":type, "p":[parseFloat(lon),parseFloat(lat)]});
							}else if(aniYN=="Mobile"){
								mb_chk=true;
							}


						});
					} else {
						this.Element.innerHTML = "Input Dimension, Expression";
						return false;
					}
					
				}
				

				QvOSM_PVM_CUSTOM_Opt = {
					"weather":weatherFlag,
					"vessel":vesselFlag,
					"typhoon":typhoonFlag,
					"zoom":zoom,
					"center":center,
					"ani":aniFlag,
					"port":vesselFlag
				};

				if(!this.framecreated){
					if(mapAniObj != null){
						clearInterval(mapAniObj);
						mapAniObj = null;
					}
					var frmW = this.GetWidth();
					var frmH = this.GetHeight();

					tyDateLabelC = tyDateLabel;
					vesselLabelC = vesselLabel;

					var htmlString = ""; /*'<div style="position:relative;float:left;width:100%;">'+
												'<div id="markers"></div>'+
												'<div class="zoomLevel region">- Region</div>'+
												'<div class="zoomLevel subs">- Subsidiary</div>'+
												'<div class="zoomLevel port">- Port</div>'+
												'<div id="mapLayerBtn1" class="mapLayerBtn1">></div>';*/

					/*htmlString += '<div id="wtLayerBtn1" class="wtLayerBtn1" style="display:'+weatherLayerDs+';"><</div>';

					htmlString += '<div id="mapLayer1" class="mapLayer1" style="float:left;left:58px;top:5px;width:180px;display:none">'+
											  '<div class="form-group">'+
												'<div class="col-sm-10">'+
													'<label class="control-label" style="color:#fff">Map Type</label>'+
												'</div>'+
												'<div class="col-sm-10">'+
													//'<button ty="MB2" class="btn btn-default">Dark Blue</button>'+
													'<img ty="MB2" src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/btn_basic.png"/>'+
												'</div>'+
												'<div class="col-sm-10">'+
													//'<button ty="OSM" class="btn btn-default">Basic</button>'+
													'<img ty="OSM" src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/btn_lightblue.png"/>'+
												'</div>'+
												'<div class="col-sm-10">'+
													//'<button ty="MB" class="btn btn-default">Light Blue</button>'+
													'<img ty="MB" src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/btn_dark.png"/>'+
												'</div>'+
												'<div class="col-sm-10">'+
													//'<button ty="TN" class="btn btn-default">Dark</button>'+
													'<img ty="TN" src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/btn_satellite.png"/>'+
												'</div>'+
												'<div class="col-sm-10" style="color:#fff;white-space : nowrap;">'+
													'<input type="checkbox" id="tyDateLabel1" '+(tyDateLabel?'checked="checked"':'')+' style="display:inline-block"/> <span style="white-space : nowrap;">Typhoon Date</span>'+
												'</div>'+
												'<div class="col-sm-10" style="color:#fff">'+
													'<input type="checkbox" id="vesselLabel1" '+(vesselLabel?'checked="checked"':'')+' style="display:inline-block"/> Vessel Name'+
												'</div>'+
												'<div class="col-sm-10" style="color:#fff">'+
													'<input type="checkbox" id="portLabel1" checked="checked" style="display:inline-block"/> Port View'+
												'</div>'+
											  '</div>';

					htmlString += '</div>';
					//if(weatherFlag){
						htmlString += '<div id="weatherLayer1" class="mapLayer1 weatherArea" style="display:none;float:right;right:30px;top:20px;width:130px;color:#ffffff">'+
										  '<div class="form-group">'+
											'<div class="col-sm-10">'+
											  '<div class="checkbox">'+
												'<label>'+
												  '<input type="checkbox" class="w0" checked=checked> Weather'+
												'</label>'+
											  '</div>'+
											'</div>'+

											'<div class="col-sm-10">'+
											  '<div class="checkbox">'+
												'<label>'+
												  '<input type="checkbox" class="w1" checked=checked> Sunny'+
												'</label>'+
											  '</div>'+
											'</div>'+

											'<div class="col-sm-10">'+
											  '<div class="checkbox">'+
												'<label>'+
												  '<input type="checkbox" class="w2" checked=checked> Cloudy'+
												'</label>'+
											  '</div>'+
											'</div>'+

										  '</div>'+
									'</div>';
					//};
					*//*<img src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/btn_transit.png" width="89" height="27"/>*/
					if(mb_chk){
						htmlString += '<div id="pointPopup" class="ol-popup mobile"><div class="ol-popup-title"><img class="port-img" src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/marker_port.png"><span class="ol-popup-title-content"></span></div><a href="#" id="popup-closer" class="ol-popup-closer"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
									'<div id="'+uId+'" class="map" style="width:1024px;height:1024px;"></div>'+
								  '</div>';
					}else{
						htmlString += '<div id="pointPopup" class="ol-popup"><div class="ol-popup-title"><img class="port-img" src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/marker_port.png"><span class="ol-popup-title-content"></span></div><a href="#" id="popup-closer" class="ol-popup-closer"></a><div id="popup-content"></div></div><div id="geo-marker"></div>'+
									'<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;"></div>'+
								  '</div>';
					}
					/*htmlString += '<div class="port-encheck">'+
										'<img class="port-encheck-img" src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/i_left03.png" width="64" height="73"/>'+
								  '</div>';
					htmlString += '<div class="weather-encheck">'+
										'<img class="weather-encheck-img" src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/i_left_weather.png" width="64" height="73"/>'+
								  '</div>';

					htmlString += '<div id="sProgressPopup">'+
									'<a href="#" id="sProgressPopup-closer" class="sProgressPopup-closer"></a>'+
									'<div class="form-group">'+
										'<div class="col-sm-10">'+
										'Select one HBL No. and CNTR No.'+
										'</div>'+
									'</div>'+
								  '</div>';*/

					//this.Element.innerHTML = '<div id="'+uId+'" class="map" style="width:'+frmW+'px;height:'+frmH+'px;opacity:0.6;"></div>';
					this.Element.innerHTML = htmlString;

					this.framecreated = true;










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

					/*MapType["layersMQ"] = new ol.layer.Group({
						layers: [
							new ol.layer.Tile({
								source: new ol.source.MapQuest({layer: 'osm'})
							})
						]
					});
					*/
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


					var mapCenter = QvOSM_PVM_CUSTOM_Opt["center"];

					if(mapCenter){
						mapCenter = ol.proj.fromLonLat([parseFloat(mapCenter[0]),parseFloat(mapCenter[1])]);
					}else{
						mapCenter = ol.proj.fromLonLat([127,38]);
					}

					if(firstCenter.length > 0 && aniFlag == true){
						mapCenter = ol.proj.fromLonLat(firstCenter);
					}

					QvOSM_PVM_CUSTOM_MAP = new ol.Map({
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
						//renderer: 'canvas',
						//loadTilesWhileAnimating: true,
						target: uId,
						view: new ol.View({
						  center:mapCenter,
						  zoom: QvOSM_PVM_CUSTOM_Opt["zoom"]||3,

						  minZoom: 2,
						  maxZoom: 11

						}),

					});
					//QvOSM_PVM_CUSTOM_MAP.removeControl(ol.control.Zoom);
					$("#marker").html("");
					QvOSM_PVM_CUSTOM_MAP.getOverlays().clear();

					var pointPopup = new ol.Overlay({
						element: document.getElementById("pointPopup"),
						autoPan: true,
						autoPanAnimation: {
							duration: 250
						 }
					});

					QvOSM_PVM_CUSTOM_MAP.addOverlay(pointPopup);

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

					/* 커서 설정*/
					QvOSM_PVM_CUSTOM_MAP.on('pointermove', function(evt) {

						var pointerFlag = QvOSM_PVM_CUSTOM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {

							if(feature.get("popup") ){
								return true;
							}
						});

						QvOSM_PVM_CUSTOM_MAP.getTargetElement().style.cursor =  pointerFlag ? 'pointer' : '';
						//QvOSM_PVM_CUSTOM_MAP.getTargetElement().style.cursor = QvOSM_PVM_CUSTOM_MAP.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
					});


					/* 선택 인터랙션 */
					var select = new ol.interaction.Select({
						style: function(feature) {


							return feature.get('sel_style') || feature.get('style');
						}
					});

					//QvOSM_PVM_CUSTOM_MAP.getInteractions().extend([select]);
					QvOSM_PVM_CUSTOM_MAP.addInteraction(select);
					//싱슬 클릭시 이벤트
					QvOSM_PVM_CUSTOM_MAP.on("singleclick", function (evt) {
						select.getFeatures().clear();
						//var mouseCoordInMapPixels = [evt.originalEvent.offsetX, evt.originalEvent.offsetY];
						//console.log(evt);
						//doc.SetVariable("vKEY_TYPHOON",tyKey);
						var coordinate = evt.coordinate;
						var info = QvOSM_PVM_CUSTOM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
							select.getFeatures().push(feature);

							if($("#pointPopup").hasClass("vessel") === true) {
								$("#pointPopup").removeClass("vessel");
							}
							if($("#pointPopup").hasClass("marker") === true) {
								$("#pointPopup").removeClass("marker");
							}


							// console.log(feature);
							if(feature.get("type")=="PORT"){
								for(var i=0;i<broken_aniarr.length;i++){
									clearTimeout(broken_aniarr[i]);

								}

								port_YN="Y";
								$("#pointPopup").removeClass("vessel");
								var doc = Qv.GetCurrentDocument();
								doc.SetVariable("vCALL_PORT",feature.get("tyKey"));


							}else if(feature.get("type")=="vessel"||feature.get("type")=="VESSEL"){
								//console.log(feature);
								saveFeature=[feature.get("popup"),feature.get("tyKey")];
								$(".ol-popup-headtitle-content").text("Vessel");
								$(".ol-popup-title-content").text(feature.get("tyKey"));
								$("#pointPopup").addClass("vessel");
							}else if(feature.get("type")=="FLT"){
								(mb_chk)? $("#popup-content").css("background-image","url("+QvOSM_PVM_CUSTOM_exUrl+"icon/air_bg_m.png)"):$("#popup-content").css("background-image","url("+QvOSM_PVM_CUSTOM_exUrl+"icon/air_bg.png)");
								saveFeature=[feature.get("popup"),feature.get("tyKey")];
								$(".ol-popup-headtitle-content").text("Flight");
								$(".ol-popup-title-content").text(feature.get("tyKey"));
								$("#pointPopup").addClass("vessel");
							}else if(feature.get("type")=="marker"){
								//console.log(feature);
								$(".ol-popup-title-content").text(feature.get("tyKey"));
								$(".ol-popup-headtitle-content").text("Port");
								$("#pointPopup").addClass("marker");
							}else{
								$("#pointPopup").removeClass("vessel");
								$("#popup-content").css("background-image","none");
							}

							var iw;
							iw=(mb_chk)? "50":"25"
							var cargo = (mb_chk)? '<span class="click-routeview">Cargo List <img src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/cargo_arrow.png" width="'+iw+'" height="'+iw+'"/></span>': "";


							return (feature.get("type")=="vessel"||feature.get("type")=="VESSEL"||feature.get("type")=="FLT") ? feature.get("popup")+cargo: feature.get("popup");

						});
						if(info){

							pointPopupContent.innerHTML = '<div class="popup_content">'+info+'</div>';
							pointPopup.setPosition(coordinate);
						} else {

							$("#popup-closer").trigger("click");
						}
					});

					QvOSM_PVM_CUSTOM_MAP.on("dblclick", function (evt) {
						//var mouseCoordInMapPixels = [evt.originalEvent.offsetX, evt.originalEvent.offsetY];
						var coordinate = evt.coordinate;
						var tyKey = QvOSM_PVM_CUSTOM_MAP.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
							//console.log(feature.get("type"));
							if(feature.get("type")=="VESSEL"||feature.get("type")=="FLT"){
								$(".ol-popup-headtitle-content").text("Vessel");
								if(feature.get("type")=="FLT"){
									$(".ol-popup-headtitle-content").text("Flight");
									(mb_chk)? $("#popup-content").css("background-image","url("+QvOSM_PVM_CUSTOM_exUrl+"icon/air_bg_m.png)"):$("#popup-content").css("background-image","url("+QvOSM_PVM_CUSTOM_exUrl+"icon/air_bg.png)");
								}
								return [feature.get("popup"),feature.get("tyKey")];
							}


						});
						var iw
						iw=(mb_chk)? "50":"25"
						if(tyKey){
								saveFeature=tyKey;
								$(".ol-popup-title-content").text(tyKey[1]);
								$("#pointPopup").removeClass("vessel");
								$("#pointPopup").addClass("vessel");
								var cargo = (mb_chk)? '<span class="click-routeview">Cargo List <img src="'+QvOSM_PVM_CUSTOM_exUrl+'icon/cargo_arrow.png" width="'+iw+'" height="'+iw+'"/></span>': "";
								pointPopupContent.innerHTML = '<div class="popup_content">'+tyKey[0]+cargo+'</div>';
								pointPopup.setPosition(coordinate);

								showRoute=tyKey[1];
								doc2.SetVariable("vDimension_YN","Y");
								//doc2.SetVariable("vPATH_VALUE","");
								doc2.SetVariable("vVessel",tyKey[1]);
								evt.preventDefault();



						}
					});

					/*$("#mapLayer1").find("img").on("click", function(){
						var ty = $(this).attr("ty");
						if(ty){
							Func.setMapType(ty);
						}
					});*/

					$(".ol-popup-title").on("click",function(e){
						showRoute=saveFeature[1];

						doc2.SetVariable("vDimension_YN","Y");
						doc2.SetVariable("vVessel",saveFeature[1]);
						e.preventDefault();

					})
					$("#pointPopup").on("click",".click-routeview",function(e){
						showRoute=saveFeature[1];

						doc2.SetVariable("vDimension_YN","Y");
						doc2.SetVariable("vVessel",saveFeature[1]);
						e.preventDefault();

					})

					/*$("#mapLayerBtn1").on("click", function(){
						$("#mapLayer1").toggle("slide", 1000, function(d){
							if($("#mapLayer1").css("display") == "none"){
								$("#mapLayerBtn1").html(">");
							}else{
								$("#mapLayerBtn1").html("<");
							}
						});
					});*/

					/*$("#wtLayerBtn1").on("click", function(){
						$("#weatherLayer1").toggle("slide",{direction:"right"} ,1000, function(d){
							if($("#weatherLayer1").css("display") == "none"){
								$("#wtLayerBtn1").html("<");
							}else{
								$("#wtLayerBtn1").html(">");
							}
						});
					});*/

					$(".sProgressPopup-closer").on("click",function(){
						$( "#sProgressPopup" ).hide();
						doc2.SetVariable("vShipment_Progress_Click","N");
					});

					$("#tyDateLabel1").on("click",function(){
						tyDateLabelC = $("#tyDateLabel1").is(":checked");
						Func.refresh();
					});
					$("#vesselLabel1").on("click",function(){
						vesselLabelC = $("#vesselLabel1").is(":checked");
						vesselLayer.changed();
					});
					$(".port-encheck-img").on("click",function(){
						var img =this.src.split("/");
						if(img[(img.length-1)]=="i_left03.png"){
							img[(img.length-1)]="i_left03_on.png"
							portLabelC = false;
						}else{
							img[(img.length-1)]="i_left03.png"
							portLabelC = true;
						}
						img=img.join("/");
						this.src=img;

						portLayer.changed();
					});

					$(".weather-encheck-img").on("click",function(){
						var img =this.src.split("/");
						if(img[(img.length-1)]=="i_left_weather.png"){
							img[(img.length-1)]="i_left_weather_on.png"
							weatherLayer.setVisible(false);
						}else{
							img[(img.length-1)]="i_left_weather.png"
							weatherLayer.setVisible(true);
						}
						img=img.join("/");
						this.src=img;


					});


				//framecreated 끝
				//}
				drawWtLayer = function(){
				//날씨 레이어
				if(QvOSM_PVM_CUSTOM_Opt["weather"]){
					d3.csv(QvOSM_PVM_CUSTOM_exUrl+"data/weather.csv", function(d){
						weatherIcons = [];
						var pos;
						var weatherGroup = {};


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
									src: QvOSM_PVM_CUSTOM_exUrl+'icon/'+icon+'.png'
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
						if(weatherLayer)weatherLayer.getSource().clear();
						weatherLayer = new ol.layer.Vector({
							source:iconVector
						});
						weatherLayer.setZIndex(1);
						QvOSM_PVM_CUSTOM_MAP.addLayer(weatherLayer);

						var weatherL = $element.find("#weatherLayer1");



						var weatherString = ""+
						'<div class="form-group">'+
						  '<div class="col-sm-10">'+
							'<div class="checkbox">'+
							  '<label>'+
								'<input type="checkbox" class="w0" checked=checked> Weather'+
							  '</label>'+
							'</div>'+
						  '</div>';
						for(var wg in weatherGroup) {
							var iconList = unique(weatherGroup[wg]);
							weatherString += ""+
							  '<div class="col-sm-10">'+
								'<div class="checkbox">'+
								  '<label>'+
									'<input type="checkbox" class="w1" data-icon="'+iconList.toString()+'" checked=checked> '+wg+
								'</label>'+
								'</div>'+
							  '</div>';
						}
						weatherString +="</div>"
						weatherL.html(weatherString);
						$(".weatherArea").find(".w0").bind("change", function(){
							var op = 0;
							if(this.checked){
								op = 0.9;
								$(".weatherArea").find("input").attr("checked", "checked");
								weatherLayer.setVisible(true);
							}else{
								$(".weatherArea").find("input").attr("checked", false);
								weatherLayer.setVisible(false);
							}

						});
						$(".weatherArea").find(".w1").bind("change", function(){
							var _this = this;
							var features = weatherLayer.getSource().getFeatures();
							var weatherFeatures = [];
							var iconData = $(this).attr("data-icon").split(",");
							//var iconData = $(this).data("icon");//.split(",");
							for (var i = 0; i < features.length; i++) {
								//var icon = features[i]["G"]["t"];
								var icon = features[i].get("t");
								//console.log(features[i].get("t"));
								if(iconData.indexOf(icon)>-1){
									weatherFeatures.push({icon:icon, fea : features[i]});
								}
							}


							$(this).unbind("change");
							$(this).bind("change", function(){
								var op = 0;
								if(_this.checked){
									op = 0.9;
								}

								for (var i = 0; i < weatherFeatures.length; i++) {
									var icon = weatherFeatures[i].icon;

									weatherFeatures[i].fea.setStyle(new ol.style.Style({
										image: new ol.style.Icon( ({
											opacity: op,
											scale:0.6,
											//size : [100,100],
											color: '#ffffff',
											src: QvOSM_PVM_CUSTOM_exUrl+'icon/'+icon+'.png'
										}))
									}));
								}
							});

							$(this).trigger("change");
						});
					});
				}
				}

				drawWtLayer();
			}


				if(IB02.GetVariable(2).text=="N" && IB02.GetVariable(7).text=="Y"){

					$( "#sProgressPopup" ).css("display","block");

				}
				// Vessel 레이어
				for(var i=0;i<broken_aniarr.length;i++){
					clearTimeout(broken_aniarr[i]);

				}
				if(QvOSM_PVM_CUSTOM_Opt["vessel"]){
					var vIconFeas = [];
					var iconHeader;
					var normaltxt;
					//console.log(vesselData);
					var vd_i = 0, vdLength = vesselData.length;
					var broken_aniarr_i=0;
					var icon_scale;
					if(vdLength>0){
						if(vesselData[0].type=="FLT"){


						}
					}
					for(;vd_i < vdLength; vd_i++){
						var truepoint=vesselData[vd_i].point;

						var point = ol.proj.fromLonLat(vesselData[vd_i].point);

						var vIconFea = new ol.Feature(new ol.geom.Point(point));
						vIconFea.set('tyKey', vesselData[vd_i].name);
						vIconFea.set('popup', vesselData[vd_i].popup);
						vIconFea.set('point1',truepoint);
						vIconFea.set('type',vesselData[vd_i].type);
						//icon, rotation, scale, name, offx, offy
						if(vesselData[vd_i].type=="VESSEL"){
							iconHeader="Vessel_";
							normaltxt="normal"
						}
						else {
							iconHeader=vesselData[vd_i].type+"_";
							normaltxt="FLT"

						}
						icon_scale=(vesselData[vd_i].aniYN=="Mobile")? 2.5 : 0.8



						vIconFea.set('style', createvesselIcon(normaltxt,iconHeader+vesselData[vd_i].inout, vesselData[vd_i].direction, icon_scale));
						vIconFea.set('sel_style', createvesselIcon("zoom",iconHeader+vesselData[vd_i].inout+"_sel", vesselData[vd_i].direction, icon_scale));
						vIconFea.set('zoom_style', createvesselIcon("zoom",iconHeader+vesselData[vd_i].inout+"", vesselData[vd_i].direction, icon_scale));
						vIconFea.set('namestyle', createvesselIcon("normal",iconHeader+vesselData[vd_i].inout, vesselData[vd_i].direction, icon_scale, vesselData[vd_i].name, 0, offy));
						vIconFea.set('zoom_namestyle', createvesselIcon("zoom",iconHeader+vesselData[vd_i].inout, vesselData[vd_i].direction, icon_scale, vesselData[vd_i].name, 0, offy));


						if(vesselData[vd_i].inout.split("_")[0]=="BROKEN"){

							flash(vIconFea,broken_aniarr_i);
							broken_aniarr_i++;
						}


						//vIconFea.set('importance', vd_i);
						offy = (offy === 15) ? 22: 15;
						if(vesselData[vd_i].aniYN === 'Y' && mapAniObj === null){
							vIconFea.set('key', vesselData[vd_i].name);
							vIconFea.set('point', point);
							aniFea.push(vIconFea);
						}
						//console.log(vIconFea);
						if(IB02.GetVariable(2).text=="Y"){
							vesselFeaturelist[vesselData[vd_i].name]=vIconFea;
						}

						vIconFeas.push(vIconFea);


					}

					var vIconVector = new ol.source.Vector({
										features: vIconFeas
									});

					vesselLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(vesselLayer);

					//if(vesselLayer){vesselLayer.getSource().clear();}

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
					vesselLayer.setZIndex(9999);
					QvOSM_PVM_CUSTOM_MAP.addLayer(vesselLayer);

					//vesselLayer.set('selectable', true);

				}
				// port 레이어
				if(QvOSM_PVM_CUSTOM_Opt["port"]){
					var pIconFeas = [];


					var pd_i = 0, pdLength = portData.length;
					for(;pd_i < pdLength; pd_i++){
						var point = ol.proj.fromLonLat(portData[pd_i].point);
						var pIconFea = new ol.Feature(new ol.geom.Point(point));
						pIconFea.set('tyKey', portData[pd_i].typhoonKey);
						pIconFea.set('type',"PORT");
						pIconFea.set('popup', portData[pd_i].popup);

						//icon, rotation, scale, name, offx, offy
						if(!portLabelC){
							pIconFea.set('style', createIconStyle(portData[pd_i].inout, portData[pd_i].direction, 0.8));
							pIconFea.set('sel_style', createIconStyle(portData[pd_i].inout, portData[pd_i].direction, 0.8, portData[pd_i].name, 0, offy));

						}else{
							pIconFea.set('style', createIconStyle(portData[pd_i].inout, portData[pd_i].direction, 0.8, portData[pd_i].name, 0, offy));
							pIconFea.set('sel_style', createIconStyle(portData[pd_i].inout, portData[pd_i].direction, 0.8, portData[pd_i].name, 0, offy));
						}






						offy = (offy === 15) ? 22: 15;
						if(portData[pd_i].aniYN === 'Y' && mapAniObj === null){
							pIconFea.set('key', portData[pd_i].typhoonKey);
							pIconFea.set('point', point);
							aniFea.push(pIconFea);
						}
						pIconFeas.push(pIconFea);


					}

					var pIconVector = new ol.source.Vector({
										features: pIconFeas
									});

					portLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(portLayer);



					portLayer = new ol.layer.Vector({
									style : function(feature) {

												if(portLabelC){
													return feature.get('style');
												}else{
													//console.log(portLabelC);
													return feature.get('');
												}






											},
									source:pIconVector
								});
					portLayer.setZIndex(1200);
					QvOSM_PVM_CUSTOM_MAP.addLayer(portLayer);



				}
				//typhoon 레이어
				if(QvOSM_PVM_CUSTOM_Opt["typhoon"]){
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

						return list;
						//return {"list":list, "center": ol.proj.fromLonLat([center[0], center[1]])};
					}



					//반경 폴리곤 그리기 시작
					var tyPolyList = [];
					var pTyi = 0;
					var pTyLength = typhoonData.tyRadi.length;

					for(pTyi;pTyi<pTyLength; pTyi++){
						var ce = typhoonData.tyRadi[pTyi].point;
						var no = typhoonData.tyRadi[pTyi].radiusNE;
						var so = typhoonData.tyRadi[pTyi].radiusSW;
						var ea = typhoonData.tyRadi[pTyi].radiusSE;
						var we = typhoonData.tyRadi[pTyi].radiusNW;

						if(no != 0 && so != 0){
							tyPolyList.push(
								{'type': 'Feature',
								 'geometry': {
									'type': 'Polygon',
									'coordinates': [getTypoonCoordinates(ce, no, so, ea, we)]
									},
								 'properties':{
									'center' : ol.proj.fromLonLat(ce),
									'winSpeed' : typhoonData.tyRadi[pTyi].radius || 34
									}
								}
							);
						}
					}
					var tyPolyStyle = [
						new ol.style.Style({
						  stroke: new ol.style.Stroke({
							color: QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["50knot"]["color"],
							width: 1
						  }),
						  fill: new ol.style.Fill({
							color: QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["50knot"]["color"]
						  })
						}),
						new ol.style.Style({
						  stroke: new ol.style.Stroke({
							color: QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["34knot"]["color"],
							width: 1
						  }),
						  fill: new ol.style.Fill({
							color: QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["34knot"]["color"]
						  })
						}),
						new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["line"]["color"],
								width: 5
							}),
							fill: new ol.style.Fill({
								color: QvOSM_PVM_CUSTOM_Design_Opt["typhoon"]["line"]["width"]
							})
						}),
						//태풍 지난 경로
						new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: "#555",
								width: 5
							}),
							fill: new ol.style.Fill({
								color: "#555"
							})
						})
					]

					var geojsonObject = {
						'type': 'FeatureCollection',
						'crs': {
							'type': 'name',
							'properties': {
								'name': 'EPSG:4326'
							}
						},
						'features': tyPolyList
					};

					var geoFeatures = (new ol.format.GeoJSON()).readFeatures(geojsonObject);
					var ff;
					//회전
					for(ff in geoFeatures){
						var center = geoFeatures[ff].getProperties().center;
						geoFeatures[ff].getGeometry().rotate(45 * Math.PI / 180, center);
					}

					var tyPolyLSource = new ol.source.Vector({
						features: geoFeatures
					});


					//태풍 예상 경로
					var tyLines = [];
					var tyCurSeq = 0;
					var startSeq = 0;
					for(var tyKey in typhoonData.tyLine){
						var tyLine = typhoonData.tyLine[tyKey];
						var tyLineLength = tyLine.length;
						tyCurSeq = 0;

						if( tyLineLength > 1){
							var tyL_i = 0;

							tyLine.sort(function (a, b) {
								return a.seq < b.seq ? -1 : a.seq > b.seq ? 1 : 0;
							});
							//현재 태풍 위치 찾기
							for(var ci = 0; ci<tyLineLength; ci++){
								if(tyLine[ci].icon === "tyhpoon_icon"){
									tyCurSeq = tyLine[ci].seq;
								}
							}

							for(;tyL_i<tyLineLength-1;tyL_i++){
								var coordinates = [ol.proj.fromLonLat(tyLine[tyL_i].point), ol.proj.fromLonLat(tyLine[tyL_i+1].point)];

								var tyLineFea = new ol.Feature({
										  geometry: new ol.geom.LineString(coordinates),
										  name: 'Line'
									  })
								if(tyLine[tyL_i].seq < tyCurSeq){
									tyLineFea.set("style", tyPolyStyle[3]);
								}
								tyLines.push(tyLineFea);
							}


						}
					}

					tyPolyLSource.addFeatures(tyLines);

					//태풍 아이콘
					var tyIconFeas = [];
					var tyi_i = 0, tyPosLength = typhoonData.tyPos.length;

					for(;tyi_i < tyPosLength; tyi_i++){
						var tyIconFea = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(typhoonData.tyPos[tyi_i].point)));

						tyIconFea.set('tyKey', typhoonData.tyPos[tyi_i].typhoonKey);
						tyIconFea.set('popup',  typhoonData.tyPos[tyi_i].popup);
						//icon, rotation, scale, name, offx, offy
						if(tyDateLabelC){
							tyIconFea.set('style', createIconStyle(typhoonData.tyPos[tyi_i].icon, null, null, typhoonData.tyPos[tyi_i].tyDate, 30, offy));
						} else {
							tyIconFea.set('style', createIconStyle(typhoonData.tyPos[tyi_i].icon));
						}
						offy = (offy === 15) ? 22: 15;

						tyIconFeas.push(tyIconFea);

						if(typhoonData.tyPos[tyi_i].aniYN === 'Y' && mapAniObj === null){
							tyIconFea.set('key', typhoonData.tyPos[tyi_i].typhoonKey);
							tyIconFea.set('point', ol.proj.fromLonLat(typhoonData.tyPos[tyi_i].point));
							aniFea.push(tyIconFea);
						}


					}

					tyPolyLSource.addFeatures(tyIconFeas);

					tyPolyLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(tyPolyLayer);

					//if(tyPolyLayer){tyPolyLayer.getSource().clear();}
					tyPolyLayer = new ol.layer.Vector({
						source: tyPolyLSource,
						style: function(feature){
							if(feature.get("style")){
								return feature.get("style");
							}else if(feature.getProperties().winSpeed == 50){
								feature.set("style", tyPolyStyle[0]);
								return tyPolyStyle[0];
							}else if (feature.getProperties().winSpeed == 34) {
								feature.set("style", tyPolyStyle[1]);
								return tyPolyStyle[1];
							}else {
								feature.set("style", tyPolyStyle[2]);
								return tyPolyStyle[2];
							}
						}
					});

					QvOSM_PVM_CUSTOM_MAP.addLayer(tyPolyLayer);


				//vessle이동 경로및 port route 고도화 추가
				var routeDraw = function(){
					/*
						데이터 만들어야 할것
						1. 라우트 정보
						2. 포트 정보
						3. 마커 정보
						4. 운송 정보
					*/

					//if(!routeObj.length) return;
					var routeObjLength = routeObj.length;
					var aniZoomFlag = false;
					var animating = false;
					var routeFea = [];
					var portFea = [];
					var markerFea = [];
					var transFea = [];
					var excepFea = [];


					//DISP_DATE
					//route 변수들
					var distance;
					var center;
					var arcCoord= [];
					var arcCoordafter= [];
					var arcCoordLength;
					var point1, point2;
					var aniCoord = [];
					var arcCoordstyle= [];
					var arcCoordafterstyle= [];
					var aniCoordsLength;
					//test
					var testCenter = [];

					var j = 0;

					if(routeObjLength){
						var vesselFeature=vesselLayer.getSource().getFeatures();
						for(var vFi=0;vFi<vesselFeature.length;vFi++){

							QvOSM_PVM_CUSTOM_MAP.addOverlay(makeVesselLabel(vesselFeature[vFi]));
						}

					}

					//Feature 별 스타일 만들기, 함수로 만들어서 이름에 따라 아이콘 변경하기
					var styles = {
						'route_end': new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: '#ffff00',
								width: (mb_chk)? 8:3

							})
						}),
						'route_ing': new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: '#ffff00',
								width: (mb_chk)? 8:3,
								lineCap : "square",
								lineDash: [5, 10]
							})
						}),
						'icon': new ol.style.Style({
							image: new ol.style.Icon({
								//anchor: [0.5, 1],
								scale:0.6,
								src: QvOSM_PVM_CUSTOM_exUrl+"icon/spot.png"
							}),
							zIndex : 9999
						}),
						'exception': new ol.style.Style({
							image: new ol.style.Icon({
								anchor: [1.5, 3],
								scale:0.6,
								src: QvOSM_PVM_CUSTOM_exUrl+"icon/notice.png"
							}),
							zIndex : 9999
						}),
						'marker' : function(feature){
							var step = feature.get("step").toLowerCase();
							var name = feature.get("name");
							var delay = feature.get("delay");
							if(delay){
								step=step+"_"+delay;
							}

							//console.log(name);
							var style = new ol.style.Style({
								image: new ol.style.Icon({
									opacity:1,
									anchor: [0.5, 1],
									scale:(mb_chk)?2.0:0.8,


									src:  QvOSM_PVM_CUSTOM_exUrl+"icon/maker_"+step+".png",

								}),
								text : new ol.style.Text({
									text: name,
									scale:1,
									offsetY: 10,
									offsetX: 0,
									stroke: new ol.style.Stroke({color: "#333", width:0.5}),
									fill: new ol.style.Fill({
									  color: '#eee'
									})
								})
							});



							return style;
						},
						'trans' : function(feature){

							var mode = feature.get("mode").toLowerCase();
							var ex = ".png";
							var anc = (feature.get("isTemp")) ? [0.5,0.5]:[0.5, 2];
							var style = new ol.style.Style({
								image: new ol.style.Icon({
									anchor: anc,
									scale:0.6,
									src: QvOSM_PVM_CUSTOM_exUrl+"icon/method_"+mode+ex
								})
							});
							return style;
						},
						'geoMarker': new ol.style.Style({
							image: new ol.style.Circle({
								radius: 7,
								snapToPixel: false,
								fill: new ol.style.Fill({color: 'black'}),
								stroke: new ol.style.Stroke({
									color: 'white', width: 2
								})
							})
						})
					};


					aniZoomFlag = false;
					//console.log(routeObj);
					for(i=0; i<routeObjLength; i++){

						point1 = routeObj[i].XY;

						//1. route feature 만들기
						if(i<routeObjLength-1){
							point2 = routeObj[i+1].XY;
							//console.log(i);
							//태평양 건너기...


							//console.log(point1+","+point2);
							//center = getCircleCenter(point1, point2, distance);
							//이 좌표들의 증앙 값을 현재 위치가 아닌 곳의 운송수단의 좌표로
							//distance = getDistance(point1, point2);
							//곡선을 표현하기위한 함수
							//distance = getDistance(point1, point2);
							//center = getCircleCenter(point1, point2, distance);
							//arcCoord = getArcCoordinates(center[1], point1, point2, distance);
							//console.log(point1);
							if(routeObj[i].ROUTE==""){

								arcCoordstyle =[routeObj[i].STATUS, routeObj[i+1].STATUS];
								arcCoord =[point1, point2];
							}else{

								arcCoord = getroutepathCoord(routeObj[i].ROUTE);
								if(routeObj[i].STATUS=="D"){
									arcCoordstyle =getroutepathCoordstyle(arcCoord.length,"D");
								}else{
									arcCoordstyle =getroutepathCoordstyle(arcCoord.length,"N");
								}


								if(routeObj[i].ROUTE_AFTER){
									arcCoordafter=getroutepathCoord(routeObj[i].ROUTE_AFTER);

									arcCoordafterstyle =getroutepathCoordstyle(arcCoordafter.length,"N");

									arcCoord=arcCoord.concat(arcCoordafter);
									arcCoordstyle=arcCoordstyle.concat(arcCoordafterstyle);
								}

								arcCoord.unshift(point1);
								arcCoord.push(point2);

								//arcCoord=getroutepathCoord2(arcCoord);

								arcCoordstyle.unshift(routeObj[i].STATUS);
								arcCoordstyle.push(routeObj[i+1].STATUS);
							}
							//console.log(arcCoord);





							//좌표들이 있으면
							if(arcCoord.length > 1){
								arcCoordLength = arcCoord.length-1;



								//멀티라인 좌표로 만들기
								for(j = 0; j<arcCoordLength; j++){
									/* 곡선 표현시 해당 로직추가

									if(arcCoord[j][0] > 179 && arcCoord[j+1][0] < -179 ){
										continue;
									}*/
									var lineCoord = [];
									/*lineCoord.push([arcCoord[j], arcCoord[j+1]]);





									if(arcCoordstyle[j+1] == "N"){

										routeFea.push(
											new ol.Feature({
												type: 'route_ing',
												geometry: new ol.geom.MultiLineString(lineCoord)
											})
										);
									}else {
										routeFea.push(
											new ol.Feature({
												type: 'route_end',
												geometry: new ol.geom.MultiLineString(lineCoord)
											})
										);
									}*/


									lineCoord.push(arcCoord[j], arcCoord[j+1]);



									if(Math.abs(lineCoord[0][0] - lineCoord[1][0]) > 200){
										if(lineCoord[0][0] > 0 && lineCoord[1][0] < 0){
												lineCoord[1][0]=lineCoord[1][0]+360;
											}else if(lineCoord[0][0]< 0 && lineCoord[1][0] > 0){
											lineCoord[0][0]=lineCoord[0][0]+360;
										}
									}

									if(arcCoordstyle[j+1] == "N"){

										routeFea.push(
											new ol.Feature({
												type: 'route_ing',
												geometry: new ol.geom.MultiLineString([[ol.proj.fromLonLat(lineCoord[0]),ol.proj.fromLonLat(lineCoord[1])]])
											})
										);
									}else {
										routeFea.push(
											new ol.Feature({
												type: 'route_end',
												geometry: new ol.geom.MultiLineString([[ol.proj.fromLonLat(lineCoord[0]),ol.proj.fromLonLat(lineCoord[1])]])
											})
										);
									}
								}

								/*var lineCoord = [];
								for(j = 0; j<arcCoordLength; j++){
									/* 곡선 표현시 해당 로직추가
									if(arcCoord[j][0] > 179 && arcCoord[j+1][0] < -179 ){
										continue;
									}
									lineCoord.push([arcCoord[j], arcCoord[j+1]]);
								}
								console.log(lineCoord);
								//feature 만들기 옵션값을 줘서 스타일 만들기
								if(routeObj[i+1]["STATUS"] === "A"||routeObj[i+1]["STATUS"] === "N"){
									routeFea.push(
										new ol.Feature({
											type: 'route_ing',
											geometry: new ol.geom.MultiLineString(lineCoord)
										})
									);
								} else {
									routeFea.push(
										new ol.Feature({
											type: 'route_end',
											geometry: new ol.geom.MultiLineString(lineCoord)
										})
									);
								}*/
							}
						}

						point1 = ol.proj.fromLonLat(point1);
						//console.log(point1);
						//2. port feature 만들기
						portFea.push(
							new ol.Feature({
								type: 'icon',
								geometry: new ol.geom.Point(point1)
							})
						);

						//3.marker feature 만들기
						markerFea.push(
							new ol.Feature({
								type: 'marker',
								step : routeObj[i]["STEP"],
								name : routeObj[i]["PORT_CD"],
								delay : routeObj[i]["DELAY_ICON"],
								geometry: new ol.geom.Point(point1)
							})
						);
						//console.log(point1);
						QvOSM_PVM_CUSTOM_MAP.addOverlay(makerouteLabel(routeObj[i]["DISP_DATE"],point1,1));

						//4.운송정보는 route에서 같이 만듦;

						//5.exception feature 만들기
						if(routeObj[i]["IRRE"]){
							excepFea.push(
								new ol.Feature({
									type: 'exception',
									//step : routeObj[i]["STEP"],
									geometry: new ol.geom.Point(point1)
								})
							);
						}

					}







					var allFeatures = routeFea.concat(portFea,markerFea,transFea,excepFea,testCenter);

					routeLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(routeLayer);
					routeLayer = new ol.layer.Vector({
						source: new ol.source.Vector({
							features: allFeatures
						}),
						style: function(feature) {
							//console.log(feature.get('type'));
							// hide geoMarker if animation is active
							//if (animating && feature.get('type') === 'geoMarker') {
							//	return null;
							//}
							var type = feature.get('type');
							if(animating && type === 'trans'){
								return null;
							}
							if(type === 'marker' || type === 'trans' ){
								return styles[type](feature);
							}
							return styles[type];
						}
					});
					routeLayer.setZIndex(1201);
					QvOSM_PVM_CUSTOM_MAP.addLayer(routeLayer);
					routeZoom=true;
					vesselZoom=2
					vesselLayer.changed();


					var extent = routeLayer.getSource().getExtent();



					QvOSM_PVM_CUSTOM_MAP.getView().fit(extent, QvOSM_PVM_CUSTOM_MAP.getSize(),{padding : [50,20,50,20]});


				}


				//vessle이동 경로및 port route 고도화 추가
				var vesselrouteDraw = function(){
					/*
						데이터 만들어야 할것
						1. 라우트 정보
						2. 포트 정보
						3. 마커 정보
						4. 운송 정보
					*/

					// console.log('vesselrouteDraw');
					var vesselrouteObjLength = vesselrouteObj.length;

					var routeFea = [];
					var portFea = [];
					var markerFea = [];



					//DISP_DATE
					//route 변수들
					var distance;
					var center;
					var arcCoord= [];


					var arcCoordLength;
					var arcCoordstyle= [];
					var arcCoorddate= [];

					//test
					var testCenter = [];

					var j = 0;

					if(vesselrouteObjLength){
						var vesselFeature=vesselLayer.getSource().getFeatures();
						for(var vFi=0;vFi<vesselFeature.length;vFi++){

							QvOSM_PVM_CUSTOM_MAP.addOverlay(makeVesselLabel(vesselFeature[vFi]));
						}

					}

					//Feature 별 스타일 만들기, 함수로 만들어서 이름에 따라 아이콘 변경하기
					var styles = {
						'route_end': new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: '#ffff00',
								width: (mb_chk)? 8:3

							}),

						}),
						'route_ing': new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: '#ffff00',
								width: (mb_chk)? 8:3,
								lineCap : "square",
								lineDash: [5, 10]
							})
						}),
						'icon': new ol.style.Style({
							image: new ol.style.Circle({
									radius: (mb_chk)?20:5,
									stroke: new ol.style.Stroke({
									  color: '#fff'
									}),
									fill: new ol.style.Fill({
									  color: '#EDE32D'
									})
							}),

						}),

						'marker' : function(feature){
							var step = feature.get("step").toLowerCase();
							var name = feature.get("tyKey");



							var style = new ol.style.Style({

								image: new ol.style.Icon({
									opacity:1,
									anchor: [0.5, 1],
									scale:(mb_chk)? 2.0:0.8,


									src:  QvOSM_PVM_CUSTOM_exUrl+"icon/marker_port.png",

								}),
								text : new ol.style.Text({
									text: name,
									scale:1,
									offsetY: 10,
									offsetX: 0,
									stroke: new ol.style.Stroke({color: "#333", width:0.5}),
									fill: new ol.style.Fill({
									  color: '#eee'
									})
								})
							});



							return style;
						},


					};

					if(vesselrouteObjLength>0){


						arcCoord = getroutepathCoord(vesselrouteObj[vesselrouteObjLength-1].VESSEL_PAST_ROUTE);
						var portroute
						arcCoorddate =(vesselrouteObj[vesselrouteObjLength-1].VESSEL_PAST_DATE).split(",");
						arcCoordstyle =getroutepathCoordstyle(arcCoord.length,"D");
						for(var arci=0;arci<(vesselrouteObjLength-1);arci++){
							portroute= new Array(vesselrouteObj[arci].XY[0],vesselrouteObj[arci].XY[1]);
							arcCoord.push(portroute);
							arcCoorddate.push(vesselrouteObj[arci].PORT_INFO);
							arcCoordstyle.push("A");
						}
						//console.log(arcCoord);

						/*if(!isNaN(vesselrouteObj[0].XY[0])){
							arcCoord.push(vesselrouteObj[0].XY);
							arcCoorddate.push(vesselrouteObj[0].PORT_INFO);
							arcCoordstyle.push("A");
						}*/
						arcCoord=getroutepathCoord2(arcCoord, vesselrouteObjLength-1);

						//좌표들이 있으면
						if(arcCoord.length > 1){
							arcCoordLength = arcCoord.length-1;

							//4.운송수단 feature 만들기
							//멀티라인 좌표로 만들기
							for(j = 0; j<arcCoordLength; j++){

								var lineCoord = [];
								lineCoord.push([arcCoord[j],arcCoord[j+1]]);

								if(arcCoordstyle[j+1] == "A"||arcCoordstyle[j+1] == "N"){

									routeFea.push(
										new ol.Feature({
											type: 'route_ing',

											geometry: new ol.geom.MultiLineString(lineCoord)
										})
									);
								}else {

									var dx = arcCoord[arcCoordLength][0] - lineCoord[0][0][0];
									var dy = arcCoord[arcCoordLength][1] - lineCoord[0][0][1];
									var rotation = Math.atan2(dy, dx);

									routeFea.push(
										new ol.Feature({
											type: 'route_end',

											geometry: new ol.geom.MultiLineString(lineCoord)
										})
									);
								}
								/*lineCoord.push(arcCoord[j], arcCoord[j+1]);



								if(Math.abs(lineCoord[0][0] - lineCoord[1][0]) > 200){
									if(lineCoord[0][0] > 0 && lineCoord[1][0] < 0){
											lineCoord[1][0]=lineCoord[1][0]+360;
										}else if(lineCoord[0][0]< 0 && lineCoord[1][0] > 0){
										lineCoord[0][0]=lineCoord[0][0]+360;
									}
								}

								if(arcCoordstyle[j+1] == "N"){

									routeFea.push(
										new ol.Feature({
											type: 'route_ing',
											geometry: new ol.geom.MultiLineString([[ol.proj.fromLonLat(lineCoord[0]),ol.proj.fromLonLat(lineCoord[1])]])
										})
									);
								}else {
									routeFea.push(
										new ol.Feature({
											type: 'route_end',
											geometry: new ol.geom.MultiLineString([[ol.proj.fromLonLat(lineCoord[0]),ol.proj.fromLonLat(lineCoord[1])]])
										})
									);
								}*/

								if(j==arcCoordLength-1){
									if(j>=(arcCoordLength-(vesselrouteObjLength-1))){
										if(!isNaN(vesselrouteObj[0].XY[0])){

										}else{
											QvOSM_PVM_CUSTOM_MAP.addOverlay(makevesselrouteLabel(arcCoorddate[j],arcCoord[j]));
											QvOSM_PVM_CUSTOM_MAP.addOverlay(makevesselrouteLabel(arcCoorddate[j+1],arcCoord[j+1]));
										}
									}
									portFea.push(
										new ol.Feature({
											type: 'icon',
											geometry: new ol.geom.Point(arcCoord[j])
										})
									);
									portFea.push(
										new ol.Feature({
											type: 'icon',
											geometry: new ol.geom.Point(arcCoord[j+1])
										})
									);
								}else{
									if(j>=(arcCoordLength-(vesselrouteObjLength-1))){
										if(!isNaN(vesselrouteObj[0].XY[0])){

										}
									}else{
										QvOSM_PVM_CUSTOM_MAP.addOverlay(makevesselrouteLabel(arcCoorddate[j],arcCoord[j]));
									}

									portFea.push(
										new ol.Feature({
											type: 'icon',
											geometry: new ol.geom.Point(arcCoord[j])
										})
									);
								}


								/*if(j==arcCoordLength-1){
									QvOSM_PVM_CUSTOM_MAP.addOverlay(makevesselrouteLabel(arcCoorddate[j],ol.proj.fromLonLat(lineCoord[0])));
									QvOSM_PVM_CUSTOM_MAP.addOverlay(makevesselrouteLabel(arcCoorddate[j+1],ol.proj.fromLonLat(lineCoord[1])));
									portFea.push(
										new ol.Feature({
											type: 'icon',
											geometry: new ol.geom.Point(ol.proj.fromLonLat(lineCoord[0]))
										})
									);
									portFea.push(
										new ol.Feature({
											type: 'icon',
											geometry: new ol.geom.Point(ol.proj.fromLonLat(lineCoord[1]))
										})
									);
								}else{
									QvOSM_PVM_CUSTOM_MAP.addOverlay(makevesselrouteLabel(arcCoorddate[j],ol.proj.fromLonLat(lineCoord[0])));
									portFea.push(
										new ol.Feature({
											type: 'icon',
											geometry: new ol.geom.Point(ol.proj.fromLonLat(lineCoord[0]))
										})
									);
								}*/
							}


						}
						$(".ol-viewport .ol-overlaycontainer-stopevent .ol-overlay-container .vesselroute_name_box").draggable();
						//console.log(vesselrouteObj);
						for(var vri=0;vri<vesselrouteObjLength-1;vri++){
						//2. port feature 만들기

							if(!isNaN(vesselrouteObj[vri].XY[0])){


								var point1 = ol.proj.fromLonLat(vesselrouteObj[vri].XY);


								//3.marker feature 만들기
								markerFea.push(
									new ol.Feature({
										type: 'marker',
										step : vesselrouteObj[vri]["STEP"],
										name : vesselrouteObj[vri]["PORT_CD"],
										tyKey : vesselrouteObj[vri]["PORT_CD"],
										popup: vesselrouteObj[vri]["PORT_NAME"]+"<br>"+vesselrouteObj[vri]["PORT_INFO"],
										geometry: new ol.geom.Point(point1)
									})
								);

							}
							//console.log(vesselrouteObj[vri]);


						}

					}







					var allFeatures = routeFea.concat(portFea,markerFea);

					vesselrouteLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(vesselrouteLayer);
					vesselrouteLayer = new ol.layer.Vector({
						source: new ol.source.Vector({
							features: allFeatures
						}),
						style: function(feature) {
							//console.log(feature.get('type'));
							// hide geoMarker if animation is active
							//if (animating && feature.get('type') === 'geoMarker') {
							//	return null;
							//}
							var type = feature.get('type');

							if(type === 'marker'){
								feature.set("sel_style",styles[type](feature));
								return styles[type](feature);
							}
							return styles[type];
						}

					});
					vesselrouteLayer.setZIndex(1201);
					QvOSM_PVM_CUSTOM_MAP.addLayer(vesselrouteLayer);
					//routeZoom=true;
					//vesselZoom=2
					//vesselLayer.changed();


					var extent = vesselrouteLayer.getSource().getExtent();



					QvOSM_PVM_CUSTOM_MAP.getView().fit(extent, QvOSM_PVM_CUSTOM_MAP.getSize(),{padding : [50,20,50,20]});


				}



				//vessle이동 경로및 port route 고도화 추가
				var airrouteDraw = function(){
					/*
						데이터 만들어야 할것
						1. 라우트 정보
						2. 포트 정보
						3. 마커 정보
						4. 운송 정보
					*/


					var vesselrouteObjLength = vesselrouteObj.length;

					var routeFea = [];
					var portFea = [];
					var markerFea = [];
					var zoomFea = [];


					//DISP_DATE
					//route 변수들
					var distance;
					var center;
					var arcCoord= [];
					var zoomCoord= [];

					var arcCoordLength;
					var arcCoordstyle= [];
					var arcCoorddate= [];

					//test
					var testCenter = [];

					var j = 0;

					if(vesselrouteObjLength){
						var vesselFeature=vesselLayer.getSource().getFeatures();
						for(var vFi=0;vFi<vesselFeature.length;vFi++){

							QvOSM_PVM_CUSTOM_MAP.addOverlay(makeVesselLabel(vesselFeature[vFi]));
						}

					}

					//Feature 별 스타일 만들기, 함수로 만들어서 이름에 따라 아이콘 변경하기
					var styles = {
						'route_end': new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: '#ffff00',
								width: (mb_chk)? 8:3

							}),

						}),
						'route_ing': new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: '#ffff00',
								width: (mb_chk)? 8:3,
								lineCap : "square",
								lineDash: [5, 10]
							})
						}),


						'marker' : function(feature){

							var name = feature.get("tyKey");
							var img =  (feature.get("DA"))? "icon/maker_departure.png":"icon/maker_arrival.png";

							//console.log(name);
							var style = new ol.style.Style({
								image: new ol.style.Icon({
									opacity:1,
									anchor: [0.5, 1],
									scale: (mb_chk)? 2.0:0.8,


									src:  QvOSM_PVM_CUSTOM_exUrl+img,

								}),
								text : new ol.style.Text({
									text: name,
									scale:(mb_chk)?4.0:1,
									offsetY: 10,
									offsetX: 0,
									stroke: new ol.style.Stroke({color: "#333", width:0.5}),
									fill: new ol.style.Fill({
									  color: '#eee'
									})
								})
							});



							return style;
						}



					};

					if(vesselrouteObjLength>0){
					//console.log(vesselrouteObj[vesselrouteObj.length-1].VESSEL_PAST_ROUTE);

						arcCoord = getroutepathCoord(vesselrouteObj[0].ROUTE);
						arcCoord.unshift([Number(vesselrouteObj[0]["FROM_LNGTD"]),Number(vesselrouteObj[0]["FROM_LTITDE"])]);
						arcCoordstyle =getroutepathCoordstyle(arcCoord.length,"D");
						arcCoord.push([Number(vesselrouteObj[0]["TO_LNGTD"]),Number(vesselrouteObj[0]["TO_LTITDE"])]);
						arcCoordstyle.push("N");

						//arcCoord = getroutepathCoord2(arcCoord);

						//console.log(arcCoord);
						//좌표들이 있으면
						if(arcCoord.length > 1){
							arcCoordLength = arcCoord.length-1;

							//4.운송수단 feature 만들기
							//멀티라인 좌표로 만들기
							for(j = 0; j<arcCoordLength; j++){

								var lineCoord = [];
								var zoomviewCoord = [];

								lineCoord.push(arcCoord[j], arcCoord[j+1]);


								/*lineCoord.push([arcCoord[j], arcCoord[j+1]]);





								if(arcCoordstyle[j+1] == "N"){

									routeFea.push(
										new ol.Feature({
											type: 'route_ing',
											geometry: new ol.geom.MultiLineString(lineCoord)
										})
									);
								}else {
									routeFea.push(
										new ol.Feature({
											type: 'route_end',
											geometry: new ol.geom.MultiLineString(lineCoord)
										})
									);
								}*/
								if(Math.abs(lineCoord[0][0] - lineCoord[1][0]) > 200){
									if(lineCoord[0][0] > 0 && lineCoord[1][0] < 0){
											lineCoord[1][0]=lineCoord[1][0]+360;
										}else if(lineCoord[0][0]< 0 && lineCoord[1][0] > 0){
										lineCoord[0][0]=lineCoord[0][0]+360;
									}
								}

								if(arcCoordstyle[j+1] == "N"){

									routeFea.push(
										new ol.Feature({
											type: 'route_ing',
											geometry: new ol.geom.MultiLineString([[ol.proj.fromLonLat(lineCoord[0]),ol.proj.fromLonLat(lineCoord[1])]])
										})
									);
								}else {
									routeFea.push(
										new ol.Feature({
											type: 'route_end',
											geometry: new ol.geom.MultiLineString([[ol.proj.fromLonLat(lineCoord[0]),ol.proj.fromLonLat(lineCoord[1])]])
										})
									);
								}

							}


						}
						//console.log(routeFea);

						var toPort = Number(vesselrouteObj[0]["TO_LNGTD"]);
						var fromPort = Number(vesselrouteObj[0]["FROM_LNGTD"]);


						if(toPort < 0 && fromPort >0){
							toPort = toPort + 360;
						} else if(toPort > 0 && fromPort < 0){
							fromPort = fromPort + 360;
						}

						if(toPort < fromPort) {
							if((fromPort - toPort) > 180) {
								toPort = Number(vesselrouteObj[0]["TO_LNGTD"]);
								fromPort = Number(vesselrouteObj[0]["FROM_LNGTD"]);
							}
						} else {
							if((toPort - fromPort) > 180) {
								toPort = Number(vesselrouteObj[0]["TO_LNGTD"]);
								fromPort = Number(vesselrouteObj[0]["FROM_LNGTD"]);
							}

						}




						//console.log(vesselrouteObj[0]["FROM_LNGTD"],vesselrouteObj[0]["FROM_LTITDE"]);
						var point1 = ol.proj.fromLonLat([fromPort,Number(vesselrouteObj[0]["FROM_LTITDE"])]);

						//3.marker feature 만들기
						markerFea.push(
							new ol.Feature({
								type: 'marker',
								DA: true,
								name : vesselrouteObj[0]["FROM_PORT"],
								tyKey : vesselrouteObj[0]["FROM_PORT"],
								popup: vesselrouteObj[0]["FROM_PORT"],
								geometry: new ol.geom.Point(point1)
							})
						);

						var point2 = ol.proj.fromLonLat([toPort,Number(vesselrouteObj[0]["TO_LTITDE"])]);
						markerFea.push(
							new ol.Feature({
								type: 'marker',
								DA: false,
								name : vesselrouteObj[0]["TO_PORT"],
								tyKey : vesselrouteObj[0]["TO_PORT"],
								popup: vesselrouteObj[0]["TO_PORT"],
								geometry: new ol.geom.Point(point2)
							})
						);

						//console.log(fromPort,toPort);




					}







					var allFeatures = routeFea.concat(markerFea);

					vesselrouteLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(vesselrouteLayer);
					vesselrouteLayer = new ol.layer.Vector({
						source: new ol.source.Vector({
							features: allFeatures
						}),
						style: function(feature) {
							//console.log(feature.get('type'));
							// hide geoMarker if animation is active
							//if (animating && feature.get('type') === 'geoMarker') {
							//	return null;
							//}
							var type = feature.get('type');

							if(type === 'marker'){
								feature.set("sel_style",styles[type](feature));
								return styles[type](feature);
							}
							return styles[type];
						},
						//extent: ol.proj.get('EPSG:3857').getExtent()
					});


					vesselrouteLayer.setZIndex(1201);
					QvOSM_PVM_CUSTOM_MAP.addLayer(vesselrouteLayer);




					var extent = vesselrouteLayer.getSource().getExtent();


					QvOSM_PVM_CUSTOM_MAP.getView().fit(extent, QvOSM_PVM_CUSTOM_MAP.getSize(),{padding : [50,20,50,20]});


				}



				//해당 컬럼이 Y일떄만 라우트 경로 그리기
				//console.log(IB02.GetVariable(2).text);
				if(IB02.GetVariable(2).text=="Y"){

					if(vesselrouteLayer) vesselrouteLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(vesselrouteLayer);
					for(var routei=0;routei<routeOverlay.length;routei++){
						//console.log(routeOverlay[routei]);
						QvOSM_PVM_CUSTOM_MAP.removeOverlay(routeOverlay[routei]);
					}
					for(var vesslei=0;vesslei<vesselLabelOverlay.length;vesslei++){
						//console.log(routeOverlay[routei]);
						QvOSM_PVM_CUSTOM_MAP.removeOverlay(vesselLabelOverlay[vesslei]);
					}
					for(var vri=0;vri<vesselrouteOverlay.length;vri++){

						QvOSM_PVM_CUSTOM_MAP.removeOverlay(vesselrouteOverlay[vri]);
					}
					routeDraw();

				}else if((IB02.GetVariable(9).text!="[]"&&IB02.GetVariable(9).text!="-"&&IB02.GetVariable(9).text!="[\"\"]")&&IB02.GetVariable(2).text=="N"){
					if(routeLayer)routeLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(routeLayer);
					for(var routei=0;routei<routeOverlay.length;routei++){
						//console.log(routeOverlay[routei]);
						QvOSM_PVM_CUSTOM_MAP.removeOverlay(routeOverlay[routei]);
					}
					for(var vesslei=0;vesslei<vesselLabelOverlay.length;vesslei++){
						//console.log(routeOverlay[routei]);
						QvOSM_PVM_CUSTOM_MAP.removeOverlay(vesselLabelOverlay[vesslei]);
					}
					for(var vri=0;vri<vesselrouteOverlay.length;vri++){

						QvOSM_PVM_CUSTOM_MAP.removeOverlay(vesselrouteOverlay[vri]);
					}
					if(vesselrouteObj[0].FROM_LNGTD){
						airrouteDraw();
					}else vesselrouteDraw();

				}else{
					if(routeLayer)routeLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(routeLayer);
					if(vesselrouteLayer) vesselrouteLayer = QvOSM_PVM_CUSTOM_MAP.removeLayer(vesselrouteLayer);
					for(var routei=0;routei<routeOverlay.length;routei++){
						//console.log(routeOverlay[routei]);
						QvOSM_PVM_CUSTOM_MAP.removeOverlay(routeOverlay[routei]);
					}
					for(var vesslei=0;vesslei<vesselLabelOverlay.length;vesslei++){
						//console.log(vesselLabelOverlay[vesslei]);
						QvOSM_PVM_CUSTOM_MAP.removeOverlay(vesselLabelOverlay[vesslei]);
					}
					for(var vri=0;vri<vesselrouteOverlay.length;vri++){

						QvOSM_PVM_CUSTOM_MAP.removeOverlay(vesselrouteOverlay[vri]);
					}

				}


					function onZoom(evt) {
						var view = evt.target;
						if(routeZoom){
							//console.log(routeZoom);
						}else if(oldZoom==view.getZoom()){

						}else if(view.getZoom()>4){
							vesselZoom=2
							vesselLayer.changed();
						}else{
							vesselZoom=1
							vesselLayer.changed();
						}
						oldZoom=view.getZoom();
					}
					//console.log(vesselZoom);
					QvOSM_PVM_CUSTOM_MAP.getView().on('propertychange', onZoom);
				}

			}catch(e){
				console.log(e.message);
			}
		});

	});
});
});
