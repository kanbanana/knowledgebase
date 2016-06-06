'use strict';

angular.module('core').controller('ArticleDetailCtrl', ['$scope', '$stateParams', 'ArticleService', '$sce', '$location', '$rootScope', '$http', function ($scope, $stateParams, ArticleService, $sce, $location, $rootScope, $http) {
    $scope.article = angular.fromJson(ArticleService.getArticle($stateParams.articleId));

    //Save a copy of the loaded version to reset to when user edits and cancels

    $scope.articleServerVer = $scope.article;
    if ($rootScope.article && ($rootScope.article.id == $stateParams.articleId)) {
        $scope.article = $rootScope.article;
    }

    var dragTimer;


    $scope.isSaving = false;
    $scope.isCanceling = false;
    $scope.isDragging = false;

    tinymce.PluginManager.add("bdesk_photo", function (editor, f) {
        editor.addCommand("bdesk_photo", function () {
            editor.windowManager.open({
                title: "Insert embedded image",
                width: 450,
                height: 80,
                html: '<input type="file" class="input" name="single-image" style="font-size:14px;padding: 40px;" accept="image/png, image/gif, image/jpeg, image/jpg"/>',
                buttons: [{
                    text: "Ok",
                    subtype: "primary",
                    onclick: function () {
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
                        classFilereader.onload = function (base64) {
                            var imgData = base64.target.result;
                            var img = new Image();
                            img.src = imgData;

                            editor.execCommand("mceInsertContent", false, "<img src='" + imgData + "' />");
                            thisOne.parent().parent().close();
                        };

                        classFilereader.onerror = function (err) {
                            alert("Error reading file - " + err.getMessage());
                        };

                        classFilereader.readAsDataURL(imagefile[0]);
                    }
                }, {
                    text: "Cancel",
                    onclick: function () {
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

    tinymce.PluginManager.add("reference_manager", function (editor, f) {
        editor.addCommand("reference_manager", function () {
            editor.windowManager.open({
                title: "Insert file reference",
                width: 450,
                height: 80,
                html: '<ul class="list-group"> <li ng-repeat="file in article.files" class="list-group-item"> <span class="badge">{{article}}</span>{{file.name}}</li></ul>',
                buttons: [{
                    text: "Ok",
                    subtype: "primary",
                    onclick: function () {

                    }
                }, {
                    text: "Cancel",
                    onclick: function () {
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
        table_default_styles: {width: '80%'},
        menubar: false,
        toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | table link bdesk_photo reference_manager'
    };

    $scope.isEditing = false;

    $scope.$watch("article.text", function () {
        $scope.sanatizedArticleText = $sce.trustAsHtml($scope.article.text)
    }, true)

    $scope.toggleEditing = function () {
        if ($scope.isEditing === true) {
            $scope.isEditing = false;
        } else {
            $scope.isEditing = true;
        }
    }

    $(document).on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
    })
        .on('dragover dragenter', function () {
            $scope.$apply(function () {
                $scope.isDragging = true;
            })
        })
        .on('dragleave dragend drop', function () {
            window.clearTimeout(dragTimer);
            dragTimer = window.setTimeout(function () {
                $scope.$apply(function () {
                    $scope.isDragging = false;
                })
            }, 1000);
        })
        .on('drop', function (e) {
            var droppedFiles = e.originalEvent.dataTransfer.files;
            $scope.uploadFile(droppedFiles)
        });

    $scope.startEditing = function () {
        $location.path('article/' + $scope.article.id).search('e', 'true');
    };

    $scope.uploadFile = function (files) {
        var fd = new FormData();
        fd.append("file", files[0]);
        var uploadUrl = '/upload';


        var file = {
            type: files[0].name.split('.')[1],
            name: files[0].name.split('.')[0],
            url: "www.google.com"
        }

        $scope.$apply(function () {
            $scope.article.files.push(file);
        })


        /*
         $http.post(uploadUrl, fd, {
         withCredentials: true,
         headers: {'Content-Type': undefined},
         transformRequest: angular.identity
         }).success( function() {
         $scope.$emit("makeToast", {type: "success", message: 'File successfully uploaded'});
         }).error( function() {
         $scope.$emit("makeToast", {type: "warning", message: 'Failed to upload file'});
         })
         */

    };


    $scope.saveArticle = function () {
        $scope.isSaving = true;
        if ($scope.article.isTemp === true) {
            $scope.article.changedBy = $scope.article.author;
        } else {
            if($scope.changedBy != '' && $scope.changedByMail != '')
            $scope.article.changedBy.name = $scope.changedBy;
            $scope.article.changedBy.email = $scope.changedByMail;
        }
        $rootScope.article = $scope.article;
        $scope.$emit("makeToast", {type: "success", message: 'Article has been save'});
        $location.path('article/' + $scope.article.id).search('e', 'false');
    };

    $scope.cancelEditing = function () {
        $scope.isCanceling = true;
        $scope.article = $scope.articleServerVer;
        if($scope.article.isTemp === false) {
            $location.path('article/' + $scope.article.id).search('e', 'false');
        } else {
            $location.path('/').search();
        }
    };


    $scope.deleteFile = function() {
            $scope.article.files.splice(this.$index, 1);
    }

    $scope.$on('$locationChangeStart', function (event) {
        if ($scope.isEditing === true && $scope.isSaving === false && $scope.isCanceling === false) {
            event.preventDefault();
            $scope.$emit("makeToast", {type: "warning", message: 'Save or cancel editing this article'});
        }
    });


    if ($stateParams.e == 'true') {
        if ($scope.article.isTemp === true) {
            $rootScope.article = $scope.article;
        }
        $scope.toggleEditing();
    }
}]);
