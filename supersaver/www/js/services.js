angular.module('supersaver.services', ['ionic.utils'])

.factory('User', function($http, $q, $localstorage, SERVER) {
	var o = {
		username: false,
		session_id: false,
		session_name: false,
		token: false
	}

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
			o.setSession(data.user, data.sessid, data.session_name, data.token);
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

	o.setSession = function (user, sessid, session_name, token) {
		if (user.name) o.username = user.name;
		if (sessid) o.session_id = sessid;
		if (session_name) o.session_name = session_name;
		if (token) o.token = token.

		$localstorage.setObject('user', {
			username: o.username,
			session_id: sessid,
			session_name: session_name,
			token: token
		});
	}

	o.checkSession = function () {
	    var defer = $q.defer();

	    if (o.session_id) {
	      // if this session is already initialized in the service
	      defer.resolve(true);

	    } else {
	      // detect if there's a session in localstorage from previous use.
	      // if it is, pull into our service
	      var user = $localstorage.getObject('user');

	      if (user.username) {
	        // if there's a user, lets grab their favorites from the server
	        o.setSession(user.username, user.session_id, user.session_name, user.token);
	        defer.resolve(true);

	      } else {
	        // no user info in localstorage, reject
	        defer.resolve(false);
	      }

	    }

	    return defer.promise;
	}

	o.destroySession = function () {
		o.user = [];
		o.session_id = false;
		o.session_name = false;
		o.token = false;
		$localstorage.setObject('user', {});
	}

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