import { Inject, Service } from "typedi";
import { Config } from "./Config.js";
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { AuthenticationService } from "./AuthenticationService.js";
import { UserService } from "./UserService.js";

@Service()
export class OIDC {
  @Inject()
  private config!: Config;

  @Inject()
  private authenticationService!: AuthenticationService;

  @Inject()
  private userService!: UserService;

  private jwksClient: JwksClient;

  constructor() {
    this.jwksClient = new JwksClient({
      jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys",
    });
  }

  generateLoginUrl(attemptId: number, nonce: string): string {
    // https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc

    const url = new URL(
      "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize"
    );
    const params = url.searchParams;
    params.append("client_id", this.config.getOIDCClientId());
    params.append("response_type", "id_token");
    params.append("redirect_uri", `${this.config.getPublicUrl()}/auth/oidc`);
    params.append("response_mode", "form_post");
    params.append("scope", "openid+email+profile");
    params.append("state", attemptId.toString());
    params.append("nonce", nonce);
    params.append("domain_hint", this.config.getUserDomain());
    // https://github.com/nodejs/node/issues/33037
    // URLSearchParams escapes all characters, including the plus sign, which M$'s OIDC doesn't like
    return url.toString().replace(/%2B/g, "+");
  }

  getKey(header: JwtHeader, callback: SigningKeyCallback) {
    this.jwksClient.getSigningKey(header.kid, (err, key) => {
      const signingKey = key?.getPublicKey();
      callback(err, signingKey);
    });
  }

  private verify(idToken: string): Promise<JwtPayload | string> {
    return new Promise((resolve, reject) => {
      jwt.verify(idToken, this.getKey.bind(this), (err, decoded) => {
        if (err || !decoded) reject(err);
        else resolve(decoded);
      });
    });
  }

  async postToken(idToken: string, attemptId: number) {
    const decoded = await this.verify(idToken);
    if (!decoded || typeof decoded === "string")
      throw new Error("Invalid token");
    if (decoded.aud !== this.config.getOIDCClientId())
      throw new Error("Client ID doesn't match");
    const discordId = await this.authenticationService.updateAttempt(
      attemptId,
      decoded.nonce,
      idToken
    );
    if (!discordId) throw new Error("Invalid state/nonce combination");
    await this.userService.insertUser(
      decoded.email,
      discordId,
      decoded.name,
      decoded.sub
    );
    // TODO: Add verified role
  }
}
