'use strict';

/**
 * @description This controller manages all data expressed in the articleDetail view.
 *
 * @class ArticleDetailCtrl
 * @param {Dependency} $stateParams - Service that reads out the URL and helps deciding if the user is in editing/viewing mode by reading from the 'e' option in the URL.
 * @param {Dependency} ArticleService - The ArticleService provides the rest calls to retrieve article information
 * @param {Dependency} $sce - Service used to sanatize the article text
 * @param {Dependency} $location - Service used to change the url location (f.e. switching between modes)
 * @oaram {Dependency} $window - Service forces browser reload on changing the route
 *
 */

angular.module('core').controller('ArticleDetailCtrl', ['$scope', '$stateParams', 'ArticleService', '$sce', '$location', '$rootScope', '$window', function ($scope, $stateParams, ArticleService, $sce, $location, $rootScope, $window) {

    // article text has to be initialised before retrieved from the back-end
    $scope.article = {
        text: ''
    };



    // Tinymce plugin to insert pictures in base64 into the editor. Move to global folder if needed in different view
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
        if(response.status === 404) {
            $scope.$emit("makeToast", {type: "warning", message: "Article not found!"});
            return
        }

        var dragTimer;
        var uploadedFiles = [];
        var filesToDelete = [];

        $scope.article = response.data;
        $scope.articleServerVer = $scope.article;
        $scope.articleId = $stateParams.articleId;

        $scope.isUploading = false;
        $scope.isSaving = false;
        $scope.isOverridePageLock = false;
        $scope.isDragging = false;
        $scope.isEditing = false;
        $scope.changeTo = "";


        $scope.date = (new Date($scope.article.lastChanged)).toISOString().slice(0,10) + ", " + (new Date($scope.article.lastChanged)).toISOString().slice(11,19);

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

        //Code used to make the drag and drop upload of files possible
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
            });
        $("#dropzone").on('drop', function (e) {
            var droppedFiles = e.originalEvent.dataTransfer.files;
            console.log(droppedFiles)
            var uniqueFiles = _.uniq(droppedFiles, function (item, key, a) {
                return item.name;
            });

            $scope.uploadFile(uniqueFiles);
        });

        // Changes route when the user starts editing the article
        // The page will be reloaded and the article retrieved anew -> bypasses problem with inconsistent state if article has been deleted
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


            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    $scope.isUploading = false;
                    var json = JSON.parse(xhr.responseText);
                    json.forEach(function (file) {
                        $scope.article.documents.push(file);
                        uploadedFiles.push(file.name + "." + file.filetype)
                    });
                    $scope.isUploading = false;
                    $scope.$emit("makeToast", {type: "success", message: 'File successfully uploaded'});
                }
            };
        };

        var uploadProgress = function (e) {
            if (e.lengthComputable) {
                var percent = Math.round(e.loaded * 100 / e.total);
                $scope.$apply(function () {
                    $scope.uploadProgress = percent;
                });

            }
        };


        // saves article and checks if the user has entered a title and the validity of the email
        $scope.saveArticle = function () {
            if ($scope.article.title && $scope.article.title !== "") {
                $scope.isSaving = true;
                if ($scope.article.isTemporary === true) {
                    if($scope.article.author.email && !isEmail($scope.article.author.email)) {
                        $scope.isSaving = false;
                        $scope.$emit("makeToast", {type: "warning", message: 'Invalid e-mail'});
                        return;
                    }
                    $scope.article.lastChangedBy = $scope.article.author;
                } else {
                    if ($scope.lastChangedBy) {
                        $scope.article.lastChangedBy.name = $scope.lastChangedBy.name;
                        if($scope.lastChangedBy.email && !isEmail($scope.lastChangedBy.email)) {
                            $scope.isSaving = false;
                            $scope.$emit("makeToast", {type: "warning", message: 'Invalid e-mail'});
                            return;
                        } else {
                                $scope.article.lastChangedBy.email = $scope.lastChangedBy.email;
                        }
                    } else {
                        $scope.article.lastChangedBy.name = "";
                        $scope.article.lastChangedBy.email = "";
                    }

                }

                //batch deletes all files the user has deleted during his editing session
                //This way the files will be untouched if the user decides to cancel his editing session
                batchDeleteFiles(filesToDelete, function () {
                    ArticleService.saveArticle($scope.articleId, $scope.article).then(function (response) {
                        $scope.$emit("makeToast", {type: "success", message: 'Article has been saved'});
                        $location.path('article/' + $scope.article.id).search('e', 'false');
                    });
                });

            } else {
                $scope.$emit("makeToast", {type: "warning", message: 'Save failed! Article needs a title!'});
            }
        };

        var isEmail = function(strToTest) {
            var emailPattern = new RegExp(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)
            return emailPattern.test(strToTest);
        }

        $scope.cancelEditing = function () {
            if ($scope.article.isTemporary === false) {
                $location.path('article/' + $scope.article.id).search('e', 'false');
            } else {
                $location.path('/').search();
            }
        };

        $scope.deleteFile = function (index) {
            filesToDelete.push(this.file.name + "." + this.file.filetype);
            $scope.article.documents.splice(index, 1);
        };

        var batchDeleteFiles = function (files, callback) {
            var n = 0;
            if (files.length === 0) {
                callback();
            } else {
                for (var i = 0; i < files.length; i++) {
                    ArticleService.deleteDocument($scope.articleId, files[i]).then(function () {
                        n++;
                        if (n === files.length) {
                            callback();
                        }
                    });
                }
            }
        };

        //Following functions describe all scenarios where the user should be prompted if he wants to continue
        //with his actions

        $scope.deleteArticle = function () {
            $scope.$broadcast("callModal", {
                title: "Delete Article?",
                text: "If you confirm this article will be deleted!",
                onConfirmation: "deleteArticle"
            });
        };

        $scope.$on('$locationChangeStart', function (event, next) {
            if ($scope.isEditing === true && $scope.isSaving === false && $scope.isOverridePageLock === false) {
                event.preventDefault();
                $scope.changeTo = next;
                $scope.$broadcast("callModal", {
                    title: "Discard changes?",
                    text: "If you confirm your changes will be discarded!",
                    onConfirmation: "discardChanges"
                });
            }
        });

        $scope.$on('deleteArticle', function () {
            $scope.changeTo = $rootScope.baseUrl;
            ArticleService.deleteArticle($scope.articleId).then(function () {
                $scope.$emit("makeToast", {type: "success", message: 'Article deleted!'});
                $scope.changeRoute();
            });
        });

        $scope.$on('discardChanges', function () {
            $scope.article = $scope.articleServerVer;
            batchDeleteFiles(uploadedFiles, function () {
                $scope.$emit("makeToast", {type: "success", message: 'Changes discarded!'});
                $scope.changeRoute();
            });
        });

        $scope.changeRoute = function () {
            $scope.isOverridePageLock = true;
            $window.location.href = $scope.changeTo;
        };

        if ($stateParams.e == 'true') {
            $scope.toggleEditing();
        }
    });
}]);
