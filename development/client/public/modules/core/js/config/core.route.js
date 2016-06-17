'use strict';

/**
 * @description Manages all routes used by the frontend as well as binding controllers to the views.
 *
 * @class route
 * @param {Dependency} $stateProvider - Angular UI service which manages all states
 * @oaram {Dependency} $urlRouterProvider - Angular UI service which redirects any URL not matching those declared by the stateProvider
 *
 */

angular.module('core')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state("root",
            {
                views: {
                    "": {
                        template: '<div ui-view=""></div>'
                    },
                    "nav": {
                        controller: "NavCtrl",
                        templateUrl: "modules/core/views/nav.html"
                    },
                    "footer": {
                        controller: "FooterCtrl",
                        templateUrl: "modules/core/views/footer.html"
                    }
                }
            })
            .state("home",
            {
                parent: "root",
                url: "/",
                views: {
                    "": {
                        controller: "CoreCtrl",
                        templateUrl: "modules/core/views/index.html"
                    }
                }
            })
            .state("search",
            {
                parent: "root",
                url: "/search?q",
                views: {
                    "": {
                        controller: "SearchCtrl",
                        templateUrl: "modules/core/views/search.html"
                    }
                }
            })
            .state("articleDetail",
            {
                parent: "root",
                url: "/article/:articleId?e",
                views: {
                    "": {
                        controller: "ArticleDetailCtrl",
                        templateUrl: "modules/core/views/article.detail.html"
                    }
                }
            });
    }]).run(['$state', function ($state) {
        $state.transitionTo('home');
    }]);