import { useEffect, useRef, useState } from "react";
import { sigWebWrapper, type SigWebStatus, type SignatureData } from "../services/sigweb-wrapper";

const SigWebDemo = () => {
  const [status, setStatus] = useState<SigWebStatus | null>(null);
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [simulation, setSimulation] = useState({
    enabled: false,
    extension: true,
    app: true,
    sigweb: true,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const refreshStatus = async () => {
    const newStatus = await sigWebWrapper.detectStatus();
    setStatus(newStatus);
  };

  useEffect(() => {
    sigWebWrapper.setSimulation(
      simulation.enabled,
      simulation.extension,
      simulation.app,
      simulation.sigweb,
    );
    sigWebWrapper.detectStatus().then(setStatus);
  }, [simulation]);

  const startSign = async () => {
    if (canvasRef.current) {
      const success = await sigWebWrapper.startCapture(canvasRef.current);
      if (success) {
        setIsCapturing(true);
        setSignature(null);
      }
    }
  };

  const doneSign = async () => {
    const data = await sigWebWrapper.stopCapture();
    setSignature(data);
    setIsCapturing(false);
  };

  const clearSign = async () => {
    await sigWebWrapper.clear();
    setSignature(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const toggleSimulation = (key: keyof typeof simulation) => {
    setSimulation((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="react-island-container wics-card">
      <div className="wics-header">SigWeb Compatibility Demo</div>

      <div className="space-y-4 p-4">
        {/* Simulation Controls */}
        <div className="space-y-2 rounded-md bg-gray-100 p-3">
          <div className="text-sm font-semibold">Simulation Mode</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleSimulation("enabled")}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${simulation.enabled ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}>
              {simulation.enabled ? "Simulation ON" : "Simulation OFF"}
            </button>
            <button
              disabled={!simulation.enabled}
              onClick={() => toggleSimulation("extension")}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${!simulation.enabled ? "cursor-not-allowed opacity-50" : simulation.extension ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
              Extension: {simulation.extension ? "Installed" : "Missing"}
            </button>
            <button
              disabled={!simulation.enabled}
              onClick={() => toggleSimulation("app")}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${!simulation.enabled ? "cursor-not-allowed opacity-50" : simulation.app ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
              App/NMH: {simulation.app ? "Installed" : "Missing"}
            </button>
            <button
              disabled={!simulation.enabled}
              onClick={() => toggleSimulation("sigweb")}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${!simulation.enabled ? "cursor-not-allowed opacity-50" : simulation.sigweb ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
              SigWeb: {simulation.sigweb ? "Installed" : "Missing"}
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border bg-white p-2">
            <div className="text-xs text-gray-500">Active Method</div>
            <div className="font-mono font-bold uppercase">
              {status?.activeMethod || "detecting..."}
            </div>
          </div>
          <div className="rounded border bg-white p-2">
            <div className="text-xs text-gray-500">SigWeb Version</div>
            <div className="font-mono">{status?.sigWebVersion || "N/A"}</div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={150}
            className="rounded border-2 border-gray-400 bg-white shadow-inner"
          />
          <div className="mt-4 flex gap-2">
            {!isCapturing ? (
              <button
                onClick={startSign}
                className="rounded bg-green-600 px-6 py-2 font-bold text-white shadow transition-colors hover:bg-green-700">
                Sign
              </button>
            ) : (
              <button
                onClick={doneSign}
                className="rounded bg-blue-600 px-6 py-2 font-bold text-white shadow transition-colors hover:bg-blue-700">
                Done
              </button>
            )}
            <button
              onClick={clearSign}
              className="rounded bg-gray-200 px-6 py-2 font-bold text-gray-800 transition-colors hover:bg-gray-300">
              Clear
            </button>
            <button
              onClick={refreshStatus}
              className="rounded border bg-white px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-50">
              Refresh Status
            </button>
          </div>
        </div>

        {/* Results Area */}
        {signature && (
          <div className="space-y-2">
            <div>
              <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                SigString (Biometric Data)
              </div>
              <textarea
                readOnly
                value={signature.sigString}
                className="h-24 w-full rounded border bg-gray-50 p-2 font-mono text-xs"
              />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Base64 Image
              </div>
              <div className="flex items-start gap-2">
                <textarea
                  readOnly
                  value={signature.base64}
                  className="h-24 flex-1 rounded border bg-gray-50 p-2 font-mono text-xs"
                />
                {signature.base64 && signature.base64 !== "SIMULATED_BASE64" && (
                  <div className="rounded border bg-white p-1">
                    <img
                      src={`data:image/png;base64,${signature.base64}`}
                      alt="Signature Preview"
                      className="max-h-[80px] max-w-[150px]"
                    />
                  </div>
                )}
                {signature.base64 === "SIMULATED_BASE64" && (
                  <div className="rounded border bg-gray-100 p-4 text-xs text-gray-400 italic">
                    [Simulation Placeholder]
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SigWebDemo;
