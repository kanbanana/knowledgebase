'use strict';

angular.module('core').directive('articleListItemDirective', [function () {

    return {
        scope:  {
            item: "=item",
            sanatizeTags: "@",
            index: "@"
        },
        restrict: 'E', // A: Attribute, E: Element
        templateUrl: 'modules/core/views/articleListItem.template.html',
        controller: ['$scope', '$sce', function ($scope, $sce) {
            function htmlToPlaintext(text) {
                return text ? String(text).replace(/<(?!\/?b\s*\/?)[^>]+>/gm, '') : '';
            }
            $scope.date = (new Date($scope.item.lastChanged)).toISOString().slice(0,10) + ", " + (new Date($scope.item.lastChanged)).toISOString().slice(11,19);
            if ($scope.sanatizeTags == "true") {
                $scope.sanatizedArticleText = $sce.trustAsHtml(htmlToPlaintext($scope.item.text));
            } else {
                $scope.sanatizedArticleText = $sce.trustAsHtml($scope.item.text);
            }

        }]
    };

}]);
