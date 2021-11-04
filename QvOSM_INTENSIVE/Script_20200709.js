'use strict'
const ExName = "QvOSM_INTENSIVE";
const QvOSM_exUrl = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/" + ExName + "/";

const cqv = Qv.GetDocument("");
const vEXT_INTENSIVE = cqv.GetObject("vEXT_INTENSIVE");
const mapTypeUrl = ['https://api.mapbox.com/styles/v1/yhy878/cj0nkfsv7004c2slfyernovxx/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWh5ODc4IiwiYSI6ImNpam04Mm5jaTAwOWJ0aG01d2hlb2FpYXEifQ.kzx9H8IeBBk_zCvvF91Rtg', 'https://api.mapbox.com/styles/v1/seungok/ciousf1zl003sdqnfpcpfj19r/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg', 'https://api.mapbox.com/styles/v1/seungok/cip7yoxzy0029dnm5n040qd0q/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg', 'https://api.mapbox.com/styles/v1/seungok/ciouskftw003jcpnn296ackea/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg'];
var QvOSM_INTENSIVE_MAP;

var vRoute_YN;
var vSHOW_NEWS;
var vMAPTYPE;
var vVIEW_RISK;
var vTYPHOON_LO_NEW;
var vVESSEL_CURR_LOC;
var vINCIDENT;
var vROUTE;
var vNEWS;
var vPORT_NEWS;
var vPOLYGON;
var vCONDITION_FLAG;
var $_VAR;

var $target;
var ol;
var uId;

var IsChkCnt = 0;


var typhoonDataArr = [];
var typhoonLayer;
var typhoonIconArr = [];
var incidentDataArr = [];
var incidentLayer;

var offy = 15;
var oldMAPTYPE;
var oldZoom;
var vesselZoom;
var vesselLayer;
var DRAW_TIM;

var zIndex = 0;
var SOURCE_OBJ = {};
var LAYER_OBJ = {};

var QvOSM_PVM_Design_Opt = JSON.parse('{"typhoon":{"50knot":{"color":"rgba(225, 30, 30, 0.4)"},"34knot":{"color":"rgba(30, 30, 225, 0.1)"},"line":{"color":"rgba(225, 50, 50, 0.9)","width":5}}}');

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

// 함수
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
                        src: QvOSM_exUrl + 'icon/' + obj["icon"] + '.png',
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
        QvOSM_INTENSIVE_MAP.removeLayer(LAYER_OBJ[$target]);
    }

    try {
        QvOSM_INTENSIVE_MAP.addLayer(LAYER_OBJ[$target]);
    } catch (e) {
        console.log(e);
    }
};

var setTyphoonData = function() {
    typhoonDataArr = new Array();

    try {
        $.each(vTYPHOON_LO_NEW, function(indx, vTYPHOON) {

            var obj = {
                NAME: vTYPHOON["VSL_NAME_TYP"],
                KEY_TYPHOON: vTYPHOON["KEY_TYPHOON_TYP"],
                VSL_NAME: vTYPHOON["VSL_NAME_TYP"],
                LATEST_YN: vTYPHOON["LATEST_YN_TYP"],
                LOCAL_DT_TTHH: vTYPHOON["LOCAL_DT_TTHH_TYP"],
                ROUT_SEQ: vTYPHOON["ROUT_SEQ_TYP"],
                LOCAL_DT: vTYPHOON["LOCAL_DT_TYP"],
                LTITDE: (vTYPHOON && $.isNumeric(vTYPHOON["LTITDE_TYP"])) ? parseFloat(vTYPHOON["LTITDE_TYP"]) : "-", //위도
                LNGTD: (vTYPHOON && $.isNumeric(vTYPHOON["LNGTD_TYP"])) ? parseFloat(vTYPHOON["LNGTD_TYP"]) : "-", //경도
                DIRECTION: vTYPHOON["DIRECTION_TYP"],
                MAX_WINDSPEED: parseInt(vTYPHOON["MAX_WINDSPEED_TYP"]),
                GUST: vTYPHOON["GUST_TYP"],
                RADIUS: JSON.parse(vTYPHOON["RADIUS_TYP"]),
                CURR_YN: vTYPHOON["CURR_YN_TYP"],
                PLAY_YN: vTYPHOON["PLAY_YN_TYP"],
                TYPN_SEQ: vTYPHOON["TYPN_SEQ"],
                TYPN_ICON: vTYPHOON["TYPN_ICON_TYP"],
                DESC: vTYPHOON["DESC_TYP"],
                IS_CURR: vTYPHOON["LAST_YN_TYP"],
                CREATE_YEAR: vTYPHOON["CRT_YY_TYP"]
            }

            typhoonDataArr.push(obj);
        });
    } catch (e) {
        console.log(e);
    }
};
//Typhoon icon
var setTyphoonIcon = function() {

    typhoonIconArr = new Array();

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

        if ($key != $v["KEY_TYPHOON"]) {

            if (std_arr.length > 0)
                typhoonIconArr.push({
                    key: $key,
                    data: std_arr,
                });

            std_arr = new Array();
            $key = $v["KEY_TYPHOON"];
            $b4value = null;

            $lineStyle = "line";
        }

        if ($v["IS_CURR"] == "Y") {
            $IsCurr = true; //현재 태풍, 그 이후에는 예상경로
        } else {
            $IsCurr = false; //현재 태풍, 그 이후에는 예상경로
        }

        var ty_icon = "ty1_40_30";
        var ty_txt = $v["LOCAL_DT_TTHH"] + " (Grade : VS)";
        if ($v["MAX_WINDSPEED"] >= 85) {
            ty_icon = "ty4_40_30";
            ty_txt = $v["LOCAL_DT_TTHH"] + " (Grade : VS)";
        } else if ($v["MAX_WINDSPEED"] < 85 && $v["MAX_WINDSPEED"] >= 64) {
            ty_icon = "ty3_40_30";
            ty_txt = $v["LOCAL_DT_TTHH"] + " (Grade : S)";
        } else if ($v["MAX_WINDSPEED"] < 64 && $v["MAX_WINDSPEED"] >= 48) {
            ty_icon = "ty2_40_30";
            ty_txt = $v["LOCAL_DT_TTHH"] + " (Grade : M)";
        } else if ($v["MAX_WINDSPEED"] < 48 && $v["MAX_WINDSPEED"] >= 34) {
            ty_icon = "ty1_40_30";
            ty_txt = $v["LOCAL_DT_TTHH"] + " (Grade : W)";
        }

        var $line_obj = null;
        if ($b4value != null) {
            //console.log( 'before : ', $b4value["LNGTD"] );
            //console.log( 'after : ', $v["LNGTD"] );
            var vLngTd;
            //태평양 건너는 경우 계산처리
            if (($v["LNGTD"] * $b4value["LNGTD"] < 0) && $v["LNGTD"] < 0) {
                vLngTd = 360 + $v["LNGTD"];
            } else if (($v["LNGTD"] * $b4value["LNGTD"] < 0) && $v["LNGTD"] > 0) {
                vLngTd = -360 + $v["LNGTD"];
            } else {
                vLngTd = $v["LNGTD"];
            }


            $line_obj = {
                key: $key,
                data: [
                    [ol.proj.fromLonLat([$b4value["LNGTD"], $b4value["LTITDE"]]), ol.proj.fromLonLat([vLngTd, $v["LTITDE"]])]
                ],
                width: 3,
                color: "rgba(255, 0, 0, 0.4)",
                linestyle: $lineStyle
            };
        }
        $b4value = $v; //line 그리기 위해 이전 값을 저장한다
        if ($v["IS_CURR"] == "Y") { //이후 경로는 예상경로
            $lineStyle = "dash";
        } else {}

        std_arr.push({
            type: "typhoon",
            data: ol.proj.fromLonLat([$v["LNGTD"], $v["LTITDE"]]),
            icon: ty_icon,
            text: ty_txt,
            key: $key,
            name: $v["NAME"],
            color: "rgba(255, 255, 255, 1)",
            curr: $IsCurr,
            speed: $v["MAX_WINDSPEED"] || 34,
            polygon: [
                [getTypoonCoordinates([$v["LNGTD"], $v["LTITDE"]], $v["RADIUS"][0], $v["RADIUS"][1], $v["RADIUS"][2], $v["RADIUS"][3])], //34note
                [getTypoonCoordinates([$v["LNGTD"], $v["LTITDE"]], $v["RADIUS"][4], $v["RADIUS"][5], $v["RADIUS"][6], $v["RADIUS"][7])] //50note
            ],
            line: $line_obj
        });

        if ($k == typhoonDataArr.length - 1)
            typhoonIconArr.push({
                key: $key,
                data: std_arr,
            });
    });
};

var showTyphoonIcon = function() {
    zIndex = 0;

    if (typhoonIconArr.length > 0) {
        $.each(typhoonIconArr, function($key, $value) {
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
                drawLine($v["type"] + "_" + $key + "_icon_" + $k, $v, $v["data"], 1, null, null, "icon", $v["text"], null, null, null, "12px Calibri,sans-serif", $v["color"]);
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

var setIncidentData = function() {
    incidentDataArr = new Array();
    $.each(vINCIDENT, function(indx, vIncident) {
        // console.log(vIncident);

        var lngtd = (vIncident["INCI_LNGTD"] && $.isNumeric(vIncident["INCI_LNGTD"])) ? parseFloat(vIncident["INCI_LNGTD"]) : "-"; //경도
        var ltitde = (vIncident["INCI_LTITDE"] && $.isNumeric(vIncident["INCI_LTITDE"])) ? parseFloat(vIncident["INCI_LTITDE"]) : "-"; //위도
        var loc_nm = (vIncident["INCI_LOC_NM"]) ? vIncident["INCI_LOC_NM"] : ""; //명칭
        var incident_type2 = (vIncident["INCIDENT_TYPE2"]) ? vIncident["INCIDENT_TYPE2"] : ""; //명칭
        var except_cnt = (vIncident["INCIDENT_TYPE2"] && $.isNumeric(vIncident["INCI_EXCT_CNT"])) ? parseInt(vIncident["INCI_EXCT_CNT"]) : 0; //exception 갯수
        var news_cnt = (vIncident["INCI_EXCT_CNT"] && $.isNumeric(vIncident["INCI_NEWS_CNT"])) ? parseInt(vIncident["INCI_NEWS_CNT"]) : 0; //news 갯수
        var total_cnt = news_cnt + except_cnt;
        var type = "news";
        var icon = "news_marker";
        var color = "#ed7d31";
        var excp_cd = 'EXE_' + vIncident["INCI_EXCP_CD"];

        if (news_cnt == 0 && except_cnt == 0) return true;
        if (lngtd == "-") return true;
        if (ltitde == "-") return true;

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
        }


        var incidentObj = {
            type: type,
            lngtd: lngtd,
            ltitde: ltitde,
            icon: icon,
            color: color,
            loc_nm: loc_nm,
            pos: [lngtd, ltitde],
            incident_type2: incident_type2,
            news_cnt: news_cnt,
            total_cnt: total_cnt,
            except_cnt: except_cnt,
            news_arr: new Array(),
            except_arr: new Array(),
            excp_cd: excp_cd
        };
        //console.log(incidentObj);
        incidentDataArr.push(incidentObj);

    });

    //exception 정보 정리
    if (incidentDataArr.length > 0) {
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
                container_cnt: container_cnt,
                newsMinLocYn: newsMinLocYn,
                id: id
            };

            if (news_no.length < 4) return true;
            if (lngtd == "-") return true;
            if (ltitde == "-") return true;

            //incident에 exception을 위치와 분류기준으로 집어넣기
            $.each(incidentDataArr, function($k, $v) {
                if ($v["news_cnt"] > 0 && newsObj["lngtd"] == $v["lngtd"] && newsObj["ltitde"] == $v["ltitde"]) {
                    incidentDataArr[$k]["news_arr"].push(newsObj);

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
                }
            });
        });
    }
};
//news icon 용
var createIncidentIcon2 = function(icon, rotation, scale, name, fontstyle, fontcolor) {
    var _font = fontstyle == null ? '10px Calibri,sans-serif' : fontstyle;

    var obj = {
        image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
            scale: scale ? scale : 1,
            src: QvOSM_exUrl + 'icon/' + icon + '.png',
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
};
var createIncidentIcon = function(icon, rotation, scale, name, fontstyle, fontcolor) {
    var _font = fontstyle == null ? '10px Calibri,sans-serif' : fontstyle;

    var obj = {
        image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
            scale: scale ? scale : 1,
            src: QvOSM_exUrl + 'icon/' + icon + '.png',
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
var drawIncident = function() {
    try{
    zIndex = 0;

    incidentLayer = QvOSM_INTENSIVE_MAP.removeLayer(incidentLayer);
    if (incidentDataArr.length > 0) {

        var vIconFeas = [];

        //console.log(incidentDataArr.length);

        //var incidentDetail = JSON.parse(docObj.GetVariable(0).text);
        $.each(incidentDataArr, function($key, incidentObj) {
            //console.log(vIconFea);
            if (incidentObj["news_arr"].length > 0) {
                for (var i = 0, news; news = incidentObj["news_arr"][i]; i++) {
                    if ((4 > QvOSM_INTENSIVE_MAP.getView().getZoom() && "Y" == news.newsMinLocYn) || 4 <= QvOSM_INTENSIVE_MAP.getView().getZoom()) {
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

        incidentLayer = QvOSM_INTENSIVE_MAP.removeLayer(incidentLayer);

        //if(incidentLayer){incidentLayer.getSource().clear();}
        incidentLayer = new ol.layer.Vector({
            style: function(feature) {
                return feature.get('style');
            },
            source: vIconVector
        });
        incidentLayer.setZIndex(200);
        QvOSM_INTENSIVE_MAP.addLayer(incidentLayer);

    }













    //ticker
    function ticker_position() {
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

    // console.log("ticker_incidentData :: ");
    // console.log(ticker_incidentData);

    $.ticker_next = function() {
        var ticker_step = $("#ticker_cont").attr("ticker_step") == -1 ? -1 : parseInt($("#ticker_cont").attr("ticker_step"));
        ticker_step++;

        try {
            if (ticker_step >= ticker_incidentData.length - 1) {
                ticker_step = 0;
            }



            var incidentObj = ticker_incidentData[ticker_step];
            var news_arr = incidentObj["news_arr"];
            var except_arr = incidentObj["except_arr"];
            var obj;
            var type = "";

            if (news_arr != null && news_arr.length > 0) obj = news_arr[0];
            if (except_arr != null && except_arr.length > 0) obj = except_arr[0];


            // console.log(obj);

            var ocdt = obj["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');

            switch (incidentObj["type"]) {
                case "news":

                    var title = obj["title"];
                    if (title.length > 100) {
                        title = title.substr(0, 100) + "...";
                    }
                    $("#ticker_cont").html("[NEWS] " + title + " (" + ocdt + ")");
                    break;
                case "except":

                    var title = obj["reason"];
                    if (title.length > 100) {
                        title = title.substr(0, 100) + "...";
                    }
                    $("#ticker_cont").html("[EXCEPTION] " + title + " (" + ocdt + ")");
                    break;
            }

            // console.log($("#ticker_cont").text());

            $('#ticker_cont').marquee('reset');
            $('#ticker_cont').marquee({
                speed: 80,
                gap: 0,
                delayBeforeStart: 0,
                direction: 'left',
                duplicated: false,
                pauseOnHover: true
            });

            $("#ticker_cont").attr("ticker_step", ticker_step);
        } catch (e) {

        }

    }


    ticker_position();
    $(window).resize(function() {
        ticker_position();
    });

    $('#ticker_cont').remove();
    $(".Document_vTICKER_COLOR .QvContent .TextObject TD:first").append('<div id="ticker_cont" ticker_step="0" class="marquee" style="color:#ffffff;width:100%;height:40px;font-family:Calibri;font-size:24px;font-weight:bold;position:relative;left:0px;top:0px;"></div>');
    $.ticker_next();


    $("#ticker_pointPopup").off("mouseover").on("mouseover", function(evt) {
        $(this).attr("sel", 1);
        $("#ticker_pointPopup").show();
    });

    $("#ticker_pointPopup").off("mouseout").on("mouseout", function(evt) {
        $(this).attr("sel", 0);
        $("#ticker_cont").attr("sel", 0);
        $("#ticker_pointPopup #popup-closer").trigger("click");
        $("#ticker_pointPopup").hide();
    });

    $('#ticker_cont').off("mouseout").on("mouseout", function(evt) {
        $(this).attr("sel", 0);

        setTimeout(function() {
            if ($("#ticker_pointPopup").attr("sel") == 1) return;

            $("#ticker_pointPopup #popup-closer").trigger("click");
            $("#ticker_pointPopup").hide();
        }, 500);
    });

    $('#ticker_cont').off("mouseover").on("mouseover", function(evt) {
        $("#ticker_pointPopup #popup-closer").trigger("click");
        //$("#ticker_pointPopup").hide();
        // console.log(evt);

        $(this).attr("sel", 1);

        $("#ticker_pointPopup").attr("data", "");
        $("#ticker_pointPopup").height("");

        //draggable에 의한 위치 초기화
        $("#ticker_pointPopup").attr("style", "");

        $("#ticker_pointPopup").addClass("incident");

        var ticker_pointPopup = new ol.Overlay({
            element: document.getElementById("ticker_pointPopup"),
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });

        QvOSM_INTENSIVE_MAP.addOverlay(ticker_pointPopup);




        var ticker_step = $("#ticker_cont").attr("ticker_step");

        var incidentObj = ticker_incidentData[ticker_step];
        var news_arr = new Array();
        try {
            news_arr = incidentObj["news_arr"] ? incidentObj["news_arr"] : new Array();
        } catch (e) {

        }

        var except_arr = new Array();
        try {
            except_arr = incidentObj["except_arr"] ? incidentObj["except_arr"] : new Array();
        } catch (e) {

        }


        var obj = {
            type: incidentObj["type"],
            lngtd: incidentObj["lngtd"],
            ltitde: incidentObj["ltitde"],
            news_arr: news_arr,
            except_arr: except_arr
        }

        var coordinate = [0, 0];



        $("#ticker_pointPopup").attr("type", "");
        $("#ticker_pointPopup .ol-popup-title").attr("type", "");
        $("#ticker_pointPopup").attr("idx", "-1");
        $("#ticker_pointPopup .ol-popup-headtitle-content").attr("title", "");
        $("#ticker_pointPopup .ol-popup-headtitle-content").html("");
        $("#ticker_pointPopup #popup-content").empty();

        function btn_next($data) {
            // console.log($data);

            var $type = $("#ticker_pointPopup").attr("type") != "" ? $("#ticker_pointPopup").attr("type") : $data["type"];
            var $idx = $("#ticker_pointPopup").attr("idx");

            var $next_idx = parseInt($idx) + 1;
            var $direction = $("#ticker_pointPopup").attr("prev") == 1 ? "prev" : "next";

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

                // console.log("direction :: "+$direction+" , "+$("#pointPopup").attr("prev"));
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


            $("#ticker_pointPopup").attr("type", $type);
            $("#ticker_pointPopup").attr("idx", $next_idx);
            $("#ticker_pointPopup").attr("totalcount", $totalcount);
            $("#ticker_pointPopup #disp_step").html("[" + $curr_idx + "/" + $totalcount + "]");
            $("#ticker_pointPopup .ol-popup-title").attr("type", $type);

            // console.log("$type :: "+$type);
            // console.log("$idx :: "+$idx);
            // console.log("$curr_idx :: "+$curr_idx);
            // console.log("$totalcount :: "+$totalcount);


            if ($type == "news") { //news popup 최초 그리는 부분

                $("#ticker_pointPopup .ol-popup-headtitle-content").attr("title", $curr_data["excp_nm"]);
                $("#ticker_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm"]);

                var str = "<table style='width:580px;'>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='occur_dt' style='float:left;'></div>" +
                    "<div class='location_icon' style='float:right;'><img style='height:20px;' src='" + QvOSM_exUrl + "icon/location_50.png' /></div>" +
                    "<div class='location' style='float:right;'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='valid_dt'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='source'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "</br>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='title'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "</br>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='cont'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='container_cnt'></div>" +
                    "</td>" +
                    "</tr>" +
                    "</table>";


                $("#ticker_pointPopup #popup-content").html(str);

                var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
                var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
                $("#ticker_pointPopup #popup-content .occur_dt").html("Created on : " + ocdt);
                $("#ticker_pointPopup #popup-content .location").html($curr_data["loc_nm"]);
                $("#ticker_pointPopup #popup-content .title").html($curr_data["title"]);
                $("#ticker_pointPopup #popup-content .source").html("Source: " + $curr_data["source"]);
                $("#ticker_pointPopup #popup-content .valid_dt").html("Valid until: " + vdt);


                var $contents_arr = $curr_data["cont"].split("[read more](");
                // console.log($contents_arr);

                var $contents = $contents_arr[0];
                var $read_more = "";
                try {
                    if ($contents_arr[1] != null) {
                        var $url = $.trim($contents_arr[1]).substr(0, $contents_arr[1].length - 1);
                        $read_more = "<a href='" + $url + "' target=_blank>[read more]</a>";
                    }
                } catch (e) {

                }

                $("#ticker_pointPopup #popup-content .cont").html($contents + $read_more);

            } else {

                $("#ticker_pointPopup .ol-popup-headtitle-content").attr("title", $curr_data["excp_nm4"]);
                $("#ticker_pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm4"]);

                var str = "<table style='width:580px;'>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='occur_dt' style='float:left;'></div>" +
                    "<div class='location' style='float:right;'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "</br>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='title'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='container_cnt'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='vessel_nm'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "</br>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<div class='excp_nm4'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "</br>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td><div style='color:#006ca2;font-weight:bold;'>Reason Detail</div>" +
                    "<div class='reason'></div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "</br>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td><div style='color:#006ca2;font-weight:bold;'>Action & Prevention Measure</div>" +
                    "<div class='action'></div>" +
                    "</td>" +
                    "</tr>" +
                    "</table>";


                $("#ticker_pointPopup #popup-content").html(str);

                var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                $("#ticker_pointPopup #popup-content .occur_dt").html(ocdt);
                $("#ticker_pointPopup #popup-content .location").html($curr_data["loc_nm2"] + " (" + $curr_data["step"] + ")");
                $("#ticker_pointPopup #popup-content .title").html($curr_data["title"]);
                $("#ticker_pointPopup #popup-content .vessel_nm").html($curr_data["vessel_nm"]);
                $("#ticker_pointPopup #popup-content .excp_nm4").html($curr_data["excp_nm4"]);
                $("#ticker_pointPopup #popup-content .reason").html(($curr_data["reason"] ? $curr_data["reason"] : ""));
                $("#ticker_pointPopup #popup-content .action").html(($curr_data["action"] ? $curr_data["action"] : ""));
                //              $("#ticker_pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially Affected Cargos : "+$curr_data["container_cnt"]+" container(s)" : ""));


            }


            $("#ticker_pointPopup #btn_next").show();
            $("#ticker_pointPopup #btn_prev").show();
            if ($totalcount > 1) {
                $("#ticker_pointPopup #btn_next").off("click").on("click", function() {
                    $("#ticker_pointPopup").attr("prev", 0);
                    btn_next(obj);
                });
                $("#ticker_pointPopup #btn_prev").off("click").on("click", function() {
                    $("#ticker_pointPopup").attr("prev", 1);
                    btn_next(obj);
                });
            } else {
                $("#ticker_pointPopup #btn_next").hide();
                $("#ticker_pointPopup #btn_prev").hide();
            }


            ticker_pointPopup.setPosition(coordinate);

            $("#ticker_pointPopup").parent().css("left", parseInt($(window).width()) / 2);
            $("#ticker_pointPopup").parent().css("bottom", $(".Document_vTICKER_COLOR").height() - 12);

            $("#ticker_pointPopup").draggable();
            $("#ticker_pointPopup").height("");
            $("#ticker_pointPopup").show();

        }





        btn_next(obj);




    });


    $('#ticker_cont').unbind('finished').bind('finished', function() {
        /*
        if($(this).attr("sel")==0){
            $("#popup-closer").trigger("click");
            $("#ticker_pointPopup").hide();
        }
        */
        $.ticker_next();
    });



    /*  $("#rader_div").remove();
        $(".Document_TITLE_LAYER").append('<div id="rader_div" style="position:absolute;left: 250px;top: 8px;text-align:center;">'
                +'<img style="width:45px;" src="'+QvOSM_exUrl+'icon/radar_white.png"/>'
            +'</div>');
    */



    $(".Document_TOP_LAYER").css("border-right", "1px solid #191919");
    $(".Document_TOP_LAYER").css("border-left", "1px solid #191919");



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
}catch(e) {console.log(e);}


};
/*var drawIncidentIcon = function() {
    var fontstyle = 'bold 16px Calibri,sans-serif';
    var fontcolor = "#ed7d31";;

    if (incidentDataArr["total_cnt"] > 1) {
        vIconFea.set('style', createIncidentIcon(0, 0.7, incidentDataArr["total_cnt"], fontstyle, fontcolor));
    } else {
        vIconFea.set('style', createIncidentIcon(0, 0.7));
    }

    var oldIncidentLayer = QvOSM_INTENSIVE_MAP.removeLayer(incidentLayer);
    
    var vIconVector = new ol.source.Vector({
        features: vIconFeas
    });

    incidentLayer = new ol.layer.Vector({
        style: function(feature) {
            return feature.get('style');
        },
        source: vIconVector
    });
    incidentLayer.setZIndex(200);
    QvOSM_INTENSIVE_MAP.addLayer(incidentLayer);

}*/

var getVariable = function() {
    if (vEXT_INTENSIVE.Data.Rows.length > 0) {
        console.log('vEXT_INTENSIVE : ', vEXT_INTENSIVE);

        // GetVariable(0) : vRoute_YN
        if (vEXT_INTENSIVE.GetVariable(0).text) {
            try {
                vRoute_YN = vEXT_INTENSIVE.GetVariable(0).text;
            } catch (e) {
                IsChkCnt++;
                console.log("can't get vRoute_YN data : ", e);
            }
        }

        // GetVariable(1) : vSHOW_NEWS
        if (vEXT_INTENSIVE.GetVariable(1).text) {
            try {
                vSHOW_NEWS = vEXT_INTENSIVE.GetVariable(1).text;
            } catch (e) {
                IsChkCnt++;
                console.log("can't get vSHOW_NEWS data : ", e);
            }
        }
        // GetVariable(2) : vMAPTYPE
        if (vEXT_INTENSIVE.GetVariable(2).text) {
            try {
                vMAPTYPE = vEXT_INTENSIVE.GetVariable(2).text;
            } catch (e) {
                IsChkCnt++;
                console.log("can't get vMAP data : ", e);
            }
        }
        // GetVariable(3) : vVIEW_RISK
        if (vEXT_INTENSIVE.GetVariable(3).text) {
            try {
                vVIEW_RISK = vEXT_INTENSIVE.GetVariable(3).text;
            } catch (e) {
                IsChkCnt++;
                console.log("can't get vVIEW data : ", e);
            }
        }
        // GetVariable(4) : vTYPHOON_LO_NEW
        if (vEXT_INTENSIVE.GetVariable(4).text) {
            try {
                if ('-' != vEXT_INTENSIVE.GetVariable(4).text && '' != vEXT_INTENSIVE.GetVariable(4).text && null != vEXT_INTENSIVE.GetVariable(4).text) {
                    vTYPHOON_LO_NEW = JSON.parse(vEXT_INTENSIVE.GetVariable(4).text);
                    console.log('vTYPHOON_LO_NEW', vTYPHOON_LO_NEW);
                } else {
                    vTYPHOON_LO_NEW = [];
                }
            } catch (e) {
                IsChkCnt++;
                console.log("can't get vTYPHOON_LO_NEW data : ", e);
            }
        }
        // GetVariable(5) : vVESSEL_CURR_LOC
        if (vEXT_INTENSIVE.GetVariable(5).text) {
            try {
                if ('-' != vEXT_INTENSIVE.GetVariable(5).text && '' != vEXT_INTENSIVE.GetVariable(5).text && null != vEXT_INTENSIVE.GetVariable(5).text) {
                    vVESSEL_CURR_LOC = JSON.parse(vEXT_INTENSIVE.GetVariable(5).text);
                } else {
                    vVESSEL_CURR_LOC = [];
                }
            } catch (e) {
                IsChkCnt++;
                console.log("can't get vVESSEL_CURR_LOC data : ", e);
            }
        }

        // GetVariable(6) : vINCIDENT
        if (vEXT_INTENSIVE.GetVariable(6).text) {
            try {
                if ('-' != vEXT_INTENSIVE.GetVariable(6).text && '' != vEXT_INTENSIVE.GetVariable(6).text && null != vEXT_INTENSIVE.GetVariable(6).text) {
                    vINCIDENT = JSON.parse(vEXT_INTENSIVE.GetVariable(6).text);
                    console.log('vINCIDENT', vINCIDENT);
                } else {
                    vINCIDENT = [];
                }
            } catch (e) {
                IsChkCnt++;
                console.log("can't get vINCIDENT data : ", e);
            }
        }
  // GetVariable(8) : vNEWS
  if (vEXT_INTENSIVE.GetVariable(8).text) {
      try {
          if ('-' != vEXT_INTENSIVE.GetVariable(8).text && '' != vEXT_INTENSIVE.GetVariable(8).text && null != vEXT_INTENSIVE.GetVariable(8).text) {
              vNEWS = JSON.parse(vEXT_INTENSIVE.GetVariable(8).text);
              console.log('vNEWS', vNEWS);
          } else {
              vNEWS = [];
          }
      } catch (e) {
          IsChkCnt++;
          console.log("can't get vNEWS data : ", e);
      }
  }
  // GetVariable(10) : vPOLYGON : polygon(다각형) 그릴 데이터
  if (vEXT_INTENSIVE.GetVariable(10).text) {
      try {
                if ('-' != vEXT_INTENSIVE.GetVariable(10).text && '' != vEXT_INTENSIVE.GetVariable(10).text && null != vEXT_INTENSIVE.GetVariable(10).text) {
                    vPOLYGON = JSON.parse(vEXT_INTENSIVE.GetVariable(10).text);
                } else {
                    vPOLYGON = []; // 데이터가 없으면 담지 않는다.
                }
            } catch (e) {
                IsChkCnt++;
                console.log("can't get vPOLYGON data : ", e);
            }
        }
    } else {
        IsChkCnt++;
        console.log('No Data..');
    }


    cqv.GetAllVariables(function(variables) {
        //onload와 같은 기능 --------------------------------------시작
        //console.log(variables);

        $_VAR = {};
        $.each(variables, function($key, $value) {
            $_VAR[$value["name"]] = $value["value"];
        });
        console.log($_VAR);
    });

}

//grid click logic ============================================================================================ end

Qva.LoadCSS(QvOSM_exUrl + "css/Style.css");
Qva.LoadCSS(QvOSM_exUrl + "css/ol.css");
Qva.LoadCSS(QvOSM_exUrl + "css/bootstrap.min.css");

Qva.LoadScript(QvOSM_exUrl + "js/jquery.marquee.js", function() {
            Qva.LoadScript(QvOSM_exUrl + "js/d3.v3.min.js", function() {
                        Qva.LoadScript(QvOSM_exUrl + "js/ol.js", function() {
                                    ol = ol;

                                    // 지도 그리기
                                    var drawMap = function() {
                                        //console.log(uId);
                                        var frmW = $target.GetWidth();
                                        var frmH = $target.GetHeight();
                                        var mapTypeSeq = 0;

                                        if (vMAPTYPE != null) {
                                            switch (vMAPTYPE.toLowerCase()) {
                                                case "satelite":
                                                    mapTypeSeq = 1; //"layersTn";
                                                    break;
                                                case "dark":
                                                    mapTypeSeq = 2; //"layersMb";
                                                    break;
                                                case "basic":
                                                    mapTypeSeq = 3; //"layersMb2";
                                                    break;
                                                case "lightblue":
                                                    mapTypeSeq = 0; //"layersOSM";
                                                    break;
                                                default:
                                                    mapTypeSeq = 3; //"layersMb2";
                                            }
                                        }

                                        //$target.Element.innerHTML = '<div id="' + uId + '" class="map" style="width:' + frmW + 'px;height:' + frmH + 'px;"></div>';

                                        var htmlString = "";
                htmlString += '<div id="pointPopup2" class="ol-popup"><div class="ol-popup-title"><span class="ol-popup-headtitle-content" style="color:#FFFFFF;"></span><span class="ol-popup-title-content" style="color:#FFFFFF;"></span></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;"></a><div id="popup-content" style="white-space:pre-line;"></div></div><div id="geo-marker"></div>' +
                    '<div id="' + uId + '" class="map" style="width:' + frmW + 'px;height:' + frmH + 'px;"></div>' +
                    '</div>';
                htmlString += '<div id="pointPopup" class="ol-popup" idx="-1" style="display:none;"><div class="ol-popup-title"><div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div><div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"><span id="btn_prev">◀</span><font id="disp_step" style="margin-left:2px;margin-right:2px;font-weight:normal;"></font><span id="btn_next">▶</span></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>' +
                    '<div id="' + uId + '" class="map" style="width:' + frmW + 'px;height:' + frmH + 'px;"></div>' +
                    '</div>';
                htmlString += '<div id="map_position" style="position:absolute;bottom: 10px;right: 50px;color:#ffffff;background:rgba(131, 151, 169, 0.5);"></div>';
                htmlString += '<div id="map_position_append_wrap" style="display:none;position:absolute;bottom:10px;right:50px;background:rgba(131, 151, 169, 0.5);max-height:150px;padding-top:10px;padding-left:10px;"><textarea id="map_position_append" style="width:180px;height:110px;border:none;background: transparent;" readonly="readonly"></textarea></div>';
                htmlString += '<div id="tooltip"></div>';

                $target.Element.innerHTML = htmlString;

                var detail_pointPopup = '<div id="detail_pointPopup" class="ol-popup incident" idx="-1" style="z-index:99;background-color:none !important;position:absolute;left:0px;top:0px;height:10px;display:none;"><div class="ol-popup-title"><div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div><div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"></div></div><a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a><div id="popup-content"></div></div><div id="geo-marker"></div>' +
                    '<div id="' + uId + '" class="map" style="width:' + frmW + 'px;height:' + frmH + 'px;"></div>' +
                    '</div>';
                $("#detail_pointPopup").remove();
                $("body").append(detail_pointPopup);

                                        try {
                                            QvOSM_INTENSIVE_MAP = new ol.Map({
                                                layers: [
                                                    new ol.layer.Tile({
                                                        visible: true,
                                                        source: new ol.source.XYZ({
                                                            tileSize: [512, 512],
                                                            url: mapTypeUrl[mapTypeSeq]
                                                        })
                                                    })
                                                ],
                                                controls: ol.control.defaults().extend([
                                                    new ol.control.Zoom()
                                                ]),
                                                interactions: ol.interaction.defaults({ doubleClickZoom: false }),
                                                target: uId,
                                                view: new ol.View({
                                                    center: ol.proj.transform([127, 38], 'EPSG:4326', 'EPSG:3857'),
                                                    zoom: 3,
                                                    minZoom: 2,
                                                    maxZoom: 17
                                                })

                                            });
                                        } catch (e) {
                                            console.log(e);
                                        }


                                        /******************************************************************************/
                                        $("#marker").html("");
                                        QvOSM_INTENSIVE_MAP.getOverlays().clear();


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

                                        QvOSM_INTENSIVE_MAP.addOverlay(pointPopup);
                                        QvOSM_INTENSIVE_MAP.addOverlay(pointPopup2);

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

                                        //QvOSM_INTENSIVE_MAP.getInteractions().extend([select]);
                                        QvOSM_INTENSIVE_MAP.addInteraction(select);



                                        QvOSM_INTENSIVE_MAP.un("dblclick");
                                        QvOSM_INTENSIVE_MAP.on("dblclick", function(evt) {
                                            select.getFeatures().clear();
                                            var info = QvOSM_INTENSIVE_MAP.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                                                select.getFeatures().push(feature);
                                                return feature;
                                            });



                                        });




                                        //싱슬 클릭시 이벤트t
                                        QvOSM_INTENSIVE_MAP.un("singleclick");
                                        QvOSM_INTENSIVE_MAP.on("singleclick", function(evt) {
                                            select.getFeatures().clear();

                                            var coordinate = evt.coordinate;
                                            // console.log(coordinate);

                                            $("#pointPopup").attr("data", "");
                                            $("#pointPopup").height("");

                                            //draggable에 의한 위치 초기화
                                            $("#pointPopup").attr("style", "");




                                            //좌표로직
                                            var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                                            var str = $("#map_position_append").text();
                                            var str_arr = str.split("\n");
                                            var appnd = "";

                                            if (str_arr.length > 4) {
                                                delete str_arr[0];
                                                str_arr = $.grep(str_arr, function(n) { return (n) });
                                            }
                                            $.each(str_arr, function($k, $v) {

                                                appnd += appnd == "" ? $v : "\n" + $v;

                                            });
                                            appnd += appnd == "" ? "[ " + coord[1].toFixed(6) + " , " + coord[0].toFixed(6) + " ]" : "\n" + "[ " + coord[1].toFixed(6) + " , " + coord[0].toFixed(6) + " ]";
                                            $("#map_position_append").text(appnd);


                                            var popup = null;
                                            var type = null;
                                            var vsl_nm = null;

                                            var info = QvOSM_INTENSIVE_MAP.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                                                select.getFeatures().push(feature);

                                                if (feature.get("type") || (feature.get("ref") && feature.get("ref")["type"] && 'route' != feature.get("ref")["type"])) {
                                                    //console.log(feature);
                                                    //$(".ol-popup-headtitle-content").html("<img style='width:20px;' src='"+QvOSM_exUrl+"icon/ship.png"+"'/>");

                                                    $("#pointPopup").addClass("incident");

                                                } else {
                                                    $("#pointPopup").removeClass("incident");
                                                }








                                                if (feature.get("type") == "vessel") {

                                                    popup = feature.get("popup") ? feature.get("popup") : feature.get("ref")["popup"];
                                                    type = feature.get("type") ? feature.get("type") : feature.get("ref")["type"];
                                                    vsl_nm = feature.get("tyKey") ? feature.get("tyKey") : feature.get("ref")["vsl_name"];


                                                    //console.log(feature);
                                                    //$(".ol-popup-headtitle-content").html("<img style='width:20px;' src='"+QvOSM_exUrl+"icon/ship.png"+"'/>");
                                                    $("#pointPopup2 .ol-popup-headtitle-content").html("");
                                                    $("#pointPopup2 .ol-popup-title-content").text(vsl_nm);

                                                    //typhoon rader :: popup and mmsi_no set
                                                    $("#pointPopup2 .ol-popup-title-content").off("click").on("click", function() {
                                                        //Qv.GetDocument("").SetVariable("vMMSI_NO",feature.get("mmsi"));
                                                        $("#pointPopup2 #popup-closer").trigger("click");
                                                    });

                                                    $("#pointPopup2").addClass("vessel");
                                                    $("#pointPopup2").removeClass("incident");

                                                } else {
                                                    $("#pointPopup2").removeClass("vessel");
                                                }






                                                return feature;

                                            });







                                            if (info != null && popup) {

                                                $("#pointPopup2 #popup-content").html('<p class="popup_content" style="width:300px;word-break: break-all;">' + popup + '</p>');
                                                $("#pointPopup2 .ol-popup-title-content").attr("def", type);
                                                $("#pointPopup2 .ol-popup .popup_content").attr("def", type);
                                                pointPopup2.setPosition(coordinate);
                                                $("#pointPopup2").show();
                                                return;
                                            } else {

                                                $("#pointPopup2 #popup-closer").trigger("click");
                                            }

                                            $("#pointPopup").css("top", _top);
                                            $("#pointPopup").css("left", _left);
                                            $("#pointPopup").draggable();







                                            var IsNews = info != null && (info.get("news_arr") != null || info.get("except_arr") != null) && (info.get("news_arr").length > 0 || info.get("except_arr").length > 0);

                                            if (IsNews == false) {
                                                var $info = info != null && info.get("ref") != null ? info.get("ref") : null;
                                                IsNews = $info != null && ($info["news_arr"] != null || $info["except_arr"] != null) && ($info["news_arr"].length > 0 || $info["except_arr"].length > 0);
                                            }
                                            if (info != null && info.get('ref') != null && info.get('ref')['type'] === 'route') IsNews = false;



                                            if (IsNews) {
                                                var obj = {};
                                                var $info = info.get("ref") != null ? info.get("ref") : null;
                                                if ($info != null) {
                                                    obj = {
                                                        type: "news",
                                                        lngtd: $info["lngtd"],
                                                        ltitde: $info["ltitde"],
                                                        incident_type1: $info["incident_type1"],
                                                        incident_type2: $info["incident_type2"],
                                                        news_arr: $info["news_arr"] ? $info["news_arr"] : new Array(),
                                                        except_arr: $info["except_arr"] ? $info["except_arr"] : new Array()
                                                    }
                                                } else {
                                                    obj = {
                                                        type: "news",
                                                        lngtd: info.get("lngtd"),
                                                        ltitde: info.get("ltitde"),
                                                        incident_type1: info.get("incident_type1"),
                                                        incident_type2: info.get("incident_type2"),
                                                        news_arr: info.get("news_arr") ? info.get("news_arr") : new Array(),
                                                        except_arr: info.get("except_arr") ? info.get("except_arr") : new Array()
                                                    }
                                                }

                                                // console.log(obj);

                                                $("#pointPopup").attr("type", "");
                                                $("#pointPopup .ol-popup-title").attr("type", "");
                                                $("#pointPopup").attr("idx", "-1");
                                                $("#pointPopup .ol-popup-headtitle-content").attr("title", "");
                                                $("#pointPopup .ol-popup-headtitle-content").html("");
                                                $("#pointPopup #disp_step").html("");
                                                $("#pointPopup #popup-content").empty();

                                                function btn_next($data) {
                                                    // console.log($data);


                                                    var $type = $("#pointPopup").attr("type") != "" ? $("#pointPopup").attr("type") : $data["type"];
                                                    var $idx = $("#pointPopup").attr("idx");

                                                    var $next_idx = parseInt($idx) + 1;
                                                    var $direction = $("#pointPopup").attr("prev") == 1 ? "prev" : "next";

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

                                                        // console.log("direction :: "+$direction+" , "+$("#pointPopup").attr("prev"));
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


                                                    $("#pointPopup").attr("idx", $next_idx);
                                                    $("#pointPopup").attr("totalcount", $totalcount);
                                                    if ($totalcount > 1) $("#pointPopup #disp_step").html($curr_idx + " of " + $totalcount);
                                                    else $("#pointPopup #disp_step").html("");

                                                    // console.log("$idx :: "+$idx);
                                                    // console.log("$curr_idx :: "+$curr_idx);
                                                    // console.log("$totalcount :: "+$totalcount);


                                                    if ($type == "news") { //news popup 최초 그리는 부분

                                                        $("#pointPopup").attr("type", $curr_data["type"]);
                                                        $("#pointPopup .ol-popup-title").attr("type", $curr_data["type"]);
                                                        $("#pointPopup .ol-popup-headtitle-content").attr("title", $curr_data["excp_nm"]);
                                                        $("#pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm"]);

                                                        var str = "<table style='width:580px;'>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='occur_dt' style='float:left;'></div>" +
                                                            "<div class='location_icon' style='float:right;'><img style='height:20px;' src='" + QvOSM_exUrl + "icon/location_50.png' /></div>" +
                                                            "<div class='location' style='float:right;'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='valid_dt'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='source'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='container_cnt'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "</br>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='title'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "</br>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='cont'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "</table>";


                                                        $("#pointPopup #popup-content").html(str);

                                                        var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
                                                        var vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
                                                        $("#pointPopup #popup-content .occur_dt").html("Created on : " + ocdt);
                                                        $("#pointPopup #popup-content .location").html($curr_data["loc_nm"]);
                                                        $("#pointPopup #popup-content .title").html($curr_data["title"]);
                                                        $("#pointPopup #popup-content .source").html("Source : " + $curr_data["source"]);
                                                        $("#pointPopup #popup-content .valid_dt").html("Valid until : " + vdt);
                                                        //                              $("#pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially Affected Cargos : "+$curr_data["container_cnt"]+" container(s)" : ""));

                                                        $("#pointPopup #popup-content .container_cnt").css("cursor", "").css("text-decoration", "").off("click");

                                                        //2019.04.30 16:30 팝업에서 conatiner cnt 선택시, 값 전달 제거 (여기는 이런 기능 없음)
                                                        /*if($curr_data["container_cnt"]>0)
                                                        $("#pointPopup #popup-content .container_cnt").css("cursor","pointer").css("text-decoration","underline").off("click").on("click",function(){
                                                            console.log("=====qlikview popup show===================================");
                                                            console.log($curr_data);

                                                            //위치를 오른쪽으로 이동하여 왼쪽에 팝업과 나란히 배치한다. 시작
                                                            $("#pointPopup").height("");
                                                            $("#pointPopup").attr("style","");
                                                            //QvOSM_INTENSIVE_MAP.getView().setZoom(3);
                                                            //pointPopup.setPosition(coordinate);
                                                            //위치를 오른쪽으로 이동하여 왼쪽에 팝업과 나란히 배치한다. 끝
                                                            console.log($curr_data["id"]);
                                                            console.log($curr_data["loc_cd"]);
                                                            //QvOSM_INTENSIVE_MAP.getView().setCenter([coordinate[0]-6500000,coordinate[1]+3000000]);
                                                            Qv.GetCurrentDocument().SetVariable("vID",$curr_data["id"]);
                                                            Qv.GetCurrentDocument().SetVariable("vLOC_CD",$curr_data["loc_cd"]);
                                                            console.log("=====qlikview popup show===================================");
                                                        });*/

                                                        var $contents_arr = $curr_data["cont"].split("[read more](");
                                                        // console.log($contents_arr);

                                                        var $contents = $contents_arr[0];
                                                        var $read_more = "";
                                                        try {
                                                            if ($contents_arr[1] != null) {
                                                                var $url = $.trim($contents_arr[1]).substr(0, $contents_arr[1].length - 1);
                                                                $read_more = "<a href='" + $url + "' target=_blank>[read more]</a>";
                                                            }
                                                        } catch (e) {

                                                        }

                                                        $("#pointPopup #popup-content .cont").html($contents + $read_more);

                                                    } else {

                                                        $("#pointPopup").attr("type", $curr_data["type"]);
                                                        $("#pointPopup .ol-popup-title").attr("type", $curr_data["type"]);
                                                        $("#pointPopup .ol-popup-headtitle-content").attr("title", $curr_data["excp_nm4"]);
                                                        $("#pointPopup .ol-popup-headtitle-content").html($curr_data["excp_nm4"]);

                                                        var str = "<table style='width:580px;'>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='occur_dt' style='float:left;'></div>" +
                                                            "<div class='location_icon' style='float:right;'><img style='height:20px;' src='" + QvOSM_exUrl + "icon/location_50.png' /></div>" +
                                                            "<div class='location' style='float:right;'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "</br>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='title'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='container_cnt'></div>" +
                                                            "</td>" +
                                                            "</tr>"
                                                            /*
                                                            +"<tr>"
                                                                +"<td>"
                                                                    +"<div class='vessel_nm'></div>"
                                                                +"</td>"
                                                            +"</tr>"
                                                            */
                                                            +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "</br>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td><div style='color:#006ca2;font-weight:bold;'>Reason(s)</div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "<div class='excp_nm4'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "</br>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td><div style='color:#006ca2;font-weight:bold;'>Reason Detail</div>" +
                                                            "<div class='reason'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td>" +
                                                            "</br>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "<tr>" +
                                                            "<td><div style='color:#006ca2;font-weight:bold;'>Action & Prevention Measure</div>" +
                                                            "<div class='action'></div>" +
                                                            "</td>" +
                                                            "</tr>" +
                                                            "</table>";


                                                        $("#pointPopup #popup-content").html(str);

                                                        var ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                                                        $("#pointPopup #popup-content .occur_dt").html(ocdt);
                                                        $("#pointPopup #popup-content .location").html($curr_data["loc_nm2"] + " (" + $curr_data["step"] + ")");
                                                        $("#pointPopup #popup-content .title").html($curr_data["title"]);
                                                        //$("#pointPopup #popup-content .vessel_nm").html($curr_data["vessel_nm"]);
                                                        $("#pointPopup #popup-content .excp_nm4").html($curr_data["excp_nm4"]);
                                                        $("#pointPopup #popup-content .reason").html(($curr_data["reason"] ? $curr_data["reason"] : ""));
                                                        $("#pointPopup #popup-content .action").html(($curr_data["action"] ? $curr_data["action"] : ""));
                                                        //                          $("#pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially Affected Cargos : "+$curr_data["container_cnt"]+" container(s)" : ""));


                                                    }

                                                    $("#pointPopup #btn_next").show();
                                                    $("#pointPopup #btn_prev").show();
                                                    if ($totalcount > 1) {
                                                        $("#pointPopup #btn_next").off("click").on("click", function() {
                                                            $("#pointPopup").attr("prev", 0);
                                                            btn_next(obj);
                                                        });
                                                        $("#pointPopup #btn_prev").off("click").on("click", function() {
                                                            $("#pointPopup").attr("prev", 1);
                                                            btn_next(obj);
                                                        });
                                                    } else {
                                                        $("#pointPopup #btn_next").hide();
                                                        $("#pointPopup #btn_prev").hide();
                                                    }


                                                    pointPopup.setPosition(coordinate);

                                                    $("#pointPopup").draggable();
                                                    $("#pointPopup").height("");
                                                    $("#pointPopup").show();
                                                    $("#Document_CH03").off("click").on("click", function() {
                                                        $("#pointPopup").hide();
                                                        $("#ticker_pointPopup").hide();
                                                    });

                                                }



                                                btn_next(obj);




                                            } else {

                                                $("#popup-closer").trigger("click");
                                                $("#pointPopup").hide();

                                            }

                                            if (vVIEW_RISK == "N") {
                                                if (info != null && info.get("ref") != null) {
                                                    if (info.get("ref")["loc_cd"] != null) {
                                                        Qv.GetCurrentDocument().SetVariable("vLOC_CD", info.get("ref")["loc_cd"]);
                                                    }
                                                } else if ($_VAR["vLOC_CD"] != "") {
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

                                        overlay.setMap(QvOSM_INTENSIVE_MAP);

                                        // 툴팁
                                        QvOSM_INTENSIVE_MAP.un("pointermove");
                                        QvOSM_INTENSIVE_MAP.on('pointermove', function(evt) {
                                            select.getFeatures().clear();

                                            var info = QvOSM_INTENSIVE_MAP.forEachFeatureAtPixel(evt.pixel, function(feature) {
                                                overlay.setPosition(evt.coordinate);
                                                return feature;
                                            });


                                            var coordinate = evt.coordinate;
                                            var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                                            $("#map_position").html("[ " + coord[1].toFixed(6) + " , " + coord[0].toFixed(6) + " ]");


                                            if (info != null && info.get("ref") && info.get("ref")["tooltip"] || info != null && info.get("tooltip")) {
                                                document.body.style.cursor = 'pointer';
                                                overlay.getElement().innerHTML = info.get("tooltip") != null ? info.get("tooltip") : info.get("ref")["tooltip"];
                                                overlay.getElement().style.display = 'inline-block';
                                            } else {
                                                overlay.getElement().style.display = 'none';
                                                document.body.style.cursor = '';
                                            }



                                        });

                                        function onZoom(evt) {
                                            var view = evt.target;

                                            if (oldZoom == view.getZoom()) {

                                            } else if (view.getZoom() > 4) {
                                                vesselZoom = 2
                                                if (vesselLayer) vesselLayer.changed();
                                            } else {
                                                vesselZoom = 1
                                                if (vesselLayer) vesselLayer.changed();
                                            }

                                            if (oldZoom != view.getZoom()) {
                                                if (DRAW_TIM) clearTimeout(DRAW_TIM);

                                                DRAW_TIM = setTimeout(function() {
                                                    if (vVIEW_RISK == "N") {
                                                        removeLayer("score");
                                                        showRiskScore();
                                                    }
                                                }, 500);

                                            }
                                            oldZoom = view.getZoom();
                                        }
                                        //console.log(vesselZoom);
                                        QvOSM_INTENSIVE_MAP.getView().on('propertychange', onZoom);
                                        oldMAPTYPE = vMAPTYPE;
                                        /*******************************************************************************/
                                    };

var createIncidentIcon = function(rotation, scale, name, fontstyle, fontcolor) {
        var _font = fontstyle == null ? '10px Calibri,sans-serif' : fontstyle;

        var obj = {
                image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
                    scale: scale ? scale : 1,
                    src: QvOSM_exUrl + 'icon/news_marker_sel.png',
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
                            })                })
                };

                var ret = new ol.style.Style(obj);
                ret.setZIndex(zIndex++);

                return ret;
            };

            Qva.AddExtension(ExName, function() {

                $target = this;
                //console.log(this);
                //console.log(vEXT_INTENSIVE);

                //onload와 같은 기능 --------------------------------------시작
                var varsRetrieved = false;
                cqv.SetOnUpdateComplete(function() {
                    if (!varsRetrieved) {
                        IsChkCnt = 0;
                        getVariable();

                        uId = $target.Layout.ObjectId.replace("\\", "_");
                        if (!window[uId]) window[uId] = {};
                        window[uId]["id"] = uId;

                        if (!$target.framecreated) {
                            drawMap();
                            $target.framecreated = true;
                        }

                        setTyphoonData();
                        setTyphoonIcon();
                        showTyphoonIcon();
                        setIncidentData();
                        drawIncident();


                        varsRetrieved = true;
                    }
                });
                //onload와 같은 기능 --------------------------------------끝

            });

        });
    });
});