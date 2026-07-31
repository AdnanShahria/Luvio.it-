import type { Env } from '../types';

export class ChatRoom {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    return new Response("ChatRoom DO not implemented yet", { status: 501 });
  }
}
