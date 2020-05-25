import request from "supertest";
import "regenerator-runtime/runtime";
import server from "../app";
import admin from "../config/firebase.config";

const TEST_EMAIL = "Ronald@gmail.com";
const TEST_PASSWORD = "123456aaccd";
const TEST_USERNAME = "Donald Duch";

beforeAll(() => {
  admin
    .database()
    .ref("users/")
    .once("value")
    .then(async (snap) => {
      let child = snap.val();
      for (let item in child) {
        if (
          child[item].email === TEST_EMAIL &&
          child[item].name === TEST_USERNAME
        ) {
          await admin.database().ref(`/users/${item}`).remove();
        }
      }
    });
});

// @Test '/signup' route with true type email, username and password;
describe("Sign Up test 1", () => {
  it("Sign Up API with new email, username and password", async (done) => {
    let key = await admin
      .database()
      .ref("users/")
      .once("value")
      .then(async (snap) => {
        let child = snap.val();
        for (let item in child) {
          if (
            child[item].email === TEST_EMAIL &&
            child[item].name === TEST_USERNAME
          ) {
            console.log({ item });
            return item;
          }
        }
      });
    admin.database().ref(`/users/${key}`).remove();
    jest.setTimeout(10000);
    const res = await request(server).post("/api/signup").send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_USERNAME,
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("msg");
    done();
  });
});

// @Test '/signup' route with same email, username and password;
describe("Sign Up test 2", () => {
  it("Sign Up API with same email, username and password", async (done) => {
    const res = await request(server).post("/api/signup").send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_USERNAME,
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("errormsg");
    done();
  });
});

// @Test '/signup' route with error type;
describe("Sign Up test 3", () => {
  it("Sign Up API with error type", async (done) => {
    const res = await request(server)
      .post("/api/signup")
      .send({ email: "tester@", password: "12345", names: "Test" });
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty("typeError");
    done();
  });
});

// @Test '/signup' route with empty body;
describe("Sign Up test 4", () => {
  it("Sign Up API with empty body", async (done) => {
    const res = await request(server).post("/api/signup").send({});
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty("typeError");
    done();
  });
});

// @Test unknow route
describe("Get Unknow Route", () => {
  it("Get Unknow Route", async (done) => {
    const res = await request(server).get("/mains").send();
    expect(res.statusCode).toEqual(404);
    done();
  });
});

afterAll(async (done) => {
  // close server conection
  // server.close();
  done();
});
