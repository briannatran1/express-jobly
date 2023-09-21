"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const { authenticateJWT, ensureLoggedIn, isAdmin, isAdminOrUser } = require("./auth");

const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

function next(err) {
    if (err) throw new Error("Got error from middleware");
}

describe("authenticateJWT", function () {
    test("works: via header", function () {
        const req = { headers: { authorization: `Bearer ${testJwt}` } };
        const res = { locals: {} };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                username: "test",
                isAdmin: false,
            },
        });
    });

    test("works: no header", function () {
        const req = {};
        const res = { locals: {} };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test("works: invalid token", function () {
        const req = { headers: { authorization: `Bearer ${badJwt}` } };
        const res = { locals: {} };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe("ensureLoggedIn", function () {
    test("works", function () {
        const req = {};
        const res = { locals: { user: { username: "test" } } };
        ensureLoggedIn(req, res, next);
    });

    test("unauth if no login", function () {
        const req = {};
        const res = { locals: {} };
        expect(() => ensureLoggedIn(req, res, next)).toThrow(UnauthorizedError);
    });

    test("unauth if no valid login", function () {
        const req = {};
        const res = { locals: { user: {} } };
        expect(() => ensureLoggedIn(req, res, next)).toThrow(UnauthorizedError);
    });
});

describe("isAdmin", function () {
    test("works", function () {
        const req = {};
        const res = { locals: { user: { isAdmin: true } } };
        isAdmin(req, res, next);
    });

    test("not an admin", function () {
        const req = {};
        const res = { locals: { user: { isAdmin: false } } };
        expect(() => isAdmin(req, res, next)).toThrow(UnauthorizedError);
    });
});

describe("isAdminOrUser", function () {
    test("works for both admin and user", function () {
        const req = { params: { username: 'test' } };
        const res = { locals: { user: { isAdmin: true, username: 'test' } } };
        isAdminOrUser(req, res, next);
    });

    test("works for specific user with no admin", function () {
        const req = { params: { username: 'test' } };
        const res = { locals: { user: { username: 'test', isAdmin: false } } };
        isAdminOrUser(req, res, next);
    });

    test("works for admin no specifc user", function () {
        const req = { params: { username: 'wrong' } };
        const res = { locals: { user: { isAdmin: true, username: 'wrong' } } };
        isAdminOrUser(req, res, next);
    });

    test("does not work for no admin or no user", function () {
        const req = { params: { username: 'wrong' } };
        const res = { locals: { user: {} } };
        expect(() => isAdminOrUser(req, res, next)).toThrow(UnauthorizedError);
    });
});


