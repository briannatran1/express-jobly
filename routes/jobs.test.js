"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
  const newJob = {
    id: 4,
    title: "new",
    salary: 10000,
    equity: '0',
    companyHandle: 'c1'
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });
});

/************************************** GET /companies */


/************************************** GET /companies/:handle */

describe("GET /jobs/:companyHandle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/c1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "C1",
        salary: 20000,
        equity: '1',
        companyHandle: 'c1',
      },
    });
  });
});