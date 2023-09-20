const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("update with no data", function () {
        let dataToUpdate = {};
        let jsToSql = { firstName: "first_name" };

        expect(() => {
            sqlForPartialUpdate(dataToUpdate, jsToSql);
        }).toThrow("No data");
    });

    test("updating one column", function () {
        let dataToUpdate = { firstName: 'Alice' };
        let jsToSql = { firstName: "first_name" };

        const results = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(results.setCols).toEqual('"first_name"=$1');
        expect(results.values).toEqual(['Alice']);
    });

    test("updating more than one column", function () {
        let dataToUpdate = { firstName: 'Alice', age: 32 };
        let jsToSql = { firstName: "first_name", age: "age" };

        const results = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(results.setCols).toEqual('"first_name"=$1, "age"=$2');
        expect(results.values).toEqual(['Alice', 32]);
    });
});
