const { NotAuthenticatedError, ForbiddenError } = require("common");
const { hexaLogger } = require("common");
const HexaAuth = require("./hexa-auth");

const TickatmePermissions = require("./tickatme-permissions");

class TickatmeSession extends HexaAuth {
  constructor() {
    super();
    this.ROLES = {
      superAdmin: "superAdmin",
      tenantAdmin: "tenantAdmin",
      tenantUser: "tenantUser",
      saasAdmin: "saasAdmin",
      saasUser: "saasUser",
      admin: "admin",
      user: "user",
      userManager: "userManager",
    };

    this.projectName = "tickatme";
    this.projectCodename = "tickatme";
    this.isJWT = true;
    this.isJWTAuthRSA = true;
    this.isRemoteAuth = false;
    this.useRemoteSession = false;
  }

  async createPermissionManager() {
    this.permissionManager = new TickatmePermissions(this);
  }

  async readTenantIdFromRequest(request) {}

  userHasRole(roleName) {
    const userRoleInSession = this.session?.roleId;
    if (!userRoleInSession) return false;
    return Array.isArray(userRoleInSession)
      ? userRoleInSession.includes(roleName)
      : userRoleInSession == roleName;
  }

  async checkTokenLocations(req) {
    // implement this in project auth with the project token locations
    let sessionToken;

    sessionToken = req.query["access_token"];
    if (sessionToken) {
      console.log("Token extracted:", "query", "access_token");
      return [sessionToken, false, "query", "access_token"];
    }

    sessionToken = this.getBearerToken(req);
    if (sessionToken) {
      console.log("Token extracted:", "bearer");
      return [sessionToken, false, "bearer"];
    }

    // check if there is any header of the application
    sessionToken = req.headers["tickatme-access-token"];
    if (sessionToken) {
      console.log("Token extracted:", "header", "tickatme-access-token");
      return [sessionToken, false, "header", "tickatme-access-token"];
    }

    sessionToken = this.getCookieToken("tickatme-access-token", req);
    if (sessionToken) {
      console.log("Token extracted:", "cookie", "tickatme-access-token");
      this.currentCookieName = "tickatme-access-token";
      console.log("Cookie name:", this.currentCookieName);
      return [sessionToken, false, "cookie", "tickatme-access-token"];
    }

    return [];
  }
}

module.exports = TickatmeSession;
