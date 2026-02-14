import { useState } from "react";

export default function useJoinDialog() {
  const [openJoinDialog, setOpenJoinDialog] = useState<boolean>(false);
  const [dialogCode, setDialogCode] = useState<string>("");
  return { openJoinDialog, setOpenJoinDialog, dialogCode, setDialogCode };
}
