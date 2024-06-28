import { showMessageBox, showNetworkError } from "./module.messagebox.js";
import { getUrlParameter } from "./module.page.js";
import { getCurrentUser, logout } from "./module.user.js";

const user = getCurrentUser();

document.getElementById("user_name").innerText = user.name;
document.getElementById("user_credits").innerText = user.credits + "💳";

document.getElementById("btn-logout").onclick = () => logout();

const listingId = getUrlParameter("id");

if (!listingId) {
    const one_hour = 60 * 60 * 1000;
    document.getElementById("endsAt").value = new Date(Date.now() + one_hour * 2).toISOString().substring(0, 16);
} else {
    const response = await fetch(`https://api.noroff.dev/api/v1/auction/listings/${listingId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.accessToken}`
        }
    });

    if (!response.ok) {
        showMessageBox(await response.json());
        throw new Error("Could not load listing");
    }

    const listing = await response.json();

    console.log(listing);

    document.getElementById("title").value = listing.title;
    document.getElementById("description").value = listing.description;
    document.getElementById("endsAt").value = new Date(listing.endsAt).toISOString().substring(0, 16);
    document.getElementById("images").value = listing.media.join(";");
}

document.getElementById("form").onsubmit = async (evt) => {
    // Stop page reload
    evt.preventDefault();

    const listing = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        media: readValues("images"),  // 'media' instead of 'images'
        endsAt: new Date(document.getElementById("endsAt").value).toISOString()  // Ensure endsAt is ISO string
    };

    console.log(listing);
    let method = "POST";
    let endpoint = "https://api.noroff.dev/api/v1/auction/listings";

    if (listingId) {
        method = "PUT";
        endpoint += `/${listingId}`;
    }

    const response = await fetch(endpoint, {
        method: method,
        body: JSON.stringify(listing),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.accessToken}`
        }
    });

    if (!response.ok) {
        showNetworkError(await response.json());
        return;
    }

    location.href = "./feed.html";
};

function readValues(inputId) {
    const value = document.getElementById(inputId).value + "";
    const result = [];
    for (let part of value.split(";")) {
        part = part.trim();
        if (part) result.push(part);
    }
    return result;
}
