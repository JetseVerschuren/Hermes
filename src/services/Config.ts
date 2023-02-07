import { Service } from "typedi";

@Service()
export class Config {
  getCanvasToken(): string {
    return "";
  }

  getOIDCClientId(): string {
    return "dda0ddea-fb54-4cdc-b2e6-7296b59b21af";
  }

  getPublicUrl(): string {
    return "http://localhost:3000";
  }

  getUserDomain(): string {
    return "utwente.nl";
  }
}
