const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "tickatme - test1",
    brand: {
      name: "tickatme",
      image: "https://mindbricks.com/images/logo-light.svg",
      moduleName: "bff",
    },
    auth: {
      url: authUrl,
    },
    dataObjects: [],
  };

  inject(app, config);
};
