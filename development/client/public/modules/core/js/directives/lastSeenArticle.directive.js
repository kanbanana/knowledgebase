'use strict';

angular.module('core').directive('lastSeenArticleDirective', [function () {

    return {
        scope: {
            isTemporary : "="
        },
        restrict: 'EA',
        controller: ['$scope', '$stateParams', '$cookies', function ($scope, $stateParams, $cookies) {
            var lastSeenArticles = $cookies.get("lastSeenArticles");
            $scope.$watch("isTemporary", function(nv) {
                if(nv === false) {
                    saveArticle();
                }
            });
            function saveArticle() {
                if (lastSeenArticles) {
                    var lastSeenArticlesArray = lastSeenArticles.split(",");
                    var thisArticleArray = [$stateParams.articleId];
                    var articleCookieIndex = lastSeenArticles.indexOf($stateParams.articleId);
                    if (articleCookieIndex > -1) {
                        lastSeenArticlesArray.splice(articleCookieIndex, 1);
                    }

                    if (lastSeenArticlesArray.length >= 5) {
                        lastSeenArticlesArray.splice(4, lastSeenArticlesArray.length);
                    }

                    var newlastSeenArticlesArray = thisArticleArray.concat(lastSeenArticlesArray);
                    $cookies.put("lastSeenArticles", newlastSeenArticlesArray);
                } else {
                    var article = [$stateParams.articleId];
                    $cookies.put("lastSeenArticles", article);
                }
            }

        }]
    };

}]);
