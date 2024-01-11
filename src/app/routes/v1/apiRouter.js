const express = require("express");

// const dashboardRoute = require("./dashboardsRouter");
const userRoute = require("./usersRouter");
const eventRoute = require("./eventsRouter");
const dbRoute = require("./dbRouter");
const agentRoute = require("./agentsRouter");
const authRoute = require("./authRouter");
// const settingRoute = require("./settingsRouter");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/agents",
    route: agentRoute,
  },
  {
    path: "/events",
    route: eventRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/dbs",
    route: dbRoute,
  },
  // {
  //   path: "/settings",
  //   route: settingRoute,
  // },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
