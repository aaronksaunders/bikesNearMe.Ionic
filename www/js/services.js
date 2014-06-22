/**
 * @class services
 */
angular.module('starter.services', [])
/**
 * @member xmlParser
 *
 * uses xml2json.js library to create factory for handling xml conversion
 * in application. We did need to utilize <code>angular.bind</code> to address
 * losing context when the finxtion is called
 */
    .factory('xmlParser', function () {
        var x2js = new X2JS();
        return {
            xml2json: x2js.xml2json,
            xml_str2json: function (args) {
                return angular.bind(x2js, x2js.xml_str2json, args)();
            },
            json2xml: x2js.json2xml_str
        }
    })
    .directive('map', function () {
        return {
            restrict: 'E',
            scope: {
                onCreate: '&'
            },
            link: function ($scope, $element, $attr) {
                function initialize() {
                    var mapOptions = {
                        center: new google.maps.LatLng(43.07493, -89.381388),
                        zoom: 16,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new google.maps.Map($element[0], mapOptions);

                    $scope.onCreate({map: map});

                    // Stop the side bar from dragging when mousedown/tapdown on the map
                    google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
                        e.preventDefault();
                        return false;
                    });
                }

                google.maps.event.addDomListener(window, 'load', initialize);
            }
        }
    })
/**
 * @class Factory.CapitalBikeShareDC
 *
 * this gets the CapitalBikeShareDC locations from the http endpoint that has been provided
 *
 * <code>https://www.capitalbikeshare.com/data/stations/bikeStations.xml</code>
 *
 */
    .factory('CityBikeDC', ['$resource', '$q', 'xmlParser', function ($resource, $q, xmlParser) {
        /**
         * @private
         * @method getDistance
         *
         * private method get the distance between the two coords provided
         *
         * @param coord1 starting location
         * @param coord2 ending location
         * @returns {number} distance between two points
         */
        function getDistance(coord1, coord2) {

            if (typeof (Number.prototype.toRad) === "undefined") {
                Number.prototype.toRad = function () {
                    return this * Math.PI / 180;
                };
            }

            var lat1 = coord1.latitude || Number(coord1.lat);
            var lat2 = coord2.latitude || Number(coord2.lat);
            var lon1 = coord1.longitude || Number(coord1.long);
            var lon2 = coord2.longitude || Number(coord2.long);

            var R = 6371;
            // km
            var dLat = (lat2 - lat1).toRad();
            var dLon = (lon2 - lon1).toRad();
            lat1 = Number(lat1).toRad();
            lat2 = Number(lat2).toRad();

            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;

            return d;
        }

        /**
         * converts the object into the proper format for display
         *
         * @param _input
         * @returns {{id: *, stationName: *, statusValue: boolean, availableBikes: *, availableDocks: *, distance: *, latitude: (defaults.lat|*|MapKit.options.lat|pins.lat), longitude: (long|*|Docs.data.long|types.long|Option.long)}}
         */
        function normalizeObject(_input) {
            return {
                id: _input.id,
                stationName: _input.name,
                statusValue: !_input.locked,
                availableBikes: _input.nbBikes,
                availableDocks: _input.nbEmptyDocks,
                distance: _input.distance,
                latitude: _input.lat,
                longitude: _input.long
            }
        }

        var resource = $resource('https://www.capitalbikeshare.com/data/stations/bikeStations.xml', {}, {
            'get': {
                method: 'GET', cache: true, headers: {'Content-Type': 'application/xml; charset=UTF-8'},
                transformResponse: function (data, headers) {
                    //MESS WITH THE DATA
                    var json = xmlParser.xml_str2json(data)
                    return json;
                }
            },
            'save': {method: 'POST'},
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'DELETE'},
            'delete': {method: 'DELETE'}
        });

        /**
         * @method getClosest
         *
         * gets the closest bike stations to your current location
         *
         * @param _currentPosition
         * @param _count number of stations to return from query
         * @returns {*}
         */
        resource.getClosest = function (_currentPosition, _count) {
            var deferred = $q.defer();
            var that = this;

            that.get().$promise.then(function (data) {

                var bikeStations = data.stations.station;

                bikeStations.sort(function (station1, station2) {
                    return getDistance(_currentPosition, station1) - getDistance(_currentPosition, station2);
                });

                bikeStations = bikeStations.slice(0, _count || 5);

                var _bikeStations = bikeStations.map(function (item) {

                    item.distance = getDistance(_currentPosition,
                        {latitude: item.lat, longitude: item.long});
                    return normalizeObject(item);
                });

                deferred.resolve(_bikeStations);

            }, function (_error) {
                console.log(_error);
                deferred.reject(_error);
            });

            return deferred.promise;
        };
        return resource;
    }])
    .service('BikeManager', ['CityBikeNY', 'CityBikeDC', '$rootScope',
        function (CityBikeNY, CityBikeDC, $rootScope) {
            var currentLocation;

            return {
                /**
                 *
                 * @param _location
                 */
                setBikeLocation: function (_location) {
                    currentLocation = _location;
                    console.log(_location);

                    //$rootScope.$emit('BikeLocation.changed', _location);
                },
                /**
                 *
                 * @param _location
                 */
                getBikeLocation: function () {
                    return currentLocation;
                },
                getClosest: function (_currentPosition, _count) {
                    if (currentLocation === "New York") {
                        return CityBikeNY.getClosest(_currentPosition, _count);
                    } else {
                        return CityBikeDC.getClosest(_currentPosition, _count);
                    }

                }
            }
        }])
/**
 * @class Factory.CityBikeNY
 *
 * this gets the CityBikeNY locations from the http endpoint that has been provided
 *
 * <code>http://www.citibikenyc.com/stations/json</code>
 *
 */
    .factory('CityBikeNY', ['$resource', '$q', function ($resource, $q) {

        /**
         * @private
         * @method getDistance
         *
         * private method get the distance between the two coords provided
         *
         * @param coord1 starting location
         * @param coord2 ending location
         * @returns {number} distance between two points
         */
        function getDistance(coord1, coord2) {

            if (typeof (Number.prototype.toRad) === "undefined") {
                Number.prototype.toRad = function () {
                    return this * Math.PI / 180;
                };
            }

            var lat1 = coord1.latitude;
            var lat2 = coord2.latitude;
            var lon1 = coord1.longitude;
            var lon2 = coord2.longitude;

            var R = 6371;
            // km
            var dLat = (lat2 - lat1).toRad();
            var dLon = (lon2 - lon1).toRad();
            lat1 = lat1.toRad();
            lat2 = lat2.toRad();

            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;

            return d;
        }

        var resource = $resource('http://www.citibikenyc.com/stations/json', {}, {
            'get': {method: 'GET', cache: true},
            'save': {method: 'POST'},
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'DELETE'},
            'delete': {method: 'DELETE'}
        });

        /**
         * @method getClosest
         *
         * gets the closest bike stations to your current location
         *
         * @param _currentPosition
         * @param _count number of stations to return from query
         * @returns {*}
         */
        resource.getClosest = function (_currentPosition, _count) {
            var deferred = $q.defer();
            var that = this;

            that.get().$promise.then(function (data) {

                var bikeStations = data.stationBeanList;

                bikeStations.sort(function (station1, station2) {
                    return getDistance(_currentPosition, station1) - getDistance(_currentPosition, station2);
                });

                bikeStations = bikeStations.slice(0, _count || 5);

                bikeStations.map(function (item) {
                    item.distance = getDistance(_currentPosition,
                        {latitude: item.latitude, longitude: item.longitude});
                });

                deferred.resolve(bikeStations);

            }, function (_error) {
                console.log(_error);
                deferred.reject(_error);
            });

            return deferred.promise;
        };
        return resource;

    }]);
