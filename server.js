const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const APP_ID = "YOUR_APP_ID";
const APP_SECRET = "YOUR_APP_SECRET";
const REDIRECT_URI = "http://localhost:3000/auth";

let userAccessToken = "";

// Facebook login redirect
app.get("/auth", async (req, res) => {

    const code = req.query.code;

    const tokenRes = await axios.get(
        `https://graph.facebook.com/v19.0/oauth/access_token`,
        {
            params: {
                client_id: APP_ID,
                client_secret: APP_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code
            }
        });

    userAccessToken = tokenRes.data.access_token;
    console.log("token: ", tokenRes.data.access_token)

    res.redirect("/");

});

// Get pages
app.get("/pages", async (req, res) => {

    const pages = await axios.get(
        `https://graph.facebook.com/me/accounts`,
        {
            params: { access_token: userAccessToken }
        });

    res.json(pages.data);

});

// Post to page
app.post("/post", async (req, res) => {

    const { message, page_id, page_token } = req.body;

    const post = await axios.post(
        `https://graph.facebook.com/${page_id}/feed`,
        {
            message: message,
            access_token: page_token
        });

    res.json(post.data);

});

app.listen(3000, () => console.log("Server running"));
