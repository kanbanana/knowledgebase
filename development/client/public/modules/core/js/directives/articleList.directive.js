'use strict';
/**
 * @module directives/articleList.directive.js
 * @description Wrapper directive for article list items
 * @param sanatizeTags boolean which is used to decide whether the article list item text should be sanatized
 */
angular.module('core').directive('articleListDirective', [function () {
    return {
        scope: {
            articleTmbs: "=",
            sanatizeTags: "@"
        },
        restrict: 'E', // A: Attribute, E: Element
        templateUrl: 'modules/core/views/articleList.template.html',
        controller: ['$scope', function ($scope) {
        }]
    };
}]);
