'use strict';

angular.module('core')
    .controller("CoreCtrl", ['$scope', 'ScrollSmooth','ArticleService', function ($scope, ScrollSmooth, ArticleService) {
        $scope.lastSeenArticles = ArticleService.searchArticles();
        $scope.$on("makeToast", function (e, toast) {
            setTimeout(function() {$scope.$broadcast("makeToastRelay", toast)},100)
        })
        $scope.scrollSmoothToElementId = function (elementId) {
            ScrollSmooth.toElementId(elementId);
        };

        $scope.scrollSmoothToTop = function () {
            ScrollSmooth.toTop();
        };
    }]);