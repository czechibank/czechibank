import { Session } from "better-auth";

export default interface CustomSession extends Session {
  name: string;
}
