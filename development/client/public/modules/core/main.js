"use strict";

angular.module('core', [])
    .run(['$rootScope','$location', function($rootScope, $location) {
        $rootScope.bodyClass = 'loading';
        //var url = $location.absUrl();
        //var url = $location.host();
        var url = "http://141.19.158.68:3000/#/";
        var cutUrl = url.substring(0, url.indexOf('/#/') );
        //var cutUrl = "https://danielweidle.de"
        $rootScope.baseUrl = cutUrl;
    }]);