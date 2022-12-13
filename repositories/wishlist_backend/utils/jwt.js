import * as dotenv from "dotenv";
dotenv.config();

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL;


const verifyToken = async (req, res, next) => {
    const token = req.headers["access-token"];
    if (typeof token !== "undefined") {
        const response = await fetch(`${AUTH_SERVER_URL}/verify-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access-token": token,
            },
        });
        console.log(token);
        const data = await response.text();
        console.log(data);
        if (response.status === 200) {
            next();
        } else {
            console.log("failed 200");
            res.status(403).send({ message: "Forbidden" });
        }
    } else {
        res.sendStatus(403);
    }
};

export default verifyToken;
