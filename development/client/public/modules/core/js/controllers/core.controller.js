'use strict';

angular.module('core')
    .controller("CoreCtrl", ['$scope', 'ScrollSmooth','ArticleService','$cookies', function ($scope, ScrollSmooth, ArticleService, $cookies) {
        $scope.isLoading = true;
        $scope.$on("makeToast", function (e, toast) {
            setTimeout(function() {$scope.$broadcast("makeToastRelay", toast)},100)
        });


        if(!($cookies.get("lastSeenArticles"))) {
            $cookies.put("lastSeenArticles", []);
        }
        var cookies = $cookies.get("lastSeenArticles");

        ArticleService.getLastSeenArticles(cookies).then(function (response) {
            $scope.isLoading = false;
        });



        
        $scope.scrollSmoothToElementId = function (elementId) {
            ScrollSmooth.toElementId(elementId);
        };

        $scope.scrollSmoothToTop = function () {
            ScrollSmooth.toTop();
        };
    }]);