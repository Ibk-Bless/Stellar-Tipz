import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";

import PageLoader from "../PageLoader";
import ToastContainer from "../ToastContainer";
import { useToastStore } from "../../../store/toastStore";

describe("Screen reader announcements", () => {
  beforeEach(() => {
    useToastStore.getState().clearAll();
  });

  it("announces toast notifications", async () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast({
        message: "Tip sent!",
        type: "success",
      });
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Tip sent!");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("announces loading state politely", () => {
    render(<PageLoader />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
  });
});
