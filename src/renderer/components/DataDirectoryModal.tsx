import React from "react";
import { Button } from "./shared/Button";

export function DataDirectoryModal() {
  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-content box">
        <div className="is-flex is-flex-direction-column is-align-items-center">
          <h1 className="is-size-2">Welcome!</h1>
          <p className="mb-3">
            Please select where you'd like to save your notes to get started
          </p>

          <Button
            color="is-success"
            onClick={() => window.ipc("config.selectDataDirectory")}
          >
            Select a directory
          </Button>
        </div>
      </div>
    </div>
  );
}
