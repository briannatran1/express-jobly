"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, isAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyFilter = require("../schemas/companyFilter.json");
const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companyQuery = require("../schemas/companyQuery.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
    const validator = jsonschema.validate(req.body, companyNewSchema, {
        required: true,
    });
    if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    let reqQuery;
    if (req.query) {
        const results = jsonschema.validate(req.query, companyQuery, {
            required: true,
        });

        if (!results.valid) {
            const errs = results.errors.map((err) => err.stack);
            throw new BadRequestError(errs);
        }
        //don't need to delete reqQuery keys; dynamic WHERE fixes this
        reqQuery = {
            maxEmployees: Number(req.query?.maxEmployees) || null,
            minEmployees: Number(req.query?.minEmployees) || null,
            nameLike: req.query?.nameLike || null,
        };

        if (reqQuery["nameLike"] === null) {
            delete reqQuery.nameLike;
        }
        if (reqQuery["maxEmployees"] === null) {
            delete reqQuery.maxEmployees;
        }
        if (reqQuery["minEmployees"] === null) {
            delete reqQuery.minEmployees;
        }

        const result = jsonschema.validate(reqQuery, companyFilter, {
            required: true,
        });

        if (!result.valid) {
            const errs = result.errors.map((err) => err.stack);
            throw new BadRequestError(errs);
        }
    }

    const companies = await Company.findAll(reqQuery);

    return res.json({ companies });
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: logged in as admin
 */

router.patch(
    "/:handle",
    ensureLoggedIn,
    isAdmin,
    async function (req, res, next) {
        const validator = jsonschema.validate(req.body, companyUpdateSchema, {
            required: true,
        });
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }

        const company = await Company.update(req.params.handle, req.body);
        return res.json({ company });
    }
);

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete(
    "/:handle",
    ensureLoggedIn,
    isAdmin,
    async function (req, res, next) {
        await Company.remove(req.params.handle);
        return res.json({ deleted: req.params.handle });
    }
);

module.exports = router;
