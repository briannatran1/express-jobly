"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForQueryFilter } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { id, title, salary, equity, company_handle }
     *
     * Returns { id, title, salary, equity, company_handle }
     *
     * Throws BadRequestError if job already in database.
     * */

    static async create({ id, title, salary, equity, companyHandle }) {
        console.log(id, title, salary, equity, companyHandle);
        const duplicateCheck = await db.query(
            `
        SELECT title
        FROM jobs
        WHERE title = $1`,
            [title]
        );

        if (duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicate job: ${title}`);

        const result = await db.query(
            `INSERT INTO jobs ( title,
                                salary,
                                equity,
                                company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
                    `,
            [title, salary, equity, companyHandle]
        );
        const jobs = result.rows[0];

        return jobs;
    }
}

module.exports = Job;
