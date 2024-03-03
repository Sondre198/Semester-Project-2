import { login } from "./module.user.js"
import { getCurrentUser } from "./module.user.js"

// If the user is already logged in, redirect to the feed page.
const user = getCurrentUser(false);
if (user) location.href = "./feed.html"

// Try to create an account whenever the user clicks the submit button.
document.querySelector("form").onsubmit = async event => {

    // Stop the form from submitting.
    event.preventDefault()

    // Try to create a new account
    await login(
        document.getElementById("email").value, 
        document.getElementById("password").value, 
    )
}