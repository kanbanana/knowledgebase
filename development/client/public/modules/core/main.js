"use strict";

angular.module('core', [])
    .run(['$rootScope','$location', function($rootScope, $location) {
        $rootScope.bodyClass = 'loading';
        var url = $location.absUrl();
        //var url = "http://141.19.158.68:8080/#/";

        if (url.indexOf('/#/') > -1) {
            var cutUrl = url.substring(0, url.indexOf('/#/'));
        } else {
            var cutUrl = url;
        }

        var cutUrl = url.substring(0, url.indexOf('/#/'));
        $rootScope.baseUrl = cutUrl;
    }]);