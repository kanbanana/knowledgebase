'use strict';
/**
 * This directive attaches to the article detail view and automaticly saves the articleId into the cookie.
 *
 * @class lastSeenArticleDirective
 * @description This directive attaches to the article detail view and automaticly saves the articleId into the cookie
 * @param isTemporary is used to watch the temporary flag of the article if it becomes false the article is added to the cookie
 */

angular.module('core').directive('lastSeenArticleDirective', [function () {

    return {
        scope: {
            isTemporary: "="
        },
        restrict: 'EA',
        controller: ['$scope', '$stateParams', '$cookies', function ($scope, $stateParams, $cookies) {
            var lastSeenArticles = $cookies.get("lastSeenArticles");
            $scope.$watch("isTemporary", function (nv) {
                if (nv === false) {
                    saveArticle();
                }
            });

            /***
             * @description saves the article into the cookie. Always adds the article to the top of the list. If the article already exists inside the cookies it is transfered  back to the top. Caps at 5 articleIds.
             *
             * @function saveArticle
              */
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
