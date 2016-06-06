'use strict';

angular.module('core').directive('articleListItemDirective', [function () {
  return {
    scope: {
      articleTmbs: "="
    },
    restrict: 'E', // A: Attribute, E: Element
    templateUrl: 'modules/core/views/articleListItem.template.html',
    controller: ['$scope', function($scope) {

    }]
  };
}]);
