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


            //
            $cordovaGeolocation.getCurrentPosition().then(function (currentPosition) {
                // Position here: position.coords.latitude, position.coords.longitude

                var p = CityBikeNY.getClosest(currentPosition.coords, 10);
                p.then(function (bikeData) {
                    var bikeStations = bikeData;

                    $scope.bikeLocation = bikeStations;

                    console.log(JSON.stringify($scope.bikeLocation, null, 2));
                });
            }, function (err) {
                console.log(JSON.stringify(err, null, 2));
                alert(err.message);
            });


        }])

/**
 *
 */
    .controller('BikeStationDetailCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {

        /* this is the stringified JSON object representing the station clicked*/
        var info = JSON.parse($stateParams.data);

        function initializeMap($scope, info) {

            // do not display map element until we have location
            $scope.show = false

            // get location from device
            navigator.geolocation.getCurrentPosition(function (pos) {
                console.log('Got pos' + JSON.stringify(pos));
                console.log('Got info' + JSON.stringify(info, null, 2));


                // set all the scope values needed for the map
                angular.extend($scope, {
                    show: true,
                    zoom: 20,
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

                $scope.$apply();

            }, function (error) {
                alert('Unable to get location: ' + error.message);
            });
        }

        initializeMap($scope, info);
    }])

    .controller('AccountCtrl', function ($scope) {
    });
