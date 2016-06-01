'use strict';

angular.module('core').factory('ArticleService', ['$q', function ($q) {

    return {
        createArticle: function () {
            setTimeout(function () {
            }, 1000)
            return Math.ceil(Math.random()*10000)
        },
        getArticleItems: function () {
            return [
                {
                    "id": 0,
                    "title": "reprehenderit minim",
                    "author": {
                        "name": "Marks Small",
                        "email": "heleneortega@comvey.com"
                    },
                    "changedBy": {
                        "name": "Dianna Lowery",
                        "email": "bradyhahn@pheast.com"
                    },
                    "lastChanged": "02.04.2016",
                    "text": "Voluptate cillum do commodo cillum labore id. Enim voluptate qui id deserunt et ex veniam consequat esse. Ad ipsum culpa pariatur aliqua velit labore non. Voluptate ullamco sint magna laboris nulla nulla commodo excepteur veniam labore officia tempor aliqua. Nisi sunt nisi excepteur dolore enim tempor ad est commodo qui fugiat cupidatat exercitation. Ad officia dolor est deserunt ullamco aliqua veniam enim dolore minim. Officia ex consequat culpa excepteur ad laboris fugiat sint labore et est ad aliquip esse.\r\nTempor et sint cillum dolore proident. Officia mollit fugiat pariatur tempor nostrud et dolor enim qui aute. Do fugiat adipisicing sunt sunt exercitation commodo. Duis labore occaecat cupidatat ut quis consectetur excepteur officia. Adipisicing pariatur aliquip officia nisi.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "ipsum deserunt",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "velit culpa",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "occaecat proident",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "aliquip in",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "cupidatat ea",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "laboris proident",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "laborum commodo",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 1,
                    "title": "mollit nulla",
                    "author": {
                        "name": "Willa Daniel",
                        "email": "blaircunningham@elentrix.com"
                    },
                    "changedBy": {
                        "name": "Rosalinda Newton",
                        "email": "evangelinalevine@enersol.com"
                    },
                    "lastChanged": "27.05.2016",
                    "text": "Sunt laboris nisi Lorem duis cillum amet cillum voluptate in excepteur sint. Voluptate proident laborum cupidatat ipsum veniam. Ut duis anim nostrud est exercitation.\r\nSint amet commodo nostrud in duis tempor velit excepteur labore est sint. Enim ea id tempor aute reprehenderit consectetur id consequat eu commodo. Proident aute ex nisi voluptate.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "nisi ipsum",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "dolor nulla",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "do occaecat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "id sit",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "id dolore",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "et dolore",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 2,
                    "title": "commodo dolor",
                    "author": {
                        "name": "Rojas Lancaster",
                        "email": "dorothearyan@intergeek.com"
                    },
                    "changedBy": {
                        "name": "Florence Weeks",
                        "email": "bradfordgriffin@orbixtar.com"
                    },
                    "lastChanged": "21.03.2016",
                    "text": "Veniam dolor culpa eu fugiat ex sint dolor veniam. Mollit exercitation culpa deserunt velit dolor. Non laboris est officia amet qui ex voluptate pariatur sint adipisicing voluptate. Et minim et eu pariatur ut veniam elit reprehenderit amet voluptate.\r\nIrure ullamco exercitation ea fugiat dolore ut mollit. Culpa eu labore voluptate eu aute incididunt amet duis. Labore officia consectetur esse incididunt est eiusmod exercitation enim cillum ex aute. Ea nulla aliquip ea aute adipisicing nostrud exercitation sint adipisicing non fugiat sunt non eu. Qui dolore minim magna tempor aute eu duis anim. Ipsum deserunt eu consequat consequat irure. Veniam deserunt voluptate nulla qui esse non amet aliquip.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "eiusmod id",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "ipsum nisi",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "esse voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "aliqua occaecat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "duis eu",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "ea dolor",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 3,
                    "title": "nostrud duis",
                    "author": {
                        "name": "Richmond Mitchell",
                        "email": "sandrazamora@steeltab.com"
                    },
                    "changedBy": {
                        "name": "Kirkland Benton",
                        "email": "donnadaniels@slambda.com"
                    },
                    "lastChanged": "06.05.2016",
                    "text": "Esse proident dolor quis aute. In reprehenderit enim nisi adipisicing non deserunt enim. Qui aliqua ipsum officia mollit exercitation ad ea esse commodo et fugiat consequat. Consequat magna eu magna aliqua id et proident in nulla velit qui.\r\nNisi nostrud fugiat labore in esse eu tempor pariatur commodo. Cupidatat veniam commodo nisi veniam et aliqua tempor ea veniam fugiat ut. Deserunt mollit aliquip proident ad id cupidatat nulla veniam officia irure aliqua aliquip sunt. Cillum aliqua exercitation consequat magna excepteur reprehenderit.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "fugiat velit",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "irure veniam",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "do ullamco",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "Lorem dolor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "eiusmod excepteur",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "est occaecat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "eu tempor",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 4,
                    "title": "exercitation culpa",
                    "author": {
                        "name": "Stein Ball",
                        "email": "kaitlinsolomon@minga.com"
                    },
                    "changedBy": {
                        "name": "Ellis Harper",
                        "email": "mcgowancompton@teraprene.com"
                    },
                    "lastChanged": "27.03.2016",
                    "text": "Id culpa culpa voluptate enim ex aliqua qui occaecat. Ex ad anim adipisicing officia. Quis laborum dolore exercitation elit sint ipsum deserunt anim sunt dolor enim deserunt elit. Elit est velit ullamco id duis. Ea labore amet sint qui duis labore commodo fugiat non tempor. Veniam minim sunt aliquip veniam ex. Magna minim sint ut ad veniam sunt deserunt enim cupidatat ad ut tempor commodo.\r\nUt anim ullamco ex elit labore magna exercitation nostrud laboris ipsum Lorem cillum fugiat reprehenderit. Non eiusmod et consequat amet excepteur excepteur sunt aliqua sint est ut est. Sit mollit in nisi non. Proident nisi reprehenderit tempor exercitation ullamco ex in ullamco sint proident dolor anim. Cupidatat deserunt aliqua anim cillum velit fugiat et magna aliqua labore veniam incididunt dolore.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "reprehenderit sunt",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "duis tempor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "id aute",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "anim ea",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "ipsum duis",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "proident ut",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "fugiat laboris",
                            "url": "www.google.com"
                        }
                    ]
                }
            ]
        },
        getArticle: function (id) {
            var articles = [
                {
                    "id": 0,
                    "title": "reprehenderit minim",
                    "author": {
                        "name": "Marks Small",
                        "email": "heleneortega@comvey.com"
                    },
                    "changedBy": {
                        "name": "Dianna Lowery",
                        "email": "bradyhahn@pheast.com"
                    },
                    "lastChanged": "02.04.2016",
                    "text": "Voluptate cillum do commodo cillum labore id. Enim voluptate qui id deserunt et ex veniam consequat esse. Ad ipsum culpa pariatur aliqua velit labore non. Voluptate ullamco sint magna laboris nulla nulla commodo excepteur veniam labore officia tempor aliqua. Nisi sunt nisi excepteur dolore enim tempor ad est commodo qui fugiat cupidatat exercitation. Ad officia dolor est deserunt ullamco aliqua veniam enim dolore minim. Officia ex consequat culpa excepteur ad laboris fugiat sint labore et est ad aliquip esse.\r\nTempor et sint cillum dolore proident. Officia mollit fugiat pariatur tempor nostrud et dolor enim qui aute. Do fugiat adipisicing sunt sunt exercitation commodo. Duis labore occaecat cupidatat ut quis consectetur excepteur officia. Adipisicing pariatur aliquip officia nisi.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "ipsum deserunt",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "velit culpa",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "occaecat proident",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "aliquip in",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "cupidatat ea",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "laboris proident",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "laborum commodo",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 1,
                    "title": "mollit nulla",
                    "author": {
                        "name": "Willa Daniel",
                        "email": "blaircunningham@elentrix.com"
                    },
                    "changedBy": {
                        "name": "Rosalinda Newton",
                        "email": "evangelinalevine@enersol.com"
                    },
                    "lastChanged": "27.05.2016",
                    "text": "Sunt laboris nisi Lorem duis cillum amet cillum voluptate in excepteur sint. Voluptate proident laborum cupidatat ipsum veniam. Ut duis anim nostrud est exercitation.\r\nSint amet commodo nostrud in duis tempor velit excepteur labore est sint. Enim ea id tempor aute reprehenderit consectetur id consequat eu commodo. Proident aute ex nisi voluptate.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "nisi ipsum",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "dolor nulla",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "do occaecat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "id sit",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "id dolore",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "et dolore",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 2,
                    "title": "commodo dolor",
                    "author": {
                        "name": "Rojas Lancaster",
                        "email": "dorothearyan@intergeek.com"
                    },
                    "changedBy": {
                        "name": "Florence Weeks",
                        "email": "bradfordgriffin@orbixtar.com"
                    },
                    "lastChanged": "21.03.2016",
                    "text": "Veniam dolor culpa eu fugiat ex sint dolor veniam. Mollit exercitation culpa deserunt velit dolor. Non laboris est officia amet qui ex voluptate pariatur sint adipisicing voluptate. Et minim et eu pariatur ut veniam elit reprehenderit amet voluptate.\r\nIrure ullamco exercitation ea fugiat dolore ut mollit. Culpa eu labore voluptate eu aute incididunt amet duis. Labore officia consectetur esse incididunt est eiusmod exercitation enim cillum ex aute. Ea nulla aliquip ea aute adipisicing nostrud exercitation sint adipisicing non fugiat sunt non eu. Qui dolore minim magna tempor aute eu duis anim. Ipsum deserunt eu consequat consequat irure. Veniam deserunt voluptate nulla qui esse non amet aliquip.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "eiusmod id",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "ipsum nisi",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "esse voluptate",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "aliqua occaecat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "duis eu",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "ea dolor",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 3,
                    "title": "nostrud duis",
                    "author": {
                        "name": "Richmond Mitchell",
                        "email": "sandrazamora@steeltab.com"
                    },
                    "changedBy": {
                        "name": "Kirkland Benton",
                        "email": "donnadaniels@slambda.com"
                    },
                    "lastChanged": "06.05.2016",
                    "text": "Esse proident dolor quis aute. In reprehenderit enim nisi adipisicing non deserunt enim. Qui aliqua ipsum officia mollit exercitation ad ea esse commodo et fugiat consequat. Consequat magna eu magna aliqua id et proident in nulla velit qui.\r\nNisi nostrud fugiat labore in esse eu tempor pariatur commodo. Cupidatat veniam commodo nisi veniam et aliqua tempor ea veniam fugiat ut. Deserunt mollit aliquip proident ad id cupidatat nulla veniam officia irure aliqua aliquip sunt. Cillum aliqua exercitation consequat magna excepteur reprehenderit.\r\n",
                    "files": [
                        {
                            "type": "txt",
                            "name": "fugiat velit",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "irure veniam",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "do ullamco",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "Lorem dolor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "eiusmod excepteur",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "est occaecat",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "eu tempor",
                            "url": "www.google.com"
                        }
                    ]
                },
                {
                    "id": 4,
                    "title": "exercitation culpa",
                    "author": {
                        "name": "Stein Ball",
                        "email": "kaitlinsolomon@minga.com"
                    },
                    "changedBy": {
                        "name": "Ellis Harper",
                        "email": "mcgowancompton@teraprene.com"
                    },
                    "lastChanged": "27.03.2016",
                    "text": "Id culpa culpa voluptate enim ex aliqua qui occaecat. Ex ad anim adipisicing officia. Quis laborum dolore exercitation elit sint ipsum deserunt anim sunt dolor enim deserunt elit. Elit est velit ullamco id duis. Ea labore amet sint qui duis labore commodo fugiat non tempor. Veniam minim sunt aliquip veniam ex. Magna minim sint ut ad veniam sunt deserunt enim cupidatat ad ut tempor commodo.\r\nUt anim ullamco ex elit labore magna exercitation nostrud laboris ipsum Lorem cillum fugiat reprehenderit. Non eiusmod et consequat amet excepteur excepteur sunt aliqua sint est ut est. Sit mollit in nisi non. Proident nisi reprehenderit tempor exercitation ullamco ex in ullamco sint proident dolor anim. Cupidatat deserunt aliqua anim cillum velit fugiat et magna aliqua labore veniam incididunt dolore.\r\n",
                    "files": [
                        {
                            "type": "pdf",
                            "name": "reprehenderit sunt",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "duis tempor",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "id aute",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "anim ea",
                            "url": "www.google.com"
                        },
                        {
                            "type": "pdf",
                            "name": "ipsum duis",
                            "url": "www.google.com"
                        },
                        {
                            "type": "docx",
                            "name": "proident ut",
                            "url": "www.google.com"
                        },
                        {
                            "type": "txt",
                            "name": "fugiat laboris",
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
                "author": "Unknown",
                "changedBy": "",
                "lastChanged": "16.02.2016",
                "text": "",
                "files": []
            }
        }
    };

}]);
