'use strict';

angular.module('core').controller('NavCtrl', ['$scope','$location','ArticleService', function($scope, $location, ArticleService){

    $scope.newArticle = function(searchText) {
        ArticleService.createArticle().then(function(response) {
            $location.path('article/'+ response.data).search('e', 'true');
        })
    }
    $scope.searchArticle = function(searchText) {
        if(!searchText || searchText === "") {
            $location.path('/#/')
        } else {
            $location.path('search').search('q', searchText)
        }

    }
}]);