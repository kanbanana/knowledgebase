'use strict';

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