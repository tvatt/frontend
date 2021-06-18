function login() {
	const username = document.getElementById('usernameInput').value;
	const password = document.getElementById('passwordInput').value;
	const loginWarning = document.getElementById("loginWarning");

	loginWarning.classList.add("hidden");

	const basicAuthString = getBasicAuthString(username, password);
	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
		console.log(this.status);
		if (this.status === 200) {
			const response = JSON.parse(this.responseText);
			sessionStorage.setItem("tavlaAuth", basicAuthString);
			sessionStorage.setItem("username", username);
			sessionStorage.setItem("userId", response.id);
			sessionStorage.setItem("unitNo", response.unitNo);
			for(var i = 0; i<response.roles.length;i++)
			{
				if(response.roles[i]=="statistician")
				{
					sessionStorage.setItem("statistician", "statistician");
				}
			}
			
			loginWarning.classList.add("hidden");
			if (username === "admin") {
				window.location.href = "adminPanel.html";
			} else if (sessionStorage.getItem("statistician") == "statistician") {
				window.location.href = "statistics.html";
			} else {
				window.location.href = "board.html";
			}
		} else {
			sessionStorage.removeItem("tavlaAuth");
			sessionStorage.removeItem("username");
			sessionStorage.removeItem("userId");
			sessionStorage.removeItem("unitNo");
			loginWarning.classList.remove("hidden");
		}
	}
	});

	xhr.open("GET", `${config.backendUrl}/api/user/` + username);
	xhr.setRequestHeader("Authorization", basicAuthString);
	console.log("Making a Request to " + config.backendUrl);
	xhr.send();
}

function buildXHR(httpMethod, URLend, contentTypeJson) {
	const basicAuthString = sessionStorage.getItem("tavlaAuth");
	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	var URL = `${config.backendUrl}` + URLend;
	xhr.open(httpMethod, URL);
	xhr.setRequestHeader("Authorization", basicAuthString);
	if(contentTypeJson)
	{
		xhr.setRequestHeader("Content-Type", "application/json");
	}
	console.log("Making a Request to " + config.backendUrl);
	return xhr;
}

function getBasicAuthString(user, password) {
  return "Basic " + btoa(user + ":" + password);
}


function redirectAdminPanelNotLoggedIn () {
	if(sessionStorage.getItem("username")=="admin")
	{
		adminLoadAllUsers();
	}
	else
	{
		window.location.replace("notallowed.html");
	}
}

function redirectProfileNotLoggedIn () {
	if (!sessionStorage.getItem("username"))
	{
		window.location.replace("notallowed.html");
	}
	if(sessionStorage.getItem("username")=="admin" && $(document).find("title").text()=="User Profile")
	{
		document.getElementById("btnChangeUsername").classList.add("hidden");
		document.getElementById("usernameInput").classList.add("hidden");
		document.getElementById("usernameInputLabel").classList.add("hidden");
	}
}

function changeUsername() {
	var input = document.getElementById("usernameInput").value;
	var params = JSON.stringify({ username: input });
	xhr = buildXHR("PUT", "/api/user/" + sessionStorage.getItem("userId"), true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {		
			if(xhr.status ==200)
			{
				logout();
				window.location.href = "login.html";
			}
			else
			{
				document.getElementById("changeUsernameWarning").textContent=xhr.status + "   " + xhr.responseText;
				document.getElementById("changeUsernameWarning").classList.remove("hidden");
			}	
		}
	};
	xhr.send(params);
}

function changePassword() {
	xhr = buildXHR("POST", "/api/user/changepassword", true);
	var input = document.getElementById("passwordInput").value;
	var params = JSON.stringify({ password: input });
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {		
			if(xhr.status ==200)
			{
				logout();
				window.location.href = "login.html";
			}
			else
			{
				document.getElementById("changePasswordWarning").textContent=xhr.status + "   " + xhr.responseText;
				document.getElementById("changePasswordWarning").classList.remove("hidden");
			}
		}
	};
	xhr.send(params);
}

function logout() {
  sessionStorage.removeItem("tavlaAuth");
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("unitNo");
  sessionStorage.removeItem("statistician");
}

function adminLoadAllUsers () {
	xhr = buildXHR("GET", "/api/user/", false);
	xhr.onreadystatechange = function() {
	if (xhr.readyState == XMLHttpRequest.DONE) {			
			if(xhr.status ==200)
			{
				var result = JSON.parse(xhr.responseText);
				
				//displayUsersInTable(result);
				var table = document.getElementById("userTable");
				var i;
				for (i = 0; i<result.length; i++)
				{
					//alert(result[i].id + " " + result[i].username + " " + result[i].unitNo);
					
					var row = table.insertRow(i);
					var cell1 = row.insertCell(0);
					cell1.innerHTML=result[i].id;
					
					var cell2 = row.insertCell(1);
					var TFusername = document.createElement("INPUT");
					TFusername.id = result[i].id + "username";
					TFusername.value=result[i].username;
					cell2.appendChild(TFusername);
					var BTupdateUsername = document.createElement("BUTTON");
					BTupdateUsername.innerHTML="Update";
					cell2.appendChild(BTupdateUsername);
					BTupdateUsername.addEventListener('click', adminChangeUsername(TFusername, result[i].id));
					
					var cell3 = row.insertCell(2);
					cell3.innerHTML=result[i].unitNo;
					
					var cell4 = row.insertCell(3);
					Checkbox = document.createElement("INPUT");
					Checkbox.setAttribute("type", "checkbox");
					if(result[i].roles[0]=="statistician")
					{
						Checkbox.checked=true;
					}
					Checkbox.disabled=true;
					cell4.appendChild(Checkbox);
					
					var cell5 = row.insertCell(4);
					var TFpassword = document.createElement("INPUT");
					TFpassword.id = result[i].id + "password";
					cell5.appendChild(TFpassword);
					var BTupdatePassword = document.createElement("BUTTON");
					BTupdatePassword.innerHTML="Update";
					cell5.appendChild(BTupdatePassword);
					BTupdatePassword.addEventListener('click', adminChangePassword(TFpassword, result[i].id));
					
					var cell6 = row.insertCell(5);
					var BTdeleteUser = document.createElement("BUTTON");
					BTdeleteUser.innerHTML="DELETE";
					cell6.appendChild(BTdeleteUser);
					BTdeleteUser.addEventListener('click', deleteUser(result[i].id));
				}
				
				//new user
				var row = table.insertRow(i);
				var cell1 = row.insertCell(0);
				cell1.innerHTML="NEW";
					
				var cell2 = row.insertCell(1);
				var TFusername = document.createElement("INPUT");
				TFusername.id = "NEWusername";
				cell2.appendChild(TFusername);
					
				var cell3 = row.insertCell(2);
				TFnewUnitNo = document.createElement("INPUT");
				TFnewUnitNo.id = "NEWunitNo";
				cell3.appendChild(TFnewUnitNo);
				
				var cell4 = row.insertCell(3);
				Checkbox = document.createElement("INPUT");
				Checkbox.setAttribute("type", "checkbox");
				cell4.appendChild(Checkbox);
					
				var cell5 = row.insertCell(4);
				var TFpassword = document.createElement("INPUT");
				TFpassword.id = "NEWpassword";
				cell5.appendChild(TFpassword);
				BTcreate = document.createElement("BUTTON");
				BTcreate.innerHTML="Create";
				cell5.appendChild(BTcreate);
				BTcreate.addEventListener('click', createUser(TFpassword, TFusername, TFnewUnitNo, Checkbox));
			}
			else
			{
				alert(xhr.status + "   " + xhr.responseText);
			}
		}
	};
	xhr.send();
}

function adminChangePassword (passwordInput, id) {
	return function () {
		xhr = buildXHR("POST", "/api/user/resetpassword/" + id, true);
		var input = passwordInput.value;
		var params = JSON.stringify({ password: input });

		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {			
				if(xhr.status ==200)
				{
					location.reload();
				}
				else
				{
					alert(xhr.status + "   " + xhr.responseText);
				}
			}
		};
		var answer = window.confirm("Are you sure you want to change the password for the user with the id " + id);
		if(answer)
		{
			xhr.send(params);
		}
	}
}

function adminChangeUsername (usernameInput, id) {
	return function () {
		xhr = buildXHR("PUT", "/api/user/" + id, true);
		var input = usernameInput.value;
		var params = JSON.stringify({ username: input });

		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {			
				if(xhr.status ==200)
				{
					location.reload();
				}
				else
				{
					alert(xhr.status + "   " + xhr.responseText);
				}
			}
		};
		var answer = window.confirm("Are you sure you want to change the name for the user with the id " + id);
		if(answer)
		{
			xhr.send(params);
		}
	}
}

function createUser (passwordInput, usernameInput, unitNoInput, Checkbox) {
	return function () {
		xhr = buildXHR("POST", "/api/user/", true);
		var passwordin = passwordInput.value;
		var unitin = unitNoInput.value;
		var usernamein = usernameInput.value;
		
		var params;
		if(Checkbox.checked ==true)
		{
			var rolesin = ["statistician"];
			params = JSON.stringify({ unitNo: unitin, username: usernamein, password: passwordin, roles: rolesin});
		}
		else
		{
			params = JSON.stringify({ unitNo: unitin, username: usernamein, password: passwordin });
		}
		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {			
				if(xhr.status ==200)
				{
					location.reload();
				}
				else
				{
					alert(xhr.status + "   " + xhr.responseText);
				}
			}
		};
		var answer = window.confirm("Are you sure you want to create the user " + usernameInput.value + "?");
		if(answer)
		{
			xhr.send(params);
		}
	}
}

function deleteUser (id) {
	return function () {
		xhr = buildXHR("DELETE", "/api/user/" + id, false);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {			
				if(xhr.status ==200)
				{
					location.reload();
				}
				else
				{
					alert(xhr.status + "   " + xhr.responseText);
				}
			}
		};
		var answer = window.confirm("Are you sure you want to DELETE the user " + id + "?");
		if(answer)
		{
			xhr.send();
		}
	}
}