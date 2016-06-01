'use strict';

angular.module('core').controller('NavCtrl', ['$scope','$location','ArticleService', function($scope, $location, ArticleService){

    $scope.newArticle = function(searchText) {
        var articleId = ArticleService.createArticle()
        $location.path('article/'+ articleId).search('e', 'true');


    }
}]);