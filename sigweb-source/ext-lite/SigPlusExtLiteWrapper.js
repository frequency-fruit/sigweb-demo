/** Global variable for storing the error message for GetLastError() function */
var errorMessage = "";
/** canvas context for live signing */
var ctx;
var base64String;
var ctxWidth;
var ctxHeight;
var canvasSign = false;

var Topaz = {
    /** Class for Global methods. The methods contained in this class are generic in nature. */
    Global: {
        /** Connects to the SigPlusExtLite NMH.**/
        Connect: async function() {
            //The connect command JSON object.
            var connect = {
                "metadata": {
                    "version": 1.0,
                    "command": "Connect"
                }
            };
            //Promise is an object that represents either completion or failure of a user task.
            return new Promise(function (resolve) {
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(connect, "msg-Attribute-Connect", "Connect");
                //Receive the response message from the extension.
                new Support().ReceiveMessageFromExtension("ConnectResponse", resolve);
				//Receive the response message from the extension.
                new Support().ReceiveMessageFromExtension("UnsupportedCommandResponse", resolve);
            });
        },
	    /** Disconnects from the sigplusextlite NMH.  */
	    Disconnect: async function() {
                //The disconnect command JSON object.
                var disConnect = {
                    "metadata": {
                        "version": 1.0,
                        "command": "Disconnect"
                    }
                };
				//Promise is an object that represents either completion or failure of a user task.
				  return new Promise(function (resolve) {
					//Send the message to the extension for further processing.
					new Support().SendMessageToExtension(disConnect, "msg-Attribute-DisConnect", "DisConnect");
					//Receive the response message from the extension
					new Support().ReceiveMessageFromExtension("DisconnectResponse", resolve);
					//Receive the response message from the extension.
					new Support().ReceiveMessageFromExtension("UnsupportedCommandResponse", resolve);
				});			
            },
	    /** Gets the version of sigplusextlite extension installed. */
	     GetSigPlusExtLiteVersion: function() {
            var extVersion = document.documentElement.getAttribute('Extension-version');
            //If extension version is null set the error message.
            if (extVersion == null) {
                errorMessage = "Unable to get SigPlusExtLite extension version.";
            }
            return extVersion;
        },

	    /** Gets the version of SigPlusExtLite NMH installed. */
	    GetSigPlusExtLiteNMHVersion: async function() {
            //The NMH version information JSON object
            var versionInfo = {
                "metadata": {
                    "version": 1.0,
                    "command": "GetVersionInfo"
                }
            };
            //Promise is an object that represents either completion or failure of a user task.
            return new Promise(function (resolve) {
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(versionInfo, "msg-Attribute-VersionInfo", "GetVersionInfo");
                //Receive the response message from the extension.
                new Support().ReceiveMessageFromExtension("GetVersionInfoResponse", resolve);
            });
        },
	    /** Gets the version of SigPlus activeX installed. */
	    GetSigPlusActiveXVersion: async function() {
            //The SigPlus ActiveX version information JSON object
            var versionInfo = {
                "metadata": {
                    "version": 1.0,
                    "command": "GetActiveXVersionInfo"
                }
            };
            //Promise is an object that represents either completion or failure of a user task.
            return new Promise(function (resolve) {
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(versionInfo, "msg-Attribute-ActiveXVersionInfo", "GetActiveXVersionInfo");
                //Receive the response message from the extension.
                new Support().ReceiveMessageFromExtension("GetActiveXVersionInfoResponse", resolve);
            });
        },
	    /** Gets the status of the installed device. */
	    GetDeviceStatus: async function() {
            //The get device status JSON object.
            var deviceStatus = {
                "metadata": {
                    "version": 1.0,
                    "command": "GetDeviceStatus"
                },
                "deviceStatus": ""
            };
            //Promise is an object that represents either completion or failure of a user task.
            return new Promise(function (resolve) {
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(deviceStatus, "msge-Attribute-DeviceStatus", "GetDeviceStatus");
                //Receive the response message from the extension.
                new Support().ReceiveMessageFromExtension("GetDeviceStatusResponse", resolve);
            });
        },

	    /** Gets the message that describes the last error. */
	    GetLastError: async function() {
            return errorMessage;
        }
    },
    /** Class for GemView specific methods. */
    GemView: {
        capturingGemViewScreen: false,
        screenLeft: 0,
        screenTop: 0,
        /** Push current tab from main monitor to GemView. */
        PushCurrentTab: async function () {          
            //The push current tab JSON object.
            var pushCurrentWindowTab = {
                "metadata": {
                    "version": 1.0,
                    "command": "PushCurrentTab",
					"ApplicationId":1
                },
                "pushCurrentTab": true,
            };
			// The following code should only execute for WebView2
			// Save the screen coordinates to be used in the RevertCurrentTab
            if (window.chrome != undefined &&  window.chrome.webview != undefined) {
                screenLeft = window.screenX;
                screenTop = window.screenY;
				// Promise is an object that represents either completion or failure of a user task.
				return new Promise(function (resolve) {
					// To identify the application type:
                    // Use ApplicationId=1 for Chrome browser
                    // Use ApplicationId=2 for WebView2
					pushCurrentWindowTab.metadata.ApplicationId = 2;
					// Send the message to the extension for further processing.
					new Support().SendMessageToExtension(pushCurrentWindowTab, "msg-Attribute-PushCurrentTab", "PushCurrentTab");
					// Receive the response message from the extension.
					new Support().ReceiveMessageFromExtension("PushCurrentTabResponse", resolve);
				});
            }
			else
			{
				// Send the message to the extension for further processing.
				new Support().SendMessageToExtension(pushCurrentWindowTab, "msg-Attribute-PushCurrentTab", "PushCurrentTab");
			}
        },
	    /** Revert tab from Gemview back to the main monitor.
	    * @param {any} target
	    */
        RevertCurrentTab: async function (target) {
                // The following code should only execute for WebView2
				// Get the screen coordinates saved during the push
				if (window.chrome != undefined && window.chrome.webview != undefined) {
                    var screenCoordinates = { "screenLeft": screenLeft, "screenTop": screenTop };
                    window.chrome.webview.postMessage(screenCoordinates);
                }
				else
				{
					// The revert current tab JSON object.
					var pushCurrentWindowTab = {
						"metadata": {
							"version": 1.0,
							"command": "PushCurrentTab"
						},
						"pushCurrentTab": false,
						"target": target
				   };
				   // If the browser is not Firefox, then handle the response.
				   // Response handling is available only for Chrome extension.
				   // The wrapper file is common to both Chrome and Firefox extensions.
				   if(navigator.userAgent.indexOf("Firefox") == -1)
				   {
						// Promise is an object that represents either completion or failure of a user task.
						// Response handling should be done by the calling function to avoid the tab opening in a new window in Chrome.
						return new Promise(function (resolve) {
						// Send the message to the extension for further processing.
						new Support().SendMessageToExtension(pushCurrentWindowTab, "msg-Attribute-PushCurrentTab", "PushCurrentTab");
						// Receive the response message from the extension.
						new Support().ReceiveMessageFromExtension("RevertCurrentTabResponse", resolve);
						});  
				   }
				   else{
						// Send the message to the extension for further processing.
						new Support().SendMessageToExtension(pushCurrentWindowTab, "msg-Attribute-PushCurrentTab", "PushCurrentTab");			
				   }
				}
            },
      /** Start Capturing the GemView screen
      * GemViewScreenCaptureCanvasContainer - container where the canvas containing the captured GemView screen should be displayed.
      */
      StartCaptureGemViewScreen: function(renderCapturedGemViewScreen, delay=250, enableRequestAnimationFrame=true) {
          if(!Topaz.GemView.CapturingGemViewScreen){
            Topaz.GemView.CapturingGemViewScreen = true;
            Topaz.GemView.CaptureGemViewScreen(renderCapturedGemViewScreen, delay, enableRequestAnimationFrame);
          }
      },

      /** Listen for CaptureGemViewScreen updates and trigger callback function.
      * renderingFunction - callback function that receives the dataUrl parameter containing the captured gemview screen
      */
      CaptureGemViewScreen: async function(renderCapturedGemViewScreen, delay=250,enableRequestAnimationFrame=true) {
        //End the capture process
        if(!Topaz.GemView.CapturingGemViewScreen){
          return;
        }
        //The modify idle screen logo JSON object.
        var captureGemViewScreenRequest = {
          "metadata": {
            "version": 1.0,
            "command": "CaptureGemViewScreen"
          }
        };
        //Send the message to the extension for further processing.
        new Support().SendMessageToExtension(captureGemViewScreenRequest, "message-Attribute", "MsgSender");
        //Receive the response message from the extension
        top.document.addEventListener("CaptureGemViewScreenResponse", function isComplete(event) {
          document.removeEventListener("CaptureGemViewScreenResponse", isComplete);
          //Message attribute is where the response message is stored.
          var str = event.target.getAttribute("msg-Attribute");
          event.target.remove();
          //Convert string into a JSON object.
          var responseObj = JSON.parse(str);
          //The errorMessage variable is used in the GetLastError() method.
          errorMessage = responseObj.errorMsg;
          //Switch statement to handle different responses.
          if(errorMessage != undefined && errorMessage != ""){
            if(errorMessage == "Error: This request exceeds the MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND quota."){
              setTimeout(()=>{Topaz.GemView.CaptureGemViewScreen(renderCapturedGemViewScreen, delay, enableRequestAnimationFrame)},delay);
            } else {
              renderCapturedGemViewScreen(undefined, errorMessage);
              setTimeout(()=>{Topaz.GemView.CaptureGemViewScreen(renderCapturedGemViewScreen, delay, enableRequestAnimationFrame)},delay);
            }
          } else {
            new Support().loadImage(responseObj.dataUrl)
            .then( (img) => {
              if(enableRequestAnimationFrame){
                requestAnimationFrame(()=>{
                  renderCapturedGemViewScreen(img, undefined);
                  setTimeout(()=>{Topaz.GemView.CaptureGemViewScreen(renderCapturedGemViewScreen, delay, enableRequestAnimationFrame)},delay);
                });
              } else {
                renderCapturedGemViewScreen(img, undefined);
                setTimeout(()=>{Topaz.GemView.CaptureGemViewScreen(renderCapturedGemViewScreen, delay, enableRequestAnimationFrame)},delay);
              }

            })
            .catch(err => {
              renderCapturedGemViewScreen(undefined, err);
              setTimeout(()=>{Topaz.GemView.CaptureGemViewScreen(renderCapturedGemViewScreen, delay, enableRequestAnimationFrame)},delay);
            } );
          }
        }, false);
      },
      /**Stop Capturing the GemView Screen
      * @param {any} target
      */
      StopCaptureGemViewScreen: async function() {
        if(Topaz.GemView.CapturingGemViewScreen){
          Topaz.GemView.CapturingGemViewScreen = false;
        }
      },
	    /**	Modifies the idle screen logo.
	    * @param {any} logo
	    */
        ModifyIdleScreenLogo: async function(logo) {
                //The modify idle screen logo JSON object.
                var modifyIdleScreenLogo = {
                    "metadata": {
                        "version": 1.0,
                        "command": "ModifyIdleScreenLogo"
                    },
                    "logo": logo
                };
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(modifyIdleScreenLogo, "message-Attribute", "ModifyIdleScreen");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("ModifyIdleScreenLogoResponse", resolve);
                });
            },
	    /**	Resets the idle screen logo back to default Topaz logo.*/
        ResetIdleScreenLogo: async function() {
                //The reset idle screen logo JSON object.
                var resetIdleScreenLogo = {
                    "metadata": {
                        "version": 1.0,
                        "command": "ResetIdleScreenLogo"
                    }
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(resetIdleScreenLogo, "message-Attribute", "MsgSender");
            },
		/**	Download idle screen images from URLs.
	    * @param {any} imageUrls
		* @param {any} imageOrientation
	    */
        DownloadIdleScreenImages: async function (imageUrls, imageOrientation) {
                // Download idle screen images JSON object.
                var downloadImages = {
                    "metadata": {
                        "version": 1.0,
                        "command": "DownloadIdleScreenImages"
                    },
                    "imageUrls": imageUrls,
					"imageOrientation": imageOrientation
                };
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(downloadImages, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("DownloadIdleScreenImageResponse", resolve);
                });
        },
        /** Sync idle screen images */
        SyncIdleScreenImages: async function () {
            // Sync idle screen images JSON object.
            var syncIdleScreenImages = {
                "metadata": {
                    "version": 1.0,
                    "command": "SyncIdleScreenImages"
                }                
            };
            //Send the message to the extension for further processing.
            new Support().SendMessageToExtension(syncIdleScreenImages, "message-Attribute", "MsgSender");
        },
	    /**	Load Idle Screen on GemView.
	    * @param {any} configurationUrl
	    * @param {any} duration
	    * @param {any} displayLogo
        * @param {any} displayType
	    */
	    LoadIdleScreen: async function(configurationUrl, duration, displayLogo, displayType) {
                //The load idle screen JSON object.
                var loadIdleScreen = {
                    "metadata": {
                        "version": 1.0,
                        "command": "LoadIdleScreen"
                    },
                    "configurationUrl": configurationUrl,
                    "duration": duration,
                    "displayLogo": displayLogo,
                    "displayType": displayType
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(loadIdleScreen, "msge-Attribute-IdleScreen", "LoadStart");
        },

        /**	Open Idle Screen on GemView.
        * @param {any} displayType
        * @param {any} duration
        * @param {any} displayLogo
        */
        OpenIdleScreen: async function (duration = 1000, displayLogo = true, displayType = 1) {
            //The open idle screen JSON object.
            var openIdleScreen = {
                "metadata": {
                    "version": 1.0,
                    "command": "LoadIdleScreen"
                },
                "configurationUrl": null,
                "duration": duration,
                "displayLogo": displayLogo,
                "displayType": displayType
            };
            //Send the message to the extension for further processing.
            new Support().SendMessageToExtension(openIdleScreen, "msge-Attribute-IdleScreen", "LoadStart");
        },
	    /**	Close Idle Screen on GemView. */
	    CloseIdleScreen: async function() {
                //The close idle screen logo JSON object.
                var closeIdleScreen = {
                    "metadata": {
                        "version": 1.0,
                        "command": "CloseIdleScreen"
                    }
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(closeIdleScreen, "message-Attribute", "MsgSender");
            }
    },
    Canvas: {
        /** Class for LCDTablet*/
        LCDTablet: {
            /** Gets the tablet model number from NMH*/
            GetTabletModelNumber: async function () {
                //The get tablet model number JSON object.
                var tabletModelNumber = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletModelNumber"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(tabletModelNumber, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletModelNumberResponse", resolve);
                });
            },
            /** Gets the tablet serial number from NMH*/
            GetTabletSerialNumber: async function () {
                //The get tablet serial number JSON object.
                var tabletSerialNumber = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletSerialNumber"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(tabletSerialNumber, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletSerialNumberResponse", resolve);
                });
            },

            /** Set Tablet Logical XSize */
            SetTabletLogicalXSize: async function (xSize) {
                //The set tablet logical X Size JSON object.
                var tabletLogicalXSize = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletLogicalXSize"
                    },
                    "tabletLogicalXSize": xSize
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletLogicalXSize, "message-Attribute", "MsgSender");
            },
            /** Gets the tablet logical X size of topaz device */
            GetTabletLogicalXSize: async function () {
                //The get tablet logical X size JSON object.
                var tabletLogicalXSize = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletLogicalXSize"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(tabletLogicalXSize, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletLogicalXSizeResponse", resolve);
                });
            },
            /** Set Tablet Logical YSize */
            SetTabletLogicalYSize: async function (ySize) {
                //The Set tablet Logical Y Size JSON object.
                var tabletLogicalYSize = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletLogicalYSize"
                    },
                    "tabletLogicalYSize": ySize
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletLogicalYSize, "message-Attribute", "MsgSender");
            },
            /** Gets the tablet logical Y size of topaz device */
            GetTabletLogicalYSize: async function () {
                //The get tablet logical Y size JSON object.
                var tabletLogicalYSize = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletLogicalYSize"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(tabletLogicalYSize, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletLogicalYSizeResponse", resolve);
                });
            },
            /** Sets the tablet x start position */
            SetTabletXStart: async function (xStart) {
                //The set tablet X start JSON object.
                var tabletXStart = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletXStart"
                    },
                    "tabletXStart": xStart
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletXStart, "message-Attribute", "MsgSender");
            },
            /** Gets the tablet X start position */
            GetTabletXStart: async function () {
                //The get tablet X start JSON object.
                var tabletXStart = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletXStart"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(tabletXStart, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletXStartResponse", resolve);
                });
            },
            /** Sets the tablet X stop position */
            SetTabletXStop: async function (xStop) {
                //The set tablet X stop JSON object.
                var tabletXStop = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletXStop"
                    },
                    "tabletXStop": xStop
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletXStop, "message-Attribute", "MsgSender");
            },
            /** Gets the tablet X start position */
            GetTabletXStop: async function () {
                //The get tablet X stop JSON object.
                var tabletXStop = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletXStop"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(tabletXStop, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletXStopResponse", resolve);
                });
            },
            /** Sets the tablet Y start position */
            SetTabletYStart: async function (yStart) {
                //The set tablet Y start JSON object.
                var tabletYStart = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletYStart"
                    },
                    "tabletYStart": yStart
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletYStart, "message-Attribute", "MsgSender");
            },
            /** Gets the tablet Y start position */
            GetTabletYStart: async function () {
                //The get tablet Y start position JSON object.
                var tabletYStart = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletYStart"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(tabletYStart, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletYStartResponse", resolve);
                });
            },
            /** Sets the tablet Y stop position */
            SetTabletYStop: async function (yStop) {
                //The set tablet Y stop JSON object.
                var tabletYStop = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletYStop"
                    },
                    "tabletYStop": yStop
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletYStop, "message-Attribute", "MsgSender");
            },
            /** Gets the tablet Y stop position */
            GetTabletYStop: async function () {
                //The get tablet Y stop position JSON object.
                var tabletYStop = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletYStop"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(tabletYStop, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletYStopResponse", resolve);
                });
            },
            /** Sets the justify mode to signature box */
            SetJustifyMode: async function (justifyMode) {
                //The set justify mode JSON object.
                var justifyModeJSON = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetJustifyMode"
                    },
                    "justifyMode": justifyMode
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(justifyModeJSON, "message-Attribute", "MsgSender");
            },

            /** Gets justify mode */
            GetJustifyMode: async function () {
                //The set justify mode JSON object.
                var justifyMode = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetJustifyMode"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(justifyMode, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetjustifyModeResponse", resolve);
                });
            },
            /** Sets the buffer size in the logical tablet coordinates  */
            SetJustifyX: async function (buffer) {
                //The set justifyX JSON object.
                var justifyX = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetJustifyX"
                    },
                    "justifyX": buffer
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(justifyX, "message-Attribute", "MsgSender");
            },
            /** Gets justifyX */
            GetJustifyX: async function () {
                //The set justify mode JSON object.
                var justifyX = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetJustifyX"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(justifyX, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetjustifyXResponse", resolve);
                });
            },

            /** Sets the buffer size in the logical tablet coordinates  */
            SetJustifyY: async function (buffer) {
                //The set justifyY JSON object.
                var justifyY = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetJustifyY"
                    },
                    "justifyY": buffer
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(justifyY, "message-Attribute", "MsgSender");
            },
            /** Gets justifyY */
            GetJustifyY: async function () {
                //The set justify mode JSON object.
                var justifyY = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetJustifyY"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(justifyY, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetjustifyYResponse", resolve);
                });
            },
            /** Gets the LCD tablet size */
            GetLCDSize: async function () {
                //The tablet LCD Size JSON object.
                var lCDSize = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetLCDSize"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(lCDSize, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetLCDSizeResponse", resolve);
                });
            },
            /** Sets the LCD pixel depth */
            SetLCDPixelDepth: async function (pixelDepth) {
                //The LCD pixel depth  JSON object.
                var lCDPixelDepth = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetLCDPixelDepth"
                    },
                    "pixelDepth": pixelDepth
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(lCDPixelDepth, "message-Attribute", "MsgSender");
            },
            /** Sets SetLCDCompression  */
            SetLCDCompression: async function (lcdCompMode, lcdZCompMode, lcdCompFast, lcdCompSlow) {
                //The set SetLCDCompression JSON object.
                var LCDcompression = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetLCDCompression"
                    },
                    "lcdCompMode": lcdCompMode,
                    "lcdZCompMode": lcdZCompMode,
                    "lcdCompFast": lcdCompFast,
                    "lcdCompSlow": lcdCompSlow
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(LCDcompression, "message-Attribute", "MsgSender");
            },
            /** Sets a signature window that restricts the ink of the SigPlus object to the window on the LCD itself */
            LCDSetWindow: async function (xPos, yPos, width, height) {
                //The LCD set window JSON object.
                var lCDSetWindow = {
                    "metadata": {
                        "version": 1.0,
                        "command": "LCDSetWindow"
                    },
                    "xPos": xPos,
                    "yPos": yPos,
                    "width": width,
                    "height": height
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(lCDSetWindow, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("lCDSetWindowResponse", resolve);
                });
            },
            /** Sets the width of the image in pixels */
            SetImageWidth: async function (width) {
                //The image width JSON object.
                var imageWidth = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetImageWidth"
                    },
                    "width": width
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(imageWidth, "message-Attribute", "MsgSender");
            },

            /** Gets the width of the image in pixels */
            GetImageWidth: async function () {
                //The set justify mode JSON object.
                var imageWidth = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetImageWidth"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(imageWidth, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetimageWidthResponse", resolve);
                });
            },
            /** Sets the height of the image in pixels */
            SetImageHeight: async function (height) {
                //The image height JSON object.
                var imageHeight = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetImageHeight"
                    },
                    "height": height
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(imageHeight, "message-Attribute", "MsgSender");
            },
            /** Gets the height of the image in pixels */
            GetImageHeight: async function () {
                //The set justify mode JSON object.
                var imageHeight = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetImageHeight"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(imageHeight, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetimageHeightResponse", resolve);
                });
            },
            /** Writes a image to the LCD using the URL specified */
            LCDWriteImage: async function (destination, mode, xPos, yPos, width, height, format, url) {
                //The LCD write image JSON object.
                var lCDWriteImage = {
                    "metadata": {
                        "version": 1.0,
                        "command": "LCDWriteImage"
                    },
                    "destination": destination,
                    "mode": mode,
                    "xPos": xPos,
                    "yPos": yPos,
                    "width": width,
                    "height": height,
                    "format": format,
                    "url": url
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(lCDWriteImage, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("lCDWriteImageResponse", resolve);
                });
            },
            /** Writes a string to the LCD using the string specified */
            LCDWriteString: async function (destination, mode, xPos, yPos, text) {
                //The LCD write string JSON object.
                var lCDWriteString = {
                    "metadata": {
                        "version": 1.0,
                        "command": "LCDWriteString"
                    },
                    "destination": destination,
                    "mode": mode,
                    "xPos": xPos,
                    "yPos": yPos,
                    "text": text
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(lCDWriteString, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("lCDWriteStringResponse", resolve);
                });
            },
            /** Writes a string to the LCD using the string specified */
            LCDSetFont: async function (height, weight, italic, underline, pitchAndFamily, faceName) {
                //The LCD write string JSON object.
                var lcdSetFont = {
                    "metadata": {
                        "version": 1.0,
                        "command": "LCDSetFont"
                    },
                    "height": height,
                    "weight": weight,
                    "italic": italic,
                    "underline": underline,
                    "pitchAndFamily": pitchAndFamily,
                    "faceName": faceName
                };

                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(lcdSetFont, "message-Attribute", "MsgSender");
            },
            /** Sets the current LCD Capture Mode */
            SetLCDCaptureMode: async function (mode) {
                //The LCD Capture mode JSON object.
                var lCDCaptureMode = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetLCDCaptureMode"
                    },
                    "captureMode": mode
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(lCDCaptureMode, "message-Attribute", "MsgSender");
            },

            /** Gets the current LCD Capture Mode */
            GetLCDCaptureMode: async function () {
                //The set justify mode JSON object.
                var lCDCaptureMode = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetLCDCaptureMode"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(lCDCaptureMode, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("lCDCaptureModeResponse", resolve);
                });
            },
            /** Sends the tablet a refresh command */
            LCDRefresh: async function (mode, xPos, yPos, width, height) {
                //The LCD refresh JSON object.
                var lCDRefresh = {
                    "metadata": {
                        "version": 1.0,
                        "command": "LCDRefresh"
                    },
                    "mode": mode,
                    "xPos": xPos,
                    "yPos": yPos,
                    "width": width,
                    "height": height
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(lCDRefresh, "message-Attribute", "MsgSender");
            },
            /** Sets a window in the control and allows ink to render inside of it */
            SetSigWindow: async function (coord, xPos, yPos, width, height) {
                //The set signature window JSON object.
                var setSigWindow = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetSigWindow"
                    },
                    "coord": coord,
                    "xPos": xPos,
                    "yPos": yPos,
                    "width": width,
                    "height": height
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(setSigWindow, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("SetSigWindowResponse", resolve);
                });
            },
            /** Defines the location of a tablet hot spot which is used by the developer to detect pen taps */
            KeyPadAddHotSpot: async function (keyCode, coord, xPos, yPos, width, height) {
                //The keypad add hotspot JSON object.
                var keyPadAddHotSpot = {
                    "metadata": {
                        "version": 1.0,
                        "command": "KeyPadAddHotSpot"
                    },
                    "keyCode": keyCode,
                    "coord": coord,
                    "xPos": xPos,
                    "yPos": yPos,
                    "width": width,
                    "height": height
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(keyPadAddHotSpot, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("keyPadAddHotSpotResponse", resolve);
                });
            },
            /** Queries whether the specified hot spot has been tapped by the user */
            KeyPadQueryHotSpot: async function (keyCode) {
                //The keyPad Query HotSpot JSON object.
                var keyPadQueryHotSpot = {
                    "metadata": {
                        "version": 1.0,
                        "command": "KeyPadQueryHotSpot"
                    },
                    "keyCode": keyCode
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    new Support().SendMessageToExtension(keyPadQueryHotSpot, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("KeyPadQueryHotSpotResponse", resolve);
                });
            },
            /** Clears the control’s internal list of hot spots created */
            KeyPadClearHotSpotList: async function () {
                //The keypad clear hotspot list JSON object.
                var keyPadClearHotSpotList = {
                    "metadata": {
                        "version": 1.0,
                        "command": "KeyPadClearHotSpotList"
                    }
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(keyPadClearHotSpotList, "message-Attribute", "MsgSender");
            },
            /** Erases the data either inside or outside the SigWindow */
            ClearSigWindow: async function (inside) {
                //The clear signature window JSON object.
                var clearSigWindow = {
                    "metadata": {
                        "version": 1.0,
                        "command": "ClearSigWindow"
                    },
                    "inside": inside
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(clearSigWindow, "message-Attribute", "MsgSender");
            },
            /** Clears the signature object of any ink in the control */
            ClearTablet: async function () {
                //The clear tablet JSON object.
                var clearTablet = {
                    "metadata": {
                        "version": 1.0,
                        "command": "ClearTablet"
                    }
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(clearTablet, "message-Attribute", "MsgSender");
            }
        },
        /** Class for Sign Methods*/
        Sign: {
            /** Sets the tablet state */
            SetTabletState: async function (tabletState) {
                //The set tablet state JSON object.
                var tabletStateJSON = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletState"
                    },
                    "tabletState": tabletState
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletStateJSON, "message-Attribute", "MsgSender");
            },

            /** Gets the tablet state from NMH*/
            GetTabletState: async function () {
                //The get tablet state JSON object.
                var tabletState = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletState"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(tabletState, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletStateResponse", resolve);
                });
            },

            /** Sets the tablet type */
            SetTabletType: async function (type) {
                //The set tablet type JSON object.
                var tabletType = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletType"
                    },
                    "tabletType ": type
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletType, "message-Attribute", "MsgSender");
            },

            /** Gets the tablet type from NMH*/
            GetTabletType: async function () {
                //The get tablet type JSON object.
                var tabletType = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletType"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(tabletType, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletTypeResponse", resolve);
                });
            },

            /** Sets the tablet com port */
            SetTabletCOMPort: async function (port) {
                //The set tablet com port JSON object.
                var tabletComPort = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SetTabletCOMPort"
                    },
                    "port ": port
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(tabletComPort, "message-Attribute", "MsgSender");
            },

            /** Gets the tablet com port from NMH*/
            GetTabletCOMPort: async function () {
                //The get tablet com port JSON object.
                var tabletComPort = {
                    "metadata": {
                        "version": 1.0,
                        "command": "GetTabletCOMPort"
                    }
                };
                //Promise is an object that represents either completion or failure of a user task
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(tabletComPort, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    new Support().ReceiveMessageFromExtension("GetTabletComPortResponse", resolve);
                });
            },

            /** Add penup event listener*/
            AddPenUpEventListener: async function () {
                document.addEventListener('PenUpEventResponse', this.PenUpEventResponse, false);
            },

            /** Remove penup event listener*/
            RemovePenUpEventListener: async function () {
                document.removeEventListener('PenUpEventResponse', this.PenUpEventResponse, false);
            },

            /** PenUp event response*/
            PenUpEventResponse: async function () {
                OnSignPenUp();
            },

            /** Add PenDown event listener*/
            AddPenDownEventListener: async function () {
                document.addEventListener('PenDownEventResponse', this.PenDownEventResponse, false);
            },

            /** Remove PenDown event listener*/
            RemovePenDownEventListener: async function () {
                document.removeEventListener('PenDownEventResponse', this.PenDownEventResponse, false);
            },

            /** PenDown event response*/
            PenDownEventResponse: async function () {
                OnSignPenDown();
            },

	        /** Sets the sig string format to signature */
	        SetSigStringFormat: async function(encryptionMode, encryptionKey, sigCompressionMode) {
                        //The sigstring fromat JSON object.
                        var sigStringFormat = {
                            "metadata": {
                                "version": 1.0,
                                "command": "SetSigStringFormat"
                            },
                            "encryptionMode": encryptionMode,
                            "encryptionKey": encryptionKey,
                            "sigCompressionMode": sigCompressionMode
                        };
                        //Promise is an object that represents either completion or failure of a user task
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(sigStringFormat, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension
                            new Support().ReceiveMessageFromExtension("SetSigStringFormatResponse", resolve);
                        });
                    },

	        /** Set encryption mode */
	        SetEncryptionMode: async function(encryptionMode) {
                        // Level of encryption. 0 = Clear text
                        // 1 = DES Encryption
                        // 2 = higher security encryption mode.
                        //The set encryption mode  JSON object.
                        var encryptMode = {
                            "metadata": {
                                "version": 1.0,
                                "command": "SetEncryptionMode"
                            },
                            "encryptionMode": encryptionMode
                        };
                        //Send the message to the extension for further processing.
                        new Support().SendMessageToExtension(encryptMode, "message-Attribute", "MsgSender");
                    },

	        /** Get encryption mode */
	        GetEncryptionMode: async function() {
                        //The get encryption mode  JSON object.
                        var encryptionMode = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetEncryptionMode"
                            },
                        };
                        //Promise is an object that represents either completion or failure of a user task.
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(encryptionMode, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension.
                            new Support().ReceiveMessageFromExtension("GetEncryptionModeResponse", resolve);
                        });
                    },

	        /** Set auto key data */
	        SetAutoKeyData: async function(keyData) {
                        //The set autokey data  JSON object.
                        var autoKeyData = {
                            "metadata": {
                                "version": 1.0,
                                "command": "SetAutoKeyData"
                            },
                            "encryptionKey": keyData
                        };
                        //Send the message to the extension for further processing.
                        new Support().SendMessageToExtension(autoKeyData, "message-Attribute", "MsgSender");
                    },

	        /** Set sig compression mode */
	        SetSigCompressionMode: async function(mode) {
                        //The set sig compression mode  JSON object.
                        // 0 = no compression
                        // 1 = lossless compression (Default value)
                        // 2 = lossy. 2 is not recommended unless storage size is critical
                        var compressionMode = {
                            "metadata": {
                                "version": 1.0,
                                "command": "SetSigCompressionMode"
                            },
                            "sigCompressionMode": mode
                        };
                        //Send the message to the extension for further processing.
                        new Support().SendMessageToExtension(compressionMode, "message-Attribute", "MsgSender");
                    },

	        /** Get Sig compression mode */
	        GetSigCompressionMode: async function() {
                        //The get encryption mode  JSON object.
                        var compressionMode = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetSigCompressionMode"
                            },
                        };
                        //Promise is an object that represents either completion or failure of a user task.
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(compressionMode, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension.
                            new Support().ReceiveMessageFromExtension("GetSigCompressionModeResponse", resolve);
                        });
                    },

	        /** Set image pen width */
	        SetImagePenWidth: async function(width) {
                        // 1 = Default value
                        var imgPenWidth = {
                            "metadata": {
                                "version": 1.0,
                                "command": "SetImagePenWidth"
                            },
                            "imagePenWidth": width
                        };
                        //Send the message to the extension for further processing.
                        new Support().SendMessageToExtension(imgPenWidth, "message-Attribute", "MsgSender");
                    },

	        /** Get image pen width */
	        GetImagePenWidth: async function() {
                        var imagePenWidth = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetImagePenWidth"
                            },
                        };
                        //Promise is an object that represents either completion or failure of a user task.
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(imagePenWidth, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension.
                            new Support().ReceiveMessageFromExtension("GetImagePenWidthResponse", resolve);
                        });
                    },

	        /** Set display pen width */
	        SetDisplayPenWidth: async function(width) {
                        var dsplayPenWidth = {
                            "metadata": {
                                "version": 1.0,
                                "command": "SetDisplayPenWidth"
                            },
                            "displayPenWidth": width
                        };
                        //Send the message to the extension for further processing.
                        new Support().SendMessageToExtension(dsplayPenWidth, "message-Attribute", "MsgSender");
                    },
	        /** Set display pen width */
	        GetDisplayPenWidth: async function() {
                        var displayPenWidth = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetDisplayPenWidth"
                            },
                        };
                        //Promise is an object that represents either completion or failure of a user task.
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(displayPenWidth, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension.
                            new Support().ReceiveMessageFromExtension("GetDisplayPenWidthResponse", resolve);
                        });
                    },

	        /**Start signing on canvas*/
	        StartSign: async function(canvas) {
						canvasSign = true;
                        ctx = canvas.getContext('2d');
                        ctxWidth = canvas.width;
                        ctxHeight = canvas.height;
                        await Topaz.Canvas.LCDTablet.SetImageWidth(ctxWidth);
                        await Topaz.Canvas.LCDTablet.SetImageHeight(ctxHeight);
                        await this.SetTabletState(1);
                        //Receive the response message from the extension
                        top.document.addEventListener("SignResponse", this.SignResponse, false);
                    },

	        /**Binding living signing to canvas*/
	        SignResponse: async function(event) {
                        var responseObj = event.target.getAttribute("msg-Attribute");
                        var obj = JSON.parse(responseObj);
                        var img = new Image();
                        img.onload = function () {
                            ctx.drawImage(img, 0, 0);
                        }
                        img.src = 'data:image/jpeg;base64,' + obj.imageData;
                        base64String = 'data:image/jpeg;base64,' + obj.imageData;
                    },

	        /** Stop Signature */
            StopSign: async function () {
                        top.document.removeEventListener("SignResponse", this.SignResponse);
                        await this.SetTabletState(0);
						errorMessage = "";
                        canvasSign = false;
            },

	        /** Clear Sign */
	        ClearSign: async function() {
                        if (ctxWidth != null)
                            ctx.clearRect(0, 0, ctxWidth, ctxHeight);

                        var clearSign = {
                            "metadata": {
                                "version": 1.0,
                                "command": "ClearSign"
                            }
                        };
                        //Send the message to the extension for further processing.
                        new Support().SendMessageToExtension(clearSign, "message-Attribute", "MsgSender");
                    },

	        /** Gets the total number of points in the current signature */
	        GetTotalPoints: async function() {
                        //The number of tablet points JSON object.
                        var numberOfTabletPoints = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetTotalPoints"
                            }
                        };
                        //Promise is an object that represents either completion or failure of a user task
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(numberOfTabletPoints, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension
                            new Support().ReceiveMessageFromExtension("GetTotalPointsResponse", resolve);
                        });
                    },

	        /** Gets the total number of strokes in the current signature */
	        GetNumberOfStrokes: async function() {
                        //The number of strokes JSON object.
                        var numberOfStrokes = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetNumberOfStrokes"
                            }
                        };
                        //Promise is an object that represents either completion or failure of a user task
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(numberOfStrokes, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension
                            new Support().ReceiveMessageFromExtension("GetNumberOfStrokesResponse", resolve);
                        });
                    },

	        /** Gets the total number of points in stroke in the current signature */
	        GetNumberOfPointsInStroke: async function(strokeNo) {
                        //The number of points for stroke JSON object.
                        var numberOfPointsForStroke = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetNumberOfPointsInStroke"
                            },
                            "strokeNo": strokeNo
                        };
                        //Promise is an object that represents either completion or failure of a user task
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(numberOfPointsForStroke, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension
                            new Support().ReceiveMessageFromExtension("GetNumberOfPointsInStrokeResponse", resolve);
                        });
                    },

	        /** Gets the point X value in the current signature */
	        GetPointXValue: async function(strokeId, pointId) {
                        //The point X Value JSON object.
                        var pointXValue = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetPointXValue"
                            },
                            "strokeId": strokeId,
                            "pointId": pointId
                        };
                        //Promise is an object that represents either completion or failure of a user task
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(pointXValue, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension
                            new Support().ReceiveMessageFromExtension("GetPointXValueResponse", resolve);
                        });
                    },

	        /** Gets the point Y value in the current signature */
	        GetPointYValue: async function(strokeId, pointId) {
                        //The point Y Value JSON object.
                        var pointYValue = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetPointYValue"
                            },
                            "strokeId": strokeId,
                            "pointId": pointId
                        };
                        //Promise is an object that represents either completion or failure of a user task
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(pointYValue, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension
                            new Support().ReceiveMessageFromExtension("GetPointYValueResponse", resolve);
                        });
                    },

            /** Gets the signature image in base64 format from the canvas (StartSignEx)*/
            GetSignatureImage: async function() {
                        //The sigstring JSON object.
                        var signatureImage = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetSignatureImage"
                            }
                        };
                        //Promise is an object that represents either completion or failure of a user task
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(signatureImage, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension
                            new Support().ReceiveMessageFromExtension("GetSignatureImageResponse", resolve);
                        });
                    },

	        /** Loads the signature data into the control */
	        SetSigString: async function(sigString, encryptionMode, encryptionKey, sigCompressionMode) {
                        //The sigstring JSON object.
                        var setSigString = {
                            "metadata": {
                                "version": 1.0,
                                "command": "SetSigString"
                            },
                            "sigString": sigString,
                            "encryptionMode": encryptionMode,
                            "encryptionKey": encryptionKey,
                            "sigCompressionMode": sigCompressionMode
                        };
                        //Send the message to the extension for further processing.
                        new Support().SendMessageToExtension(setSigString, "message-Attribute", "MsgSender");
                    },

            /** Gets the sigstring of the signature from StartSignEx */
            GetSigString: async function() {
                        //The sigstring JSON object.
                        var sigString = {
                            "metadata": {
                                "version": 1.0,
                                "command": "GetSigString"
                            }
                        };
                        //Promise is an object that represents either completion or failure of a user task
                        return new Promise(function (resolve) {
                            //Send the message to the extension for further processing.
                            new Support().SendMessageToExtension(sigString, "message-Attribute", "MsgSender");
                            //Receive the response message from the extension
                            new Support().ReceiveMessageFromExtension("GetSigStringResponse", resolve);
                        });
                    }
        }
    },
    SignatureCaptureWindow: {
        /** Class for CustomWindow specific methods. */
        CustomWindow: {
            /** Sets the title of the signing window.
	        * @param {any} title
	        */
            SetSigningWindowTitle: async function(title) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("windowTitle", title, "signingWindow");
            },
	        /** Gets the title of the signing window. */
	        GetSigningWindowTitle: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("windowTitle");
                    },
	        /** Sets the window state of the signing window
	        * @param {any} windowState
	        */
	        SetSigningWindowState: async function(windowState) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("windowState", windowState, "signingWindow");
                    },
	        /** Gets the window state of the signing window. */
	        GetSigningWindowState: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("windowState");
                    },
	        /** Sets the border style of the signing window
	        * @param {any} borderStyle
	        */
	        SetSigningWindowBorderStyle: async function(borderStyle) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("formBorderStyle", borderStyle, "signingWindow");
                    },
	        /** Gets the border style of the signing window. */
	        GetSigningWindowBorderStyle: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("formBorderStyle");
                    },
	        /** Sets the background color of the signing window.
	        * @param {any} colorCode
	        */
	        SetSigningWindowBackColor: async function(colorCode) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("backColor", colorCode, "signingWindow");
                    },
	        /** Gets the background color of the signing window. */
	        GetSigningWindowBackColor: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowBackColor");
                    },
	        /** Sets the size of the signing window.
	        * @param {any} width
	        * @param {any} height
	        */
	        SetSigningWindowSize: async function(width, height) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("size", { "width": width, "height": height }, "signingWindow");
                    },
	        /** Gets the width of the signing window in pixels. */
	        GetSigningWindowWidth: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowWidth");
                    },
	        /** Gets the height of the signing window in pixels. */
	        GetSigningWindowHeight: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowHeight");
                    },
	        /** Sets the location of the signing window.
	        * @param {any} x
	        * @param {any} y
	        */
	        SetSigningWindowLocation: async function(x, y) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("location", { "x": x, "y": y }, "signingWindow");
                    },
	        /** Gets the x coordinate of the signing window location. */
	        GetSigningWindowLocationX: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowX");
                    },
	        /** Gets the y coordinate of the signing window location. */
	        GetSigningWindowLocationY: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowY");
                    },
	        /** Sets the background color of the signing window toolbar.
	        * @param {any} colorCode
	        */
	        SetSigningWindowToolbarBackColor: async function(colorCode) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("backColor", colorCode, "signingWindowToolBar");
                    },
	        /**Gets the background color of the signing window toolbar. */
	        GetSigningWindowToolbarBackColor: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarBackColor");
                    },
	        /** Sets the docking location of the signing window toolbar.*/
	        SetSigningWindowToolbarDock: async function(dockLocation) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("dock", dockLocation, "signingWindowToolBar");
                    },
	        /** Gets the docking location of the signing window toolbar.*/
	        GetSigningWindowToolbarDock: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarDock");
                    },
	        /** Sets the size of the signing window toolbar.*/
	        SetSigningWindowToolbarSize: async function(size) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("size", size, "signingWindowToolBar");
                    },
	        /** Gets the size of the signing window toolbar.*/
	        GetSigningWindowToolbarSize: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarSize");
                    },
	        /** Sets the padding of the signing window toolbar.*/
	        SetSigningWindowToolbarPadding: async function(left, top, right, bottom) {
                        var all;
                        //if padding values are same
                        if (left == top && left == right && left == bottom)
                            all = left;
                        else
                            all = -1;
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("padding", { "all": all, "left": left, "top": top, "right": right, "bottom": bottom }, "signingWindowToolBar");
                    },
	        /** Gets the left padding of the signing window toolbar.*/
	        GetSigningWindowToolbarLeftPadding: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarPaddingLeft");
                    },
	        /** Gets the top padding of the signing window toolbar.*/
	        GetSigningWindowToolbarTopPadding: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarPaddingTop");
                    },
	        /** Gets the right padding of the signing window toolbar.*/
	        GetSigningWindowToolbarRightPadding: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarPaddingRight");
                    },
	        /** Gets the bottom padding of the signing window toolbar.*/
	        GetSigningWindowToolbarBottomPadding: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarPaddingBottom");
                    },
	        /** Sets the background color of the signing window toolbar icon.*/
	        SetSigningWindowToolbarIconBackColor: async function(colorCode, iconType) {
                        var iconName = new Support().GetIconName(iconType);
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute(iconName, { "iconType": iconType, "colorCode": colorCode }, "signingWindowToolBarIcon");
                    },
	        /** Gets the background color of the signing window toolbar.*/
	        GetSigningWindowToolbarIconBackColor: async function(iconType) {
                        var iconName = new Support().GetIconName(iconType);
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute(iconName + "BackColor");
                    },
	        /** Sets the image of the signing window toolbar icon.*/
	        SetSigningWindowToolbarIconImage: async function(imageData, iconType) {
                        var iconName = new Support().GetIconName(iconType);
                        //Set custom window attribute to local storage.
                        return await new Support().SetCustomWindowAttribute(iconName, { "iconType": iconType, "image": imageData }, "signingWindowToolBarIcon");
                    },
	        /** Gets the custom image of the signing window toolbar icon.*/
	        GetSigningWindowToolbarIconImage: async function(iconType) {
                        var iconName = new Support().GetIconName(iconType);
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute(iconName + "Image");
                    },
	        /** Sets the size of the signing window toolbar icon.*/
	        SetSigningWindowToolbarIconSize: async function(size) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("size", size, "signingWindowToolBarIcon");
                    },
	        /** Gets the size of the signing window toolbar icon.*/
	        GetSigningWindowToolbarIconSize: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarIconSize");
                    },
	        /** Sets the margins of signing window toolbar icons.*/
	        SetSigningWindowToolbarIconMargin: async function(left, top, right, bottom) {
                        var all;
                        //if padding values are same
                        if (left == top && left == right && left == bottom)
                            all = left;
                        else
                            all = -1;
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("margin", { "all": all, "left": left, "top": top, "right": right, "bottom": bottom }, "signingWindowToolBarIcon");
                    },
	        /** Gets the left margin of the signing window toolbar icons.*/
	        GetSigningWindowToolbarIconLeftMargin: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarIconMarginLeft");
                    },
	        /** Gets the top margin of the signing window toolbar icons.*/
	        GetSigningWindowToolbarIconTopMargin: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarIconMarginTop");
                    },
	        /** Gets the right margin of the signing window toolbar icons. */
	        GetSigningWindowToolbarIconRightMargin: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarIconMarginRight");
                    },
	        /** Gets the Bottom margin of the signing window toolbar icons. */
	        GetSigningWindowToolbarIconBottomMargin: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingWindowToolBarIconMarginBottom");
                    },
	        /** Sets the background color of the signing area.*/
            SetSigningAreaBackColor: async function(colorCode) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("backColor", colorCode, "signingArea");
                    },
	        /** Gets the background color of the signing area.*/
	        GetSigningAreaBackColor: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingAreaBackColor");
                    },
	        /** Sets the size of the signing area.*/
	        SetSigningAreaSize: async function(width, height) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("size", { "width": width, "height": height }, "signingArea");
                    },
	        /** Gets the width of the signing area in pixels.*/
	        GetSigningAreaWidth: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingAreaWidth");
                    },
	        /** Gets the height of the signing area in pixels.*/
	        GetSigningAreaHeight: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingAreaHeight");
                    },
	        /** Sets the location of the signing area.*/
	        SetSigningAreaLocation: async function(x, y) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("location", { "x": x, "y": y }, "signingArea");
                    },
	        /** Gets the x coordinate of the signing area location.*/
	        GetSigningAreaLocationX: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingAreaX");
                    },
	        /** Gets the y coordinate of the signing area location.*/
	        GetSigningAreaLocationY: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingAreaY");
                    },
	        /** Sets the docking location of the signing window toolbar.*/
	        SetSigningAreaDock: async function(dockLocation) {
                        //Set custom window attribute to local storage.
                        await new Support().SetCustomWindowAttribute("dock", dockLocation, "signingArea");
                    },
	        /** Gets the docking location of the signing area.*/
	        GetSigningAreaDock: async function() {
                        //Get custom window attribute from local storage.
                        return await new Support().GetCustomWindowAttribute("signingAreaDock");
                    },
	        /** Saves and persists the custom window attributes. */
	        Save: async function() {
                //Get custom window attributes from local storage.
                if (localStorage.getItem('CustomWindowAttributes') != null && localStorage.getItem('CustomWindowAttributes') != "undefined") {
                    var signingWindowProperties = localStorage.getItem('CustomWindowAttributes');
                    signingWindowProperties = JSON.parse(signingWindowProperties);

                    //Create a custom window attributes JSON message.
                    var customWindowAttributes = {
                        "metadata": {
                            "version": 1.0,
                            "command": "CustomSigningWindow"
                        },
                        signingWindowProperties
                    };
                    //Remove the local storage item.
                    localStorage.removeItem("CustomWindowAttributes");
                    //Promise is an object that represents either completion or failure of a user task
                    return new Promise(function (resolve) {
                        //Send the message to the extension for further processing
                        new Support().SendMessageToExtension(customWindowAttributes, "msg-Attribute-CustomWindow", "CustomWindow");
                        //Receive the response message from the extension
                        new Support().ReceiveMessageFromExtension("CustomWindowResponse", resolve);
                    });
                }
            },
	        //**Resets the custom window back to its default attributes*/
	        Reset: async function() {
                        //Reset cstom window attributes JSON message.
                        var resetCustomWindow = {
                            "metadata": {
                                "version": 1.0,
                                "command": "ResetCustomWindow"
                            }
                        };
                        //Remove the local storage item.
                        localStorage.removeItem("CustomWindowAttributes");
                        //Send the message to the extension for further processing.
                        new Support().SendMessageToExtension(resetCustomWindow, "message-Attribute", "MsgSender");
                    }
        },
        Sign: {
            SignerDetails: {
                FirstName: undefined,
                LastName: undefined,
                Email: undefined,
                Location: undefined
            },
            ImageDetails: {
                Format: undefined,
                Width: undefined,
                Height: undefined,
                Transparency: undefined,
                Scaling: undefined,
                MaxUpScalePercent: undefined
            },
            PenDetails: {
                ColorCode: undefined,
                Thickness: undefined
            },
            CustomText: {
                DisplayCustomTextDetails: undefined,
                PercentArea: undefined,
                LineOne: undefined,
                LineTwo: undefined
            },
            MinSigPoints: undefined,
            RawDataFormat: undefined,

            /** Sets the signer details */
            SetSignerDetails: function (firstName, lastName, email, location) {
                if (typeof firstName == "string" && typeof lastName == "string"
                    && typeof email == "string" && typeof location == "string") {
                    let sDetails = Topaz.SignatureCaptureWindow.Sign.SignerDetails;
                    sDetails.FirstName = firstName;
                    sDetails.LastName = lastName;
                    sDetails.Email = email;
                    sDetails.Location = location;
                    return 1;
                } else {
                    if (typeof firstName != "string") {
						errorMessage = "Invalid argument 'firstName'. Expected 'string' received " + typeof firstName;
                        console.error("Invalid argument 'firstName'. Expected 'string' received " + typeof firstName)
                    }
                    if (typeof width != "string") {
						errorMessage = "Invalid argument 'lastName'. Expected 'string' received " + typeof lastName;
                        console.error("Invalid argument 'lastName'. Expected 'string' received " + typeof lastName)
                    }
                    if (typeof email != "string") {
						errorMessage = "Invalid argument 'email'. Expected 'string' received " + typeof email;
                        console.error("Invalid argument 'email'. Expected 'string' received " + typeof email)
                    }
                    if (typeof location != "string") {
						errorMessage = "Invalid argument 'location'. Expected 'string' received " + typeof location;
                        console.error("Invalid argument 'location'. Expected 'string' received " + typeof location)
                    }
                    return -1;
                }
            },

            /** Sets image details */
            SetImageDetails: function (format, width, height, transparency, scaling, maxUpScalePercent) {
                if (typeof format == "number" && typeof width == "number" && typeof height == "number"
                    && typeof transparency == "boolean" && typeof scaling == "boolean" && typeof maxUpScalePercent == "number") {
                    let iDetails = Topaz.SignatureCaptureWindow.Sign.ImageDetails;
                    iDetails.Format = format;
                    iDetails.Width = width;
                    iDetails.Height = height;
                    iDetails.Transparency = transparency;
                    iDetails.Scaling = scaling;
                    iDetails.MaxUpScalePercent = maxUpScalePercent;
                    return 1;
                } else {
                    if (typeof format != "number") {
						errorMessage = "Invalid argument 'format'. Expected 'number' received " + typeof format;
                        console.error("Invalid argument 'format'. Expected 'number' received " + typeof format)
                    }
                    if (typeof width != "number") {
						errorMessage = "Invalid argument 'width'. Expected 'number' received " + typeof width;
                        console.error("Invalid argument 'width'. Expected 'number' received " + typeof width)
                    }
                    if (typeof height != "number") {
						errorMessage = "Invalid argument 'height'. Expected 'number' received " + typeof height;
                        console.error("Invalid argument 'height'. Expected 'number' received " + typeof height)
                    }
                    if (typeof transparency != "boolean") {
						errorMessage = "Invalid argument 'transparency'. Expected 'boolean' received " + typeof transparency;
                        console.error("Invalid argument 'transparency'. Expected 'boolean' received " + typeof transparency)
                    }
                    if (typeof scaling != "boolean") {
						errorMessage = "Invalid argument 'scaling'. Expected 'boolean' received " + typeof scaling;
                        console.error("Invalid argument 'scaling'. Expected 'boolean' received " + typeof scaling)
                    }
                    if (maxUpScalePercent != "number") {
						errorMessage = "Invalid argument 'maxUpScalePercent'. Expected 'number' received " + typeof maxUpScalePercent
                        console.error("Invalid argument 'maxUpScalePercent'. Expected 'number' received " + typeof maxUpScalePercent)
                    }
                    return -1;
                }
            },

            /** Sets pen details */
            SetPenDetails: function (colorcode, thickness) {
                if (typeof colorcode == "string" && typeof thickness == "number") {
                    let pDetails = Topaz.SignatureCaptureWindow.Sign.PenDetails;
                    pDetails.ColorCode = colorcode;
                    pDetails.Thickness = thickness;
                    return 1;
                } else {
                    if (typeof colorcode != "string") {
						errorMessage = "Invalid argument 'colorcode'. Expected 'string' received " + typeof colorcode;
                        console.error("Invalid argument 'colorcode'. Expected 'string' received " + typeof colorcode)
                    }
                    if (typeof thickness != "number") {
						errorMessage = "Invalid argument 'thickness'. Expected 'number' received " + typeof thickness;
                        console.error("Invalid argument 'thickness'. Expected 'number' received " + typeof thickness)
                    }
                    return -1;
                }
            },

            /** Set custom text */
            SetCustomText: function (percentArea, lineOne, lineTwo, displayCustomTextDetails) {
                if ((typeof displayCustomTextDetails == "boolean" || displayCustomTextDetails == undefined)
                    && typeof percentArea == "number" && typeof lineOne == "string" && typeof lineTwo == "string")
                {   //If displayCustomTextDetails is undefined and custom text is set, then set it to true to show the custom text set.
                    if (displayCustomTextDetails == undefined && (lineOne != "" || lineTwo != "") )
                    {
                        displayCustomTextDetails = true;
                    }
                    let customTxt = Topaz.SignatureCaptureWindow.Sign.CustomText;
                    customTxt.DisplayCustomTextDetails = displayCustomTextDetails;
                    customTxt.PercentArea = percentArea;
                    customTxt.LineOne = lineOne;
                    customTxt.LineTwo = lineTwo;
                    return 1;
                }
                else
                {
                    if (typeof displayCustomTextDetails != "boolean") {
						errorMessage = "Invalid argument 'displayCustomTextDetails'. Expected 'boolean' received " + typeof displayCustomTextDetails;
                        console.error("Invalid argument 'displayCustomTextDetails'. Expected 'boolean' received " + typeof displayCustomTextDetails)
                    }
                    if (typeof percentArea != "number") {
						errorMessage = "Invalid argument 'percentArea'. Expected 'number' received " + typeof percentArea;
                        console.error("Invalid argument 'percentArea'. Expected 'number' received " + typeof percentArea)
                    }
                    if (typeof lineOne != "string") {
						errorMessage = "Invalid argument 'lineOne'. Expected 'string' received " + typeof lineOne;
                        console.error("Invalid argument 'lineOne'. Expected 'string' received " + typeof lineOne)
                    }
                    if (typeof lineTwo != "string") {
						errorMessage = "Invalid argument 'lineTwo'. Expected 'string' received " + typeof lineTwo;
                        console.error("Invalid argument 'lineTwo'. Expected 'string' received " + typeof lineTwo)
                    }
                    return -1;
                }
            },

            /** Set minimum signature points */
            SetMinSigPoints: function (points) {
                if (typeof points == "number") {
                    Topaz.SignatureCaptureWindow.Sign.MinSigPoints = points;
                    return 1;
                } else {
					errorMessage = "Invalid argument 'points'. Expected 'number' received " + typeof points;
                    console.error("Invalid argument 'points'. Expected 'number' received " + typeof points)
                    return -1;
                }
            },

            /** Set minimum signature points */
            SetRawDataFormat: function (format) {
                if (typeof format == "number") {
                    Topaz.SignatureCaptureWindow.Sign.RawDataFormat = format;
                    return 1;
                } else {
					errorMessage = "Invalid argument 'format'. Expected 'number' received " + typeof format;
                    console.error("Invalid argument 'format'. Expected 'number' received " + typeof format)
                    return -1;
                }
            },

            /** Starts the process of signing on a signature window. */
            StartSign: async function (showCustomWindow, sigCompressionMode, encryptionMode, encryptionKey) {
                var startSign = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SignatureCapture"
                    }
                };
                if (showCustomWindow !== undefined) {
                    startSign.customWindow = showCustomWindow;
                }
                if (sigCompressionMode !== undefined) {
                    startSign.sigCompressionMode = sigCompressionMode;
                }
                if (encryptionMode !== undefined) {
                    startSign.encryptionMode = encryptionMode;
                }
                if (encryptionKey !== undefined) {
                    startSign.encryptionKey = encryptionKey;
                }

                let sDetails = Topaz.SignatureCaptureWindow.Sign.SignerDetails;
                if (sDetails.FirstName !== undefined) {
                    startSign.firstName = sDetails.FirstName;
                } else {
                    startSign.firstName = "";
                }
                if (sDetails.LastName !== undefined) {
                    startSign.lastName = sDetails.LastName;
                } else {
                    startSign.lastName = "";
                }
                if (sDetails.Email !== undefined) {
                    startSign.eMail = sDetails.Email;
                } else {
                    startSign.eMail = "";
                }
                if (sDetails.Location !== undefined) {
                    startSign.location = sDetails.Location;
                } else {
                    startSign.location = "";
                }

                let iDetails = Topaz.SignatureCaptureWindow.Sign.ImageDetails;
                if (iDetails.Format !== undefined) {
                    startSign.imageFormat = iDetails.Format;
                }
                if (iDetails.Width !== undefined) {
                    startSign.imageX = iDetails.Width;
                }
                if (iDetails.Height !== undefined) {
                    startSign.imageY = iDetails.Height;
                }
                if (iDetails.Transparency !== undefined) {
                    startSign.imageTransparency = iDetails.Transparency;
                }
                if (iDetails.Scaling !== undefined) {
                    startSign.imageScaling = iDetails.Scaling;
                }
                if (iDetails.MaxUpScalePercent !== undefined) {
                    startSign.maxUpScalePercent = iDetails.MaxUpScalePercent;
                }

                let pDetails = Topaz.SignatureCaptureWindow.Sign.PenDetails;
                if (pDetails.ColorCode !== undefined) {
                    startSign.penColor = pDetails.ColorCode;
                }
                if (pDetails.Thickness !== undefined) {
                    startSign.penThickness = pDetails.Thickness;
                }

                let customTxt = Topaz.SignatureCaptureWindow.Sign.CustomText;
                if (customTxt.DisplayCustomTextDetails !== undefined) {
                    startSign.displayCustomTextDetails = customTxt.DisplayCustomTextDetails;
                }
                if (customTxt.PercentArea !== undefined) {
                    startSign.customTextPercent = customTxt.PercentArea;
                }
                if (customTxt.LineOne !== undefined) {
                    startSign.customTextLine1 = customTxt.LineOne;
                }
                if (customTxt.LineTwo !== undefined) {
                    startSign.customTextLine2 = customTxt.LineTwo;
                }

                if (Topaz.SignatureCaptureWindow.Sign.MinSigPoints !== undefined) {
                    startSign.minSigPoints = Topaz.SignatureCaptureWindow.Sign.MinSigPoints;
                }

                if (Topaz.SignatureCaptureWindow.Sign.RawDataFormat !== undefined) {
                    startSign.rawDataFormat = Topaz.SignatureCaptureWindow.Sign.RawDataFormat;
                }

				if (canvasSign) {
                    localStorage.setItem('SigningWindowResponse', false);
                    errorMessage = "Canvas signature is in progress.";
                    top.document.removeEventListener("SignResponse", this.SignResponse);
                    return;
                }
                //Promise is an object that represents either completion or failure of a user task.
                return new Promise(function (resolve) {
                    //Send the message to the extension for further processing.
                    new Support().SendMessageToExtension(startSign, "message-Attribute", "MsgSender");
                    //Receive the response message from the extension
                    //Wait for signing response resolved.
                    setTimeout(function () {
                        new Support().ReceiveMessageFromExtension("SignResponse", resolve);
                    }, 100);
                });
            },

            /** Gets a value indicating if the signature was successful */
            IsSigned: async function () {
                //Get signing window response from local storage.
                return new Support().GetSigningWindowResponse("isSigned");
            },

            /** Gets the raw signature data in base64 format */
            GetRawSignatureData: async function () {
                //Get signing window response from local storage.
                return new Support().GetSigningWindowResponse("rawData");
            },

            /** Gets the information about the signature pad  */
            GetPadInfo: async function () {
                //Get signing window response from local storage.
                return new Support().GetSigningWindowResponse("padInfo");
            },

            /** Gets the sigstring of the signature from StartSign */
            GetSigString: async function () {
                //Get signing window response from local storage for signature image.
                var signResponse = JSON.parse(localStorage.getItem('SigningWindowResponse'));
                if (signResponse == null) {
                    return "";
                }
                else
                    return new Support().GetSigningWindowResponse("sigString");
            },

            /** Gets the signature image in base64 format from the Signature Capture Window (StartSign)*/
            GetSignatureImage: async function () {
                //Get signing window response from local storage for signature image.
                var signResponse = JSON.parse(localStorage.getItem('SigningWindowResponse'));
                if (signResponse == null) {
                    return "";
                }
                else
                    return new Support().GetSigningWindowResponse("imageData");
            },

            /** Completes the process of signing */
            SignComplete: async function () {
                //The SignComplete JSON object.
                var signComplete = {
                    "metadata": {
                        "version": 1.0,
                        "command": "SignComplete"
                    }
                };
                //Remove the local storage item.
                localStorage.removeItem("SigningWindowResponse");
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(signComplete, "message-Attribute", "MsgSender");

            },

            /** Loads the signature capture window in memory*/
            LoadSignatureCaptureWindow: async function (showCustomWindow) {
                var loadSignatureCaptureWindow = {
                    "metadata": {
                        "version": 1.0,
                        "command": "LoadSignatureCaptureWindow"
                    },
                    "customWindow": showCustomWindow
                };
                //Send the message to the extension for further processing.
                new Support().SendMessageToExtension(loadSignatureCaptureWindow, "message-Attribute", "MsgSender");
            }
        }
    }

}

/** Class for Helper Methods */
class Support {
  /**
   * Method to load image from url
   */
  loadImage(url){ return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.src = url;
    })
  }
	/**
	 * Method to create & dispatch event to the extension.
	 * @param {any} jsonObj
	 * @param {any} attributeName
	 * @param {any} command
	 */
	SendMessageToExtension(jsonObj, attributeName, command) {
		//Convert a JavaScript object into a string.
		var jsonString = JSON.stringify(jsonObj);
		//Create an Element Node with the name specified.
		var element = document.createElement(command + "Element");
		//Add the specified attribute to the element and provide the JSON string as value.
		element.setAttribute(attributeName, jsonString);
		//Append the element to the document selement.
		document.documentElement.appendChild(element);
		//Create an event object.
		// document.createEvent('Events');
		//Initialize the event.
		var evt = new Event(command + "Event", {"bubbles":true, "cancelable":false});
		//Dispatch the event.
		element.dispatchEvent(evt);
	}
	/**
	* Method to receive message from the extension.
	* @param {any} response
	* @param {any} resolve
	*/
	ReceiveMessageFromExtension(response, resolve) {
		//Listen for the message response from the extension.
		top.document.addEventListener(response, function isComplete(event) {
			document.removeEventListener(response, isComplete);
			//Message attribute is where the response message is stored.
			var str = event.target.getAttribute("msg-Attribute");
			event.target.remove();
			//Convert string into a JSON object.
			var responseObj = JSON.parse(str);
			//The errorMessage variable is used in the GetLastError() method.
			errorMessage = responseObj.errorMsg;
			//Switch statement to handle different responses.
			switch (response) {
				case "ConnectResponse":
					//Returns a Promise object that is resolved with the returned status value.
					resolve(responseObj.status);
					break;
				case "GetVersionInfoResponse":
					if (responseObj.spelVersion == "") {
						responseObj.spelVersion = null;
					}
					//Returns a Promise object that is resolved with the given value.
					resolve(responseObj.spelVersion);
					break;
				case "GetActiveXVersionInfoResponse":
					if (responseObj.activeXVersion == "") {
						responseObj.activeXVersion = null;
					}
					//Returns a Promise object that is resolved with the given value.
					resolve(responseObj.activeXVersion);
					break;
				case "GetDeviceStatusResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.deviceStatus);
					break;
				case "CustomWindowResponse":
					//Returns a Promise object that is resolved with the returned status value.
					resolve(responseObj.status);
					break;
				case "GetCustomWindowAttributesResponse":
					//Store the custom window attributes in local storage from NMH.
					localStorage.setItem('CustomWindowAttributes', responseObj.signingWindowProperties);
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "GetTabletStateResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletState);
					break;
				case "GetTabletTypeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletType);
					break;
				case "GetTabletComPortResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.port);
					break;
				case "GetLCDSizeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.lcdSize);
					break;
				case "GetTabletModelNumberResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletModelNumber);
					break;
				case "GetTabletSerialNumberResponse":
					resolve(responseObj.tabletSerialNumber);
					break;
				case "KeyPadQueryHotSpotResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.queryHotSpot);
					break;
				case "GetTotalPointsResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.totalPoints);
					break;
				case "GetNumberOfStrokesResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.numberOfStrokes);
					break;
				case "GetNumberOfPointsInStrokeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.numberOfPointsInStroke);
					break;
				case "GetPointXValueResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.pointXValue);
					break;
				case "GetPointYValueResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.pointYValue);
					break;
				case "GetTabletLogicalXSizeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletLogicalXSize);
					break;
				case "GetTabletLogicalYSizeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletLogicalYSize);
					break;
				case "SetSigStringFormatResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "GetSigStringResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.sigString);
					break;
				case "SetSignerDetailsResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "SetImageDetailsResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "SetMinSigPointsResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "SetPenDetailsResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "SetCustomTextResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "SetRawDataFormatResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "GetEncryptionModeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.result);
					break;
				case "GetSigCompressionModeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.result);
					break;
				case "GetImagePenWidthResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.result);
					break;
				case "GetDisplayPenWidthResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.result);
					break;
				case "SignResponse":
					//Returns a Promise object that is resolved with a given value.
					localStorage.setItem('SigningWindowResponse', str);
					resolve(responseObj);
					break;
				case "GetTabletXStartResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletXStart);
					break;
				case "GetTabletXStopResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletXStop);
					break;
				case "GetTabletYStartResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletYStart);
					break;
				case "GetTabletYStopResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.tabletYStop);
					break;
				case "GetjustifyModeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.justifyMode);
					break;
				case "GetjustifyXResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.justifyX);
					break;
				case "GetjustifyYResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.justifyY);
					break;
				case "GetimageWidthResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.width);
					break;
				case "GetimageHeightResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.height);
					break;
				case "lCDCaptureModeResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.result);
					break;
				case "lCDSetWindowResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "lCDWriteImageResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "lCDWriteStringResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "SetSigWindowResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "keyPadAddHotSpotResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
					break;
				case "ModifyIdleScreenLogoResponse":
					//Returns a Promise object that is resolved with a given value.
					resolve(responseObj.status);
                    break;
			    case "GetSignatureImageResponse":
				    //Returns a Promise object that is resolved with a given value
				    resolve(responseObj.imageData);
                    break;
                case "DownloadIdleScreenImageResponse":
                    resolve(responseObj.status);
                    break;
                case "PushCurrentTabResponse":
                    resolve(responseObj);
					// Post the screen coordinates to WebView2 application
					// This is required to push the application to GemView
					if (window.chrome != undefined &&  window.chrome.webview != undefined) {
                        var screenCoordinates = { "screenLeft": responseObj.screenLeft, "screenTop": responseObj.screenTop };
                        window.chrome.webview.postMessage(screenCoordinates);
                    }
                    break;
				case "RevertCurrentTabResponse":
				    resolve(responseObj.status);
				    break;
				case "DisconnectResponse":
				    resolve(responseObj.status);
					break;
				case "UnsupportedCommandResponse":	
				    responseObj.status = -1;
				    resolve(responseObj.status);
                    break;
			}
		}, false);
	}
	/** Method to get custom window attribute from local storage.
	* @param {any} key
	*/
	async GetCustomWindowAttribute(key) {
		//Load the custom window attributes.
		await this.LoadCustomWindowAttributes();
		//Get custom window attributes from local storage.
		var signingWindowProperties = localStorage.getItem('CustomWindowAttributes');
		if(signingWindowProperties != "undefined")
		{
			//Convert JSON string into JSON object.
			signingWindowProperties = JSON.parse(signingWindowProperties);
			if (signingWindowProperties != null) {
			switch (key) {
				case "windowTitle":
					//Returns title of the signing window.
					return signingWindowProperties.signingWindow.windowTitle;
				case "windowState":
					//Returns state of the signing window.
					return signingWindowProperties.signingWindow.windowState;
				case "formBorderStyle":
					//Returns border style of the signing window.
					return signingWindowProperties.signingWindow.formBorderStyle;
				case "signingWindowBackColor":
					//Returns background color of the signing window.
					return signingWindowProperties.signingWindow.backColor;
				case "signingWindowWidth":
					//Returns width of the signing window.
					return signingWindowProperties.signingWindow.size.width;
				case "signingWindowHeight":
					//Returns height of the signing window.
					return signingWindowProperties.signingWindow.size.height;
				case "signingWindowX":
					//Returns X location of the signing window.
					return signingWindowProperties.signingWindow.location.x;
				case "signingWindowY":
					//Returns Y location of the signing window.
					return signingWindowProperties.signingWindow.location.y;
				case "signingWindowToolBarBackColor":
					//Returns background color of signing window toolbar.
					return signingWindowProperties.signingWindowIconButtonsContainer.backColor;
				case "signingWindowToolBarDock":
					//Returns dock location of signing window toolbar.
					return signingWindowProperties.signingWindowIconButtonsContainer.dock;
				case "signingWindowToolBarSize":
					//Returns size of signing window toolbar.
					return signingWindowProperties.signingWindowIconButtonsContainer.size;
				case "signingWindowToolBarPaddingLeft":
					//Returns left padding of signing window toolbar.
					return signingWindowProperties.signingWindowIconButtonsContainer.padding.left;
				case "signingWindowToolBarPaddingTop":
					//Returns top padding of signing window toolbar.
					return signingWindowProperties.signingWindowIconButtonsContainer.padding.top;
				case "signingWindowToolBarPaddingRight":
					//Returns right padding of signing window toolbar.
					return signingWindowProperties.signingWindowIconButtonsContainer.padding.right;
				case "signingWindowToolBarPaddingBottom":
					//Returns bottom padding of signing window toolbar.
					return signingWindowProperties.signingWindowIconButtonsContainer.padding.bottom;
				case "signingWindowToolBarIconSize":
					//Returns size of signing window toolbar icon.
					return signingWindowProperties.signingWindowIconButtons.size;
				case "signingWindowToolBarIconMarginLeft":
					//Returns left margin of signing window toolbar icon.
					return signingWindowProperties.signingWindowIconButtons.margin.left;
				case "signingWindowToolBarIconMarginTop":
					//Returns top margin of signing window toolbar icon.
					return signingWindowProperties.signingWindowIconButtons.margin.top;
				case "signingWindowToolBarIconMarginRight":
					//Returns right margin of signing window toolbar icon.
					return signingWindowProperties.signingWindowIconButtons.margin.right;
				case "signingWindowToolBarIconMarginBottom":
					//Returns bottom margin of signing window toolbar icon.
					return signingWindowProperties.signingWindowIconButtons.margin.bottom;
				case "iconOKBackColor":
					//Retutns back color of signing window toolbar OK icon.
					if(signingWindowProperties.signingWindowIconButtons.iconOK == null)
					  signingWindowProperties.signingWindowIconButtons.iconOK= {"backColor":"#4b5320", "image":""}
					return signingWindowProperties.signingWindowIconButtons.iconOK.backColor;
				case "iconCancelBackColor":
					//Retutns back color of signing window toolbar Cancel icon.
					if(signingWindowProperties.signingWindowIconButtons.iconCancel == null)
						signingWindowProperties.signingWindowIconButtons.iconCancel= {"backColor":"#4b5320", "image":""}
					return signingWindowProperties.signingWindowIconButtons.iconCancel.backColor;
				case "iconClearBackColor":
					//Retutns back color of signing window toolbar Clear icon.
					if(signingWindowProperties.signingWindowIconButtons.iconClear == null)
					   signingWindowProperties.signingWindowIconButtons.iconClear= {"backColor":"#4b5320", "image":""}
					return signingWindowProperties.signingWindowIconButtons.iconClear.backColor;
				case "iconOKImage":
					//Retutns back color of signing window toolbar OK icon.
					if(signingWindowProperties.signingWindowIconButtons.iconOK == null)
					   signingWindowProperties.signingWindowIconButtons.iconOK= {"backColor":"#4b5320", "image":""}
					return signingWindowProperties.signingWindowIconButtons.iconOK.image;
				case "iconCancelImage":
					//Retutns back color of signing window toolbar Cancel icon.
					if(signingWindowProperties.signingWindowIconButtons.iconCancel == null)
					   signingWindowProperties.signingWindowIconButtons.iconCancel= {"backColor":"#4b5320", "image":""}
					return signingWindowProperties.signingWindowIconButtons.iconCancel.image;
				case "iconClearImage":
					//Retutns back color of signing window toolbar Clear icon.
					if(signingWindowProperties.signingWindowIconButtons.iconClear == null)
					   signingWindowProperties.signingWindowIconButtons.iconClear= {"backColor":"#4b5320", "image":""}
                    return signingWindowProperties.signingWindowIconButtons.iconClear.image;
				case "signingAreaBackColor":
					//Returns background color of the signing area.
					return signingWindowProperties.signingArea.backColor;
				case "signingAreaWidth":
					//Returns width of the signing area.
					return signingWindowProperties.signingArea.size.width;
				case "signingAreaHeight":
					//Returns height of the signing area.
					return signingWindowProperties.signingArea.size.height;
				case "signingAreaX":
					//Returns x coordinate of the signing area location.
					return signingWindowProperties.signingArea.location.x;
				case "signingAreaY":
					//Returns y coordinate of the signing area location.
					return signingWindowProperties.signingArea.location.y;
				case "signingAreaDock":
					//Returns docking location of signing area.
					return signingWindowProperties.signingArea.dock;
			}
		}
	}
	else
	{
		switch (key) {
				case "windowTitle":
					//Returns title of the signing window.
					return "SigPlusExtLite Signing Window";
				case "windowState":
					//Returns state of the signing window.
					return 0;
				case "formBorderStyle":
					//Returns border style of the signing window.
					return 3;
				case "signingWindowBackColor":
					//Returns background color of the signing window.
					return "#f0f0f0";
				case "signingWindowWidth":
					//Returns width of the signing window.
					return 785;
				case "signingWindowHeight":
					//Returns height of the signing window.
					return 340;
				case "signingWindowX":
					//Returns X location of the signing window.
					return 0;
				case "signingWindowY":
					//Returns Y location of the signing window.
					return 0;
				case "signingWindowToolBarBackColor":
					//Returns background color of signing window toolbar.
					return "#fed7b0";
				case "signingWindowToolBarDock":
					//Returns dock location of signing window toolbar.
					return 1;
				case "signingWindowToolBarSize":
					//Returns size of signing window toolbar.
					return 30;
				case "signingWindowToolBarPaddingLeft":
					//Returns left padding of signing window toolbar.
					return 0;
				case "signingWindowToolBarPaddingTop":
					//Returns top padding of signing window toolbar.
					return 0;
				case "signingWindowToolBarPaddingRight":
					//Returns right padding of signing window toolbar.
					return 1;
				case "signingWindowToolBarPaddingBottom":
					//Returns bottom padding of signing window toolbar.
					return 0;
				case "signingWindowToolBarIconSize":
					//Returns size of signing window toolbar icon.
					return 24;
				case "signingWindowToolBarIconMarginLeft":
					//Returns left margin of signing window toolbar icon.
					return 0;
				case "signingWindowToolBarIconMarginTop":
					//Returns top margin of signing window toolbar icon.
					return 1;
				case "signingWindowToolBarIconMarginRight":
					//Returns right margin of signing window toolbar icon.
					return 5;
				case "signingWindowToolBarIconMarginBottom":
					//Returns bottom margin of signing window toolbar icon.
					return 2;
				case "iconOKBackColor":
					//Retutns back color of signing window toolbar OK icon.
					return "#4b5320";
				case "iconCancelBackColor":
					//Retutns back color of signing window toolbar Cancel icon.
					return "#4b5320";
				case "iconClearBackColor":
					//Retutns back color of signing window toolbar Clear icon.
					return "#4b5320";
				case "iconOKImage":
					//Retutns back color of signing window toolbar OK icon.
					return "";
				case "iconCancelImage":
					//Retutns back color of signing window toolbar Cancel icon.
					return "";
				case "iconClearImage":
					//Retutns back color of signing window toolbar Clear icon.
					return "";
				case "signingAreaBackColor":
					//Returns background color of the signing area.
					return "#ffffff";
				case "signingAreaWidth":
					//Returns width of the signing area.
					return 785;
				case "signingAreaHeight":
					//Returns height of the signing area.
					return 240;
				case "signingAreaX":
					//Returns x coordinate of the signing area location.
					return 0;
				case "signingAreaY":
					//Returns y coordinate of the signing area location.
					return 0;
				case "signingAreaDock":
					//Returns docking location of signing area.
					return 0;
			}
		}
	}
	/** Method to set custom window attribute to local storage.
	* @param {any} key
	* @param {any} value
	* @param {any} command
	*/
	async SetCustomWindowAttribute(key, value, command) {
		//Load the custom window attributes.
		await this.LoadCustomWindowAttributes();
		//Get custom window attributes from local storage.
		var signingWindowProperties = localStorage.getItem('CustomWindowAttributes');
		if(signingWindowProperties != "undefined")
		{
		//Convert JSON string into JSON object.
		signingWindowProperties = JSON.parse(signingWindowProperties);
		if (signingWindowProperties != null) {
			//To update signing window attribute values.
			if (command == "signingWindow") {
				//loop signing window properties until key matches.
				for (var i in signingWindowProperties.signingWindow) {
					if (!signingWindowProperties.signingWindow.hasOwnProperty(i)) continue;
					if (i == key) {
						//update the signing window properties.
						signingWindowProperties.signingWindow[i] = value;
						break;
					}
				}
			}
			//To update signing window icon buttons container values.
			else if (command == "signingWindowToolBar") {
				//loop signing window icon buttons container properties until key matches.
				for (var i in signingWindowProperties.signingWindowIconButtonsContainer) {
					if (!signingWindowProperties.signingWindowIconButtonsContainer.hasOwnProperty(i)) continue;
					if (i == key) {
						//update the signing window icon buttons container values.
						signingWindowProperties.signingWindowIconButtonsContainer[i] = value;
						break;
					}
				}
			}
			//To update signing window icon buttons values.
			else if(command == "signingWindowToolBarIcon")
			{
				//loop signing window icon buttons container properties until key matches.
				for(var i in signingWindowProperties.signingWindowIconButtons)
				{
					if (!signingWindowProperties.signingWindowIconButtons.hasOwnProperty(i)) continue;
					//For signing window toolbar icons backcolor and image.
					if(value.iconType != null)
					{
						 if(signingWindowProperties.signingWindowIconButtons.iconOK == null)
							signingWindowProperties.signingWindowIconButtons.iconOK = {"backColor":"#4b5320", "image":""}
						 if(signingWindowProperties.signingWindowIconButtons.iconCancel == null)
							signingWindowProperties.signingWindowIconButtons.iconCancel  = {"backColor":"#4b5320", "image":""}
						 if(signingWindowProperties.signingWindowIconButtons.iconClear == null)
							signingWindowProperties.signingWindowIconButtons.iconClear= {"backColor":"#4b5320", "image":""}
						//update toolbar icon back color for all Icons.
						if(value.iconType == 1)
						{
							signingWindowProperties.signingWindowIconButtons["iconOK"].backColor = value.colorCode;
							signingWindowProperties.signingWindowIconButtons["iconCancel"].backColor = value.colorCode;
							signingWindowProperties.signingWindowIconButtons["iconClear"].backColor = value.colorCode;
						}
						//update toolbar icon back color and image for each icon
						else
						{
							if (i == key) {
								//update toolbar icon back color.
								if(value.colorCode != null)
								  signingWindowProperties.signingWindowIconButtons[i].backColor = value.colorCode;
								//update toolbar icon image.

								//if(value.image != null)
								signingWindowProperties.signingWindowIconButtons[i].image = value.image;
							}
						}
					}
					//For signing window toolbar icons other attributes.
					else
					{
						if (i == key) {
							//update the signing window toolbar icon attributes.
							signingWindowProperties.signingWindowIconButtons[i] = value;
							break;
						}
					}
				}
			}
			//To update signing area attribute values.
			else if(command == "signingArea")
			{
				//loop signing area properties until key matches.
				for(var i in signingWindowProperties.signingArea)
				{
					if (!signingWindowProperties.signingArea.hasOwnProperty(i)) continue;
						if (i == key ) {
							//update the signing area properties.
							signingWindowProperties.signingArea[i] = value;
							break;
					}
				}
			}
			try
			{
				//store custom window properties JSON string in local storage.
				localStorage.setItem('CustomWindowAttributes', JSON.stringify(signingWindowProperties));
			}
			catch(err)
			{
			}
		}
	 }
	}
	/** Method to load custom window attributes from NMH.*/
	async LoadCustomWindowAttributes() {
		//If the attributes are not available in the local storage then
		//get the custom window attributes from NMH.
		if (localStorage.getItem('CustomWindowAttributes') == null) {
			//Get custom window attributs JSON object.
			var getCustomWindowAttributes = {
				"metadata": {
					"version": 1.0,
					"command": "GetCustomWindowAttributes"
				}
			};
			var self = this;
			return new Promise(function (resolve) {
				//Send the message to the extension for further processing.
				self.SendMessageToExtension(getCustomWindowAttributes, "msg-Attribute-GetCustomWindow", "GetCustomWindowAttributes");
				//Receive the response message from the extension.
				self.ReceiveMessageFromExtension("GetCustomWindowAttributesResponse", resolve);
			});
		}
	}
	/** Method to get icon name.*/
	GetIconName(iconType)
	{
		var iconName;
        if (iconType == 2) {
            iconName = "iconOK";
        }
        else if (iconType == 3) {
            iconName = "iconCancel";
        }
        else if (iconType == 4) {
            iconName = "iconClear";
        }
		return iconName;
	}
	/** Method to get Signing window reposnse. */
	async GetSigningWindowResponse(key)
	{
			var signingWindowResponse = localStorage.getItem('SigningWindowResponse');
			//Convert JSON string into JSON object.
			signingWindowResponse = JSON.parse(signingWindowResponse);
			if (signingWindowResponse != null) {
				switch (key)
				{
					case "isSigned":
					//Returns image data of the signature.
					return signingWindowResponse.isSigned;
					case "imageData":
					//Returns image data of the signature.
					return signingWindowResponse.imageData;
					case "rawData":
					//Returns raw data of the signature.
					return signingWindowResponse.rawData;
					case "padInfo":
					//Returns raw data of the signature.
					return signingWindowResponse.padInfo;
					case "sigString":
					//Returns signature string.
					return signingWindowResponse.sigString;
				}
			}
	}
}
