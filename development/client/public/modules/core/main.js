
angular.module('core', [])
    .run(['$rootScope','$location', function($rootScope,$location) {
        $rootScope.bodyClass = 'loading';
        var url = $location.absUrl();
        //url = "http://141.19.153.86:3000/#/";
        var cutUrl = url.substring(0, url.indexOf('/#/') );
        $rootScope.baseUrl = cutUrl;
    }]);