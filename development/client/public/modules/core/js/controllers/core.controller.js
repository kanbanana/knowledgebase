'use strict';

/**
 * @description The core controller is used on the index page. Displays and manages the last seen articles
 *
 * @class CoreCtrl
 * @param {Dependency} $cookies - Service for managing the cookies
 * @param {Dependency} ArticleService - The ArticleService provides the rest calls to retrieve article information
 */

angular.module('core')
    .controller("CoreCtrl", ['$scope','ArticleService','$cookies', function ($scope, ArticleService, $cookies) {
        // is set true for as long as the server retrieves the last seen articles
        $scope.isLoading = true;

        // relays all toast message calls to the toast directive - DO NOT CHANGE
        $scope.$on("makeToast", function (e, toast) {
            setTimeout(function() {
                $scope.$broadcast("makeToastRelay", toast);
            },100);
        });

        // If no lastSeenArticles cookie is set create the cookie
        if(!($cookies.get("lastSeenArticles"))) {
            $cookies.put("lastSeenArticles", "");
        }

        var cookies = $cookies.get("lastSeenArticles");

        if (cookies) {
            ArticleService.getLastSeenArticles(cookies).then(function (response) {
                $scope.isLoading = false;
                $scope.lastSeenArticles = response.data;
            });
        } else {
            $scope.isLoading = false;
        }
    }]);