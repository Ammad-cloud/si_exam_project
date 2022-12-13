import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import get_connection from "./db/connection.js";
import { ObjectId } from "mongodb";
import * as dotenv from "dotenv";
import cors from "cors";
import verifyToken from "./utils/jwt.js";
import cookieParser from "cookie-parser";
import sendMail from "./utils/EmailSender.js";


dotenv.config();

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL;
const dbConnection = await get_connection();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Wishlist API",
            version: "1.0.0",
        },
    },
    apis: ["./*.js"],
};

const openapiSpecification = swaggerJsdoc(options);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.post("/api/register", async (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        picturePath: req.body.picturePath,
    };
    try {
        const createUserRequest = await fetch(`${AUTH_SERVER_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });
        const response = await createUserRequest.json();
        console.log(response);
        res.send(response);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Registration failed" });
    }
});

/**
 * @openapi
 * /login:
 *   post:
 *     description: Login
 *     responses:
 *       200:
 *         description: Returns a JWT token
 */
// login
// integrate with login service
app.post("/api/login", async (req, res) => {
    console.log("flame");
    const user = {
        email: req.body.email,
        password: req.body.password,
    };
    try {
        const loginRequest = await fetch(`${AUTH_SERVER_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });
        const jwt = loginRequest.headers
            .get("set-cookie")
            .split(";")[0]
            .split("=")[1];
        const response = await loginRequest.json();
        res.cookie("jwt", jwt);
        //find user in db if exists and if not create one
        try {
            const collection = dbConnection.collection("users");
            const user = await collection.findOne({
                _id: ObjectId(response._id),
            });
            if (!user) {
                const user = await collection.insertOne({
                    _id: ObjectId(response._id),
                    email: response.email,
                });
                return console.log("User succesfully created: " + user);
            }
        } catch (err) {
            console.log(err);
        }

        //save user to db if not exists
        res.status(200).send({
            userId: response._id,
            email: response.email,
            jwt,
        });
    } catch (err) {
        res.status(400).send({ message: "login failed" });
    }
});

/**
 * @openapi
 * /logout:
 *  get:
 *   description: Logout
 *  responses:
 *  200:
 *  description: Returns status 200 on successful logout
 */
// login
// integrate with login service
app.post("/api/logout", async (req, res) => {
    try {
        const loginRequest = await fetch(`${AUTH_SERVER_URL}/logout`, {
            method: "POST",
        });
        const response = await loginRequest.json();
        res.clearCookie("jwt");
        res.status(200).send({ message: response });
    } catch (err) {
        res.status(500).send({ message: "Logout failed" });
    }
});

/**
 * @openapi
 * /products:
 *  get:
 *    description: Get all products
 *  responses:
 *  200:
 *  description: Returns all products
 */
// list all products
// integrate with GraphQL service
app.get("/api/products", (req, res) => {
    res.send("list all products");
});

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ObjectID of the user to retrieve.
 *         schema:
 *           type: string
 *     description: Retrieve a single product with all details about it
 *     responses:
 *       200:
 *         description: A single product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                  type: integer
 *                  description: The product ID.
 *                  example: 507f1f77bcf86cd799439011
 *                 name:
 *                  type: string
 *                  description: The product name.
 *                  example: 'product 1'
 *                 price:
 *                  type: float
 *                  description: The product price.
 *                  example: 999.99
 */
// list single product
// integrate with GraphQL service
app.get("/api/products/:id", (req, res) => {
    res.send("list single product");
});

/**
 * @openapi
 * /wishlist/{user_id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ObjectID of the user to retrieve its wishlist.
 *         schema:
 *           type: string
 *     description: Retrieve users wishlist
 *     responses:
 *       200:
 *         description: The users wishlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                  type: integer
 *                  description: The product ID.
 *                  example: 507f1f77bcf86cd799439011
 *                 name:
 *                  type: string
 *                  description: The product name.
 *                  example: 'product 1'
 *                 price:
 *                  type: float
 *                  description: The product price.
 *                  example: 999.99
 */
// get user's wishlist
// integrate with mongoDB Atlas service
app.get("/api/wishlist/:user_id", async (req, res) => {
    const wishlistItems = [];
    const collection = dbConnection.collection("users");
    const user = await collection.findOne({
        _id: ObjectId(req.params.user_id),
    });
    const wishlistIds = user.wishlist;
    try {
        for (let i = 0; i < wishlistIds.length; i++) {
            const response = await fetch(
                "https://si-graphql.azurewebsites.net/graphql",
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `query Product($productId: ID!) {
                        product(id: $productId) { 
                            id 
                            product_name 
                            product_sub_title 
                            product_description 
                            main_category 
                            sub_category 
                            price 
                            link
                            product_image {
                                image_url
                            }
                        }
                    }`,
                        variables: {
                            productId: wishlistIds[i],
                        },
                    }),
                }
            );
            const res = await response.json();
            wishlistItems.push(res.data.product);
        }
        console.log(wishlistItems);
    } catch (err) {
        console.log(`The user ${req.params.user_id} has no wishlist`);
    }
    res.send(wishlistItems);
});

/**
 * @openapi
 * /wishlist/{user_id}:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: The product id.
 *                 example: 507f1f77bcf86cd799439011
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ObjectID of the user
 *         schema:
 *           type: string
 *     description: Add item to user's wishlist
 *     responses:
 *       200:
 *         description: The users wishlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                  type: integer
 *                  description: The product ID.
 *                  example: 507f1f77bcf86cd799439011
 *                 name:
 *                  type: string
 *                  description: The product name.
 *                  example: 'product 1'
 */
// add product to wishlist
// integrate with mongoDB Atlas service
app.post("/api/wishlist/:user_id", async (req, res) => {
    const userId = req.params.user_id;
    const itemId = req.body.productId;
    const collection = dbConnection.collection("users");
    const user = await collection.findOne({ _id: ObjectId(userId) });
    let wishlist = [];
    try {
        wishlist = [...user.wishlist];
    } catch (err) {
        console.log(`The user ${userId} has no wishlist`);
    }
    wishlist.push(itemId);
    const updatedUser = await collection.updateOne(
        { _id: ObjectId(userId) },
        { $set: { wishlist } }
    );
    res.send(updatedUser);
});

/**
 * @openapi
 * /wishlist/{user_id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ObjectID of the user
 *         schema:
 *           type: string
 *       - in: path
 *         name: product_id
 *         required: true
 *         description: ObjectID of the user
 *         schema:
 *           type: string
 *     description: Add item to user's wishlist
 *     responses:
 *       200:
 *         description: Successfull deletion of product from wishlist
 */
// remove product from wish list
// integrate with mongoDB Atlas service
app.delete("/api/wishlist/:user_id", verifyToken, async (req, res) => {
    const userId = req.params.user_id;
    const itemId = req.body.productId;
    const collection = dbConnection.collection("users");
    const user = await collection.findOne({ _id: ObjectId(userId) });
    const wishlist = [...user.wishlist];
    const updatedWishlist = wishlist.filter((item) => item !== itemId);
    const updatedUser = await collection.updateOne(
        { _id: ObjectId(userId) },
        { $set: { wishlist: updatedWishlist } }
    );
    res.send(updatedUser);
});

app.get("/api/:user_id/friends/wishlist", async (req, res) => {
    const userId = req.params.user_id;
    // find friends
    const collection = dbConnection.collection("users");
    const user = await collection.findOne({ _id: ObjectId(userId) });
    const friendsIds = [...user.friends];
    const friendsCursor = collection.find({ _id: { $in: friendsIds } });
    const friends = await friendsCursor.toArray();
    // find their wishlist
    const friendsWishlist = friends.map((friend) => {
        return {
            firstName: friend.firstName,
            lastName: friend.lastName,
            emaiL: friend.email,
            wishItemsObjectIds: friend.wishlist,
        };
    });
    for (let i = 0; i < friendsWishlist.length; i++) {
        const products = dbConnection.collection("products");
        const wishItemsObjectIds = friendsWishlist[i].wishItemsObjectIds;
        const wishListObjectIds = wishItemsObjectIds.map((id) => ObjectId(id));
        const productsCursor = products.find({
            _id: { $in: wishListObjectIds },
        });
        const wishlistItems = await productsCursor.toArray();
        friendsWishlist[i].wishItems = wishlistItems;
        delete friendsWishlist[i].wishItemsObjectIds;
    }
    res.send(friendsWishlist);
});

/**
 * @openapi
 * /users/invite:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user to invite.
 *                 example: 'example@example.com'
 *     description: Invite friend to the webapp
 *     responses:
 *       200:
 *         description: The user has been invited
 */
// send invitation to a new user
app.post("/api/invite", (req, res) => {
    // get email from html form
    const invited_email = req.body.invitedEmail;
    const invitee_email = req.body.inviteeEmail;
    sendMail(
        invited_email,
        "Invitation to join the webapp",
        `You have been invited to the wishlist application. 
        Please click on the link to join your friend's wishlist ${FRONTEND_URL}/register}`
    );
    try {
        dbConnection.collection("invites").insertOne({
            invited_email,
            invitee_email,
            acceptedInvite: false,
        });
    } catch (error) {
        console.log(error);
    }
    res.send({ msg: "Invitation sent" });
});

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
