'use strict';

angular.module('core').directive('previousVersionModalDirective', [function () {

    return {
        scope: {
            articleId: '@'
        },
        restrict: 'E', // A: Attribute, E: Element
        templateUrl: 'modules/core/views/previousVersion.template.html',
        controller: ['$scope', 'ArticleService', function ($scope, ArticleService) {
            $scope.showPreviousVersion = function () {
                $('#previous-version-modal').modal('show');
                $scope.isLoading = true;
                ArticleService.getPreviousVersion($scope.articleId).then(function (response) {
                    $scope.isLoading = false;
                    $scope.article = response;
                })
            }

        }]
    };

}]);
