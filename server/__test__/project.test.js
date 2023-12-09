import request from "supertest";
import "regenerator-runtime/runtime";
import moment from "moment";
import server from "../app";

var TOKEN = "";
var PROJECTID = "";
const PROJECTNAME = "Unit-Testing";
const EMAIL = "test@gmail.com";
var INVAILDTOKEN = "";
const PASS = "123456";

beforeAll(async () => {
  const loginResult = await request(server)
    .post("/api/login")
    .send({ email: "test@gmail.com", password: PASS });
  const invaildLoginResult = await request(server)
    .post("/api/login")
    .send({ email: "test2@gmail.com", password: PASS });
  TOKEN = loginResult.body.token;
  INVAILDTOKEN = invaildLoginResult.body.token;
});

// @Test '/api/event/create' route with parameters;
describe("Post Create New Project 1", () => {
  it("Create New Event Project", async (done) => {
    const res = await request(server)
      .post("/api/event/create")
      .set("authorization", `${TOKEN}`)
      .send({
        project: PROJECTNAME,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      msg: "Event Created",
    });
    done();
  });
});

// @Test '/api/event/create' route without Token;
describe("Post Create New Project 2", () => {
  it("Create New Event Project without Token", async (done) => {
    const res = await request(server).post("/api/event/create").send({
      project: PROJECTNAME,
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({ error: "Forbidden" });
    done();
  });
});

// @Test '/api/event/create' route with longest name;
describe("Post Create New Project 3", () => {
  it("Create New Event Project with longest name", async (done) => {
    const res = await request(server)
      .post("/api/event/create")
      .set("authorization", `${TOKEN}`)
      .send({
        project: "Content Marketing World & The Golden Raspberry Awards",
      });
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty("typeError");
    done();
  });
});

// ===================================================================================================================================================================================

// @Test '/api/projets' route with parameters;
describe("Post get all project", () => {
  it("Request user project", async (done) => {
    const res = await request(server)
      .post("/api/projets")
      .set("authorization", `${TOKEN}`)
      .send({
        email: EMAIL,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("data");
    PROJECTID = res.body.data[0].projectId;
    done();
  });
});

// ===================================================================================================================================================================================

// @Test '/api/project/overview' route with project ID and user token;
describe("Get Dashboard Data 1", () => {
  it("Request Basic Event Infomation with project ID and user token", async (done) => {
    const res = await request(server)
      .post("/api/project/overview")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: PROJECTID,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("data");
    done();
  });
});

// @Test '/api/project/overview' route with project ID and Invaild user token;
describe("Get Dashboard Data 2", () => {
  it("Request Basic Event Infomation with project ID and error user token", async (done) => {
    const loginResult = await request(server)
      .post("/api/login")
      .send({ email: "test2@gmail.com", password: PASS });
    const res = await request(server)
      .post("/api/project/overview")
      .set("authorization", `${loginResult.body.token}`)
      .send({
        projectid: PROJECTID,
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      errmsg: "User ID not match",
    });
    done();
  });
});

// @Test '/api/project/overview' route with project ID only;
describe("Get Dashboard Data 3", () => {
  it("Request Basic Event Infomation with project ID only", async (done) => {
    const res = await request(server).post("/api/project/overview").send({
      projectid: PROJECTID,
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({ error: "Forbidden" });
    done();
  });
});

// ===================================================================================================================================================================================

// @Test '/api/totalUserAccess' route with with project ID and user token;
describe("API Get Participants 1", () => {
  it("Request Total Num of Participants", async (done) => {
    const res = await request(server)
      .post("/api/totalUserAccess")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: PROJECTID,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("data");
    done();
  });
});

// @Test '/api/totalUserAccess' route with project ID only;
describe("API Get Participants 2", () => {
  it("Request Total Num of Participants with project ID only", async (done) => {
    const res = await request(server).post("/api/totalUserAccess").send({
      projectid: PROJECTID,
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({ error: "Forbidden" });
    done();
  });
});

// @Test '/api/totalUserAccess' route with project ID and Invaild Token;
describe("API Get Participants 3", () => {
  it("Request Total Num of Participants with project ID and Invaild Token", async (done) => {
    const res = await request(server)
      .post("/api/totalUserAccess")
      .set("authorization", `${INVAILDTOKEN}`)
      .send({
        projectid: PROJECTID,
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({
      error: "Forbidden",
      msg: "projectid and user id not match",
    });
    done();
  });
});

// @Test '/api/totalUserAccess' route with invaild project ID and user token;
describe("API Get Participants 4", () => {
  it("Request Total Num of Participants", async (done) => {
    const res = await request(server)
      .post("/api/totalUserAccess")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: "PROJECTID",
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({
      error: "Forbidden",
      msg: "projectid and user id not match",
    });
    done();
  });
});

// ===================================================================================================================================================================================

// @Test '/api/updateEventInfo' route create basic event information;
// describe("Create Basic Event Info", () => {
//   it("Create Basic Event Information ", async (done) => {
//     const res = await request(server)
//       .post("/api/updateEventInfo")
//       .set("authorization", `${TOKEN}`)
//       .send({
//         projectid: PROJECTID,
//         endDate: `2021-07-21`,
//         eventAuthor: `Jolin Tsai`,
//         eventLocation: `Starbuck Feng Chia`,
//         eventName: `StarBucks Coffee`,
//         event_deatils: `Enjoy buy one Free one`,
//         startDate: `2021-07-20`,
//       });
//     expect(res.statusCode).toEqual(201);
//     expect(res.body).toEqual({
//       msg: "Update Basic Information and Event Date Successfully",
//     });
//     done();
//   });
// });

// @Test '/api/updateEventInfo' route update information only;
// describe("Update Basic Event Info 1", () => {
//   it("Update Basic Event Information", async (done) => {
//     const res = await request(server)
//       .post("/api/updateEventInfo")
//       .set("authorization", `${TOKEN}`)
//       .send({
//         projectid: PROJECTID,
//         endDate: `2021-07-21`,
//         eventAuthor: `David Tsai`,
//         eventLocation: `Carrefoure`,
//         eventName: `StarBucks Coffee`,
//         event_deatils: `Enjoy buy two Free one`,
//         startDate: `2021-07-20`,
//       });
//     expect(res.statusCode).toEqual(202);
//     expect(res.body).toEqual({
//       msg: "Update Basic Information Successfully",
//     });
//     done();
//   });
// });

// @Test '/api/updateEventInfo' route start date and end date are greater than 7 days;
// describe("Update Basic Event Info 2", () => {
//   it("Start Date and End Date are greater than 7 days", async (done) => {
//     const res = await request(server)
//       .post("/api/updateEventInfo")
//       .set("authorization", `${TOKEN}`)
//       .send({
//         projectid: PROJECTID,
//         endDate: `2021-07-30`,
//         eventAuthor: `David Tsai`,
//         eventLocation: `Carrefoure`,
//         eventName: `StarBucks Coffee`,
//         event_deatils: `Enjoy buy two Free one`,
//         startDate: `2021-07-20`,
//       });
//     expect(res.statusCode).toEqual(400);
//     expect(res.body).toEqual({
//       errmsg: "Bad request The activity must be within 7 days",
//     });
//     done();
//   });
// });

// @Test '/api/updateEventInfo' route Invaild end days;
describe("Update Basic Event Info 3", () => {
  it("Update Invaild days", async (done) => {
    const res = await request(server)
      .post("/api/updateEventInfo")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: PROJECTID,
        endDate: `2020-07-32`,
        eventAuthor: `David Tsai`,
        eventLocation: `Carrefoure`,
        eventName: `StarBucks Coffee`,
        event_deatils: `Enjoy buy two Free one`,
        startDate: `2020-07-20`,
      });
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty("typeError");
    done();
  });
});

// @Test '/api/updateEventInfo' route Invaild start date;
describe("Update Basic Event Info 4", () => {
  it("Update Invaild days", async (done) => {
    const res = await request(server)
      .post("/api/updateEventInfo")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: PROJECTID,
        endDate: `2020-07-02`,
        eventAuthor: `David Tsai`,
        eventLocation: `Carrefoure`,
        eventName: `StarBucks Coffee`,
        event_deatils: `Enjoy buy two Free one`,
        startDate: `2020-07-00`,
      });
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty("typeError");
    done();
  });
});

// @Test '/api/updateEventInfo' route with no token;
describe("Update Basic Event Info 5", () => {
  it("Update with no token", async (done) => {
    const res = await request(server).post("/api/updateEventInfo").send({
      projectid: PROJECTID,
      endDate: `2020-07-19`,
      eventAuthor: `David Tsai`,
      eventLocation: `Carrefoure`,
      eventName: `StarBucks Coffee`,
      event_deatils: `Enjoy buy two Discount 30%`,
      startDate: `2020-07-18`,
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({ error: "Forbidden" });
    done();
  });
});

// @Test '/api/updateEventInfo' route with no project id;
describe("Update Basic Event Info 6", () => {
  it("Update with no project id", async (done) => {
    const res = await request(server)
      .post("/api/updateEventInfo")
      .set("authorization", `${TOKEN}`)
      .send({
        endDate: `2020-07-31`,
        eventAuthor: `David Tsai`,
        eventLocation: `Carrefoure`,
        eventName: `StarBucks Coffee`,
        event_deatils: `Enjoy buy one Free one`,
        startDate: `2020-07-30`,
      });
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty("typeError");
    done();
  });
});

// @Test '/api/updateEventInfo' route start date and end date is today;
describe("Update Basic Event Info 7", () => {
  it("Update start date and end date is today", async (done) => {
    var new_date = moment();
    var day = new_date.format("DD");
    var month = new_date.format("MM");
    var year = new_date.format("YYYY");
    var today = year + "-" + month + "-" + day;
    const res = await request(server)
      .post("/api/updateEventInfo")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: PROJECTID,
        endDate: `${today}`,
        eventAuthor: `David Tsai`,
        eventLocation: `Carrefoure`,
        eventName: `StarBucks Coffee`,
        event_deatils: `Enjoy buy one Free one`,
        startDate: `${today}`,
      });
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty("typeError");
    done();
  });
});

// @Test '/api/updateEventInfo' route with Invaild Token;
// describe("Update Basic Event Info 8", () => {
//   it("Update Basic Event Information with Invaild Token", async (done) => {
//     const res = await request(server)
//       .post("/api/updateEventInfo")
//       .set("authorization", `${INVAILDTOKEN}`)
//       .send({
//         projectid: PROJECTID,
//         endDate: `2021-07-31`,
//         eventAuthor: `David Tsai`,
//         eventLocation: `Carrefoure`,
//         eventName: `StarBucks Coffee`,
//         event_deatils: `Enjoy buy two Free one`,
//         startDate: `2021-07-30`,
//       });
//     expect(res.statusCode).toEqual(403);
//     expect(res.body).toEqual({
//       error: "Forbidden",
//       msg: "projectid and user id not match",
//     });
//     done();
//   });
// });

// ===================================================================================================================================================================================

// @Test '/api/project/remove' route with correct token, project ID and project name;
describe("Remove Project 1", () => {
  it("Remove Project with correct token, project ID and project name", async (done) => {
    const res = await request(server)
      .post("/api/project/remove")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: PROJECTID,
        projectname: PROJECTNAME,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      msg: "Remove Successfully",
    });
    done();
  });
});

// @Test '/api/project/remove' route with correct project ID and project name but without token;
describe("Remove Project 2", () => {
  it("Remove Project with correct project ID and project name but without token", async (done) => {
    const res = await request(server).post("/api/project/remove").send({
      projectid: PROJECTID,
      projectname: PROJECTNAME,
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({ error: "Forbidden" });
    done();
  });
});

// @Test '/api/project/remove' route with correct project ID and project name but invaild token;
describe("Remove Project 3", () => {
  it("Remove Project with correct project ID and project name but invaild token", async (done) => {
    const res = await request(server)
      .post("/api/project/remove")
      .set("authorization", `${INVAILDTOKEN}`)
      .send({
        projectid: PROJECTID,
        projectname: PROJECTNAME,
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      errmsg: "Parameters Error",
    });
    done();
  });
});

// @Test '/api/project/remove' route with correct token and project name only;
describe("Remove Project 4", () => {
  it("Remove Project with correct token and project name", async (done) => {
    const res = await request(server)
      .post("/api/project/remove")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: "unit",
        projectname: PROJECTNAME,
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      errmsg: "Parameters Error",
    });
    done();
  });
});

// @Test '/api/project/remove' route with correct token and project ID only;
describe("Remove Project 5", () => {
  it("Remove Project with correct token and project ID", async (done) => {
    const res = await request(server)
      .post("/api/project/remove")
      .set("authorization", `${TOKEN}`)
      .send({
        projectid: PROJECTID,
        projectname: "REMOVE",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      errmsg: "Parameters Error",
    });
    done();
  });
});

// @Test '/api/project/remove' route with correct token only;
describe("Remove Project 6", () => {
  it("Remove Project with correct token, project ID and project name", async (done) => {
    const res = await request(server)
      .post("/api/project/remove")
      .set("authorization", `${TOKEN}`)
      .send();
    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty("typeError");
    done();
  });
});

afterAll(async (done) => {
  TOKEN = "";
  INVAILDTOKEN = "";
  done();
});
