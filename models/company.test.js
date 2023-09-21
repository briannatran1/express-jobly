"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
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

describe("create", function () {
    const newCompany = {
        handle: "new",
        name: "New",
        description: "New Description",
        numEmployees: 1,
        logoUrl: "http://new.img",
    };

    test("works", async function () {
        let company = await Company.create(newCompany);
        expect(company).toEqual(newCompany);

        const result = await db.query(
            `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`
        );
        expect(result.rows).toEqual([
            {
                handle: "new",
                name: "New",
                description: "New Description",
                num_employees: 1,
                logo_url: "http://new.img",
            },
        ]);
    });

    test("bad request with dupe", async function () {
        try {
            await Company.create(newCompany);
            await Company.create(newCompany);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let data = {};
        let companies = await Company.findAll(data);
        expect(companies).toEqual([
            {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
            {
                handle: "c2",
                name: "C2",
                description: "Desc2",
                numEmployees: 2,
                logoUrl: "http://c2.img",
            },
            {
                handle: "c3",
                name: "C3",
                description: "Desc3",
                numEmployees: 3,
                logoUrl: "http://c3.img",
            },
        ]);
    });

    test("works: name filter", async function () {
        let data = { nameLike: "%c%" };
        let companies = await Company.findAll(data);
        expect(companies).toEqual([
            {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
            {
                handle: "c2",
                name: "C2",
                description: "Desc2",
                numEmployees: 2,
                logoUrl: "http://c2.img",
            },
            {
                handle: "c3",
                name: "C3",
                description: "Desc3",
                numEmployees: 3,
                logoUrl: "http://c3.img",
            },
        ]);
    });

    test("works: name filter + min", async function () {
        let data = { nameLike: "%c%", minEmployees: 0 };
        let companies = await Company.findAll(data);
        expect(companies).toEqual([
            {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
            {
                handle: "c2",
                name: "C2",
                description: "Desc2",
                numEmployees: 2,
                logoUrl: "http://c2.img",
            },
            {
                handle: "c3",
                name: "C3",
                description: "Desc3",
                numEmployees: 3,
                logoUrl: "http://c3.img",
            },
        ]);
    });

    test("works: min + max", async function () {
        let data = { minEmployees: 0, maxEmployees: 3 };
        let companies = await Company.findAll(data);
        expect(companies).toEqual([
            {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
            {
                handle: "c2",
                name: "C2",
                description: "Desc2",
                numEmployees: 2,
                logoUrl: "http://c2.img",
            },
            {
                handle: "c3",
                name: "C3",
                description: "Desc3",
                numEmployees: 3,
                logoUrl: "http://c3.img",
            },
        ]);
    });

    test("min greater than max", async function () {
        let data = { maxEmployees: 300, minEmployees: 400 };
        try {
            await Company.findAll(data);
            throw new Error("Min employees must be less than max employees");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("_filterCompanies", function () {
    test("tests for one filter", async function () {
        const data = { nameLike: "%c%" };

        const results = Company._filterCompanies(data);

        expect(results).toEqual({
            setCols: "WHERE name ILIKE $1",
            values: ["%c%"],
        });
    });

    test("tests for one filter - min", async function () {
        const data = { minEmployees: 0 };

        const results = Company._filterCompanies(data);

        expect(results).toEqual({
            setCols: "WHERE num_employees >= $1",
            values: [0],
        });
    });

    test("tests for 2 filters, nameLike and min", async function () {
        const data = { nameLike: "%c%", minEmployees: 1 };

        const results = Company._filterCompanies(data);

        expect(results).toEqual({
            setCols: "WHERE name ILIKE $1 AND num_employees >= $2",
            values: ["%c%", 1],
        });
    });

    test("tests for 2 filters, min and max", async function () {
        const data = { maxEmployees: 3, minEmployees: 0 };

        const results = Company._filterCompanies(data);

        expect(results).toEqual({
            setCols: "WHERE num_employees <= $1 AND num_employees >= $2",
            values: [3, 0],
        });
    });
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        let company = await Company.get("c1");
        expect(company).toEqual({
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
        });
    });

    test("not found if no such company", async function () {
        try {
            await Company.get("nope");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        name: "New",
        description: "New Description",
        numEmployees: 10,
        logoUrl: "http://new.img",
    };

    test("works", async function () {
        let company = await Company.update("c1", updateData);
        expect(company).toEqual({
            handle: "c1",
            ...updateData,
        });

        const result = await db.query(
            `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`
        );
        expect(result.rows).toEqual([
            {
                handle: "c1",
                name: "New",
                description: "New Description",
                num_employees: 10,
                logo_url: "http://new.img",
            },
        ]);
    });

    test("works: null fields", async function () {
        const updateDataSetNulls = {
            name: "New",
            description: "New Description",
            numEmployees: null,
            logoUrl: null,
        };

        let company = await Company.update("c1", updateDataSetNulls);
        expect(company).toEqual({
            handle: "c1",
            ...updateDataSetNulls,
        });

        const result = await db.query(
            `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`
        );
        expect(result.rows).toEqual([
            {
                handle: "c1",
                name: "New",
                description: "New Description",
                num_employees: null,
                logo_url: null,
            },
        ]);
    });

    test("not found if no such company", async function () {
        try {
            await Company.update("nope", updateData);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            await Company.update("c1", {});
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Company.remove("c1");
        const res = await db.query(
            "SELECT handle FROM companies WHERE handle='c1'"
        );
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such company", async function () {
        try {
            await Company.remove("nope");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
