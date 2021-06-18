$(document).ready(() => {
  drawBoard();
});

var online = "online";
var notifyBookingFlag = false;

function drawBoard() {
  //fill current date
  if (sessionStorage.getItem("statistician") == "statistician") {
    window.location.replace("notallowed.html");
  }

  const todayDate = new Date();
  const dayNumber = todayDate.getDate();
  const dayStr = dayNumber < 10 ? '0' + dayNumber : dayNumber.toString();
  const monthNumber = todayDate.getMonth() + 1;
  const monthStr = monthNumber < 10 ? '0' + monthNumber : monthNumber.toString();
  document.getElementById('todayDate').innerHTML = `Date: ${todayDate.getFullYear()}-${monthStr}-${dayStr}`
  document.getElementById('todayDate').style.color = "black";


  const xhr = new XMLHttpRequest();
  xhr.withCredentials = false;

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        console.debug('response GET board:' + this.responseText);
        const bookings = JSON.parse(this.responseText);
        if (bookings) {
          sessionStorage.setItem('bookings', JSON.stringify(bookings));
        } else {
          sessionStorage.removeItem('bookings');
        }
        const monthTotalDays = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
        for (let d = 1; d <= 31; d++) {
          for (let s = 1; s <= 3; s++) {
            const bookingBtn = document.getElementById(`b${d}-${s}`);

            // delete old data
            bookingBtn.classList.remove('booked');
            bookingBtn.classList.remove('bookedToMe');
            bookingBtn.innerHTML = '';
            delete bookingBtn.bookingId;
            delete bookingBtn.unitNo;
            delete bookingBtn.username;

            if (d > monthTotalDays)
              bookingBtn.classList.add('hidden');
            else
              bookingBtn.classList.remove('hidden');

            const isNextMonthDay = d < getDayOfTheMonth(todayDate)
            if (isNextMonthDay)
              bookingBtn.classList.add('nextMonth');

            const booking = bookings.find(b =>
              b.slot === s &&
              isEqualDate(
                b.day,
                todayDate.getFullYear(),
                isNextMonthDay ? todayDate.getMonth() + 2 : todayDate.getMonth() + 1,
                d,
              )
            );

            if (booking) {
              bookingBtn.classList.add('booked');
              bookingBtn.innerHTML = booking.unitNo;
              bookingBtn.bookingId = booking.id;
              bookingBtn.unitNo = booking.unitNo;
              bookingBtn.username = booking.username;
              if (booking.unitNo === sessionStorage.getItem('unitNo')) {
                bookingBtn.classList.add('bookedToMe');
              }
            }
          }
        }
      }
    }
  });
  console.log("Making a Request to " + config.backendUrl);
  xhr.open('GET', `${config.backendUrl}/api/board`);

  xhr.send();

  //caching image asset for offline button
  document.getElementById("assetLoader").classList.add("offlineBooking");
  document.getElementById("assetLoader").classList.add("hidden");
}

const HOST = config.backendUrl.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);
ws.onopen = () => {
  ws.send('new client');
};
ws.onmessage = (event) => {
  console.debug('got message from server');
  const dataObj = JSON.parse(event.data);
  if (dataObj.type === 'booking changed') {
    drawBoard();
  }
};

function getDayOfTheMonth(day) {
  return new Date(day).getDate()
}

function isEqualDate(stringDate, year, month, day) {
  return parseInt(stringDate.substr(0, 4)) === year
    && parseInt(stringDate.substr(5, 2)) === month
    && parseInt(stringDate.substr(8, 2)) === day;
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testConnection(btn, tavlaAuth) {
  const xhr = new XMLHttpRequest();
  var URL = `${config.backendUrl}` + "/helloworld";
  xhr.open("GET", URL);
  xhr.onload = function () {
    if (online == "offline") {
      online = "online";
      document.getElementById('todayDate').innerHTML = "Back online";
      document.getElementById('todayDate').style.color = "green";
      btn.classList.remove('offlineBooking');
    }
    clickBookingDayPartTwo(btn, tavlaAuth);
  }
  xhr.onerror = async function () {
    online = "offline";
    if (notifyBookingFlag == false) {
      btn.classList.add('offlineBooking');
      notifyBookingFlag = true;
      alert("It looks like you are offline. We will save the booking locally and try to send it as soon as you are back online. Please don't close this tab until we confirmed the booking.");
    }
    await sleep(2000);
    testConnection(btn, tavlaAuth);
  }
  console.log("Making a Request to " + config.backendUrl);
  xhr.send();
}

async function clickBookingDay(btn) {
  const tavlaAuth = sessionStorage.getItem('tavlaAuth');
  if (!tavlaAuth) {
    window.location.href = "login.html";
    return;
  }
  if (online == "offline") {
    alert("You can not make multiple offline bookings. If you are not happy with the previous booking, please close this tab.");
  } else {
    testConnection(btn, tavlaAuth);
  }
}

function clickBookingDayPartTwo(btn, tavlaAuth) {

  const bookings = JSON.parse(sessionStorage.getItem('bookings'));
  const unitNo = sessionStorage.getItem('unitNo');

  const d = parseInt(btn.id.substr(1).split('-')[0]);
  const s = parseInt(btn.id.substr(1).split('-')[1]);
  const todayDate = new Date();

  const y = todayDate.getFullYear();
  const yyyy = y.toString();
  const m = d < todayDate.getDate() ? todayDate.getMonth() + 2 : todayDate.getMonth() + 1;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const dd = d < 10 ? `0${d}` : `${d}`;
  const bookingDay = `${yyyy}-${mm}-${dd}`;

  const findBooking = bookings.find(b => b.slot === s && isEqualDate(b.day, y, m, d));

  const isAdmin = sessionStorage.getItem('username') === 'admin';
  if (findBooking) {
    if (findBooking.unitNo === unitNo) {
      deleteBooking(tavlaAuth);
    } else if (isAdmin) {
      if (confirm("Are you sure to delete this booking?")) {
        deleteBookingByAdmin(tavlaAuth, btn.username);
      }
    }
  } else if (!isAdmin) {
    changeBooking(tavlaAuth, bookingDay, s);
  }
}

function deleteBooking(auth) {
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        console.log('booking deleted');
        drawBoard();
      }
    }
  });
  xhr.open('DELETE', `${config.backendUrl}/api/board`);
  xhr.setRequestHeader('Authorization', auth);
  console.log("Making a Request to " + config.backendUrl);
  xhr.send();
}

function deleteBookingByAdmin(auth, username) {
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        console.log('booking deleted');
        drawBoard();
      }
    }
  });
  xhr.open('DELETE', `${config.backendUrl}/api/board/${username}`);
  xhr.setRequestHeader('Authorization', auth);
  console.log("Making a Request to " + config.backendUrl);
  xhr.send();
}

function changeBooking(auth, day, slot) {
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        console.log('booking added');
        drawBoard();
      }
    }
  });
  xhr.open('POST', `${config.backendUrl}/api/board`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', auth);
  const data = JSON.stringify({day, slot});
  console.log("Making a Request to " + config.backendUrl);
  xhr.send(data);
}
