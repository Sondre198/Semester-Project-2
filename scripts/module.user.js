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
 * Signs the user in and returns true if the login was successful
 * @param {string} email The user's email
 * @param {string} password The user's password
 * @returns {Promise}
 */
export async function login(email, password) {
    const response = await fetch(`https://api.noroff.dev/api/v1/auction/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        return showNetworkError(await response.json());
    }

    const userData = await response.json();
    console.log("Login response data:", userData);

    if (!userData.accessToken) {
        throw new Error("No access token received during login.");
    }

    sessionStorage.setItem("user", JSON.stringify(userData));
    console.log("User saved in session storage:", JSON.parse(sessionStorage.getItem("user")));

    location.href = "./feed.html";
}

/**
 * Registers a user with the given options.
 * @param {UserDetails & UserCredentials} details User details
 * @returns {Promise}
 */
export async function register(details) {
    const response = await fetch(`https://api.noroff.dev/api/v1/auction/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
    });

    if (!response.ok) {
        return showNetworkError(await response.json());
    }

    const userData = await response.json();
    console.log("Register response data:", userData);

    // Log the user in to retrieve the token
    await login(details.email, details.password);
}

/**
 * Gets the currently signed in user. Navigates to login if no user is signed in.
 * @param {boolean} navigateToLogin If true, navigates to login if no user is signed in.
 * @returns {UserDetails} Details about the currently signed in user.
 */
export function getCurrentUser(navigateToLogin = true) {
    const userJson = sessionStorage.getItem("user");

    if (!userJson && !navigateToLogin) {
        return null;
    }

    if (!userJson) {
        location.href = "./";
        throw new Error("Not signed in");
    }

    const user = JSON.parse(userJson);
    console.log("Retrieved user from session storage:", user);

    if (!user.accessToken) {
        throw new Error("No access token found in session storage.");
    }

    return user;
}

/**
 * Updates the user's avatar.
 * @param {string} newAvatarUrl The new URL of the user's avatar.
 * @returns {Promise<UserDetails>}
 */
export async function updateUserAvatar(newAvatarUrl) {
    const user = getCurrentUser(true);
    if (!user || !user.name) throw new Error("User not logged in or user name is missing");

    console.log("Current user data:", user);

    const response = await fetch(`https://api.noroff.dev/api/v1/auction/profiles/${user.name}/media`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ avatar: newAvatarUrl })
    });

    if (!response.ok) {
        console.log("Error response:", await response.json());
        throw await response.json();
    }

    const updatedUser = await response.json();
    
    // Ensure the access token is preserved
    updatedUser.accessToken = user.accessToken;
    
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
}

export function logout() {
    sessionStorage.removeItem("user");
    location.href = "./";
}
