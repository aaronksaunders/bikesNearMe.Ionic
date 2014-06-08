angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope) {


        $scope.centerOnMe = function () {
            console.log("Centering");
            if (!$scope.map) {
                console.log("No map found");
                return;
            }


        };

        function initializeMap($scope) {

            $scope.show = false

            navigator.geolocation.getCurrentPosition(function (pos) {
                console.log('Got pos' + JSON.stringify(pos));

                $scope.show = true;
                $scope.zoom = 15;
                angular.extend($scope, {
                    center: {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    },
                    options: {
                        disableDefaultUI: false,
                        panControl: false
                    }
                });
                $scope.$apply();

            }, function (error) {
                alert('Unable to get location: ' + error.message);
            });
        }

        initializeMap($scope);

    })

    .controller('BikesMainCtrl', ['$scope', 'CityBikeNY', '$cordovaGeolocation', '$state',


        /**
         *
         * @param $scope
         * @param CityBikeNY
         * @param $cordovaGeolocation
         */
            function ($scope, CityBikeNY, $cordovaGeolocation, $state) {


            $scope.itemClicked = function (_item, $event) {
                $event.preventDefault();
                $state.transitionTo('tab.bikeStation-detail', {
                    data: JSON.stringify(_item)
                });
            };
            /**
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

            /**
             * @TODO remove function
             *
             * @param coords
             * @param station
             * @returns {number}
             */
            function simpleDistance(coords, station) {
                return Math.abs(coords.latitude - station.latitude) + Math.abs(coords.longitude - station.longitude);
            }

            //
            $cordovaGeolocation.getCurrentPosition().then(function (currentPosition) {
                // Position here: position.coords.latitude, position.coords.longitude

                var p = CityBikeNY.get().$promise;
                p.then(function (bikeData) {
                    var bikeStations = bikeData.stationBeanList;

                    bikeStations.sort(function (station1, station2) {
                        return getDistance(currentPosition.coords, station1) - getDistance(currentPosition.coords, station2);
                    });

                    bikeStations = bikeStations.slice(0, 5);

                    bikeStations.map(function (item) {
                        item.distance = getDistance(currentPosition.coords,
                            {latitude: item.latitude, longitude: item.longitude});
                    });

                    $scope.bikeLocation = bikeStations;

                    // $scope.bikeLocation = bikeStations.filter(function (_i) {
                    //     _i.distance = getDistance(currentPosition, {latitude: _i.latitude, longitude: _i.longitude});
                    //     return true;
                    // });

                    console.log(JSON.stringify($scope.bikeLocation, null, 2));
                });
            }, function (err) {
                console.log(JSON.stringify(err, null, 2));
                alert(err.message);
            });


        }])

    .controller('BikeStationDetailCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {

        alert($stateParams);
        var info = JSON.parse($stateParams.data);

        function initializeMap($scope, info) {

            $scope.show = false

            navigator.geolocation.getCurrentPosition(function (pos) {
                console.log('Got pos' + JSON.stringify(pos));
                console.log('Got info' + JSON.stringify(info, null, 2));


                angular.extend($scope, {
                    markers: [
                        {
                            latitude: info.latitude,
                            longitude: info.longitude,
                            title: "location"
                        }
                    ],
                    options: {
                        disableDefaultUI: false,
                        panControl: false
                    },
                    center: {
                        latitude: info.latitude,
                        longitude: info.longitude,
                    }
                });

                $scope.show = true;
                $scope.zoom = 20;
                $scope.$apply();

            }, function (error) {
                alert('Unable to get location: ' + error.message);
            });
        }

        initializeMap($scope, info);
    }])

    .controller('AccountCtrl', function ($scope) {
    });
