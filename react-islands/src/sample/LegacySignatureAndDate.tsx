import React, { useRef, useState } from "react";
import { sigWebWrapper } from "../services/sigweb-wrapper";

interface LegacySignatureAndDateProps {
  mode?: string;
  signatureAvailable?: string;
  name: string;
  signatureCaption?: string;
  dateCaption?: string;
  displayAddButton?: boolean;
}

const LegacySignatureAndDate: React.FC<LegacySignatureAndDateProps> = ({
  mode,
  signatureAvailable,
  name,
  signatureCaption = "",
  dateCaption = "",
  displayAddButton = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [printedDate, setPrintedDate] = useState("");
  const [signed, setSigned] = useState(signatureAvailable === "Y" ? "Y" : "");
  const [dateSigned, setDateSigned] = useState("");
  const [signedOnDate, setSignedOnDate] = useState("");

  // Use props to avoid TS6133
  console.log(
    `LegacySignatureAndDate initialized for ${name} in mode ${mode}. Signature available: ${signatureAvailable}`,
  );

  const handleSign = async () => {
    if (canvasRef.current) {
      const success = await sigWebWrapper.startCapture(canvasRef.current);
      if (success) {
        setIsCapturing(true);
        setSigned("Y");
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const fullDate = dateStr + " " + timeStr;

        setPrintedDate(fullDate);
        setDateSigned(dateStr);
        setSignedOnDate(fullDate);
      }
    }
  };

  const handleClear = async () => {
    await sigWebWrapper.clear();
    setIsCapturing(false);
    setPrintedDate("");
    setSigned("");
    setDateSigned("");
    setSignedOnDate("");
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleAddSignature = () => {
    alert(`Add Signature clicked for ${name}`);
    setSigned("Y");
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    const fullDate = dateStr + " " + timeStr;

    setPrintedDate(fullDate);
    setDateSigned(dateStr);
    setSignedOnDate(fullDate);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Hidden fields for legacy JS compatibility */}
      <input type="hidden" name={`${name}Signed`} id={`${name}Signed`} value={signed} />
      <input type="hidden" name={`${name}DateSigned`} id={`${name}DateSigned`} value={dateSigned} />
      <input
        type="hidden"
        name={`${name}SignedOnDate`}
        id={`${name}SignedOnDate`}
        value={signedOnDate}
      />

      <table border={0} width="100%" cellSpacing="0" cellPadding="0">
        <tbody>
          <tr>
            <td>
              <table border={0} width="100%" cellSpacing="0" cellPadding="0">
                <tbody>
                  <tr>
                    <td align="center" width="75%" valign="bottom">
                      <div style={{ position: "relative", top: 10 }}>
                        <img
                          id={`${name}Img`}
                          height="35"
                          width="200"
                          src="/eomis/servlet/com.marquis.eomis.OffenderStandardFormServlet?option=sendNoSignature"
                          style={{ visibility: "hidden" }}
                          alt="Signature"
                        />
                      </div>
                    </td>
                    <td width="3%"></td>
                    <td align="center" width="22%" valign="bottom">
                      {dateCaption || <>&nbsp;</>}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" valign="bottom">
                      <canvas
                        ref={canvasRef}
                        id={`${name}Canvas`}
                        width={200}
                        height={75}
                        className="legacy-sig-canvas"
                        style={{ border: "1px solid #ccc" }}
                      />
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td align="center">
                      <hr
                        style={{ border: "none", borderTop: "1px solid black", margin: "4px 0" }}
                      />
                      {signatureCaption}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td align="center" style={{ whiteSpace: "nowrap" }}>
              <input
                type="button"
                id={`${name}SignButton`}
                name={`${name}SignButton`}
                value="Sign"
                onClick={handleSign}
                style={{ visibility: isCapturing ? "hidden" : "visible" }}
              />
              <input
                type="button"
                id={`${name}ClearButton`}
                name={`${name}ClearButton`}
                value="Clear"
                onClick={handleClear}
              />
              &nbsp;
              {displayAddButton && (
                <input
                  type="button"
                  id={`${name}AddButton`}
                  name={`${name}AddButton`}
                  value="Add Signature"
                  onClick={handleAddSignature}
                />
              )}
            </td>
          </tr>
          <tr>
            <td align="center" valign="top">
              <p style={{ textAlign: "center" }}>
                <input
                  name={`${name}PrintedDate`}
                  id={`${name}PrintedTime`}
                  type="text"
                  size={20}
                  value={printedDate}
                  tabIndex={-1}
                  style={{ border: "0px", backgroundColor: "transparent", textAlign: "center" }}
                  readOnly
                />
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LegacySignatureAndDate;
