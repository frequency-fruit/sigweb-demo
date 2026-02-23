import React from "react";

const StyleDemo: React.FC = () => {
  return (
    <div className="react-island-container bg-white font-sans text-sm">
      {/* Top Header */}
      <div className="bg-wics-navy text-white px-4 py-1 flex justify-between items-center text-xs">
        <div>Logged in as: <span className="font-bold">Jesse</span></div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline text-[10px]">Search</a>
          <a href="#" className="hover:underline text-[10px]">Reference</a>
          <a href="#" className="hover:underline text-[10px]">Help</a>
          <a href="#" className="hover:underline text-[10px]">Logoff</a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex text-white overflow-hidden text-xs">
        {["Offender", "Prison", "Health", "Supervision", "Support", "Administration"].map((tab, i) => (
          <div
            key={tab}
            className={`wics-tab ${i === 0 ? "wics-tab-active" : "hover:bg-blue-600"}`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-wics-gray-sidebar min-h-screen border-r border-gray-400 p-2">
          <ul className="space-y-1 text-xs">
            <li className="font-bold border-b border-gray-400 pb-1 mb-1">Personal Favorites</li>
            <li className="font-bold border-b border-gray-400 pb-1 mb-1">Inmate Record</li>
            <li className="font-bold border-b border-gray-400 pb-1 mb-1 text-wics-navy">Population Tracking</li>
            <ul className="pl-4 space-y-1 mt-1">
              <li className="hover:text-blue-700 cursor-pointer">Notification</li>
              <li className="hover:text-blue-700 cursor-pointer">External Movements</li>
              <li className="hover:text-blue-700 cursor-pointer">Admit Memo Search</li>
              <li className="hover:text-blue-700 cursor-pointer font-bold border-l-4 border-wics-navy pl-2">Conduct Reports</li>
              <li className="hover:text-blue-700 cursor-pointer">Detainee Departures Search</li>
              <li className="hover:text-blue-700 cursor-pointer">Inmates Out Overnight Search</li>
              <li className="hover:text-blue-700 cursor-pointer text-gray-400">Inmates Without a Bed Search</li>
            </ul>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {/* Breadcrumb Bar */}
          <div className="wics-breadcrumb-bar">
            <div className="bg-white text-blue-800 px-1 rounded-sm text-[10px]">🏠</div>
            <div className="flex items-center gap-2">
                <span>Prison</span>
                <span className="text-[10px]">▶</span>
                <span>Conduct Reports</span>
                <span className="text-[10px]">▶</span>
                <span className="font-bold">Conduct Reports</span>
            </div>
          </div>

          <div className="p-4">
            {/* Information Banner */}
            <div className="wics-banner-panel mb-4 flex justify-between">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-black border border-gray-400"></div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-xs">
                  <div><span className="font-bold">Name:</span> <span className="text-wics-blue-dark">DOE, JOHN</span></div>
                  <div><span className="font-bold">DOC #:</span> 123456 <span className="font-bold ml-4">PID #:</span> 789012</div>
                  <div><span className="font-bold">PED:</span> 01/01/2030</div>
                  <div><span className="font-bold">Max. Dt.:</span> 01/01/2040</div>
                  <div><span className="font-bold">DOB:</span> 01/01/1980</div>
                  <div><span className="font-bold">Race/Sex:</span> W / M</div>
                  <div><span className="font-bold">Curr. Loc.:</span> PRISON A</div>
                  <div><span className="font-bold">Curr. Status:</span> ACTIVE</div>
                </div>
              </div>
              <div className="absolute bottom-[-12px] right-6 flex gap-1">
                {["SH", "SPN", "V", "Sch"].map((icon) => (
                  <div key={icon} className="bg-yellow-300 border border-gray-500 px-1.5 py-0.5 text-[10px] font-bold rounded shadow-sm">
                    {icon}
                  </div>
                ))}
              </div>
              <div className="absolute top-2 right-4 text-[10px] italic">INMATE (OMSS051)</div>
            </div>

            {/* Main Content Card */}
            <div className="wics-card overflow-hidden">
              <div className="wics-header flex justify-between items-center text-xs">
                <span>ISSS001B - Conduct Reports</span>
                <div className="flex gap-1">
                    <button className="bg-white border border-gray-400 px-1 hover:bg-gray-100">📁</button>
                    <button className="bg-white border border-gray-400 px-1 hover:bg-gray-100">🖨️</button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                    <span className="wics-badge text-xl px-6">Draft</span>
                </div>

                <div className="border border-gray-300 p-6 bg-white/50 space-y-2">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked readOnly className="w-4 h-4" />
                        <label className="text-sm">Security Director Approved</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <label className="text-sm">Deputy Warden Approved</label>
                    </div>
                    <div className="flex justify-end items-center gap-6 mt-4">
                        <span className="text-sm">Report Status*: <span className="font-bold italic">Draft</span></span>
                        <button className="wics-btn text-sm">
                            Conduct Report Status History
                        </button>
                    </div>
                </div>

                <fieldset className="border border-gray-300 p-4 rounded shadow-inner bg-white/30">
                    <legend className="px-2 font-bold text-xs text-wics-navy flex items-center gap-1 cursor-pointer hover:underline">
                        <span>▶</span> Error Correction Comments (0 Comments)
                    </legend>
                    <div className="h-12 bg-white/50 border border-gray-200 mt-2"></div>
                </fieldset>

                <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-200">
                    <button className="wics-btn shadow-md">Print DOC-9 Adult Conduct Report</button>
                    <button className="wics-btn shadow-md">Print DOC-9 Packet</button>
                    <button className="wics-btn shadow-md">Error Correction</button>
                    <button className="wics-btn shadow-md">Prior Page</button>
                </div>

                <div className="text-center">
                    <a href="#" className="text-blue-700 underline text-[10px]">Show Last Updated Information</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-wics-navy text-white px-4 py-1 flex justify-between items-center text-[10px] mt-4 border-t-2 border-wics-blue-light">
        <div>powered by <span className="font-bold italic text-blue-300">OMIS</span> v4.5 © Copyright 2000-2026. All rights reserved.</div>
        <div className="opacity-80">Page loaded 2/20/2026 1:39:18 PM</div>
      </div>
    </div>
  );
};

export default StyleDemo;
