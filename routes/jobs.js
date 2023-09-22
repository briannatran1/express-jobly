"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, isAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const { jobNewSchema } = require("../schemas/jobNewSchema.json");
const { jobUpdate } = require("../schemas/jobUpdate.json");
const { jobFilter } = require("../schemas/jobFilter.json");
// const { jobQuery } = require("../schemas/jobQuery.json")

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { id, title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobNewSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { job: [ { id, title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const jobs = await Job.findAll();
  return res.json({ jobs });
});

/** GET /[company_handle]  =>  { job }
 *
 *  Job is { id, title, salary, equity, company_handle }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:companyHandle", async function (req, res, next) {
  const job = await Job.get(req.params.companyHandle);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: logged in as admin
 */

router.patch("/:id", ensureLoggedIn, isAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobUpdate, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: logged in as admin
 */

router.delete("/:id", ensureLoggedIn, isAdmin, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});

module.exports = router;
