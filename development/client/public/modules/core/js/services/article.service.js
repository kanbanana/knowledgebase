'use strict';

angular.module('core').factory('ArticleService', ['$q', '$http', '$rootScope', function ($q, $http, $rootScope) {

    return {
        searchArticles: function (query) {
            return $http({
                method: 'GET',
                url: $rootScope.baseUrl + "/api/articles?q=" + query
            }).then(function successCallback(response) {
                return response
            }, function errorCallback(response) {
                return response
            });
        },
        getArticle: function (id) {
            return $http({
                method: 'GET',
                url: $rootScope.baseUrl + "/api/articles/" + id
            }).then(function successCallback(response) {
                return response
            }, function errorCallback(response) {
                console.log(response)
                return response
            });
        },
        getLastSeenArticles: function (cookie) {
            return $http({
                method: 'GET',
                url: $rootScope.baseUrl + "/api/getLastSeen/"
            }).then(function successCallback(response) {
                return response
            }, function errorCallback(response) {
                console.log(response)
                return response
            });
        },
        createArticle: function () {
            return $http({
                method: 'POST',
                url: $rootScope.baseUrl + "/api/articles/"
            }).then(function successCallback(response) {
                return response
            }, function errorCallback(response) {
                return response
            });
        },
        uploadDocument: function (id, doc) {
            return $http({
                method: 'POST',
                url: $rootScope.baseUrl + "/api/articles/" + id + "/documents/",
                transformRequest: angular.identity,
                headers: {'Content-Type': false},
                data: {}
            }).then(function successCallback(response) {
                console.log(response)
                return response
            }, function errorCallback(response) {
                return response
            });
        },
        saveArticle: function (id, article) {
            return $http({
                method: 'PUT',
                url: $rootScope.baseUrl + "/api/articles/" + id,
                data: article
            }).then(function successCallback(response) {
                return response
            }, function errorCallback(response) {
                return response
            });
        },
        deleteArticle: function (id) {
            return $http({
                method: 'DELETE',
                url: $rootScope.baseUrl + "/api/articles/" + id,
            }).then(function successCallback(response) {
                return response
            }, function errorCallback(response) {
                return response
            });
        },
        deleteDocument: function (id, filename) {
            return $http({
                method: 'DELETE',
                url: $rootScope.baseUrl + "/api/articles/" + id + "/documents/" + filename
            }).then(function successCallback(response) {
                return response
            }, function errorCallback(response) {
                return response
            });
        },
        getArticleItemsDep: function () {
            return [
                {
                    "id": 0,
                    "title": "excepteur eu",
                    "isTemp": false,
                    "author": {
                        "name": "English Diaz",
                        "email": "morrisdaniels@kraggle.com"
                    },
                    "changedBy": {
                        "name": "Sylvia Simon",
                        "email": "eleanorrichmond@comtrak.com"
                    },
                    "lastChanged": "31.01.2016",
                    "text": "Cupidatat sit enim magna sunt ipsum. Dolore aute anim pariatur qui deserunt commodo fugiat Lorem nostrud velit. Tempor exercitation officia reprehenderit deserunt exercitation proident. Commodo tempor nulla nostrud ex aliquip reprehenderit enim eu incididunt. In aute velit cupidatat eu cupidatat incididunt aute labore do officia.\r\nConsectetur Lorem ut fugiat et quis in tempor ea cupidatat commodo pariatur irure sunt. Consequat reprehenderit sunt reprehenderit veniam eiusmod irure magna commodo duis. Do labore do sit eu minim non tempor consequat ut ut in. Labore cupidatat anim consectetur deserunt.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "quis reprehenderit",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "esse commodo",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "reprehenderit magna",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "exercitation voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "ullamco nostrud",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "officia proident",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 1,
                    "title": "amet non",
                    "isTemp": false,
                    "author": {
                        "name": "George Stone",
                        "email": "deenacarey@andryx.com"
                    },
                    "changedBy": {
                        "name": "Sheila Solis",
                        "email": "ceceliaochoa@prosure.com"
                    },
                    "lastChanged": "13.02.2016",
                    "text": "Tempor elit voluptate reprehenderit adipisicing labore duis cillum consectetur non laboris aliqua officia. Non commodo deserunt aliquip eu amet eiusmod dolor nisi aliqua. Veniam qui elit non ad adipisicing ad reprehenderit enim magna. Qui ex magna cupidatat in culpa ullamco consectetur aliquip magna laborum.\r\nAd non dolore proident enim. Dolore incididunt non veniam exercitation irure nostrud laborum excepteur tempor nisi non ad deserunt officia. In pariatur voluptate incididunt fugiat commodo Lorem nisi est voluptate reprehenderit eiusmod fugiat culpa enim. Aliquip laboris irure elit aliqua consectetur nostrud labore ipsum ea eiusmod nisi consectetur.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "ea voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "fugiat eiusmod",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "eiusmod in",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "id aliqua",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "minim occaecat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "id tempor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "ex nisi",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 2,
                    "title": "non reprehenderit",
                    "isTemp": false,
                    "author": {
                        "name": "Whitney Burt",
                        "email": "janicewilkerson@eschoir.com"
                    },
                    "changedBy": {
                        "name": "Tabitha Wiley",
                        "email": "bruceallen@hopeli.com"
                    },
                    "lastChanged": "13.03.2016",
                    "text": "Proident nisi pariatur sit incididunt Lorem voluptate dolore non excepteur. Lorem consequat id incididunt cupidatat minim. Pariatur dolore et reprehenderit exercitation sint ex quis aliqua amet tempor. Culpa laborum dolore enim mollit esse non nostrud sunt.\r\nSint ullamco exercitation adipisicing eiusmod ad aliqua sint irure amet eiusmod id proident nulla nostrud. Qui cillum irure qui consequat culpa ea non amet et minim cillum sit magna velit. Aliquip laboris esse enim voluptate aliquip quis dolore adipisicing nisi.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "exercitation qui",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "dolore quis",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "sint tempor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "sit anim",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "velit labore",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 3,
                    "title": "esse sit",
                    "isTemp": false,
                    "author": {
                        "name": "Velazquez Chandler",
                        "email": "andrewsharrison@combot.com"
                    },
                    "changedBy": {
                        "name": "Clarice Romero",
                        "email": "griffithnorris@comvene.com"
                    },
                    "lastChanged": "09.02.2016",
                    "text": "Commodo officia incididunt deserunt ex irure deserunt dolor amet ullamco est pariatur ex pariatur. Nulla labore nulla laboris adipisicing. Reprehenderit aliquip ullamco occaecat elit est minim elit quis tempor tempor nulla magna. Ut aute nulla pariatur dolore ipsum aliqua sit mollit enim amet tempor.\r\nFugiat ullamco proident elit ullamco consectetur nostrud aliquip officia sit occaecat duis anim. Nostrud enim ea esse pariatur nulla in reprehenderit do elit aliqua sint non aliqua. Esse minim ea cupidatat elit amet ad dolor quis occaecat voluptate incididunt. Cupidatat veniam ex adipisicing non laboris elit esse dolore. Dolore pariatur veniam eu pariatur sit adipisicing duis anim eu mollit excepteur nostrud in do. Aliqua ut cupidatat exercitation consectetur nostrud eu. In in quis dolore officia pariatur commodo ut ullamco eu anim sunt.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "dolor consectetur",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "reprehenderit ut",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "veniam consequat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "consequat veniam",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "irure dolor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "id sint",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "eu cupidatat",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 4,
                    "title": "tempor minim",
                    "isTemp": false,
                    "author": {
                        "name": "Hernandez Patrick",
                        "email": "lolajohnston@frenex.com"
                    },
                    "changedBy": {
                        "name": "Reilly Trevino",
                        "email": "branchcallahan@anarco.com"
                    },
                    "lastChanged": "02.03.2016",
                    "text": "Cillum proident elit voluptate labore. Mollit minim mollit consequat et incididunt minim velit. Non dolor Lorem tempor laboris excepteur ullamco consequat occaecat non.\r\nDo non labore consequat tempor deserunt voluptate adipisicing laboris id. Veniam excepteur officia sunt velit sint. Amet eu labore commodo voluptate ad est officia proident sint quis cillum amet eu tempor. Culpa pariatur dolore cillum consectetur amet ullamco duis nostrud est aliqua. Laborum fugiat in elit laboris reprehenderit aliqua magna sit.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "nulla consectetur",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "reprehenderit cillum",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "nisi voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "officia minim",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "commodo aliquip",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "elit est",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "nulla cillum",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 5,
                    "title": "qui ea",
                    "isTemp": false,
                    "author": {
                        "name": "Lloyd Richardson",
                        "email": "lynettealbert@ginkogene.com"
                    },
                    "changedBy": {
                        "name": "Maryellen Mathis",
                        "email": "doreenhardy@boilcat.com"
                    },
                    "lastChanged": "25.03.2016",
                    "text": "Mollit nulla labore laborum ad cupidatat Lorem. Anim Lorem anim deserunt dolor est voluptate in elit elit dolor mollit. Do excepteur in excepteur voluptate pariatur sit minim aliquip commodo esse eiusmod culpa.\r\nCommodo anim id sint laboris laboris. Exercitation deserunt officia labore irure ipsum reprehenderit. Enim dolor mollit sunt esse fugiat esse ex quis cillum qui. Amet esse aliquip elit veniam enim cillum quis velit nisi sit velit voluptate anim. Ad exercitation est anim duis in commodo cillum aliquip mollit id. Laboris ad enim elit dolor labore cillum.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "aliquip proident",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "do voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "velit tempor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "id nisi",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "nulla laborum",
                            "url": "www.google.com"
                        }
                    ]
                }
            ]
        },
        getArticleDep: function (id) {
            var articles = [
                {
                    "id": 0,
                    "title": "excepteur eu",
                    "isTemp": false,
                    "author": {
                        "name": "English Diaz",
                        "email": "morrisdaniels@kraggle.com"
                    },
                    "changedBy": {
                        "name": "Sylvia Simon",
                        "email": "eleanorrichmond@comtrak.com"
                    },
                    "lastChanged": "31.01.2016",
                    "text": "Cupidatat sit enim magna sunt ipsum. Dolore aute anim pariatur qui deserunt commodo fugiat Lorem nostrud velit. Tempor exercitation officia reprehenderit deserunt exercitation proident. Commodo tempor nulla nostrud ex aliquip reprehenderit enim eu incididunt. In aute velit cupidatat eu cupidatat incididunt aute labore do officia.\r\nConsectetur Lorem ut fugiat et quis in tempor ea cupidatat commodo pariatur irure sunt. Consequat reprehenderit sunt reprehenderit veniam eiusmod irure magna commodo duis. Do labore do sit eu minim non tempor consequat ut ut in. Labore cupidatat anim consectetur deserunt.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "quis reprehenderit",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "esse commodo",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "reprehenderit magna",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "exercitation voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "ullamco nostrud",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "officia proident",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 1,
                    "title": "amet non",
                    "isTemp": false,
                    "author": {
                        "name": "George Stone",
                        "email": "deenacarey@andryx.com"
                    },
                    "changedBy": {
                        "name": "Sheila Solis",
                        "email": "ceceliaochoa@prosure.com"
                    },
                    "lastChanged": "13.02.2016",
                    "text": "Tempor elit voluptate reprehenderit adipisicing labore duis cillum consectetur non laboris aliqua officia. Non commodo deserunt aliquip eu amet eiusmod dolor nisi aliqua. Veniam qui elit non ad adipisicing ad reprehenderit enim magna. Qui ex magna cupidatat in culpa ullamco consectetur aliquip magna laborum.\r\nAd non dolore proident enim. Dolore incididunt non veniam exercitation irure nostrud laborum excepteur tempor nisi non ad deserunt officia. In pariatur voluptate incididunt fugiat commodo Lorem nisi est voluptate reprehenderit eiusmod fugiat culpa enim. Aliquip laboris irure elit aliqua consectetur nostrud labore ipsum ea eiusmod nisi consectetur.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "ea voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "fugiat eiusmod",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "eiusmod in",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "id aliqua",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "minim occaecat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "id tempor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "ex nisi",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 2,
                    "title": "non reprehenderit",
                    "isTemp": false,
                    "author": {
                        "name": "Whitney Burt",
                        "email": "janicewilkerson@eschoir.com"
                    },
                    "changedBy": {
                        "name": "Tabitha Wiley",
                        "email": "bruceallen@hopeli.com"
                    },
                    "lastChanged": "13.03.2016",
                    "text": "Proident nisi pariatur sit incididunt Lorem voluptate dolore non excepteur. Lorem consequat id incididunt cupidatat minim. Pariatur dolore et reprehenderit exercitation sint ex quis aliqua amet tempor. Culpa laborum dolore enim mollit esse non nostrud sunt.\r\nSint ullamco exercitation adipisicing eiusmod ad aliqua sint irure amet eiusmod id proident nulla nostrud. Qui cillum irure qui consequat culpa ea non amet et minim cillum sit magna velit. Aliquip laboris esse enim voluptate aliquip quis dolore adipisicing nisi.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "exercitation qui",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "dolore quis",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "sint tempor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "sit anim",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "velit labore",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 3,
                    "title": "esse sit",
                    "isTemp": false,
                    "author": {
                        "name": "Velazquez Chandler",
                        "email": "andrewsharrison@combot.com"
                    },
                    "changedBy": {
                        "name": "Clarice Romero",
                        "email": "griffithnorris@comvene.com"
                    },
                    "lastChanged": "09.02.2016",
                    "text": "Commodo officia incididunt deserunt ex irure deserunt dolor amet ullamco est pariatur ex pariatur. Nulla labore nulla laboris adipisicing. Reprehenderit aliquip ullamco occaecat elit est minim elit quis tempor tempor nulla magna. Ut aute nulla pariatur dolore ipsum aliqua sit mollit enim amet tempor.\r\nFugiat ullamco proident elit ullamco consectetur nostrud aliquip officia sit occaecat duis anim. Nostrud enim ea esse pariatur nulla in reprehenderit do elit aliqua sint non aliqua. Esse minim ea cupidatat elit amet ad dolor quis occaecat voluptate incididunt. Cupidatat veniam ex adipisicing non laboris elit esse dolore. Dolore pariatur veniam eu pariatur sit adipisicing duis anim eu mollit excepteur nostrud in do. Aliqua ut cupidatat exercitation consectetur nostrud eu. In in quis dolore officia pariatur commodo ut ullamco eu anim sunt.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "dolor consectetur",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "reprehenderit ut",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "veniam consequat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "consequat veniam",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "irure dolor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "id sint",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "eu cupidatat",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 4,
                    "title": "tempor minim",
                    "isTemp": false,
                    "author": {
                        "name": "Hernandez Patrick",
                        "email": "lolajohnston@frenex.com"
                    },
                    "changedBy": {
                        "name": "Reilly Trevino",
                        "email": "branchcallahan@anarco.com"
                    },
                    "lastChanged": "02.03.2016",
                    "text": "Cillum proident elit voluptate labore. Mollit minim mollit consequat et incididunt minim velit. Non dolor Lorem tempor laboris excepteur ullamco consequat occaecat non.\r\nDo non labore consequat tempor deserunt voluptate adipisicing laboris id. Veniam excepteur officia sunt velit sint. Amet eu labore commodo voluptate ad est officia proident sint quis cillum amet eu tempor. Culpa pariatur dolore cillum consectetur amet ullamco duis nostrud est aliqua. Laborum fugiat in elit laboris reprehenderit aliqua magna sit.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "nulla consectetur",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "reprehenderit cillum",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "nisi voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "officia minim",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "commodo aliquip",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "elit est",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "nulla cillum",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 5,
                    "title": "qui ea",
                    "isTemp": false,
                    "author": {
                        "name": "Lloyd Richardson",
                        "email": "lynettealbert@ginkogene.com"
                    },
                    "changedBy": {
                        "name": "Maryellen Mathis",
                        "email": "doreenhardy@boilcat.com"
                    },
                    "lastChanged": "25.03.2016",
                    "text": "Mollit nulla labore laborum ad cupidatat Lorem. Anim Lorem anim deserunt dolor est voluptate in elit elit dolor mollit. Do excepteur in excepteur voluptate pariatur sit minim aliquip commodo esse eiusmod culpa.\r\nCommodo anim id sint laboris laboris. Exercitation deserunt officia labore irure ipsum reprehenderit. Enim dolor mollit sunt esse fugiat esse ex quis cillum qui. Amet esse aliquip elit veniam enim cillum quis velit nisi sit velit voluptate anim. Ad exercitation est anim duis in commodo cillum aliquip mollit id. Laboris ad enim elit dolor labore cillum.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "aliquip proident",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "do voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "velit tempor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "id nisi",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "nulla laborum",
                            "url": "www.google.com"
                        }
                    ]
                }
            ]

            for (var i = 0; i < articles.length; i++) {
                if (articles[i].id == id) {
                    return articles[i];
                }
            }

            return {
                "id": id,
                "title": "",
                "isTemp": true,
                "author": {
                    name: "",
                    email: ""
                },
                "changedBy": {
                    name: "",
                    email: ""
                },
                "lastChanged": "16.02.2016",
                "text": "",
                "files": []
            }
        }
    };

}]);
