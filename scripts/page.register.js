import { register } from "./module.user.js"

// Try to create an account whenever the user clicks the submit button.
document.querySelector("form").onsubmit = async event => {

    // Stop the form from submitting.
    event.preventDefault()

    // Try to create a new account
    await register({
        name: document.getElementById("name").value, 
        email: document.getElementById("email").value, 
        password: document.getElementById("password").value, 
        avatar: document.getElementById("avatar").value
    })
}