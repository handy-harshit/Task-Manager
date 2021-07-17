# task-manager
Node.js task manager API with JWT authorization.

## Config
The application expects the following environment variables:

```
PORT
MONGODB_URL
JWT_SECRET
FROM_EMAIL
SENDGRID_API_KEY
```

The develompent, and test environment variables should be placed into the following files:
 * Development - `/config/dev.env`
 * Test - `/config/test.env`

## Endpoints
All endpoints that accepts `POST` and `PATCH` request methods, expect `application/json` content type.

\* - Requires a valid JWT token as an HTTP request header (`Authorization: Bearer <jwt_token>`), which is sent from the authorization endpoints in the response body.

* Authorization
  * Create user                     - `POST /users`
  * Login user                      - `POST /users/login`
* User actions *
  * Logout user                     - `POST /users/logout`
  * Logout all users                - `POST /users/logout-all`
  * Read profile                    - `GET /users/me`
  * Update user                     - `PATCH /users/me`
  * Delete user                     - `DELETE /users/me`
  * Upload avatar                   - `POST /users/me/avatar`
  * Delete avatar                   - `DELETE /users/me/avatar`
  * Get user avatar                 - `GET /users/:id/avatar`
* Task management *
  * Create task                     - `POST /tasks`
  * Read tasks                      - `GET /tasks`
    * completed       - `Boolean`
    * sortBy          - `<field_name>:asc|desc`
    * limit           - `Number`
    * skip            - `Number`
  * Read task                       - `GET /tasks/:id`
  * Update task                     - `PATCH /tasks/:id`
  * Delete task                     - `DELETE /tasks/:id`

### Example route (Create user)
----
  Creates a new user in the database.
* **URL**

  `/users`

* **Method:**

  `POST`

* **Data Params**

   **Required:**
 
   * `name=[string]`
   * `email=[string]` - Must be unique in the users collection
   * `password=[string]` - Minimum length is 7, and cannot contain the word: *password*

   **Optional:**
 
   `age=[number]` - Defaults to 0

* **Success Response:**

  * **Code:** 201 Created <br />
  * **Content:** <br />
    ```
    {
      "user": {
          "age": 22,
          "_id": "5c88d692da13be0017bda5e1",
          "name": "Harshit",
          "email": "harshit@example.com",
          "createdAt": "2021-05-13T10:08:18.045Z",
          "updatedAt": "2021-05-13T10:08:18.226Z",
          "__v": 1
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Yzg4ZDY5MmRhMTNiZTAwMTdiZGE1ZTEiLCJpYXQiOjE1NTI0NzE2OTh9.mLgW3hHi5vOgexwOYYkPZSNP0oaFGTXLZJSFpZlStzA"
    }
    ```
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
