'use strict';

ApplicationConfiguration.registerModule('core'); // jshint ignore:line

require('./main.js'); // jshint ignore:line
require('./js/config/core.route.js'); // jshint ignore:line
require('./js/controllers/core.controller.js'); // jshint ignore:line
require('./js/controllers/nav.controller.js'); // jshint ignore:line
require('./js/controllers/footer.controller.js'); // jshint ignore:line
require('./js/services/core.service.js'); // jshint ignore:line
require('./js/services/scrollToElement.service.js'); // jshint ignore:line
require('./js/directives/core.directive.js'); // jshint ignore:line
require('./js/controllers/articleDetail.controller.js');  // jshint ignore:line
require('./js/directives/articleList.directive.js');  // jshint ignore:line
require('./js/services/article.service.js');  // jshint ignore:line
require('./js/directives/toastContainer.directive.js');  // jshint ignore:line
require('./js/directives/toast.directive.js');  // jshint ignore:line
require('./js/controllers/search.controller.js');  // jshint ignore:line
require('./js/directives/lastSeenArticle.directive.js');  // jshint ignore:line
require('./js/directives/previousVersionModal.directive.js');  // jshint ignore:line
require('./js/directives/articleListItem.directive.js');  // jshint ignore:line