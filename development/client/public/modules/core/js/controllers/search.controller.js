'use strict';

angular.module('core').controller('SearchCtrl', ['$scope','$stateParams','ArticleService', function($scope, $stateParams, ArticleService){
    $scope.isLoading = true;
    $scope.searchParam = $stateParams.q;
    ArticleService.searchArticles($stateParams.q).then(function (response) {
        $scope.isLoading = false;
        $scope.searchResults = response.data;
    });
}]);
