 import React from "react";
import { Alert, Slide, Snackbar } from "@mui/material";

const ErrorAlert = ({ message, open, onClose, autoHideDuration = 6000 }) => {
  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    if (onClose) onClose();
  };

  return (
    <Snackbar
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={Boolean(open && message)}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
    >
      <Alert
        variant="filled"
        sx={{ width: "100%" }}
        onClose={handleClose}
        severity="error"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export default ErrorAlert;

