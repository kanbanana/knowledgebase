'use strict';

angular.module('core').controller('ArticleDetailCtrl', ['$scope', '$stateParams', 'ArticleService', '$sce', '$location', '$rootScope', '$cookies', function ($scope, $stateParams, ArticleService, $sce, $location, $rootScope, $cookies) {
    $scope.article = {
        text: ''
    };
    $scope.isUploading = false;

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
                html: '<ul class="list-group"> <li ng-repeat="file in article.documents" class="list-group-item"> <span class="badge">{{article}}</span>{{file.name}}</li></ul>',
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
            'bdesk_photo'
        ],
        table_default_styles: {width: '80%'},
        menubar: false,
        toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | table link bdesk_photo reference_manager'
    };

    ArticleService.getArticle($stateParams.articleId).then(function (response) {
        $scope.article = response.data;
        $scope.articleServerVer = $scope.article;
        $scope.articleId = $stateParams.articleId;

        var dragTimer;

        $scope.isSaving = false;
        $scope.isOverridePageLock = false;
        $scope.isDragging = false;
        $scope.isEditing = false;

        var d = new Date($scope.article.lastChanged);
        $scope.date = (d.getHours()+":"+ d.getMinutes()+ ":"+d.getSeconds()+", "+ d.getDate() + "-" + (d.getMonth()+1) +  "-" + d.getFullYear());

        $scope.$watch("article.text", function () {
            $scope.sanatizedArticleText = $sce.trustAsHtml($scope.article.text);
        }, true);

        $scope.toggleEditing = function () {
            if ($scope.isEditing === true) {
                $scope.isEditing = false;
            } else {
                $scope.isEditing = true;
            }
        };

        $(document).on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
        })
            .on('dragover dragenter', function () {
                $scope.$apply(function () {
                    $scope.isDragging = true;
                });
            })
            .on('dragleave dragend drop', function () {
                window.clearTimeout(dragTimer);
                dragTimer = window.setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.isDragging = false;
                    });
                }, 1000);
            })
            .on('drop', function (e) {
                var droppedFiles = e.originalEvent.dataTransfer.files;
                $scope.uploadFile(droppedFiles);
            });

        $scope.startEditing = function () {
            $location.path('article/' + $scope.article.id).search('e', 'true');
        };

        $scope.uploadFile = function (files) {
            var fd = new FormData();
            for (var i = 0; i < files.length; i++) {
                fd.append("documents", files[i]);
            }
            var uploadUrl = $rootScope.baseUrl + "/api/articles/" + $scope.articleId + "/documents/";

            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", uploadProgress, false);

            xhr.open('POST', uploadUrl);
            xhr.send(fd);
            $scope.isUploading = true;


            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    $scope.isUploading = false;
                    var json = JSON.parse(xhr.responseText);
                    json.forEach(function(file) {
                        $scope.article.documents.push(file);
                    });
                    $scope.isUploading = false;
                    $scope.$emit("makeToast", {type: "success", message: 'File successfully uploaded'});
                }
            };
        };

        var uploadProgress = function (e) {
            if (e.lengthComputable) {
                var percent = Math.round(e.loaded * 100 / e.total);
                $scope.$apply(function() {
                    $scope.uploadProgress = percent;
                });

            }
        };


        $scope.saveArticle = function () {
            if($scope.article.title && $scope.article.title !==  "") {
                $scope.isSaving = true;
                if ($scope.article.isTemporary === true) {
                    $scope.article.lastChangedBy = $scope.article.author;
                } else {
                    if ($scope.lastChangedBy) {
                        $scope.article.lastChangedBy.name = $scope.lastChangedBy.name;
                        $scope.article.lastChangedBy.email = $scope.lastChangedBy.email;
                    } else {
                        $scope.article.lastChangedBy.name = "";
                        $scope.article.lastChangedBy.email = "";
                    }

                }
                ArticleService.saveArticle($scope.articleId, $scope.article).then(function (response) {
                    $scope.$emit("makeToast", {type: "success", message: 'Article has been saved'});
                    $location.path('article/' + $scope.article.id).search('e', 'false');
                });
            } else {
                $scope.$emit("makeToast", {type: "warning", message: 'Save failed! Article needs a title!'});
            }

        };

        $scope.cancelEditing = function () {
            $scope.isOverridePageLock = true;
            $scope.article = $scope.articleServerVer;
            if ($scope.article.isTemporary === false) {
                $location.path('article/' + $scope.article.id).search('e', 'false');
            } else {
                $location.path('/').search();
            }
        };


        $scope.deleteFile = function (index) {
            ArticleService.deleteDocument($scope.articleId, this.file.name +"."+ this.file.filetype).then(function() {
                $scope.article.documents.splice(index, 1);
            });
        };

        $scope.deleteArticle = function() {
            ArticleService.deleteArticle($scope.articleId).then(function() {
                $scope.isOverridePageLock = true;
                $location.path('/').search();
            });
        }

        $scope.$on('$locationChangeStart', function (event) {
            if ($scope.isEditing === true && $scope.isSaving === false && $scope.isOverridePageLock === false) {
                event.preventDefault();
                $scope.$emit("makeToast", {type: "warning", message: 'Save or cancel editing this article'});
            }
        });

        $scope.showModal = function() {
            $('#previous-version-modal').modal('show')
        };


        if ($stateParams.e == 'true') {
            $scope.toggleEditing();
        }
    });
}]);
