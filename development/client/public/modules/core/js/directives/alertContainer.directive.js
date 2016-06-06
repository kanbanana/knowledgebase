'use strict';

angular.module('core').directive('alertContainerDirective', [function () {
    return {
        scope: {},
        restrict: 'E', // A: Attribute, E: Element
        templateUrl: 'modules/core/views/alertcontainer.template.html',
        controller: ['$scope', function ($scope) {
            $scope.toasts = [];

            $scope.$on("makeToastRelay", function (e, toast) {
                $scope.toasts.push(toast)
                $scope.$apply();
            })

            $scope.$on("killMe", function(e, index)  {
                $scope.toasts.splice(index, 1);
                $scope.$apply()
            })
        }]
    };

}]);
