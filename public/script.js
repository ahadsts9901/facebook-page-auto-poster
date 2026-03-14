const APP_ID = "YOUR_FACEBOK_APP_ID";
const REDIRECT = "http://localhost:3000/auth";

document.getElementById("loginBtn").href =
    `https://www.facebook.com/v19.0/dialog/oauth?
client_id=${APP_ID}
&redirect_uri=${REDIRECT}
&scope=pages_manage_posts,pages_read_engagement,pages_show_list`;

async function loadPages() {

    let res = await fetch("/pages");
    let data = await res.json();

    let select = document.getElementById("pages");

    data.data.forEach(page => {

        let option = document.createElement("option");
        option.value = page.id;
        option.text = page.name;
        option.dataset.token = page.access_token;

        select.appendChild(option);

    });

}

async function post() {

    let text = document.getElementById("postText").value;
    let link = document.getElementById("postLink").value;
    let images = document.getElementById("postImages").files;
    let video = document.getElementById("postVideo").files[0];

    let select = document.getElementById("pages");
    let page_id = select.value;
    let page_token = select.selectedOptions[0].dataset.token;

    let form = new FormData();

    form.append("message", text);
    form.append("link", link);
    form.append("page_id", page_id);
    form.append("page_token", page_token);

    for (let img of images) {
        form.append("images", img);
    }

    // if (video) {
    //     form.append("video", video);
    // }

    await fetch("/post", {
        method: "POST",
        body: form
    });

    alert("Posted!");

}

loadPages();
