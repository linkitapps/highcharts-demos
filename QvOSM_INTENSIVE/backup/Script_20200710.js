'use strict'
const ExName = "QvOSM_INTENSIVE";
const QvOSM_exUrl = "/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/" + ExName + "/";

const cqv = Qv.GetDocument("");
const vEXT_INTENSIVE = cqv.GetObject("vEXT_INTENSIVE");
const mapTypeUrl = ['https://api.mapbox.com/styles/v1/seungok/ciouskftw003jcpnn296ackea/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg', 'https://api.mapbox.com/styles/v1/seungok/ciousf1zl003sdqnfpcpfj19r/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg', 'https://api.mapbox.com/styles/v1/seungok/cip7yoxzy0029dnm5n040qd0q/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V1bmdvayIsImEiOiJjaW5oN3A4dWYwc2dxdHRtM2pzdDdqbGtvIn0.JLtJmHeZNzC5gg_4Z6ioZg', 'https://api.mapbox.com/styles/v1/yhy878/cj0nkfsv7004c2slfyernovxx/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWh5ODc4IiwiYSI6ImNpam04Mm5jaTAwOWJ0aG01d2hlb2FpYXEifQ.kzx9H8IeBBk_zCvvF91Rtg'];
let QvOSM_INTENSIVE_MAP;

let vRoute_YN;
let vSHOW_NEWS;
let vMAPTYPE;
let vVIEW_RISK;
let vTYPHOON_LO_NEW;
let vVESSEL_CURR_LOC;
let vINCIDENT;
let vROUTE;
let vNEWS;
let vPORT_NEWS;
let vPOLYGON;
let vCONDITION_FLAG;
let vPATH;
let vPATH_VALUE;
let $_VAR;

let $target;
let uId;

let IsChkCnt = 0;

var vesselLabelOverlay = [];
var routeOverlay = [];
var routeZoom = false;

let vesselDataArr = [];
let vesselLayer;
let typhoonDataArr = [];
let typhoonLayer;
let typhoonIconArr = [];
let incidentDataArr = [];
let incidentLayer;
let routeDataArr = [];
let routeLayer;

let offy = 15;
let oldMAPTYPE;
let oldZoom;
let vesselZoom;
let DRAW_TIM;

let zIndex = 0;
let SOURCE_OBJ = {};
let LAYER_OBJ = {};

let QvOSM_PVM_Design_Opt = JSON.parse('{"typhoon":{"50knot":{"color":"rgba(225, 30, 30, 0.4)"},"34knot":{"color":"rgba(30, 30, 225, 0.1)"},"line":{"color":"rgba(225, 50, 50, 0.9)","width":5}}}');

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

// 함수
let drawLine = function(id, obj, route_arr, width, zoomlevel, linecolor, linestyle, descript, offsetX, offsetY, textAlign, fontstyle, fontcolor) {

    //zoom level에 따른 거리를 수동으로 정리
    let arr = new Array(0, 0.0375, 0.075, 0.2, 0.375, 0.575, 1, 1.8, 3.7, 7, 14.15, 28.3, 55.5, 111, 222, 460, 900, 900);
    let nwidth = zoomlevel == null ? width : arr[zoomlevel] * width * 2; //threshold값은 한쪽의 폭을 얘기하므로 2배를 해줘야 한다
    let crdnt2 = route_arr;
    let geojsonObject2 = {
        'type': 'FeatureCollection',
        'crs': {
            'type': 'name',
            'properties': {
                'name': 'EPSG:4326'
            }
        },
        'features': []
    };
    let geoFeatures2 = (new ol.format.GeoJSON()).readFeatures(geojsonObject2);
    let geoStyle_obj;
    let style_obj;
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
            let feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': obj["polygon"]
                }
            };
            geojsonObject2["features"] = [feature];
            let ff;
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

    let lLines2 = [];

    if (SOURCE_OBJ[id] == null) {
        SOURCE_OBJ[id] = new ol.source.Vector({
            features: geoFeatures2
        });
    }

    let lFea2 = new ol.Feature({
        geometry: geoStyle_obj,
        name: obj["key"]
    });

    style_obj.setZIndex(zIndex++);

    lFea2.set("ref", obj);
    lFea2.set("style", style_obj);

    lLines2.push(lFea2);
    SOURCE_OBJ[id].addFeatures(lLines2);
};

let addLayer = function($target) {
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

let setVesselData = function() {
    vesselDataArr = new Array();
    $.each(vVESSEL_CURR_LOC, function(indx, vVESSEL) {
        // console.log(this);

        let name = (vVESSEL["KEY_TYPHOON"]) ? vVESSEL["KEY_TYPHOON"] : "-";
        let lat = (vVESSEL["LTITDE"]) ? vVESSEL["LTITDE"] : "0";
        let lon = (vVESSEL["LNGTD"]) ? vVESSEL["LNGTD"] : "0";
        let vDirect = (vVESSEL["DIRECTION"]) ? vVESSEL["DIRECTION"].text : "0";
        let inout = (vVESSEL["INOUT_IMG_NO"]) ? vVESSEL["INOUT_IMG_NO"] : "-";
        let type = (vVESSEL["GUBUN_VT"]) ? vVESSEL["GUBUN_VT"] : "-";
        let mmsi = (vVESSEL["MMSI_NO"]) ? vVESSEL["MMSI_NO"] : "0";
        let aniYN = "Y";
        let popup = (vVESSEL["DESCRIPT"]) ? vVESSEL["DESCRIPT"] : "-";

        if (type === "VESSEL") {
            inout = inout.replace("BROKEN", "MOVING");
            inout = inout.replace("NOTMOVING", "MOVING");
            inout = inout.replace("MOVING", "MOVING");
            inout = inout.replace("Gray", "MOVING");

            let vesselObj = {
                name: name,
                point: [parseFloat(lon), parseFloat(lat)],
                direction: vDirect,
                inout: inout,
                popup: popup,
                mmsi: mmsi,
                aniYN: aniYN
            };

            vesselDataArr.push(vesselObj);
        }
    });
}

let createVesselIcon = function(style, icon, rotation, scale, name, offx, offy) {
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

    //console.log(QvOSM_exUrl + 'icon/' + imageicon + '.png');
    var obj = {
        image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
            scale: scale ? scale : 1,
            src: QvOSM_exUrl + 'icon/' + imageicon + '.png',
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

let showVesselIcon = function() {
    let vIconFeas = [];
    let vd_i = 0,
        vdLength = vesselDataArr.length;
    for (; vd_i < vdLength; vd_i++) {
        let truepoint = vesselDataArr[vd_i].point;
        let point = ol.proj.fromLonLat(vesselDataArr[vd_i].point);
        let vIconFea = new ol.Feature(new ol.geom.Point(point));
        vIconFea.set('mmsi', vesselDataArr[vd_i].mmsi);
        vIconFea.set('tyKey', vesselDataArr[vd_i].name);
        vIconFea.set('popup', vesselDataArr[vd_i].popup);
        vIconFea.set('point1', truepoint);
        vIconFea.set('type', "vessel");
        vIconFea.set('style', createVesselIcon("normal", "Vessel_" + vesselDataArr[vd_i].inout, vesselDataArr[vd_i].direction, 0.8));
        vIconFea.set('sel_style', createVesselIcon("zoom", "Vessel_" + vesselDataArr[vd_i].inout + "", vesselDataArr[vd_i].direction, 0.8));
        vIconFea.set('zoom_style', createVesselIcon("zoom", "Vessel_" + vesselDataArr[vd_i].inout + "", vesselDataArr[vd_i].direction, 0.8));
        vIconFea.set('namestyle', createVesselIcon("normal", "Vessel_" + vesselDataArr[vd_i].inout, vesselDataArr[vd_i].direction, 0.8, vesselDataArr[vd_i].name, 0, offy));
        vIconFea.set('zoom_namestyle', createVesselIcon("zoom", "Vessel_" + vesselDataArr[vd_i].inout, vesselDataArr[vd_i].direction, 0.8, vesselDataArr[vd_i].name, 0, offy));

        offy = (offy === 15) ? 22 : 15;
        if (vesselDataArr[vd_i].aniYN === 'Y') {
            vIconFea.set('key', vesselDataArr[vd_i].name);
            vIconFea.set('point', point);
        }

        vIconFeas.push(vIconFea);
    }

    console.log(vIconFeas);

    let vIconVector = new ol.source.Vector({
        features: vIconFeas
    });

    vesselLayer = QvOSM_INTENSIVE_MAP.removeLayer(vesselLayer);

    vesselLayer = new ol.layer.Vector({
        style: function(feature) {
            if (vesselZoom == 1) {
                feature.get('style');
            } else {
                feature.get('zoom_style');
            }
        },
        source: vIconVector
    });
    QvOSM_INTENSIVE_MAP.addLayer(vesselLayer);
};

let setTyphoonData = function() {
    typhoonDataArr = new Array();

    try {
        $.each(vTYPHOON_LO_NEW, function(indx, vTYPHOON) {

            let obj = {
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
let setTyphoonIcon = function() {

    typhoonIconArr = new Array();

    //변수, 함수 초기화
    let pi2 = Math.PI / 2;
    let pi2Q = [];
    for (let oi = 1; oi < 5; oi++) { //원 4등분;
        pi2Q.push(pi2 * oi);
    }
    let rotate = 45;
    let step = 0.1; //좌표의 간격;
    //distance - meter, bearing - 방위 360도
    let destinationPoint = function(lon, lat, distance, bearing, radius) {
        radius = (radius === undefined) ? 6371e3 : Number(radius);

        // vPhi2 = asin( sinvPhi1⋅cosvDelta + cosvPhi1⋅sinvDelta⋅cosvTheta )
        // vLambda2 = vLambda1 + atan2( sinvTheta⋅sinvDelta⋅cosvPhi1, cosvDelta − sinvPhi1⋅sinvPhi2 )
        // see http://williams.best.vwh.net/avform.htm#LL

        let vDelta = Number(distance) / radius; // angular distance in radians
        let vTheta = Number(bearing) * Math.PI / 180;

        let vPhi1 = lat.toRadians();
        let vLambda1 = lon.toRadians();

        let vPhi2 = Math.asin(Math.sin(vPhi1) * Math.cos(vDelta) + Math.cos(vPhi1) * Math.sin(vDelta) * Math.cos(vTheta));
        let x = Math.cos(vDelta) - Math.sin(vPhi1) * Math.sin(vPhi2);
        let y = Math.sin(vTheta) * Math.sin(vDelta) * Math.cos(vPhi1);
        let vLambda2 = vLambda1 + Math.atan2(y, x);

        //[lon, lat]
        return [(vLambda2.toDegrees() + 540) % 360 - 180, vPhi2.toDegrees()]; // normalise to −180..+180°
    };

    //거리 구하기, x,y 값 배열 두개;
    let getDistance = function(pt, pt2) {
        //경위도 거리 차이 보정 X
        let x2 = Math.pow((pt[0] - pt2[0]), 2);
        let y2 = Math.pow((pt[1] - pt2[1]), 2);
        return Math.sqrt((x2 + y2));
    }

    //원 좌표구하기, 태풍위치, 북쪽, 남쪽, 동쪽, 서쪽 거리
    let getTypoonCoordinates = function(center, north, south, east, west) {

        //반경이 1/2 밖에 안되서 *2를 처리함 => km 단위 인거 같습니다. 2 => 1.852 로 변경합니다.
        let $unit = 1.852;

        north = north * $unit;
        south = south * $unit;
        east = east * $unit;
        west = west * $unit;

        let radiusN = north;
        let radiusS = south;
        let radiusE = east;
        let radiusW = west;

        let pointNE = destinationPoint(center[0], center[1], north * 1000, 45);
        let pointSW = destinationPoint(center[0], center[1], south * 1000, 225);

        center = ol.proj.fromLonLat(center);

        let radiusSN = [getDistance(center, ol.proj.fromLonLat(pointSW)), getDistance(center, ol.proj.fromLonLat(pointNE))]; //남북 거리;
        let elipse_R = [];

        //타원 비율
        elipse_R.push(radiusE / radiusS); //[0] 남동;
        elipse_R.push(radiusW / radiusS); //[1] 남서
        elipse_R.push(radiusW / radiusN); //[2] 북서
        elipse_R.push(radiusE / radiusN); //[3] 북동

        let xCent = center[0];
        let yCent = center[1];

        let list = [];
        let theta = 0;

        for (let j = 0; j < 4; j++) {
            let radius = radiusSN[parseInt(j / 2)];
            let elipseR = elipse_R[j];

            for (; theta < pi2Q[j]; theta += step) {
                let x = xCent + (elipseR * radius * Math.cos(theta));
                let y = yCent - radius * Math.sin(theta);
                list.push([x, y]);
            }
        }

        //list.push(ol.proj.fromLonLat([xCent, yCent]));

        //      console.log(list);

        return list;
        //return {"list":list, "center": ol.proj.fromLonLat([center[0], center[1]])};
    }

    let $key = "";
    let std_arr = new Array();
    let $IsCurr = false;
    let $lineStyle = "line";
    let $b4value = null;

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

        let ty_icon = "ty1_40_30";
        let ty_txt = $v["LOCAL_DT_TTHH"] + " (Grade : VS)";
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

        let $line_obj = null;
        if ($b4value != null) {
            //console.log( 'before : ', $b4value["LNGTD"] );
            //console.log( 'after : ', $v["LNGTD"] );
            let vLngTd;
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

let showTyphoonIcon = function() {
    zIndex = 0;

    if (typhoonIconArr.length > 0) {
        $.each(typhoonIconArr, function($key, $value) {
            $.each($value["data"], function($k, $v) {
                if ($v["line"] != null) {
                    let $obj = $v["line"];
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

            let typhoon_nm = "";
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

let setIncidentData = function() {
    incidentDataArr = new Array();
    $.each(vINCIDENT, function(indx, vIncident) {
        // console.log(vIncident);

        let lngtd = (vIncident["INCI_LNGTD"] && $.isNumeric(vIncident["INCI_LNGTD"])) ? parseFloat(vIncident["INCI_LNGTD"]) : "-"; //경도
        let ltitde = (vIncident["INCI_LTITDE"] && $.isNumeric(vIncident["INCI_LTITDE"])) ? parseFloat(vIncident["INCI_LTITDE"]) : "-"; //위도
        let loc_nm = (vIncident["INCI_LOC_NM"]) ? vIncident["INCI_LOC_NM"] : ""; //명칭
        let incident_type2 = (vIncident["INCIDENT_TYPE2"]) ? vIncident["INCIDENT_TYPE2"] : ""; //명칭
        let except_cnt = (vIncident["INCIDENT_TYPE2"] && $.isNumeric(vIncident["INCI_EXCT_CNT"])) ? parseInt(vIncident["INCI_EXCT_CNT"]) : 0; //exception 갯수
        let news_cnt = (vIncident["INCI_EXCT_CNT"] && $.isNumeric(vIncident["INCI_NEWS_CNT"])) ? parseInt(vIncident["INCI_NEWS_CNT"]) : 0; //news 갯수
        let total_cnt = news_cnt + except_cnt;
        let type = "news";
        let icon = "news_marker";
        let color = "#ed7d31";
        let excp_cd = 'EXE_' + vIncident["INCI_EXCP_CD"];

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


        let incidentObj = {
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

            let news_no = ($value["ID"]) ? $value["ID"] : "";
            let lngtd = ($value["NEWS_LNGTD"] && $.isNumeric($value["NEWS_LNGTD"])) ? parseFloat($value["NEWS_LNGTD"]) : "-"; //경도
            let ltitde = ($value["NEWS_LTITDE"] && $.isNumeric($value["NEWS_LTITDE"])) ? parseFloat($value["NEWS_LTITDE"]) : "-"; //위도
            let loc_nm = ($value["NEWS_ENG_LOC_NM"]) ? $value["NEWS_ENG_LOC_NM"] : ""; //명칭
            let title = ($value["SUBJECT"]) ? $value["SUBJECT"] : ""; //exception title
            let loc_nm2 = ($value["NEWS_ENG_LOC_NM_STR"]) ? $value["NEWS_ENG_LOC_NM_STR"] : ""; //발생도시
            let occur_dt = ($value["CRT_DT_LOC"]) ? $value["CRT_DT_LOC"] : ""; //발생일
            let source = ($value["SOURCE"]) ? $value["SOURCE"] : ""; //source
            let valid_dt = ($value["VALID_DT_LOC"]) ? $value["VALID_DT_LOC"] : ""; //valid_dt
            let cont = ($value["BODY"]) ? $value["BODY"] : ""; //cont
            let container_cnt = ($value["NEWS_CNTR_CNT"] && $.isNumeric($value["NEWS_CNTR_CNT"])) ? $value["NEWS_CNTR_CNT"] : ""; //container_cnt
            let crt_dt_loc_sort = ($value["CRT_DT_LOC_SORT"]) ? $value["CRT_DT_LOC_SORT"] : ""; //crt_dt_loc_sort ticker에서 날짜 정렬하기 위한 용도로 다른데 사용하지 않음.
            let excp_nm = ($value["NEWS_EXCP_NM"]) ? $value["NEWS_EXCP_NM"] : ""; //excp_nm
            let id = ($value["INCID_ID"]) ? $value["INCID_ID"] : ""; //id container_no를 통해 팝업을 보여주기 위한 키로 id + loc_cd로 이루어져야 unique 하다
            let excp_cd = ($value["NEWS_EXCP_CD"]) ? $value["NEWS_EXCP_CD"] : ""; //excp_cd
            let newsMinLocYn = ($value["NEWS_MIN_LOC_YN"]) ? $value["NEWS_MIN_LOC_YN"] : ""; //NEWS_MIN_LOC_YN

            let newsObj = {
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
                    incidentDataArr[$k]["news_on"] = 1;

                    switch (incidentDataArr[$k]["excp_cd"]) {
                        case "EXE_0046":
                            incidentDataArr[$k]["icon"] = "EXE_0046";
                            incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                            break;
                        case "EXE_0055":
                            incidentDataArr[$k]["icon"] = "EXE_0055";
                            incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                            break;
                        case "EXE_0042":
                            incidentDataArr[$k]["icon"] = "EXE_0042";
                            incidentDataArr[$k]["color"] = "rgba(239, 85, 41, 1)";
                            break;
                        case "EXE_0038":
                            incidentDataArr[$k]["icon"] = "EXE_0038";
                            incidentDataArr[$k]["color"] = "rgba(246, 157, 10, 1)";
                            break;
                        case "EXE_0047":
                            incidentDataArr[$k]["icon"] = "EXE_0047";
                            incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                            break;
                        case "EXE_0043":
                            incidentDataArr[$k]["icon"] = "EXE_0043";
                            incidentDataArr[$k]["color"] = "rgba(239, 85, 41, 1)";
                            break;
                        case "EXE_0056":
                            incidentDataArr[$k]["icon"] = "EXE_0056";
                            incidentDataArr[$k]["color"] = "rgba(228, 0, 124, 1)";
                            break;
                        case "EXE_0044":
                            incidentDataArr[$k]["icon"] = "EXE_0044";
                            incidentDataArr[$k]["color"] = "rgba(239, 85, 41, 1)";
                            break;
                        case "EXE_0039":
                            incidentDataArr[$k]["icon"] = "EXE_0039";
                            incidentDataArr[$k]["color"] = "rgba(246, 157, 10, 1)";
                            break;
                        case "EXE_0040":
                            incidentDataArr[$k]["icon"] = "EXE_0040";
                            incidentDataArr[$k]["color"] = "rgba(246, 157, 10, 1)";
                            break;
                        case "EXE_0030":
                            incidentDataArr[$k]["icon"] = "EXE_0030";
                            incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                            break;
                        case "EXE_0032":
                            incidentDataArr[$k]["icon"] = "EXE_0032";
                            incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                            break;
                        case "EXE_0033":
                            incidentDataArr[$k]["icon"] = "EXE_0033";
                            incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                            break;
                        case "EXE_0048":
                            incidentDataArr[$k]["icon"] = "EXE_0048";
                            incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                            break;
                        case "EXE_0029":
                            incidentDataArr[$k]["icon"] = "EXE_0029";
                            incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                            break;
                        case "EXE_0037":
                            incidentDataArr[$k]["icon"] = "EXE_0037";
                            incidentDataArr[$k]["color"] = "rgba(143, 66, 174, 1)";
                            break;
                        case "EXE_0058":
                            incidentDataArr[$k]["icon"] = "EXE_0058";
                            incidentDataArr[$k]["color"] = "rgba(228, 0, 124, 1)";
                            break;
                        case "EXE_0057":
                            incidentDataArr[$k]["icon"] = "EXE_0057";
                            incidentDataArr[$k]["color"] = "rgba(228, 0, 124, 1)";
                            break;
                        case "EXE_0041":
                            incidentDataArr[$k]["icon"] = "EXE_0041";
                            incidentDataArr[$k]["color"] = "rgba(246, 157, 10, 1)";
                            break;
                        case "EXE_0049":
                            incidentDataArr[$k]["icon"] = "EXE_0049";
                            incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                            break;
                        case "EXE_0045":
                            incidentDataArr[$k]["icon"] = "EXE_0045";
                            incidentDataArr[$k]["color"] = "rgba(239, 85, 41, 1)";
                            break;
                        case "EXE_0050":
                            incidentDataArr[$k]["icon"] = "EXE_0050";
                            incidentDataArr[$k]["color"] = "rgba(0, 113, 160, 1)";
                            break;
                        case "EXE_ZZZZ":
                            incidentDataArr[$k]["icon"] = "EXE_ZZZZ";
                            incidentDataArr[$k]["color"] = "rgba(116, 116, 116, 1)";
                            break;
                    }
                }
            });
        });
    }
};
//news icon 용
let createIncidentIcon2 = function(icon, rotation, scale, name, fontstyle, fontcolor) {
    let _font = fontstyle == null ? '10px Calibri,sans-serif' : fontstyle;

    let obj = {
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

    let ret = new ol.style.Style(obj);
    ret.setZIndex(zIndex++);

    return ret;
};
let createIncidentIcon = function(icon, rotation, scale, name, fontstyle, fontcolor) {
    let _font = fontstyle == null ? '10px Calibri,sans-serif' : fontstyle;

    let obj = {
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

    let ret = new ol.style.Style(obj);
    ret.setZIndex(zIndex++);

    return ret;
};
let drawIncidentIcon = function(incidentObj) {
    let truepoint = incidentObj["pos"];
    let point = ol.proj.fromLonLat(incidentObj["pos"]);
    // console.log( 'point', incidentObj["pos"] );
    // console.log( 'incidentObj', incidentObj );
    //console.log(incidentObj["pos"]);


    let vIconFea = new ol.Feature(new ol.geom.Point(point));
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

    let tooltip = "";

    if (incidentObj["news_arr"] != null && incidentObj["news_arr"].length > 0) {
        let obj = incidentObj["news_arr"][0];

        let ocdt = obj["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');

        tooltip = "<div class='tooltip_title' style='font-weight:bold;'>" + obj["title"] + "</div>" +
            "<div class='tooltip_loc' style='float:left;width:200px;'>" + obj["loc_nm"] + "</div>" +
            "<div class='tooltip_dt' style='float:right;width:150px;text-align:right;'>" + ocdt + "</div>";

    }

    if (tooltip == "" && incidentObj["except_arr"] != null && incidentObj["except_arr"].length > 0) {
        let obj = incidentObj["except_arr"][0];

        let ocdt = obj["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');

        tooltip = "<div class='tooltip_title' style='font-weight:bold;'>" + obj["title"] + "</div>" +
            "<div class='tooltip_loc' style='float:left;width:200px;'>" + obj["loc_nm"] + "</div>" +
            "<div class='tooltip_dt' style='float:right;width:150px;text-align:right;'>" + ocdt + "</div>";

    }


    vIconFea.set('tooltip', tooltip);


    offy = (offy === 15) ? 22 : 15;

    //icon, rotation, scale, name, offx, offy
    let fontstyle = 'bold 16px Calibri,sans-serif';
    let fontcolor = incidentObj["color"];

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
let drawIncident = function() {
    try {
        zIndex = 0;

        incidentLayer = QvOSM_INTENSIVE_MAP.removeLayer(incidentLayer);
        if (incidentDataArr.length > 0) {

            let vIconFeas = [];

            //console.log(incidentDataArr.length);

            //let incidentDetail = JSON.parse(docObj.GetVariable(0).text);
            $.each(incidentDataArr, function($key, incidentObj) {
                //console.log(vIconFea);
                if (incidentObj["news_arr"].length > 0) {
                    for (let i = 0, news; news = incidentObj["news_arr"][i]; i++) {
                        if ((4 > QvOSM_INTENSIVE_MAP.getView().getZoom() && "Y" == news.newsMinLocYn) || 4 <= QvOSM_INTENSIVE_MAP.getView().getZoom()) {
                            let vIconFea = drawIncidentIcon(incidentObj);
                            //console.log(vIconFea);
                            vIconFeas.push(vIconFea);
                            break;
                        }
                    }
                } else if (incidentObj["except_arr"].length > 0) {
                    let vIconFea = drawIncidentIcon(incidentObj);
                    vIconFeas.push(vIconFea);
                }

            });
            let vIconVector = new ol.source.Vector({
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


        $(".Document_TOP_LAYER").css("border-right", "1px solid #191919");
        $(".Document_TOP_LAYER").css("border-left", "1px solid #191919");

    } catch (e) { console.log(e); }

};

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

    if (vPATH_VALUELength) {
        var vesselFeature = vesselLayer.getSource().getFeatures();
        for (var vFi = 0; vFi < vesselFeature.length; vFi++) {
            QvOSM_INTENSIVE_MAP.addOverlay(makeVesselLabel(vesselFeature[vFi]));
        }

    }

    //Feature 별 스타일 만들기, 함수로 만들어서 이름에 따라 아이콘 변경하기
    var styles = {
        'route_end': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#b1e545',
                width: 5

            })
        }),
        'route_ing': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#b1e545',
                width: 5,
                lineCap: "square",
                lineDash: [5, 10]
            })
        }),
        'icon': new ol.style.Style({
            image: new ol.style.Icon({
                //anchor: [0.5, 1],
                scale: 0.6,
                src: QvOSM_exUrl + "icon/spot.png"
            }),
            zIndex: 9999
        }),
        'exception': new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [1.5, 3],
                scale: 0.6,
                src: QvOSM_exUrl + "icon/notice.png"
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


                    src: QvOSM_exUrl + "icon/maker_" + step + ".png",

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
                    src: QvOSM_exUrl + "icon/method_" + mode + ex
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
        point1 = vPATH_VALUE[i].XY;

        //1. route feature 만들기
        if (i < vPATH_VALUELength - 1) {
            vPATH_VALUE[i + 1].XY = vPATH_VALUE[i + 1].XY.split(",");
            vPATH_VALUE[i + 1].XY[0] = parseFloat(vPATH_VALUE[i + 1].XY[0]);
            vPATH_VALUE[i + 1].XY[1] = parseFloat(vPATH_VALUE[i + 1].XY[1]);
            point2 = vPATH_VALUE[i + 1].XY;
            if (vPATH_VALUE[i].ROUTE == "") {
                if (Math.abs(point1[0] - point2[0]) > 200) {
                    if (point1[0] > 0 && point2[0] < 0) {
                        point2[0] = point2[0] + 360;
                    } else if (point1[0] < 0 && point2[0] > 0) {
                        point1[0] = point1[0] + 360;
                    }
                }
                arcCoordstyle = [vPATH_VALUE[i].STATUS, vPATH_VALUE[i + 1].STATUS];
                arcCoord = [ol.proj.fromLonLat(point1), ol.proj.fromLonLat(point2)];
            } else {
                arcCoord = getroutepathCoord(vPATH_VALUE[i].ROUTE);
                if (vPATH_VALUE[i].STATUS == "D") {
                    arcCoordstyle = getroutepathCoordstyle(arcCoord.length, "D");
                } else {
                    arcCoordstyle = getroutepathCoordstyle(arcCoord.length, "N");
                }

                if (vPATH_VALUE[i].ROUTE_AFTER) {
                    arcCoordafter = getroutepathCoord(vPATH_VALUE[i].ROUTE_AFTER);

                    arcCoordafterstyle = getroutepathCoordstyle(arcCoordafter.length, "N");

                    arcCoord = arcCoord.concat(arcCoordafter);
                    arcCoordstyle = arcCoordstyle.concat(arcCoordafterstyle);
                }

                arcCoord.unshift(point1);
                arcCoord.push(point2);

                arcCoord = getroutepathCoord2(arcCoord);

                arcCoordstyle.unshift(vPATH_VALUE[i].STATUS);
                arcCoordstyle.push(vPATH_VALUE[i + 1].STATUS);
            }
            console.log('arcCoord', arcCoord);





            //좌표들이 있으면
            if (arcCoord.length > 1) {
                arcCoordLength = arcCoord.length - 1;

                //4.운송수단 feature 만들기

                //애니메이션 좌표는 따로 저장
                if (vPATH_VALUE[i]["STATUS"] === "D" && vPATH_VALUE[i + 1]["STATUS"] === "N") {
                    aniCoord = arcCoord.slice(0);

                    //마지막 조금 남아있다 처음으로 돌아가기
                    for (var ai = 0; ai < 30; ai++) {
                        aniCoord.push(aniCoord[arcCoordLength]);
                    }

                } else {}

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
                    }



                }


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
        QvOSM_INTENSIVE_MAP.addOverlay(makerouteLabel(vPATH_VALUE[i]["DISP_DATE"], point1));

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


    var allFeatures = routeFea.concat(portFea, markerFea, transFea, excepFea, testCenter);

    routeLayer = QvOSM_INTENSIVE_MAP.removeLayer(routeLayer);
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
    QvOSM_INTENSIVE_MAP.addLayer(routeLayer);
    routeZoom = true;
    vesselZoom = 2
    vesselLayer.changed();


    var extent = routeLayer.getSource().getExtent();
    console.log('extent', extent);


    //QvOSM_INTENSIVE_MAP.getView().fit(extent, QvOSM_INTENSIVE_MAP.getSize(), { padding: [50, 20, 50, 20] });


}
/*let drawIncidentIcon = function() {
    let fontstyle = 'bold 16px Calibri,sans-serif';
    let fontcolor = "#ed7d31";;

    if (incidentDataArr["total_cnt"] > 1) {
        vIconFea.set('style', createIncidentIcon(0, 0.7, incidentDataArr["total_cnt"], fontstyle, fontcolor));
    } else {
        vIconFea.set('style', createIncidentIcon(0, 0.7));
    }

    let oldIncidentLayer = QvOSM_INTENSIVE_MAP.removeLayer(incidentLayer);
    
    let vIconVector = new ol.source.Vector({
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

let getVariable = function() {
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
                    console.log('vVESSEL_CURR_LOC', vVESSEL_CURR_LOC);
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
        } // GetVariable(12) : vPATH 
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
            //const ol = ol;

            // 지도 그리기
            let drawMap = function() {
                //console.log(uId);
                let frmW = $target.GetWidth();
                let frmH = $target.GetHeight();
                let mapTypeSeq = 0;

                if (vMAPTYPE != null) {
                    switch (vMAPTYPE.toLowerCase()) {
                        case "satelite":
                            mapTypeSeq = 1;
                            break; //"layersTn";
                        case "dark":
                            mapTypeSeq = 2;
                            break; //"layersMb";
                        case "basic":
                            mapTypeSeq = 0;
                            break; //"layersMb2";
                        case "lightblue":
                            mapTypeSeq = 3;
                            break; //"layersOSM";
                        default:
                            mapTypeSeq = 0; //"layersMb2";
                    }
                }

                //$target.Element.innerHTML = '<div id="' + uId + '" class="map" style="width:' + frmW + 'px;height:' + frmH + 'px;"></div>';

                let htmlString = "";
                htmlString += '<div id="pointPopup2" class="ol-popup">\
                                \<div class="ol-popup-title">\
                                    \<span class="ol-popup-headtitle-content" style="color:#FFFFFF;"></span>\
                                    \<span class="ol-popup-title-content" style="color:#FFFFFF;"></span>\
                                \</div>\
                                \<a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;"></a>\
                                \<div id="popup-content" style="white-space:pre-line;"></div>\
                            \</div>';
                htmlString += '<div id="pointPopup" class="ol-popup" idx="-1" style="display:none;">\
                                \<div class="ol-popup-title">\
                                    \<div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div>\
                                    \<div class="ol-popup-title-content" style="float:right;color:#FFFFFF;">\
                                        \<span id="btn_prev">◀</span><font id="disp_step" style="margin-left:2px;margin-right:2px;font-weight:normal;"></font><span id="btn_next">▶</span>\
                                    \</div>\
                                \</div>\
                                \<a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a>\
                                \<div id="popup-content"></div>\
                            \</div>';
                htmlString += '<div id="geo-marker"></div>\
                                \<div id="' + uId + '" class="map" style="width:' + frmW + 'px;height:' + frmH + 'px;"></div>';
                htmlString += '<div id="map_position"></div>';
                htmlString += '<div id="map_position_append_wrap"><textarea id="map_position_append" readonly="readonly"></textarea></div>';
                htmlString += '<div id="tooltip"></div>';
                htmlString += '<div id="detail_pointPopup" class="ol-popup incident" idx="-1">\
                                \<div class="ol-popup-title">\
                                    \<div class="ol-popup-headtitle-content" style="color:#FFFFFF;"></div>\
                                    \<div class="ol-popup-title-content" style="float:right;color:#FFFFFF;"></div>\
                                \</div>\
                                \<a href="#" id="popup-closer" class="ol-popup-closer" style="cursor:pointer;display:none;"></a>\
                                \<div id="popup-content"></div>\
                            \</div>';

                $target.Element.innerHTML = htmlString;

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


                let pointPopup = new ol.Overlay({
                    element: document.getElementById("pointPopup"),
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 250
                    }
                });

                let pointPopup2 = new ol.Overlay({
                    element: document.getElementById("pointPopup2"),
                    autoPan: true,
                    autoPanAnimation: {
                        duration: 250
                    }
                });

                QvOSM_INTENSIVE_MAP.addOverlay(pointPopup);
                QvOSM_INTENSIVE_MAP.addOverlay(pointPopup2);

                let pointPopupContent = document.getElementById('popup-content');
                let pointPopupCloser = document.getElementById('popup-closer');

                pointPopupCloser.onclick = function() {

                    pointPopup.setPosition(undefined);
                    pointPopupCloser.blur();
                    $("#pointPopup").hide();
                    $("#pointPopup2").hide();

                    select.getFeatures().clear();
                    return false;
                };



                /* 선택 인터랙션 */
                let select = new ol.interaction.Select({
                    style: function(feature) {
                        return feature.get('sel_style') || feature.get('style');
                    }
                });

                //팝업위치 틀어짐 방지
                let _top = $("#pointPopup").css("top");
                let _left = $("#pointPopup").css("left");

                //QvOSM_INTENSIVE_MAP.getInteractions().extend([select]);
                QvOSM_INTENSIVE_MAP.addInteraction(select);



                QvOSM_INTENSIVE_MAP.un("dblclick");
                QvOSM_INTENSIVE_MAP.on("dblclick", function(evt) {
                    select.getFeatures().clear();
                    let info = QvOSM_INTENSIVE_MAP.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                        select.getFeatures().push(feature);
                        return feature;
                    });



                });




                //싱슬 클릭시 이벤트t
                QvOSM_INTENSIVE_MAP.un("singleclick");
                QvOSM_INTENSIVE_MAP.on("singleclick", function(evt) {
                    select.getFeatures().clear();

                    let coordinate = evt.coordinate;
                    // console.log(coordinate);

                    $("#pointPopup").attr("data", "");
                    $("#pointPopup").height("");

                    //draggable에 의한 위치 초기화
                    $("#pointPopup").attr("style", "");




                    //좌표로직
                    let coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
                    let str = $("#map_position_append").text();
                    let str_arr = str.split("\n");
                    let appnd = "";

                    if (str_arr.length > 4) {
                        delete str_arr[0];
                        str_arr = $.grep(str_arr, function(n) { return (n) });
                    }
                    $.each(str_arr, function($k, $v) {

                        appnd += appnd == "" ? $v : "\n" + $v;

                    });
                    appnd += appnd == "" ? "[ " + coord[1].toFixed(6) + " , " + coord[0].toFixed(6) + " ]" : "\n" + "[ " + coord[1].toFixed(6) + " , " + coord[0].toFixed(6) + " ]";
                    $("#map_position_append").text(appnd);


                    let popup = null;
                    let type = null;
                    let vsl_nm = null;

                    let info = QvOSM_INTENSIVE_MAP.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
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







                    let IsNews = info != null && (info.get("news_arr") != null || info.get("except_arr") != null) && (info.get("news_arr").length > 0 || info.get("except_arr").length > 0);

                    if (IsNews == false) {
                        let $info = info != null && info.get("ref") != null ? info.get("ref") : null;
                        IsNews = $info != null && ($info["news_arr"] != null || $info["except_arr"] != null) && ($info["news_arr"].length > 0 || $info["except_arr"].length > 0);
                    }
                    if (info != null && info.get('ref') != null && info.get('ref')['type'] === 'route') IsNews = false;



                    if (IsNews) {
                        let obj = {};
                        let $info = info.get("ref") != null ? info.get("ref") : null;
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


                            let $type = $("#pointPopup").attr("type") != "" ? $("#pointPopup").attr("type") : $data["type"];
                            let $idx = $("#pointPopup").attr("idx");

                            let $next_idx = parseInt($idx) + 1;
                            let $direction = $("#pointPopup").attr("prev") == 1 ? "prev" : "next";

                            let $count = 0;
                            let $totalcount = $data["news_arr"].length + $data["except_arr"].length;

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

                            let $curr_idx = $type == "except" ? ($data["news_arr"].length + $next_idx + 1) : ($next_idx + 1);


                            let $curr_data;
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

                                let str = "<table style='width:580px;'>\
                                            \<tr><td>\
                                                \<div class='occur_dt' style='float:left;'></div>\
                                                \<div class='location_icon' style='float:right;'><img style='height:20px;' src='" + QvOSM_exUrl + "icon/location_50.png' /></div>\
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


                                $("#pointPopup #popup-content").html(str);

                                let ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
                                let vdt = $curr_data["valid_dt"].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1-$2-$3 $4:$5:$6');
                                $("#pointPopup #popup-content .occur_dt").html("Created on : " + ocdt);
                                $("#pointPopup #popup-content .location").html($curr_data["loc_nm"]);
                                $("#pointPopup #popup-content .title").html($curr_data["title"]);
                                $("#pointPopup #popup-content .source").html("Source : " + $curr_data["source"]);
                                $("#pointPopup #popup-content .valid_dt").html("Valid until : " + vdt);
                                //                              $("#pointPopup #popup-content .container_cnt").html(($curr_data["container_cnt"] ? "Potentially Affected Cargos : "+$curr_data["container_cnt"]+" container(s)" : ""));

                                $("#pointPopup #popup-content .container_cnt").css("cursor", "").css("text-decoration", "").off("click");

                                let $contents_arr = $curr_data["cont"].split("[read more](");
                                // console.log($contents_arr);

                                let $contents = $contents_arr[0];
                                let $read_more = "";
                                try {
                                    if ($contents_arr[1] != null) {
                                        let $url = $.trim($contents_arr[1]).substr(0, $contents_arr[1].length - 1);
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

                                let str = "<table style='width:580px;'>\
                                            \<tr><td>\
                                                \<div class='occur_dt' style='float:left;'></div>\
                                                \<div class='location_icon' style='float:right;'><img style='height:20px;' src='" + QvOSM_exUrl + "icon/location_50.png' /></div>\
                                                \<div class='location' style='float:right;'></div>\
                                            \</td></tr>\
                                            \<tr><td></br></td></tr>\
                                            \<tr><td><div class='title'></div></td></tr>\
                                            \<tr><td><div class='container_cnt'></div></td></tr>\
                                            \<tr><td></br></td></tr>\
                                            \<tr><td><div style='color:#006ca2;font-weight:bold;'>Reason(s)</div></td></tr>\
                                            \<tr><td><div class='excp_nm4'></div></td></tr>\
                                            \<tr><td></br></td></tr>\
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


                                $("#pointPopup #popup-content").html(str);

                                let ocdt = $curr_data["occur_dt"].replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
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
                let overlay = new ol.Overlay({
                    element: document.getElementById("tooltip"),
                    positioning: 'bottom-left',
                    offset: [20, 20]
                });

                overlay.setMap(QvOSM_INTENSIVE_MAP);

                // 툴팁
                QvOSM_INTENSIVE_MAP.un("pointermove");
                QvOSM_INTENSIVE_MAP.on('pointermove', function(evt) {
                    select.getFeatures().clear();

                    let info = QvOSM_INTENSIVE_MAP.forEachFeatureAtPixel(evt.pixel, function(feature) {
                        overlay.setPosition(evt.coordinate);
                        return feature;
                    });


                    let coordinate = evt.coordinate;
                    let coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
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
                    let view = evt.target;

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

            let createIncidentIcon = function(rotation, scale, name, fontstyle, fontcolor) {
                let _font = fontstyle == null ? '10px Calibri,sans-serif' : fontstyle;

                let obj = {
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
                        })
                    })
                };

                let ret = new ol.style.Style(obj);
                ret.setZIndex(zIndex++);

                return ret;
            };

            Qva.AddExtension(ExName, function() {

                $target = this;
                //console.log(this);
                //console.log(vEXT_INTENSIVE);

                //onload와 같은 기능 --------------------------------------시작
                let varsRetrieved = false;
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

                        setVesselData();
                        showVesselIcon();
                        setTyphoonData();
                        setTyphoonIcon();
                        showTyphoonIcon();
                        setIncidentData();
                        drawIncident();
                        routeDraw();


                        varsRetrieved = true;
                    }
                });
                //onload와 같은 기능 --------------------------------------끝

            });

        });
    });
});