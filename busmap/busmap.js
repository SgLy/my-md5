'use strict';

/* global BMap */
/* global BMAP_ANCHOR_TOP_LEFT */
/* global BMAP_ANCHOR_BOTTOM_RIGHT */
/* global BMAP_POI_TYPE_BUSSTOP */
/* global BMAP_NAVIGATION_CONTROL_SMALL */

/* eslint-disable no-console */

let distance;
let map;

function init() {
    map = new BMap.Map('container');
    map.enableScrollWheelZoom();
    map.enableKeyboard();
    map.enableContinuousZoom();
    map.addControl(new BMap.ScaleControl({
        anchor: BMAP_ANCHOR_TOP_LEFT,
        offset: new BMap.Size(20, 20)
    }));
    map.addControl(new BMap.NavigationControl({
        anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
        type: BMAP_NAVIGATION_CONTROL_SMALL,
        enableGeolocation: true,
        offset: new BMap.Size(20, 30)
    }));
    map.setCenter(new BMap.Point(113.31421, 23.107559));
    distance = map.getDistance;

    let test_p = new BMap.Point(113.304311, 23.140537);
    map.centerAndZoom(test_p, 19);
    map.onrightclick = (e) => {
        map.clearOverlays();
        findStation(e.point, (stations) => {
            if (stations.length < 1)
                return;
            let station = stations[0];
            map.setCenter(station.point);
            let t = parseInt(360 / station.routes.length);
            station.routes.forEach((r, i) => {
                getLine(r, (polyline) => {
                    if (polyline === undefined)
                        return;
                    polyline.setStrokeColor(`hsl(${i * t}, 100%, 30%)`);
                    map.addOverlay(polyline);
                });
            });
        });
    };
}

function findStation(point, callback) {
    let ls = new BMap.LocalSearch(point, {
        onSearchComplete: (result) => {
            let stations = [];
            let n = result.getNumPois();
            for (let i = 0; i < n; ++i) {
                let p = result.getPoi(i);
                if (p.type === BMAP_POI_TYPE_BUSSTOP)
                    stations.push({
                        title: p.title,
                        routes: p.address.split(';'),
                        point: p.point,
                        distance: distance(p.point, point)
                    });
            }
            stations.sort((a, b) => a.distance - b.distance);
            callback(stations);
        }
    });
    ls.searchNearby('公交站', point, 200);
}

function formatStation(line, i) {
    const name = line.getBusStation(i).name;
    const regMatch = name.match(/(.+)(\(.+\))/u);
    if (regMatch === null)
        return `<div class="station">${name}</div>`;
    else {
        const sub = `<div class="substation">${regMatch[2]}</div>`;
        return `<div class="station">${regMatch[1]}${sub}</div>`;
    }
}
function getLine(name, callback) {
    let bls = new BMap.BusLineSearch('广州市', {
        onGetBusListComplete: (list) => {
            if (list.getNumBusList() === 0)
                callback(undefined);
            bls.getBusLine(list.getBusListItem(0));
        },
        onGetBusLineComplete: (line) => {
            let p = new BMap.Polyline(line.getPath(), {
                strokeOpacity: 0.5
            });
            p.onclick = (e) => {
                const stationList = Array(line.getNumBusStations()).fill(null)
                    .map((_, i) => formatStation(line, i))
                    .join('');
                const content =
                    `<p>运营时间：<code>${line.startTime} - ${line.endTime}</code></p>` +
                    `<p>运营公司：${line.company}</p>` +
                    `<div class="stations">${stationList}</div>`;
                map.openInfoWindow(new BMap.InfoWindow(content, {
                    width : 0,
                    height: 0,
                    title : `<b>${line.name}</b>`
                }), e.point);
            };
            callback(p);
        }
    });
    bls.getBusList(name);
}

window.onload = init;
