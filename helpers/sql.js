"use strict";

const { BadRequestError } = require("../expressError");

/**
 * Updates specific columns in database.
 *
 * Accepts 2 objects:
 * 1st obj => what values we want to update/change like {firstName: 'Alice'}
 * 2nd obj => columns that correspond to our db (finds column in db and updates with new value)
 *
 * Return obj with db columns in a string and updated values in an arr like,
 * => {setCols: '"first_name"=$1, values: ['Alice']}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");

    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map(
        (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
    );

    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    };
}

function sqlForQueryFilter(dataToQuery, jsToSql) {
    const keys = Object.keys(dataToQuery);
    if (keys.length === 0) throw new BadRequestError("No data");

    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map((colName, idx) => {
        if (colName === "nameLike") {
            return `${jsToSql[colName]} ILIKE %${idx + 1}%`;
        }
        if (colName === "maxEmployees") {
            return `${jsToSql[colName]} <= $${idx + 1}`;
        }
        if (colName === "minEmployees") {
            return `${jsToSql[colName]} >= $${idx + 1}`;
        }
    });

    return {
        setCols: cols.join(" AND "),
        values: Object.values(dataToQuery),
    };
}
module.exports = { sqlForPartialUpdate, sqlForQueryFilter };
