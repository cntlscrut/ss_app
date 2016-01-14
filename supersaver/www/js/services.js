angular.module('supersaver.services', ['ionic.utils'])

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
			withCredentials: false
		}).success(function (data, status, headers, config) {
			console.log(data);
			var userObject = data.user;
			o.setSession(userObject.name, userObject.uid, data.sessid, data.session_name, data.token);
			$state.go('home');
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
		}).then(function (data) {
			o.token = data.data;
			console.log(o.token);
		});
	}

	return o;
})

.factory('Clients', function($http, $q) {
	var o = {
		client: 'client'
	}

	return o;
})

.factory('NearBy', function($http, $q, Clients) {
	var o = {
		content: 'hello'
	}

	return o;
})

.factory('Featured', function($http, $q) {
	var o = {
		content: 'hello'
	}

	return o;
})

.factory('YourDeals', function($http, $q) {
	var o = {
		content: 'hello'
	}

	return o;
})







