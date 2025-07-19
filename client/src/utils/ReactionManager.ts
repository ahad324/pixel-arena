import { socketService } from "@services/socketService";
import type { SendReactionPayload, ReceiveReactionPayload } from "../types";

type ReactionCallback = (emoji: string) => void;

class ReactionManager {
  private static callback: ReactionCallback | null = null;

  static send(emoji: string) {
    const payload: SendReactionPayload = { emoji };
    socketService.getSocket()?.emit("send-reaction", payload);
  }

  static onReceive(callback: ReactionCallback) {
    this.offReceive(); // ensure no duplicates
    this.callback = callback;
    socketService.getSocket()?.on("receive-reaction", (data: ReceiveReactionPayload) => {
      this.callback?.(data.emoji);
    });
  }

  static offReceive() {
    socketService.getSocket()?.off("receive-reaction");
    this.callback = null;
  }
}

export default ReactionManager;
