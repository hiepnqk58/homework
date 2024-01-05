const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const xss = require("xss-clean");
const compression = require("compression");
const bodyParser = require("body-parser");
const env = require("../configs/env");
const {
  errorConverter,
  errorHandler,
} = require("../middlewares/error.middleware");
const scriptSources = ["'unsafe-eval'", "'unsafe-inline'", "'self'"];
// const { customizeLimiter } = require("../middlewares/rate-limit");
const routeConfig = require("../app/routes");

module.exports = () => {
  const app = express();

  // set log request
  app.use(morgan("dev"));

  // set security HTTP headers
  if (env.isProduction) {
    app.use(helmet());
  } else {
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          scriptSrc: scriptSources,
        },
      })
    );
  }

  // parse json request body
  // app.use(express.json());

  // parse urlencoded request body
  // app.use(express.urlencoded({limit: '1000mb', extended: true }));
  app.use(express.json({ limit: "1000mb" }));
  app.use(bodyParser.json({ limit: "1000mb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "1000mb",
      extended: true,
      parameterLimit: 1000000,
    })
  );
  // sanitize request data
  app.use(xss());
  app.use(mongoSanitize());

  // gzip compression
  app.use(
    compression({
      level: 6,
      threshold: 10 * 1000,
      filter: (req, res) => {
        if (req.headers["x-no-compress"]) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );

  // set cors blocked resources
  app.use(cors());
  app.options("*", cors());

  // setup limits
  if (env.isProduction) {
    // app.use('/v1/auth', customizeLimiter)
  }

  // api routes
  app.use(env.app.routePrefix, routeConfig);

  // convert error to ApiError, if needed
  app.use(errorConverter);

  // handle error
  app.use(errorHandler);

  return app;
};
