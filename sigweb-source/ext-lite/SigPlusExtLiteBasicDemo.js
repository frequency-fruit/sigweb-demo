var response;
var isValidDemo;
let nmhVersion = "";

/**Get the SigPlusExtLiteWrapperURL attribute from the content script to read the SigPlusExtLite wrapper javascript path*/
var url = document.documentElement.getAttribute('SigPlusExtLiteWrapperURL');
document.write('<script src='+url+'></script>');

const pageAccessedByReload = (
  (window.performance.navigation && window.performance.navigation.type === 1) ||
    window.performance
      .getEntriesByType('navigation')
      .map((nav) => nav.type)
      .includes('reload')
);

/** GetVersionInfo gathers all versions of the SigPlusExtLite software package and initiates the connection*/
async function GetVersionInfo()
{ 
	if(pageAccessedByReload){
		await delay(1000); //For refresh/reload, allow disconnect to finish before attempting to reconnect
	} 
	
	var isInstalled = document.documentElement.getAttribute('SigPlusExtLiteExtension-installed');
    if (!isInstalled) {
        alert("Topaz SigPlusExtLite extension is either not installed or disabled. Please install or enable extension.");
        return;
    } else {
		let extVersion = Topaz.Global.GetSigPlusExtLiteVersion();
		if(extVersion != null){
			var extP = document.getElementById('extVersion');
			extP.innerHTML += "<b>Extension Version: </b>"+extVersion;
		}
	}
    if (navigator.userAgent.indexOf("Firefox") != -1) {
        var extensionVersion = document.documentElement.getAttribute('Extension-version');
        if (extensionVersion == null) {
            alert("A new version of the SigPlusExtLite extension is available: https://addons.mozilla.org/en-US/firefox/addon/topaz-sigplusextlite-extension/. \nIt is highly recommended that the new extension be installed.");
            return;
        }
    }
	 let global = Topaz.Global;
	nmhVersion = await global.GetSigPlusExtLiteNMHVersion();
	if(nmhVersion >= "3.0"){
		var nmhP = document.getElementById('nmhVersion');
		nmhP.innerHTML += "<b>NMH/SDK Version: </b>"+ nmhVersion;
				
		//Get SigPlusOCX version if able to get nmh version info
		let sigplusVersion = await global.GetSigPlusActiveXVersion();
		if(sigplusVersion != null){
			var sigplusP = document.getElementById('sigplusVersion');
				sigplusP.innerHTML += "<b>SigPlus Version: </b>"+ sigplusVersion; 
		} else {
			let lastError = await global.GetLastError();
			if(lastError != null){
				alert("Issue getting SigPlus OCX version information. "+lastError);
			} else {
				alert("Unable to get SigPlus OCX version information");
			}
		}		
	} else {
		alert("Please install SigPlusExtLite Version 3.0 or higher to use this demo.");
		var inputs = document.getElementsByTagName("input");
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].disabled = true;
		}
		document.getElementById("lblConnectionStatus").innerHTML  = "This demo contains functionality only available with SigPlusExtLite NMH 3.0 and higher versions. </br> Please install SigPlusExtLite 3.0 or higher and refresh this webpage to continue.";
		return;
	}
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**call disconnect function from SigPlusExtLite wrapper javascript in the extension*/
async function Disconnect()
{  
   let global = Topaz.Global;
   await global.Disconnect();
   document.getElementById("lblConnectionStatus").innerHTML = "";   
}

/*Start signing*/
async function BasicDemoStartSignEx()
{
	// Check device is connected or not.
	await ValidateLCDDemo();
    if(!isValidDemo)									 
	  return;
	
	/* Clear tablet and form objects */
	BasicDemoClearSign();
	
	/* start live signing */
	let sign = Topaz.Canvas.Sign;
	await sign.StartSign(document.getElementById('cnv'));
}
/* completed/done signing */
async function BasicDemoDone()
{
	let sign = Topaz.Canvas.Sign;
	/* Get SigString */
	var resp = await sign.GetSigString();
	if(resp != null)
		document.MainForm.sigStringData.value += resp;
	
	/* Get base64String */
	var response = await sign.GetSignatureImage();
	if(response != null)
	{
		var location = response.search("base64,");
		var returnString = response.slice(location + 7, response.length);
		document.MainForm.sigRawData.value += returnString
	}

	let lCDTablet = Topaz.Canvas.LCDTablet;
	await lCDTablet.ClearTablet();
	await sign.SetTabletState(0);
	await lCDTablet.ClearSigWindow(1);
	let sigWindow = Topaz.SignatureCaptureWindow;
	await sigWindow.Sign.SignComplete();
}
/* Clear signature */
async function BasicDemoClearSign()
{
	/* clear sign */
	let sign = Topaz.Canvas.Sign;
	sign.ClearSign();
	
	/* Reset form data */
	document.MainForm.sigStringData.value="";
	document.MainForm.sigStringData.value="SigString:";
	document.MainForm.sigRawData.value="";
	document.MainForm.sigRawData.value="Base64String:";
	let lCDTablet = Topaz.Canvas.LCDTablet;
	await lCDTablet.ClearSigWindow(1);
	await lCDTablet.ClearTablet();
}

async function ValidateLCDDemo()
{
	isValidDemo=true;
	var isInstalled = document.documentElement.getAttribute('SigPlusExtLiteExtension-installed');
    if (!isInstalled) {
		isValidDemo=false;
        alert("Topaz SigPlusExtLite extension is either not installed or disabled. Please install or enable extension.");
        return;
    }
    if (navigator.userAgent.indexOf("Firefox") != -1) {
        var extensionVersion = document.documentElement.getAttribute('Extension-version');
        if (extensionVersion == null) {
			isValidDemo=false;
            alert("A new version of the SigPlusExtLite extension is available: https://addons.mozilla.org/en-US/firefox/addon/topaz-sigplusextlite-extension/. \nIt is highly recommended that the new extension be installed.");
            return;
        }
    }
	
	let global = Topaz.Global;
	var response = await global.GetDeviceStatus();
	if(response == 0)
		
	{
		isValidDemo=false;
		alert("Topaz SigPlusExtLite could not find a topaz device attached."); 
		return;
	}
	else if(response==-2)
	{
		isValidDemo=false;
		alert("Topaz SigPlusExtLite SDK either not installed or doesn't support this feature.");
		return;
	}
	else if(response==-3)
	{
		 isValidDemo=false;
		 alert("Topaz SigPlusExtLite could not find SigPlus drivers installed.");
		 return;
	}
}
var syncReset = false;
var isUnload = false;
async function Reset()
{	
	if(nmhVersion >= "3.0"){
		try{
			if(!syncReset){
				syncReset = true;
				let tpzCanvas = Topaz.Canvas;	 
				let lCDTablet = tpzCanvas.LCDTablet;
				let sign = tpzCanvas.Sign;
								
				lCDTablet.LCDRefresh(0, 0, 0, 240, 64);
				lCDTablet.LCDSetWindow(0, 0, 240, 64);
				lCDTablet.SetSigWindow(1, 0, 0, 240, 64);
				lCDTablet.KeyPadClearHotSpotList();
				lCDTablet.SetLCDCaptureMode(1);
				sign.SetTabletState(0);
				lCDTablet.ClearTablet();
				if(isUnload){
					Disconnect();
				}
				lCD1x5TabletDisplay = true;
				syncReset = false;
			}
		}
		catch(err){
		}
		syncReset = false;
	}
}

if(navigator.userAgent.search("Firefox") >= 0){
		//Perform the following actions on
		//	1. Browser Closure
		//	2. Tab Closure
		//	3. Tab Refresh
		window.addEventListener("beforeunload", function(evt){
			isUnload = true;			
			Reset();
			evt.preventDefault(); //For Firefox, needed for browser closure			
		});
	}
	else {
		var syncPageDismissal = false;
		//Perform the following actions on
		//	1. Browser Closure
		//	2. Tab Closure
		//	3. Tab Refresh
		window.onbeforeunload = function(evt){
			if(!syncPageDismissal){
				isUnload = true;
				syncPageDismissal = true;
				Reset();
				evt.preventDefault(); //For Firefox, needed for browser closure
			}
		};

		window.addEventListener("beforeunload", function(evt){
			if(!syncPageDismissal){
				isUnload = true;
				syncPageDismissal = true;
				Reset();
				evt.preventDefault(); //For Firefox, needed for browser closure
			}
		});

		window.addEventListener("unload", function(evt){
			if(!syncPageDismissal){
				isUnload = true;
				syncPageDismissal = true;
				Reset();
				evt.preventDefault(); //For Firefox, needed for browser closure
			}
		});

		//Perform the following actions on
		//	1. Browser Closure
		//	2. Tab Closure
		//	3. Tab Refresh
		window.addEventListener("beforeunload", Reset());
		window.addEventListener("unload", Reset());
	}