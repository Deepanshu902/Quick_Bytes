# Backend Project - QuickBites

## Description

This backend project serves as the API for QuickBites, a service that facilitates the delivery of authentic, home-cooked meals from local providers. It includes user authentication, order management, image support for home-style cuisine, payment processing, and core data operations.

## Technologies Used

* **Node.js:** Runtime environment.
* **Express.js:** Web application framework.
* **MongoDB:** Database.
* **Mongoose:** MongoDB object modeling.
* **JSON Web Tokens (JWT):** Authentication.
* **Bcrypt:** Password hashing.
* **Cloudinary:** Image storage and manipulation.
* **Google Cloud Vision API:** Image moderation and analysis.
* **Multer:** File uploads.
* **Axios:** HTTP client.
* **Cookie Parser:** Cookie handling.
* **CORS:** Cross-origin resource sharing.
* **Dotenv:** Environment variable management.
* **Crypto:** Encryption and decryption.
* **Node Geocoder:** Geocoding services.
* **Razorpay:** Payment gateway integration.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd backend
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Create a `.env` file:**

    * Create a `.env` file in the root directory of the project.
    * Add the following environment variables:

        ```
        PORT=<your_port>
        MONGODB_URI=<your_mongodb_connection_string>
        ACCESS_TOKEN_SECRET=<your_access_token_secret>
        REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
        CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
        CLOUDINARY_API_KEY=<your_cloudinary_api_key>
        CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
        GOOGLE_APPLICATION_CREDENTIALS_PATH=<path_to_your_google_credentials_json_file>
        ENCRYPTION_KEY=<your_32_byte_encryption_key>
        ENCRYPTION_IV=<your_16_byte_encryption_iv>
        RAZORPAY_KEY_ID=<your_razorpay_key_id>
        RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
        ```

        * Replace the placeholders with your actual values.
        * Generate random secure strings for the `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ENCRYPTION_KEY`, and `ENCRYPTION_IV` variables.
        * The Google Application Credentials path should point to your downloaded google cloud vision api credentials json file.

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    * This will start the server using `nodemon` for automatic restarts on file changes.

## Scripts

* `npm run dev`: Starts the development server with `nodemon`.
* `npm test`: Runs the tests (currently not implemented).

## Dependencies

* `@google-cloud/vision`: Google Cloud Vision API client.
* `axios`: HTTP client.
* `bcrypt`: Password hashing.
* `cloudinary`: Cloudinary SDK for image uploads.
* `cookie-parser`: Cookie parsing.
* `cors`: Cross-origin resource sharing.
* `crypto`: Cryptographic functions.
* `dotenv`: Environment variable loading.
* `express`: Web application framework.
* `jsonwebtoken`: JSON Web Token generation and verification.
* `mongoose`: MongoDB object modeling.
* `multer`: File uploads.
* `node-geocoder`: Geocoding.
* `razorpay`: Razorpay payment gateway integration.

## Development Dependencies

* `nodemon`: Automatic server restarts during development.

## Important Notes

* Ensure that your `.env` file is properly configured with secure values.
* Securely manage your API keys and secrets.
* Thoroughly test your API endpoints.