angular.module('starter.controllers', [])
/**
 * @class Application.MainCtrl
 *
 * Displays Home Tab of Application which is a map showing all bike station locations
 *
 * @param {Object} $scope
 */
    .controller('MainCtrl', function ($scope) {

        /**
         * @method centerOnMe
         *
         */
        $scope.centerOnMe = function () {
            console.log("Centering");
            if (!$scope.map) {
                console.log("No map found");
                return;
            }

        };

        /**
         * @private
         * @method initializeMap
         *
         * @param $scope
         */
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


/**
 * @class Application.BikesMainCtrl
 *
 * Uses Factory method {@link Factory.CityBikeNY#getClosest getClosest} to get the stations
 *
 * @param {Object} $scope
 * @param {Factory.CityBikeNY} CityBikeNY
 * @param {Directive} $cordovaGeolocation
 * @param {Object} $state
 */
    .controller('BikesMainCtrl', ['$scope', 'BikeManager', '$cordovaGeolocation', '$state',

        function ($scope, BikeManager, $cordovaGeolocation, $state) {

            /**
             * @private
             * @method itemClicked
             *
             * called when a bikestation in the list is clicked, when clicked the detail
             * page for the specified object is rendered by the {@link Application.BikeStationDetailCtrl BikeStationDetailCtrl}
             *
             * @param _item
             * @param $event
             */
            $scope.itemClicked = function (_item, $event) {
                $event.preventDefault();
                $state.transitionTo('tab.bikeStation-detail', {
                    data: JSON.stringify(_item)
                });
            };


            //
            $cordovaGeolocation.getCurrentPosition().then(function (currentPosition) {
                // Position here: position.coords.latitude, position.coords.longitude

                var p = BikeManager.getClosest(currentPosition.coords, 10);
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
 * @class Application.BikeStationDetailCtrl
 *
 * Displays Detail of Bike Station Location
 *
 * @param {Object} $scope
 * @param {Directive} $cordovaGeolocation
 * @param {Object} $stateParams
 */

    .controller('BikeStationDetailCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {

        /* this is the stringified JSON object representing the station clicked */
        var info = JSON.parse($stateParams.data);

        /**
         * @method initializeMap
         *
         * uses google maps angular directive to dislay the location of the bike station
         * on the map. It will use the marker object to display the exact location.
         *
         * @param {Object} $scope
         * @param {Object} info BikeStation information as JSON object passed in from $stateParams
         */
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
                        longitude: info.longitude
                    }
                });

                $scope.$apply();

            }, function (error) {
                alert('Unable to get location: ' + error.message);
            });
        }

        initializeMap($scope, info);
    }])
/**
 * @class Application.AccountCtrl
 *
 * let the user set the specific location to use in the application, plus manages
 * other configuration options
 */
    .controller('AccountCtrl', ['$scope', 'BikeManager', function ($scope, BikeManager) {

        var currentLocation = BikeManager.getBikeLocation();
        if (currentLocation === "New York") {
            this.checkboxSelection = '0';
        } else {
            this.checkboxSelection = '1';
        }

        /**
         * when item clicked, reset teh default model factory to use when
         * querying for bicycles
         *
         * @param _location
         * @param $event
         */
        this.itemClicked = function (_location, $event) {
            alert("item clicked");

            BikeManager.setBikeLocation((_location));
        }
    }]);
