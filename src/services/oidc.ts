import { Inject, Service } from "typedi";
import { Config } from "./Config.js";

@Service()
export class OIDC {
  @Inject()
  private config!: Config;

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
}
