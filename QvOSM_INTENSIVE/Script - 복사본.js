'use strict'
const EX_NAME = "QvOSM_INTENSIVE";
const QV_OSM_URL = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/";
const QV_OSM_EX_URL = QV_OSM_URL + EX_NAME + "/";
const CQV = Qv.GetDocument("");
const vEXT_INTENSIVE = CQV.GetObject("vEXT_INTENSIVE");
//const vEXT_INTENSIVE = CQV.GetObject("vInfo_Port");
const MAP_TYPE_GROUP = {
    "lightblue": 'https://api.mapbox.com/styles/v1/yhy878/cj0nkfsv7004c2slfyernovxx/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWh5ODc4IiwiYSI6ImNpam04Mm5jaTAwOWJ0aG01d2hlb2FpYXEifQ.kzx9H8IeBBk_zCvvF91Rtg', //layersOSM
    "satellite": 'https://api.mapbox.com/styles/v1/seungok/ciousf1zl003sdqnfpcpfj19r/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg', //layersTn
    "dark": 'https://api.mapbox.com/styles/v1/seungok/cip7yoxzy0029dnm5n040qd0q/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg', //layersMb
    "basic": 'https://api.mapbox.com/styles/v1/seungok/ciouskftw003jcpnn296ackea/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg' //layersMb2
};

let drawingTime;
let qvObjectId;
let qvPassedValues = {};
let QvOSM_MAP;
var oldZoom = 3;

var vRoute_YN;
var vSHOW_NEWS;
var vMAPTYPE;
var vView_Risk;
var vTYPHOON_LO_NEW;
var vVESSEL_CURR_LOC;
var vINCIDENT;
var vPORT;
var vNOTI_PORT;
var vWeather_flag;
var vBackbtn_flag;

var vROUTE;

let typhoonDataArr = [];
let vesselDataArr = [];
let incidentDataArrArr = [];
let portDataArr = [];
let notiPortDataArr = [];

let portLayer;
let notiLayer;

let coordinate;

var QvOSM_Opt = {}; // ?
// var vSHOW;
var vSTD;
var vSTD_DATA = {};
var vSEA;
var vSEA_DATA = {};
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
var center = [127, 38];
var defMove = "fly";
var $target;
var IsChkCnt = 0;
var TYPHOON_ICON_ARR = new Array();
var typhooniconlayerlist = [];
var broken_aniarr = [];
var vesselLayer;
var currentZoomLevel;
var incidentLayer;
var incidentDataArr = [];
var ticker_incidentDataArr = [];
var vPOLYGON;
var vPolygonArr;
var polygonLayers = [];

var vPATH;
var vPATH_VALUE;
var routeOverlay = [];
var routeLayer;
var routeZoom = false;
var weatherIcons = [];
var weatherLayer;
var weatherPop = false;

var overlayList = [];

var pointPopupContent;
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
var setClickEvent = function($ID, $STEP, $DATA, $TARGET_ID) {
    var $IDX = 0;
    //".Document_vTSLU .QvGrid div[style*='position: relative']:eq(2) div[unselectable='on'][title][style*='left: 0px']"
    $.each($(".Document_" + $ID + " div[page]:eq(1) div[unselectable='on'][title][style*='left: 0px']"), function() {
        var $_target = $(this);
        //첫번째
        $(this).attr("idx", $IDX).unbind("click").bind("click", function(event) {
            Qv.GetDocument("").SetVariable($TARGET_ID, $DATA[$(this).attr("idx")][$STEP]["text"]);
        });
        //두번째
        $(this).next().attr("idx", $IDX).unbind("click").bind("click", function(event) {
            Qv.GetDocument("").SetVariable($TARGET_ID, $DATA[$(this).attr("idx")][$STEP]["text"]);
        });
        //세번째
        $(this).next().next().attr("idx", $IDX).unbind("click").bind("click", function(event) {
            Qv.GetDocument("").SetVariable($TARGET_ID, $DATA[$(this).attr("idx")][$STEP]["text"]);
        });
        //네번째
        $(this).next().next().next().attr("idx", $IDX).unbind("click").bind("click", function(event) {
            Qv.GetDocument("").SetVariable($TARGET_ID, $DATA[$(this).attr("idx")][$STEP]["text"]);
        });
        //다섯번째
        $(this).next().next().next().next().attr("idx", $IDX).unbind("click").bind("click", function(event) {
            Qv.GetDocument("").SetVariable($TARGET_ID, $DATA[$(this).attr("idx")][$STEP]["text"]);
        });
        //여섯번째
        $(this).next().next().next().next().next().attr("idx", $IDX).unbind("click").bind("click", function(event) {
            Qv.GetDocument("").SetVariable($TARGET_ID, $DATA[$(this).attr("idx")][$STEP]["text"]);
        });
        //일곱번째
        $(this).next().next().next().next().next().next().attr("idx", $IDX).unbind("click").bind("click", function(event) {
            Qv.GetDocument("").SetVariable($TARGET_ID, $DATA[$(this).attr("idx")][$STEP]["text"]);
        });
        $IDX++;
    });
    setTimeout(function() {
        if ($(".Document_" + $ID + " div[page]:eq(1) div[unselectable='on'][title] .injected").length == $(".Document_" + $ID + " div[page]:eq(1) div[unselectable='on'][title][idx]").length) return;
        setClickEvent($ID, $STEP, $DATA, $TARGET_ID);
    }, 1500);
};
//거리 구하기, x,y 값 배열 두개;
var getDistance = function(pt, pt2) {
    //경위도 거리 차이 보정 X
    var x2 = Math.pow((pt[0] - pt2[0]), 2);
    var y2 = Math.pow((pt[1] - pt2[1]), 2);
    return Math.sqrt((x2 + y2));
}
//+에서 -로 가는 route 보정
function getroutepathCoord(datarow) {
    var route_arr = [];
    var org_arr = [];
    var r360_arr = [];
    var min_cnt = 0;

    $.each(datarow, function($k, $v) {
        if ($v[0] < 0) min_cnt++;
        org_arr.push(ol.proj.fromLonLat($v));
        if ($v[0] > 180) {
            $v[0] = 360 - $v[0];
        } else if ($v[0] < -180) {
            $v[0] = 360 + $v[0];
        }
    });
    for (var i = 0; i < datarow.length - 1; i++) {
        if ((datarow[i][0] + datarow[i + 1][0]) < -200) {
            datarow[i][0] = datarow[i][0] + 360;
            if (i == (datarow.length - 2)) {
                datarow[i + 1][0] = datarow[i + 1][0] + 360;
            }
        } else {
            if (Math.abs(datarow[i][0] - datarow[(i + 1)][0]) > 200) {
                if (datarow[i][0] > 0 && datarow[(i + 1)][0] < 0) {
                    datarow[(i + 1)][0] = datarow[(i + 1)][0] + 360;
                } else if (datarow[i][0] < 0 && datarow[(i + 1)][0] > 0) {
                    datarow[i][0] = datarow[i][0] + 360;
                }
            }
        }
        if (i == (datarow.length - 2)) {
            route_arr.push(ol.proj.fromLonLat(datarow[i]));
            route_arr.push(ol.proj.fromLonLat(datarow[(i + 1)]));
        } else {
            route_arr.push(ol.proj.fromLonLat(datarow[i]));
        }
    }
    //직선경로일경우 짧은 경로를 선택
    if (r360_arr.length > 0 && datarow.length == 2) {
        var org_dist = getDistance(org_arr[0], org_arr[1]);
        var route_dist = getDistance(route_arr[0], route_arr[1]);
        var r360_dist = getDistance(r360_arr[0], r360_arr[1]);
        if (org_dist <= r360_dist) {
            return org_arr;
        } else {
            console.log("getroutepathCoord :: 변경 경로가 기존 경로 보다 짧아서 변경경로 사용");
            return r360_arr;
        }
    } else {
        if (min_cnt == datarow.length) {
            return org_arr;
        } else {
            return route_arr;
        }
    }
}

var unique = function(array) {
    var result = [];
    $.each(array, function(index, element) {
        if ($.inArray(element, result) == -1) {
            result.push(element);
        }
    });
    return result;
}


var SOURCE_OBJ = {};
var LAYER_OBJ = {};
var ROUTE_LINE_ARR = new Array();
var zIndex = 0;
var drawLine = function(id, obj, route_arr, width, zoomlevel, linecolor, linestyle, descript, offsetX, offsetY, textAlign, fontstyle, fontcolor) {
    //zoom level에 따른 거리를 수동으로 정리
    var arr = new Array(0, 0.0375, 0.075, 0.2, 0.375, 0.575, 1, 1.8, 3.7, 7, 14.15, 28.3, 55.5, 111, 222, 460, 900, 900);
    var nwidth = zoomlevel == null ? width : arr[zoomlevel] * width * 2; //threshold값은 한쪽의 폭을 얘기하므로 2배를 해줘야 한다
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
    switch (linestyle) {
        case "text":
            geoStyle_obj = new ol.geom.Point(crdnt2);
            style_obj =
                new ol.style.Style({
                    text: new ol.style.Text({
                        font: (fontstyle ? fontstyle : '' + nwidth + 'px Calibri,sans-serif'),
                        text: descript ? descript + "" : "",
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
            var feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': obj["polygon"]
                }
            };
            geojsonObject2["features"] = [feature];
            var ff;
            //회전
            for (ff in geoFeatures2) {
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
                        src: QV_OSM_EX_URL + 'icon/' + obj["icon"] + '.png',
                        scale: nwidth
                    }),
                    text: new ol.style.Text({
                        font: (fontstyle ? fontstyle : '14px Calibri,sans-serif'),
                        text: descript ? descript + "" : "",
                        textAlign: (textAlign ? textAlign : "left"),
                        offsetY: (offsetY ? offsetY : 15),
                        offsetX: (offsetX ? offsetX : 10),
                        overflow: true,
                        fill: new ol.style.Fill({
                            color: fontcolor
                        }),
                        stroke: new ol.style.Stroke({ color: "#333", width: 0.5 })
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
                            width: nwidth / 20
                        })
                    }),
                    text: new ol.style.Text({
                        font: (fontstyle ? fontstyle : '' + nwidth + 'px Calibri,sans-serif'),
                        text: descript ? descript + "" : "",
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
            geoStyle_obj = new ol.geom.MultiLineString([
                [crdnt2, crdnt2]
            ]);
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
                        font: (fontstyle ? fontstyle : '' + nwidth + 'px Calibri,sans-serif'),
                        text: descript ? descript + "" : "",
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
                        text: descript ? descript + "" : "",
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
                        lineCap: "round",
                        lineDash: [1, nwidth * 1.6],
                        width: nwidth
                    }),
                    fill: new ol.style.Fill({
                        color: linecolor
                    }),
                    text: new ol.style.Text({
                        font: '10px Calibri,sans-serif',
                        text: descript ? descript + "" : "",
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
    if (SOURCE_OBJ[id] == null) {
        SOURCE_OBJ[id] = new ol.source.Vector({
            features: geoFeatures2
        });
    }
    var lFea2 = new ol.Feature({
        geometry: geoStyle_obj,
        name: obj["key"]
    });
    style_obj.setZIndex(zIndex++);
    lFea2.set("ref", obj);
    lFea2.set("style", style_obj);
    lLines2.push(lFea2);
    SOURCE_OBJ[id].addFeatures(lLines2);
};
var addLayer = function($target) {
    if (LAYER_OBJ[$target] == null) {
        LAYER_OBJ[$target] = new ol.layer.Vector({
            source: SOURCE_OBJ[$target],
            style: function(feature) {
                return feature.get("style");
            }
        });
    } else {
        QvOSM_MAP.removeLayer(LAYER_OBJ[$target]);
    }
    try {
        QvOSM_MAP.addLayer(LAYER_OBJ[$target]);
    } catch (e) {
        console.log(e);
    }
};
var removeLayer = function($target) {
    if (LAYER_OBJ[$target]) {
        SOURCE_OBJ[$target].removeFeature(SOURCE_OBJ[$target].getFeatures()[0]);
        SOURCE_OBJ[$target].clear();
        LAYER_OBJ[$target] = QvOSM_MAP.removeLayer(LAYER_OBJ[$target]);
        delete LAYER_OBJ[$target];
    }
};
var removeAllLayer = function() {
    QvOSM_MAP.removeLayer(vesselLayer);
    QvOSM_MAP.removeLayer(incidentLayer);
    QvOSM_MAP.removeLayer(weatherLayer);
    $.each(LAYER_OBJ, function($k, $v) {
        removeLayer($k);
    });
};
var setRiskScore = function() {
    console.log("setRiskScore start");
    // node의 score 데이터는 프로퍼티에서 넘어오는 데이터 이다.
    if ($target.Data.Rows != null && $target.Data.Rows.length > 0 && $target.Data.Rows[0].length == 6)
        $.each($target.Data.Rows, function($k, $v) {
            var obj = {
                type: "score",
                date: $v[0]["text"],
                loc_cd: $v[1]["text"],
                port_nm: $v[2]["text"],
                lngtd: ($.isNumeric($v[3]["text"]) ? parseFloat($v[3]["text"]) : ""),
                ltitde: ($.isNumeric($v[4]["text"]) ? parseFloat($v[4]["text"]) : ""),
                score: parseFloat($v[5]["text"]),
                color: "rgba(0, 159, 60, 1)",
                width: 10,
                icon: "0",
                point: null,
                tooltip: null
            };
            obj["point"] = ol.proj.fromLonLat([obj["lngtd"], obj["ltitde"]]);
            obj["tooltip"] = "<div style='font-size:12px;font-weight:bold;'>" + obj["port_nm"] + "</div>" +
                "<div style='font-size:12px;'>Score : " + obj["score"] + "</div>";
            if (obj["score"] == "-") return true;
            obj["color"] = "rgba(0, 159, 60, 1)";
            if (obj["score"] < 1) {
                obj["color"] = "rgba(0, 159, 60, 1)";
                obj["icon"] = "0";
            } else if (obj["score"] >= 1 && obj["score"] < 2) {
                obj["color"] = "rgba(124, 198, 35, 1)";
                obj["icon"] = "1";
            } else if (obj["score"] >= 2 && obj["score"] < 3) {
                obj["color"] = "rgba(249, 244, 0, 1)";
                obj["icon"] = "2";
            } else if (obj["score"] >= 3 && obj["score"] < 4) {
                obj["color"] = "rgba(255, 210, 65, 1)";
                obj["icon"] = "3";
            } else if (obj["score"] >= 4 && obj["score"] < 6) {
                obj["color"] = "rgba(235, 125, 49, 1)";
                obj["icon"] = "4-5";
            } else if (obj["score"] >= 6 && obj["score"] <= 8) {
                obj["color"] = "rgba(255, 0, 0, 1)";
                obj["icon"] = "6-7";
            } else if (obj["score"] >= 9) {
                obj["color"] = "rgba(150, 0, 20, 1)";
                obj["icon"] = "8";
            }
            ROUTE_LINE_ARR.push(obj);
        });
};
var showRiskScore = function() {
    zIndex = 0;
    //console.log("showRiskScore start");
    // console.log( ROUTE_LINE_ARR );
    if (ROUTE_LINE_ARR.length > 0) {
        var zoom = QvOSM_MAP.getView().getZoom();
        $.each(ROUTE_LINE_ARR, function($k, $v) {
            var offsetX = -0.1;
            var offsetY = -4;
            var descript = $v["score"];
            var fontstyle = "10px Calibri,sans-serif";
            if (zoom > 4) {
                fontstyle = 'bold 14px Calibri,sans-serif';
                drawLine($v["type"], $v, $v["point"], 0.8, null, null, "icon", descript, offsetX, offsetY, "center", fontstyle, "rgba(54, 54, 54, 1)");
            } else {
                var $v2 = JSON.parse(JSON.stringify($v));
                $v2["icon"] = $v2["icon"] + "_15";
                drawLine($v["type"], $v2, $v["point"], 0.8, null, null, "icon");
            }
        });
        if (vSHOW_NEWS != "N" && qvPassedValues["vLOC_CD"] != "") {
            if (ltitde != "" && lngtd != "") {
                var ltitde = ROUTE_LINE_ARR[0]["ltitde"];
                var lngtd = ROUTE_LINE_ARR[0]["lngtd"];
                if (lngtd < 0) {
                    lngtd = 360 + lngtd;
                }
                QvOSM_MAP.getView().setZoom(8);
                var center = ol.proj.fromLonLat([lngtd, ltitde]);
                QvOSM_MAP.getView().setCenter(center);
            }
        }
        addLayer("score");
    }
};

var removeRouteLine = function() {
    $.each(ROUTE_LINE_ARR, function($k, $v) {
        removeLayer("stdroute_" + $k);
        //      removeLayer("searate_"+$k);
        removeLayer("line_" + $k);
        removeLayer("icon_" + $k);
    });
};
var showRouteLine = function() {
    zIndex = 0;
    //console.log("showRouteLine start");
    if (ROUTE_LINE_ARR.length > 0) {
        var $mmsi = "";
        var $vsl_nm = "";
        var $odd = 0;
        $.each(ROUTE_LINE_ARR, function($k, $v) {
            var $color = (vMAPTYPE == "basic" || vMAPTYPE == "lightblue") ? "rgba(197, 90, 17, 0.8)" : "rgba(244, 177, 131, 0.8)";
            if ($mmsi == "") $mmsi = $v["mmsi"];
            if ($vsl_nm == "") $vsl_nm = $v["vsl_nm"];
            if ($mmsi != $v["mmsi"]) {
                if ($odd == 0) {
                    $odd = 1;
                } else {
                    $odd = 0;
                }
            } else if ($vsl_nm != $v["vsl_nm"]) {
                if ($odd == 0) {
                    $odd = 1;
                } else {
                    $odd = 0;
                }
            }
            if ($odd == 0) {
                $color = (vMAPTYPE == "basic" || vMAPTYPE == "lightblue") ? "rgba(197, 90, 17, 0.8)" : "rgba(244, 177, 131, 0.8)";
            } else {
                $color = (vMAPTYPE == "basic" || vMAPTYPE == "lightblue") ? "rgba(46, 117, 182, 0.8)" : "rgba(157, 195, 230, 0.8)";
            }
            $mmsi = $v["mmsi"];
            // console.log("mmsi :: "+$mmsi);
            // console.log("$odd :: "+$odd);
            // console.log("$color :: "+$color);
            var IS_ROUTE = false;
            var routeobj = JSON.parse(JSON.stringify($v));
            routeobj["tooltip"] = null;
            if (IS_ROUTE == false && $v["stdroute"].length > 0) {
                console.log("stdroute 사용 :: ");
                //console.log(routeobj);
                drawLine("stdroute_" + $k, routeobj, routeobj["stdroute"], 3, null, $color, "dash");
                addLayer("stdroute_" + $k);
                IS_ROUTE = true;
            }
            if (IS_ROUTE == false) {
                if (routeobj["line"].length == 0 || routeobj["line"][0][0][0] == null || routeobj["line"][0][0][1] == null || routeobj["line"][0][1][0] == null || routeobj["line"][0][1][1] == null) {
                    //console.log("vROUTE 그릴수 없는 좌표 발견 :: ");
                    //console.log(routeobj);
                } else {
                    if (routeobj["line"][0].length > 0) {
                        //console.log("vROUTE 표준도 searate도 없는 구간으로 직선처리 :: ");
                        //console.log(routeobj);
                        drawLine("line_" + $k, routeobj, routeobj["line"], 3, null, $color, "dash");
                        addLayer("line_" + $k);
                    }
                }
            }
        });
        //아이콘 그릴때 뉴스가 있으면 뉴스 아이콘으로 변경하는 로직이 들어가야 한다.
        //그리고 마우스 오버시 그에 대한 툴팁이 나오고, 클릭하면 해당 뉴스의 내용이 팝업으로 나타난다. singleclick에서 툴팁기능 추가해야 한다.
        $.each(ROUTE_LINE_ARR, function($k, $v) {
            drawLine("icon_" + $k, $v, $v["point"], 0.8, null, null, "icon", $v["score"], -0.1, -4, "center", 'bold 14px Calibri,sans-serif', "rgba(54, 54, 54, 1)");
            addLayer("icon_" + $k);
            if ($v["news_on"] == 1) {
                var $v2 = JSON.parse(JSON.stringify($v));
                $v2["type"] = "news";
                $v2["icon"] = $v2["news_icon"];
                $v2["tooltip"] = $v2["news_arr"][0]["title"];
                $v2["incident_type2"] = $v2["news_arr"][0]["incident_type2"];
                $v2["lngtd"] = $v2["lngtd"] + 0.5;
                // console.log($v2);
                if ($v2["news_arr"].length > 1) {
                    drawLine("news_icon_" + $k, $v2, ol.proj.fromLonLat([$v2["lngtd"], $v2["ltitde"]]), 0.5, null, null, "icon", $v2["news_arr"].length, -10, 22, "left", 'bold 18px Calibri,sans-serif', $v2["color"]);
                } else {
                    drawLine("news_icon_" + $k, $v2, ol.proj.fromLonLat([$v2["lngtd"], $v2["ltitde"]]), 0.5, null, null, "icon");
                }
                addLayer("news_icon_" + $k);
            }
        });
        var ltitde = (ROUTE_LINE_ARR[0]["ltitde"] + ROUTE_LINE_ARR[ROUTE_LINE_ARR.length - 1]["ltitde"]) * 2 / 3;
        var lngtd = (ROUTE_LINE_ARR[0]["lngtd"] + ROUTE_LINE_ARR[ROUTE_LINE_ARR.length - 1]["lngtd"]) * 2 / 3;
        if (lngtd < 0) {
            lngtd = 360 + lngtd;
        }
        if (ltitde != "" && lngtd != "") {
            var center = ol.proj.fromLonLat([lngtd, ltitde]);
            QvOSM_MAP.getView().setCenter(center);
        }
    }
};
var offy = 15;
var mapAniObj = null;
var aniFea = [];
var vesselZoom = 1;
var vesselLabel = false;
var vesselLabelC = vesselLabel;
var createvesselIcon = function(style, icon, rotation, scale, name, offx, offy) {
    var imageicon;
    var opacity;
    if (style == "normal") {
        var isEX = icon.split("_")[1];
        switch (isEX) {
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
        scale = 0.6;
        opacity = 0.6;
    } else {
        imageicon = icon;
        opacity = 0.6;
    }
    var obj = {
        image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
            scale: scale ? scale : 1,
            src: QV_OSM_EX_URL + 'icon/' + imageicon + '.png',
            rotation: 0, //rotation ? rotation * Math.PI / 180 : 0
            opacity: opacity
        }))
    };
    //레이블 폰트
    if (name) {
        obj.text = new ol.style.Text({
            text: name,
            scale: 1,
            offsetY: offy || 22,
            offsetX: offx || 0,
            stroke: new ol.style.Stroke({ color: "#333", width: 0.5 }),
            fill: new ol.style.Fill({
                color: '#eee'
            })
        });
    };
    return new ol.style.Style(obj);
}
if (Qva.Mgr.mySelect == undefined) {
    Qva.Mgr.mySelect = function(e, t, n, r) {
        if (!Qva.MgrSplit(this, n, r)) return;
        e.AddManager(this);
        this.Element = t;
        this.ByValue = true;
        t.binderid = e.binderid;
        t.Name = this.Name;
        t.onchange = Qva.Mgr.mySelect.OnChange;
        t.onclick = Qva.CancelBubble
    };
    Qva.Mgr.mySelect.OnChange = function() {
        var e = Qva.GetBinder(this.binderid);
        if (!e.Enabled) return;
        if (this.selectedIndex < 0) return;
        var t = this.options[this.selectedIndex];
        e.Set(this.Name, "text", t.value, true)
    };
    Qva.Mgr.mySelect.prototype.Paint = function(e, t) {
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

function getDistance(pt, pt2) {
    var x2 = Math.pow((pt[0] - pt2[0]), 2);
    var y2 = Math.pow((pt[1] - pt2[1]), 2);
    return Math.sqrt((x2 + y2));
}
var showVessel = function() {
    // Vessel 레이어
    for (var i = 0; i < broken_aniarr.length; i++) {
        clearTimeout(broken_aniarr[i]);
    }
    var vIconFeas = [];
    var vd_i = 0,
        vdLength = vesselDataArr.length;
    var broken_aniarr_i = 0;
    for (; vd_i < vdLength; vd_i++) {
        var truepoint = vesselDataArr[vd_i].point;
        var point = ol.proj.fromLonLat(vesselDataArr[vd_i].point);
        //console.log(vesselDataArr[vd_i].name+" : "+truepoint+" : "+point);
        var vIconFea = new ol.Feature(new ol.geom.Point(point));
        vIconFea.set('mmsi', vesselDataArr[vd_i].mmsi);
        vIconFea.set('tyKey', vesselDataArr[vd_i].name);
        vIconFea.set('popup', vesselDataArr[vd_i].popup);
        vIconFea.set('point1', truepoint);
        vIconFea.set('type', "vessel");
        //icon, rotation, scale, name, offx, offy
        vIconFea.set('style', createvesselIcon("normal", "Vessel_" + vesselDataArr[vd_i].inout, vesselDataArr[vd_i].direction, 0.8));
        vIconFea.set('sel_style', createvesselIcon("zoom", "Vessel_" + vesselDataArr[vd_i].inout + "", vesselDataArr[vd_i].direction, 0.8));
        vIconFea.set('zoom_style', createvesselIcon("zoom", "Vessel_" + vesselDataArr[vd_i].inout + "", vesselDataArr[vd_i].direction, 0.8));
        vIconFea.set('namestyle', createvesselIcon("normal", "Vessel_" + vesselDataArr[vd_i].inout, vesselDataArr[vd_i].direction, 0.8, vesselDataArr[vd_i].name, 0, offy));
        vIconFea.set('zoom_namestyle', createvesselIcon("zoom", "Vessel_" + vesselDataArr[vd_i].inout, vesselDataArr[vd_i].direction, 0.8, vesselDataArr[vd_i].name, 0, offy));
        //vIconFea.set('importance', vd_i);
        offy = (offy === 15) ? 22 : 15;
        if (vesselDataArr[vd_i].aniYN === 'Y' && mapAniObj === null) {
            vIconFea.set('key', vesselDataArr[vd_i].name);
            vIconFea.set('point', point);
            aniFea.push(vIconFea);
        }
        //console.log(vIconFea);
        vIconFeas.push(vIconFea);
    }
    var vIconVector = new ol.source.Vector({
        features: vIconFeas
    });
    vesselLayer = QvOSM_MAP.removeLayer(vesselLayer);
    vesselLayer = new ol.layer.Vector({
        style: function(feature) {
            //return feature.get('style')
            if (vesselZoom == 1) {
                return (vesselLabelC) ? feature.get('namestyle') : feature.get('style');
            } else {
                return (vesselLabelC) ? feature.get('zoom_namestyle') : feature.get('zoom_style');
            }
        },
        source: vIconVector
    });
    vesselLayer.setZIndex(9999);
    QvOSM_MAP.addLayer(vesselLayer);
    //vesselLayer.set('selectable', true);
};
//Typhoon icon
var setTyphoonIcon = function() {
    TYPHOON_ICON_ARR = new Array();
    //변수, 함수 초기화
    var pi2 = Math.PI / 2;
    var pi2Q = [];
    for (var oi = 1; oi < 5; oi++) { //원 4등분;
        pi2Q.push(pi2 * oi);
    }
    var rotate = 45;
    var step = 0.1; //좌표의 간격;
    //distance - meter, bearing - 방위 360도
    var destinationPoint = function(lon, lat, distance, bearing, radius) {
        radius = (radius === undefined) ? 6371e3 : Number(radius);
        // vPhi2 = asin( sinvPhi1⋅cosvDelta + cosvPhi1⋅sinvDelta⋅cosvTheta )
        // vLambda2 = vLambda1 + atan2( sinvTheta⋅sinvDelta⋅cosvPhi1, cosvDelta − sinvPhi1⋅sinvPhi2 )
        // see http://williams.best.vwh.net/avform.htm#LL
        var vDelta = Number(distance) / radius; // angular distance in radians
        var vTheta = Number(bearing) * Math.PI / 180;
        var vPhi1 = lat.toRadians();
        var vLambda1 = lon.toRadians();
        var vPhi2 = Math.asin(Math.sin(vPhi1) * Math.cos(vDelta) + Math.cos(vPhi1) * Math.sin(vDelta) * Math.cos(vTheta));
        var x = Math.cos(vDelta) - Math.sin(vPhi1) * Math.sin(vPhi2);
        var y = Math.sin(vTheta) * Math.sin(vDelta) * Math.cos(vPhi1);
        var vLambda2 = vLambda1 + Math.atan2(y, x);
        //[lon, lat]
        return [(vLambda2.toDegrees() + 540) % 360 - 180, vPhi2.toDegrees()]; // normalise to −180..+180°
    };
    //거리 구하기, x,y 값 배열 두개;
    var getDistance = function(pt, pt2) {
        //경위도 거리 차이 보정 X
        var x2 = Math.pow((pt[0] - pt2[0]), 2);
        var y2 = Math.pow((pt[1] - pt2[1]), 2);
        return Math.sqrt((x2 + y2));
    }
    //원 좌표구하기, 태풍위치, 북쪽, 남쪽, 동쪽, 서쪽 거리
    var getTypoonCoordinates = function(center, north, south, east, west) {
        //반경이 1/2 밖에 안되서 *2를 처리함 => km 단위 인거 같습니다. 2 => 1.852 로 변경합니다.
        var $unit = 1.852;
        north = north * $unit;
        south = south * $unit;
        east = east * $unit;
        west = west * $unit;
        var radiusN = north;
        var radiusS = south;
        var radiusE = east;
        var radiusW = west;
        var pointNE = destinationPoint(center[0], center[1], north * 1000, 45);
        var pointSW = destinationPoint(center[0], center[1], south * 1000, 225);
        center = ol.proj.fromLonLat(center);
        var radiusSN = [getDistance(center, ol.proj.fromLonLat(pointSW)), getDistance(center, ol.proj.fromLonLat(pointNE))]; //남북 거리;
        var elipse_R = [];
        //타원 비율
        elipse_R.push(radiusE / radiusS); //[0] 남동;
        elipse_R.push(radiusW / radiusS); //[1] 남서
        elipse_R.push(radiusW / radiusN); //[2] 북서
        elipse_R.push(radiusE / radiusN); //[3] 북동
        var xCent = center[0];
        var yCent = center[1];
        var list = [];
        var theta = 0;
        for (var j = 0; j < 4; j++) {
            var radius = radiusSN[parseInt(j / 2)];
            var elipseR = elipse_R[j];
            for (; theta < pi2Q[j]; theta += step) {
                var x = xCent + (elipseR * radius * Math.cos(theta));
                var y = yCent - radius * Math.sin(theta);
                list.push([x, y]);
            }
        }
        //list.push(ol.proj.fromLonLat([xCent, yCent]));
        //      console.log(list);
        return list;
        //return {"list":list, "center": ol.proj.fromLonLat([center[0], center[1]])};
    }
    var $key = "";
    var std_arr = new Array();
    var $IsCurr = false;
    var $lineStyle = "line";
    var $b4value = null;
    $.each(typhoonDataArr, function($k, $v) {
        if ($key != $v["key_typhoon"]) {
            if (std_arr.length > 0)
                TYPHOON_ICON_ARR.push({
                    key: $key,
                    data: std_arr,
                });
            std_arr = new Array();
            $key = $v["key_typhoon"];
            $b4value = null;
            $lineStyle = "line";
        }
        if ($v["is_curr"] == "Y") {
            $IsCurr = true; //현재 태풍, 그 이후에는 예상경로
        } else {
            $IsCurr = false; //현재 태풍, 그 이후에는 예상경로
        }
        var ty_icon = "ty1_40_30";
        var ty_txt = $v["local_dt_tthh"] + " (Grade : VS)";
        if ($v["max_windspeed"] >= 85) {
            ty_icon = "ty4_40_30";
            ty_txt = $v["local_dt_tthh"] + " (Grade : VS)";
        } else if ($v["max_windspeed"] < 85 && $v["max_windspeed"] >= 64) {
            ty_icon = "ty3_40_30";
            ty_txt = $v["local_dt_tthh"] + " (Grade : S)";
        } else if ($v["max_windspeed"] < 64 && $v["max_windspeed"] >= 48) {
            ty_icon = "ty2_40_30";
            ty_txt = $v["local_dt_tthh"] + " (Grade : M)";
        } else if ($v["max_windspeed"] < 48 && $v["max_windspeed"] >= 34) {
            ty_icon = "ty1_40_30";
            ty_txt = $v["local_dt_tthh"] + " (Grade : W)";
        }
        var $line_obj = null;
        if ($b4value != null) {
            //console.log( 'before : ', $b4value["LNGTD"] );
            //console.log( 'after : ', $v["LNGTD"] );
            var vLngTd;
            //태평양 건너는 경우 계산처리
            if (($v["lngtd"] * $b4value["lngtd"] < 0) && $v["lngtd"] < 0) {
                vLngTd = 360 + $v["lngtd"];
            } else if (($v["lngtd"] * $b4value["lngtd"] < 0) && $v["lngtd"] > 0) {
                vLngTd = -360 + $v["lngtd"];
            } else {
                vLngTd = $v["lngtd"];
            }
            $line_obj = {
                key: $key,
                data: [
                    [ol.proj.fromLonLat([$b4value["lngtd"], $b4value["ltitde"]]), ol.proj.fromLonLat([vLngTd, $v["ltitde"]])]
                ],
                width: 3,
                color: "rgba(255, 0, 0, 0.4)",
                linestyle: $lineStyle
            };
        }
        $b4value = $v; //line 그리기 위해 이전 값을 저장한다
        if ($v["is_curr"] == "Y") { //이후 경로는 예상경로
            $lineStyle = "dash";
        } else {}
        std_arr.push({
            type: "typhoon",
            data: ol.proj.fromLonLat([$v["lngtd"], $v["ltitde"]]),
            icon: ty_icon,
            text: ty_txt,
            key: $key,
            name: $v["name"],
            color: "rgba(255, 255, 255, 1)",
            curr: $IsCurr,
            speed: $v["max_windspeed"] || 34,
            polygon: [
                [getTypoonCoordinates([$v["lngtd"], $v["ltitde"]], $v["radius"][0], $v["radius"][1], $v["radius"][2], $v["radius"][3])], //34note
                [getTypoonCoordinates([$v["lngtd"], $v["ltitde"]], $v["radius"][4], $v["radius"][5], $v["radius"][6], $v["radius"][7])] //50note
            ],
            line: $line_obj
        });
        if ($k == typhoonDataArr.length - 1)
            TYPHOON_ICON_ARR.push({
                key: $key,
                data: std_arr,
            });
    });
};
var clearTyphoonIcon = function() {

    try {
        removeLayer("mouseover");
    } catch (e) {

    }


    $.each(TYPHOON_ICON_ARR, function($key, $value) {

        $.each($value["data"], function($k, $v) {
            try {
                if (LAYER_OBJ[$v["type"] + "_" + $key + "_line_" + $k] != null) removeLayer($v["type"] + "_" + $key + "_line_" + $k);
            } catch (e) {

            }

            try {
                if (LAYER_OBJ[$v["type"] + "_" + $key + "_dash_" + $k] != null) removeLayer($v["type"] + "_" + $key + "_dash_" + $k);
            } catch (e) {

            }

            try {
                if (LAYER_OBJ[$v["type"] + "_" + $key + "_34knot_" + $k] != null) removeLayer($v["type"] + "_" + $key + "_34knot_" + $k);
            } catch (e) {

            }

            try {
                if (LAYER_OBJ[$v["type"] + "_" + $key + "_50knot_" + $k] != null) removeLayer($v["type"] + "_" + $key + "_50knot_" + $k);
            } catch (e) {

            }

            try {
                if (LAYER_OBJ[$v["type"] + "_" + $key + "_icon_" + $k] != null) removeLayer($v["type"] + "_" + $key + "_icon_" + $k);
            } catch (e) {

            }

            try {
                if (LAYER_OBJ[$v["type"] + "_" + $key + "_text_" + $k] != null) removeLayer($v["type"] + "_" + $key + "_text_" + $k);
            } catch (e) {

            }
        });
    });



};
var showTyphoonIcon = function() {
    zIndex = 0;
    if (TYPHOON_ICON_ARR.length > 0) {
        $.each(TYPHOON_ICON_ARR, function($key, $value) {
            $.each($value["data"], function($k, $v) {
                if ($v["line"] != null) {
                    var $obj = $v["line"];
                    drawLine($v["type"] + "_" + $key + "_" + $obj["linestyle"] + "_" + $k, $obj, $obj["data"], $obj["width"], null, $obj["color"], $obj["linestyle"]);
                    addLayer($v["type"] + "_" + $key + "_" + $obj["linestyle"] + "_" + $k);
                }
            });
            $.each($value["data"], function($k, $v) {
                //34note 태풍영향도 그리기 파란색
                drawLine($v["type"] + "_" + $key + "_34knot_" + $k, $v, $v["polygon"][0], null, null, QvOSM_PVM_Design_Opt["typhoon"]["34knot"]["color"], "polygon");
                addLayer($v["type"] + "_" + $key + "_34knot_" + $k);
                //50note 태풍영향도 그리기 빨간색
                drawLine($v["type"] + "_" + $key + "_50knot_" + $k, $v, $v["polygon"][1], null, null, QvOSM_PVM_Design_Opt["typhoon"]["50knot"]["color"], "polygon");
                addLayer($v["type"] + "_" + $key + "_50knot_" + $k);
            });
            $.each($value["data"], function($k, $v) {
                //태풍 아이콘 그리기

                if (QvOSM_MAP.getView().getZoom() > 4) {
                    drawLine($v["type"] + "_" + $key + "_icon_" + $k, $v, $v["data"], 1, null, null, "icon", $v["text"], null, null, null, "12px Calibri,sans-serif", $v["color"]);
                } else {
                    drawLine($v["type"] + "_" + $key + "_icon_" + $k, $v, $v["data"], 1, null, null, "icon");
                }
                addLayer($v["type"] + "_" + $key + "_icon_" + $k);
            });
            var typhoon_nm = "";
            $.each($value["data"], function($k, $v) {
                //현재 태풍 아이콘 위치에 태풍 이름 출력
                if ($v["curr"] == true && typhoon_nm == "") {
                    typhoon_nm = $v["name"];
                    drawLine($v["type"] + "_" + $key + "_text_" + $k, $v, $v["data"], null, null, "#006ca2", "text", $v["name"], 20, null, null, "bold 20px Calibri,sans-serif", "#006ca2");
                    addLayer($v["type"] + "_" + $key + "_text_" + $k);
                }
            });
        });
    }
};
var drawINCIDENT_icon = function(incidentObj) {
    var truepoint = incidentObj["pos"];
    var point = ol.proj.fromLonLat(incidentObj["pos"]);
    // console.log( 'point', incidentObj["pos"] );
    // console.log( 'incidentObj', incidentObj );
    //console.log(incidentObj["pos"]);
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
    vIconFea.set('pos', truepoint);
    vIconFea.set('pos_org', point);
    var tooltip = "";
    if (incidentObj["news_arr"] != null && incidentObj["news_arr"].length > 0) {
        var obj = incidentObj["news_arr"][0];
        var ocdt = obj["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
        tooltip = "<div class='tooltip_title' style='font-weight:bold;'>" + obj["title"] + "</div>" +
            "<div class='tooltip_loc' style='float:left;width:200px;'>" + obj["loc_nm"] + "</div>" +
            "<div class='tooltip_dt' style='float:right;width:150px;text-align:right;'>" + ocdt + "</div>";
    }
    if (tooltip == "" && incidentObj["except_arr"] != null && incidentObj["except_arr"].length > 0) {
        var obj = incidentObj["except_arr"][0];
        var ocdt = obj["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
        tooltip = "<div class='tooltip_title' style='font-weight:bold;'>" + obj["title"] + "</div>" +
            "<div class='tooltip_loc' style='float:left;width:200px;'>" + obj["loc_nm"] + "</div>" +
            "<div class='tooltip_dt' style='float:right;width:150px;text-align:right;'>" + ocdt + "</div>";
    }
    vIconFea.set('tooltip', tooltip);
    offy = (offy === 15) ? 22 : 15;
    //icon, rotation, scale, name, offx, offy
    var fontstyle = 'bold 16px Calibri,sans-serif';
    var fontcolor = incidentObj["color"];
    if (incidentObj["news_arr"].length > 1) {
        if (incidentObj["news_on"] == 1) {
            fontstyle = 'bold 18px Calibri,sans-serif';
            vIconFea.set('style', createIncidentIcon2(incidentObj["icon"], 0, 0.5, incidentObj["news_arr"].length, fontstyle, fontcolor));
        } else vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 0.7, incidentObj["news_arr"].length, fontstyle, fontcolor));
    } else {
        if (incidentObj["news_on"] == 1) vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 0.5));
        else vIconFea.set('style', createIncidentIcon(incidentObj["icon"], 0, 0.7));
    }
    return vIconFea;
}
var drawINCIDENT = function() {
    zIndex = 0;
    incidentLayer = QvOSM_MAP.removeLayer(incidentLayer);
    if (incidentDataArr.length > 0) {
        var vIconFeas = [];
        //console.log(incidentDataArr.length);
        //var incidentDetail = JSON.parse(docObj.GetVariable(0).text);
        $.each(incidentDataArr, function($key, incidentObj) {
            var vIconFea = drawINCIDENT_icon(incidentObj);
            if (incidentObj["news_arr"].length > 0) {
                for (var i = 0, news; news = incidentObj["news_arr"][i]; i++) {
                    if ((4 > QvOSM_MAP.getView().getZoom() && "Y" == news.newsMinLocYn) || 4 <= QvOSM_MAP.getView().getZoom()) {
                        var vIconFea = drawINCIDENT_icon(incidentObj);
                        //console.log(vIconFea);
                        vIconFeas.push(vIconFea);
                        break;
                    }
                }
            } else if (incidentObj["except_arr"].length > 0) {
                var vIconFea = drawINCIDENT_icon(incidentObj);
                vIconFeas.push(vIconFea);
            }
        });
        var vIconVector = new ol.source.Vector({
            features: vIconFeas
        });
        //console.log(vIconVector);
        incidentLayer = QvOSM_MAP.removeLayer(incidentLayer);
        //if(incidentLayer){incidentLayer.getSource().clear();}
        incidentLayer = new ol.layer.Vector({
            style: function(feature) {
                return feature.get('style');
            },
            source: vIconVector
        });
        incidentLayer.setZIndex(200);
        QvOSM_MAP.addLayer(incidentLayer);
    }

    $(".Document_TOP_LAYER").css("border-right", "1px solid #191919");
    $(".Document_TOP_LAYER").css("border-left", "1px solid #191919");
};
var drawPolygonText = function(style, name) {
    var styleObj;
    if ('zoomStyle' === style) {
        styleObj = {
            text: new ol.style.Text({
                text: name,
                scale: 2,
                offsetY: 10,
                offsetX: 50,
                stroke: new ol.style.Stroke({ color: "rgba(197, 62, 25, 1)", width: 0.5 }),
                fill: new ol.style.Fill({
                    color: "rgba(197, 62, 25, 1)"
                })
            })
        };
    } else {
        styleObj = {
            text: new ol.style.Text({
                text: name,
                scale: 0,
                offsetY: 0,
                offsetX: 30,
                stroke: new ol.style.Stroke({ color: "rgba(197, 62, 25, 1)", width: 0.5 }),
                fill: new ol.style.Fill({
                    color: "rgba(197, 62, 25, 1)"
                })
            })
        };
    }
    return new ol.style.Style(styleObj);
}
var drawPolygon = function() {
    //다각형 layer 제거
    for (var k = 0; k < polygonLayers.length; k++) {
        // 이미 그려진 다각형 layer가 있으면 제거
        QvOSM_MAP.removeLayer(polygonLayers[k]);
    }
    if (vPolygonArr.length > 0) { // 다각형 그릴 데이터 존재 시,
        var vPolygonFeas = [];
        // console.log( 'polygonLayers : ',polygonLayers );
        polygonLayers = [];
        for (var i = 0; i < vPolygonArr.length; i++) {
            var geoArr = JSON.parse(vPOLYGON[i].INCIDENT_POLYGON_LNGTD_LTITDE); // 위도, 경도 데이터는 여기서 계산
            var centerPointNum = parseInt(geoArr.length / 2);
            var geoCenterPoint = geoArr[centerPointNum];
            for (var j = 0; j < geoArr.length; j++) {
                // 태평양 건너가는 경우
                if (j > 0) {
                    if ((geoArr[j][0] * geoArr[j - 1][0] < 0) && geoArr[j][0] < 0) {
                        //if( Math.round( geoArr[j][0] ) * Math.round( geoArr[j-1][0] ) != 0 )
                        //geoArr[j][0] =    + geoArr[j][0];
                        var startPoint = geoArr[j - 1][0]; //+
                        var endPoint = geoArr[j][0]; //                                 
                        var cPoint = startPoint / 2 + (endPoint < 0 ? -90 : 90);
                        if (!(startPoint > cPoint && endPoint > cPoint) && !(startPoint < cPoint && endPoint < cPoint)) {
                            geoArr[j][0] = 360 + geoArr[j][0];
                        }
                    } else if ((geoArr[j][0] * geoArr[j - 1][0] < 0) && geoArr[j][0] > 0) {
                        //if( Math.round( geoArr[j][0] ) * Math.round( geoArr[j-1][0] ) != 0 )
                        //geoArr[j][0] = -360 + geoArr[j][0];
                        var startPoint = geoArr[j - 1][0]; //+
                        var endPoint = geoArr[j][0]; //                                 
                        var cPoint = startPoint / 2 + (endPoint < 0 ? -90 : 90);
                        if (!(startPoint > cPoint && endPoint > cPoint) && !(startPoint < cPoint && endPoint < cPoint)) {
                            geoArr[j][0] = -360 + geoArr[j][0];
                        }
                    }
                }
            }
            // layer가 인식할 좌표로 변경
            for (var k = 0; k < geoArr.length; k++) {
                geoArr[k] = ol.proj.fromLonLat(geoArr[k]);
            }
            /* polygon text 표시 feature */
            //drawPolygonText
            var polygonTextFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat(geoCenterPoint))
            });
            polygonTextFeature.set('style', drawPolygonText('style', vPOLYGON[i].POLYGON_NAME));
            polygonTextFeature.set('zoomStyle', drawPolygonText('zoomStyle', vPOLYGON[i].POLYGON_NAME));
            /* polygon 다각형 그리는 feature */
            var polygonStyle = [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({ // 선 스타일
                        color: 'rgba( 239,85,41, 1 )',
                        width: 3
                    }),
                    fill: new ol.style.Fill({ // 채울 스타일
                        color: 'rgba( 239,85,41, 0.3 )'
                    })
                }),
                new ol.style.Style({
                    geometry: function(feature) {
                        // return the coordinates of the first ring of the polygon
                        var coordinates = feature.getGeometry().getCoordinates()[0];
                        return new ol.geom.MultiPoint(coordinates);
                    }
                })
            ];
            var geojsonObject = {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:3857'
                    }
                },
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [geoArr] // 그려줄 좌표
                    }
                }]
            };
            var featuresArr = (new ol.format.GeoJSON()).readFeatures(geojsonObject);
            featuresArr[0].set('style', polygonStyle);
            featuresArr[0].set('sel_style', polygonStyle);
            /* polygon 다각형 그리는 layer */
            var polygonSource = new ol.source.Vector({
                features: featuresArr
            });
            var polygonLayer = new ol.layer.Vector({
                source: polygonSource,
                // style: polygonStyle
                style: function(feature) {
                    return feature.get('style');
                }
            });
            /* polygon text 표시 layer */
            var polygonTextFeatureSource = new ol.source.Vector({
                features: [polygonTextFeature]
            });
            var polygonTextLayer = new ol.layer.Vector({
                style: function(feature) {
                    if (QvOSM_MAP.getView().getZoom() < 5) {
                        return feature.get('style');
                    } else {
                        return feature.get('zoomStyle');
                    }
                },
                source: polygonTextFeatureSource,
                // style : polygonTextStyle
            });
            QvOSM_MAP.addLayer(polygonLayer);
            QvOSM_MAP.addLayer(polygonTextLayer);
            polygonLayers.push(polygonLayer);
            polygonLayers.push(polygonTextLayer);
        } //for end
    }
}
var createIncidentIcon = function(icon, rotation, scale, name, fontstyle, fontcolor) {
    var _font = fontstyle == null ? '10px Calibri,sans-serif' : fontstyle;
    var obj = {
        image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
            scale: scale ? scale : 1,
            src: QV_OSM_EX_URL + 'icon/' + icon + '.png',
            rotation: 0 //rotation ? rotation * Math.PI / 180 : 0
        })),
        text: new ol.style.Text({
            font: fontstyle,
            text: name ? name + "" : "",
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
var createIncidentIcon2 = function(icon, rotation, scale, name, fontstyle, fontcolor) {
    var _font = fontstyle == null ? '10px Calibri,sans-serif' : fontstyle;
    var obj = {
        image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
            scale: scale ? scale : 1,
            src: QV_OSM_EX_URL + 'icon/' + icon + '.png',
            rotation: 0 //rotation ? rotation * Math.PI / 180 : 0
        })),
        text: new ol.style.Text({
            font: fontstyle,
            textAlign: "left",
            text: name ? name + "" : "",
            offsetY: -10,
            offsetX: 18,
            overflow: true,
            fill: new ol.style.Fill({
                color: fontcolor ? fontcolor : '#000'
            }),
            stroke: new ol.style.Stroke({ color: "#333", width: 0.5 })
        })
    };
    var ret = new ol.style.Style(obj);
    ret.setZIndex(zIndex++);
    return ret;
}

function makeVesselLabel(feature) {


    var popupOpt = {};
    var viewtxt = feature.get("tyKey");
    var point = feature.get('point1');



    //console.log(feature);
    if (point) {
        if (point[0] < 0) {
            point[0] = point[0] + 360;
        }
        point = ol.proj.fromLonLat(point);

        var el = document.createElement("div");
        el.className = "vessel_name_box";
        el.style.color = "#000";
        el.innerHTML = viewtxt;
        el.setAttribute("target", feature.get('tyKey'));
        popupOpt = {
            element: el,
            //offset: [30, 0],
            offset: [-60, 30],
            position: point,
            positioning: "center-left",
            autoPan: false
        }



    }
    var overlay = new ol.Overlay(popupOpt)
    //console,log(overlay);
    vesselLabelOverlay.push(overlay);
    return overlay;
}

function getroutepathCoord(datarow) {
    var route_arr = [];
    var data = JSON.parse(datarow);

    for (var i = 0; i < data.length; i++) {
        route_arr.push(data[i]);
    }

    return route_arr;
}

function getroutepathCoordstyle(datarow, indata) {
    var route_arr = [];
    var data = datarow;

    for (var i = 0; i < data; i++) {

        route_arr.push(indata);

    }


    return route_arr;
}

function getroutepathCoord2(datarow) {
    var route_arr = [];

    //console.log(datarow);
    for (var i = 0; i < datarow.length - 1; i++) {

        if ((datarow[i][0] + datarow[i + 1][0]) < -200) {
            //console.log(datarow[i][0],datarow[i+1][0]);
            datarow[i][0] = datarow[i][0] + 360;
            if (i == (datarow.length - 2)) {
                datarow[i + 1][0] = datarow[i + 1][0] + 360;
            }
        } else {
            if (Math.abs(datarow[i][0] - datarow[(i + 1)][0]) > 200) {
                if (datarow[i][0] > 0 && datarow[(i + 1)][0] < 0) {
                    datarow[(i + 1)][0] = datarow[(i + 1)][0] + 360;
                } else if (datarow[i][0] < 0 && datarow[(i + 1)][0] > 0) {
                    datarow[i][0] = datarow[i][0] + 360;
                }

            }
        }
        if (i == (datarow.length - 2)) {
            route_arr.push(ol.proj.fromLonLat(datarow[i]));
            route_arr.push(ol.proj.fromLonLat(datarow[(i + 1)]));
        } else {
            route_arr.push(ol.proj.fromLonLat(datarow[i]));
        }


    }
    //console.log(route_arr);
    return route_arr;
}

function makerouteLabel(name, coord) {

    //console.log(name);
    //console.log(coord);
    var popupOpt = {};
    var viewtxt = name;
    var point;




    viewtxt = viewtxt.replace(/\(/gi, "(<span class='alert-red'>");
    viewtxt = viewtxt.replace(/\)/gi, "</span>)");


    if (coord) {
        point = ol.proj.fromLonLat(coord);

        var el = document.createElement("div");
        el.className = "route_time_box";
        el.style.color = "#a6cef4";
        el.innerHTML = viewtxt;

        popupOpt = {
            element: el,
            //offset: [30, 0],
            offset: [40, -10],
            position: coord,
            positioning: "center-left",
            autoPan: false
        }

        //var pixcelPoint = map.getPixelFromCoordinate(point);
        //popupPosition.push(pixcelPoint);

    }
    //console,log(popupOpt);
    var overlay = new ol.Overlay(popupOpt)
    routeOverlay.push(overlay);
    return overlay;
}
var routeDraw = function() {
    try {
        console.log('in');
        /*
            데이터 만들어야 할것
            1. 라우트 정보
            2. 포트 정보
            3. 마커 정보
            4. 운송 정보
        */

        //if(!vPATH_VALUE.length) return;
        var vPATH_VALUELength = vPATH_VALUE.length;
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
        var arcCoord = [];
        var arcCoordafter = [];
        var arcCoordLength;
        var point1, point2;
        var aniCoord = [];
        var arcCoordstyle = [];
        var arcCoordafterstyle = [];
        var aniCoordsLength;
        //test
        var testCenter = [];

        var j = 0;

        /*if (vPATH_VALUELength) {
            var vesselFeature = vesselLayer.getSource().getFeatures();
            for (var vFi = 0; vFi < vesselFeature.length; vFi++) {
                QvOSM_MAP.addOverlay(makeVesselLabel(vesselFeature[vFi]));
            }

        }*/

        //Feature 별 스타일 만들기, 함수로 만들어서 이름에 따라 아이콘 변경하기
        var styles = {
            'route_end_pol': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(0,176,240)',
                    width: 3

                })
            }),
            'route_end_ts3': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(255,192,0)',
                    width: 3

                })
            }),
            'route_end_ts2': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(102,255,51)',
                    width: 3

                })
            }),
            'route_end_ts1': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(255,153,255)',
                    width: 3

                })
            }),
            'route_ing_pol': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(0,176,240)',
                    lineCap: "round",
                    lineDash: [1, 4.8],
                    width: 3
                })
            }),
            'route_ing_ts3': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(255,192,0)',
                    lineCap: "round",
                    lineDash: [1, 4.8],
                    width: 3
                })
            }),
            'route_ing_ts2': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(102,255,51)',
                    lineCap: "round",
                    lineDash: [1, 4.8],
                    width: 3
                })
            }),
            'route_ing_ts1': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(255,153,255)',
                    lineCap: "round",
                    lineDash: [1, 4.8],
                    width: 3
                })
            }),
            'icon': new ol.style.Style({
                image: new ol.style.Icon({
                    //anchor: [0.5, 1],
                    scale: 0.6,
                    src: QV_OSM_EX_URL + "icon/spot.png"
                }),
                zIndex: 9999
            }),
            'exception': new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [1.5, 3],
                    scale: 0.6,
                    src: QV_OSM_EX_URL + "icon/notice.png"
                }),
                zIndex: 9999
            }),
            'marker': function(feature) {
                var step = feature.get("step").toLowerCase();
                var name = feature.get("name");
                var delay = feature.get("delay");
                if (delay) {
                    step = step + "_" + delay;
                }

                //console.log(name);
                var style = new ol.style.Style({
                    image: new ol.style.Icon({
                        opacity: 1,
                        anchor: [0.5, 1],
                        scale: 0.8,


                        src: QV_OSM_EX_URL + "icon/maker_" + step + ".png",

                    }),
                    text: new ol.style.Text({
                        text: name,
                        scale: 1,
                        offsetY: 10,
                        offsetX: 0,
                        stroke: new ol.style.Stroke({ color: "#333", width: 0.5 }),
                        fill: new ol.style.Fill({
                            color: '#eee'
                        })
                    })
                });



                return style;
            },
            'trans': function(feature) {

                var mode = feature.get("mode").toLowerCase();
                var ex = ".png";
                var anc = (feature.get("isTemp")) ? [0.5, 0.5] : [0.5, 2];
                var style = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: anc,
                        scale: 0.6,
                        src: QV_OSM_EX_URL + "icon/method_" + mode + ex
                    })
                });
                return style;
            },
            'geoMarker': new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    snapToPixel: false,
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({
                        color: 'white',
                        width: 2
                    })
                })
            })
        };


        aniZoomFlag = false;
        console.log('vPATH_VALUE', vPATH_VALUE);
        for (i = 0; i < vPATH_VALUELength; i++) {
            if (i == 0) {
                vPATH_VALUE[i].XY = vPATH_VALUE[i].XY.split(",");
                vPATH_VALUE[i].XY[0] = parseFloat(vPATH_VALUE[i].XY[0]);
                vPATH_VALUE[i].XY[1] = parseFloat(vPATH_VALUE[i].XY[1]);
            }
            arcCoord = [];
            arcCoordafter = [];
            point1 = vPATH_VALUE[i].XY;
            var step = vPATH_VALUE[i].STEP.toLowerCase();
            if (step.indexOf('pod') > -1) { step = 'pod' }
            console.log('step', step);

            //1. route feature 만들기
            if (i < vPATH_VALUELength - 1) {
                vPATH_VALUE[i + 1].XY = vPATH_VALUE[i + 1].XY.split(",");
                vPATH_VALUE[i + 1].XY[0] = parseFloat(vPATH_VALUE[i + 1].XY[0]);
                vPATH_VALUE[i + 1].XY[1] = parseFloat(vPATH_VALUE[i + 1].XY[1]);
                point2 = vPATH_VALUE[i + 1].XY;
                if (vPATH_VALUE[i].ROUTE != "") {
                    arcCoord = getroutepathCoord(vPATH_VALUE[i].ROUTE);
                    if (vPATH_VALUE[i].STATUS == "D") {
                        arcCoordstyle = getroutepathCoordstyle(arcCoord.length, "D");
                    } else {
                        arcCoordstyle = getroutepathCoordstyle(arcCoord.length, "N");
                    }

                    arcCoord.unshift(point1);
                    if (i < vPATH_VALUELength && vPATH_VALUE[i + 1].ROUTE != "") {
                        arcCoord.push(point2);
                        arcCoordstyle.push(vPATH_VALUE[i + 1].STATUS);
                    }
                    console.log('arcCoord', arcCoord);
                    arcCoord = getroutepathCoord2(arcCoord);

                    arcCoordstyle.unshift(vPATH_VALUE[i].STATUS);
                }
                if (vPATH_VALUE[i].ROUTE_EXP != "") {
                    arcCoordafter = getroutepathCoord(vPATH_VALUE[i].ROUTE_EXP);
                    arcCoordafter = getroutepathCoord2(arcCoordafter);
                    console.log('arcCoordafter', arcCoordafter);
                }


                //좌표들이 있으면
                if (arcCoord.length > 1) {
                    arcCoordLength = arcCoord.length - 1;

                    //4.운송수단 feature 만들기

                    //애니메이션 좌표는 따로 저장
                    /*if (vPATH_VALUE[i]["STATUS"] === "D" && vPATH_VALUE[i + 1]["STATUS"] === "N") {
                        aniCoord = arcCoord.slice(0);

                        //마지막 조금 남아있다 처음으로 돌아가기
                        for (var ai = 0; ai < 30; ai++) {
                            aniCoord.push(aniCoord[arcCoordLength]);
                        }

                    } else {}*/

                    //멀티라인 좌표로 만들기
                    for (j = 0; j < arcCoordLength; j++) {
                        //                  /* 곡선 표현시 해당 로직추가

                        //if(arcCoord[j][0] > 179 && arcCoord[j+1][0] < -179 ){
                        //    continue;
                        //}
                        var lineCoord = [];
                        lineCoord.push([arcCoord[j], arcCoord[j + 1]]);

                        if (arcCoordstyle[j + 1] == "N") {

                            routeFea.push(
                                new ol.Feature({
                                    type: 'route_ing_' + step,
                                    geometry: new ol.geom.MultiLineString(lineCoord)
                                })
                            );
                        } else {
                            routeFea.push(
                                new ol.Feature({
                                    type: 'route_end_' + step,
                                    geometry: new ol.geom.MultiLineString(lineCoord)
                                })
                            );
                        }



                    }
                }
                for (j = 0; j < arcCoordafter.length - 1; j++) {
                    //                  /* 곡선 표현시 해당 로직추가

                    //if(arcCoord[j][0] > 179 && arcCoord[j+1][0] < -179 ){
                    //    continue;
                    //}
                    var lineCoord = [];
                    lineCoord.push([arcCoordafter[j], arcCoordafter[j + 1]]);

                    routeFea.push(
                        new ol.Feature({
                            type: 'route_ing_' + step,
                            geometry: new ol.geom.MultiLineString(lineCoord)
                        })
                    );
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
                    step: vPATH_VALUE[i]["STEP"],
                    name: vPATH_VALUE[i]["PORT_CD"],
                    delay: vPATH_VALUE[i]["DELAY_ICON"],
                    geometry: new ol.geom.Point(point1)
                })
            );
            //console.log(point1);
            /*var overlay = makerouteLabel(vPATH_VALUE[i]["DISP_DATE"], point1);
        overlayList.push(overlay);
        QvOSM_MAP.addOverlay(overlay);
*/
            //4.운송정보는 route에서 같이 만듦;

            //5.exception feature 만들기
            if (vPATH_VALUE[i]["IRRE"]) {
                excepFea.push(
                    new ol.Feature({
                        type: 'exception',
                        //step : vPATH_VALUE[i]["STEP"],
                        geometry: new ol.geom.Point(point1)
                    })
                );
            }

        }

        console.log(routeFea);
        var allFeatures = routeFea.concat(transFea, excepFea, testCenter);

        routeLayer = QvOSM_MAP.removeLayer(routeLayer);
        routeLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: allFeatures
            }),
            style: function(feature) {
                //console.log(feature.get('type'));
                // hide geoMarker if animation is active
                //if (animating && feature.get('type') === 'geoMarker') {
                //  return null;
                //}
                var type = feature.get('type');
                if (animating && type === 'trans') {
                    return null;
                }
                if (type === 'marker' || type === 'trans') {
                    return styles[type](feature);
                }

                return styles[type];
            }
        });
        routeLayer.setZIndex(1201);
        QvOSM_MAP.addLayer(routeLayer);
        routeZoom = true;
        vesselZoom = 2
        //vesselLayer.changed();


        var extent = routeLayer.getSource().getExtent();
        console.log('extent', extent);


        //QvOSM_MAP.getView().fit(extent, QvOSM_MAP.getSize(), { padding: [50, 20, 50, 20] });

    } catch (e) { console.log(e); }
}

function makePortLabel(name, coord) {
    var popupOpt = {};
    var viewtxt = name;
    var point;

    viewtxt = viewtxt.replace(/\(/gi, "(<span class='alert-red'>");
    viewtxt = viewtxt.replace(/\)/gi, "</span>)");

    if (coord) {
        point = ol.proj.fromLonLat(coord);

        var el = document.createElement("div");
        el.className = "port_inout_box";
        el.style.color = "#fff";
        el.innerHTML = viewtxt;

        popupOpt = {
            element: el,
            offset: [20, -5],
            position: coord,
            positioning: "top-left",
            autoPan: false
        }

    }
    //console,log(popupOpt);
    var overlay = new ol.Overlay(popupOpt)
    routeOverlay.push(overlay);
    return overlay;
}

let drawPort = function() {
    let portFeas = [];

    let portFeasStyles = {
        'blueCrcl': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 9,
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: '#3399CC'
                })
            })
        })
    };


    portDataArr.forEach(function(portData) {
        let portPoint = ol.proj.fromLonLat([portData.portLngtd, portData.portLtitde]);
        portFeas.push(
            new ol.Feature({
                ref: 'port',
                portInout: portData.portInout,
                type: 'blueCrcl',
                geometry: new ol.geom.Point(portPoint)
            })
        );
    });


    portLayer = QvOSM_MAP.removeLayer(portLayer);
    portLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: portFeas
        }),
        style: function(feature) {
            var type = feature.get('type');
            return portFeasStyles[type];
        }
    });
    portLayer.setZIndex(1202);
    QvOSM_MAP.addLayer(portLayer);
}

let drawNoti = function() {
    let notiFeas = [];
    let featureDataArr = [];

    notiPortDataArr.forEach(function(notiData) {
        let notiPoint = ol.proj.fromLonLat([notiData.notiPortLngtd, notiData.notiPortLtitde]);
        let indx = featureDataArr.map(function(d) { return d.notiPoint; }).indexOf(notiPoint);
        if (indx > -1) {
            featureDataArr[indx].text += "<br/>";
            featureDataArr[indx].text += notiData.notiContent;
        } else {
            featureDataArr.push({
                text: notiData.notiContent,
                notiPoint: notiPoint
            });
        }
    });
    featureDataArr.forEach(function(featureData) {
        notiFeas.push(
            new ol.Feature({
                text: featureData.text,
                geometry: new ol.geom.Point(featureData.notiPoint)
            })
        );
    });

    notiLayer = QvOSM_MAP.removeLayer(notiLayer);
    notiLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: notiFeas
        }),
        style: function(feature) {
            let text = feature.get('text');
            let style = new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 0.7,
                    //offset: [0,30],
                    size: [50, 140],
                    offsetOrigin: 'bottom-right',
                    src: QV_OSM_EX_URL + "icon/alert_bell.png"
                }),
                zIndex: 9999,
                text: new ol.style.Text({
                    font: 'bold 19px Calibri',
                    text: text.toString(),
                    offsetX: 20,
                    offsetY: 40,
                    textAlign: 'left',
                    //stroke: new ol.style.Stroke({ color: "#fff", width: 0.3 }),
                    fill: new ol.style.Fill({
                        color: '#FF0000'
                    })
                })
            });
            return style;
        }
    });
    notiLayer.setZIndex(1202);
    QvOSM_MAP.addLayer(notiLayer);
}


let setTyphoonData = function() {
    typhoonDataArr = [];
    vTYPHOON_LO_NEW.forEach(function(vTyphoonLoNew) {
        // console.log( this  );
        let obj = {
            name: vTyphoonLoNew["VSL_NAME_TYP"],
            key_typhoon: vTyphoonLoNew["KEY_TYPHOON_TYP"],
            vsl_name: vTyphoonLoNew["VSL_NAME_TYP"],
            latest_yn: vTyphoonLoNew["LATEST_YN_TYP"],
            local_dt_tthh: vTyphoonLoNew["LOCAL_DT_TTHH_TYP"],
            rout_seq: vTyphoonLoNew["ROUT_SEQ_TYP"],
            local_dt: vTyphoonLoNew["LOCAL_DT_TYP"],
            ltitde: (vTyphoonLoNew && $.isNumeric(vTyphoonLoNew["LTITDE_TYP"])) ? parseFloat(vTyphoonLoNew["LTITDE_TYP"]) : "-", //위도
            lngtd: (vTyphoonLoNew && $.isNumeric(vTyphoonLoNew["LNGTD_TYP"])) ? parseFloat(vTyphoonLoNew["LNGTD_TYP"]) : "-", //경도
            direction: vTyphoonLoNew["DIRECTION_TYP"],
            max_windspeed: parseInt(vTyphoonLoNew["MAX_WINDSPEED_TYP"]),
            gust: vTyphoonLoNew["GUST_TYP"],
            radius: JSON.parse(vTyphoonLoNew["RADIUS_TYP"]),
            curr_yn: vTyphoonLoNew["CURR_YN_TYP"],
            play_yn: vTyphoonLoNew["PLAY_YN_TYP"],
            typn_seq: vTyphoonLoNew["TYPN_SEQ"],
            typn_icon: vTyphoonLoNew["TYPN_ICON_TYP"],
            desc: vTyphoonLoNew["DESC_TYP"],
            is_curr: vTyphoonLoNew["LAST_YN_TYP"],
            create_year: vTyphoonLoNew["CRT_YY_TYP"]
        }
        typhoonDataArr.push(obj);
    });
}

let setVesselData = function() {
    vesselDataArr = [];
    vVESSEL_CURR_LOC.forEach(function(vVesselCurrLoc) {
        let type = (vVesselCurrLoc["GUBUN_VT"]) ? vVesselCurrLoc["GUBUN_VT"] : "-";

        if (type === "VESSEL") {
            let inout = (vVesselCurrLoc["INOUT_IMG_NO"]) ? vVesselCurrLoc["INOUT_IMG_NO"] : "-";
            inout = inout.replace("BROKEN", "MOVING");
            inout = inout.replace("NOTMOVING", "MOVING");
            inout = inout.replace("MOVING", "MOVING");
            inout = inout.replace("Gray", "MOVING");
            let vesselObj = {
                name: (vVesselCurrLoc["KEY_TYPHOON"]) ? vVesselCurrLoc["KEY_TYPHOON"] : "-",
                point: [parseFloat((vVesselCurrLoc["LNGTD"]) ? vVesselCurrLoc["LNGTD"] : "0"), parseFloat((vVesselCurrLoc["LTITDE"]) ? vVesselCurrLoc["LTITDE"] : "0")],
                direction: (vVesselCurrLoc["DIRECTION"]) ? vVesselCurrLoc["DIRECTION"].text : "0",
                inout: inout,
                popup: (vVesselCurrLoc["DESCRIPT"]) ? vVesselCurrLoc["DESCRIPT"] : "-",
                mmsi: (vVesselCurrLoc["MMSI_NO"]) ? vVesselCurrLoc["MMSI_NO"] : "0",
                aniYN: "Y"
            };
            vesselDataArr.push(vesselObj);
        }
    });
}

let setIncidentDataArr = function() {
    incidentDataArr = [];
    $.each(vINCIDENT, function(indx, vIncident) {
        let lngtd = (vIncident["INCI_LNGTD"] && $.isNumeric(vIncident["INCI_LNGTD"])) ? parseFloat(vIncident["INCI_LNGTD"]) : "-"; //경도
        if (lngtd == "-") return true;

        let ltitde = (vIncident["INCI_LTITDE"] && $.isNumeric(vIncident["INCI_LTITDE"])) ? parseFloat(vIncident["INCI_LTITDE"]) : "-"; //위도
        if (ltitde == "-") return true;

        let except_cnt = (vIncident["INCIDENT_TYPE2"] && $.isNumeric(vIncident["INCI_EXCT_CNT"])) ? parseInt(vIncident["INCI_EXCT_CNT"]) : 0; //exception 갯수
        let news_cnt = (vIncident["INCI_EXCT_CNT"] && $.isNumeric(vIncident["INCI_NEWS_CNT"])) ? parseInt(vIncident["INCI_NEWS_CNT"]) : 0; //news 갯수
        if (news_cnt == 0 && except_cnt == 0) return true;


        let type, icon, color;

        if (news_cnt > 0 && except_cnt > 0) {
            type = "mixed";
            icon = "news_marker_n";
            color = "#ed7d31";
        } else if (news_cnt > 0 && except_cnt == 0) {
            type = "news";
            color = "#ed7d31";
            if (news_cnt > 1) {
                icon = "news_marker_n";
            } else {
                icon = "news_marker";
            }
        } else if (news_cnt == 0 && except_cnt > 0) {
            type = "except";
            color = "#eb4e8d";
            if (except_cnt > 1) {
                icon = "except_marker_n";
            } else {
                icon = "except_marker";
            }
        } else {
            type = "none";
            icon = "news_marker";
            color = "#ed7d31"
        }

        let incidentObj = {
            type: type,
            lngtd: lngtd,
            ltitde: ltitde,
            icon: icon,
            color: color,
            loc_nm: (vIncident["INCI_LOC_NM"]) ? vIncident["INCI_LOC_NM"] : "",
            pos: [lngtd, ltitde],
            incident_type2: (vIncident["INCIDENT_TYPE2"]) ? vIncident["INCIDENT_TYPE2"] : "",
            news_cnt: news_cnt,
            total_cnt: news_cnt + except_cnt,
            except_cnt: except_cnt,
            news_arr: [],
            except_arr: [],
            excp_cd: 'EXE_' + vIncident["INCI_EXCP_CD"]
        };

        incidentDataArr.push(incidentObj);
    });
}

let setPortData = function() {
    portDataArr = [];
    $.each(vPORT, function(indx, vPort) {
        let portLngtd = (vPort["PORT_LNGTD"] && $.isNumeric(vPort["PORT_LNGTD"])) ? parseFloat(vPort["PORT_LNGTD"]) : "-"; //경도
        if (portLngtd == "-") return true;

        let portLtitde = (vPort["PORT_LTITDE"] && $.isNumeric(vPort["PORT_LTITDE"])) ? parseFloat(vPort["PORT_LTITDE"]) : "-"; //위도
        if (portLtitde == "-") return true;

        let obj = {
            portLngtd: portLngtd,
            portLtitde: portLtitde,
            ref: "port",
            portInout: vPort["PORT_INOUT"]
        }
        portDataArr.push(obj);
    });
}

let setNotiPortData = function() {
    notiPortDataArr = [];
    $.each(vNOTI_PORT, function(indx, vNotiPort) {
        let notiPortLngtd = (vNotiPort["NOTI_PORT_LNGTD"] && $.isNumeric(vNotiPort["NOTI_PORT_LNGTD"])) ? parseFloat(vNotiPort["NOTI_PORT_LNGTD"]) : "-"; //경도
        if (notiPortLngtd == "-") return true;

        let notiPortLtitde = (vNotiPort["NOTI_PORT_LTITDE"] && $.isNumeric(vNotiPort["NOTI_PORT_LTITDE"])) ? parseFloat(vNotiPort["NOTI_PORT_LTITDE"]) : "-"; //위도
        if (notiPortLtitde == "-") return true;

        let obj = {
            notiPortLngtd: notiPortLngtd,
            notiPortLtitde: notiPortLtitde,
            notiPortCd: vNotiPort["NOTI_PORT_CD"],
            notiContent: vNotiPort["NOTI_CONTENT"]
        }
        notiPortDataArr.push(obj);
    });
}

let setClickCoordValue = function(coordinate) {
    let coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    let mapPositions = $("#map_position_append").text();
    let mapPositionArr = mapPositions.split("\n");
    mapPositions = "";
    if (mapPositionArr.length > 4) {
        delete mapPositionArr[0];
        mapPositionArr = $.grep(mapPositionArr, function(n) { return (n) });
    }
    $.each(mapPositionArr, function($k, $v) {
        mapPositions += mapPositions == "" ? $v : "\n" + $v;
    });
    mapPositions += mapPositions == "" ? "[ " + coord[1].toFixed(6) + " , " + coord[0].toFixed(6) + " ]" : "\n" + "[ " + coord[1].toFixed(6) + " , " + coord[0].toFixed(6) + " ]";
    $("#map_position_append").text(mapPositions);
}

let fn_popupClose = function() {
    $("#pointPopup_incident").hide();
    $("#pointPopup_weather").hide();
    $("#pointPopup_vessel").hide();
}

let showVesselPopup = function(currPopup, info) {
    $("#pointPopup_vessel .ol-popup-headtitle-content").html("");
    $("#pointPopup_vessel .ol-popup-title-content").text(info.get("tyKey") ? info.get("tyKey") : info.get("ref")["vsl_name"]);
    $("#pointPopup_vessel .ol-popup-title-content").off("click").on("click", function() {
        fn_popupClose();
    });
    $("#pointPopup_vessel #vessel_popup_content").html('<p class="popup_content" style="width:300px;word-break: break-all;">' + info.get("popup") ? info.get("popup") : info.get("ref")["popup"] + '</p>');
    $("#pointPopup_vessel .ol-popup-title-content").attr("def", info.get("type") ? info.get("type") : info.get("ref")["type"]);
    $("#pointPopup_vessel .ol-popup .popup_content").attr("def", info.get("type") ? info.get("type") : info.get("ref")["type"]);

    //setClosePopupEvt(currPopup);
    //QvOSM_MAP.addOverlay(currPopup);
    currPopup.setPosition(coordinate);
    $("#pointPopup_vessel").show();
}
let showIncidentPopup = function(currPopup, info) {
    let incidentPopupObj = {};
    var $info = info.get("ref") != null ? info.get("ref") : null;
    if ($info != null) {
        incidentPopupObj = {
            type: "news",
            lngtd: $info["lngtd"],
            ltitde: $info["ltitde"],
            incident_type1: $info["incident_type1"],
            incident_type2: $info["incident_type2"],
            news_arr: $info["news_arr"] ? $info["news_arr"] : new Array(),
            except_arr: $info["except_arr"] ? $info["except_arr"] : new Array()
        }
    } else {
        incidentPopupObj = {
            type: "news",
            lngtd: info.get("lngtd"),
            ltitde: info.get("ltitde"),
            incident_type1: info.get("incident_type1"),
            incident_type2: info.get("incident_type2"),
            news_arr: info.get("news_arr") ? info.get("news_arr") : new Array(),
            except_arr: info.get("except_arr") ? info.get("except_arr") : new Array()
        }
    }
    console.log('incidentPopupObj', incidentPopupObj);
    $("#pointPopup_incident").attr("type", "");
    $("#pointPopup_incident .ol-popup-title").attr("type", "");
    $("#pointPopup_incident").attr("idx", "-1");
    $("#pointPopup_incident .ol-popup-headtitle-content").attr("title", "");
    $("#pointPopup_incident .ol-popup-headtitle-content").html("");
    $("#pointPopup_incident #disp_step").html("");
    $("#pointPopup_incident #incident_popup_content").empty();

    let btn_next = function($data) {
        // console.log($data);
        var $type = $("#pointPopup_incident").attr("type") != "" ? $("#pointPopup_incident").attr("type") : $data["type"];
        var $idx = $("#pointPopup_incident").attr("idx");
        var $next_idx = parseInt($idx) + 1;
        var $direction = $("#pointPopup_incident").attr("prev") == 1 ? "prev" : "next";
        var $count = 0;
        var $totalcount = $data["news_arr"].length + $data["except_arr"].length;
        if ($direction == "prev") {
            if ($type == "news" && $next_idx == 1) {
                // console.log("news prev");
                if ($data["except_arr"].length > 0) {
                    $type = "except";
                    $idx = $data["except_arr"].length - 1;
                    $next_idx = $idx;
                } else {
                    $idx = $data["news_arr"].length - 1;
                    $next_idx = $idx;
                }
            } else if ($type == "except" && $next_idx == 1) {
                // console.log("except prev");
                if ($data["news_arr"].length > 0) {
                    $type = "news";
                    $idx = $data["news_arr"].length - 1;
                    $next_idx = $idx;
                } else {
                    $idx = $data["except_arr"].length - 1;
                    $next_idx = $idx;
                }
            } else {
                $next_idx = parseInt($idx) - 1;
            }
            // console.log("direction :: "+$direction+" , "+$("#pointPopup_incident").attr("prev"));
            // console.log("news_arr length :: "+$data["news_arr"].length);
            // console.log("except_arr length :: "+$data["except_arr"].length);
        } else {
            if ($type == "news" && $next_idx == $data["news_arr"].length) {
                // console.log("news next");
                if ($data["except_arr"].length > 0) {
                    $type = "except";
                }
                $idx = 0;
                $next_idx = 0;
            } else if ($type == "except" && $next_idx == $data["except_arr"].length) {
                // console.log("except next");
                if ($data["news_arr"].length > 0) {
                    $type = "news";
                }
                $idx = 0;
                $next_idx = 0;
            } else {
                $next_idx = parseInt($idx) + 1;
            }
        }
        // console.log("type :: "+$type);
        // console.log("next_idx :: "+$next_idx);
        //초기 팝업 출력일 경우
        if ($idx == -1) {
            $idx = 0;
            $next_idx = 0;
        }
        if ($type == "mixed") {
            $type = "news";
        }
        var $curr_idx = $type == "except" ? ($data["news_arr"].length + $next_idx + 1) : ($next_idx + 1);
        var $curr_data;
        if ($type == "news") {
            $curr_data = $data["news_arr"][$next_idx];
            $count = $data["news_arr"].length;
        } else {
            $curr_data = $data["except_arr"][$next_idx];
            $count = $data["except_arr"].length;
        }
        $("#pointPopup_incident").attr("idx", $next_idx);
        $("#pointPopup_incident").attr("totalcount", $totalcount);
        if ($totalcount > 1) $("#pointPopup_incident #disp_step").html($curr_idx + " of " + $totalcount);
        else $("#pointPopup_incident #disp_step").html("");
        $("#pointPopup_incident").attr("type", $curr_data["type"]);
        $("#pointPopup_incident .ol-popup-title").attr("type", $curr_data["type"]);
        $("#pointPopup_incident .ol-popup-headtitle-content").attr("title", $curr_data["excp_nm"]);
        $("#pointPopup_incident .ol-popup-headtitle-content").html($curr_data["excp_nm"]);
        var str = "<table style='width:580px;'>\
                                        \<tr><td>\
                                            \<div class='occur_dt' style='float:left;'></div>\
                                            \<div class='location_icon' style='float:right;'><img style='height:20px;' src='" + QV_OSM_EX_URL + "icon/location_50.png' /></div>\
                                            \<div class='location' style='float:right;'></div>\
                                        \</td></tr>\
                                        \<tr><td><div class='valid_dt'></div></td></tr>\
                                        \<tr><td><div class='source'></div></td></tr>\
                                        \<tr><td><div class='container_cnt'></div></td></tr>\
                                        \<tr><td></br></td></tr>\
                                        \<tr><td><div class='title'></div></td></tr>\
                                        \<tr><td></br></td></tr>\
                                        \<tr><td><div class='cont'></div></td></tr>\
                                    \</table>";
        $("#pointPopup_incident #incident_popup_content").html(str);
        var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
        var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
        $("#pointPopup_incident #incidnet_popup_content .occur_dt").html("Created on : " + ocdt);
        $("#pointPopup_incident #incident_popup_content .location").html($curr_data["loc_nm"]);
        $("#pointPopup_incident #incident_popup_content .title").html($curr_data["title"]);
        $("#pointPopup_incident #incident_popup_content .source").html("Source : " + $curr_data["source"]);
        $("#pointPopup_incident #incident_popup_content .valid_dt").html("Valid until : " + vdt);
        //                              $("#pointPopup_incident #incident_popup_content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially Affected Cargos : "+$curr_data["container_cnt"]+" container(s)" : ""));
        $("#pointPopup_incident #incident_popup_content .container_cnt").css("cursor", "").css("text-decoration", "").off("click");

        var $contents_arr = $curr_data["cont"].split("[read more](");
        // console.log($contents_arr);
        var $contents = $contents_arr[0];
        var $read_more = "";
        try {
            if ($contents_arr[1] != null) {
                var $url = $.trim($contents_arr[1]).substr(0, $contents_arr[1].length - 1);
                $read_more = "<a href='" + $url + "' target=_blank>[read more]</a>";
            }
        } catch (e) {}
        $("#pointPopup_incident #incident_popup_content .cont").html($contents + $read_more);
        $("#pointPopup_incident #btn_next").show();
        $("#pointPopup_incident #btn_prev").show();
        if ($totalcount > 1) {
            $("#pointPopup_incident #btn_next").off("click").on("click", function() {
                $("#pointPopup_incident").attr("prev", 0);
                btn_next(incidentPopupObj);
            });
            $("#pointPopup_incident #btn_prev").off("click").on("click", function() {
                $("#pointPopup_incident").attr("prev", 1);
                btn_next(incidentPopupObj);
            });
        } else {
            $("#pointPopup_incident #btn_next").hide();
            $("#pointPopup_incident #btn_prev").hide();
        }
        currPopup.setPosition(coordinate);
        //$("#pointPopup_incident").draggable();
        $("#pointPopup_incident").height("");
        $("#pointPopup_incident").show();
        $("#Document_CH03").off("click").on("click", function() {
            $("#pointPopup_incident").hide();
            $("#ticker_pointPopup").hide();
        });
    }
    btn_next(incidentPopupObj);
}
let showWeatherPopup = function(currPopup, info) {
    $("#weather_popup_content").html('<p class="popup_content">' + info.get("popup") + '</p>');
    currPopup.setPosition(coordinate);
    $("#pointPopup_weather").show();
    //QvOSM_MAP.addOverlay(currPopup);
}

//grid click logic ============================================================================================ end
Qva.LoadCSS(QV_OSM_EX_URL + "css/Style.css");
Qva.LoadCSS(QV_OSM_EX_URL + "css/ol.css");
Qva.LoadCSS(QV_OSM_EX_URL + "css/bootstrap.min.css");
Qva.LoadScript(QV_OSM_EX_URL + "js/jquery.marquee.js", function() {
    Qva.LoadScript(QV_OSM_EX_URL + "js/d3.v3.min.js", function() {
        Qva.LoadScript(QV_OSM_EX_URL + "js/ol.js", function() {
            var drawMAP = function() {
                QvOSM_Opt = {
                    "zoom": zoom,
                    "center": center
                };
                var frmW = $target.GetWidth();
                var frmH = $target.GetHeight();
                var htmlString = "";
                htmlString += '<div id="' + qvObjectId + '" class="map" style="width:' + frmW + 'px;height:' + frmH + 'px;"></div>';
                htmlString += '<div id="map_position"></div>';
                htmlString += '<div id="map_position_append_wrap"><textarea id="map_position_append" readonly="readonly"></textarea></div>';
                htmlString += '<div id="pointPopup_incident" class="ol-popup incident" idx="-1" style="display:none;">\
                                \<div class="ol-popup-title">\
                                    \<div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div>\
                                    \<div class="ol-popup-title-content" style="float:right;color:#FFFFFF;">\
                                        \<span id="btn_prev">◀</span>\
                                        \<font id="disp_step" style="margin-left:2px;margin-right:2px;font-weight:normal;"></font>\
                                        \<span id="btn_next">▶</span>\
                                    \</div>\
                                \</div>\
                                \<a href="#" class="ol-popup-closer popup-closer" style="cursor:pointer;display:none;"></a>\
                                \<div id="incident_popup_content"></div>\
                            \</div>';
                htmlString += '<div id="pointPopup_weather" class="ol-popup" idx="-1">\
                                \<a href="#" class="ol-popup-closer2 popup-closer" style="cursor:pointer;"></a>\
                                \<div id="weather_popup_content"></div>\
                            \</div>';
                htmlString += '<div id="pointPopup_vessel" class="ol-popup vessel">\
                                \<div class="ol-popup-title">\
                                    \<span class="ol-popup-headtitle-content" style="color:#FFFFFF;"></span>\
                                    \<span class="ol-popup-title-content" style="color:#FFFFFF;"></span>\
                                \</div>\
                                \<a href="#" class="ol-popup-closer popup-closer" style="cursor:pointer;"></a>\
                                \<div id="vessel_popup_content" style="white-space:pre-line;"></div>\
                            \</div>';
                htmlString += '<div id="tooltip"></div>';
                htmlString += '<div id="geo-marker"></div>';
                $target.Element.innerHTML = htmlString;

                //좌표 보여주는 로직
                $("#map_position").off("mouseover").on("mouseover", function() {
                    $("#map_position_append_wrap").show()
                });
                $("#map_position_append_wrap").off("mouseout").on("mouseout", function() {
                    $("#map_position_append_wrap").hide()
                });

                let mapCenterConv;
                try {
                    const mapCenter = QvOSM_Opt["center"];

                    if (mapCenter) {
                        mapCenterConv = ol.proj.transform([parseFloat(mapCenter[0]), parseFloat(mapCenter[1])], 'EPSG:4326', 'EPSG:3857');
                    } else {
                        mapCenterConv = ol.proj.transform([127, 38], 'EPSG:4326', 'EPSG:3857');
                    }

                    if (firstCenter.length > 0) {
                        mapCenterConv = ol.proj.transform(firstCenter, 'EPSG:4326', 'EPSG:3857');
                    }
                } catch (e) {
                    console.log(e);
                }

                //전체 맵 그리기
                try {
                    QvOSM_MAP = new ol.Map({
                        layers: [new ol.layer.Tile({
                            visible: true,
                            source: new ol.source.XYZ({
                                tileSize: [512, 512],
                                url: MAP_TYPE_GROUP[vMAPTYPE]
                            })
                        })],
                        controls: ol.control.defaults().extend([
                            new ol.control.Zoom()
                        ]),
                        interactions: ol.interaction.defaults({ doubleClickZoom: false }),
                        target: qvObjectId,
                        view: new ol.View({
                            center: mapCenterConv,
                            zoom: QvOSM_Opt["zoom"] || 3,
                            minZoom: 2,
                            maxZoom: 17
                        })
                    });
                } catch (e) {
                    console.log(e);
                }
                //QvOSM_MAP.removeControl(ol.control.Zoom);
                $("#marker").html("");
                QvOSM_MAP.getOverlays().clear();
                var incidentPopup = new ol.Overlay({
                    element: document.getElementById("pointPopup_incident")
                });
                var weatherPopup = new ol.Overlay({
                    element: document.getElementById("pointPopup_weather")
                });
                var vesselPopup = new ol.Overlay({
                    element: document.getElementById("pointPopup_vessel")
                });
                QvOSM_MAP.addOverlay(incidentPopup);
                QvOSM_MAP.addOverlay(weatherPopup);
                QvOSM_MAP.addOverlay(vesselPopup);

                /* 선택 인터랙션 */
                var select = new ol.interaction.Select({
                    style: function(feature) {
                        return feature.get('sel_style') || feature.get('style');
                    }
                });
                //팝업위치 틀어짐 방지
                var _top = $("#pointPopup").css("top");
                var _left = $("#pointPopup").css("left");
                //QvOSM_MAP.getInteractions().extend([select]);
                QvOSM_MAP.addInteraction(select);
                QvOSM_MAP.un("dblclick");
                QvOSM_MAP.on("dblclick", function(evt) {
                    select.getFeatures().clear();
                    var info = QvOSM_MAP.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                        select.getFeatures().push(feature);
                        return feature;
                    });
                });
                //싱슬 클릭시 이벤트t
                QvOSM_MAP.un("singleclick");
                QvOSM_MAP.on("singleclick", function(evt) {
                    select.getFeatures().clear();

                    //좌표로직
                    coordinate = evt.coordinate;

                    setClickCoordValue(coordinate);
                    fn_popupClose();

                    QvOSM_MAP.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                        console.log(feature.get("type"));
                        select.getFeatures().push(feature);
                        $("#pointPopup_incident").hide();
                        //$(".popup-closer").trigger("click");

                        $(".popup-closer").off("click").on("click", function() {
                            fn_popupClose();
                            select.getFeatures().clear();
                        })

                        if (feature.get("type") == "vessel") {
                            showVesselPopup(vesselPopup, feature);
                        } else if (feature.get("type") == "news") { //(feature.get("type") || (feature.get("ref") && feature.get("ref")["type"] && 'route' != feature.get("ref")["type"])) {
                            showIncidentPopup(incidentPopup, feature);
                        } else if (feature.get("type") == "marker") { //(feature.get("type") || (feature.get("ref") && feature.get("ref")["type"] && 'route' != feature.get("ref")["type"])) {
                            showWeatherPopup(weatherPopup, feature);
                        } else if (feature.get("type") == "weather") {
                            showWeatherPopup(weatherPopup, feature);
                        } else {
                            $(".popup-closer").trigger("click");
                        }
                        return true;
                    });
                    /*$("#pointPopup").css("top", _top);
                    $("#pointPopup").css("left", _left);
                    $("#pointPopup").draggable();*/
                    if (vView_Risk == "N") {
                        if (info != null && info.get("ref") != null) {
                            if (info.get("ref")["loc_cd"] != null) {
                                Qv.GetCurrentDocument().SetVariable("vLOC_CD", info.get("ref")["loc_cd"]);
                            }
                        } else if (qvPassedValues["vLOC_CD"] != "") {
                            Qv.GetCurrentDocument().SetVariable("vLOC_CD", "");
                        }
                    }
                });
                // 툴팁
                var overlay = new ol.Overlay({
                    element: document.getElementById("tooltip"),
                    positioning: 'bottom-left',
                    offset: [20, 20]
                });
                overlay.setMap(QvOSM_MAP);

                var overlay2 = makePortLabel("blank", [0, 0]);
                overlay2.setMap(QvOSM_MAP);
                // 툴팁
                QvOSM_MAP.un("pointermove");
                QvOSM_MAP.on('pointermove', function(evt) {
                    select.getFeatures().clear();
                    var info = QvOSM_MAP.forEachFeatureAtPixel(evt.pixel, function(feature) {
                        return feature;
                    });
                    var coordinate = evt.coordinate;
                    var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                    $("#map_position").html("[ " + coord[1].toFixed(6) + " , " + coord[0].toFixed(6) + " ]");
                    if (info != null && info.get("ref") && info.get("ref")["tooltip"] || info != null && info.get("tooltip")) {
                        overlay2.getElement().style.display = 'none';
                        overlay.setPosition(evt.coordinate);
                        document.body.style.cursor = 'pointer';
                        overlay.getElement().innerHTML = info.get("tooltip") != null ? info.get("tooltip") : info.get("ref")["tooltip"];
                        overlay.getElement().style.display = 'inline-block';
                    } else if (info != null && info.get("ref") == "port") {
                        overlay.getElement().style.display = 'none';
                        overlay2.setPosition(evt.coordinate);
                        document.body.style.cursor = 'pointer';
                        overlay2.getElement().innerHTML = info.get("portInout");
                        overlay2.getElement().style.display = 'inline-block';
                    } else {
                        overlay.getElement().style.display = 'none';
                        overlay2.getElement().style.display = 'none';
                        document.body.style.cursor = '';
                    }
                });

                function onZoom(evt) {
                    var view = evt.target;
                    if (oldZoom == view.getZoom()) {} else if (view.getZoom() > 4) {
                        vesselZoom = 2
                        if (vesselLayer) vesselLayer.changed();
                    } else {
                        vesselZoom = 1
                        if (vesselLayer) vesselLayer.changed();
                    }
                    oldZoom = view.getZoom();
                }
                //console.log(vesselZoom);
                QvOSM_MAP.getView().on('propertychange', onZoom);
                oldMAPTYPE = vMAPTYPE;
            };
            var checknewzoom = function(evt) {
                var newZoomLevel = QvOSM_MAP.getView().getZoom();
                //console.log('currentZoomLevel',currentZoomLevel);
                //console.log('newZoomLevel',newZoomLevel);
                if (newZoomLevel != currentZoomLevel) {
                        clearTyphoonIcon();
                        showTyphoonIcon();
                    currentZoomLevel = newZoomLevel;
                }
            }
            Qva.AddExtension(EX_NAME, function() {
                console.log('vEXT_INTENSIVE', vEXT_INTENSIVE);
                $target = this;
                // CQV = Qv.GetDocument("");
                //Qv.GetCurrentDocument().binder.Set("Document.TabRow.Document\\MAIN", "action", "", true);
                //onload와 같은 기능 --------------------------------------시작
                var varsRetrieved = false;
                CQV.SetOnUpdateComplete(function() {
                    if (!varsRetrieved) {
                        IsChkCnt = 0;
                        if (vEXT_INTENSIVE.Data.Rows.length > 0) {
                            //console.log( 'vEXT_INTENSIVE : ', vEXT_INTENSIVE );
                            // GetVariable(0) : vRoute_YN
                            if (vEXT_INTENSIVE.GetVariable(0).text) {
                                try {
                                    //vRoute_YN
                                    if ('' != vEXT_INTENSIVE.GetVariable(0).text && null != vEXT_INTENSIVE.GetVariable(0).text) {
                                        vRoute_YN = vEXT_INTENSIVE.GetVariable(0).text;
                                    } else {
                                        vRoute_YN = 'N';
                                    }
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vRoute_YN data : ", e);
                                }
                            }
                            // // GetVariable(1) : vSHOW_NEWS
                            if (vEXT_INTENSIVE.GetVariable(1).text) {
                                try {

                                    if ('' != vEXT_INTENSIVE.GetVariable(1).text && null != vEXT_INTENSIVE.GetVariable(1).text) {
                                        vSHOW_NEWS = vEXT_INTENSIVE.GetVariable(1).text;
                                    } else {
                                        vSHOW_NEWS = 'N';
                                    }
                                    // console.log( 'vSHOW_NEWS : ', vSHOW_NEWS );
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vSHOW_NEWS data : ", e);
                                }
                            }
                            // // GetVariable(2) : vMAPTYPE
                            if (vEXT_INTENSIVE.GetVariable(2).text) {
                                try {
                                    if ('' != vEXT_INTENSIVE.GetVariable(2).text && null != vEXT_INTENSIVE.GetVariable(2).text) {
                                        vMAPTYPE = vEXT_INTENSIVE.GetVariable(2).text.toLowerCase();
                                    } else {
                                        vMAPTYPE = 'basic';
                                    }
                                    // console.log( 'vMAPTYPE : ', vMAPTYPE );
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vMAPTYPE data : ", e);
                                }
                            }
                            // // GetVariable(3) : vView_Risk
                            if (vEXT_INTENSIVE.GetVariable(3).text) {
                                try {
                                    if ('' != vEXT_INTENSIVE.GetVariable(3).text && null != vEXT_INTENSIVE.GetVariable(3).text) {
                                        vView_Risk = vEXT_INTENSIVE.GetVariable(3).text;
                                    } else {
                                        vSHOW_NEWS = 'N';
                                    }
                                    // console.log( 'vView_Risk : ', vView_Risk );
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vView_Risk data : ", e);
                                }
                            }
                            // // GetVariable(4) : vTYPHOON_LO_NEW
                            if (vEXT_INTENSIVE.GetVariable(4).text) {
                                try {
                                    // console.log( vEXT_INTENSIVE.GetVariable(4).text );
                                    if ('-' != vEXT_INTENSIVE.GetVariable(4).text && '' != vEXT_INTENSIVE.GetVariable(4).text && null != vEXT_INTENSIVE.GetVariable(4).text) {
                                        vTYPHOON_LO_NEW = JSON.parse(vEXT_INTENSIVE.GetVariable(4).text);
                                    } else {
                                        vTYPHOON_LO_NEW = [];
                                    }
                                    // console.log( 'vTYPHOON_LO_NEWvTYPHOON_LO_NEW : ', vTYPHOON_LO_NEW );
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vTYPHOON_LO_NEW data : ", e);
                                }
                            }
                            // // GetVariable(5) : vVESSEL_CURR_LOC
                            if (vEXT_INTENSIVE.GetVariable(5).text) {
                                try {
                                    //vVESSEL_OBJ = JSON.parse( vEXT_INTENSIVE.GetVariable(5).text );
                                    if ('-' != vEXT_INTENSIVE.GetVariable(5).text && '' != vEXT_INTENSIVE.GetVariable(5).text && null != vEXT_INTENSIVE.GetVariable(5).text) {
                                        vVESSEL_CURR_LOC = JSON.parse(vEXT_INTENSIVE.GetVariable(5).text);
                                    } else {
                                        vVESSEL_CURR_LOC = [];
                                    }
                                    // console.log( 'vVESSEL_CURR_LOC : ', vVESSEL_CURR_LOC );
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vVESSEL_CURR_LOC data : ", e);
                                }
                            }
                            // // GetVariable(6) : vINCIDENT
                            if (vEXT_INTENSIVE.GetVariable(6).text) {
                                try {
                                    //vINCIDENT_OBJ = JSON.parse( vEXT_INTENSIVE.GetVariable(6).text );
                                    if ('-' != vEXT_INTENSIVE.GetVariable(6).text && '' != vEXT_INTENSIVE.GetVariable(6).text && null != vEXT_INTENSIVE.GetVariable(6).text) {
                                        vINCIDENT = JSON.parse(vEXT_INTENSIVE.GetVariable(6).text);
                                    } else {
                                        vINCIDENT = [];
                                    }
                                    //console.log( 'vINCIDENT_OBJ : ', vINCIDENT_OBJ );
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vINCIDENT data : ", e);
                                }
                            }
                            // GetVariable(7) : vROUTE : ??
                            // GetVariable(8) : vPOLYGON : polygon(다각형) 그릴 데이터
                            if (vEXT_INTENSIVE.GetVariable(10).text) {
                                try {
                                    //vPOLYGON
                                    // console.log( '12 : ', vEXT_INTENSIVE.GetVariable(10).text );
                                    if ('-' != vEXT_INTENSIVE.GetVariable(10).text && '' != vEXT_INTENSIVE.GetVariable(10).text && null != vEXT_INTENSIVE.GetVariable(10).text) {
                                        vPOLYGON = JSON.parse(vEXT_INTENSIVE.GetVariable(10).text);
                                    } else {
                                        vPOLYGON = []; // 데이터가 없으면 담지 않는다.
                                    }
                                    // console.log( 'vPOLYGON : ', vPOLYGON );
                                    // console.log( 'vPOLYGON.length : ', vPOLYGON.length );
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vPOLYGON data : ", e);
                                }
                            }
                            if (vEXT_INTENSIVE.GetVariable(12).text) {
                                try {
                                    if ('-' != vEXT_INTENSIVE.GetVariable(12).text && '' != vEXT_INTENSIVE.GetVariable(12).text && null != vEXT_INTENSIVE.GetVariable(12).text) {
                                        vPATH = vEXT_INTENSIVE.GetVariable(12).text;
                                        console.log('vPATH', vPATH);
                                    } else {
                                        vPATH = []; // 데이터가 없으면 담지 않는다.
                                    }
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vPATH data : ", e);
                                }
                            } // GetVariable(13) : vPATH_VALUE 
                            if (vEXT_INTENSIVE.GetVariable(13).text) {
                                try {
                                    if ('-' != vEXT_INTENSIVE.GetVariable(13).text && '' != vEXT_INTENSIVE.GetVariable(13).text && null != vEXT_INTENSIVE.GetVariable(13).text) {
                                        vPATH_VALUE = JSON.parse(vEXT_INTENSIVE.GetVariable(13).text);
                                        console.log('vPATH_VALUE', vPATH_VALUE);
                                    } else {
                                        vPATH_VALUE = []; // 데이터가 없으면 담지 않는다.
                                    }
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vPATH_VALUE data : ", e);
                                }
                            } // GetVariable(17) : "vPORT" 
                            if (vEXT_INTENSIVE.GetVariable(17).text) {
                                try {
                                    if ('-' != vEXT_INTENSIVE.GetVariable(17).text && '' != vEXT_INTENSIVE.GetVariable(17).text && null != vEXT_INTENSIVE.GetVariable(17).text) {
                                        vPORT = JSON.parse(vEXT_INTENSIVE.GetVariable(17).text);
                                        console.log('vPORT', vPORT);
                                    } else {
                                        vPORT = []; // 데이터가 없으면 담지 않는다.
                                    }
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vPATH_VALUE data : ", e);
                                }
                            } // vNOTI_PORT
                            if (vEXT_INTENSIVE.GetVariable(18).text) {
                                try {
                                    if ('-' != vEXT_INTENSIVE.GetVariable(18).text && '' != vEXT_INTENSIVE.GetVariable(18).text && null != vEXT_INTENSIVE.GetVariable(18).text) {
                                        vNOTI_PORT = JSON.parse(vEXT_INTENSIVE.GetVariable(18).text);
                                        console.log('vNOTI_PORT', vNOTI_PORT);
                                    } else {
                                        vNOTI_PORT = []; // 데이터가 없으면 담지 않는다.
                                    }
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vPATH_VALUE data : ", e);
                                }
                            } //"vWeather_flag"
                            if (vEXT_INTENSIVE.GetVariable(19).text) {
                                try {
                                    if ('-' != vEXT_INTENSIVE.GetVariable(19).text && '' != vEXT_INTENSIVE.GetVariable(19).text && null != vEXT_INTENSIVE.GetVariable(19).text) {
                                        vWeather_flag = vEXT_INTENSIVE.GetVariable(19).text;
                                        console.log('vWeather_flag', vWeather_flag);
                                    } else {
                                        vWeather_flag = "N"; // 데이터가 없으면 담지 않는다.
                                    }
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vWeather_flag data : ", e);
                                }
                            }//"vBackbtn_flag"
							if (vEXT_INTENSIVE.GetVariable(20).text) {
                                try {
                                    if ('-' != vEXT_INTENSIVE.GetVariable(20).text && '' != vEXT_INTENSIVE.GetVariable(20).text && null != vEXT_INTENSIVE.GetVariable(20).text) {
                                        vBackbtn_flag = vEXT_INTENSIVE.GetVariable(20).text;
                                        console.log('vBackbtn_flag', vBackbtn_flag);
                                    } else {
                                        vBackbtn_flag = "N"; // 데이터가 없으면 담지 않는다.
                                    }
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log("can't get vBackbtn_flag data : ", e);
                                }
                            }
                        } else {
                            IsChkCnt++;
                            console.log('No Data..');
                        }
                        CQV.GetAllVariables(function(variables) {
                            //onload와 같은 기능 --------------------------------------시작
                            qvPassedValues = {};
                            $.each(variables, function($key, $value) {
                                qvPassedValues[$value["name"]] = $value["value"];
                            });
                            try {
                                /*if (vRoute_YN != null && vRoute_YN == "Y") {
                                    // GetVariable(7) : vROUTE
                                    if (vEXT_INTENSIVE.GetVariable(7).text) {
                                        try {
                                            if ('-' != vEXT_INTENSIVE.GetVariable(7).text && '' != vEXT_INTENSIVE.GetVariable(7).text && null != vEXT_INTENSIVE.GetVariable(7).text) {
                                                vROUTE = JSON.parse(vEXT_INTENSIVE.GetVariable(7).text);
                                            } else {
                                                vROUTE = [];
                                            }
                                            //vROUTE = JSON.parse( vEXT_INTENSIVE.GetVariable(7).text );
                                            // console.log( 'vROUTE : ', vROUTE );
                                        } catch (e) {
                                            IsChkCnt++;
                                            console.log("can't get vROUTE data : ", e);
                                        }
                                    }
                                }*/
                                // // GetVariable(8) : vNEWS
                                if (vEXT_INTENSIVE.GetVariable(8).text) {
                                    try {
                                        if ('-' != vEXT_INTENSIVE.GetVariable(8).text && '' != vEXT_INTENSIVE.GetVariable(8).text && null != vEXT_INTENSIVE.GetVariable(8).text) {
                                            vNEWS = JSON.parse(vEXT_INTENSIVE.GetVariable(8).text);
                                        } else {
                                            vNEWS = [];
                                        }
                                        //console.log( 'vNEWS : ', vNEWS );
                                    } catch (e) {
                                        IsChkCnt++;
                                        console.log("can't get vNEWS data : ", e);
                                    }
                                }
                                // // GetVariable(9) : vPORT_NEWS
                                if (vEXT_INTENSIVE.GetVariable(9).text) {
                                    try {
                                        //vPORT_NEWS = JSON.parse( vEXT_INTENSIVE.GetVariable(9).text );
                                        if ('-' != vEXT_INTENSIVE.GetVariable(9).text && '' != vEXT_INTENSIVE.GetVariable(9).text && null != vEXT_INTENSIVE.GetVariable(9).text) {
                                            //  console.log(vEXT_INTENSIVE.GetVariable(9).text );
                                            vPORT_NEWS = JSON.parse(vEXT_INTENSIVE.GetVariable(9).text);
                                        } else {
                                            vPORT_NEWS = [];
                                        }
                                        console.log('vPORT_NEWS : ', vPORT_NEWS);
                                    } catch (e) {
                                        IsChkCnt++;
                                        console.log("can't get vPORT_NEWS data : ", e);
                                    }
                                }

                                setTyphoonData();
                                setVesselData();
                                setIncidentDataArr();
                                setPortData();
                                setNotiPortData();

                                // console.log('incidentDataArr.length : ', incidentDataArr.length);
                                //exception 정보 정리
                                //console.log(vNEWS);
                                if (incidentDataArr.length > 0)
                                    $.each(vNEWS, function($key, $value) {
                                        var news_no = ($value["ID"]) ? $value["ID"] : "";
                                        var lngtd = ($value["NEWS_LNGTD"] && $.isNumeric($value["NEWS_LNGTD"])) ? parseFloat($value["NEWS_LNGTD"]) : "-"; //경도
                                        var ltitde = ($value["NEWS_LTITDE"] && $.isNumeric($value["NEWS_LTITDE"])) ? parseFloat($value["NEWS_LTITDE"]) : "-"; //위도
                                        var loc_nm = ($value["NEWS_ENG_LOC_NM"]) ? $value["NEWS_ENG_LOC_NM"] : ""; //명칭
                                        var title = ($value["SUBJECT"]) ? $value["SUBJECT"] : ""; //exception title
                                        var loc_nm2 = ($value["NEWS_ENG_LOC_NM_STR"]) ? $value["NEWS_ENG_LOC_NM_STR"] : ""; //발생도시
                                        var occur_dt = ($value["CRT_DT_LOC"]) ? $value["CRT_DT_LOC"] : ""; //발생일
                                        var source = ($value["SOURCE"]) ? $value["SOURCE"] : ""; //source
                                        var valid_dt = ($value["VALID_DT_LOC"]) ? $value["VALID_DT_LOC"] : ""; //valid_dt
                                        var cont = ($value["BODY"]) ? $value["BODY"] : ""; //cont
                                        var container_cnt = ($value["NEWS_CNTR_CNT"] && $.isNumeric($value["NEWS_CNTR_CNT"])) ? $value["NEWS_CNTR_CNT"] : ""; //container_cnt
                                        var crt_dt_loc_sort = ($value["CRT_DT_LOC_SORT"]) ? $value["CRT_DT_LOC_SORT"] : ""; //crt_dt_loc_sort ticker에서 날짜 정렬하기 위한 용도로 다른데 사용하지 않음.
                                        var excp_nm = ($value["NEWS_EXCP_NM"]) ? $value["NEWS_EXCP_NM"] : ""; //excp_nm
                                        var id = ($value["INCID_ID"]) ? $value["INCID_ID"] : ""; //id container_no를 통해 팝업을 보여주기 위한 키로 id + loc_cd로 이루어져야 unique 하다
                                        var excp_cd = ($value["NEWS_EXCP_CD"]) ? $value["NEWS_EXCP_CD"] : ""; //excp_cd
                                        var newsMinLocYn = ($value["NEWS_MIN_LOC_YN"]) ? $value["NEWS_MIN_LOC_YN"] : ""; //NEWS_MIN_LOC_YN
                                        //var incident_type1    = ($value[4])                                   ?   $value[4].text  :   "";//분류1
                                        //var incident_type2    = ($value[5])                                   ?   $value[5].text  :   "";//분류2
                                        //var category      = ($value[14])                                  ?   $value[14].text :   "";//category
                                        //var loc_cd            = ($value[18])                                  ?   $value[18].text :   "";//loc_cd
                                        var newsObj = {
                                            type: "news",
                                            news_no: news_no,
                                            lngtd: lngtd,
                                            ltitde: ltitde,
                                            loc_nm: loc_nm,
                                            //incident_type1    :   incident_type1,
                                            //incident_type2    :   incident_type2,
                                            title: title,
                                            loc_nm2: loc_nm2,
                                            loc_nm3: loc_nm2,
                                            occur_dt: occur_dt,
                                            source: source,
                                            valid_dt: valid_dt,
                                            cont: cont,
                                            excp_nm: excp_nm,
                                            //category      :   category,
                                            container_cnt: container_cnt,
                                            newsMinLocYn: newsMinLocYn,
                                            id: id
                                            /*,
                                                                                loc_cd          :   loc_cd*/
                                        };
                                        /*if(loc_nm == "BATANGAS- LUZON")
                                            console.log(newsObj);
                                        if(loc_nm == "OUAGADOUGOU, BURKINA FASO")
                                            console.log(newsObj);*/
                                        if (news_no.length < 4) return true;
                                        if (lngtd == "-") return true;
                                        if (ltitde == "-") return true;
                                        //console.log("===newsObj===================");
                                        //console.log(newsObj);
                                        //console.log("======================");
                                        //incident에 exception을 위치와 분류기준으로 집어넣기
                                        $.each(incidentDataArr, function($k, $v) {
                                            if ($v["news_cnt"] > 0 && newsObj["lngtd"] == $v["lngtd"] && newsObj["ltitde"] == $v["ltitde"]
                                                //&& incident_type1==$v["incident_type1"] && incident_type2==$v["incident_type2"]
                                            ) {
                                                //console.log("news :: "+$k+" :: "+newsObj["lngtd"]+"=="+$v["lngtd"]+" :: "+newsObj["ltitde"]+"=="+$v["ltitde"]+" :: "+incident_type1+"=="+$v["incident_type1"]+" :: "+incident_type2+"=="+$v["incident_type2"]);
                                                incidentDataArr[$k]["news_arr"].push(newsObj);
                                                //console.log("===newsObj selected===================");
                                                //console.log(newsObj);
                                                //console.log("===newsObj===================");
                                                //return true;
                                                //if(incidentDataArr[$k]["news_arr"]==1){
                                                //console.log(incidentDataArr[$k].excp_cd);
                                                //switch(incidentDataArr[$k]["incident_type2"].trim()){
                                                switch (incidentDataArr[$k]["excp_cd"]) {
                                                    case "EXE_0046":
                                                        incidentDataArr[$k]["icon"] = "EXE_0046";
                                                        incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0055":
                                                        incidentDataArr[$k]["icon"] = "EXE_0055";
                                                        incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0042":
                                                        incidentDataArr[$k]["icon"] = "EXE_0042";
                                                        incidentDataArr[$k]["color"] = "rgba(239, 85, 41, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0038":
                                                        incidentDataArr[$k]["icon"] = "EXE_0038";
                                                        incidentDataArr[$k]["color"] = "rgba(246, 157, 10, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0047":
                                                        incidentDataArr[$k]["icon"] = "EXE_0047";
                                                        incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0043":
                                                        incidentDataArr[$k]["icon"] = "EXE_0043";
                                                        incidentDataArr[$k]["color"] = "rgba(239, 85, 41, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0056":
                                                        incidentDataArr[$k]["icon"] = "EXE_0056";
                                                        incidentDataArr[$k]["color"] = "rgba(228, 0, 124, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0044":
                                                        incidentDataArr[$k]["icon"] = "EXE_0044";
                                                        incidentDataArr[$k]["color"] = "rgba(239, 85, 41, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0039":
                                                        incidentDataArr[$k]["icon"] = "EXE_0039";
                                                        incidentDataArr[$k]["color"] = "rgba(246, 157, 10, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0040":
                                                        incidentDataArr[$k]["icon"] = "EXE_0040";
                                                        incidentDataArr[$k]["color"] = "rgba(246, 157, 10, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0030":
                                                        incidentDataArr[$k]["icon"] = "EXE_0030";
                                                        incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0032":
                                                        incidentDataArr[$k]["icon"] = "EXE_0032";
                                                        incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0033":
                                                        incidentDataArr[$k]["icon"] = "EXE_0033";
                                                        incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0048":
                                                        incidentDataArr[$k]["icon"] = "EXE_0048";
                                                        incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0029":
                                                        incidentDataArr[$k]["icon"] = "EXE_0029";
                                                        incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0037":
                                                        incidentDataArr[$k]["icon"] = "EXE_0037";
                                                        incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0058":
                                                        incidentDataArr[$k]["icon"] = "EXE_0058";
                                                        incidentDataArr[$k]["color"] = "rgba(228, 0, 124, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0057":
                                                        incidentDataArr[$k]["icon"] = "EXE_0057";
                                                        incidentDataArr[$k]["color"] = "rgba(228, 0, 124, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0041":
                                                        incidentDataArr[$k]["icon"] = "EXE_0041";
                                                        incidentDataArr[$k]["color"] = "rgba(246, 157, 10, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0049":
                                                        incidentDataArr[$k]["icon"] = "EXE_0049";
                                                        incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0045":
                                                        incidentDataArr[$k]["icon"] = "EXE_0045";
                                                        incidentDataArr[$k]["color"] = "rgba(239, 85, 41, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_0050":
                                                        incidentDataArr[$k]["icon"] = "EXE_0050";
                                                        incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                    case "EXE_ZZZZ":
                                                        incidentDataArr[$k]["icon"] = "EXE_ZZZZ";
                                                        incidentDataArr[$k]["color"] = "rgba(116, 116, 116, 1)";
                                                        incidentDataArr[$k]["news_on"] = 1;
                                                        break;
                                                }
                                                //}
                                            }
                                        });
                                        // console.log( 'incidentDataArr : ', incidentDataArr );
                                    });
                                var vPOLYGON_length = vPOLYGON.length // 다각형 데이터가 존재 시,
                                vPolygonArr = [];
                                if (vPOLYGON_length > 0) {
                                    for (var i = 0; i < vPOLYGON_length; i++) { // 다각형 데이터 감싸기.
                                        var polyObj = {};
                                        polyObj.pointer = JSON.parse(vPOLYGON[i].INCIDENT_POLYGON_LNGTD_LTITDE); // 사실 의미 없음.
                                        polyObj.id = vPOLYGON[i].INCID_ID;
                                        polyObj.name = vPOLYGON[i].POLYGON_NAME;
                                        vPolygonArr.push(polyObj);
                                    }
                                }
                                var $element = $($target.Element);
                                qvObjectId = $target.Layout.ObjectId.replace("\\", "_");
                                if (!window[qvObjectId]) window[qvObjectId] = {};
                                window[qvObjectId]["id"] = qvObjectId;
                                //Dimensions 데이터
                                try {
                                    $target.Data.SetPagesizeY($target.Data.TotalSize.y);
                                } catch (e) {
                                    IsChkCnt++;
                                    console.log(e);
                                }
                                var setNEWS = function() {
                                    if (vSHOW_NEWS == "N") {
                                        vNEWS_DATA = new Array();
                                        return;
                                    }
                                    vNEWS_DATA = new Array();
                                    $.each(vNEWS, function($key, $value) {
                                        var news_no = ($value[0]) ? $value[0].text : "";
                                        var lngtd = ($value[1] && $.isNumeric($value[1].text)) ? parseFloat($value[1].text) : "-"; //경도
                                        var ltitde = ($value[2] && $.isNumeric($value[2].text)) ? parseFloat($value[2].text) : "-"; //위도
                                        var loc_nm = ($value[3]) ? $value[3].text : ""; //명칭
                                        var title = ($value[4]) ? $value[4].text : ""; //subject
                                        var loc_nm2 = ($value[5]) ? $value[5].text : ""; //발생도시
                                        var occur_dt = ($value[6]) ? $value[6].text : ""; //발생일
                                        var source = ($value[7]) ? $value[7].text : ""; //source
                                        var valid_dt = ($value[8]) ? $value[8].text : ""; //valid_dt
                                        var cont = ($value[9]) ? $value[9].text : ""; //cont body
                                        var container_cnt = ($value[10] && $.isNumeric($value[10].text)) ? $value[10].text : ""; //container_cnt
                                        var crt_dt_loc_sort = ($value[11]) ? $value[11].text : ""; //crt_dt_loc_sort ticker에서 날짜 정렬하기 위한 용도로 다른데 사용하지 않음.
                                        var excp_nm = ($value[12]) ? $value[12].text : ""; //excp_nm
                                        var newsObj = {
                                            type: "news",
                                            news_no: news_no,
                                            lngtd: lngtd,
                                            ltitde: ltitde,
                                            loc_nm: loc_nm,
                                            title: title,
                                            loc_nm2: loc_nm2,
                                            loc_nm3: loc_nm2,
                                            occur_dt: occur_dt,
                                            source: source,
                                            valid_dt: valid_dt,
                                            cont: cont,
                                            excp_nm: excp_nm,
                                            container_cnt: container_cnt
                                        };
                                        var ticker_incidentObj = {
                                            type: "news",
                                            lngtd: lngtd,
                                            ltitde: ltitde,
                                            color: "#ed7d31",
                                            loc_nm: loc_nm,
                                            pos: [lngtd, ltitde],
                                            news_cnt: 1,
                                            total_cnt: 1,
                                            except_cnt: 0,
                                            news_arr: new Array(),
                                            except_arr: new Array()
                                        };
                                        ticker_incidentObj["news_arr"].push(newsObj);
                                        vNEWS_DATA.push(ticker_incidentObj);
                                    });
                                    // console.log(vNEWS_DATA);
                                };
                                var showNEWS = function() {
                                    $("#news_pointPopup").hide();
                                    if (vNEWS_DATA.length == 0) return;
                                    $("#news_pointPopup #popup-closer").trigger("click");
                                    $(this).attr("sel", 1);
                                    $("#news_pointPopup").attr("data", "");
                                    //draggable에 의한 위치 초기화
                                    $("#news_pointPopup").attr("style", "");
                                    $("#news_pointPopup").addClass("incident");
                                    var ticker_step = 0;
                                    var incidentObj = vNEWS_DATA[ticker_step];
                                    var news_arr = new Array();
                                    try {
                                        news_arr = incidentObj["news_arr"] ? incidentObj["news_arr"] : new Array();
                                    } catch (e) {}
                                    var except_arr = new Array();
                                    try {
                                        except_arr = incidentObj["except_arr"] ? incidentObj["except_arr"] : new Array();
                                    } catch (e) {}
                                    var obj = {
                                        type: incidentObj["type"],
                                        lngtd: incidentObj["lngtd"],
                                        ltitde: incidentObj["ltitde"],
                                        news_arr: news_arr,
                                        except_arr: except_arr
                                    }
                                    var coordinate = [0, 0];
                                    $("#news_pointPopup").attr("type", "");
                                    $("#news_pointPopup .ol-popup-title").attr("type", "");
                                    $("#news_pointPopup").attr("idx", "-1");
                                    $("#news_pointPopup .ol-popup-headtitle-content").attr("title", "");
                                    $("#news_pointPopup .ol-popup-headtitle-content").html("");
                                    $("#news_pointPopup #disp_step").html("");
                                    $("#news_pointPopup #popup-content").empty();

                                    function btn_next($data) {
                                        // console.log($data);
                                        var $type = $("#news_pointPopup").attr("type") != "" ? $("#news_pointPopup").attr("type") : $data["type"];
                                        var $idx = $("#news_pointPopup").attr("idx");
                                        var $next_idx = parseInt($idx) + 1;
                                        var $direction = $("#news_pointPopup").attr("prev") == 1 ? "prev" : "next";
                                        var $count = 0;
                                        var $totalcount = $data["news_arr"].length + $data["except_arr"].length;
                                        if ($direction == "prev") {
                                            if ($type == "news" && $next_idx == 1) {
                                                // console.log("news prev");
                                                if ($data["except_arr"].length > 0) {
                                                    $type = "except";
                                                    $idx = $data["except_arr"].length - 1;
                                                    $next_idx = $idx;
                                                } else {
                                                    $idx = 0;
                                                    $next_idx = 0;
                                                }
                                            } else if ($type == "except" && $next_idx == 1) {
                                                // console.log("except prev");
                                                if ($data["news_arr"].length > 0) {
                                                    $type = "news";
                                                    $idx = $data["news_arr"].length - 1;
                                                    $next_idx = $idx;
                                                } else {
                                                    $idx = 0;
                                                    $next_idx = 0;
                                                }
                                            } else {
                                                $next_idx = parseInt($idx) - 1;
                                            }
                                            // console.log("direction :: "+$direction+" , "+$("#news_pointPopup").attr("prev"));
                                            // console.log("news_arr length :: "+$data["news_arr"].length);
                                            // console.log("except_arr length :: "+$data["except_arr"].length);
                                        } else {
                                            if ($type == "news" && $next_idx == $data["news_arr"].length) {
                                                // console.log("news next");
                                                if ($data["except_arr"].length > 0) {
                                                    $type = "except";
                                                }
                                                $idx = 0;
                                                $next_idx = 0;
                                            } else if ($type == "except" && $next_idx == $data["except_arr"].length) {
                                                // console.log("except next");
                                                if ($data["news_arr"].length > 0) {
                                                    $type = "news";
                                                }
                                                $idx = 0;
                                                $next_idx = 0;
                                            } else {
                                                $next_idx = parseInt($idx) + 1;
                                            }
                                        }
                                        // console.log("type :: "+$type);
                                        // console.log("next_idx :: "+$next_idx);
                                        //초기 팝업 출력일 경우
                                        if ($idx == -1) {
                                            $idx = 0;
                                            $next_idx = 0;
                                        }
                                        if ($type == "mixed") {
                                            $type = "news";
                                        }
                                        var $curr_idx = $type == "except" ? ($data["news_arr"].length + $next_idx + 1) : ($next_idx + 1);
                                        var $curr_data;
                                        if ($type == "news") {
                                            $curr_data = $data["news_arr"][$next_idx];
                                            $count = $data["news_arr"].length;
                                        } else {
                                            $curr_data = $data["except_arr"][$next_idx];
                                            $count = $data["except_arr"].length;
                                        }
                                        $("#news_pointPopup").attr("type", $type);
                                        $("#news_pointPopup").attr("idx", $next_idx);
                                        $("#news_pointPopup").attr("totalcount", $totalcount);
                                        if ($totalcount > 1) $("#news_pointPopup #disp_step").html($curr_idx + " of " + $totalcount);
                                        else $("#pointPopup #disp_step").html("");
                                        $("#news_pointPopup .ol-popup-title").attr("type", $type);
                                        if ($type == "news") {
                                            $("#news_pointPopup .ol-popup-headtitle-content").attr("title", $curr_data["excp_nm"]);
                                            $("#news_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm"]);
                                            var str = "<table style='width:580px;'>\
                                                    \<tr><td>\
                                                        \<div class='occur_dt' style='float:left;'></div>\
                                                        \<div class='location_icon' style='float:right;'><img style='height:20px;' src='" + QV_OSM_EX_URL + "icon/location_50.png' /></div>\
                                                        \<div class='location' style='float:right;'></div>\
                                                    \</td></tr>\
                                                    \<tr><td><div class='source'></div></td></tr>\
                                                    \<tr><td><div class='valid_dt'></div></td></tr>\
                                                    \<tr><td></br></td></tr>\
                                                    \<tr><td><div class='title'></div></td></tr>\
                                                    \<tr><td></br></td></tr>\
                                                    \<tr><td><div class='cont'></div></td></tr>\
                                                    \<tr><td><div class='container_cnt'></div></td></tr>\
                                                \</table>";
                                            $("#news_pointPopup #popup-content").html(str);
                                            var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
                                            var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
                                            $("#news_pointPopup #popup-content .occur_dt").html("Created on : " + ocdt);
                                            $("#news_pointPopup #popup-content .location").html($curr_data["loc_nm"]);
                                            $("#news_pointPopup #popup-content .title").html($curr_data["title"]);
                                            $("#news_pointPopup #popup-content .source").html("Source: " + $curr_data["source"]);
                                            $("#news_pointPopup #popup-content .valid_dt").html("Valid until: " + vdt);
                                            var $contents_arr = $curr_data["cont"].split("[read more](");
                                            // console.log($contents_arr);
                                            var $contents = $contents_arr[0];
                                            var $read_more = "";
                                            try {
                                                if ($contents_arr[1] != null) {
                                                    var $url = $.trim($contents_arr[1]).substr(0, $contents_arr[1].length - 1);
                                                    $read_more = "<a href='" + $url + "' target=_blank>[read more]</a>";
                                                }
                                            } catch (e) {}
                                            $("#news_pointPopup #popup-content .cont").html($contents + $read_more);
                                        } else {
                                            $("#news_pointPopup .ol-popup-headtitle-content").attr("title", $curr_data["excp_nm4"]);
                                            $("#news_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm4"]);
                                            var str = "<table style='width:580px;'>\
                                                \<tr><td>\
                                                    \<div class='occur_dt' style='float:left;'></div>\
                                                    \<div class='location_icon' style='float:right;'><img style='height:20px;' src='" + QV_OSM_EX_URL + "icon/location_50.png' /></div>\
                                                    \<div class='location' style='float:right;'></div>\
                                                \</td></tr>\
                                                \<tr><td></br></td></tr>\
                                                \<tr><td><div class='title'></div></td></tr>\
                                                \<tr><td><div class='container_cnt'></div></td></tr>\
                                                \<tr><td><div class='vessel_nm'></div></td></tr>\
                                                \<tr><td><div class='excp_nm4'></div></td></tr>\
                                                \<tr><td>\
                                                    \<div style='color:#006ca2;font-weight:bold;'>Reason Detail</div>\
                                                    \<div class='reason'></div>\
                                                \</td></tr>\
                                                \<tr><td></br></td></tr>\
                                                \<tr><td>\
                                                    \<div style='color:#006ca2;font-weight:bold;'>Action & Prevention Measure</div>\
                                                    \<div class='action'></div>\
                                                \</td></tr>\
                                                \</table>";
                                            $("#news_pointPopup #popup-content").html(str);
                                            var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                                            $("#news_pointPopup #popup-content .occur_dt").html(ocdt);
                                            $("#news_pointPopup #popup-content .location").html($curr_data["loc_nm2"] + " (" + $curr_data["step"] + ")");
                                            $("#news_pointPopup #popup-content .title").html($curr_data["title"]);
                                            $("#news_pointPopup #popup-content .vessel_nm").html($curr_data["vessel_nm"]);
                                            $("#news_pointPopup #popup-content .excp_nm4").html($curr_data["excp_nm4"]);
                                            $("#news_pointPopup #popup-content .reason").html(($curr_data["reason"] ? $curr_data["reason"] : ""));
                                            $("#news_pointPopup #popup-content .action").html(($curr_data["action"] ? $curr_data["action"] : ""));
                                            //                                  $("#news_pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially Affected Cargos : "+$curr_data["container_cnt"]+" container(s)" : ""));
                                        }
                                        $("#news_pointPopup #btn_next").show();
                                        $("#news_pointPopup #btn_prev").show();
                                        if ($totalcount > 1) {
                                            $("#news_pointPopup #btn_next").off("click").on("click", function() {
                                                $("#news_pointPopup").attr("prev", 0);
                                                btn_next(obj);
                                            });
                                            $("#news_pointPopup #btn_prev").off("click").on("click", function() {
                                                $("#news_pointPopup").attr("prev", 1);
                                                btn_next(obj);
                                            });
                                        } else {
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
                                                                +'<img style="width:45px;" src="'+QV_OSM_EX_URL+'icon/radar_white.png"/>'
                                                            +'</div>');
                                */
                                $(".Document_TOP_LAYER").css("border-right", "1px solid #191919");
                                $(".Document_TOP_LAYER").css("border-left", "1px solid #191919");
                                $(".Document_TX294").css("cursor", "pointer").off("mouseover").on("mouseover", function() {
                                    $(".Document_SCORE_INFO1").css("z-index", 45).show();
                                    $(".Document_SCORE_INFO2").css("z-index", 40).show();
                                });
                                $(".Document_TX294").off("mouseout").on("mouseout", function() {
                                    $(".Document_SCORE_INFO1").hide();
                                    $(".Document_SCORE_INFO2").hide();
                                });

                                var drawWtLayer = function() {
                                    //날씨 레이어
                                    d3.csv(QV_OSM_EX_URL + "data/weather.csv", function(d) {
                                        weatherIcons = [];
                                        var pos;
                                        var weatherGroup = {};


                                        $(d).each(function() {
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
                                            if (!weatherGroup[weatherG]) weatherGroup[weatherG] = [];
                                            weatherGroup[weatherG].push(icon);
                                            if (iconId == "781") {
                                                icon = iconId;
                                            }
                                            pos = new ol.Feature({
                                                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]))
                                            });
                                            pos.setStyle(new ol.style.Style({
                                                image: new ol.style.Icon(({
                                                    opacity: 0.9,
                                                    scale: 0.6,
                                                    //size : [100,100],
                                                    color: '#ffffff',
                                                    src: QV_OSM_EX_URL + 'icon/' + icon + '.png'
                                                }))

                                            }));

                                            pos.set("t", icon);
                                            pos.set("type", "weather");
                                            pos.set("popup", "Port : " + portName + "<br/>Weather : " + desc + "<br/>Temperature : " + tempt + " ºC<br/>Wind Speed : " + windSpeed + "(km/h)");
                                            //pos.set("i",{"ty":"w","t":tempt,"c":country,"port":portName,"minTempt":minTempt,"maxTempt":maxTempt,"wDir":windDir,"wSpeed":windSpeed,"desc":desc});
                                            weatherIcons.push(pos);
                                        });

                                        var iconVector = new ol.source.Vector({
                                            features: weatherIcons
                                        });
                                        if (weatherLayer) weatherLayer.getSource().clear();
                                        weatherLayer = new ol.layer.Vector({
                                            source: iconVector
                                        });
                                        weatherLayer.setZIndex(1);
                                        QvOSM_MAP.addLayer(weatherLayer);

                                        var weatherL = $element.find("#weatherLayer1");



                                        var weatherString = "" +
                                            '<div class="form-group">' +
                                            '<div class="col-sm-10">' +
                                            '<div class="checkbox">' +
                                            '<label>' +
                                            '<input type="checkbox" class="w0" checked=checked> Weather' +
                                            '</label>' +
                                            '</div>' +
                                            '</div>';
                                        for (var wg in weatherGroup) {
                                            var iconList = unique(weatherGroup[wg]);
                                            weatherString += "" +
                                                '<div class="col-sm-10">' +
                                                '<div class="checkbox">' +
                                                '<label>' +
                                                '<input type="checkbox" class="w1" data-icon="' + iconList.toString() + '" checked=checked> ' + wg +
                                                '</label>' +
                                                '</div>' +
                                                '</div>';
                                        }
                                        weatherString += "</div>"
                                        weatherL.html(weatherString);
                                        $(".weatherArea").find(".w0").bind("change", function() {
                                            var op = 0;
                                            if (this.checked) {
                                                op = 0.9;
                                                $(".weatherArea").find("input").attr("checked", "checked");
                                                weatherLayer.setVisible(true);
                                            } else {
                                                $(".weatherArea").find("input").attr("checked", false);
                                                weatherLayer.setVisible(false);
                                            }

                                        });
                                        $(".weatherArea").find(".w1").bind("change", function() {
                                            var _this = this;
                                            var features = weatherLayer.getSource().getFeatures();
                                            var weatherFeatures = [];
                                            var iconData = $(this).attr("data-icon").split(",");
                                            //var iconData = $(this).data("icon");//.split(",");
                                            for (var i = 0; i < features.length; i++) {
                                                //var icon = features[i]["G"]["t"];
                                                var icon = features[i].get("t");
                                                //console.log(features[i].get("t"));
                                                if (iconData.indexOf(icon) > -1) {
                                                    weatherFeatures.push({ icon: icon, fea: features[i] });
                                                }
                                            }


                                            $(this).unbind("change");
                                            $(this).bind("change", function() {
                                                var op = 0;
                                                if (_this.checked) {
                                                    op = 0.9;
                                                }

                                                for (var i = 0; i < weatherFeatures.length; i++) {
                                                    var icon = weatherFeatures[i].icon;

                                                    weatherFeatures[i].fea.setStyle(new ol.style.Style({
                                                        image: new ol.style.Icon(({
                                                            opacity: op,
                                                            scale: 0.6,
                                                            //size : [100,100],
                                                            color: '#ffffff',
                                                            src: QvOSM_PVM_exUrl + 'icon/' + icon + '.png'
                                                        }))
                                                    }));
                                                }
                                            });

                                            $(this).trigger("change");
                                        });
                                    });
                                }
                                //if(vSTD_DATA.legnth != vSTD.Data.Rows.length) IsChkCnt++;
                                //if(vSEA_DATA.legnth != vSEA.Data.Rows.length) IsChkCnt++;
                                if (!$target.framecreated) {
                                    drawMAP();
                                    $target.framecreated = true;
                                }
                                //클릭뷰 데스크탑에서 무한 리프레시 금지
                                var browser_str = navigator.userAgent;
                                if (browser_str.indexOf("Mozilla/4") > -1 && browser_str.indexOf("InfoPath") > -1) IsChkCnt = 0;
                                if (IsChkCnt > 0) {
                                    console.log("====refresh====");
                                    setTimeout(function() {
                                        Qv.GetCurrentDocument().SetVariable("vREFRESH", "1");
                                    }, 1200);
                                } else {
                                    console.log("====data loading success====");
                                    if (drawingTime) clearTimeout(drawingTime);
                                    drawingTime = setTimeout(function() {
                                        if (oldMAPTYPE != vMAPTYPE) drawMAP();
                                        if (vView_Risk == "N") setNEWS();
                                        if (vView_Risk == "N") setRiskScore();
                                        if (vView_Risk == "R") drawPolygon();
                                        //vessel 먼저 화면에서 지운다.
                                        if (vesselLayer) QvOSM_MAP.removeLayer(vesselLayer);
                                        if (vView_Risk == "R" && vRoute_YN == "Y") {
                                            setRouteLine();
                                        }
                                        if (vView_Risk == "R" && vRoute_YN == "N") {
                                            setTyphoonIcon();
                                        }
                                        removeAllLayer();
                                        if (vView_Risk == "R" && vRoute_YN == "N") {
                                            /*overlayList.forEach(function(overlay) {
                                                QvOSM_MAP.removeOverlay(overlay);
                                            });*/
                                            clearTyphoonIcon();
                                            showTyphoonIcon();
                                            showVessel();
                                            drawINCIDENT();
                                            if (vWeather_flag == "Y")
                                                drawWtLayer();
                                            drawPort();
                                            drawNoti();
                                        }

                                        $("#news_pointPopup").hide();
                                        if (vView_Risk == "N") showNEWS();
                                        currentZoomLevel = QvOSM_MAP.getView().getZoom();

                                        routeDraw();
                                        
										if(vBackbtn_flag == "Y"){
											routeLayer = QvOSM_MAP.removeLayer(routeLayer);
											portLayer = QvOSM_MAP.removeLayer(portLayer);
											notiLayer = QvOSM_MAP.removeLayer(notiLayer);
										}

                                        QvOSM_MAP.on('moveend', checknewzoom);
                                        //익스텐션 중복 추가되는 부분 제거
                                        $.each($("div#" + $target.Layout.ObjectId.replace("\\", "_")), function() {
                                            if ($(this).html() == "") $(this).remove();
                                        });
                                        /* 데이터가 성공적으로 다 로딩되었어도, qlikview loading modal이 존재하면, fadeout */
                                        // if( $('.ModalDialog') ){
                                        //  $(".ModalDialog").fadeOut(500);
                                        //  $('.popupMask').fadeOut(500);
                                        // }
                                    }, 1200);
                                }
                            } catch (e) {
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