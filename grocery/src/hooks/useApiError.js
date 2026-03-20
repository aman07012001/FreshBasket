 import { useCallback, useState } from "react";
 import { formatErrorForUI } from '../utils/errorMapper';

export function useApiError(defaultMessage = "Something went wrong. Please try again.") {
  const [errorMessage, setErrorMessage] = useState("");

  const setApiError = useCallback(
    (errorOrMessage) => {
      if (!errorOrMessage) {
        setErrorMessage("");
        return;
      }

      if (typeof errorOrMessage === "string") {
        setErrorMessage(errorOrMessage);
        return;
      }

      if (typeof errorOrMessage === "object" && errorOrMessage.error) {
        const formattedError = formatErrorForUI(errorOrMessage);
        setErrorMessage(formattedError?.message || defaultMessage);
        return;
      }

      setErrorMessage(defaultMessage);
    },
    [defaultMessage]
  );

  const clearError = useCallback(() => {
    setErrorMessage("");
  }, []);

  return {
    errorMessage,
    hasError: Boolean(errorMessage),
    setApiError,
    clearError,
  };
}

