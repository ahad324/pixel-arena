import React from "react";
import type { Player, Room } from "../../types/index";
import { socketService } from "@services/socketService";

const SpyDecodeUI: React.FC<{ room: Room; user: Omit<Player, "socketId"> }> = ({
  room,
  user,
}) => {
  const { gameState } = room;
  const self = room.players.find((p) => p.id === user.id);

  if (gameState.phase === "reveal") {
    const spy = room.players.find((p) => p.isSpy);
    return (
      <div className="bg-indigo-900/40 text-indigo-200 rounded-md p-3 text-center mb-4">
        <h4 className="font-bold">Round Over!</h4>
        <p>
          The correct code was:{" "}
          <span className="font-bold">
            {
              gameState.codes?.find((c) => c.id === gameState.correctCodeId)
                ?.value
            }
          </span>
        </p>
        <p>
          The spy was: <span className="font-bold">{spy?.name}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-900/40 rounded-md p-3 mb-4">
      <h4 className="font-bold text-center text-indigo-200 mb-2">
        {self?.isSpy ? "You are the SPY!" : "Find the correct code!"}
      </h4>
      {self?.isSpy && (
        <p className="text-center text-xs text-yellow-300 mb-2">
          Secret Code:{" "}
          <span className="font-bold tracking-widest">
            {
              gameState.codes?.find((c) => c.id === gameState.correctCodeId)
                ?.value
            }
          </span>
        </p>
      )}

      {gameState.phase === "guessing" && (
        <div className="grid grid-cols-3 gap-2">
          {gameState.codes?.map((code) => (
            <button
              key={code.id}
              onClick={() =>
                socketService.submitGuess(room.id, user.id, code.id)
              }
              disabled={!!self?.guess}
              className={`p-2 rounded font-bold text-white transition-colors ${self?.guess === code.id
                  ? "bg-green-500"
                  : "bg-indigo-600 hover:bg-indigo-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {code.value}
            </button>
          ))}
        </div>
      )}
      {gameState.phase === "signaling" && (
        <p className="text-center text-xs text-indigo-300">
          Signal the code to your allies...
        </p>
      )}
    </div>
  );
};

export default SpyDecodeUI;