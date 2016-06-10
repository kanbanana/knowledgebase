'use strict';

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
