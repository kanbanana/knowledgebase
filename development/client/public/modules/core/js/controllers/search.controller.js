'use strict';

/**
 * The core controller is used on the index page. Displays and manages the last seen articles.
 *
 * @class SearchCtrl
 * @param {Dependency} $stateParams - Service that reads out the URL and helps getting the query parameters used for the search
 * @param {Dependency} ArticleService - The ArticleService provides the rest calls to retrieve article information
 */

angular.module('core').controller('SearchCtrl', ['$scope','$stateParams','ArticleService', function($scope, $stateParams, ArticleService){
    $scope.isLoading = true;
    $scope.searchParam = $stateParams.q;
    ArticleService.searchArticles($stateParams.q).then(function (response) {
        $scope.isLoading = false;
        $scope.searchResults = response.data;
    });
}]);
