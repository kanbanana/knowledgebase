'use strict';
/**
 * @module directives/toastContainer.directive.js
 * @description Container directive which manages and orients all toasts
 */
angular.module('core').directive('toastContainerDirective', [function () {
    return {
        scope: {},
        restrict: 'E', // A: Attribute, E: Element
        templateUrl: 'modules/core/views/toastContainer.template.html',
        controller: ['$scope', function ($scope) {
            $scope.toasts = [];

            $scope.$on("makeToastRelay", function (e, toast) {
                $scope.toasts.push(toast);
                $scope.$apply();
            });

            $scope.$on("killMe", function(e, index)  {
                $scope.toasts.splice(index, 1);
                $scope.$apply();
            });
        }]
    };

}]);
