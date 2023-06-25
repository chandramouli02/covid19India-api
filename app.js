const express = require("express");
app = express();
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
//initialization of db&server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server listening in: http://localhost:3001/");
    });
  } catch (e) {
    console.log(e.message);
  }
};

initializeDBAndServer();

//api1 get states details..
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    select state_id as stateId, state_name as stateName, population from state
    ;`;
  const dbResponse = await db.all(getStatesQuery);
  console.log(dbResponse);
  response.send(dbResponse);
});

//api2
app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `
    select state_id as stateId, state_name as stateName, population from state
    where state_id = ${stateId};`;
  const dbResponse = await db.get(getStatesQuery);
  response.send(dbResponse);
});

//api3 adds districts
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
  insert into district ('district_name', 'state_id', 'cases', 'cured', 'active', 'deaths')
    values (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths});`;
  await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});

//api4 gets district by id
app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictByIdQuery = `
    select district_id as districtId, district_name as districtName, state_id as stateId, cases, cured, active, deaths from district
  where district_id = ${districtId};`;
  const dbResponse = await db.all(getDistrictByIdQuery);
  //console.log(dbResponse);
  response.send(dbResponse[0]);
});

//api5 delete district by id
app.delete("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictByIdQuery = `
    delete from district
  where district_id = ${districtId};`;
  const dbResponse = await db.all(deleteDistrictByIdQuery);
  console.log(dbResponse.lastId);
  response.send("District Removed");
});

//api6 update district details by id
app.put("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictByIdQuery = `
  update district
  set 
      district_name = '${districtName}',
      state_id = ${stateId},
      cases = ${cases},
      cured = ${cured},
      active = ${active},
      deaths = ${deaths}
  where district_id = ${districtId};`;
  await db.run(updateDistrictByIdQuery);
  response.send("District Details Updated");
});

//api7 get stateStatus by state_id
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `
    select cases as totalCases, cured as totalCured, active as totalActive, deaths as totalDeaths from state 
    cross join district on district.state_id = state.state_id
    where state_id = ${stateId};
    `;
  const dbResponse = await db.all(getStatesQuery);
  console.log(dbResponse);
  response.send(dbResponse[0]);
});

//api8 selects statename based on districtId
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictByIdQuery = `
    select state_name as stateName from district 
    left join state on district.state_id = state.state_id
    where district_id = ${districtId};`;
  const dbResponse = await db.all(getDistrictByIdQuery);
  //console.log(dbResponse);
  response.send(dbResponse[0]);
});

module.exports = app;
