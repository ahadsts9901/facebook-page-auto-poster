const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const FormData = require("form-data");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const APP_ID = "YOUR_FACEBOK_APP_ID";
const APP_SECRET = "YOUR_FACEBOOK_APP_SECRET";
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

// Upload Post
app.post("/post", upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 }
]), async (req, res) => {

    const { message, page_id, page_token } = req.body;

    try {

        // VIDEO POST
        if (req.files.video) {

            const video = req.files.video[0];

            const form = new FormData();
            form.append("source", fs.createReadStream(video.path));
            form.append("description", message);
            form.append("access_token", page_token);

            const response = await axios.post(
                `https://graph.facebook.com/${page_id}/videos`,
                form,
                { headers: form.getHeaders() }
            );

            return res.json(response.data);
        }

        // MULTIPLE IMAGES IN ONE POST
        if (req.files.images) {

            let mediaIds = [];

            for (let img of req.files.images) {

                const form = new FormData();

                form.append("source", fs.createReadStream(img.path));
                form.append("published", "false");
                form.append("access_token", page_token);

                let upload = await axios.post(
                    `https://graph.facebook.com/${page_id}/photos`,
                    form,
                    { headers: form.getHeaders() }
                );

                mediaIds.push(upload.data.id);
            }

            const form = new FormData();

            form.append("message", message);
            form.append("access_token", page_token);

            mediaIds.forEach((id, index) => {
                form.append(
                    `attached_media[${index}]`,
                    JSON.stringify({ media_fbid: id })
                );
            });

            const response = await axios.post(
                `https://graph.facebook.com/${page_id}/feed`,
                form,
                { headers: form.getHeaders() }
            );

            return res.json(response.data);
        }

        // TEXT POST
        const response = await axios.post(
            `https://graph.facebook.com/${page_id}/feed`,
            {
                message: message,
                access_token: page_token
            }
        );

        res.json(response.data);

    } catch (err) {

        console.log(err.response?.data || err);
        res.status(500).send("Error posting");

    }

});

app.listen(3000, () => console.log("Server running"));
