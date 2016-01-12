angular.module('supersaver.controllers', ['ionic', 'supersaver.services'])

/**
 * controller for the user
 */
.controller('UserCtrl', function($scope, User) {
	$scope.user = 'user';
	$scope.submitForm = function (username, password) {
		User.login(username, password);
	}
})


/**
 * Controller for the home view
 */
.controller('HomeCtrl', function($scope, Clients) {
	$scope.hello = 'hello home view';
	$scope.client = Clients.client;
})

/**
 * Controller for the search view
 */
.controller('SearchCtrl', function($scope, Clients) {
	$scope.hello = 'hello search view';
	$scope.client = Clients.client;
})

/**
 * Controller for the User tabs
 */
.controller('UserTabsCtrl', function($scope, Clients) {
	// nothing here quite yet.
})

/**
 * Controller for the user history view
 */
.controller('HistoryCtrl', function($scope, Clients) {
	$scope.hello = 'hello history view';
	$scope.client = Clients.client;
})

/**
 * Controller for the user favorites view
 */
.controller('FavoritesCtrl', function($scope, Clients) {
	$scope.hello = 'hello favorites view';
	$scope.client = Clients.client;
})