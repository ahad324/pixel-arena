import { socketService } from "@services/socketService";

type LegacyReactionCallback = (emoji: string) => void;

interface ReceivedPayload {
  emoji: string;
}

class ChatManager {
  private legacyReactionCallback: LegacyReactionCallback | null = null;
  private isListenerSetup = false;

  private handleReceive = (data: ReceivedPayload) => {
    // This now only handles legacy emoji reactions for the pop-up effect.
    // Real chat messages are received via the 'new-message' event in GameContext.
    this.legacyReactionCallback?.(data.emoji);
  };

  private setupListener() {
    if (this.isListenerSetup) return;
    socketService.getSocket()?.on("receive-reaction", this.handleReceive);
    this.isListenerSetup = true;
  }

  public sendMessage(text: string) {
    if (!text.trim()) return;
    // Emit the new, dedicated event for sending a chat message.
    socketService.sendMessage(text.trim());
  }

  public sendLegacyReaction(emoji: string) {
    const payload = { emoji };
    socketService.getSocket()?.emit("send-reaction", payload);
  }

  public onReceiveLegacyReaction(callback: LegacyReactionCallback) {
    this.legacyReactionCallback = callback;
    this.setupListener();
  }

  public offAll() {
    socketService.getSocket()?.off("receive-reaction", this.handleReceive);
    this.legacyReactionCallback = null;
    this.isListenerSetup = false;
  }
}

const ChatService = new ChatManager();
export default ChatService;
