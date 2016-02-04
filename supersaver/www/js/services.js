angular.module('supersaver.services', ['ionic.utils'])

/**
 * Main service for handling user authentication
 */
.factory('User', function ($http, $q, $localstorage, $state, SERVER) {
	var o = {
		username: false,
		uid: false,
		session_id: false,
		session_name: false,
		token: false
	}

	// authenticate the user with the backend service.
	o.login = function (username, password) {
		var token_url = SERVER.url+'services/session/token';
		var login_url = SERVER.url+'client/user/login';
		var postData = 'username=' + encodeURIComponent(username) + '&password='+encodeURIComponent(password);

		o.getToken();
		$http({
			method: 'POST',
			url: login_url,
			data: postData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRF-Token': o.token
			},
			withCredentials: true
		}).success(function (data, status, headers, config) {
			console.log(data);
			var userObject = data.user;
			o.setSession(userObject.name, userObject.uid, data.sessid, data.session_name, data.token);
			$state.go('home.nearby');
		}).error(function (data, status, headers, config) {
			if(data) {
                console.log(data);
                var msgText = data.join("\n");
                alert(msgText);
            } else {
                alert('Unable to login');
            }	
		});
	}
	
	// set the user's session and hold in local storage for persistent log in
	o.setSession = function (username, uid, sessid, session_name, token) {
		if (username) o.username = username;
		if (uid) o.uid = uid;
		if (sessid) o.session_id = sessid;
		if (session_name) o.session_name = session_name;
		if (token) o.token = token;

		$localstorage.setObject('user', {
			username: o.username,
			uid: o.uid,
			session_id: sessid,
			session_name: session_name,
			token: token
		});
	}

	// check the current state and see if the user has a current or persistent session
	o.checkSession = function () {
	    var defer = $q.defer();

	    if (o.session_id) {
	      // if this session is already initialized in the service
	      defer.resolve(true);

	    } else {
	      // detect if there's a session in localstorage from previous use.
	      // if it is, pull into our service
	      var user = $localstorage.getObject('user');
	      console.log(user);
	      if (user.username) {
	        // if there's a user, lets grab their favorites from the server
	        o.setSession(user.username, user.uid, user.session_id, user.session_name, user.token);
	        defer.resolve(true);

	      } else {
	        // no user info in localstorage, reject
	        defer.resolve(false);
	      }

	    }

	    return defer.promise;
	}

	//reset the user's current session. 
	o.destroySession = function () {
		o.username = false;
		o.uid = false;
		o.session_id = false;
		o.session_name = false;
		o.token = false;
		$localstorage.setObject('user', {});
	}

	// get the authorization token from the server for handshake
	o.getToken = function () {
		var token_url = SERVER.url+'services/session/token';

		$http({
			url: token_url,
			method: 'GET',
			withCredentials: true
		}).then(function (data) {
			o.token = data.data;
			console.log(o.token);
			return data.data;
		});
	}

	return o;
})

/**
 * Main service for handling client list based on geolocation
 */
.factory('NearBySrv', function ($http, $q, $cordovaGeolocation, $localstorage, $ionicSlideBoxDelegate, SERVER) {
	var o = {}

	o.fetchCurrentLocale = function () {
		console.log('fetching location');
		var coordinates = {
			lat: '',
			long: ''
		}

		var posOptions = {timeout: 10000, enableHighAccuracy: false, maximumAge: 100000};
	  	return $cordovaGeolocation
		    .getCurrentPosition(posOptions)
		    .then(function (position) {
		      coordinates.lat  = position.coords.latitude;
		      coordinates.long = position.coords.longitude;

		      return coordinates;
		    }, function (err) {
		      // error
		      console.log(err);
		      return $q.reject(err);
		    });
	}

	o.fetchNearbyClients = function (location) {
		console.log(location);
		var url_string = '';
		var user = $localstorage.getObject('user');
		console.log('are we in here?');
		if (!location) {
			console.log('no location');
			url_string = SERVER.url+'client/client';
		} else {
			console.log('yes location');
			url_string = SERVER.url+'client/client?lat='+location.lat+'&long='+location.long+'&range=5';
		}
		return $http({
				url: url_string,
				withCredentials: true,
				method: 'GET',
				headers: {
					'X-CSRF-Token': user.token,
					'Accept': 'application/json'
				}
				}).then(function (response) {
						console.log('i be up in here...');
						console.table(response);
						if (typeof response.data === 'object') {
							return response.data;
							$ionicSlideBoxDelegate.update();
						} else {
							console.log("Source data: ");
							console.log(response.data);
							//invalid response
							return $q.reject(response.data);
						}
					},function (response) {
						// an error happened
						return $q.reject(response.data);
					});
	}

	return o;
})

/**
 * Service for building client and related coupon listings.
 */
.factory('Client', function ($http, $q, $localstorage, SERVER) {
	var o = {
		user: $localstorage.getObject('user')
	}

	o.fetchClient = function (clientId) {
		var url_string = SERVER.url+'client/deals?client_id='+clientId;
		return $http({
				url: url_string,
				withCredentials: true,
				method: 'GET',
				headers: {
					'X-CSRF-Token': o.user.token,
					'Accept': 'application/json'
				}
			}).then(function (response) {
				if (typeof response.data === 'object') {
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			}, function (response) {
				// an error happened
				return $q.reject(response.data);
			});
	}

	return o;
})

/**
 * Service for retrieving single coupon info
 */
.factory('Coupon', function ($http, $q, $localstorage, SERVER) {
	var o = {
		user: $localstorage.getObject('user')
	}

	o.fetchCoupon = function (couponId) {
		var url_string = SERVER.url+'client/coupon?coupon_id='+couponId;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': o.user.token,
				'Accept': 'application/json'
			}
		}).then(function (response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				return $q.reject(response.data);
			}
		}, function (response) {
			return $q.reject(response.data);
		});
	}

	return o;
})

/**
 *
 */
.factory('Favorites', function ($http, $q, $localstorage, SERVER) {
	var o = {
		user: $localstorage.getObject('user')
	}

	o.getFavoritesList = function () {
		var url_string = SERVER.url+'client/user_favorites?op=list&uid='+o.user.uid;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': o.user.token,
				'Accept': 'application/json'
			}
		}).then(function (response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				$q.reject(response.data);
			}
		}, function (response) {
			$q.reject(response.data);
		});
	}

	o.addFavorite = function (clientId) {
		var url_string = SERVER.url+'client/user_favorites?op=add&uid='+o.user.uid+'&cid='+clientId;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': o.user.token,
				'Accept': 'application/json'
			}
		}).then(function (response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				$q.reject(response.data);
			}
		}, function (response) {
			$q.reject(response.data);
		});
	}

	o.removeFavorite = function (clientId) {
		var url_string = SERVER.url+'client/user_favorites?op=remove&uid='+o.user.uid+'&cid='+clientId;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': o.user.token,
				'Accept': 'application/json'
			}
		}).then(function (response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				$q.reject(response.data);
			}
		}, function (response) {
			$q.reject(response.data);
		});
	}

	return o;
})






