"use strict";
(function() {

	var mJSZip = new JSZip();
	var jni = mJSZip.folder("jni");
	var host = "http://localhost:63342/AddOnGen-Rewrite/";

	var AndroidManifest;
	var MakeFile;

	var build;
	var application;
	var properties;
	var main;
	var substrate;
	var lib1;
	var lib2;

	var addonName = "Demo Addon - by AddonGeneratorBot";
	var addonPackage = "io.gihub.hellpie.addongenerator.demo";
	var MCPEVersion = "0.13.0";

	var addonNameInput = null;
	var addonPackageInput = null;
	var MCPEVersionInput = null;

	/**
	 * Get file from given URL
	 * @param url string
	 * @returns string
	 */
	function getRemoteFileContent(url) {
		var request = new XMLHttpRequest();
		var reqresponse = null;
		request.open('GET', url, false);
		request.onreadystatechange = function() {
			if(this.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					reqresponse = this.responseText;
				}
			}
		};
		request.send();
		return reqresponse;
	}

	/**
	 * Initializes the content of the files for the zip
	 */
	function initFilesContent() {
		AndroidManifest = getRemoteFileContent(host + "assets/AndroidManifest.xml");
		MakeFile = getRemoteFileContent(host + "assets/jni/Android.mk");
	}

	/**
	 * Updates the content of the variables with the one taken from the input boxes
	 */
	function updateDataContent() {
		if(addonNameInput.checkValidity() && addonNameInput.value != "") {
			addonName = addonNameInput.value;
		}

		if(addonPackageInput.checkValidity() && addonPackageInput.value != "") {
			addonPackage = addonPackageInput.value;
		}

		if(MCPEVersionInput.checkValidity() && MCPEVersionInput.value != "") {
			MCPEVersion = MCPEVersionInput.value;
		}
	}

	/**
	 * Updates the content of the files using the user inserted addon values
	 */
	function updateFileContent() {
		if(AndroidManifest.lastIndexOf("ADDONNAME") == 484
			|| AndroidManifest.lastIndexOf("PACKAGENAME") == 127
			|| AndroidManifest.lastIndexOf("MCPEVERSION") == 916
			|| MakeFile.lastIndexOf("PACKAGENAME") == 66) {

			AndroidManifest = AndroidManifest.replace(/ADDONNAME/g, addonName);
			AndroidManifest = AndroidManifest.replace(/PACKAGENAME/g, addonPackage);
			AndroidManifest = AndroidManifest.replace(/MCPEVERSION/g, MCPEVersion);
			MakeFile = MakeFile.replace(/PACKAGENAME/g, addonPackage);
		} else {
			alert("ERROR: Some files got corrupted during download!");
		}
	}

	function buildCompressedFile(sector, data) {

		var lbl = "libmcpelauncher_tinysubstrate.so";
		var lpe = "libminecraftpe.so";

		if(sector == 0) {
			wassupNow("Downloading remaining files");
			mJSZip.file("AndroidManifest.xml", AndroidManifest);
			jni.file("Android.mk", MakeFile);

			build = getRemoteFileContent(host + "assets/build.xml");
			mJSZip.file("build.xml", build);

			properties = getRemoteFileContent(host + "assets/project.properties");
			mJSZip.file("project.properties", properties);

			application = getRemoteFileContent(host + "assets/jni/Application.mk");
			jni.file("Application.mk", application);

			getBinaryContent(host + "assets/jni/" + lbl, buildCompressedFile, 1)
		} else if(sector == 1) {
			jni.file(lbl, data);

			getBinaryContent(host + "assets/jni/" + lpe, buildCompressedFile, 2)
		} else if(sector == 2) {
			jni.file(lpe, data);

			buildCompressedFile(3, "")
		} else if(sector == 3) {
			jni.file("main.cpp", getRemoteFileContent(host + "assets/jni/main.cpp"), {createFolders: true});
			jni.file("Substrate.h", getRemoteFileContent(host + "assets/jni/Substrate.h"), {createFolders: true});
			wassupNow("Generating Zip");
			var addon = mJSZip.generate({type: "blob"});
			document.getElementById("download-infos").innerHTML = "<a id=\"usuckatminecraft\">Done! Click here to Download!</a>"
			var url =  window.URL.createObjectURL(addon);
			document.getElementById("usuckatminecraft").href = url;
			document.getElementById("usuckatminecraft").download = addonName.replace(/ /g, "_") + ".zip";
		} else {
			alert("ERROR: Unable to download and generate compressed file!");
		}
	}

	/**
	 * Calls functions in the right order. Much useful really fancy wow.
	 */
	function generateZip() {
		wassupNow("Downloading Files");
		initFilesContent();
		wassupNow("Updating Files Data");
		updateDataContent();
		wassupNow("Preparing Addon Infos");
		updateFileContent();
		buildCompressedFile(0, "");
	}

	function initAddonGenerator() {
		addonNameInput = document.getElementById("input-addonname");
		addonPackageInput = document.getElementById("input-packagename");
		MCPEVersionInput = document.getElementById("input-mcpeversion");
		document.getElementById("button-download").addEventListener("click", generateZip);
	}

	document.addEventListener("DOMContentLoaded", initAddonGenerator);

	function wassupNow(msg) {
		document.getElementById("download-infos").textContent = msg;
		setTimeout(lel(msg), 500);
	}

	function lel(msg, i) {
		console.log(msg);
	}

	var createXHR = window.ActiveXObject ?
		/* Microsoft failed to properly
		 * implement the XMLHttpRequest in IE7 (can't request local files),
		 * so we use the ActiveXObject when it is available
		 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
		 * we need a fallback.
		 */
			function() {
				return createStandardXHR() || createActiveXHR();
			} :
		// For all other browsers, use the standard XMLHttpRequest object
			createStandardXHR;

	function createStandardXHR() {
		try {
			return new window.XMLHttpRequest();
		} catch( e ) {}
	}

	function createActiveXHR() {
		try {
			return new window.ActiveXObject("Microsoft.XMLHTTP");
		} catch( e ) {}
	}

	function getBinaryContent(path, callback, step) {
		/*
		 * Here is the tricky part : getting the data.
		 * In firefox/chrome/opera/... setting the mimeType to 'text/plain; charset=x-user-defined'
		 * is enough, the result is in the standard xhr.responseText.
		 * cf https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest#Receiving_binary_data_in_older_browsers
		 * In IE <= 9, we must use (the IE only) attribute responseBody
		 * (for binary data, its content is different from responseText).
		 * In IE 10, the 'charset=x-user-defined' trick doesn't work, only the
		 * responseType will work :
		 * http://msdn.microsoft.com/en-us/library/ie/hh673569%28v=vs.85%29.aspx#Binary_Object_upload_and_download
		 *
		 * I'd like to use jQuery to avoid this XHR madness, but it doesn't support
		 * the responseType attribute : http://bugs.jquery.com/ticket/11461
		 */
		try {

			var xhr = createXHR();

			xhr.open('GET', path, true);

			// recent browsers
			if ("responseType" in xhr) {
				xhr.responseType = "arraybuffer";
			}

			// older browser
			if (xhr.overrideMimeType) {
				xhr.overrideMimeType("text/plain; charset=x-user-defined");
			}

			xhr.onreadystatechange = function (evt) {
				var file, err;
				// use `xhr` and not `this`... thanks IE
				if (xhr.readyState === 4) {
					if (xhr.status === 200 || xhr.status === 0) {
						file = null;
						err = null;
						try {
							file = JSZipUtils._getBinaryFromXHR(xhr);
						} catch (e) {
							err = new Error(e);
						}
						callback(step, file);
					} else {
						callback(new Error("Ajax error for " + path + " : " + this.status + " " + this.statusText), null);
					}
				}
			};

			xhr.send();

		} catch (e) {
			callback(new Error(e), null);
		}
	};

})();