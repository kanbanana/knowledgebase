'use strict';

angular.module('core').directive('confirmationModalDirective', [function () {

    return {
        scope: {
        },
        restrict: 'E',
        templateUrl: 'modules/core/views/confirmationModal.template.html',
        controller: ['$scope', function ($scope) {
            $scope.$on("callModal", function(e, content) {
                $scope.modalText = content.text;
                $scope.modalTitle = content.title;
                $scope.onConfirmation = content.onConfirmation;
                $('#confirmationModal').modal('show');
            });

            $scope.confirmModal = function() {
                $('#confirmationModal').modal('hide');
                $scope.$emit($scope.onConfirmation)

            }


        }]
    };

}]);
