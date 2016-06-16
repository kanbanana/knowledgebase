"use strict";
/**
 * @module startup
 * @description A startup function which runs when the angular front-end is loaded. Used for managing the baseUrl which the REST Api sits upon.
 */
angular.module('core', [])
    .run(['$rootScope','$location', function($rootScope, $location) {
        $rootScope.bodyClass = 'loading';
        //var url = $location.path();
        var url = $location.absUrl();
        //var url = $location.host();
        //var url = "http://141.19.158.68:3000/#/";
        if (url.indexOf('/#/') > -1) {
            var cutUrl = url.substring(0, url.indexOf('/#/'));
        } else {
            var cutUrl = url.substring(0, (url.length - 1));
        }

        //var cutUrl = url.substring(0, url.indexOf('/#/'));
        $rootScope.baseUrl = cutUrl;
    }]);
