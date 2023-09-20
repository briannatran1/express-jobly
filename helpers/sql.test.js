const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("Test no data in dataToUpdate", function () {
        let dataToUpdate = {};
        let jsToSql = { firstName: "first_name" };

        expect(() => {
            sqlForPartialUpdate(dataToUpdate, jsToSql);
        }).toThrow("No data");
    });
});
