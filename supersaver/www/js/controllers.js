angular.module('supersaver.controllers', ['ionic', 'supersaver.services'])

/**
 * Controller for the home view
 */
 .controller('HomeCtrl', function($scope, Clients) {
 	$scope.hello = 'hello first view';
 	$scope.client = Clients.client;
 })