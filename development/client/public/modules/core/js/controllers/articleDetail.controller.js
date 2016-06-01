'use strict';

angular.module('core').controller('ArticleDetailCtrl', ['$scope', '$stateParams', 'ArticleService','$sce','$location', function($scope, $stateParams, ArticleService, $sce, $location){
    $scope.article = angular.fromJson(ArticleService.getArticle($stateParams.articleId));
    $scope.isSaving = false;

    tinymce.PluginManager.add("bdesk_photo", function(editor, f) {
        editor.addCommand("bdesk_photo", function() {
            editor.windowManager.open({
                title: "Insert embedded image",
                width: 450,
                height: 80,
                html: '<input type="file" class="input" name="single-image" style="font-size:14px;padding:30px;" accept="image/png, image/gif, image/jpeg, image/jpg"/>',
                buttons: [{
                    text: "Ok",
                    subtype: "primary",
                    onclick: function() {
                        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                            alert("This feature needs a modern browser.");
                            (this).parent().parent().close();
                            return;
                        }

                        var imagefile = document.getElementsByName("single-image")[0].files;

                        if (imagefile.length <= 0) {
                            // do nothing
                            (this).parent().parent().close();
                            return;
                        }



                        var thisOne = this;

                        var classFilereader = new FileReader();
                        classFilereader.onload = function(base64) {
                            var imgData = base64.target.result;
                            var img = new Image();
                            img.src = imgData;

                            editor.execCommand("mceInsertContent", false, "<img src='" + imgData + "' />");
                            thisOne.parent().parent().close();
                        };

                        classFilereader.onerror = function(err) {
                            alert("Error reading file - " + err.getMessage());
                        };

                        classFilereader.readAsDataURL(imagefile[0]);
                    }
                }, {
                    text: "Cancel",
                    onclick: function() {
                        (this).parent().parent().close();
                    }
                }]
            });
        });

        editor.addButton("bdesk_photo", {
            icon: "image",
            context: "insert",
            title: "Insert embedded image",
            cmd: "bdesk_photo"
        });

        editor.addMenuItem("bdesk_photo", {
            cmd: "bdesk_photo",
            context: "insert",
            text: "Insert embedded image",
            icon: "image",
            prependToContext: true
        });
    });

    tinymce.PluginManager.add("reference_manager", function(editor, f) {
        editor.addCommand("reference_manager", function() {
            editor.windowManager.open({
                title: "Insert file reference",
                width: 450,
                height: 80,
                html: '<ul class="list-group"> <li ng-repeat="file in article.files" class="list-group-item"> <span class="badge">{{article}}</span>{{file.name}}</li></ul>',
                buttons: [{
                    text: "Ok",
                    subtype: "primary",
                    onclick: function() {

                    }
                }, {
                    text: "Cancel",
                    onclick: function() {
                        (this).parent().parent().close();
                    }
                }]
            });
        });

        editor.addButton("reference_manager", {
            icon: "anchor",
            context: "insert",
            title: "Insert file reference",
            cmd: "reference_manager"
        });
    });

    $scope.tinymceOptions = {
        selector: 'textarea',
        height: 500,
        theme: 'modern',
        plugins: [
            'advlist autolink lists link image charmap print preview hr anchor pagebreak',
            'searchreplace wordcount visualblocks visualchars code fullscreen',
            'insertdatetime media nonbreaking save table contextmenu directionality',
            'emoticons template paste textcolor colorpicker textpattern imagetools',
            'bdesk_photo', 'reference_manager'
        ],
        menubar: false,
        toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | link bdesk_photo reference_manager'
    };

    $scope.isEditing = false;

    $scope.$watch("article.text", function() {
        $scope.sanatizedArticleText = $sce.trustAsHtml($scope.article.text)
    },true)



    $scope.toggleEditing = function() {
        if($scope.isEditing === true) {
            $scope.isEditing = false;
        } else {
            $scope.isEditing = true;
        }
    }

    $scope.startEditing = function() {
        $location.path('article/'+ $scope.article.id).search('e', 'true');
    }

    $scope.saveArticle = function() {
        $scope.isSaving = true;
        $location.path('article/'+ $scope.article.id).search('e', 'false');
    }

    $scope.$on('$locationChangeStart', function(event) {
        if($scope.isEditing === true && $scope.isSaving === false) {
            event.preventDefault();
        }
    });

    if ($stateParams.e == 'true') {
        $scope.toggleEditing();
    }
}]);
