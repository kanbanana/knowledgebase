'use strict';
/**
 * Wrapper directive for article list items.
 
 * @class articleListItemDirective
 * @param sanatizeTags boolean which is used to decide whether the article list item text should be sanatized
 * @param index passes the index of the item into the controller -> used for selenium tests
 */
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

            /**
             * @description strips html text of all tags except b-tags
             * @memberof articleListItemDirective
             * @function htmlToPlaintext
             * @param text text to be transformed
             * @returns {string} stripped html
             */
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
