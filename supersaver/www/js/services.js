angular.module('supersaver.services', ['ionic.utils'])

/**
 * Main service for handling user authentication
 */
.factory('User', function ($http, $q, $localstorage, $window, $ionicHistory, $state, SERVER) {
	var o = {
		username: false,
		uid: false,
		session_id: false,
		session_name: false,
		token: false
	}

	// register a new user with the server
	o.register = function (username, email, password, password2, token) {
		var url_string = SERVER.url+'client/user/register';

		var postData = "name="+encodeURIComponent(username)+"&mail="+encodeURIComponent(email)+"&pass="+encodeURIComponent(password)+"&pass2="+encodeURIComponent(password2);

		return $http({
			url: url_string,
			method: 'POST',
			withCredentials: true,
			data: postData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRF-Token': token
			}
		}).then(function (response) {
			console.log('Creating user...');
			console.table(response);
			return response;
		}, function (response) {
			console.log('Could not create user account.');
			console.table(response);
			return $q.reject(response);
		});
	}

	// get the authorization token from the server for handshake
	o.getToken = function () {
		var token_url = SERVER.url+'services/session/token';

		return $http({
			url: token_url,
			method: 'GET',
			withCredentials: true
		}).then(function (response) {
			if (typeof response.data === 'string') {
				o.token = response.data;
				console.log(response.data);
				return response.data;
			} else {
				console.log('Error with Token 1');
				return $q.reject(response.data);
			}
		}, function (response) {
			console.log('Error with Token 2');
			return $q.reject(response.data);
		});
	}

	// authenticate the user with the backend service.
	o.login = function (username, password, token) {
		//var token_url = SERVER.url+'services/session/token';
		var login_url = SERVER.url+'client/user/login';
		var postData = 'username=' + encodeURIComponent(username) + '&password='+encodeURIComponent(password);

		//o.getToken();
		return $http({
			url: login_url,
			method: 'POST',
			data: postData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRF-Token': token
			}
		}).then(function (response) {
			if (typeof response.data === 'object') {
				console.table(response.data);
				return response.data;
			} else {
				console.log('Error getting session data 1');
				return $q.reject(response.data);
			}
		}, function (response) {
			console.log(response.data);
			return $q.reject(response.data);
		});
	}
	
	// set the user's session and hold in local storage for persistent log in
	//o.setSession = function (username, uid, sessid, session_name, token) {
	o.setSession = function (sessionData) {
		//console.table(sessionData);

		//map to the service object
		if (typeof sessionData.user === 'object') {
			if (sessionData.user.uid) o.uid = sessionData.user.uid;
			if (sessionData.user.name) o.username = sessionData.user.name;
		} else {
			if (sessionData.uid) o.uid = sessionData.uid;
			if (sessionData.username) o.username = sessionData.username;
		}
		if (sessionData.sessid) o.session_id = sessionData.sessid;
		if (sessionData.session_name) o.session_name = sessionData.session_name;
		if (sessionData.token) o.token = sessionData.token;

		// set the session data to the localstorage for persistent login
		$localstorage.setObject('user', {
			username: o.username,
			uid: o.uid,
			session_id: o.session_id,
			session_name: o.session_name,
			token: o.token
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
	      console.log('Checking session object...');
	      console.table(user);
	      if (user.username) {
	        // if there's a user, lets grab their favorites from the server
	        o.setSession(user);
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
		var url_string = SERVER.url+"client/user/logout";
		var user = $localstorage.getObject('user');

		return $http({
			url: url_string,
			method: 'POST',
			withCredentials: true,
			headers: {
				'X-CSRF-Token': user.token,
				'Accept': 'application/json'
			}
		}).then(function (response) {
			console.table(response);
			if (response.data) {
				// destroy the local data
				o.username = false;
				o.uid = false;
				o.session_id = false;
				o.session_name = false;
				o.token = false;
				$localstorage.setObject('user', {});
				$window.localStorage.clear();
			    $ionicHistory.clearCache();
			    $ionicHistory.clearHistory();
				return response.data;
			} else {
				return $q.reject(response.data);
			}
		}, function (response) {
			console.table(response);
			return $q.reject(response.data);
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
		console.table(user);
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
						//console.table(response);
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
		var user = $localstorage.getObject('user');
		var url_string = SERVER.url+'client/deals?client_id='+clientId;
		return $http({
				url: url_string,
				withCredentials: true,
				method: 'GET',
				headers: {
					'X-CSRF-Token': user.token,
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
		var user = $localstorage.getObject('user');
		var url_string = SERVER.url+'client/coupon?coupon_id='+couponId;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': user.token,
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
		var user = $localstorage.getObject('user');
		var url_string = SERVER.url+'client/user_favorites?op=list&uid='+user.uid;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': user.token,
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
		var user = $localstorage.getObject('user');
		var url_string = SERVER.url+'client/user_favorites?op=add&uid='+user.uid+'&cid='+clientId;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': user.token,
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
		var user = $localstorage.getObject('user');
		var url_string = SERVER.url+'client/user_favorites?op=remove&uid='+user.uid+'&cid='+clientId;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': user.token,
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

/**
 * Base service for managing user deal usage history
 */
.factory('UserHistory', function ($http, $q, $localstorage, SERVER) {
	var o = {
		user: $localstorage.getObject('user')
	}

	o.useCoupon = function (couponId) {
		var user = $localstorage.getObject('user');
		var url_string = SERVER.url+'client/user_history?op=use&uid='+user.uid+'&cid='+couponId;
		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': user.token,
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

	o.getHistory = function (clientId) {

		var user = $localstorage.getObject('user');

		if (!clientId) {
			url_string = SERVER.url+'client/user_history?op=list&uid='+user.uid;
		} else {
			url_string = SERVER.url+'client/user_history?op=detail&uid='+user.uid+'&cid='+clientId;
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

/**
 * Base service for fetching search results for deals
 */
.factory('Search', function ($http, $q, $localstorage, SERVER) {
	var o = {}

	o.performSearch = function (searchKeywords) {
		var user = $localstorage.getObject('user');
		var url_string = SERVER.url+'client/search?keywords='+encodeURIComponent(searchKeywords);

		return $http({
			url: url_string,
			withCredentials: true,
			method: 'GET',
			headers: {
				'X-CSRF-Token': user.token,
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






