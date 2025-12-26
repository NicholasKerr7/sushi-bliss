import "@testing-library/jest-dom";

// When debugging hanging test runs, enable DEBUG_OPEN_HANDLES=1 to log active handles.
if (process.env.DEBUG_OPEN_HANDLES) {
  afterAll(() => {
    const handles = (process as any)._getActiveHandles?.() ?? [];
    // eslint-disable-next-line no-console
    console.log(
      "Active handles",
      handles.map((handle: any) => {
        if (handle?.constructor?.name === "Timeout") {
          return { type: "Timeout", delay: handle._idleTimeout };
        }
        if (handle?.constructor?.name === "Immediate") {
          return { type: "Immediate" };
        }
        if (handle?.constructor?.name === "WriteStream" && handle.path) {
          return { type: "WriteStream", path: handle.path };
        }
        if (handle?.constructor?.name === "Socket") {
          return { type: "Socket", local: handle.localPort, remote: handle.remotePort };
        }
        return { type: handle?.constructor?.name ?? "Unknown" };
      })
    );
  });
}
