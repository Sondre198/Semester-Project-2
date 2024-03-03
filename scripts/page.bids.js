import { showMessageBox, showNetworkError } from "./module.messagebox.js"
import { getUrlParameter } from "./module.page.js"
import { buildFromTemplate, formatRelativeDate } from "./module.template.js"
import {getCurrentUser, logout} from "./module.user.js"

const user = getCurrentUser()

document.getElementById("user_name").innerText=user?.name ?? "Guest"
document.getElementById("user_credits").innerText= user ? (user.credits + "💳") : ''
document.getElementById("btn-logout").onclick = () => logout()

const listingId = getUrlParameter("id")

const response = await fetch ("https://api.noroff.dev/api/v1/auction/listings/" + listingId + "?_seller=true&_bids=true", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + user.accessToken
    }
})

if (!response.ok) {
    showMessageBox(await response.json())
    throw new Error("Could not load listing")
}

const listing = await response.json()

// Sort listing by dates
listing.bids.sort((a, b) => new Date(b.created) - new Date(a.created))

console.log(listing)

document.getElementById("listing-title").innerText = listing.title
document.getElementById("listing-description").innerText = listing.description

const bidsContainer = document.getElementById("bids")
for (const bid of listing.bids) {
    bidsContainer.appendChild(buildFromTemplate("bid-template", builder => builder
        .withText(".bid-amount", bid.amount)
        .withText(".bid-created", formatRelativeDate(new Date(bid.created)))
        .withAttribute(".bid-created", "title", new Date(bid.created).toLocaleString())
        .withText(".bid-bidderName", bid.bidderName)))
}

const mediaContainer = document.getElementById("media")
for (const media of listing.media) {
    mediaContainer.appendChild(buildFromTemplate("media-template", builder => builder
        .withAttribute("img", "src", media)
        .withAttribute("img", "alt", listing.title)
        .withAttribute("", "src", media)
        .withAttribute("", "alt", listing.title)))
}

document.getElementById("btn-new-bid").onclick = async () => {
    const amountStr = prompt("Enter the amount you want to bid")
    if (!amountStr) return;

    const amount = Number(amountStr)

    if (amount == Number.NaN) {
        showMessageBox({
            title: "Invalid amount",
            details: "The amount must be a number"
        })
        return;
    }

    if (amount < 0) {
        showMessageBox({
            title: "Invalid amount",
            details: "The amount must be a positive number"
        })
        return;
    }

    if (amount > user.credits) {
        showMessageBox({
            title: "Insufficient funds",
            details: "You do not have enough credits to make this bid"
        })
        return;
    }


    // Send bid to API
    const response = await fetch ("https://api.noroff.dev/api/v1/auction/listings/" + listing.id + "/bids", {
        method: "POST",
        body: JSON.stringify({ amount }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.accessToken
        }
    })

    // Handle failed bid attempts
    if (!response.ok) {
        showNetworkError(await response.json())
        return;
    }

    location.reload()
}