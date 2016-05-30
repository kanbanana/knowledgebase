'use strict';

angular.module('core')
    .controller("CoreCtrl", ['$scope', 'ScrollSmooth','ArticleService', function ($scope, ScrollSmooth, ArticleService) {
        $scope.lastSeenArticles = ArticleService.getArticleItems();
        $scope.scrollSmoothToElementId = function (elementId) {
            ScrollSmooth.toElementId(elementId);
        };

        $scope.scrollSmoothToTop = function () {
            ScrollSmooth.toTop();
        };
    }]);