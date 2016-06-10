'use strict';

angular.module('core').directive('articleListItemDirective', [function () {

    return {
        scope:  {
            item: "=item",
            sanatizeTags: "@"
        },
        restrict: 'E', // A: Attribute, E: Element
        templateUrl: 'modules/core/views/articleListItem.template.html',
        controller: ['$scope', '$sce', function ($scope, $sce) {
            function htmlToPlaintext(text) {
                return text ? String(text).replace(/<(?!\/?b\s*\/?)[^>]+>/gm, '') : '';
            }
            var d = new Date($scope.item.lastChanged);
            $scope.date = (d.getHours()+":"+ d.getMinutes()+ ":"+d.getSeconds()+", "+ d.getDate() + "-" + (d.getMonth()+1) +  "-" + d.getFullYear());
            console.log($scope.item)
            if ($scope.sanatizeTags == "true") {
                $scope.sanatizedArticleText = $sce.trustAsHtml(htmlToPlaintext($scope.item.text));
            } else {
                $scope.sanatizedArticleText = $sce.trustAsHtml($scope.item.text);
            }

        }]
    };

}]);
