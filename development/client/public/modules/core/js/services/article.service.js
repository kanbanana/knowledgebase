'use strict';

/**
 * @module services/article.service.js
 * @description Contains all REST calls needed to GET,POST,PUT,DELETE articles and their files
 */
angular.module('core').factory('ArticleService', ['$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
    return {
        searchArticles: function (query) {
            return $http({
                method: 'GET',
                url: $rootScope.baseUrl + "/api/articles?q=" + query
            }).then(function successCallback(response) {
                return response;
            }, function errorCallback(response) {
                return response;
            });
        },
        getArticle: function (id) {
            return $http({
                method: 'GET',
                url: $rootScope.baseUrl + "/api/articles/" + id
            }).then(function successCallback(response) {
                return response;
            }, function errorCallback(response) {
                return response;
            });
        },
        getLastSeenArticles: function (cookie) {
            return $http({
                method: 'GET',
                url: $rootScope.baseUrl + "/api/articles?ids=" + cookie
            }).then(function successCallback(response) {
                return response;
            }, function errorCallback(response) {
                return response;
            });
        },
        getPreviousVersion: function (id) {
            return $http({
                method: 'GET',
                url: $rootScope.baseUrl + "/api/articles/" + id + "?old"
            }).then(function successCallback(response) {
                return response;
            }, function errorCallback(response) {
                return response;
            });
        },
        createArticle: function () {
            return $http({
                method: 'POST',
                url: $rootScope.baseUrl + "/api/articles/"
            }).then(function successCallback(response) {
                return response;
            }, function errorCallback(response) {
                return response;
            });
        },
        saveArticle: function (id, article) {
            return $http({
                method: 'PUT',
                url: $rootScope.baseUrl + "/api/articles/" + id,
                data: article
            }).then(function successCallback(response) {
                return response;
            }, function errorCallback(response) {
                return response;
            });
        },
        deleteArticle: function (id) {
            return $http({
                method: 'DELETE',
                url: $rootScope.baseUrl + "/api/articles/" + id
            }).then(function successCallback(response) {
                return response;
            }, function errorCallback(response) {
                return response;
            });
        },
        deleteDocument: function (id, filename) {
            return $http({
                method: 'DELETE',
                url: $rootScope.baseUrl + "/api/articles/" + id + "/documents/" + filename
            }).then(function successCallback(response) {
                return response;
            }, function errorCallback(response) {
                return response;
            });
        }
    };
}]);
