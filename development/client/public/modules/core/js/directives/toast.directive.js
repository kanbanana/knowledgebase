'use strict';
/**
 * @module directives/toast.directive.js
 * @description Directive used to display toast notifications
 * @param toast transfers the toast
 * @param index saves the index of the toast message
 */
angular.module('core').directive('toastDirective', [function () {

    return {
        scope: {
            toast: "=",
            index: "@"
        },
        restrict: 'E',
        templateUrl: 'modules/core/views/toast.template.html',
        controller: ['$scope', function ($scope) {

            //Tells the toastContainer directive to destroy the toast after 3 seconds
            setTimeout(function() {
                $scope.$emit("killMe", $scope.index);
            }, 3000);

        }]
    };

}]);
