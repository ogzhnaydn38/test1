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
      moduleName: "test1",
    },
    auth: {
      url: authUrl,
    },
    dataObjects: [
      {
        name: "Test",
        description: "",
        reference: {
          tableName: "test",
          properties: [
            {
              name: "name",
              type: "String",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/tests/{testId}",
            title: "getTest",
            query: [],
            body: {
              type: "json",
              content: {},
            },
            parameters: [
              {
                key: "testId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/usertests/{testId}",
            title: "getUserTest",
            query: [],
            body: {
              type: "json",
              content: {},
            },
            parameters: [
              {
                key: "testId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },
        ],
      },

      {
        name: "Testmember",
        description: "",
        reference: {
          tableName: "testmember",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "objectId",
              type: "ID",
            },

            {
              name: "roleName",
              type: "String",
            },

            {
              name: "suspended",
              type: "Boolean",
            },
          ],
        },
        endpoints: [],
      },
    ],
  };

  inject(app, config);
};
