 Copyright © 2026 Topaz Systems Inc. All rights reserved. For trademarks and patents, visit http://www.topazsystems.com/legal. For more information on Topaz signature pads and software, visit http://www.topazsystems.com. 

# Installation & Help Guide 

### SigWeb 

## Contents 

**Installation ....................................................................................................................................................... 2** 

 Requirements ............................................................................................................................................................................................................. 2 Important Updates ................................................................................................................................................................................................. 2 First-Time Install Steps.......................................................................................................................................................................................... 2 Re-Installation Steps .............................................................................................................................................................................................. 3 Local Network Access Set-Up ......................................................................................................................................................................... 3 SigWeb Test Utility .................................................................................................................................................................................................. 4 

**SigWeb Cert Checker Software Package ..................................................................................................... 4** 

 Background & Overview ..................................................................................................................................................................................... 4 Process Description................................................................................................................................................................................................ 4 SigWebCertCheckerConfigs.xml ................................................................................................................................................................... 5 PFXConfigs.xml ......................................................................................................................................................................................................... 6 

**Help & Support ................................................................................................................................................ 6** 


 SigWeb Installation Guide 

## Installation 

### Requirements 

- Microsoft .NET Framework Version 4.7.1 or later 

- Local Network Access enabled per site in supported browsers (Chrome/Edge) 

### Important Updates 

For models that support LCD compression (T‑LBK57GC, T‑LBK43LC, T‑LBK766SE, and T‑LBK750SE): if compression is enabled in your local SigPlus INI file and you are upgrading to SigWeb 1.7.3.0 or newer, be sure to uncheck the ‘Force Compression Off’ option under ‘Advanced Settings…’. To determine whether compression is currently enabled, open the SigPlus.ini (typically located in the Windows directory) and check whether the [Tablet] section contains LCDZCompression=1 or LCDCompressMode=1. Newer SigWeb versions ignore the [Tablet] section and default to disabling compression. 

### First-Time Install Steps 

#### Follow Steps 1-4 here if you have never installed SigWeb before: 

1. Download the SigWeb installer at: **[http://www.topazsystems.com/software/sigweb.exe](http://www.topazsystems.com/software/sigweb.exe)**. Before     installing, be sure to close all open browsers (i.e. Chrome, Firefox, Internet Explorer, etc). 

2. Run the SigWeb installer (right-click and select “Run as Administrator”). Do not connect your     signature pad until installation is complete. 

3. Once complete, test SigWeb with the SigWeb Demo at this page:     **[http://www.sigplusweb.com/sigwebtablet_demo.html](http://www.sigplusweb.com/sigwebtablet_demo.html)**. Click “Sign” and sign on your signature pad;     your signature will appear in the signature box. 


 SigWeb Installation Guide 

### Re-Installation Steps 

#### Follow Steps 1-2 here if SigWeb has already been installed and you are performing a re-install: 

1. Under “Start” → “Control Panel” → “Programs and Features”, right-click on “SigWeb”, and choose     “Uninstall”. Allow the “Uninstall” to complete. 

 If you do not see the “Programs and Features” option under the “Control Panel”, click “View by:” in the top right of your window, and select “Small icons”. 

 Important Note : If you have SigWeb version 1.5 or earlier it may require a 2-step uninstall. First, uninstall the SigWeb 1.0.0 component and then uninstall the Topaz SigWeb component. Please note that the order of this process is important. 

2. Follow the steps in the first section of this guide called “ **First-Time Install Steps** ” in order to install     SigWeb properly. 

3. For SigWeb versions 1.7.2.7 and earlier: To keep the current Topaz tablet settings, click the “Keep     Current SigPlus.ini Settings” button in the lower-left corner of the “Tablet Configuration” screen. 

### Local Network Access Set-Up 

Chrome (version 142+) and Microsoft Edge (version 143+) require Local Network Access permissions to enable local services such as SigWeb. For more information, view the SigWeb Local Network Access Guide at: **[http://www.topazsystems.com/software/SigWeb_Local_Network_Access_Guide.pdf](http://www.topazsystems.com/software/SigWeb_Local_Network_Access_Guide.pdf)**. 


 SigWeb Installation Guide 

### SigWeb Test Utility 

You can test the SigWeb installation by running the SigWeb Test Utility, found at: **[http://www.topazsystems.com/software/SigWeb_Test_Utility.exe](http://www.topazsystems.com/software/SigWeb_Test_Utility.exe)**. 

## SigWeb Cert Checker Software Package 

### Background & Overview 

SigWeb requires an SSL certificate to be installed to allow communication between Topaz signature pads and a webpage within a secure context (https). If a valid SSL certificate is not installed on the client machine, then SigWeb will not function within secure web contexts (https). Topaz provides a default SSL certificate; customers can also use their own certificate. 

SSL certificates expire every year for security reasons. Thus, the SSL certificate must be checked and updated annually. Topaz developed the SigWeb Certificate Updater to automate this process when using Topaz certificates. Other certificates will require customers to customize their own configuration and the JavaScript used to reference the location. The Topaz Developer Support Team is available to assist in this process at **devsupport@topazsystems.com**. 

The SigWeb Certificate Updater checks the SigWeb certificate’s status and notifies users and/or updates the SigWeb certificate before it expires. The process runs every time SigWeb starts and begins checking for the availability of an updated certificate 60 days before the certificate expires. 

The details of the process can be configured by modifying the “SigWebCertCheckerConfigs.xml” file and other files referenced within this xml file. If an automatic certificate update isn’t desired, then it can be disabled by changing the value of utcDateUpdated to “none” in the “SigWebCertCheckerConfigs.xml” file. 

### Process Description 

The SigWeb Certificate Updater thread runs with system-level privileges as part of the Topaz SigWeb Tablet Service. If there is a new version of the certificate available, it notifies the user (if notification is enabled) and allows them to choose to update the certificate. Otherwise, it silently attempts to update the certificate. After a successful install, the “SigWebCertCheckerConfigs.xml” file is updated with the new certificate data and “PFXConfigs.xml” data. 


 SigWeb Installation Guide 

### SigWebCertCheckerConfigs.xml 

The “SigWebCertCheckerConfigs.xml” file configures the SigWeb Certificate Updater’s operations. 

#### Description 

This file is the base configuration file that configures the information to use for checking the SigWeb certificate, notifying users, and retrieving the updated certificate. 

#### Configurations 

#### certificate: Defines the thumbprint and subjectName to use for finding the SigWeb certificate. This 

information is automatically updated when a new SigWeb certificate is installed. DO NOT MODIFY. 

#### thumbprint: The thumbprint used for finding the SigWeb certificate. If cannot find the certificate by the 

thumbprint, then it will search by the subjectName. 

#### subjectName: The subjectName used for finding the SigWeb certificate. Each element within the 

subjectName must match the certificate’s subjectName’s elements exactly. 

#### notification: Defines when to show notifications in the SigWebCertUpdater and SigWebCertStatusNotifier 

applications. 

#### showPopupNotifications: If set to true, show notifications. If set to false, then do not show notifications. 

#### *** Recommend IT administrators set this value to true on their computer to know when the SigWeb 

#### certificate is updating for their users. This value can be set to true during installation by checking the 

#### “Notify Users of Expiring Certificate” box. *** 

#### pfx: Defines the location and update status of the PFXConfigs.xml file. 

#### pfxConfigsURL: Address to the PFXConfigs.xml file that configures the PFX location and data. 

- URI Schema must be: 'file:///', 'http://', or 'https://'. 

- For local or network files, use 'file:///'. 

- For HTTP, use 'http://' or 'https://' 

#### utcDateUpdated: UTC Date that is compared with the PFXConfigs.xml file to detect whether there is an 

update to the PFX file that needs to be installed. Determines if a new certificate is available. DO NOT MODIFY unless you are trying to disable automatic certificate update. To disable automatic certificate update, set to “none”. 


 SigWeb Installation Guide 

### PFXConfigs.xml 

#### Description 

This file is the base configuration file used for determining the location of the new certificate (PFX file), decryption information, and date this file was updated. 

#### Configurations 

#### pfxURL: Link to the PFX file that is used to install the SigWeb certificate. 

#### pfxDataURL: Link to data used for installing the SigWeb certificate. 

#### iv: IV used for decrypting information. 

#### utcDateUpdated: UTC Date that is compared with the SigWebCertCheckerConfigs.xml file to determine 

whether there is an update to the PFXConfigs.xml file. Determines if a new certificate is available. 

#### pfxConfigsURL: Link to this PFXConfigs.xml file. Used to allow the SigWebCertUpdater application to 

change the location of the PFXConfigs.xml within the SigWebCertCheckerConfigs.xml file. If not set, then the SigWebCertCheckerConfigs.xml file will not be modified. 

## Help & Support 

For troubleshooting help or assistance, contact Dev Support at **devsupport@topazsystems.com**. 

Silent installers are available upon request. Visit the Topaz silent installer page at **[http://www.topazsystems.com/silent-installer.html](http://www.topazsystems.com/silent-installer.html)** for details. 


