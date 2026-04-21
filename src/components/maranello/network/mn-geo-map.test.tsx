/**
 * MnGeoMap unit tests.
 *
 * MapLibre GL requires WebGL which happy-dom doesn't provide, so the Map class
 * is mocked. Tests focus on React glue: provider mounting, loader rendering,
 * context errors, and control accessibility labels.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";

// Mock maplibre-gl — return a minimal Map + Marker + Popup shape.
vi.mock("maplibre-gl", () => {
  class MockMap {
    listeners = new Map<string, Array<() => void>>();
    on = vi.fn((event: string, cb: () => void) => {
      const arr = this.listeners.get(event) ?? [];
      arr.push(cb);
      this.listeners.set(event, arr);
    });
    off = vi.fn();
    remove = vi.fn();
    setStyle = vi.fn();
    setProjection = vi.fn();
    getCenter = () => ({ lng: 0, lat: 0 });
    getZoom = () => 1;
    getBearing = () => 0;
    getPitch = () => 0;
    getContainer = () => document.createElement("div");
    isMoving = () => false;
    jumpTo = vi.fn();
    flyTo = vi.fn();
    zoomTo = vi.fn();
    resetNorthPitch = vi.fn();
  }
  class MockMarker {
    el = document.createElement("div");
    setLngLat = vi.fn().mockReturnThis();
    getLngLat = () => ({ lng: 0, lat: 0 });
    setOffset = vi.fn();
    getOffset = () => ({ x: 0, y: 0 });
    setRotation = vi.fn();
    getRotation = () => 0;
    setRotationAlignment = vi.fn();
    getRotationAlignment = () => "auto";
    setPitchAlignment = vi.fn();
    getPitchAlignment = () => "auto";
    setDraggable = vi.fn();
    isDraggable = () => false;
    getElement = () => this.el;
    addTo = vi.fn().mockReturnThis();
    remove = vi.fn();
    setPopup = vi.fn().mockReturnThis();
    on = vi.fn();
  }
  class MockPopup {
    setDOMContent = vi.fn().mockReturnThis();
    setMaxWidth = vi.fn().mockReturnThis();
    setLngLat = vi.fn().mockReturnThis();
    setOffset = vi.fn();
    getLngLat = () => ({ lng: 0, lat: 0 });
    addTo = vi.fn().mockReturnThis();
    on = vi.fn();
    off = vi.fn();
    remove = vi.fn();
    isOpen = () => false;
  }
  const mod = { Map: MockMap, Marker: MockMarker, Popup: MockPopup };
  return { default: mod, ...mod };
});

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));

import { MnGeoMap } from "./mn-geo-map";
import { MnGeoControls } from "./mn-geo-controls";
import { useGeoMap } from "./mn-geo-map.helpers";

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

describe("MnGeoMap", () => {
  it("renders container with region role and aria label", () => {
    render(<MnGeoMap styles={{ light: "style-light", dark: "style-dark" }} />);
    expect(
      screen.getByRole("region", { name: /interactive geographic map/i }),
    ).toBeInTheDocument();
  });

  it("renders loader until map emits load event", () => {
    render(<MnGeoMap styles={{ light: "style-light" }} />);
    expect(screen.getByRole("status", { name: /loading map/i })).toBeInTheDocument();
  });

  it("renders without a style (SSR-safe, no MapLibre init)", () => {
    // When no style is supplied we expect the region to still mount (empty surface).
    render(<MnGeoMap />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });
});

describe("useGeoMap", () => {
  it("throws when used outside MnGeoMap", () => {
    expect(() => renderHook(() => useGeoMap())).toThrow(
      /must be used within an MnGeoMap/i,
    );
  });
});

describe("MnGeoControls", () => {
  it("exposes accessible zoom controls inside a geo map", () => {
    render(
      <MnGeoMap styles={{ light: "style-light" }}>
        <MnGeoControls showZoom showCompass showLocate showFullscreen />
      </MnGeoMap>,
    );
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset bearing/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /find my location/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /toggle fullscreen/i }),
    ).toBeInTheDocument();
  });
});
