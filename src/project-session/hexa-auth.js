const { decodeJWT, validateJWT, validateJWT_RSA } = require("common");
const {
  getRestData,
  sendRestRequest,
  getRedisData,
  setRedisData,
  redisClient,
} = require("common");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { createJWT, createJWT_RSA } = require("common");
const {
  NotAuthenticatedError,
  ForbiddenError,
  HttpServerError,
} = require("common");

const { getPublicKey } = require("utils");

//
class HexaAuth {
  constructor() {
    this.isEmpty = true;
    this.accessToken = null;
    this.projectName = "mindbricks";
    this.projectCodename = "mindbricks";
    this.isJWT = true;
    this.isJWTAuthRSA = true;
    this.useRemoteSession = false;
    this.sessionUserIdProperty = "userId";
    this.superAdminId = "f7103b85-fcda-4dec-92c6-c336f71fd3a2";
    this.defaultDevUserId = "03d98dcb-1c24-4cca-88c6-0f80167c423a";
    this.rootTenantId = "d26f6763-ee90-4f97-bd8a-c69fabdb4780";
    this.adminGroupId = "3f3b0a4c-1d2e-4b8f-9a5c-7d6e0f1a2b3c";
    this.sessionReadLocation = "readFromSessionStore";
    this.cacheRemoteServiceResponse = false;
    this.remoteSessionWriteInStore = false;
    this.permissionManager = null;
  }

  async checkPermission(permissionName) {
    if (!this.permissionManager) return false;
    return await this.permissionManager.checkPermissionForSession(
      permissionName,
      null,
    );
  }

  async checkObjectPermission(permissionName, objectId) {
    if (!this.permissionManager) return false;
    return await this.permissionManager.checkPermissionForSession(
      permissionName,
      objectId,
    );
  }

  async getPermissions(permissionName, objectId) {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getPermissions(
      permissionName,
      objectId,
    );
  }

  async getRootPermissions(permissionName) {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getRootPermissions(permissionName);
  }

  async getObjectPermissions(permissionName) {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getObjectPermissions(permissionName);
  }

  async getAllowedObjects(permissionName) {
    if (!this.permissionManager) return null;
    return await this.permissionManager.getAllowedObjects(permissionName);
  }

  async getPermissionFilter(permissionName) {
    if (!this.permissionManager) return null;
    return await this.permissionManager.getPermissionFilter(permissionName);
  }

  async getCurrentUserPermissions() {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getCurrentUserPermissions();
  }
  async getCurrentRolePermissions() {
    if (!this.permissionManager) return [];
    return await this.permissionManager.getCurrentRolePermissions();
  }

  readFromContext(name) {
    return this[name];
  }

  readFromSession(name) {
    return this.session ? this.session[name] : null;
  }

  async hasSessionInEntityCache(sessionId) {
    const session = await getRedisData("hexasession:" + sessionId);
    return session ? true : false;
  }

  async setSessionToEntityCache(session, days) {
    const sessionKey = "hexasession:" + session.sessionId;
    const userKey = "hexasessionid:" + session._USERID;
    const userAuthUpdateKey = "hexauserauthupdate:" + session._USERID;
    if (!days) days = 30;
    await setRedisData(sessionKey, session, 60 * 60 * 24 * days);
    await setRedisData(
      userKey,
      session.sessionId.toString(),
      60 * 60 * 24 * days,
    );
    await setRedisData(userAuthUpdateKey, "false", 60 * 60 * 24 * days);
  }

  async getSessionFromEntityCache(sessionId) {
    const session = await getRedisData("hexasession:" + sessionId);

    console.log(
      "Session from EntityCache",
      "hexasession:" + sessionId,
      session?.sessionId,
    );

    if (session) {
      const userAuthUpdateKey = "hexauserauthupdate:" + session._USERID;
      const userAuthUpdate = await getRedisData(userAuthUpdateKey);
      session.userAuthUpdate = userAuthUpdate;
    }

    return session;
  }

  async getValidationCache(hash) {
    const tokenData = await getRedisData("tokenValidation:" + hash);
    return tokenData;
  }

  async setValidationCache(hash, tokenData) {
    const key = "tokenValidation:" + hash;
    await setRedisData(key, JSON.stringify(tokenData), 60 * 60 * 24);
  }

  async createPermissionManager() {
    // implement this in project auth if the project has PBAC
    // Create a permission manager specific to your project derived from HexaPermissionManager
  }

  async readTenantIdFromRequest(request) {
    // implement this in project auth if the project is multi tenant
    // read the tenantId from header
  }

  async setServiceSession(request) {
    if (!this.session) {
      return {};
    }

    await this.createPermissionManager(this);
  }

  userHasRole(roleName) {
    // override this method with your role settings if the project has RBAC
    return false;
  }

  getBearerToken(req) {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    if (authHeader) {
      const authParts = authHeader.split(" ");
      if (authParts.length === 2) {
        if (authParts[0] === "Bearer" || authParts[0] === "bearer") {
          const bearerToken = authParts[1];
          if (bearerToken && bearerToken !== "null") return bearerToken;
        }
      }
    }
    return null;
  }

  getCookieToken(cookieName, req) {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const tokenCookie = cookies.find((cookie) => {
        return cookie.startsWith(cookieName + "=");
      });

      if (tokenCookie) {
        return tokenCookie.split("=")[1];
      }
    }
  }

  async checkTokenLocations(req) {
    // implement this in project auth with the project token locations
    return [];
  }

  async extractSessionToken(req) {
    let sessionToken = null;
    let isTestToken = false;
    let tokenLoc = null;
    let tokenName = null;

    // check if there is any internal token attached by other internal authorized services
    sessionToken = req.internalAccessToken;
    if (sessionToken) {
      this.accessToken = sessionToken;
      this.tokenLocation = "internal";
      this.tokenName = this.projectCodename + "-internal-access-token";
      console.log("Internal Token extracted:", this.tokenName);
    }
    if (sessionToken) return [sessionToken, isTestToken];

    [sessionToken, isTestToken, tokenLoc, tokenName] =
      await this.checkTokenLocations(req);

    if (sessionToken) {
      this.accessToken = sessionToken;
      this.tokenLocation = tokenLoc;
      this.tokenName = tokenName;
    }

    if (sessionToken) return [sessionToken, isTestToken];

    // check bearer in case there is no token found in the locations
    sessionToken = this.getBearerToken(req);
    if (sessionToken) {
      this.accessToken = sessionToken;
      this.tokenLocation = "bearer";
      this.tokenName = "";
      console.log("Token extracted:", this.tokenLocation, sessionToken);
    }
    if (sessionToken) return [sessionToken, isTestToken];

    // check if there is any test token
    sessionToken = this.getCookieToken(
      this.projectCodename + "-test-token",
      req,
    );
    if (sessionToken) {
      isTestToken = true;
      this.accessToken = sessionToken;
      this.tokenLocation = "cookie";
      this.tokenName = this.projectCodename + "-test-token";
      console.log(
        "Test Token extracted:",
        this.tokenLocation,
        this.tokenName,
        sessionToken,
      );
    }
    if (sessionToken) return [sessionToken, isTestToken];

    // no token found
    return [null, false];
  }

  async createTokenFromSession(session, isTest) {
    const tokenMark = this.projectCodename + "-inapp-token";

    const payload = {
      tokenMark: tokenMark,
      keyId: global.currentKeyId,
      tokenName:
        this.projectCodename + (isTest ? "-test" : "-access") + "-token",
      sessionId: session.sessionId,
      userId: session._USERID,
      sub: session._USERID,
      loginDate: session.loginDate,
    };

    let token = null;

    const keysFolder = process.env.KEYS_FOLDER ?? "keys";
    const keyPath = path.join(
      __dirname,
      "../../",
      keysFolder,
      "rsa.key." + global.currentKeyId,
    );
    console.log("Key Path", keyPath);
    const privateKey = fs.existsSync(keyPath)
      ? fs.readFileSync(keyPath, "utf8")
      : null;

    if (privateKey) {
      const passphrase = process.env.RSA_PASS_PHRASE ?? "";
      try {
        token = await createJWT_RSA(
          payload,
          privateKey,
          passphrase,
          session.isAbsolute ? null : "30d",
        );
        console.log("Token created for session", token);
        return token;
      } catch (e) {
        console.log("Error creating JWT token", e);
        throw new HttpServerError("errMsg_ErrorCreateingToken");
      }
    } else {
      throw new HttpServerError("errMsg_PrivateKeyNotFound");
    }
  }

  async verifyJWTAccessToken(token, isTest) {
    const tokenMark = this.projectCodename + "-inapp-token";

    const decoded = jwt.decode(token);
    if (!decoded) {
      return null;
    }

    if (decoded.tokenMark !== tokenMark) {
      // token is not a local app token,
      // return null for other authentication methods
      return null;
    }

    let tokenData = null;
    const keyId = decoded.keyId ?? "dev";

    const keysFolder = process.env.KEYS_FOLDER ?? "keys";

    const keyPath = path.join(
      __dirname,
      "../../" + keysFolder + "/rsa.key.pub." + keyId,
    );
    let publicKey = fs.existsSync(keyPath)
      ? fs.readFileSync(keyPath, "utf8")
      : null;

    if (!publicKey) {
      publicKey = await getPublicKey(keyId);
      if (
        publicKey &&
        publicKey.keyData &&
        publicKey.keyData.startsWith("-----BEGIN PUBLIC KEY-----")
      ) {
        publicKey = publicKey.keyData;
      }
    }

    if (publicKey) {
      tokenData = await validateJWT_RSA(token, publicKey);
      if (tokenData) {
        console.log("Token is verified with keyId", keyId);
      }
    }

    return tokenData;
  }

  async verifySessionToken(req, res, next) {
    try {
      await this.readTenantIdFromRequest(req);
      await this.buildSessionFromRequest(req);
      if (!this.useRemoteSession) {
        // if the session is a local session, check it for invalidation
        if (this.session && this.session.userAuthUpdate) {
          return next(
            new NotAuthenticatedError(
              "errMsg_UserAuthConfigUpdatedReloginNeeded",
            ),
          );
        }
      }

      next();
    } catch (err) {
      if (res) next(new NotAuthenticatedError(err.message));
      else throw err;
    }
  }

  async setRemoteServiceVerificationRequest(accessToken) {
    // implement this in project auth if the project has remote service verification
    return {
      bearer: accessToken,
    };
  }

  async verifyAccessTokenByService(accessToken) {
    const remoteServiceVerificationRequest =
      await this.setRemoteServiceVerificationRequest(accessToken);

    const request = remoteServiceVerificationRequest;

    if (this.cacheRemoteServiceResponse) {
      const requestHash = crypto
        .createHash("sha1")
        .update(JSON.stringify(request))
        .digest("hex");

      const verifiedDataCache = await this.getValidationCache(requestHash);
      if (verifiedDataCache) return verifiedDataCache;
    }

    const verifiedData = await sendRestRequest(
      request.verifyUrl,
      request.bearer,
      request.headers,
      request.cookies,
      request.body,
      request.query,
      request.method,
      null,
    );
    if (this.cacheRemoteServiceResponse) {
      await this.setValidationCache(requestHash, verifiedData);
    }
    return verifiedData;
  }

  async setRemoteSessionRequest() {
    return {};
  }

  async getRemoteSession(accessToken, tokenData) {
    const remoteSessionRequest = await this.setRemoteSessionRequest(
      accessToken,
      tokenData,
    );

    if (this.remoteSessionWriteInStore) {
      const sessionId = tokenData?.sessionId;

      const remoteSession = sessionId
        ? await this.getSessionFromEntityCache(sessionId)
        : null;
      if (remoteSession) {
        return remoteSession;
      }
    }

    const remoteSession = await sendRestRequest(
      request.verifyUrl,
      request.bearer,
      request.headers,
      request.cookies,
      request.body,
      request.query,
      request.method,
      null,
    );

    remoteSession = this.normalizeRemoteSessionData(remoteSession);

    if (this.remoteSessionWriteInStore) {
      await this.setSessionToEntityCache(remoteSession, 1);
    }

    return remoteSession;
  }

  async normalizeRemoteSessionData(remoteSessionData) {
    return remoteSessionData;
  }

  async checkTenantMatch(session) {
    if (this.tenantId) {
      if (session[this.tenantId] !== this["_" + this.tenantId]) {
        throw new NotAuthenticatedError("errMsg_TenantMismatch");
      }
    }
  }

  async buildSessionFromRequest(req) {
    if (
      this.sessionReadLocation === "readFromRemoteService" &&
      !this.useRemoteSession
    )
      this.sessionReadLocation = "readFromSessionStore";

    const [accessToken, isTestToken] = await this.extractSessionToken(req);

    if (accessToken) {
      let tokenData = null;

      if (this.isJWT) {
        tokenData = await this.verifyJWTAccessToken(accessToken, isTestToken);
      }

      if (!tokenData && this.isRemoteAuth) {
        tokenData = await this.verifyAccessTokenByService(accessToken);
      }

      if (!tokenData) {
        throw new NotAuthenticatedError("errMsg_InvalidToken");
      }

      if (this.sessionReadLocation == "tokenIsSession") {
        req.session = tokenData;
        req.sessionId = tokenData.sessionId;
        this.session = req.session;
        this.sessionId = req.sessionId;
        await this.setServiceSession(req);
        req.auth = this;
      }

      if (this.sessionReadLocation == "readFromSessionStore") {
        const sessionId = tokenData.sessionId;
        const session = await this.getSessionFromEntityCache(sessionId);
        if (session) {
          req.session = session;
          req.sessionId = sessionId;
          this.session = req.session;
          this.sessionId = req.sessionId;
          await this.setServiceSession(req);
          req.auth = this;
        } else {
          console.log("Session not found in store for", sessionId);
        }
      }

      if (this.sessionReadLocation == "readFromRemoteService") {
        const remoteSession = await this.getRemoteSession(
          accessToken,
          tokenData,
        );
        if (remoteSession) {
          req.session = remoteSession;
          this.session = req.session;
          this.sessionId = remoteSession.sessionId;
          await this.setServiceSession(req);
          req.auth = this;
        }
      }

      if (req.session) {
        await this.checkTenantMatch(req.session);
      }

      if (req.session) return;

      // the request comes from an event with a user session attached
      if (req.internalSessionId) {
        console.log("Internal Session Id found ->", req.internalSessionId);
        const session = await this.getSessionFromEntityCache(
          req.internalSessionId,
        );
        if (session) {
          console.log(
            "Session found in store",
            session.sessionId ?? session.id,
          );
          req.session = session;
          req.sessionId = req.internalSessionId;
          this.session = req.session;
          this.sessionId = req.sessionId;
          await this.setServiceSession(req);
          req.auth = this;
        }
      }
    }
  }
}

module.exports = HexaAuth;
