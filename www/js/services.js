/**
 * @class services
 */
angular.module('starter.services', [])

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
    .factory('CityBikeDC', ['$resource', '$q', function ($resource, $q) {
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
         * @param _count
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
