"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
    const authHeader = req.headers?.authorization;
    if (authHeader) {
        const token = authHeader.replace(/^[Bb]earer /, "").trim();

        try {
            res.locals.user = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            /* ignore invalid tokens (but don't store user!) */
        }
    }
    return next();
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
    if (res.locals.user?.username) return next();
    throw new UnauthorizedError();
}

/** Middleware to check if user is admin
 *
 * If not, raises Unauthorized.
 */

//TODO: check if logged in so we can just use this middleware
function isAdmin(req, res, next) {
    if (res.locals.user?.isAdmin) return next();
    throw new UnauthorizedError();
}

/** Middleware: Requires user is user or admin for route. */

//TODO: change fn name to isAdminOrCorrectUser
function isAdminOrUser(req, res, next) {
    const currentUser = res.locals.user;
    const correctUsername = currentUser?.username === req.params.username;

    if ((currentUser && correctUsername) || (currentUser.isAdmin === true)) {
        return next();
    }

    throw new UnauthorizedError();
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    isAdmin,
    isAdminOrUser
};
