'use strict';

angular.module('core').directive('articleListItemDirective', [function () {
  return {
    restrict: 'E', // A: Attribute, E: Element
    templateUrl: '../views/articleListItem.template.html'
  };
}]);
