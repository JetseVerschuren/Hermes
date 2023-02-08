import { Get, Post, Router } from "@discordx/koa";
import type { Context } from "koa";
import { Inject } from "typedi";
import { OIDC } from "../services/oidc.js";

@Router({ name: "auth" })
export class Auth {
  @Inject()
  private oidc!: OIDC;

  @Get("/auth/test")
  test(context: Context) {
    context.body = "hello world!";
  }

  @Post("/auth/oidc")
  async oidcCallback(context: Context) {
    const { id_token: idToken, state } = context.request.body as any;
    const attemptId = parseInt(state);
    if (!idToken || isNaN(attemptId)) {
      context.body = "Invalid request";
      return;
    }

    try {
      await this.oidc.postToken(idToken, attemptId);
      context.body = "Success! You can close this window now";
    } catch (e) {
      context.body =
        e instanceof Error
          ? e.message
          : "Something went wrong processing the login attempt";
    }
  }
}
