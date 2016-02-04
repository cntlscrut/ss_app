angular.module('supersaver.controllers', ['ionic', 'ngCordova', 'supersaver.services'])

/**
 * controller for the user
 */
.controller('UserCtrl', function($scope, User) {
	$scope.user = 'user';
	$scope.submitForm = function (username, password) {
		User.login(username, password);
	}
})

.controller('TabsCtrl', function($scope, $window, User) {
	//
	$scope.logOut = function () {
		User.destroySession();
		$window.location.href="/";
	}
})


/**
 * Controller for the home view
 */
.controller('HomeCtrl', function($scope, $timeout, $window, $ionicSlideBoxDelegate, User, NearBySrv) {
	$ionicSlideBoxDelegate.enableSlide(true);

	$scope.hello = 'hello home view';
	//$scope.client = Clients.client;

	//create the object containing the front view content.
	$scope.groups = {
		'nearBy': {
			'title': 'Nearby',
			'items': $scope.nearbyItems
		},
	}

	NearBySrv.fetchCurrentLocale()
		.then(function (coordinates) {
			$scope.coordinates = coordinates;
			console.log('geolocation is good. returning only nearby clients');
			NearBySrv.fetchNearbyClients(coordinates)
				.then(function (data) {
					console.log('is this the data?');
					console.log(data);
					$scope.nearbyItems = data;
					$scope.setGroupData(data);
					$timeout(function () {
						console.log('am i hitting here?');
						//$scope.$apply();
						$ionicSlideBoxDelegate.slide(0);
						$ionicSlideBoxDelegate.update();
					},500);
				});
		}, function (repsonse) {
			// still send for the client list regardless of coordinates
			console.log('returning all client data as default');
			NearBySrv.fetchNearbyClients(false)
				.then(function (data) {
					console.log('data returned from the server');
					console.log(data);
					$scope.nearbyItems = data;
					$scope.setGroupData(data);
					$timeout(function () {
						console.log('am i hitting here? ');
						$ionicSlideBoxDelegate.slide(0);
						$ionicSlideBoxDelegate.update();
						//$scope.$apply();
					},500);
				});
		})

	$scope.setGroupData = function (data) {
		$scope.groups.nearBy.items = data;
		console.log('setting group data');
		console.log(data);
		if (data == '') {
			alert('data is empty');
		}
	}

	$scope.repeatDone = function() {
		console.log('in the repeat done directive');
	 	$ionicSlideBoxDelegate.update();
	};

	$scope.goToClient = function (clientId) {
		$state.go('client({client_id: clientId})');
	}
})

/**
 * Controller for the main client view
 */
 .controller('ClientCtrl', function ($scope, $stateParams, $ionicHistory, Client, Favorites) {
 	// init
 	$scope.hello = 'hello';
 	$scope.clientId = $stateParams.client_id;

 	Client.fetchClient($scope.clientId)
 		.then(function (clientListing) {
 			$scope.header = clientListing.header;
 			$scope.dealList = clientListing.dealList;
 		});

 	$scope.goBack = function () {
 		console.log('going back');
 		$ionicHistory.goBack();
 	}

 	$scope.toggleFavorite = function (clientId) {
 		// use clicks button to swap value be it add or remove item in favorites list
 		$scope.header.favorited = !$scope.header.favorited;

 		if ($scope.header.favorited) {
 			Favorites.addFavorite(clientId)
 				.then(function (isFavorited) {
 					alert(isFavorited.message);
 					$scope.header.favorited = isFavorited.favorited;
 				});
 		} else {
 			Favorites.removeFavorite(clientId)
 				.then(function (isFavorited) {
 					alert(isFavorited.message);
 					$scope.header.favorited = isFavorited.favorited;
 				});
 		}
 	}
 })

/**
 * Controller for the nearby home nearby deals view
 */
.controller('CouponCtrl', function ($state, $scope, $stateParams, $ionicHistory, Coupon) {
	$scope.hello = 'hello coupon view';
	$scope.couponId = $stateParams.coupon_id;

	Coupon.fetchCoupon($scope.couponId)
		.then(function (coupon) {
			$scope.coupon = coupon;
		});

 	$scope.goBack = function (client_id) {
 		console.log('going back');
 		$state.go('client', {'client_id': client_id});
 	}
})
/**
 * Controller for the search view
 */
.controller('SearchCtrl', function($scope) {
	$scope.hello = 'hello search view';
	$scope.client = Clients.client;
})

/**
 * Controller for the User tabs
 */
.controller('UserTabsCtrl', function($scope) {
	// nothing here quite yet.
})

/**
 * Controller for the user history view
 */
.controller('HistoryCtrl', function($scope) {
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









