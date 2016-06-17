'use strict';

/**
 * The navbar controller. Relays toasts and changes the routes to search, new article and the start page.
 
 * @class NavCtrl
 * @param {Dependency} $location - Service used to change the url location
 * @param {Dependency} ArticleService - The ArticleService provides the rest calls to retrieve article information
 */
angular.module('core').controller('NavCtrl', ['$scope','$location','ArticleService', function($scope, $location, ArticleService){

    /**
     * @description creates a new article and redirects to it
     *
     * @function newArticle
     * @param searchText currently unused if you want to use the searchText to become the article title start here
     * @memberof NavCtrl
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
        if($('.navbar-toggle').css('display') !== 'none') {
            $('.navbar-toggle').click();
        }

    }
}]);