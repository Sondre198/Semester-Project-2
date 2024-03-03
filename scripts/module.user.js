import { showNetworkError } from "./module.messagebox.js";

/**
 * Login credentials for an existing user.
 * @typedef {{
* email:string; 
* password:string;
* }} UserCredentials 
*/

/**
 * User account details.
 * @typedef {{
 * name:string; 
 * email:string; 
 * avatar?:string;
 * credits:number;
 * accessToken:string;
 * }} UserDetails 
 */

/**
 * Signs the user in and returns true if the login was successfull
 * @param {string} email The users email
 * @param {string} password The users password
 * @returns {Promise}
 */
export async function login(email, password) {

    // Send login request to API
    const response = await fetch(`https://api.noroff.dev/api/v1/auction/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })

    // Handle failed login attempts
    if (!response.ok) {
        return showNetworkError(await response.json())
    }
    
    // Save details in session storage.
    sessionStorage.setItem("user", JSON.stringify(await response.json()))

    // The login was successful.
    // Navigate to the feed page.
    location.href = "./feed.html"
}

/**
 * Registers a user with the given options.
 * @param {UserDetails & UserCredentials} details User details
 * @returns {Promise}
 */
export async function register(details) {

    // Send login request to API
    const response = await fetch(`https://api.noroff.dev/api/v1/auction/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
    })

    // Handle failed login attempts
    if (!response.ok) {
        return showNetworkError(await response.json())
    }
      
    // Register was successful.
    // Navigate to the login
    location.href = "./"
}

/**
 * Gets the currently signed in user. Navigates to login if no user is signed in.
 * @param {boolean} navigateToLogin If true, navigates to login if no user is signed in.
 * @returns {UserDetails} Details about the currently signed in user.
 */
export function getCurrentUser(navigateToLogin = true) {

    // Session storage cache for user details
    const userJson = sessionStorage.getItem("user")

    if (!userJson && !navigateToLogin)
        // There is no user currently signed in
        // Consumer sais that is okay.
        return null;

    if (!userJson) {
        // There is no user currently signed in
        // Consumer sais that is not okay.
        location.href = "./"
        throw new Error("Not signed in")
    }

    // Parse the details to an object
    return JSON.parse(userJson) 
}

export function logout() {

    // Delete logged in user data
    sessionStorage.setItem("user", "")

    // Go to login
    location.href = "./"

}