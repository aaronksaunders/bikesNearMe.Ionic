angular.module('starter.services', [])
/**
 *
 */
    .factory('CityBikeNY', ['$resource', function ($resource) {
        return $resource('http://www.citibikenyc.com/stations/json', {}, {
            'get': {method: 'GET', cache: true},
            'save': {method: 'POST'},
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'DELETE'},
            'delete': {method: 'DELETE'}
        });
    }]);
