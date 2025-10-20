import { onError } from "@apollo/client/link/error";
import { toast } from "react-toastify";
import { authToken, authStatusVar, userObj } from "./cache";

/**
 * Apollo error link that handles authentication errors and network errors.
 *
 * For 401/403 errors:
 * - Switches to ANONYMOUS mode (allows browsing public content)
 * - Shows a toast notification with option to log back in
 * - Clears auth token and user object
 *
 * For other GraphQL errors:
 * - Logs to console for debugging
 *
 * For network errors:
 * - Shows a toast notification
 */
export const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const statusCode =
          err.extensions?.code ||
          err.extensions?.status ||
          err.extensions?.statusCode;

        // Handle authentication errors (401/403)
        if (
          statusCode === 401 ||
          statusCode === 403 ||
          statusCode === "UNAUTHENTICATED" ||
          err.message?.toLowerCase().includes("unauthorized") ||
          err.message?.toLowerCase().includes("not authenticated")
        ) {
          console.error(
            "[Apollo Error Link] Authentication error detected:",
            err
          );

          // Switch to anonymous mode - allows user to browse public content
          // without forcing an immediate re-login
          authToken("");
          userObj(null);
          authStatusVar("ANONYMOUS");

          // Show user-friendly message with guidance
          toast.warning(
            "Your session has expired. Please log in again to access protected content.",
            {
              toastId: "auth-error", // Prevent duplicate toasts
              autoClose: 8000,
            }
          );

          return;
        }

        // Log other GraphQL errors for debugging
        console.error(
          `[GraphQL Error] Message: ${err.message}, Location: ${JSON.stringify(
            err.locations
          )}, Path: ${err.path}`,
          err
        );
      }
    }

    if (networkError) {
      const netErr = networkError as any;

      // Handle network-level authentication errors
      if (netErr.statusCode === 401 || netErr.statusCode === 403) {
        console.error("[Apollo Error Link] Network auth error:", networkError);

        // Switch to anonymous mode - allows user to browse public content
        authToken("");
        userObj(null);
        authStatusVar("ANONYMOUS");

        toast.warning(
          "Your session has expired. Please log in again to access protected content.",
          {
            toastId: "auth-error",
            autoClose: 8000,
          }
        );

        return;
      }

      // Log other network errors
      console.error(`[Network Error]: ${networkError}`, networkError);

      // Show user-friendly network error message
      toast.error(
        "Network error. Please check your connection and try again.",
        {
          toastId: "network-error",
          autoClose: 5000,
        }
      );
    }
  }
);
