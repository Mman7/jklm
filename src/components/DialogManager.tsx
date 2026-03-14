"use client";

import PlayerChatDialog from "./dialogs/PlayerChatDialog";
import GameSettingsDialog from "./dialogs/GameSettingsDialog";
import NameDialog from "./dialogs/nameDialog";
import JoinDialog from "./dialogs/joinDialog";

export default function DialogManager() {
  return (
    <>
      <PlayerChatDialog />
      <GameSettingsDialog />
      <NameDialog />
      <JoinDialog />
    </>
  );
}
