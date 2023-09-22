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
            `INSERT INTO jobs (id,
                                title,
                                salary,
                                equity,
                                company_handle)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
                    `,
            [id, title, salary, equity, companyHandle]
        );
        const jobs = result.rows[0];

        return jobs;
    }

    /** Find all jobs.
     *
     * Returns [{ id, title, salary, equity, company_handle }, ...]
     * */

    static async findAll() {
        const result = await db.query(`
            SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle
            FROM jobs
            ORDER BY title`);

        return result.rows;
    }

    /** Given a company_handle, return data about jobs from company_handle.
     *
     * Returns [{ id, title, salary, equity}]
     *
     * Throws NotFoundError if not found.
     **/

    static async get(companyHandle) {
        const jobRes = await db.query(
            `
        SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
        FROM jobs
        WHERE company_handle = $1`,
            [companyHandle]
        );
        console.log(jobRes);

        const jobs = jobRes.rows;

        if (jobs.length === 0) throw new NotFoundError(`No jobs in ${companyHandle}`);

        return jobs;
    }

    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {title, salary, equity}
     *
     * Returns {id, title, salary, equity, company_handle}
     *
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {
            companyHandle: "company_handle"
        });
        const idIdx = "$" + (values.length + 1);

        const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idIdx}
        RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job found: ${id}`);

        return job;
    }

    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if job not found.
     **/

    static async remove(id) {
        const result = await db.query(
            `
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`,
            [id]
        );
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;
