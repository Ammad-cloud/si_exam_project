# Authentication methods

Using their email and password, users may register, log in, and log out.

REST API is used to provide the authentication.
Visit https://si-auth-server-5rds.onrender.com/swagger to view the Swagger documentation.

# Sign up
The user will sign up using the following endpoint:
- Sign up here:
https://si-auth-server-5rds.onrender.com/api/auth/register

The following properties will be included in the json that contains the user information:
```json
{
  "email": "example@example.com",
  "password": "123456789",
  "firstName": "Steve",
  "lastName": "Jobs"
}
```

To maintain security in the event of a breach, the user information will be kept in a database and the password will be salted and hashed.

# Login
The user will log in using the endpoint to sign in:

https://si-auth-server-5rds.onrender.com/api/auth/login


The following properties will be included in the json that contains the user information:
```json
{
  "email": "example@example.com",
  "password": "123456789",
}
```

When valid credentials are provided the auth server returns status 200 and responds with a jwt in the response body. The response body will look like:
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzg1ZDVlM2IxMTYxZDM0Njk5ZDE2MjAiLCJpYXQiOjE2NzA0MDU3NDh9.bS-pzysG8keiJADWvowJ-wWGxe-pUxLhRp6g9ykbGF8"
}
```

The jwt can now be added in a HTTP header with bearer authentication. For more info see Mozillas documentation [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)


# Verify token

To verify the provided jwt from the /login endpoint the following endpoint is used:

https://si-auth-server-5rds.onrender.com/api/auth/verify-token

In the POST request, a HTTP header called 'access-token' must be provided with the value of the jwt returned in the /login response.

```
POST /api/auth/verify-token HTTP/1.1
access-token: {jwt}
Host: https://si-auth-server-5rds.onrender.com
```

If the jwt is valid the server return with a response 200. If the token is invalid, status code 400 is the respond.

