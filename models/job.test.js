"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const Company = require("./company.js");
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
    const newJob = {
        id: 4,
        title: "new",
        salary: 10000,
        equity: '0',
        companyHandle: 'c1'
    };

    test("created new job successful", async function () {
        // let company = await Company.create(newCompany);
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob);

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           JOIN companies
            ON jobs.company_handle = companies.handle
           WHERE id = 4
           `
        );
        expect(result.rows).toEqual([
            {
                id: 4,
                title: "new",
                salary: 10000,
                equity: '0',
                company_handle: 'c1',
            },
        ]);
    });

    test("bad request with dupe", async function () {
        try {
            await Job.create(newJob);
            await Job.create(newJob);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: 1,
                title: "Artist",
                salary: 50000,
                equity: '0',
                company_handle: 'c1',
            },
            {
                id: 2,
                title: "Developer",
                salary: 200000,
                equity: '0',
                company_handle: 'c2',
            },
            {
                id: 3,
                title: "Musician",
                salary: 30000,
                equity: '0',
                company_handle: 'c3',
            },
        ]);
    });
});

/************************************** get */

describe("get", function () {
    test("gets jobs from company successfully", async function () {
        let jobs = await Job.get("c1");
        expect(jobs).toEqual([{
            id: 1,
            title: "Artist",
            salary: 50000,
            equity: '0',
            companyHandle: 'c1',
        }]);
    });

    test("not found if no such company", async function () {
        try {
            await Job.get("nope");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "updated job",
        salary: 30000,
        equity: '1'
    };

    test("works", async function () {
        let job = await Job.update(1, updateData);
        expect(job).toEqual({
            id: 1,
            companyHandle: 'c1',
            ...updateData,
        });

        const result = await db.query(
            `SELECT id,
                title,
                salary,
                equity,
                company_handle
           FROM jobs
           WHERE id = 1`
        );
        expect(result.rows).toEqual([
            {
                id: 1,
                title: "updated job",
                salary: 30000,
                equity: '1',
                company_handle: 'c1',
            },
        ]);
    });

    test("works: null fields", async function () {
        const updateDataSetNulls = {
            title: "updated job",
            salary: null,
            equity: '1'
        };

        let job = await Job.update(1, updateDataSetNulls);
        expect(job).toEqual({
            id: 1,
            companyHandle: 'c1',
            ...updateData,
        });

        const result = await db.query(
            `SELECT id,
                title,
                salary,
                equity,
                company_handle
           FROM jobs
           WHERE id = 1`
        );
        expect(result.rows).toEqual([
            {
                id: 1,
                title: "updated job",
                salary: null,
                equity: '1',
                company_handle: 'c1',
            },
        ]);
    });

    test("not found if no such company", async function () {
        try {
            await Job.update(10, updateDataSetNulls);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });


});