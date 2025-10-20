import U, { join as M } from "node:path";
import { app as c, screen as g, nativeImage as Fe, Tray as yt, Menu as K, BrowserWindow as Qe, shell as le, nativeTheme as ne, session as Q, ipcMain as pe, desktopCapturer as me, globalShortcut as X, systemPreferences as Ce, protocol as _e, net as bt } from "electron";
import vt from "node:os";
import { PostHog as Tt } from "posthog-node";
import { uuidv7 as Je } from "uuidv7";
import { electronApp as St } from "@electron-toolkit/utils";
import { spawn as fe, execSync as $e, exec as Dt } from "node:child_process";
import { randomUUID as He } from "node:crypto";
import { v4 as Ct } from "uuid";
import { createRouter as At } from "radix3";
import n, { z as N } from "zod";
import { existsSync as Ze, writeFileSync as et, unlinkSync as tt } from "node:fs";
import Et from "electron-updater";
import { EventEmitter as we } from "node:events";
import oe from "@recallai/desktop-sdk";
import _t from "screenshot-desktop";
import { pathToFileURL as Ot } from "node:url";
import { electronAppUniversalProtocolClient as je } from "electron-app-universal-protocol-client";
import It from "node:module";
const sn = import.meta.filename, L = import.meta.dirname, nn = It.createRequire(import.meta.url), k = process.platform === "darwin", A = process.platform === "win32", Oe = process.platform === "linux", y = process.env.NODE_ENV === "development";
process.env.NODE_ENV;
const st = `cluely${y ? "-dev" : ""}`, Rt = () => {
  if (process.platform !== "win32")
    return !1;
  try {
    return vt.version().includes("Windows 10");
  } catch {
    return !1;
  }
}, Mt = 14, Ve = "https://downloads.cluely.com/downloads/", nt = "cluely", T = "Cluely", kt = "isDashboard";
if (y && process.env.PLAYWRIGHT_ENV !== "test") {
  const t = `${nt}-dev`, e = c.getPath("userData");
  c.setPath("userData", U.join(U.dirname(e), t)), console.log(`App userData path: ${c.getPath("userData")}`);
}
let W = { type: "anonymous", randomDistinctId: Je() };
const $ = new Tt("phc_AXG9qwwTAPSJJ68tiYxIujNSztjw0Vm5J6tYpPdxiDh", {
  host: "https://ph.cluely.com",
  // handles uncaught exceptions and unhandled rejections
  enableExceptionAutocapture: !0
});
function Bt(t) {
  W.type === "anonymous" && $?.capture({
    distinctId: t,
    event: "$merge_dangerously",
    properties: {
      alias: W.randomDistinctId
    }
  }), W = { type: "identified", userEmail: t }, $?.identify({ distinctId: t });
}
function Nt() {
  const t = Je();
  W = { type: "anonymous", randomDistinctId: t }, $?.identify({ distinctId: t });
}
function D(...t) {
  console.error(...t);
  const e = t.map(
    (o) => o instanceof Error ? o.message : typeof o == "object" && o !== null ? JSON.stringify(o) : String(o)
  ).join(`
`), s = t.filter((o) => o instanceof Error).map((o) => ({
    name: o.name,
    message: o.message,
    stack: o.stack
  }));
  $?.captureException(new Error(e), Ie(), { referencedErrors: s });
}
function Ie() {
  return W.type === "anonymous" ? W.randomDistinctId : W.userEmail;
}
const Y = {
  UPDATE_CHECKED: "update_checked",
  PATCH_UPDATE_AVAILABLE: "patch_update_available",
  UPDATE_AVAILABLE: "update_available",
  UPDATE_DOWNLOADED: "update_downloaded",
  UPDATE_FAILED: "update_failed"
};
function ot(t) {
  y || c.getLoginItemSettings().openAtLogin !== t && c.setLoginItemSettings({
    openAtLogin: t,
    openAsHidden: !1
    // Always show the app when auto-launching
  });
}
const Re = M(c.getPath("userData"), "onboarding.done");
let Me = Ze(Re);
function it() {
  return Me;
}
function Pt() {
  et(Re, ""), Me = !0, r.createOrRecreateWindows({ justFinishedOnboarding: !0 });
}
function rt() {
  try {
    tt(Re);
  } catch {
  }
  Me = !1, r.createOrRecreateWindows();
}
function Wt(t, e, s, o) {
  e = Math.floor(e), s = Math.floor(s);
  const i = g.getPrimaryDisplay().displayFrequency;
  let l = Math.min(Math.max(i, 30), 360);
  i > 60 && (l = Math.max(60, Math.floor(i / 2)));
  const d = 1e3 / l, b = t.getBounds(), m = b.width, E = b.height, F = b.x, V = b.y, _ = F + Math.floor((m - e) / 2), z = V + Math.floor((E - s) / 2), G = e - m, p = s - E, v = _ - F, f = z - V, O = Math.floor(o / d);
  let q = 0;
  const ee = Date.now();
  let B = null;
  const Ue = () => {
    const xe = Date.now() - ee;
    if (q = Math.min(O, Math.floor(xe / d)), q < O) {
      const te = Ut(xe / o), ve = Math.floor(m + G * te), Te = Math.floor(E + p * te), Se = Math.floor(F + v * te), De = Math.floor(V + f * te);
      if (A) {
        const se = t.getBounds();
        (Math.abs(se.width - ve) >= 1 || Math.abs(se.height - Te) >= 1 || Math.abs(se.x - Se) >= 1 || Math.abs(se.y - De) >= 1) && t.setBounds(
          {
            x: Se,
            y: De,
            width: ve,
            height: Te
          },
          !1
        );
      } else
        t.setBounds({
          x: Se,
          y: De,
          width: ve,
          height: Te
        });
      B = setTimeout(Ue, d);
    } else
      t.setBounds({
        x: _,
        y: z,
        width: e,
        height: s
      }), t.setResizable(!1), B !== null && (clearTimeout(B), B = null);
  }, Le = t.isResizable();
  return Le || t.setResizable(!0), Ue(), {
    cancel: () => {
      B !== null && (clearTimeout(B), B = null), t.setBounds({
        x: _,
        y: z,
        width: e,
        height: s
      }), t.setResizable(Le);
    }
  };
}
function Ut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
class Lt {
  tray = null;
  shouldInitializeTray = !1;
  isInSession = !1;
  isHidden = !1;
  isLoggedIn = !1;
  /**
   * Should only be called when explicitly initialized from the renderer process with `set-tray-initialized`
   */
  initializeTray() {
    if (!this.shouldInitializeTray || this.tray !== null || x())
      return;
    const e = M(L, "assets", "trayTemplate.png"), s = Fe.createFromPath(e);
    this.tray = new yt(s), this.tray.setContextMenu(this.generateContextMenu());
  }
  /**
   * Generates the context menu for the tray with default hidden value for hide state.
   * You'll probably want to call setHiddenState() after renderer initialization.
   * @returns The context menu for the tray
   */
  generateContextMenu() {
    return this.isLoggedIn ? this.isInSession ? K.buildFromTemplate([
      {
        label: this.isHidden ? `Show ${T}` : `Hide ${T}`,
        click: () => {
          r.sendToWebContents(this.isHidden ? "unhide-window" : "hide-window", {
            reason: "tray"
          });
        }
      },
      {
        label: "Make Invisible",
        click: () => {
          Be(), ye();
        }
      },
      {
        type: "separator"
      },
      {
        label: "View Sessions",
        click: () => {
          r.getDashboardWindow().setVisibility(!0);
        }
      },
      {
        label: "Preferences",
        click: () => {
          r.sendToWebContents("broadcast-to-all-windows", {
            command: "open-dashboard-page",
            page: "/settings/general"
          }), r.getDashboardWindow().setVisibility(!0);
        }
      },
      {
        type: "separator"
      },
      {
        label: "Stop Listening",
        click: () => {
          r.sendToWebContents("stop-listening", null);
        }
      },
      {
        label: `Quit ${T}`,
        click: () => {
          c.quit();
        }
      }
    ]) : K.buildFromTemplate([
      {
        label: "Start Listening",
        click: () => {
          r.sendToWebContents("start-listening", {
            meetingId: null,
            attendeeEmails: null
          });
        }
      },
      {
        type: "separator"
      },
      {
        label: "View Sessions",
        click: () => {
          r.getDashboardWindow().setVisibility(!0);
        }
      },
      {
        label: "Preferences",
        click: () => {
          r.sendToWebContents("broadcast-to-all-windows", {
            command: "open-dashboard-page",
            page: "/settings/general"
          }), r.getDashboardWindow().setVisibility(!0);
        }
      },
      {
        type: "separator"
      },
      {
        label: `Quit ${T}`,
        click: () => {
          c.quit();
        }
      }
    ]) : K.buildFromTemplate([
      {
        label: `Log in to ${T}`,
        click: () => {
          r.getDashboardWindow().setVisibility(!0);
        }
      },
      {
        label: `Quit ${T}`,
        click: () => {
          c.quit();
        }
      }
    ]);
  }
  updateImage() {
    if (this.tray === null)
      return;
    const e = M(
      L,
      "assets",
      this.isLoggedIn && this.isInSession ? "trayActiveTemplate.png" : "trayTemplate.png"
    ), s = Fe.createFromPath(e);
    this.tray.setImage(s);
  }
  setHiddenState(e) {
    if (this.isHidden = e, this.tray === null)
      return;
    const s = this.generateContextMenu();
    this.tray.setContextMenu(s);
  }
  setLoggedInState(e) {
    if (this.isLoggedIn = e, this.tray === null)
      return;
    this.updateImage();
    const s = this.generateContextMenu();
    this.tray.setContextMenu(s);
  }
  setInSessionState(e) {
    if (this.isInSession = e, this.tray === null)
      return;
    this.updateImage();
    const s = this.generateContextMenu();
    this.tray.setContextMenu(s);
  }
  removeTray() {
    this.tray?.destroy(), this.tray = null;
  }
  setShouldInitializeTray() {
    this.shouldInitializeTray = !0;
  }
  handleTrayState() {
    !x() && this.shouldInitializeTray ? this.initializeTray() : this.removeTray();
  }
}
const P = new Lt(), ke = M(c.getPath("userData"), "undetectability.enabled");
let Z = Ze(ke);
function x() {
  return Z;
}
function Be() {
  Z ? he() : Ne();
}
function Ne() {
  et(ke, ""), Z = !0;
}
function he() {
  try {
    tt(ke);
  } catch {
  }
  Z = !1;
}
function ye() {
  r.handleDockIcon(), P.handleTrayState(), r.restoreUndetectability(), r.sendToWebContents("invisible-changed", { invisible: Z }), Rt() && r.createOrRecreateWindows();
}
const { autoUpdater: H } = Et, xt = 1e3 * 60 * 60;
let J = { state: "none" }, at = !1;
function Ft() {
  y || Ve === "" || (H.autoDownload = !1, H.setFeedURL({
    provider: "generic",
    url: Ve
  }), ze(), setInterval(() => {
    ze();
  }, xt));
}
function ie(t, e) {
  $?.capture({
    event: t,
    properties: { currentAppVersion: c.getVersion(), newVersion: e },
    distinctId: Ie()
  });
}
async function ze() {
  console.log("Checking for updates...");
  const t = await H.checkForUpdates();
  if ($?.capture({
    event: Y.UPDATE_CHECKED,
    properties: {
      currentAppVersion: c.getVersion(),
      updateResult: t
    },
    distinctId: Ie()
  }), !t || !t.isUpdateAvailable) return;
  if (ge(t.updateInfo.version) === ge(c.getVersion()))
    re({ state: "downloaded", version: t.updateInfo.version }), ie(Y.PATCH_UPDATE_AVAILABLE, t.updateInfo.version);
  else {
    re({ state: "available", version: t.updateInfo.version }), ie(Y.UPDATE_AVAILABLE, t.updateInfo.version);
    try {
      await H.downloadUpdate(), re({ state: "downloaded", version: t.updateInfo.version }), ie(Y.UPDATE_DOWNLOADED, t.updateInfo.version);
    } catch (s) {
      D("Error downloading update", s), re({ state: "none" }), ie(Y.UPDATE_FAILED, t.updateInfo.version);
    }
  }
}
function re(t) {
  J = t, r.sendToWebContents("updater-state", J);
}
function lt() {
  return J;
}
function ct() {
  J.state !== "none" && (ge(J.version) === ge(c.getVersion()) ? r.createOrRecreateWindows() : (at = !0, H.quitAndInstall()));
}
function $t() {
  return at;
}
function ge(t) {
  return t.split(".").slice(0, 2).join(".");
}
const Ht = "1.72.2", Ge = {
  version: Ht
};
class Pe {
  constructor(e, s) {
    this.moreOptions = s, this.window = new Qe(
      e || {
        show: !1,
        type: "panel",
        // window style options
        alwaysOnTop: !0,
        transparent: !0,
        frame: !1,
        roundedCorners: !1,
        hasShadow: !1,
        // window resize options
        fullscreenable: !1,
        minimizable: !1,
        // macOS specific options
        hiddenInMissionControl: !0,
        // Windows specific options
        skipTaskbar: !0,
        // will be overwritten by this.restoreUndetectability()
        webPreferences: {
          preload: M(L, "../preload/index.cjs")
        }
      }
    ), this.window.setTitle(T), this.restoreUndetectability(), A && (this.window.on("show", () => {
      this.restoreUndetectability();
    }), this.window.on("restore", () => {
      this.restoreUndetectability();
    }), this.window.on("focus", () => {
      this.restoreUndetectability();
    })), s.alwaysOnTop && (this.window.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), this.window.setResizable(!1), A && (this.window.setAlwaysOnTop(!0, "screen-saver", 1), this.window.webContents.setBackgroundThrottling(!1))), this.moveToDisplay(s.initialDisplay), this.setIgnoreMouseEvents(!0), this.window.once("ready-to-show", () => {
      s.alwaysOnTop && this.window.show(), this.window.setTitle(T);
    }), this.window.on("page-title-updated", () => {
      this.window.getTitle() !== T && this.window.setTitle(T);
    }), this.window.webContents.on("will-navigate", (o) => {
      o.preventDefault();
    }), this.window.webContents.setWindowOpenHandler((o) => {
      try {
        const a = new URL(o.url);
        (a.protocol === "https:" || y && a.protocol === "http:" || a.protocol === "mailto:") && (le.openExternal(o.url), r.sendToWebContents("opened-external-link", { url: o.url }));
      } catch (a) {
        D(`error trying to open url ${o.url}`, a);
      }
      return { action: "deny" };
    }), c.on("before-quit", () => {
      this.isActuallyClosing = !0;
    }), this.window.on("close", (o) => {
      this.isActuallyClosing || $t() || (o.preventDefault(), this.fakeClose());
    }), this.loadRenderer(), s.justFinishedOnboarding && this.window.webContents.once("did-finish-load", () => {
      r.sendToWebContents("trigger-login", null);
    });
  }
  window;
  disposers = [];
  isActuallyClosing = !1;
  validateLatestVersion(e) {
    const s = e.split(".");
    if (s.length === 3) {
      const [o, a] = Ge.version.split("."), [i, l] = s;
      if (o === i && a && l)
        return !0;
    }
    return !1;
  }
  async getRemoteRendererUrl() {
    const s = `https://desktop.cluely.com/${k ? "osx" : "win"}`, [o, a] = Ge.version.split("."), l = await (await fetch(`${s}/${o}.${a}.x`)).text();
    if (!this.validateLatestVersion(l))
      throw new Error(`Invalid latest version: ${l}`);
    const d = `/${l}/index.html?appVersion=${l}`;
    return `${s}${d}`;
  }
  loadOfflineView(e = !1) {
    const s = e ? process.env.ELECTRON_RENDERER_URL : "app://renderer";
    this.window.loadURL(`${s}/offline.html`);
  }
  async loadRenderer(e = !1) {
    const s = (o) => {
      const a = new URL(o);
      return this.moreOptions.searchParams.forEach((i, l) => {
        a.searchParams.append(l, i);
      }), a.toString();
    };
    if (y && process.env.ELECTRON_RENDERER_URL && !e) {
      this.window.loadURL(s(`${process.env.ELECTRON_RENDERER_URL}/index.html`));
      return;
    }
    try {
      const o = await this.getRemoteRendererUrl();
      if (this.isDestroyed())
        return;
      this.window.loadURL(s(o));
    } catch (o) {
      if (this.isDestroyed())
        return;
      D("unable to get remote renderer url", o), this.loadOfflineView(e);
    }
  }
  /**
   * You should probably use windowManager.sendToWebContents() instead.
   */
  sendToWebContents(e, s) {
    this.window.isDestroyed() || this.window.webContents.send(e, s);
  }
  isIpcEventFromWindow(e) {
    return e.sender === this.window.webContents;
  }
  setIgnoreMouseEvents(e) {
    this.window.setIgnoreMouseEvents(e, { forward: !0 });
  }
  resizeWindow(e, s, o) {
    Wt(this.window, e, s, o);
  }
  focus() {
    this.window.focus();
  }
  blur() {
    A && (this.window.setFocusable(!1), this.window.setFocusable(!0)), this.restoreUndetectability(), this.window.blur();
  }
  close() {
    this.window.isDestroyed() || (this.isActuallyClosing = !0, this.window.close(), this.disposers.map((e) => e()));
  }
  onceDidFinishLoad(e) {
    this.window.webContents.once("did-finish-load", e);
  }
  isDestroyed() {
    return this.window.isDestroyed();
  }
  getBounds() {
    return this.window.getBounds();
  }
  setBoundsToDisplay(e) {
    this.window.setBounds(
      {
        x: e.workArea.x,
        y: e.workArea.y,
        width: e.workArea.width,
        height: e.workArea.height
      },
      !1
    );
  }
  /**
   * You should probably use windowManager.setTargetDisplay() instead so that
   * the chosen display is remembered across window recreations.
   */
  moveToDisplay(e, s) {
    this.setBoundsToDisplay(e), r.sendToWebContents("display-changed", {
      preservePosition: s?.preservePosition,
      cursorScreenX: s?.cursorScreenX,
      cursorScreenY: s?.cursorScreenY
    });
  }
  reload() {
    this.window.webContents.reload();
  }
  onUnload(e) {
    this.window.webContents.on("did-navigate", e);
  }
  toggleDevTools() {
    this.window.webContents.isDevToolsOpened() ? this.window.webContents.closeDevTools() : (this.window.webContents.openDevTools({ mode: "detach" }), c.focus());
  }
  closeDevTools() {
    this.window.webContents.closeDevTools();
  }
  setContentProtection(e) {
    this.window.setContentProtection(e);
  }
  restoreUndetectability() {
    const e = this.moreOptions.getUndetectabilityEnabled();
    this.window.setContentProtection(e), A && this.window.setSkipTaskbar(e || this.moreOptions.forceSkipTaskbar);
  }
  fakeClose() {
    r.fakeQuit();
  }
}
class ce extends Pe {
  constructor(e) {
    const s = {
      show: !1,
      alwaysOnTop: !1,
      transparent: !0,
      frame: !1,
      roundedCorners: !1,
      hasShadow: !0,
      fullscreenable: !1,
      minimizable: !1,
      resizable: !1,
      hiddenInMissionControl: !1,
      skipTaskbar: !0,
      // will be overwritten by this.restoreUndetectability()
      webPreferences: {
        preload: M(L, "../preload/index.cjs")
      }
    };
    super(s, e), this.window.once("ready-to-show", () => {
      this.window.show();
    });
  }
  setBoundsToDisplay(e) {
    super.setBoundsToDisplay(e);
  }
  setIgnoreMouseEvents(e) {
  }
  show() {
    this.window.blur(), this.window.hide(), setTimeout(() => {
      this.window.show(), this.window.focus();
    }, 100);
  }
}
class w extends Pe {
  static DEFAULT_WIDTH = 1200;
  static DEFAULT_HEIGHT = 800;
  // on Windows, the top-right window buttons take up more space
  static MIN_WIDTH = A ? 1020 : 800;
  static MIN_HEIGHT = 600;
  static LIGHT_MODE_BACKGROUND_COLOR = "#F4F4F5";
  static DARK_MODE_BACKGROUND_COLOR = "#121213";
  constructor(e) {
    const s = {
      show: !1,
      // start hidden
      frame: !0,
      transparent: !1,
      fullscreenable: !0,
      titleBarStyle: "hidden",
      backgroundColor: ne.shouldUseDarkColors ? w.DARK_MODE_BACKGROUND_COLOR : w.LIGHT_MODE_BACKGROUND_COLOR,
      // windows
      titleBarOverlay: {
        color: ne.shouldUseDarkColors ? w.DARK_MODE_BACKGROUND_COLOR : w.LIGHT_MODE_BACKGROUND_COLOR,
        symbolColor: ne.shouldUseDarkColors ? "#FFFFFF" : "#000000",
        height: 34
      },
      // mac
      trafficLightPosition: { x: 12, y: 12 },
      minWidth: w.MIN_WIDTH,
      minHeight: w.MIN_HEIGHT,
      hiddenInMissionControl: !1,
      skipTaskbar: !0,
      webPreferences: {
        preload: M(L, "../preload/index.cjs")
      }
    };
    super(s, {
      alwaysOnTop: !1,
      initialDisplay: e.initialDisplay,
      getUndetectabilityEnabled: x,
      forceSkipTaskbar: !1,
      justFinishedOnboarding: !1,
      searchParams: new URLSearchParams({ [kt]: "1" })
    }), this.centerOnDisplay(e.initialDisplay);
  }
  setIgnoreMouseEvents(e) {
  }
  setVisibility(e) {
    e ? (k && c.focus({ steal: !0 }), this.window.show(), this.window.focus(), this.window.moveTop()) : this.window.hide(), r.sendToWebContents("dashboard-visibility", { visible: e });
  }
  maximize() {
    this.window.isMaximized() ? this.window.unmaximize() : this.window.maximize();
  }
  minimize() {
    this.window.minimize();
  }
  isFocused() {
    return this.window.isFocused();
  }
  fakeClose() {
    this.setVisibility(!1), this.sendToWebContents("hide-window", { reason: "native_close_requested" });
  }
  /** Also sets window background color */
  updateTitleBarOverlay(e) {
    if (!A)
      return;
    const s = e === "dark" || e === "system" && ne.shouldUseDarkColors, o = s ? w.DARK_MODE_BACKGROUND_COLOR : w.LIGHT_MODE_BACKGROUND_COLOR, a = s ? "#FFFFFF" : "#000000";
    this.window.setBackgroundColor(o), this.window.setTitleBarOverlay({ color: o, symbolColor: a, height: 34 });
  }
  centerOnDisplay(e) {
    const s = e.workArea.width - 100, o = e.workArea.height - 100;
    let a = w.DEFAULT_WIDTH, i = w.DEFAULT_HEIGHT;
    a > s && (a = s), i > o && (i = o), a < w.MIN_WIDTH && (a = w.MIN_WIDTH), i < w.MIN_HEIGHT && (i = w.MIN_HEIGHT), this.window.setBounds({
      x: e.workArea.x + (e.workArea.width - a) / 2,
      y: e.workArea.y + (e.workArea.height - i) / 2,
      width: a,
      height: i
    });
  }
}
class jt {
  currentWindow = null;
  dashboardWindow = null;
  targetDisplay = null;
  constructor() {
    setInterval(() => {
      this.currentWindow?.setBoundsToDisplay(this.getTargetDisplay());
    }, 5e3);
  }
  handleDockIcon() {
    if (!k)
      return;
    const e = this.currentWindow instanceof ce, s = !x() || e, o = c.dock?.isVisible() ?? !1;
    s !== o && (s ? c.dock?.show() : (c.dock?.hide(), c.focus({ steal: !0 }), setTimeout(() => {
      c.focus({ steal: !0 });
    }, 500)));
  }
  createOrRecreateWindows(e) {
    const s = it(), o = {
      alwaysOnTop: s,
      initialDisplay: this.getTargetDisplay(),
      getUndetectabilityEnabled: s ? x : () => !1,
      forceSkipTaskbar: s,
      justFinishedOnboarding: e?.justFinishedOnboarding ?? !1,
      searchParams: new URLSearchParams()
    };
    this.currentWindow?.close(), this.currentWindow = s ? new Pe(void 0, o) : new ce(o), this.dashboardWindow?.close(), this.dashboardWindow = new w({ initialDisplay: this.getTargetDisplay() }), this.handleDockIcon(), P.handleTrayState();
  }
  /** Can only be called after createWindow() */
  getCurrentWindow() {
    if (!this.currentWindow)
      throw new Error("No current window. Did you call createWindow()?");
    return this.currentWindow;
  }
  /** Can only be called after createDashboardWindow() */
  getDashboardWindow() {
    if (!this.dashboardWindow)
      throw new Error("No dashboard window. Did you call createDashboardWindow()?");
    return this.dashboardWindow;
  }
  setTargetDisplay(e, s) {
    this.targetDisplay = e, this.currentWindow?.moveToDisplay(e, {
      preservePosition: s?.preservePosition,
      cursorScreenX: s?.cursorScreenX,
      cursorScreenY: s?.cursorScreenY
    });
  }
  getTargetDisplay() {
    return this.targetDisplay ?? g.getPrimaryDisplay();
  }
  setContentProtection(e) {
    this.currentWindow?.setContentProtection(e), this.dashboardWindow?.setContentProtection(e);
  }
  restoreUndetectability() {
    this.currentWindow?.restoreUndetectability(), this.dashboardWindow?.restoreUndetectability();
  }
  fakeQuit() {
    this.currentWindow instanceof ce ? c.quit() : (this.getDashboardWindow().setVisibility(!1), this.sendToWebContents("hide-window", { reason: "native_close_requested" }));
  }
  isCursorOutsideTargetDisplay() {
    const e = g.getCursorScreenPoint(), s = g.getDisplayNearestPoint(e), o = this.getTargetDisplay();
    return s.id !== o.id;
  }
  moveToDisplayContainingCursor() {
    if (!this.currentWindow || !this.isCursorOutsideTargetDisplay())
      return null;
    const e = g.getCursorScreenPoint(), s = g.getDisplayNearestPoint(e);
    return this.setTargetDisplay(s), {
      windowCursorX: e.x - this.currentWindow.getBounds().x,
      windowCursorY: e.y - this.currentWindow.getBounds().y
    };
  }
  sendToWebContents(e, s) {
    this.currentWindow?.sendToWebContents(e, s), this.dashboardWindow?.sendToWebContents(e, s);
  }
  updateTitleBarOverlay(e) {
    this.dashboardWindow?.updateTitleBarOverlay(e);
  }
}
const r = new jt();
let dt = { page: "login" };
function ut(t) {
  dt = t, pt();
}
function pt() {
  r.sendToWebContents("dashboard-window-state", { state: dt });
}
const ht = "chrome-extension", Vt = { "Access-Control-Allow-Origin": "*" }, Ae = (t, e = 200) => new Response(t, { status: e, headers: Vt }), h = At();
h.insert("/os/platform/arch", (t) => t.body(process.arch));
h.insert("/os/platform/name", (t) => t.body(process.platform));
h.insert("/app/version", (t) => t.body(c.getVersion()));
h.insert("/app/quit", (t) => (c.quit(), t.body()));
h.insert("/app/install_update", (t) => (ct(), t.body()));
h.insert("/app/logout", (t) => (r.sendToWebContents("trigger-logout", null), t.body()));
h.insert("/app/settings/clear", async (t) => (await Q.defaultSession.clearStorageData(), r.sendToWebContents("trigger-logout", null), t.body()));
h.insert("/app/listen/start", async (t) => {
  const e = n.object({
    meetingId: n.string().nullable(),
    attendeeEmails: n.array(n.string()).nullable()
  }), { meetingId: s, attendeeEmails: o } = e.parse(await t.request.json());
  return r.sendToWebContents("start-listening", {
    meetingId: s,
    attendeeEmails: o
  }), t.body();
});
h.insert("/app/listen/stop", (t) => (r.sendToWebContents("stop-listening", null), t.body()));
h.insert("/app/listen/resume", async (t) => {
  const e = n.object({ sessionId: n.string() }), { sessionId: s } = e.parse(await t.request.json());
  return r.sendToWebContents("resume-session", { sessionId: s }), t.body();
});
h.insert("/app/open_personalize_modal", (t) => (ut({ page: "view", modal: "personalize" }), t.body()));
h.insert("/app/show_tutorial", (t) => (r.sendToWebContents("broadcast-to-all-windows", { command: "show-tutorial" }), r.sendToWebContents("close-dashboard", null), t.body()));
h.insert("/app/settings/change_theme", async (t) => {
  const e = n.object({ theme: n.enum(["system", "light", "dark"]) }), { theme: s } = e.parse(await t.request.json());
  return r.updateTitleBarOverlay(s), r.sendToWebContents("broadcast-to-all-windows", { theme: s, command: "change-theme" }), t.body(null);
});
h.insert("/app/settings/poll_updater_state", (t) => (r.sendToWebContents("updater-state", lt()), t.body()));
h.insert("/app/settings/get_auto_launch", (t) => {
  const e = c.getLoginItemSettings();
  return t.body(JSON.stringify({ enabled: e.openAtLogin }));
});
h.insert("/app/settings/set_auto_launch", async (t) => {
  const e = n.object({ enabled: n.boolean() }), { enabled: s } = e.parse(await t.request.json());
  return ot(s), t.body(JSON.stringify({ enabled: s }));
});
h.insert("/app/settings/poll_undetectability", (t) => (r.sendToWebContents("invisible-changed", {
  invisible: x()
}), t.body()));
h.insert("/app/settings/set_undetectability", async (t) => {
  const e = n.object({ enabled: n.boolean() }), { enabled: s } = e.parse(await t.request.json());
  return s ? Ne() : he(), ye(), t.body();
});
h.insert("/app/settings/keybinds/begin_recording", (t) => (r.sendToWebContents("broadcast-to-all-windows", {
  command: "set-keybinds-is-recording",
  isRecording: !0
}), t.body()));
h.insert("/app/settings/keybinds/end_recording", (t) => (r.sendToWebContents("broadcast-to-all-windows", {
  command: "set-keybinds-is-recording",
  isRecording: !1
}), t.body()));
h.insert("/app/settings/keybinds/poll_accelerators", (t) => (r.sendToWebContents("send-keybindings-to-dashboard", null), t.body()));
h.insert("/app/settings/keybinds/set_accelerator", async (t) => {
  const e = n.object({ name: n.string(), accelerator: n.string().nullable() }), { name: s, accelerator: o } = e.parse(await t.request.json());
  return r.sendToWebContents("set-keybind-accelerator", { name: s, accelerator: o }), t.body();
});
h.insert("/app/settings/keybinds/set_disabled", async (t) => {
  const e = n.object({ name: n.string(), disabled: n.boolean() }), { name: s, disabled: o } = e.parse(await t.request.json());
  return r.sendToWebContents("set-keybind-disabled", { name: s, disabled: o }), t.body();
});
h.insert("/app/settings/refresh_metadata", (t) => (r.sendToWebContents("refresh-metadata", null), t.body()));
h.insert("/dashboard/ready", async (t) => (r.sendToWebContents("dashboard-ready", null), t.body()));
h.insert("/app/settings/unhide_window", async (t) => (r.sendToWebContents("unhide-window", { reason: "dashboard" }), t.body()));
async function zt(t) {
  const e = new URL(t.url), s = h.lookup(e.pathname);
  if (!s)
    return Ae(null, 404);
  try {
    return await s({ url: e, request: t, body: Ae });
  } catch (o) {
    return console.error("Error in handleDashboardIpc:", o), Ae(null, 500);
  }
}
const Gt = [
  process.env.ELECTRON_RENDERER_URL,
  "https://desktop.cluely.com",
  "https://app.cluely.com",
  "https://desktop.cluely.com"
].filter(Boolean), qt = [
  "https://app.cluely.com",
  "https://desktop.cluely.com",
  "https://desktop.cluely.com"
].filter(Boolean);
function Xt(t) {
  try {
    const e = new URL(t);
    return Gt.includes(e.origin);
  } catch {
    return !1;
  }
}
const Yt = "x-desktop-access-token", qe = "X-Trace-Id";
let de = null;
function Kt(t) {
  de = t;
}
function Qt() {
  Q.defaultSession.webRequest.onBeforeSendHeaders((t, e) => {
    try {
      const s = new URL(t.url);
      de && Xt(t.referrer) && (s.origin === "https://app.cluely.com" && (t.requestHeaders[Yt] = de), s.origin === "https://platform.cluely.com" && !Xe(t.requestHeaders, "Authorization") && (t.requestHeaders.Authorization = `Bearer ${de}`), s.origin === "https://platform.cluely.com" && !Xe(t.requestHeaders, qe) && (t.requestHeaders[qe] = Ct()));
    } catch {
    }
    e({ requestHeaders: t.requestHeaders });
  }), Q.defaultSession.webRequest.onBeforeRequest((t, e) => {
    try {
      const s = new URL(t.url), o = new URL(t.referrer);
      if (qt.includes(o.origin) && s.pathname.startsWith("/ipc/")) {
        const a = s.pathname.slice(5);
        e({ redirectURL: `${ht}://ipc/${a}${s.search}` });
        return;
      }
    } catch {
    }
    e({});
  });
}
function Xe(t, e) {
  return !!t[e] || !!t[e.toLowerCase()];
}
function gt() {
  const e = r.getCurrentWindow().getBounds(), s = g.getDisplayMatching(e);
  return g.getAllDisplays().map((o) => ({
    ...o,
    label: o.label || `Display ${o.id}`,
    primary: o.id === g.getPrimaryDisplay().id,
    current: o.id === s.id
  }));
}
function mt(t) {
  return g.getAllDisplays().find((e) => e.id === t);
}
class Jt {
  window;
  displayId;
  constructor(e, s) {
    this.displayId = e.id, this.window = new Qe({
      show: !1,
      frame: !1,
      transparent: !0,
      alwaysOnTop: !0,
      skipTaskbar: !0,
      resizable: !1,
      movable: !1,
      minimizable: !1,
      maximizable: !1,
      fullscreenable: !1,
      x: e.bounds.x,
      y: e.bounds.y,
      width: e.bounds.width,
      height: e.bounds.height,
      webPreferences: {
        preload: M(L, "../preload/index.cjs")
      }
    }), this.window.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), this.window.setIgnoreMouseEvents(!1);
    const o = () => {
      console.log(`[DisplayOverlay] Overlay click triggered for display ${this.displayId}`), s(this.displayId);
    }, a = `overlay-click-${this.displayId}`;
    pe.on(a, o), this.window.on("closed", () => {
      console.log(`[DisplayOverlay] Cleaning up IPC handler for display ${this.displayId}`), pe.removeListener(a, o);
    }), this.window.webContents.on("will-navigate", (i) => {
      i.preventDefault();
    }), this.window.webContents.setWindowOpenHandler(() => ({ action: "deny" })), this.loadReactOverlay(e, a);
  }
  loadReactOverlay(e, s) {
    const o = {
      display: {
        id: e.id,
        label: e.label || `Display ${e.id}`,
        bounds: e.bounds
      },
      ipcChannel: s,
      onOverlayClick: () => {
      }
      // This will be handled via IPC
    };
    let a;
    y && process.env.ELECTRON_RENDERER_URL ? a = new URL(`${process.env.ELECTRON_RENDERER_URL}/overlay.html`) : a = new URL("app://renderer/overlay.html");
    const i = encodeURIComponent(JSON.stringify(o));
    a.searchParams.set("displayData", i), this.window.loadURL(a.toString());
  }
  show() {
    this.window.show();
  }
  hide() {
    this.window.hide();
  }
  highlight() {
    this.window.webContents.executeJavaScript(`
      window.dispatchEvent(new CustomEvent('highlight'));
    `).catch(() => {
    });
  }
  unhighlight() {
    this.window.webContents.executeJavaScript(`
      window.dispatchEvent(new CustomEvent('unhighlight'));
    `).catch(() => {
    });
  }
  destroy() {
    console.log(`[DisplayOverlay] Destroying overlay for display ${this.displayId}`), this.window.isDestroyed() || this.window.close();
  }
  getBounds() {
    return this.window.getBounds();
  }
}
class Zt {
  overlays = /* @__PURE__ */ new Map();
  isActive = !1;
  showOverlays() {
    console.log("[DisplayOverlayManager] Showing overlays"), this.hideOverlays(), this.isActive = !0;
    const e = g.getAllDisplays(), o = r.getCurrentWindow().getBounds(), a = g.getDisplayMatching(o);
    for (const i of e) {
      if (i.id === a.id)
        continue;
      const l = new Jt(i, (d) => {
        if (console.log(
          `[DisplayOverlayManager] Display ${d} clicked, checking if active: ${this.isActive}`
        ), !this.isActive) {
          console.log(
            `[DisplayOverlayManager] Ignoring click for display ${d} - overlays are inactive`
          );
          return;
        }
        console.log(`[DisplayOverlayManager] Moving window to display ${d}`);
        const b = mt(d);
        b && r.setTargetDisplay(b), this.hideOverlays();
      });
      this.overlays.set(i.id, l), l.show();
    }
  }
  hideOverlays() {
    console.log("[DisplayOverlayManager] Hiding overlays"), this.isActive = !1;
    for (const e of this.overlays.values())
      e.destroy();
    this.overlays.clear();
  }
  highlightDisplay(e) {
    const s = this.overlays.get(e);
    s && s.highlight();
  }
  unhighlightDisplay(e) {
    const s = this.overlays.get(e);
    s && s.unhighlight();
  }
}
const ae = new Zt(), es = n.union([
  n.object({
    page: n.literal("login")
  }),
  n.object({
    page: n.literal("logging-in")
  }),
  n.object({
    page: n.literal("view"),
    modal: n.enum(["personalize"]).nullable()
  })
]), ts = n.union([
  n.literal("/about"),
  n.literal("/changelog"),
  n.literal("/customize"),
  n.literal("/settings/general"),
  n.literal("/settings/calendar"),
  n.literal("/settings/keybinds"),
  n.literal("/settings/profile"),
  n.literal("/settings/language"),
  n.literal("/settings/billing"),
  n.literal("/settings/help-center"),
  n.literal("/settings/feedback")
]), ss = n.union([
  n.object({
    command: n.literal("log-out")
  }),
  n.object({
    command: n.literal("show-tutorial")
  }),
  n.object({
    command: n.literal("audio-session-stopped"),
    sessionId: n.string()
  }),
  n.object({
    command: n.literal("session-state-change"),
    sessionId: n.string(),
    state: n.enum([
      "ongoing",
      "analyzing",
      "analysis-succeeded",
      "analysis-failed",
      "consumer-analysis-succeeded"
    ]),
    hasAudio: n.boolean()
  }),
  n.object({
    command: n.literal("dashboard-show-listen-button")
  }),
  n.object({
    command: n.literal("dashboard-hide-listen-button")
  }),
  n.object({
    command: n.literal("set-keybinds-is-recording"),
    isRecording: n.boolean()
  }),
  n.object({
    command: n.literal("open-dashboard-page"),
    page: ts,
    params: n.optional(n.record(n.string(), n.optional(n.string())))
  }),
  n.object({
    command: n.literal("change-theme"),
    theme: n.enum(["system", "light", "dark"])
  })
]), ns = {
  "quit-app": n.null(),
  "check-for-update": n.null(),
  "install-update": n.null(),
  "get-updater-state": n.null(),
  "finish-onboarding": n.null(),
  "reset-onboarding": n.null(),
  "register-global-shortcut": n.object({
    accelerator: n.string()
  }),
  "unregister-global-shortcut": n.object({
    accelerator: n.string()
  }),
  "enable-dev-shortcuts": n.null(),
  "reset-global-shortcuts": n.null(),
  "set-ignore-mouse-events": n.object({
    ignore: n.boolean()
  }),
  "resize-window": n.object({
    width: n.number(),
    height: n.number(),
    duration: n.number()
  }),
  "focus-window": n.null(),
  "unfocus-window": n.null(),
  "restart-window": n.null(),
  "set-tray-initialized": n.null(),
  "set-tray-hidden-state": n.object({
    hidden: n.boolean()
  }),
  "set-tray-in-session-state": n.object({
    inSession: n.boolean()
  }),
  "set-tray-logged-in-state": n.object({
    loggedIn: n.boolean()
  }),
  // Display management events
  "get-available-displays": n.null(),
  "get-invisible": n.null(),
  "move-window-to-display": n.object({
    displayId: n.number(),
    preservePosition: n.boolean().optional(),
    cursorScreenX: n.number().optional(),
    cursorScreenY: n.number().optional()
  }),
  "show-display-overlays": n.null(),
  "hide-display-overlays": n.null(),
  "highlight-display": n.object({
    displayId: n.number()
  }),
  "unhighlight-display": n.object({
    displayId: n.number()
  }),
  // Windows specific events
  "windows-open-system-settings": n.object({
    section: n.enum(["sound-settings"])
  }),
  // Mac specific events
  "mac-open-system-settings": n.object({
    section: n.enum(["privacy > microphone", "privacy > screen-recording", "sound > input"])
  }),
  "mac-enable-native-recorder": n.object({
    sampleRate: n.number()
  }),
  "mac-disable-native-recorder": n.null(),
  "mac-set-mic-monitor-enabled": n.object({
    enabled: n.boolean(),
    version: n.enum(["v1", "v2", "v3"])
  }),
  "toggle-invisible": n.null(),
  "set-invisible-preference": n.object({
    invisible: n.boolean()
  }),
  "logout-user": n.null(),
  "login-user": n.object({
    userEmail: n.email()
  }),
  "set-auto-launch-enabled": n.object({
    enabled: n.boolean()
  }),
  "broadcast-to-all-windows": ss,
  "set-dashboard-visibility": n.object({
    visible: n.boolean()
  }),
  "set-dashboard-state": n.object({
    state: es
  }),
  "get-dashboard-window-state": n.null(),
  "maximize-dashboard-window": n.null(),
  "minimize-dashboard-window": n.null()
}, os = {
  "request-has-onboarded": {
    payload: n.null(),
    response: n.object({
      hasOnboarded: n.boolean()
    })
  },
  "check-mic-permission": {
    payload: n.null(),
    response: n.boolean()
  },
  "request-media-permission": {
    payload: n.enum(["microphone", "camera", "screen"]),
    response: n.boolean()
  },
  "capture-screenshot": {
    payload: n.null(),
    response: n.object({
      contentType: n.string(),
      data: n.instanceof(Buffer)
    })
  },
  "mac-check-macos-version": {
    payload: n.null(),
    response: n.object({
      isSupported: n.boolean()
    })
  },
  "get-auto-launch-enabled": {
    payload: n.null(),
    response: n.object({
      enabled: n.boolean()
    })
  },
  "get-login-protocol-state": {
    payload: n.null(),
    response: n.object({
      state: n.string()
    })
  },
  "set-platform-access-token": {
    payload: n.object({
      accessToken: n.string().nullable()
    }),
    response: n.void()
  },
  "is-cursor-outside-target-display": {
    payload: n.null(),
    response: n.boolean()
  },
  "move-window-to-display-containing-cursor": {
    payload: n.null(),
    response: n.object({
      postMoveInfo: n.object({
        windowCursorX: n.number(),
        windowCursorY: n.number()
      }).nullable()
    })
  }
};
function u(t, e) {
  const s = ns[t], o = (a, i) => {
    const l = s.parse(i);
    e(a, l);
  };
  pe.on(t, o);
}
function C(t, e) {
  const s = os[t].payload, o = (a, i) => {
    const l = s.parse(i);
    return e(a, l);
  };
  pe.handle(t, o);
}
async function is(t, e, s) {
  const o = U.basename(e);
  return await new Promise((a, i) => {
    let l = "";
    t.stdout.on("data", (d) => {
      l += d.toString();
    }), t.stderr.on("data", (d) => {
      D(`[${o}] stderr: ${d}`);
    }), t.on("close", (d) => {
      d !== 0 ? (D(`[${o}] process exited with code ${d}`), i(new Error(`Process exited with code ${d}`))) : a({ stdout: l });
    }), t.on("error", (d) => {
      D(`[${o}] process error: ${d}`), i(d);
    });
  });
}
async function rs() {
  const t = fe("sw_vers", ["-productVersion"]), { stdout: e } = await is(t, "sw_vers"), s = Number.parseInt(e.split(".")[0] ?? "", 10);
  return { isSupported: !Number.isNaN(s) && s >= Mt };
}
const as = U.join(
  // app.getAppPath(): root folder of the electron app
  // process.resourcesPath: the Resources folder in the app's package contents
  y ? c.getAppPath() : process.resourcesPath,
  "macExtraResources"
);
function ls(t) {
  return U.join(as, t);
}
class cs {
  events = new we();
  process = null;
  isRunning = !1;
  options;
  constructor(e = {}) {
    this.options = e;
  }
  on(e, s) {
    return this.events.on(e, s), this;
  }
  once(e, s) {
    return this.events.once(e, s), this;
  }
  off(e, s) {
    return this.events.off(e, s), this;
  }
  removeAllListeners(e) {
    return this.events.removeAllListeners(e), this;
  }
  emit(e, ...s) {
    return this.events.emit(e, ...s);
  }
  buildArguments() {
    const e = [];
    return this.options.sampleRate !== void 0 && e.push("--sample-rate", this.options.sampleRate.toString()), this.options.chunkDurationMs !== void 0 && e.push("--chunk-duration", (this.options.chunkDurationMs / 1e3).toString()), this.options.mute && e.push("--mute"), this.options.includeProcesses && this.options.includeProcesses.length > 0 && e.push("--include-processes", ...this.options.includeProcesses.map((s) => s.toString())), this.options.excludeProcesses && this.options.excludeProcesses.length > 0 && e.push("--exclude-processes", ...this.options.excludeProcesses.map((s) => s.toString())), e;
  }
  handleStderr(e) {
    const o = e.toString("utf8").split(`
`).filter((a) => a.trim());
    for (const a of o)
      try {
        const i = JSON.parse(a);
        (i.message_type === "debug" || i.message_type === "info") && this.emit("log", i.message_type, i.data), i.message_type === "stream_start" ? this.emit("start") : i.message_type === "stream_stop" ? this.emit("stop") : i.message_type === "error" && this.emit("error", new Error(i.data.message));
      } catch (i) {
        console.error("Error parsing log message:", i);
      }
  }
  start() {
    return new Promise((e, s) => {
      if (this.isRunning) {
        s(new Error("AudioTee is already running"));
        return;
      }
      const o = ls("audiotee"), a = this.buildArguments();
      this.process = fe(o, a), this.process.on("error", (i) => {
        this.isRunning = !1, this.emit("error", i), s(i);
      }), this.process.on("exit", (i) => {
        if (this.isRunning = !1, i !== 0 && i !== null) {
          const l = new Error(`AudioTee process exited with code ${i}`);
          this.emit("error", l);
        }
      }), this.process.stdout?.on("data", (i) => {
        this.emit("data", { data: i });
      }), this.process.stderr?.on("data", (i) => {
        this.handleStderr(i);
      }), this.isRunning = !0, e();
    });
  }
  stop() {
    return new Promise((e) => {
      if (!this.isRunning || !this.process) {
        e();
        return;
      }
      const s = setTimeout(() => {
        this.process && this.isRunning && this.process.kill("SIGKILL");
      }, 5e3);
      this.process.once("exit", () => {
        clearTimeout(s), this.isRunning = !1, this.process = null, e();
      }), this.process.kill("SIGTERM");
    });
  }
  isActive() {
    return this.isRunning;
  }
}
c.on("before-quit", () => We());
let I = null;
function ds(t, e) {
  We(), I = new cs({
    sampleRate: e,
    chunkDurationMs: 50
    // 50ms chunks as recommended by AssemblyAI
  }), I.on("data", (s) => {
    t.sendToWebContents("mac-native-recorder-data", {
      source: "system",
      base64Data: s.data.toString("base64")
    });
  }), I.on("error", (s) => {
    console.error("Error from audio tee:", s);
  }), I.on("stop", () => {
    console.log("Audio tee stopped");
  }), I.on("start", () => {
    console.log("Audio tee started");
  }), I.on("log", (s, o) => {
    console.log("Audio tee log:", s, o);
  }), I.start();
}
function We() {
  I?.stop().then(() => {
    I = null;
  });
}
const us = [
  ["Google Chrome", "Google Chrome"],
  ["firefox", "Mozilla Firefox"],
  ["com.apple.WebKit", "Safari"],
  ["Arc", "Arc Browser"],
  ["Arc Browser", "Arc Browser"],
  // Alternative process name
  ["Arc.app", "Arc Browser"],
  // App bundle name
  ["Microsoft Edge", "Microsoft Edge"],
  ["zoom.us", "Zoom"],
  ["GoogleMeet", "Google Meet"],
  // TODO: need to test
  ["Slack", "Slack"],
  ["Teams", "Microsoft Teams"],
  ["RingCentral", "RingCentral"],
  // Lower priority apps
  ["Brave Browser", "Brave Browser"],
  ["Brave", "Brave Browser"],
  // Alternative process name
  ["Brave.app", "Brave Browser"],
  // App bundle name
  ["Opera", "Opera Browser"],
  ["Opera Browser", "Opera Browser"],
  // Alternative process name
  ["Opera.app", "Opera Browser"],
  // App bundle name
  ["Vivaldi", "Vivaldi Browser"],
  ["Vivaldi Browser", "Vivaldi Browser"],
  // Alternative process name
  ["Vivaldi.app", "Vivaldi Browser"],
  // App bundle name
  ["Comet", "Comet Browser"],
  ["Comet Browser", "Comet Browser"],
  // Alternative process name
  ["Comet.app", "Comet Browser"],
  // App bundle name
  ["Dia", "Dia Browser"],
  ["Dia Browser", "Dia Browser"],
  // Alternative process name
  ["Dia.app", "Dia Browser"],
  // App bundle name
  ["Fellou", "Fellou AI Browser"],
  ["Fellou AI", "Fellou AI Browser"],
  // Alternative process name
  ["Fellou.app", "Fellou AI Browser"],
  // App bundle name
  ["VoiceMemos", "Voice Memos"],
  ["FaceTime", "FaceTime"],
  // TODO: need to test
  ["Discord", "Discord"],
  // TODO: need to test
  ["QuickTimePlayer", "QuickTime Player"]
  // TODO: need to test
], ps = [
  ["company.thebrowser.browser.helper", "Arc Browser"],
  ["com.brave.Browser.helper", "Brave Browser"],
  ["com.microsoft.edgemac.helper", "Microsoft Edge"],
  ["com.operasoftware.Opera.helper", "Opera Browser"],
  ["com.vivaldi.Vivaldi.helper", "Vivaldi Browser"],
  ["com.google.Chrome.helper", "Google Chrome"],
  ["org.mozilla.firefox.helper", "Mozilla Firefox"],
  ["com.cometbrowser.Comet.helper", "Comet Browser"],
  ["com.diabrowser.Dia.helper", "Dia Browser"],
  ["com.fellou.browser.helper", "Fellou AI Browser"]
];
function hs(t) {
  for (const [e, s] of us)
    if (t.includes(e))
      return s;
  for (const [e, s] of ps)
    if (t.includes(e))
      return console.log(`[MicMonitor] DEBUG: Matched bundle ID: ${e} -> ${s}`), s;
  return null;
}
class R extends we {
  proc = null;
  // Ultra-aggressive frequency deduplication
  patternFrequencyCounter = /* @__PURE__ */ new Map();
  FREQUENCY_WINDOW_MS = 5e3;
  // 5 second window (ultra-aggressive)
  HIGH_FREQ_THRESHOLD = 1;
  // 1 line per 5 seconds (ultra-restrictive)
  // Ultra-aggressive batch processing
  lineBuffer = [];
  BATCH_SIZE = 100;
  // Much larger batch size (ultra-aggressive)
  BATCH_TIMEOUT_MS = 1e3;
  // Much longer timeout (ultra-aggressive)
  batchTimeout = null;
  // Ultra-aggressive global rate limiting
  lastProcessTime = 0;
  MIN_PROCESS_INTERVAL_MS = 2e3;
  // Minimum 2 seconds between processing batches
  // Pre-compiled regex patterns for better performance
  static SESSION_NAME_REGEX = /"session":\{[^}]*"name":"([A-Za-z0-9_. ]+)\(\d+\)".*?"input_running":\s*(true|false)/;
  static AVCAPTURE_USED_REGEX = /AVCaptureDevice was used for audio by "(.*?)"/;
  static AVCAPTURE_STOPPED_REGEX = /AVCaptureDevice was stopped being used for audio by "(.*?)"/;
  static BUNDLE_ID_REGEX = /BundleID\s*=\s*([A-Za-z0-9_.]+)/;
  matchRules = [
    {
      type: "mic-used",
      subsystem: "com.apple.coreaudio:as_server",
      matchSubstring: '\\"input_running\\":true',
      regex: R.SESSION_NAME_REGEX
    },
    {
      type: "mic-off",
      subsystem: "com.apple.coreaudio:as_server",
      matchSubstring: '\\"input_running\\":false',
      regex: R.SESSION_NAME_REGEX
    },
    {
      type: "mic-used",
      subsystem: "com.apple.audio.AVFAudio",
      matchSubstring: "AVCaptureDevice was used",
      regex: R.AVCAPTURE_USED_REGEX
    },
    {
      type: "mic-off",
      subsystem: "com.apple.audio.AVFAudio",
      matchSubstring: "AVCaptureDevice was stopped",
      regex: R.AVCAPTURE_STOPPED_REGEX
    },
    {
      type: "mic-used",
      subsystem: "com.apple.audio.ASDT",
      matchSubstring: "startStream: running state: 1"
    },
    {
      type: "mic-off",
      subsystem: "com.apple.audio.ASDT",
      matchSubstring: "stopStream: running state: 0"
    },
    // Firefox-specific rules for AUHAL subsystem
    {
      type: "mic-used",
      subsystem: "com.apple.coreaudio:AUHAL",
      matchSubstring: "connecting device"
    },
    {
      type: "mic-off",
      subsystem: "com.apple.coreaudio:AUHAL",
      matchSubstring: "nothing to teardown"
    },
    // Firefox AVCapture rules - only for specific patterns, not general coremedia
    {
      type: "mic-used",
      subsystem: "com.apple.coremedia",
      matchSubstring: "logging capture stack initiator"
    },
    // Bundle ID patterns for more accurate browser detection - only when actually using mic
    {
      type: "mic-used",
      matchSubstring: "BundleID",
      regex: R.BUNDLE_ID_REGEX
    },
    {
      type: "mic-off",
      matchSubstring: "BundleID",
      regex: R.BUNDLE_ID_REGEX
    }
  ];
  start() {
    if (this.proc)
      return;
    console.log("[MicMonitor] start() called");
    const s = ["stream", "--info", "--predicate", this.buildPredicate(), "--style", "default"], o = fe("log", s);
    this.proc = o, this.proc.stdout.on("data", (a) => {
      const i = a.toString();
      if (i.includes("Filtering the log data using") || i.includes("log stream"))
        return;
      const l = i.split(`
`);
      for (const d of l)
        d && d.length > 0 && this.lineBuffer.push(d);
      this.lineBuffer.length >= this.BATCH_SIZE ? this.processBatch() : this.batchTimeout || (this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_TIMEOUT_MS));
    }), this.proc.stderr.on("data", (a) => {
      D("[MicMonitor stderr]", a.toString());
    }), this.proc.on("exit", (a) => {
      console.log(`[MicMonitor] exited with code ${a}`), this.proc === o && (this.proc = null);
    });
  }
  buildPredicate() {
    const e = [];
    for (const a of this.matchRules) {
      let i = `eventMessage CONTAINS "${a.matchSubstring}"`;
      a.subsystem && (i = `(subsystem CONTAINS "${a.subsystem.split(":")[0]}" AND ${i})`), e.push(`(${i})`);
    }
    return `(${e.join(" || ")} || (subsystem CONTAINS "com.apple.coremedia" AND eventMessage CONTAINS "logging capture stack initiator")) AND (process CONTAINS "audio" OR process CONTAINS "coreaudio" OR process CONTAINS "AVFAudio" OR process CONTAINS "ASDT" OR process CONTAINS "AUHAL") AND NOT (eventMessage CONTAINS "debug" OR eventMessage CONTAINS "DEBUG" OR eventMessage CONTAINS "info" OR eventMessage CONTAINS "INFO" OR eventMessage CONTAINS "display" OR eventMessage CONTAINS "screen" OR eventMessage CONTAINS "loopback" OR eventMessage CONTAINS "getDisplayMedia" OR eventMessage CONTAINS "DesktopCapture" OR eventMessage CONTAINS "ScreenCapture" OR eventMessage CONTAINS "system_audio" OR eventMessage CONTAINS "system-audio" OR eventMessage CONTAINS "displaySurface" OR eventMessage CONTAINS "monitor" OR eventMessage CONTAINS "window")`;
  }
  processBatch() {
    if (this.batchTimeout && (clearTimeout(this.batchTimeout), this.batchTimeout = null), this.lineBuffer.length === 0)
      return;
    const e = Date.now();
    if (e - this.lastProcessTime < this.MIN_PROCESS_INTERVAL_MS) {
      this.batchTimeout = setTimeout(() => this.processBatch(), this.MIN_PROCESS_INTERVAL_MS);
      return;
    }
    this.lastProcessTime = e;
    const s = this.lineBuffer.splice(0, this.BATCH_SIZE);
    for (const o of s)
      this.processLine(o, e);
    this.cleanOldFrequencyCounters(e);
  }
  processLine(e, s) {
    if (!(e.includes("input_running") || e.includes("AVCaptureDevice") || e.includes("startStream") || e.includes("stopStream") || e.includes("connecting device") || e.includes("nothing to teardown") || e.includes("logging capture stack initiator") || e.includes("BundleID")) || e.includes("display") || e.includes("screen") || e.includes("loopback") || e.includes("getDisplayMedia") || e.includes("DesktopCapture") || e.includes("ScreenCapture") || e.includes("system_audio") || e.includes("system-audio") || e.includes("displaySurface") || e.includes("monitor") || e.includes("window") || e.includes("terminated") || e.includes("exited") || e.includes("cleanup") || e.includes("dealloc") || e.includes("destroy") || e.includes("shutdown") || e.includes("quit") || e.includes("close") || e.includes("disconnect") || e.includes("unload") || e.includes("teardown") || e.includes("release") || e.includes("finalize") || e.includes("session ended") || e.includes("meeting ended") || e.includes("call ended") || e.includes("hang up") || e.includes("leave meeting") || e.includes("leave call") || e.includes("endInterruption") || e.includes("going inactive") || e.includes("Category = MediaPlayback") || e.includes("Recording = NO") || e.includes('input_running":false') || e.includes("Active = NO") || e.includes("requestForSharedOwnership") || e.includes("stop") || // Filter out lines with empty deviceUIDs ONLY when they're part of cleanup events
    // (when input_running is true but we have cleanup indicators)
    e.includes('input_running":true') && e.includes('"deviceUIDs":[]') && (e.includes("Recording = NO") || e.includes("Active = NO") || e.includes("endInterruption") || e.includes("going inactive") || e.includes("stopStream")))
      return;
    const o = this.extractPattern(e), a = this.patternFrequencyCounter.get(o);
    if (a) {
      if (a.count++, a.count > this.HIGH_FREQ_THRESHOLD && s - a.firstSeen < this.FREQUENCY_WINDOW_MS)
        return;
    } else
      this.patternFrequencyCounter.set(o, { count: 1, firstSeen: s });
    for (const i of this.matchRules) {
      const l = i.matchSubstring.replace(/\\"/g, '"');
      if (e.includes(l)) {
        let d = "";
        if (i.regex) {
          const m = i.regex.exec(e);
          m?.[1] && (i.regex === R.SESSION_NAME_REGEX ? (m[2] === "true" && i.type === "mic-used" || m[2] === "false" && i.type === "mic-off") && (d = m[1]) : d = m[1]);
        }
        if (!d)
          continue;
        const b = hs(d);
        if (!b)
          break;
        if (i.matchSubstring === "BundleID" && (e.includes("endInterruption") || e.includes("going inactive") || e.includes('input_running":false') || e.includes("Active = NO") || e.includes("Category = MediaPlayback") || !(e.includes('"input_running":true') || e.includes("Recording = YES") && e.includes("Active = YES"))))
          continue;
        this.emit(i.type, { app: b, message: e });
        return;
      }
    }
  }
  extractPattern(e) {
    for (const s of this.matchRules) {
      const o = s.matchSubstring.replace(/\\"/g, '"');
      if (e.includes(o)) {
        let a = "";
        if (s.regex) {
          const d = s.regex.exec(e);
          d?.[1] && (a = d[1]);
        }
        const i = s.subsystem?.split(":")[0] || "generic", l = s.type === "mic-used" ? "used" : "off";
        return a ? `${l}_${i}_${a}` : `${l}_${i}_${o.replace(/[^a-zA-Z0-9]/g, "_")}`;
      }
    }
    return e.replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g, "T").replace(/\[\d+:\d+\]/g, "[P]").replace(/\(\d+\)/g, "(I)");
  }
  cleanOldFrequencyCounters(e) {
    for (const [s, o] of this.patternFrequencyCounter.entries())
      e - o.firstSeen > this.FREQUENCY_WINDOW_MS && this.patternFrequencyCounter.delete(s);
  }
  stop() {
    this.batchTimeout && (clearTimeout(this.batchTimeout), this.batchTimeout = null), this.proc && (this.proc.kill(), this.proc = null);
  }
}
const gs = N.object({
  session: N.object({
    name: N.string()
  }),
  details: N.object({
    input_running: N.boolean(),
    output_running: N.boolean(),
    implicit_category: N.string()
  })
}), ms = {
  "Google Chrome": "Google Chrome",
  "Google Chrome He": "Google Chrome",
  "Google Chrome Helper": "Google Chrome",
  firefox: "Mozilla Firefox",
  "com.apple.WebKit": "Safari",
  "Browser Helper": "Arc",
  Arc: "Arc Browser",
  "Arc Browser": "Arc Browser",
  // Alternative process name
  "Arc.app": "Arc Browser",
  // App bundle name
  "Microsoft Edge": "Microsoft Edge",
  "zoom.us": "Zoom",
  GoogleMeet: "Google Meet",
  // TODO: need to test
  "Slack Helper": "Slack",
  Slack: "Slack",
  "Microsoft Teams": "Microsoft Teams",
  RingCentral: "RingCentral",
  // Lower priority apps
  "Brave Browser": "Brave Browser",
  Brave: "Brave Browser",
  // Alternative process name
  "Brave.app": "Brave Browser",
  // App bundle name
  Opera: "Opera Browser",
  "Opera Browser": "Opera Browser",
  // Alternative process name
  "Opera.app": "Opera Browser",
  // App bundle name
  Vivaldi: "Vivaldi Browser",
  "Vivaldi Browser": "Vivaldi Browser",
  // Alternative process name
  "Vivaldi.app": "Vivaldi Browser",
  // App bundle name
  Comet: "Comet Browser",
  "Comet Browser": "Comet Browser",
  // Alternative process name
  "Comet.app": "Comet Browser",
  // App bundle name
  Dia: "Dia Browser",
  "Dia Browser": "Dia Browser",
  // Alternative process name
  "Dia.app": "Dia Browser",
  // App bundle name
  Fellou: "Fellou AI Browser",
  "Fellou AI": "Fellou AI Browser",
  // Alternative process name
  "Fellou.app": "Fellou AI Browser",
  // App bundle name
  VoiceMemos: "Voice Memos",
  FaceTime: "FaceTime",
  // TODO: need to test
  Discord: "Discord",
  // TODO: need to test
  QuickTimePlayer: "QuickTime Player"
  // TODO: need to test
};
class Ye extends we {
  proc = null;
  emitTimer = null;
  start() {
    if (this.proc)
      return;
    console.log("[MicMonitor] start() called");
    const s = fe("log", [
      "stream",
      "--info",
      "--predicate",
      'subsystem=="com.apple.coreaudio"',
      "--process",
      "audiomxd",
      "--style",
      "compact"
    ]);
    this.proc = s, this.proc.stdout.on("data", (o) => {
      const a = o.toString().split(`
`).filter(Boolean);
      for (const i of a)
        this.processLine(i);
    }), this.proc.stderr.on("data", (o) => {
      D("[MicMonitor stderr]", o.toString());
    }), this.proc.on("exit", (o) => {
      console.log(`[MicMonitor] exited with code ${o}`), this.proc === s && (this.proc = null);
    });
  }
  processLine(e) {
    if (!e.includes("input_running"))
      return;
    const s = e.match(/(\{.*\})$/);
    if (!s)
      return;
    let o;
    try {
      o = gs.parse(JSON.parse(s?.[1] ?? ""));
    } catch {
      return;
    }
    console.log(`[MicMonitor] DEBUG: matched line: ${e}`);
    const a = o.session.name.trim().replace(/\(\d+\)$/, ""), i = ms[a];
    if (!i)
      return;
    const { implicit_category: l, input_running: d } = o.details;
    d && (l === "Record" || l === "PlayAndRecord") ? this.debounceEmit("mic-used", { app: i }) : !d && l === "" && this.debounceEmit("mic-off", { app: i });
  }
  /**
   * Debounce the emit of an event to avoid rapid duplicate events per app
   * @param event - The event to emit
   * @param payload - The payload to emit
   * @param delay - The delay in milliseconds to debounce the emit
   */
  debounceEmit(e, s, o = 1e3) {
    this.emitTimer && clearTimeout(this.emitTimer), this.emitTimer = setTimeout(() => {
      this.emit(e, s), this.emitTimer = null;
    }, o);
  }
  stop() {
    this.proc && (this.proc.kill(), this.proc = null);
  }
}
class fs extends we {
  start() {
    oe.addEventListener("meeting-closed", async (e) => {
      this.emit("mic-off", { app: e.window.platform });
    }), oe.addEventListener("meeting-detected", async (e) => {
      this.emit("mic-used", { app: e.window.platform });
    }), oe.init({
      api_url: "https://us-west-2.recall.ai",
      acquirePermissionsOnStartup: ["microphone", "system-audio"]
    });
  }
  stop() {
    oe.shutdown();
  }
}
let S = null;
c.on("before-quit", () => ft());
function ws(t) {
  if (!S && k) {
    switch (t) {
      case "v1":
        S = new R();
        break;
      case "v2":
        S = new Ye();
        break;
      case "v3":
        S = new fs();
        break;
      default:
        S = new Ye();
        break;
    }
    S.start(), S.on("mic-used", (e) => {
      r.sendToWebContents("mic-used", e);
    }), S.on("mic-off", (e) => {
      r.sendToWebContents("mic-off", e);
    });
  }
}
function ft() {
  S && (S.stop(), S = null);
}
async function ys() {
  try {
    return r.setContentProtection(!0), await vs();
  } catch (t) {
    if (k)
      throw rt(), t;
    return await Ts();
  } finally {
    r.restoreUndetectability();
  }
}
async function bs() {
  const t = (process.env.DISPLAY || ":0").split(".")[0], e = [`${t}.1`, `${t}.0`], s = await import("node:fs"), o = await import("node:path"), a = "/app/test-results";
  try {
    s.mkdirSync(a, { recursive: !0 });
  } catch {
  }
  const i = [];
  for (const p of e)
    try {
      const v = p.replace(/[:]/g, ""), f = o.join(a, `test-image-${performance.now()}-${v}.png`);
      $e(`DISPLAY=${p} xwd -root | convert xwd:- png:${f}`, { stdio: "ignore" });
      const O = s.readFileSync(f);
      console.log(
        `[Screenshot] Saved root capture for ${p} -> ${f} (${O.length} bytes)`
      ), i.push({ data: O, path: f });
    } catch (v) {
      console.log(`[Screenshot] root capture failed for ${p}:`, v);
    }
  if (console.log("[Screenshot] Root capture:", JSON.stringify(i.map((p) => p.path))), i.length > 0)
    try {
      const p = o.join(a, "root-capture-combined.png"), v = i.map((f) => f.path).join(" ");
      if (i.length > 1) {
        $e(`convert ${v} +append ${p}`, { stdio: "ignore" });
        const f = s.readFileSync(p);
        return console.log(
          `[Screenshot] Saved combined root capture -> ${p} (${f.length} bytes)`
        ), { data: f, contentType: "image/png" };
      } else {
        const f = i[0];
        if (!f)
          throw new Error("No captures available after root capture phase");
        return { data: f.data, contentType: "image/png" };
      }
    } catch (p) {
      console.log("[Screenshot] failed to create combined root capture:", p);
      const v = i[0];
      if (!v)
        throw p;
      return { data: v.data, contentType: "image/png" };
    }
  const l = g.getAllDisplays(), d = Math.max(...l.map((p) => p.bounds.width)), b = Math.max(...l.map((p) => p.bounds.height)), m = await me.getSources({
    types: ["screen"],
    thumbnailSize: { width: d, height: b }
  }), E = l.map((p, v) => m.find((O) => O.display_id === p.id.toString()) ?? m[v] ?? m[0]).filter(Boolean);
  if (E.length === 0)
    throw new Error("Unable to capture screenshot: no screen sources found in Linux test mode");
  if (E.length === 1 && E[0])
    return { data: E[0].thumbnail.toPNG(), contentType: "image/png" };
  const F = r.getTargetDisplay();
  console.log("[Screenshot] targetDisplay=", F.id);
  const V = l.length > 0 ? l[0] : void 0, _ = l.find((p) => p.id !== F.id) ?? V;
  if (!_)
    throw new Error("Unable to capture screenshot: no displays available");
  console.log("[Screenshot] altDisplay=", _.id, _.bounds);
  const z = m.length > 0 ? m[0] : void 0, G = m.find((p) => p.display_id === _.id.toString()) ?? z;
  if (!G)
    throw new Error("Unable to capture screenshot: alternate screen source not found");
  try {
    const p = await import("node:fs"), v = await import("node:path"), f = "/app/test-results";
    try {
      p.mkdirSync(f, { recursive: !0 });
    } catch {
    }
    const O = `alt-display-${_.id}.png`, q = v.join(f, O), ee = G.thumbnail.toPNG();
    p.writeFileSync(q, ee), console.log(`Saved alt display screenshot to ${q} (${ee.length} bytes)`);
  } catch (p) {
    console.log(`Failed to write alt display screenshot: ${p}`);
  }
  return { data: G.thumbnail.toPNG(), contentType: "image/png" };
}
async function vs() {
  if (Oe && process.env.PLAYWRIGHT_ENV === "test")
    return bs();
  const t = r.getTargetDisplay(), e = await me.getSources({
    types: ["screen"],
    thumbnailSize: {
      width: t.bounds.width,
      height: t.bounds.height
    }
  }), s = e.find((a) => a.display_id === t.id.toString()) ?? e[0];
  if (!s) {
    const a = {
      display: { id: t.id },
      sources: e.map((i) => ({ id: i.id, name: i.name }))
    };
    throw new Error(
      `Unable to capture screenshot: no display source found; details: ${JSON.stringify(a)}`
    );
  }
  return { data: s.thumbnail.toPNG(), contentType: "image/png" };
}
async function Ts() {
  return {
    // this will just use the default display
    data: await _t({ format: "png" }),
    contentType: "image/png"
  };
}
let wt = y;
const j = /* @__PURE__ */ new Set();
function Ss(t) {
  if (j.has(t)) {
    console.warn(`Shortcut already registered: ${t}`);
    return;
  }
  j.add(t), be();
}
function Ds(t) {
  if (!j.has(t)) {
    console.warn(`Shortcut not registered: ${t}`);
    return;
  }
  j.delete(t), be();
}
function Cs() {
  wt = !0, be();
}
function As() {
  j.clear(), be();
}
function be() {
  X.unregisterAll();
  for (const t of j)
    X.register(t, () => {
      r.sendToWebContents("global-shortcut-triggered", { accelerator: t });
    }) || D(`Failed to register global shortcut: ${t}`);
  wt && (X.register("CommandOrControl+Alt+Shift+I", () => {
    Be(), ye();
  }), X.register("CommandOrControl+Alt+R", () => {
    r.getCurrentWindow().reload(), r.getDashboardWindow().reload();
  }), X.register("CommandOrControl+Alt+I", () => {
    r.getDashboardWindow().isFocused() ? (r.getDashboardWindow().toggleDevTools(), r.getCurrentWindow().closeDevTools()) : (r.getCurrentWindow().toggleDevTools(), r.getDashboardWindow().closeDevTools());
  }));
}
const Es = y ? `dev-${He()}` : He();
function _s() {
  u("quit-app", () => {
    c.quit();
  }), u("restart-window", () => {
    r.createOrRecreateWindows();
  }), u("check-for-update", () => {
    H.checkForUpdates();
  }), u("install-update", () => {
    ct();
  }), u("get-updater-state", () => {
    r.sendToWebContents("updater-state", lt());
  }), C("request-has-onboarded", async () => ({ hasOnboarded: it() })), C("check-mic-permission", async () => {
    if (Oe)
      return !0;
    try {
      return Ce.getMediaAccessStatus("microphone") === "granted";
    } catch (t) {
      return D("Media permission error:", t), !1;
    }
  }), C("request-media-permission", async (t, e) => {
    if (process.platform === "darwin") {
      if (e === "screen")
        try {
          return await me.getSources({ types: ["screen"] }), !0;
        } catch {
          return !1;
        }
      try {
        const s = Ce.getMediaAccessStatus(e);
        return s === "not-determined" ? await Ce.askForMediaAccess(e) : s === "granted";
      } catch (s) {
        return D("Media permission error:", s), !1;
      }
    }
    return !0;
  }), u("finish-onboarding", () => {
    Pt();
  }), u("reset-onboarding", () => {
    he(), rt();
  }), C("get-auto-launch-enabled", async () => ({ enabled: c.getLoginItemSettings().openAtLogin })), C("set-platform-access-token", (t, { accessToken: e }) => {
    Kt(e);
  }), u("set-auto-launch-enabled", (t, { enabled: e }) => {
    ot(e);
  }), u("register-global-shortcut", (t, { accelerator: e }) => {
    Ss(e);
  }), u("unregister-global-shortcut", (t, { accelerator: e }) => {
    Ds(e);
  }), u("enable-dev-shortcuts", () => {
    Cs();
  }), u("reset-global-shortcuts", () => {
    As();
  }), u("set-ignore-mouse-events", (t, { ignore: e }) => {
    r.getCurrentWindow().isIpcEventFromWindow(t) && r.getCurrentWindow().setIgnoreMouseEvents(e);
  }), u("resize-window", (t, { width: e, height: s, duration: o }) => {
    r.getCurrentWindow().resizeWindow(e, s, o);
  }), u("focus-window", () => {
    r.getCurrentWindow().focus();
  }), u("unfocus-window", () => {
    r.getCurrentWindow().blur();
  }), C("capture-screenshot", async () => {
    const { contentType: t, data: e } = await ys();
    return { contentType: t, data: e };
  }), C("get-login-protocol-state", () => ({ state: Es })), C("is-cursor-outside-target-display", () => r.isCursorOutsideTargetDisplay()), C("move-window-to-display-containing-cursor", () => ({ postMoveInfo: r.moveToDisplayContainingCursor() })), u("get-available-displays", () => {
    const t = gt();
    r.sendToWebContents("available-displays", { displays: t });
  }), u("get-invisible", () => {
    r.sendToWebContents("invisible-changed", {
      invisible: x()
    });
  }), u(
    "move-window-to-display",
    (t, { displayId: e, preservePosition: s, cursorScreenX: o, cursorScreenY: a }) => {
      const i = mt(e);
      i && r.setTargetDisplay(i, {
        preservePosition: s,
        cursorScreenX: o,
        cursorScreenY: a
      });
    }
  ), u("show-display-overlays", () => {
    ae.showOverlays();
  }), u("hide-display-overlays", () => {
    console.log("[IPC] hide-display-overlays called"), ae.hideOverlays();
  }), u("highlight-display", (t, { displayId: e }) => {
    ae.highlightDisplay(e);
  }), u("unhighlight-display", (t, { displayId: e }) => {
    ae.unhighlightDisplay(e);
  }), u("toggle-invisible", (t) => {
    Be(), ye();
  }), u("set-tray-initialized", () => {
    P.setShouldInitializeTray(), P.initializeTray();
  }), u("set-tray-hidden-state", (t, { hidden: e }) => {
    P.setHiddenState(e);
  }), u("set-tray-in-session-state", (t, { inSession: e }) => {
    P.setInSessionState(e);
  }), u("set-tray-logged-in-state", (t, { loggedIn: e }) => {
    P.setLoggedInState(e);
  }), u("set-invisible-preference", (t, { invisible: e }) => {
    e ? Ne() : he();
  }), u("login-user", (t, { userEmail: e }) => {
    Bt(e);
  }), u("logout-user", (t) => {
    Nt();
  }), u("broadcast-to-all-windows", (t, e) => {
    r.sendToWebContents("broadcast-to-all-windows", e);
  }), u("set-dashboard-visibility", (t, { visible: e }) => {
    r.getDashboardWindow().setVisibility(e);
  }), u("set-dashboard-state", (t, { state: e }) => {
    ut(e);
  }), u("get-dashboard-window-state", (t) => {
    pt();
  }), u("maximize-dashboard-window", () => {
    r.getDashboardWindow().maximize();
  }), u("minimize-dashboard-window", () => {
    r.getDashboardWindow().minimize();
  }), A && u("windows-open-system-settings", (t, { section: e }) => {
    e === "sound-settings" && Dt("start ms-settings:sound", { shell: "cmd.exe" });
  }), k && (C("mac-check-macos-version", async () => {
    const { isSupported: t } = await rs();
    return { isSupported: t };
  }), u("mac-open-system-settings", (t, { section: e }) => {
    e === "privacy > microphone" && le.openExternal(
      "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"
    ), e === "privacy > screen-recording" && le.openExternal(
      "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"
    ), e === "sound > input" && le.openExternal("x-apple.systempreferences:com.apple.preference.sound?input");
  }), u("mac-enable-native-recorder", (t, { sampleRate: e }) => {
    ds(r.getCurrentWindow(), e);
  }), u("mac-disable-native-recorder", () => {
    We();
  }), u("mac-set-mic-monitor-enabled", (t, { enabled: e, version: s }) => {
    e ? ws(s) : ft();
  }));
}
function Os() {
  const t = () => {
    const e = r.getTargetDisplay();
    g.getAllDisplays().some((i) => i.id === e.id) ? r.setTargetDisplay(e) : (r.setTargetDisplay(g.getPrimaryDisplay()), r.sendToWebContents("recenter-movable-windows", null));
    const a = gt();
    r.sendToWebContents("available-displays", { displays: a });
  };
  g.on("display-added", t), g.on("display-removed", t), g.on("display-metrics-changed", t);
}
function Is() {
  y && process.env.PLAYWRIGHT_ENV !== "test" || _e.handle("app", async (t) => await (async () => {
    const { host: o, pathname: a } = new URL(t.url);
    if (o !== "renderer" || a.includes(".."))
      return null;
    const i = U.join(U.resolve(L, "../renderer"), a);
    return bt.fetch(Ot(i).toString());
  })() || new Response("bad", {
    status: 400,
    headers: { "content-type": "text/html" }
  }));
}
let ue = null;
function Rs(t) {
  ue = t;
}
function Ms() {
  je.on("request", (t) => {
    r.handleDockIcon(), r.sendToWebContents("app-focus", null);
    const e = r.getCurrentWindow();
    e instanceof ce && e.show(), Ee(t);
  }), je.initialize({
    protocol: st,
    mode: y ? "development" : "production"
  }), Ke(process.argv), c.on("second-instance", (t, e) => {
    r.sendToWebContents("app-focus", null), Ke(e);
  }), c.on("activate", () => {
    r.handleDockIcon(), r.sendToWebContents("app-focus", null);
  }), r.getDashboardWindow().onceDidFinishLoad(() => {
    ue && (Ee(ue), ue = null);
  }), _e.handle(ht, zt);
}
function Ke(t) {
  const e = t.find((s) => s.startsWith(`${st}://`));
  e && Ee(e);
}
function Ee(t) {
  const e = new URL(t), s = e.hostname, o = e.pathname, a = Object.fromEntries(e.searchParams);
  r.sendToWebContents("protocol-data", { route: s, path: o, params: a });
}
function ks() {
  const t = K.buildFromTemplate([
    // override Cmd+H and Cmd+Q to both just hide the app
    {
      role: "appMenu",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        {
          label: `Hide ${T}`,
          accelerator: "Cmd+H",
          click: () => {
            r.getDashboardWindow().setVisibility(!1), r.sendToWebContents("hide-window", { reason: "native_close_requested" });
          }
        },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        {
          label: `Quit ${T}`,
          accelerator: "Cmd+Q",
          click: () => {
            r.fakeQuit();
          }
        }
      ]
    },
    // override Cmd+W to just close the dashboard window
    {
      role: "fileMenu",
      submenu: [
        {
          label: "Close Window",
          accelerator: "Cmd+W",
          click: () => {
            r.getDashboardWindow().setVisibility(!1);
          }
        }
      ]
    },
    // preserve Cmd+C, Cmd+V, etc.
    { role: "editMenu" }
  ]);
  K.setApplicationMenu(t);
}
function Bs() {
  Q.defaultSession.setDisplayMediaRequestHandler(
    (t, e) => {
      me.getSources({ types: ["screen"] }).then((s) => {
        const o = g.getAllDisplays();
        for (const l of o)
          if (l.internal) {
            const d = s.find(
              (b) => b.display_id === String(l.id)
            );
            if (d) {
              e({ video: d, audio: "loopback" });
              return;
            }
          }
        const a = g.getPrimaryDisplay(), i = s.find(
          (l) => l.display_id === String(a.id)
        );
        if (i) {
          e({ video: i, audio: "loopback" });
          return;
        }
        e({ video: s[0], audio: "loopback" });
      }).catch((s) => {
        console.error("Error getting display media sources:", s), e({});
      });
    },
    // always use our custom handler
    { useSystemPicker: !1 }
  );
}
y && (c.commandLine.appendSwitch("allow-insecure-localhost"), c.on("certificate-error", (t, e, s, o, a, i) => {
  if (s.startsWith(new URL("https://desktop.cluely.com").origin)) {
    t.preventDefault(), i(!0);
    return;
  }
  i(!1);
}));
!y && k && !c.isInApplicationsFolder() && c.moveToApplicationsFolder();
k && c.dock?.hide();
A && (c.requestSingleInstanceLock() || (c.quit(), process.exit(0)));
process.env.PLAYWRIGHT_ENV === "test" && Oe && (c.commandLine.appendSwitch("no-sandbox"), c.commandLine.appendSwitch("disable-dev-shm-usage"), c.commandLine.appendSwitch("disable-gpu"));
const Ns = !y || process.env.PLAYWRIGHT_ENV === "test";
Ns && _e.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: !0,
      secure: !0,
      supportFetchAPI: !0
    }
  }
]);
async function Ps() {
  A && c.disableHardwareAcceleration(), c.on("open-url", (t, e) => {
    Rs(e);
  }), await c.whenReady(), y && Q.defaultSession.setCertificateVerifyProc((t, e) => {
    const { hostname: s } = t;
    if (!s) {
      e(-3);
      return;
    }
    if (s === new URL("https://desktop.cluely.com").hostname) {
      e(0);
      return;
    }
    e(-3);
  }), St.setAppUserModelId(`com.${nt}`), ks(), Bs(), Is(), Qt(), r.createOrRecreateWindows(), _s(), Ft(), Os(), Ms();
}
Ps();
//# sourceMappingURL=index.js.map
