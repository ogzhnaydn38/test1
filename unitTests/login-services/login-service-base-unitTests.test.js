const { expect } = require("chai");
const sinon = require("sinon");
const { NotFoundError, BadRequestError, ErrorCodes } = require("common");
const { User } = require("models");
const LoginServiceBase = require("../../src/login-services/login-service-base");

describe("LoginServiceBase Service", function () {
  let req, res, next, loginServiceInstance;

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        mobile: "1234567890",
        userId: "user123",
        password: "password123",
      },
      session: {},
    };
    res = {
      send: sinon.spy(),
      status: sinon.stub().returns({ json: sinon.spy() }),
    };
    next = sinon.spy();
    loginServiceInstance = new LoginServiceBase(req);
  });

  describe("findUserByEmail", () => {
    it("should throw NotFoundError if the user with the given email is not found", async () => {
      sinon.stub(User, "findOne").resolves(null);

      try {
        await loginServiceInstance.findUserByEmail("notfound@example.com");
        expect.fail("Expected NotFoundError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.equal("errMsg_UserWithGivenEmailNotFound");
      }
    });

    it("should throw NotFoundError if the user is deleted", async () => {
      sinon.stub(User, "findOne").resolves({ isActive: false });

      try {
        await loginServiceInstance.findUserByEmail("deleted@example.com");
        expect.fail("Expected NotFoundError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.equal("errMsg_UserWithGivenEmailDeleted");
      }
    });

    it("should return the user if found and active", async () => {
      sinon
        .stub(User, "findOne")
        .resolves({ id: "user123", email: "test@example.com", isActive: true });

      const user =
        await loginServiceInstance.findUserByEmail("test@example.com");

      expect(user).to.have.property("id", "user123");
      expect(user).to.have.property("email", "test@example.com");
    });
  });

  describe("findUserByMobile", () => {
    it("should throw NotFoundError if the user with the given mobile is not found", async () => {
      sinon.stub(User, "findOne").resolves(null);

      try {
        await loginServiceInstance.findUserByMobile("9999999999");
        expect.fail("Expected NotFoundError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.equal("errMsg_UserWithGivenMobileNotFound");
      }
    });

    it("should throw NotFoundError if the user is deleted", async () => {
      sinon.stub(User, "findOne").resolves({ isActive: false });

      try {
        await loginServiceInstance.findUserByMobile("1234567890");
        expect.fail("Expected NotFoundError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.equal("errMsg_UserWithGivenMobileDeleted");
      }
    });

    it("should return the user if found and active", async () => {
      sinon
        .stub(User, "findOne")
        .resolves({ id: "user123", mobile: "1234567890", isActive: true });

      const user = await loginServiceInstance.findUserByMobile("1234567890");

      expect(user).to.have.property("id", "user123");
      expect(user).to.have.property("mobile", "1234567890");
    });
  });

  describe("dbVerifyEmail", () => {
    it("should throw BadRequestError if the email is already verified", async () => {
      sinon
        .stub(loginServiceInstance, "findUserById")
        .resolves({ emailVerified: true });

      try {
        await loginServiceInstance.dbVerifyEmail("user123");
        expect.fail("Expected BadRequestError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(BadRequestError);
        expect(err.message).to.equal("errMsg_UserEmailAlreadyVerified");
      }
    });

    it("should successfully update the user to emailVerified", async () => {
      sinon
        .stub(loginServiceInstance, "findUserById")
        .resolves({ emailVerified: false });
      sinon
        .stub(loginServiceInstance, "updateDb")
        .resolves([{ id: "user123", emailVerified: true }]);

      const result = await loginServiceInstance.dbVerifyEmail("user123");

      expect(result[0]).to.have.property("emailVerified", true);
    });
  });

  describe("dbVerifyMobile", () => {
    it("should throw BadRequestError if the mobile is already verified", async () => {
      sinon
        .stub(loginServiceInstance, "findUserById")
        .resolves({ mobileVerified: true });

      try {
        await loginServiceInstance.dbVerifyMobile("user123");
        expect.fail("Expected BadRequestError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(BadRequestError);
        expect(err.message).to.equal("errMsg_UserMobileAlreadyVerified");
      }
    });

    it("should successfully update the user to mobileVerified", async () => {
      sinon
        .stub(loginServiceInstance, "findUserById")
        .resolves({ mobileVerified: false });
      sinon
        .stub(loginServiceInstance, "updateDb")
        .resolves([{ id: "user123", mobileVerified: true }]);

      const result = await loginServiceInstance.dbVerifyMobile("user123");

      expect(result[0]).to.have.property("mobileVerified", true);
    });
  });

  describe("generateToken", () => {
    it("should generate a token for a valid user", async () => {
      const user = { id: "user123", email: "test@example.com" };
      const token = await loginServiceInstance.generateToken(user);

      expect(token).to.be.a("string");
    });
  });

  describe("hashPassword", () => {
    it("should hash the password", async () => {
      const hashedPassword =
        await loginServiceInstance.hashPassword("password123");

      expect(hashedPassword).to.be.a("string");
      expect(hashedPassword).to.not.equal("password123");
    });
  });

  describe("comparePassword", () => {
    it("should return true if the password matches the hashed password", async () => {
      const hashedPassword =
        await loginServiceInstance.hashPassword("password123");

      const result = await loginServiceInstance.comparePassword(
        "password123",
        hashedPassword,
      );

      expect(result).to.be.true;
    });

    it("should return false if the password does not match the hashed password", async () => {
      const hashedPassword =
        await loginServiceInstance.hashPassword("password123");

      const result = await loginServiceInstance.comparePassword(
        "wrongpassword",
        hashedPassword,
      );

      expect(result).to.be.false;
    });
  });

  describe("createHexCode", () => {
    it("should create a valid hex code", () => {
      const code = loginServiceInstance.createHexCode();

      expect(code).to.be.a("string");
      expect(code).to.have.lengthOf(32); // since it's based on v4 UUID
    });
  });
});
