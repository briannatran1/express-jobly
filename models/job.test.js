"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");
const { response } = require("express");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
//  id, title, salary, equity, company_handle
describe("create", function () {
    // FIXME:
    const newCompany = {
        handle: "new",
        name: "New",
        description: "New Description",
        numEmployees: 1,
        logoUrl: "http://new.img",
    };

    const newJob = {
        id: 1,
        title: "new",
        salary: 10000,
        equity: 0,
        companyHandle: "new",
    };

    test("created new job successful", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob);

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1
           `
        );
        expect(result.rows).toEqual([
            {
                id: 1,
                title: "new",
                salary: 10000,
                equity: 0,
                company_handle: "hall-mills",
            },
        ]);
    });
});
