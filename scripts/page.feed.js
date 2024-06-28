import { showMessageBox, showNetworkError } from "./module.messagebox.js";
import { getUrlParameter } from "./module.page.js";
import { buildFromTemplate, formatRelativeDate } from "./module.template.js";
import { getCurrentUser, logout, updateUserAvatar } from "./module.user.js";

const user = getCurrentUser(false);

document.addEventListener("DOMContentLoaded", function() {
    if (user) {
        document.getElementById("user_name").innerText = user.name;
        document.getElementById("user_credits").innerText = user.credits + "💳";
        const userAvatar = document.getElementById("user_avatar");
        userAvatar.src = user.avatar;
        console.log("Setting user avatar src to:", user.avatar);
    } else {
        document.getElementById("user_name").innerText = "Guest";
        document.getElementById("user_credits").innerText = '';
        document.getElementById("btn-logout").innerText = "Login";
        document.getElementById("btn-new-listing").style.display = "none";
    }
    document.getElementById("btn-logout").onclick = () => logout();

    const btnSearch = document.getElementById("btn-search");
    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            const searchQuery = document.getElementById("searchInput").value.toLowerCase();
            searchListings(searchQuery);
        });
    } else {
        console.error("Search button not found");
    }

    loadListings();
});

function searchListings(query) {
    const listingsElements = document.querySelectorAll("[data-id]");
    listingsElements.forEach(element => {
        const title = element.querySelector(".listing-title").textContent.toLowerCase();
        element.style.display = title.includes(query) ? "" : "none";
    });
}

async function loadListings() {
    let filter = getUrlParameter("filter") ?? "";
    if (filter === "active") {
        filter = "&_active=true";
        document.getElementById("switch-only-active").checked = true;
        document.getElementById("btn-remove-tag").remove();
    } else if (filter.startsWith("tag:")) {
        filter = "&_tag=" + filter.substring(4);
        document.getElementById("filter-name").innerText = filter.substring(4);
    } else if (filter) {
        console.error("Unknown filter:", filter);
        document.getElementById("btn-remove-tag").remove();
        filter = "";
    }

    const listingsContainer = document.getElementById("listings");
    listingsContainer.innerHTML = ""; // Clear existing listings

    const listings = await fetchListings(filter);
    console.log(`Fetched listings:`, listings); // Log the listings

    listings.forEach(listing => {
        const element = buildFromTemplate("listing-template", builder => {
            builder
                .withAttribute('', 'data-id', listing.id)
                .withAttribute('', 'data-seller', listing.seller.email)
                .withAttribute('', 'data-owned', user?.email === listing.seller.email)
                .withText('.listing-title', listing.title)
                .withText('.listing-description', listing.description)
                .withText('.listing-created', formatRelativeDate(listing.created))
                .withText('.listing-updated', formatRelativeDate(listing.updated))
                .withText('.listing-endsAt', "Ends " + formatRelativeDate(listing.endsAt))
                .withText('.listing-seller-name', listing.seller.name)
                .withText('.listing-seller-email', listing.seller.email)
                .withAttribute('.listing-seller-avatar', 'src', listing.seller.avatar);

            const carouselInner = builder.element.querySelector('.carousel-inner');
            listing.media.forEach((url, index) => {
                const imgElement = buildFromTemplate("image-template", imgBuilder => {
                    imgBuilder
                        .withAttribute('img', 'src', url)
                        .withAttribute('img', 'title', "Image of " + listing.title)
                        .withAttribute('', 'src', url)
                        .withAttribute('', 'title', "Image of " + listing.title)
                        .withHandler('', 'click', () => onClickImage(listing, url));
                    if (index === 0) {
                        imgBuilder.with('', (carouselItem) => carouselItem.classList.add('active'));
                    }
                    return imgBuilder;
                });
                carouselInner.appendChild(imgElement);
            });

            return builder;
        });
        listingsContainer.appendChild(element);
    });
}

async function fetchListings(filter) {
    const response = await fetch(`https://api.noroff.dev/api/v1/auction/listings?_seller=true&_bids=true&_sort=created&order=desc` + filter);
    if (!response.ok) {
        showNetworkError(await response.json());
        return [];
    }
    const listings = await response.json();
    listings.forEach(listing => {
        listing.created = new Date(listing.created);
        listing.updated = new Date(listing.updated);
        listing.endsAt = new Date(listing.endsAt);
    });
    return listings;
}

function onClickImage(listing, imageUrl) {
    location.href = `/bids.html?id=${listing.id}`;
}

// Function to handle avatar update
document.getElementById("user_avatar").onclick = () => {
    const newAvatarUrl = prompt("Enter the URL of your new avatar:");
    if (newAvatarUrl) {
        updateUserAvatar(newAvatarUrl).then(updatedUser => {
            document.getElementById("user_avatar").src = newAvatarUrl;
            showMessageBox("Success", "Avatar updated successfully.");
            console.log("Updated user avatar src to:", newAvatarUrl); // Log the new avatar URL
        }).catch(err => {
            const errorMessage = err.message || "Failed to update avatar.";
            showMessageBox("Error", errorMessage);
            console.error("Error updating avatar:", err);
        });
    }
};
