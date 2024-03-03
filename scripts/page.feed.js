import { showMessageBox, showNetworkError } from "./module.messagebox.js"
import { getUrlParameter } from "./module.page.js"
import { buildFromTemplate, formatRelativeDate } from "./module.template.js"
import {getCurrentUser, logout} from "./module.user.js"

const user = getCurrentUser(false)

document.getElementById("user_name").innerText=user?.name ?? "Guest"
document.getElementById("user_credits").innerText= user ? (user.credits + "💳") : ''
document.getElementById("btn-logout").onclick = () => logout()

// If the user is not logged in, change the button text to "Login"
// The button does the same either way.
if (!user) {
    document.getElementById("btn-logout").innerText = "Login"
    document.getElementById("btn-new-listing").style.display = "none"
}

/**
 * Callback invoked when the user clicks a tag.
 * @param {Listing} listing 
 * @param {string} tag 
 */
function onClickTag(listing, tag) {
    location.href = "/feed.html?filter=tag:" + tag
}

/**
 * Callback invoked when the user clicks an image.
 * @param {Listing} listing 
 * @param {string} imageUrl 
 */
function onClickImage(listing, imageUrl) {

}

/**
 * Callback invoked when the user wants to edit their own listing.
 * @param {Listing} listing 
 */
function onEditListing(listing) {
    location.href = "/edit-listing.html?id=" + listing.id
}

/**
 * Callback invoked when the user wants to delete their own listing.
 * @param {Listing} listing 
 */
async function onDeleteListing(listing) {

    if (!confirm("Are you sure you want to delete this listing?"))
        return;

    const response = await fetch ("https://api.noroff.dev/api/v1/auction/listings/" + listing.id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.accessToken
        }
    })

    if (!response.ok) {
        showNetworkError(await response.json())
        return;
    }

    location.reload()
}

/**
 * Callback invoked when the user wants to bid on another users listing.
 * @param {Listing} listing 
 */
async function onBidListing(listing) {
    location.href = "/bids.html?id=" + listing.id
}

let filter = getUrlParameter("filter") ?? ""
console.log("Filter: " + filter)
if (filter == "active") {
    filter = "&_active=true"
    document.getElementById("switch-only-active").checked = true
    document.getElementById("btn-remove-tag").remove()
}
else if (filter.startsWith("tag:")) {
    filter = "&_tag=" + filter.substring(4)
    document.getElementById("filter-name").innerText = filter.substring(6)
}
else {
    console.error("Unknown filter: " + filter)
    filter = ""
    document.getElementById("btn-remove-tag").remove()
}
document.getElementById("switch-only-active").onchange = e => location.href = document.getElementById("switch-only-active").checked ? "./feed.html?filter=active" : "./feed.html"

/**
 * @typedef {{
 * id:string;
 * title:string;
 * description:string;
 * tags:string[];
 * media:string[];
 * created:Date;
 * updated:Date;
 * endsAt:Date;
 * seller: {
 *   name:string;
 *   email:string;
 *   avatar:string;
 * }
 * }} Listing
 */

/**
 * @type {[Listing]}
 */
const listings = await fetch("https://api.noroff.dev/api/v1/auction/listings?_seller=true" + filter).then(x => x.json()).then(list => { 
    list.forEach(item => {
        item.created = new Date(item.created)
        item.updated = new Date(item.updated)
        item.endsAt = new Date(item.endsAt)
    })
    return list
})

console.log(listings)

const listingsContainer = document.getElementById("listings")
for (const listing of listings) {
    
    const ownedByCurrentUser = user?.email == listing.seller.email

    const element = buildFromTemplate("listing-template", builder => builder
        .withAttribute('', 'data-id', listing.id)
        .withAttribute('', 'data-seller', listing.seller.email)
        .withAttribute('', 'data-owned', ownedByCurrentUser)
        .withText('.listing-title', listing.title)
        .withText('.listing-description', listing.description)
        .withText('.listing-created', formatRelativeDate(listing.created))
        .withText('.listing-updated', formatRelativeDate(listing.created))
        .withText('.listing-endsAt', "Ends " + formatRelativeDate(listing.endsAt))
        .withText('.listing-seller-name', listing.seller.name)
        .withText('.listing-seller-email', listing.seller.email)
        .withAttribute('.listing-seller-avatar', 'src', listing.seller.avatar))

    for (const tag of listing?.tags ?? []) {
        element.querySelector(".listing-tags")?.appendChild(buildFromTemplate("tag-template", builder => builder
            .withText('.tag-name', tag)
            .withHandler('.tag-name', 'click', () => onClickTag(listing, tag))))
    }
    if (!listing.tags?.length) {
        element.querySelector(".listing-tags")?.remove()
    }

    for (const url of listing?.media ?? []) {
        element.querySelector(".listing-media")?.appendChild(buildFromTemplate("image-template", builder => builder
            .withAttribute('img', 'src', url)
            .withAttribute('img', 'title', "Image of " + listing.title)
            .withAttribute('', 'src', url)
            .withAttribute('', 'title', "Image of " + listing.title)
            .withHandler('', 'click', () => onClickImage(listing, url))))
    }

    const actions = element.querySelector(".listing-actions")

    if (ownedByCurrentUser) {
        // Add buttons for listings owned by the current user.

        actions?.append(buildFromTemplate("edit-button-template", builder => builder
            .withHandler('', 'click', () => onEditListing(listing))))

        actions?.append(buildFromTemplate("delete-button-template", builder => builder
            .withHandler('', 'click', () => onDeleteListing(listing))))
        
    }
    else if (user) {
        // Add buttons for listings not owned by the current user.

        actions?.append(buildFromTemplate("bid-button-template", builder => builder
            .withHandler('', 'click', () => onBidListing(listing))))
    }
    else {
        // Add buttons when no user is signed in.

        const label = document.createElement("i")
        label.innerText = "Login to bid"
        actions?.appendChild(label)
    }

    element.querySelector(".carousel")?.setAttribute("id", "carousel-" + listing.id)
    element.querySelector(".carousel-item")?.classList?.add("active")

    listingsContainer.appendChild(element)
    new bootstrap.Carousel(element.querySelector("#carousel-" + listing.id), {
        interval: 2000
    })
}