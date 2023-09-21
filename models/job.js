"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForQueryFilter } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {

}