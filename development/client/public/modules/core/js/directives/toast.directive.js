'use strict';

angular.module('core').directive('toastDirective', [function () {

    return {
        scope: {
            toast: "=",
            index: "@"
        },
        restrict: 'E',
        templateUrl: 'modules/core/views/toast.template.html',
        controller: ['$scope', function ($scope) {
            setTimeout(function() {
                $scope.$emit("killMe", $scope.index)
            }, 3000)

        }]
    };

}]);
