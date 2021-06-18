Welcome to the frontend of TAVLA, the new booking solution for laundry rooms!
This documentation only adresses the frontend of the cloud application. To see the backend, please visit: https://github.com/se-tavla/backend

You can find the application on https://se-hkr-tavla-fe.herokuapp.com/
There is even a tesing version (Warning: This might be buggy) here: https://se-hkr-tavla-fe-test.herokuapp.com/

# Instructions for editing files (applies to people having access to edit files on our heroku apps)
Clone the repository (in Command Shell)  
Production:  
git clone https://git.heroku.com/se-hkr-tavla-fe.git  
Test:  
git clone https://git.heroku.com/se-hkr-tavla-fe-test.git  
Change into the directory:  
Production:  
cd se-hkr-tavla-fe  
Test:  
cd se-hkr-tavla-fe-test  
Change files as needed.  
If new files are added:  
git add --all  
Commit:  
git commit -am "Name and description of the commit"  
Push:  
git push  
The new version of the app will now be deployed.  
You might need to log into heroku:  
heroku login



# About us:
We are Project Group 3 in the course DA376DVT21 "Development for the Cloud" at Högskolan Kristianstad.  
Our Group consists of:  
Amer Hard: Backend developer  
Abdifatah Abdulkadir Ibrahim: Backend developer  
Jonathan Hoffmann: Frontend developer  
Marija Rankovic: Frontend developer  

This application was initially developed for the course "Web Applications" by Amer Harb, Marija Rankovic and Suzanne Zomer, but was greatly improved during this course.



# Tech:
The website is programmed in 3 major programming languages:  
HTML for the static pages  
JavaScript for all dynamic features  
CSS to make it look nice  

This frontend holds no information, as all instructions are given to the backend server, which also contains the database. This connection is done entirely with the backends HTTP API. This means, that Postman could be a functional substitude.
The little information that is saved is mainly login tokens, so that users can have an active session and don't have to log in for every operation.  
All custom art assests where created by Jonathan Hoffmann with the exception of one gif, that is retrieved from the gif website tenor.
## Color:
The color palet was generated with an online tool called ColorSpace. The generic color gradient from a yellow that was sampled from a physical laundry booking board. https://mycolor.space/?hex=%23B79F35&sub=1  
Background Color: Yellow #b79f35  
Background for text overlays etc.: Lime #749845  
Selected items and buttons: Blue #135F6B  
Borders: Turquoise #2F4858  
Unused colors: pastel dark green #37895D and marine cyan #00756D  

## Javascript files and functions:
### accountManagement.js
This file deals with everything having to do with user accounts, like adding, removing, changing and logging in.
#### login ()
Used in login.html. Takes the two input fields for username and checks with the backend whether user can be logged in. Also sets sessionStorage Elements regarding a user session.
#### buildXHR ()
Builds a XMLHttpRequest according to specs, used in all other following functions that communicate with the backend.
#### redirectProfileNotLoggedIn ()
Redirects to the notallowed.html page if the user is not logged in. Used in profile.html.
#### redirectAdminPanelNotLoggedIn ()
Redirects to the notallowed.html page if the user is not logged in as admin. Used in adminPanel.html.
#### changeUsername ()
Changes the current users username. Uses buildXHR (). Used in profile.html.
#### changePassword ()
Changes the current users password. Uses buildXHR (). Used in profile.html.
#### logout ()
Removes all sessionStorage that is responsible for the user session. Used in all html files.
#### adminLoadAllUsers ()
Used in adminPanel.html while loading the document. Displays all users in a table with options to change details about the users or add a new user. Uses buildXHR ().
#### adminChangePassword ()
Used in adminPanel.html. Changes the password for a user. Uses buildXHR ().
#### adminChangeUsername ()
Used in adminPanel.html. Changes the username for a user. Uses buildXHR ().
#### createUser ()
Used in adminPanel.html. Creates a new user according to inputs. Uses buildXHR ().
#### deleteUser ()
Used in adminPanel.html. Deletes a selected user. Uses buildXHR ().  


###board.js
This file is used for board.html.
#### drawBoard ()
Executed when the document is ready and after changes to bookings. Modifies the board with server information about bookings.
#### getDayOfTheMonth()
returns the current day.
#### getDayOfTheMonth ()
Splits a string for the current date into year, month and day.
#### sleep()
Used by testconnection (). Only usable by async functions. Stops the execution for a given amount of seconds.
#### testConnection ()
Recursive function. Checks if the endpoint /helloworld of the backend is reachable. If connection is impossible, waits 2 seconds and calls itself. Used in between clickBookingDay () and clickBookingDayPartTwo ().
#### clickBookingDay ()
Used when a user clicks on a booking button for changing, deleting or making a booking. Redirects to login.html if user is not logged in, else calls testConnction ().
#### clickBookingDayPartTwo ()
Gets called when testConnection could connect to the backend. Determines which action the user wants to take and calls the appropriate function. Choices are: deleteBooking (), deleteBookingByAdmin (), changeBooking ().
#### deleteBooking ()
Deletes a users own booking.
#### deleteBookingByAdmin ()
Used only by admin. Can delete any one booking.
#### changeBooking ()
Changes a users booking to another day or makes a new booking if the user does not currently have a booking.  


### config.js
contains the URL to the backend server.  


### global.js
changes the appearance of the top navbar depending on the type of user that is logged in or that no user is logged in.  


### jquery.js
Used for different queries.  


### statistics.js
Used in statistics.html. Displays the statistics from the backend to the admin or a statistician user.
#### redirectStatisticsNotLoggedIn ()
Redirects to notallowed.html if not logged in as admin or statistician.Othersie triggers loadStatistics (). Used on document loading.
#### loadStatistics ()
Triggered by redirectStatisticsNotLoggedIn (). Loads data from backend and triggers function presentStatistics ().
#### presentStatistics ()
Triggered by loadStatistics (). Displays the data from the backend in a table.
