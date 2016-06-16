'use strict';

/**
 * @module controllers/nav.controller.js
 * @description The nav controller
 * @param {Dependency} $location - Service used to change the url location
 * @param {Dependency} ArticleService - The ArticleService provides the rest calls to retrieve article information
 */
angular.module('core').controller('NavCtrl', ['$scope','$location','ArticleService', function($scope, $location, ArticleService){

    /**
     * @function newArticle
     * @description creates a new article and redirects to it
     * @param searchText currently unused if you want to use the searchText to become the article title start here
     */
    $scope.newArticle = function(searchText) {
        ArticleService.createArticle().then(function(response) {
            $location.path('article/'+ response.data).search('e', 'true');
        });
    };

    $scope.searchArticle = function(searchText) {
        if(!searchText || searchText === "") {
            $location.path('/#/');
        } else {
            $location.path('search').search('q', searchText);
        }
    };

    $scope.clearSearch = function() {
        $scope.searchText = "";
    }

    $scope.closeNavbar = function() {
        $('.navbar-toggle').click();
    }
}]);