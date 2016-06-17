'use strict';
/**
 * @description A simple modal with either a confirm or cancel (no action)
 *
 * @class confirmationModalDirective
 */
angular.module('core').directive('confirmationModalDirective', [function () {

    return {
        scope: {
        },
        restrict: 'E',
        templateUrl: 'modules/core/views/confirmationModal.template.html',
        controller: ['$scope', function ($scope) {
            /**
             * @description the modal gets called with a modal text, title and function to be called on confirmation
             * @memberof confirmationModalDirective
             * @function callModal
             * @param {Object} Contains 3 strings the text, title and a string of the function to be called on confirmation
             */
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
