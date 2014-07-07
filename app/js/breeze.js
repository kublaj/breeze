require.config({
  paths : {
    text: 'bower_components/requirejs-plugins/lib/text',
    json: 'bower_components/requirejs-plugins/src/json'
  },
  urlArgs: "bust=" + Math.round(2147483647 * Math.random())
});

define('breeze', ['json!content/pages/index.json'], function (menuJson) {

  var routingState = {
    currentPage: ''
  };

  function boot() {

    var routes = {};

    for ( var i = 0; i < menuJson.pages.length; i+=1 ) {
      menuJson.pages[i].uri = uri(menuJson.pages[i].file);
      menuJson.pages[i].navigateTo = navigateTo(menuJson.pages[i])
      routes[menuJson.pages[i].uri] = menuJson.pages[i].navigateTo;
    }

    var router = Router(routes);
    router.on(/.*/, function () {
      router.setRoute(menuJson.pages[0].uri);
    });
    router.init('#/' + menuJson.pages[0].uri);

    var content = new Vue({
      el: '#br-content',
      data: {
        routingState: routingState
      }
    });

    var menu = new Vue({
      el: '#br-menu',
      data: menuJson
    });

  }

  function uri(pageFile) {
    // Remove file extension
    return pageFile.replace(/\.[^/.]+$/, '');
  }

  function navigateTo(page) {

    var scripts = [];

    if (!!page.scripts) {
      for ( var i = 0; i < page.scripts.length; i+= 1 ) {
        scripts[i] = 'content/pages/' + page.scripts[i];
      }
    }

    function runScripts(method) {
      if (scripts.length !== 0) {
        require(scripts, function () {
          for ( var i = 0; i < arguments.length; i+= 1 ) {
            (arguments[i][method])();
          }
        });
      }
    }

    return function () {
      if (!Vue.options.components[page.uri]) {
        require(['text!content/pages/' + page.file], function (pageSource) {
          Vue.component(page.uri, {
            template: marked(pageSource),
            attached: function () {
              runScripts('show');
            },
            detached: function () {
              runScripts('hide');
            }
          });
          routingState.currentPage = page.uri;
        });
      } else {
        routingState.currentPage = page.uri;
      }
    };
  }

  return {
    boot: boot
  };

});

require(['breeze'], function (breeze) {
  breeze.boot();
});
