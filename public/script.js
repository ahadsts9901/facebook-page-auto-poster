const APP_ID = "YOUR_APP_ID";
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

    let select = document.getElementById("pages");
    let page_id = select.value;
    let page_token = select.selectedOptions[0].dataset.token;

    await fetch("/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: text,
            page_id,
            page_token
        })
    });

    alert("Posted!");

}

loadPages();
