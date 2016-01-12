// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('supersaver', ['ionic', 'supersaver.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
/**
 * '/' will be the eventual splash page for authentication
 * '/home' will be the main interface view
 */
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('splash', {
    url: '/',
    templateUrl: 'templates/user-login.html',
    controller: 'UserCtrl',
    onEnter: function ($state, User) {
      User.checkSession().then(function (hasSession) {
        if (hasSession) $state.go('home');
      });
    }
  })

  // set up the landing page at /home
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home-view.html',
    controller: 'HomeCtrl'
  })
/**
  // setup of the main view page for search/find deals
  .state('search', {
    url: '/search',
    templateUrl: 'templates/search-view.html',
    controller: 'SearchCtrl'
  })

  //create the top abstract page
  .state('user', {
    url: '/user',
    abstract: true,
    templateUrl: 'templates/user-tabs-view.html',
    controller: 'UserTabsCtrl'
  })

  .state('user.history', {
    url: '/history',
    views: {
      'tabs-history': {
        templateUrl: 'templates/history-view.html',
        controller: 'HistoryCtrl'
      }
    }
  })

  .state('user.favorites', {
    url: '/favorites',
    views: {
      'tabs-favorites': {
        templateUrl: 'templates/favorites-view.html',
        controller: 'FavoritesCtrl'
      }
    }
  })
*/

  //our default landing page. will eventually be switched to '/' for the splash page
  $urlRouterProvider.otherwise('/');
})

.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])

//basic server information
.constant('SERVER', {
  url: 'http://localhost:8888/'
})

//services api endpoints values
.value('ServicesAPIEndpoints', {
  'client': 'client/client',
  'coupon': 'client/coupon',
  'userHistory': 'client/user_history',
  'userFavorites': 'client/user_favorites',
  'token': 'services/session/token'
}) 















