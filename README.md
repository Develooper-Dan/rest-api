# rest-api
This program simulates a fully server-side REST API which lets a user perform basic CRUD-operations on a kind of "school"-database which contains several courses on different topics. The courses are associated to certain users and some operations need authentification before they can be executed. Data is send and received in purely JSON-format. A basic database is included in the project files.

### Getting started
In the project directory, first run:

#### `npm install`

This will download all the projects dependencies listed in the package.json files and install them locally. If you're unfamiliar with npm, you might want to visit
https://docs.npmjs.com/about-npm/
for further reference.

#### `npm start`

Runs the app on the server http://localhost:5000 via `nodemon ./app.js`.

#### Sending requests

Since this project is really just a server-side API and not displayed in the browser it is recommended to use a software like https://www.postman.com/ if you want to test different requests and routes.

#### Viewing data

If you want to have a look at the data stored in fsjstd-restapi.db, first install a DB browser like https://sqlitebrowser.org/
and then use it to open the file.

### Main mechanics and functionality

#### Dependencies

The database is using the SQlite dialect and Sequelize as the ORM for communication. The Express framework is used for handling the requests to the different routes.

#### Models

The database consists of 2 models, Course and User, which are associated with each other. One user can own several courses and each course has one user who is referenced by his unique ID. The validation is mostly modelbased, restricting the user i. e. from leaving out crucial information or entering an invalid email address. You can use the files in the models folder as a reference to which attributes are available on the respective model.

#### Routes
App.js is the entry point to the app. It includes the routes for handling 404 and other types of errors and sets up the server. The main routes are handled in ./routes/index.js. As mentioned before, data is transmitted via JSON. Following routes and operations are available:
- **/api/users GET**: Returns the data of the authenticated user if the credentials on the request are correct
- **/api/users POST**: Creates a new user entry in the db according to the information send in the request body. All attributes are mandatory. For security reasons, the password gets hashed via bcrypt.
- **/api/courses GET**: Returns a list of all courses including the corresponding user data.
- **/api/courses/:id GET**: Returns the course (and corresponding user) with the matching ID.
- **/api/courses POST**: If the user is authenticated, a new course entry is created in the db according to the information send in the request body. The course also gets associated with the user. Title and description attributes are mandatory.
- **/api/courses/:id PUT**: Allows an authenticated user to update data of an existing course.
- **/api/courses/:id DELETE**: Allows an authenticated user to delete an existing course.
