import { notificationBridge } from "./state-bridge";

export interface SigWebStatus {
  isSigWebInstalled: boolean;
  sigWebVersion: string | null;
  isExtensionInstalled: boolean;
  isExtLiteAppInstalled: boolean;
  activeMethod: "ext-lite" | "sigweb-plain" | "none" | "simulation";
}

export interface SignatureData {
  sigString: string;
  base64: string;
}

declare global {
  interface Window {
    Topaz?: {
      Global: {
        GetSigPlusExtLiteNMHVersion: () => Promise<string>;
      };
      Canvas: {
        LCDTablet: {
          ClearTablet: () => Promise<void>;
        };
        Sign: {
          StartSign: (canvas: HTMLCanvasElement) => Promise<void>;
          GetSigString: () => Promise<string>;
          GetSignatureImage: () => Promise<string>;
          SetTabletState: (state: number) => Promise<void>;
          ClearSign: () => Promise<void>;
        };
      };
    };
    GetSigWebVersion?: () => string;
    IsSigWebInstalled?: () => boolean;
    SetTabletState?: (
      state: number,
      ctx: CanvasRenderingContext2D | number | null,
      delay: number,
    ) => number;
    ClearTablet?: () => void;
    GetSigString?: () => string;
    GetSigImageB64?: (callback: (data: string) => void) => void;
    SetDisplayXSize?: (size: number) => void;
    SetDisplayYSize?: (size: number) => void;
    SetImageXSize?: (size: number) => void;
    SetImageYSize?: (size: number) => void;
    SetImagePenWidth?: (width: number) => void;
    SetSigCompressionMode?: (mode: number) => void;
    NumberOfTabletPoints?: () => number;
    SetJustifyMode?: (mode: number) => void;
    Reset?: () => void;
    GetDaysUntilCertificateExpires?: () => number;
  }
}

class SigWebWrapperService {
  private simulationMode = {
    extension: true,
    app: true,
    sigweb: true,
  };

  private useSimulation = false;
  private isExtLiteLoaded = false;
  private isSigWebLoaded = false;
  private tabletTimer: number | null = null;

  setSimulation(enabled: boolean, extension: boolean, app: boolean, sigweb: boolean) {
    this.useSimulation = enabled;
    this.simulationMode = { extension, app, sigweb };
  }

  async detectStatus(): Promise<SigWebStatus> {
    if (this.useSimulation) {
      const status: SigWebStatus = {
        isSigWebInstalled: this.simulationMode.sigweb,
        sigWebVersion: this.simulationMode.sigweb ? "SIM-1.7.5.0" : null,
        isExtensionInstalled: this.simulationMode.extension,
        isExtLiteAppInstalled: this.simulationMode.app,
        activeMethod: "simulation",
      };
      this.checkAndNotify(status);
      return status;
    }

    const isExtensionInstalled = !!document.documentElement.getAttribute(
      "SigPlusExtLiteExtension-installed",
    );
    let isExtLiteAppInstalled = false;
    let sigWebVersion: string | null = null;
    let isSigWebInstalled = false;

    if (isExtensionInstalled) {
      await this.ensureExtLiteLoaded();
      if (window.Topaz?.Global) {
        try {
          const nmhVersion = await window.Topaz.Global.GetSigPlusExtLiteNMHVersion();
          isExtLiteAppInstalled = !!nmhVersion && nmhVersion !== "0";
        } catch (e) {
          console.error("Error getting NMH version", e);
        }
      }
    }

    await this.ensureSigWebLoaded();

    if (typeof window.IsSigWebInstalled === "function") {
      isSigWebInstalled = window.IsSigWebInstalled();
      if (isSigWebInstalled && typeof window.GetSigWebVersion === "function") {
        sigWebVersion = window.GetSigWebVersion();
      }
    } else {
      // If the SDK script is not loaded, we can still attempt to detect if the service
      // is running by hitting the SigWeb local API directly.
      const manualStatus = await this.detectSigWebManually();
      isSigWebInstalled = manualStatus.isInstalled;
      sigWebVersion = manualStatus.version;
    }

    const activeMethod =
      isExtensionInstalled && isExtLiteAppInstalled
        ? "ext-lite"
        : isSigWebInstalled
          ? "sigweb-plain"
          : "none";

    const status: SigWebStatus = {
      isSigWebInstalled,
      sigWebVersion,
      isExtensionInstalled,
      isExtLiteAppInstalled,
      activeMethod,
    };

    this.checkAndNotify(status);
    return status;
  }

  private checkAndNotify(status: SigWebStatus) {
    if (status.isExtensionInstalled && !status.isExtLiteAppInstalled) {
      notificationBridge.send(
        "warning",
        "Topaz SigPlusExtLite extension is installed, but the companion application is missing. Please contact HelpDesk and ask for 'Topaz SigPlusExtLite SDK installation'.",
      );
    } else if (!status.isExtensionInstalled && !status.isSigWebInstalled) {
      notificationBridge.send(
        "error",
        "No Topaz signature software detected. Please contact HelpDesk to install 'SigWeb' or 'SigPlusExtLite'.",
      );
    }
  }

  private async ensureExtLiteLoaded(): Promise<void> {
    if (this.isExtLiteLoaded || window.Topaz) {
      this.isExtLiteLoaded = true;
      return;
    }

    const url = document.documentElement.getAttribute("SigPlusExtLiteWrapperURL");
    if (url) {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = url;
        script.onload = () => {
          this.isExtLiteLoaded = true;
          resolve();
        };
        script.onerror = () => {
          console.error("Failed to load SigPlusExtLiteWrapper");
          resolve();
        };
        document.head.appendChild(script);
      });
    }
  }

  private async ensureSigWebLoaded(): Promise<void> {
    if (this.isSigWebLoaded || typeof window.IsSigWebInstalled === "function") {
      this.isSigWebLoaded = true;
      return;
    }

    // Default to bundled version, but allow override via attribute
    let url = document.documentElement.getAttribute("SigWebTabletWrapperURL");

    if (!url) {
      // In IIFE mode, we can use document.currentScript to find our own location
      // and load SigWebTablet.min.js from the same folder.
      const currentScript = document.currentScript as HTMLScriptElement;
      const baseUrl = currentScript?.src || window.location.href;
      const lastSlash = baseUrl.lastIndexOf("/");
      const baseDir = lastSlash !== -1 ? baseUrl.substring(0, lastSlash + 1) : "";
      url = baseDir + "SigWebTablet.min.js";
    }

    if (url) {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = url;
        script.onload = () => {
          this.isSigWebLoaded = true;
          resolve();
        };
        script.onerror = () => {
          console.error("Failed to load SigWebTablet.min.js from " + url);
          resolve();
        };
        document.head.appendChild(script);
      });
    }
  }

  private async detectSigWebManually(): Promise<{ isInstalled: boolean; version: string | null }> {
    const baseUri = this.getSigWebBaseUri();
    try {
      // Use a small timeout for detection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${baseUri}SigWebVersion?noCache=${Date.now()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        // SigWeb returns version wrapped in quotes, e.g. "1.7.3.0"
        return { isInstalled: true, version: text.replace(/"/g, "") };
      }
    } catch (e) {
      // Service likely not running or blocked
    }
    return { isInstalled: false, version: null };
  }

  private getSigWebBaseUri(): string {
    const prot = window.location.protocol === "https:" ? "https:" : "http:";
    const port = prot === "https:" ? 47290 : 47289;
    // We use the domain tablet.sigwebtablet.com which should be mapped to 127.0.0.1 in hosts
    return `${prot}//tablet.sigwebtablet.com:${port}/SigWeb/`;
  }

  async startCapture(canvas: HTMLCanvasElement): Promise<boolean> {
    const status = await this.detectStatus();
    if (status.activeMethod === "ext-lite") {
      await window.Topaz?.Canvas.LCDTablet.ClearTablet();
      await window.Topaz?.Canvas.Sign.StartSign(canvas);
      return true;
    } else if (status.activeMethod === "sigweb-plain") {
      const ctx = canvas.getContext("2d");
      window.SetDisplayXSize?.(canvas.width);
      window.SetDisplayYSize?.(canvas.height);
      window.SetTabletState?.(0, this.tabletTimer, 50);
      window.ClearTablet?.();
      this.tabletTimer = window.SetTabletState?.(1, ctx, 50) ?? null;
      return true;
    } else if (this.useSimulation) {
      console.log("Simulating capture start");
      return true;
    }
    return false;
  }

  async stopCapture(): Promise<SignatureData | null> {
    const status = await this.detectStatus();
    if (status.activeMethod === "ext-lite") {
      const sigString = (await window.Topaz?.Canvas.Sign.GetSigString()) || "";
      const rawImage = (await window.Topaz?.Canvas.Sign.GetSignatureImage()) || "";
      let base64 = "";
      if (rawImage) {
        const location = rawImage.search("base64,");
        base64 = rawImage.slice(location + 7);
      }

      await window.Topaz?.Canvas.LCDTablet.ClearTablet();
      await window.Topaz?.Canvas.Sign.SetTabletState(0);

      return { sigString, base64 };
    } else if (status.activeMethod === "sigweb-plain") {
      window.SetTabletState?.(0, this.tabletTimer, 50);
      this.tabletTimer = null;
      window.SetSigCompressionMode?.(1);
      const sigString = window.GetSigString?.() || "";

      return new Promise((resolve) => {
        window.SetImageXSize?.(500);
        window.SetImageYSize?.(100);
        window.SetImagePenWidth?.(5);
        window.GetSigImageB64?.((str: string) => {
          resolve({ sigString, base64: str });
        });
      });
    } else if (this.useSimulation) {
      return { sigString: "SIMULATED_SIG_STRING", base64: "SIMULATED_BASE64" };
    }
    return null;
  }

  async clear(): Promise<void> {
    const status = await this.detectStatus();
    if (status.activeMethod === "ext-lite") {
      await window.Topaz?.Canvas.Sign.ClearSign();
      await window.Topaz?.Canvas.LCDTablet.ClearTablet();
    } else if (status.activeMethod === "sigweb-plain") {
      window.ClearTablet?.();
    } else if (status.activeMethod === "simulation") {
      console.log("Simulating clear");
    }
  }
}

export const sigWebWrapper = new SigWebWrapperService();
