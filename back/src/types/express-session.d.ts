import "express-session";

declare module "express-session" {
  interface SessionData {
    githubOAuthState?: string;
    githubCodeVerifier?: string;
    googleOAuthState?: string;
    googleCodeVerifier?: string;
  }
}