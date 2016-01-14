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
.controller('HomeCtrl', function($scope, $window, User, Clients, NearBy, Featured, YourDeals) {
	$scope.hello = 'hello home view';
	$scope.client = Clients.client;

	//create the object containing the front view content.
	$scope.groups = {
		'nearBy': {
			'title': 'Nearby',
			'content': 'home-nearby'
		},
		'featured': {
			'title': 'Featured',
			'content': Featured.content
		},
		'yourDeals': {
			'title': 'Your Deals',
			'content': YourDeals.content
		}
	}

	$scope.toggleGroup = function (group) {
	    if ($scope.isGroupShown(group)) {
	      $scope.shownGroup = null;
	    } else {
	      $scope.shownGroup = group;
	    }
	}

	$scope.isGroupShown = function (group) {
		return $scope.shownGroup === group;
	}

	$scope.logOut = function () {
		User.destroySession();

		$window.location.href="index.html";
	}
})

/**
 * Controller for the nearby home nearby deals view
 */
.controller('NearByCtrl', function($scope, User, NearBy) {
	//
	$scope.content = 'hello this is nearby content';
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