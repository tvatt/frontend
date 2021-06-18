$(document).ready(function () {
  const tavleAuth = sessionStorage.getItem("tavlaAuth");
  const username = sessionStorage.getItem("username");
  const unitNo = sessionStorage.getItem("unitNo");
  const statistician = sessionStorage.getItem("statistician");
  if (!tavleAuth) {
    $("#usernameLabel").hide();
	$("#boardOneMonthPage").show();
    $("#profilePage").hide();
    $("#controlPanelPage").hide();
	$("#statisticsPage").hide();
    $("#loginPage").show();
    $("#logout").hide();
  } else if (username === 'admin') {
    const usernameLabel = $("#usernameLabel");
    usernameLabel.html("<a>ADMIN</a>");
    usernameLabel.show();
	$("#boardOneMonthPage").show();
    $("#profilePage").show();
    $("#controlPanelPage").show();
	$("#statisticsPage").show();
    $("#loginPage").hide();
    $("#logout").show();
  } else if(statistician=="statistician") {
	$("#statisticsPage").show();
	const usernameLabel = $("#usernameLabel");
    usernameLabel.html("<a>STATISTICIAN</a>");
    usernameLabel.show();
	$("#boardOneMonthPage").hide();
	$("#controlPanelPage").hide();
    $("#loginPage").hide();
    $("#logout").show();
  } else {
    const usernameLabel = $("#usernameLabel");
    usernameLabel.html(`<a> ${username} [${unitNo}]</a>`);
    usernameLabel.show();
	$("#boardOneMonthPage").show();
    $("#profilePage").show();
    $("#controlPanelPage").hide();
	$("#statisticsPage").hide();
    $("#loginPage").hide();
    $("#logout").show();
  }
})
