Project Backend Description:
Technologies and Libraries Used:
		Nodejs: JavaScript runtime built on Chrome's V8 JavaScript engin
            Package Manager: Node.js usually comes with npm (Node Package Manager). 

Express.js: A web application framework for Node.js, used for building the backend of the application.
MongoDB: The database used for storing data.
Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.
Body-parser: Middleware to parse incoming request bodies.
Mime: A library to determine the MIME type of a file.
Node-cron: A job scheduler for running periodic tasks.
Dotenv: A zero-dependency module that loads environment variables from a .env file.
Path: A core Node.js module for working with file and directory paths.
Cors: Middleware for enabling Cross-Origin Resource Sharing.
Morgan: A logging middleware for HTTP requests.
Telegraf: A Telegram Bot framework for Node.js.
Https: A core Node.js module for creating HTTPS servers.
Fs: A core Node.js module for interacting with the file system.
Backend Structure:
Database Connection:
Connects to MongoDB using Mongoose via ./config/db.js.
Telegram Bot Configuration:
Uses Telegraf to set up a Telegram bot with various commands (/orderList, /order, /help, /ts, /tc, /info, /cron, /products).
Express App Setup:
Initializes the Express application (const app = express();).
Utilizes CORS middleware to handle Cross-Origin Resource Sharing.
RESTful API Routes:
Defines API routes and endpoints through ./routes .
Middleware Functions:
Utilizes middleware functions for various purposes, such as handling daily sales, user authentication  and role based access, and providing information.
JWT Authentication Middleware: auth.js
This middleware function is designed to be used in an Express.js application for handling JSON Web Token (JWT) authentication. It verifies the presence of a valid JWT in the request header and extracts information about the user's role (req.role) and user ID (req.uid). If the token is valid, the middleware allows the request to proceed to the next middleware or route handler. If the token is missing or invalid, it responds with an "Unauthorized" error.
                    Role-Based Access Control Middleware: authAdmin.js
The middleware expects the JWT to be included in the request header with the key "x-auth-token" (const token = req.header('x-auth-token');).
It verifies the JWT using the secret key stored in the configuration (const decoded = jwt.verify(token, config.get('jwtSecret'));).
If the verification is successful, the decoded information (user ID) is attached to the request object (req.uid).
It checks if the user with the given ID exists in the database. If not, it responds with a "User not found!" error.
It checks if the user's role has the necessary access rights based on the accessRoles parameter.
If the user has the required role, the middleware allows the request to proceed to the next middleware or route handler.
If the user does not have the required role or if the token is expired, it responds with an "Unauthorized" error.
The middleware is intended to be used to protect routes that require specific roles. When included in the route definition, it ensures that only users with the specified roles can access the protected resource.

Cron Jobs:
Sets up scheduled tasks using node-cron for jobs like fetching data from Delhivery and running specific tasks daily.
File Handling:
Serves static files from the uploads directory.
Implements a download route (/download) for downloading a CSV file.
HTTPS Configuration:
Configures an HTTPS server using the https module with SSL certificates.
Listens on port 8443 for secure HTTPS connections.
Server Startup:
Initiates the Express server to listen on the specified port (either from environment variable or default 3000).
Initiates the HTTPS server to listen on port 8443.
Error Handling:
Provides a default error response for routes that are not found.
Graceful Shutdown:
Enables graceful stop of the Telegram bot on SIGINT and SIGTERM signals.
Telegram Bot Commands:
/orderList: Retrieves daily sales information.
/order: Handles order-related commands (delete, show).
/help: Displays help information.
/ts: Retrieves total count information.
/tc: Retrieves total sales information.
/info: Retrieves both daily sales and total sales information.
/cron: Displays information about cron jobs.
/products: Retrieves information about daily ordered products.
CSV Data Import for Products
This module is designed to import product data from a CSV file into a MongoDB database. It utilizes the csv-parse library to parse the CSV file and the fs (file system) module to read the file. The data is then used to create or update product records in the Products collection of the database.
The CSV file is assumed to have a specific structure with columns representing different product attributes (e.g., name, quantity, SKU, etc.).

CSV Structure : 
Entries,Name,Quantity,SKU,HSN,BuyingPrice,SellingPrice,Category,Image,ReOrder Status
1,Cherry Decorative Showpiece,6,DO-04-001,3926,6099,6099,Decorative Objects,https://www.whs.com/media/catalog/product/c/h/cherry_decorative_showpiece_1_.jpg,N/A


The countDocuments method is used to check if a product with the same SKU already exists in the database.
If the product exists, its quantity is updated. If not, a new product record is created.


Prerequisites: 
 Environment variables: 
MULTER_CSV_DESTINATION='./uploads/csv/'
MULTER_IMAGES_DESTINATION='./uploads/images/'
TOKEN= //telegram bot token.
SERVER_URL= //backend server url
GROUP_ID=-  // telegram group Id
profile_directory='uploads/images/'
Api token for the delhivery API 
{ "mongoURI": "mongodb://localhost:27017/DbName",
 "jwtSecret": "SEcRet",
 "image_directory": "/var/Crm/uploads/",
 "image_web_path": "<serverurl>/uploads/",
 "profile_directory": "/var/Crm/uploads/images/" }

Backend has Models defined for all data ie Sales Orders, Customer , Products in inventory , Logs , Expenses. 
API’s for CRUD and other operations on the Sale orders, inventory Products, Customer, etc 
The project utilizes the multer middleware in the backend. Multer is a middleware for handling multipart/form-data, primarily used for uploading files. In the context of project, it is used for handling CSV file uploads and image uploads.
