function redirectStatisticsNotLoggedIn () {
	var allowed =false;
	if(sessionStorage.getItem("statistician")=="statistician")
	{
		allowed=true;
	}
	if(sessionStorage.getItem("username")=="admin")
	{
		allowed=true;
	}
	if(allowed==false)
	{
		window.location.replace("notallowed.html");
	}
	else
	{
		loadStatistics();
	}
}

function loadStatistics () {
	const basicAuthString = sessionStorage.getItem("tavlaAuth");
	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	var URL = `${config.backendUrl}` + "/api/statistics";
	xhr.open("GET", URL);
	xhr.setRequestHeader("Authorization", basicAuthString);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {	
			if(xhr.status ==200)
			{
				var result = JSON.parse(xhr.responseText);
				presentStatistics(result);
			}
			else
			{
				alert(xhr.status + "\n" + xhr.responseText);
			}
		}
	};
	console.log("Making a Request to " + config.backendUrl);
	xhr.send();
}

function presentStatistics (statistics) {
	var tableHead = document.getElementById("statisticsTableHead");
	var tableBody = document.getElementById("statisticsTableBody");
	var headRow = tableHead.insertRow(0);
	var bodyRow = tableBody.insertRow(0);
	
	for(var i=0;i<statistics.length;i++)
	{
		var headCell = document.createElement("TH");
		headRow.appendChild(headCell);
		var bodyCell = bodyRow.insertCell(i);
		headCell.innerHTML = statistics[i].action;
		bodyCell.innerHTML = statistics[i].count;
	}
}