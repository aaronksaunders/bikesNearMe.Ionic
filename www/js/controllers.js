angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope) {
    })

    .controller('BikesMainCtrl', ['$scope', 'CityBikeNY', '$cordovaGeolocation',

        /**
         *
         * @param $scope
         * @param CityBikeNY
         * @param $cordovaGeolocation
         */
            function ($scope, CityBikeNY, $cordovaGeolocation) {


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

    .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
        $scope.friend = Friends.get($stateParams.friendId);
    })

    .controller('AccountCtrl', function ($scope) {
    });
