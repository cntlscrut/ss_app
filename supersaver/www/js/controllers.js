angular.module('supersaver.controllers', ['ionic', 'supersaver.services'])

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