'use strict';
/**
 * Directive to display the previous version of an article inside a modal.
 *
 * @class previousVersionModalDirective
 * @param articleId id used to retrieve the previous version of an article
 */
angular.module('core').directive('previousVersionModalDirective', [function () {

    return {
        scope: {
            articleId: '@'
        },
        restrict: 'E', // A: Attribute, E: Element
        templateUrl: 'modules/core/views/previousVersion.template.html',
        controller: ['$scope', 'ArticleService','$sce', function ($scope, ArticleService, $sce) {
            $scope.showPreviousVersion = function () {
                $('#previous-version-modal').modal('show');
                $scope.isLoading = true;
                ArticleService.getPreviousVersion($scope.articleId).then(function (response) {
                    $scope.isLoading = false;
                    $scope.article = response.data;
                    $scope.sanatizedArticleText = $sce.trustAsHtml($scope.article.text)
                })
            }

        }]
    };

}]);
