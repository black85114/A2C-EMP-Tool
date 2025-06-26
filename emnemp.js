// === 原有的 Creo.JS 函數 (保持不變) ===
function getSession() {
	return pfcGetCurrentSession();
}

function getCurrentModelName() {
	try {
		const session = getSession();
		const model = session.CurrentModel;
		if (model) {
			let fileName = model.FileName;
			if (fileName.includes(".")) {
				fileName = fileName.substring(0, fileName.lastIndexOf("."));
			}
			return fileName;
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
}

function getCurrentDirectory() {
	try {
		const session = getSession();
		return session.GetCurrentDirectory();
	} catch (error) {
		return null;
	}
}

function findBackupDirectory() {
	try {
		const session = getSession();
		const model = session.CurrentModel;
		const currentDir = model.Origin;
		const lastSlashIndex = Math.max(currentDir.lastIndexOf("\\"), currentDir.lastIndexOf("/"));
		const modelPath = currentDir.substring(0, lastSlashIndex);    
		return modelPath;
	} catch (error) {
		return null;
	}
}

function setWorkingDirectory(fullPath) {
	try {
		const session = getSession();
		session.ChangeDirectory(fullPath);
		return session.GetCurrentDirectory();
	} catch (error) {
		return { error: error.message };
	}
}

function runColorMacro() {
	try {
		const session = getSession();
		const macro_paint = "~ Select `main_dlg_cur` `PHTLeft.AssyTree` 1 `T2 7`;" +
							"~ Command `ProCmdMakeActive@PopupMenuTree`;" +
							"~ Command `ProCmdMdlTreeSearch`;" +                              
							"~ Open `selspecdlg0` `SelOptionRadio`" +
							"~ Close `selspecdlg0` `SelOptionRadio`;" +
							"~ Select `selspecdlg0` `SelOptionRadio` 1 `Geometric Body`;" +
							"~ Open `selspecdlg0` `ExtRulesLayout.ExtBasicNameLayout.BasNameComp`;" +
							"~ Close `selspecdlg0` `ExtRulesLayout.ExtBasicNameLayout.BasNameComp`;" +
							"~ Select `selspecdlg0` `ExtRulesLayout.ExtBasicNameLayout.BasNameComp` 1 ` != `;" +
							"~ Update `selspecdlg0` `ExtRulesLayout.ExtBasicNameLayout.BasicNameList` `*`;" +
							"~ Activate `selspecdlg0` `EvaluateBtn`;" +
							"~ Activate `selspecdlg0` `ApplyBtn`;" +            
							"~ Activate `selspecdlg0` `CancelButton`;" +
							"~ Activate `main_dlg_cur` `page_View_control_btn` 1;" +
							"~ Select `main_dlg_cur` `View:ProCmdViewGallery`;" +
							"~ Select `main_dlg_cur` `ProCmdViewGallery_layoutph.palette_holder.myAppPalette.NamesList` 1 `ptc-metallic-blue`;" +
							"~ Timer `` `` `Gallery_UI_Timer`;" +
							"~ Close `main_dlg_cur` `View:ProCmdViewGallery`;" +
							"~ Select `main_dlg_cur` `PHTLeft.AssyTree` 1 `node0`;" +
							"~ Command `ProCmdMakeActive@PopupMenuTree` ;" +
							"~ Close `main_dlg_cur` `Model:ProCmdViewGallery`;"+
							"~ LButtonArm `main_dlg_cur` `proe_win` 9 765 717 0 1 1461 815 1920 1080 1709707;" +
							"~ LButtonDisarm `main_dlg_cur` `proe_win` 9 765 717 0 0 1461 815 1920 1080 1709794;";
		
		session.RunMacro(macro_paint);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}

function checkColoringStatus() {
	try {
		const session = getSession();
		const model = session.CurrentModel;
		
		if (model) {
			return model.IsActive();
		}
		return false;
	} catch (error) {
		return false;
	}
}

function runDelMacro() {
	try {
		const session = getSession();
		const macro_del = 	"~ Command `ProCmdMdlTreeSearch` ;"+
							"~ Open `selspecdlg0` `SelOptionRadio`;"+
							"~ Close `selspecdlg0` `SelOptionRadio`;"+
							"~ Select `selspecdlg0` `SelOptionRadio` 1 `Part`;"+
							"~ Select `selspecdlg0` `CascadeButton1`;"+
							"~ Close `selspecdlg0` `CascadeButton1`;"+
							"~ Activate `selspecdlg0` `CondBuilderCheck` 1;"+
							"~ Update `selspecdlg0` `ExtRulesLayout.ExtBasicNameLayout.BasicNameList` `H*`;"+
							"~ Activate `selspecdlg0` `AddRuleBtn`;"+
							"~ Update `selspecdlg0` `ExtRulesLayout.ExtBasicNameLayout.BasicNameList` `TEST*`;"+
							"~ Activate `selspecdlg0` `AddRuleBtn`;"+
							"~ Update `selspecdlg0` `ExtRulesLayout.ExtBasicNameLayout.BasicNameList` `SH*`;"+
							"~ Activate `selspecdlg0` `AddRuleBtn`;"+
							"~ Update `selspecdlg0` `ExtRulesLayout.ExtBasicNameLayout.BasicNameList` `K*`;"+
							"~ Activate `selspecdlg0` `AddRuleBtn`;"+
							"~ Activate `selspecdlg0` `EvaluateBtn`;"+
							"~ Select `selspecdlg0` `ResultList` -1;;"+
							"~ Activate `selspecdlg0` `ApplyBtn`;"+
							"~ Activate `selspecdlg0` `CancelButton`;"+
							"~ Command `ProCmdEditDelete` ;"+
							"~ Activate `del_sup_msg` `ok`;";
		session.RunMacro(macro_del);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}	

function runBackupMacro(folderName) {
	try {
		const session = getSession();
		const macro_backup = "~ Command `ProCmdModelBackup` ;" +
							 "~ RButtonArm `file_saveas` `ph_list.Filelist` ``;" +                                     
							 "~ PopupOver `file_saveas` `listPopup` 1 `ph_list.Filelist`;" +                           
							 "~ Open `file_saveas` `listPopup`;" +
							 "~ Close `file_saveas` `listPopup`;" +
							 "~ Activate `file_saveas` `newdirectory_pb0`;" +
							 "~ Update `getnewdir` `new_dir_input` `" + folderName + "`;" +
							 "~ Activate `getnewdir` `OK_button`;" +
							 "~ Activate `file_saveas` `OK`;"+
							 "~ Close `unembedded_browser_dialog` `unembedded_browser_dialog`";
		
		session.RunMacro(macro_backup);
		return folderName;
	} catch (error) {
		return { error: error.message };
	}
}

function checkBackupStatus(folderName) {
	try {
		const session = getSession();
		const files = session.ListFiles("*", true);
		
		for (let i = 0; i < files.Count; i++) {
			const fileEntry = files.Item(i);
			if (fileEntry.toUpperCase().endsWith(folderName.toUpperCase())) {
				 return true;
			}
		}
		return false;
	} catch (error) {
		return false;
	}
}

function runCleanMacro() {
	try {
		const session = getSession();
		const macro_clean = 
							"~ Command `ProCmdWinCloseGroup` ;" +
							"~ Command `ProCmdModelEraseNotDisp` ;" +    
							"~ Activate `file_erase_nd` `ok_pb`;"+
							"~ Command `ProCmdBrowserBtn`  1;";
		
		session.RunMacro(macro_clean);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}

function runBatchMacro() {
	try {
		const session = getSession();
		const macro_bat =  "@SYSTEM xcopy \"\\\\\\\\10.1.182.31\\\\a2\\\\A2C\\\\Temp\\\\WEB\\\\000-EMP_Translator_v8.ps1\" \"\%cd\%\" /Y  \\n "+
							"start cmd /c powershell.exe -ExecutionPolicy Bypass -File  \".\\\\000-EMP_Translator_v8.ps1\"\\n exit;" ;
		
		session.RunMacro(macro_bat);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}

function checkCleanStatus() {
	try {
		const session = getSession();
		const models = session.ListModels();
		return models.Count <= 1;
	} catch (error) {
		return false;
	}
}

function runOpenAsmMacro(folderName) {
	try {
		const session = getSession();
		const asmFileName = `0-${folderName}.asm`;
		
		const macro_open_asm = 	"~ Activate `main_dlg_cur` `EMBED_BROWSER Close` ;"+
								"~ Command `ProCmdModelOpen` ;"+
								"~ Select `file_open` `Ph_list.Filelist` 1 `'${asmFileName}'` ;"+
								"~ Activate `file_open` `Ph_list.Filelist` 1 `'${asmFileName}'` ;"+
								"~ Activate `open_rep` `OpenCascBtn`;";                                                     
								
		session.RunMacro(macro_open_asm);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}

// === 新增的配置管理函數 ===
function updateConfigFile(configData) {
	try {
		const session = getSession();
		
		// 構建完整的配置內容
		const configLines = [
			"FtpLibEnabled=" + configData.ftpLibEnabled,
			"LocalLibEnabled=" + configData.localLibEnabled,
			"CopyMatchingSourceFolders=" + configData.copyMatchingSourceFolders,
			"AutoZeroRenameEnabled=" + configData.autoZeroRenameEnabled,
			"SelfDestructEnabled=" + configData.selfDestructEnabled,
			"NasHostName=" + configData.nasHostName,
			"StatusIP=" + configData.statusIP,
			"LocalLibAddr=" + configData.localLibAddr
		];
		
		// 構建 Batch 指令
		let batchCommand = "@SYSTEM cmd /c ";
		
		// 刪除舊檔案
		batchCommand += "del D:\\\\\\EMP-Config.ini\\n";
		
		// 逐行寫入檔案
		for (let i = 0; i < configLines.length; i++) {
			const line = configLines[i];
			if (i === 0) {
				batchCommand += "echo "+ line + " >> D:\\\\\\EMP-Config.ini\\n";
			} else {
				batchCommand += "echo " + line + " >> D:\\\\\\EMP-Config.ini\\n";
			}
		}
						
		session.RunMacro(batchCommand);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}

// 新增：執行開啟 ASM 巨集
function runOpenAsmMacro(folderName) {
	try {
		const session = getSession();
		const asmFileName = `0-${folderName}.asm`; // Construct the filename like '0-MODELNAME.asm'
		
		// Note the single quotes around the filename in the macro, as per your example
		const macro_open_asm = 	"~ Activate `main_dlg_cur` `EMBED_BROWSER Close` ;"+
								"~ Command `ProCmdModelOpen` ;"+
								"~ Select `file_open` `Ph_list.Filelist` 1 `'${asmFileName}'` ;"+
								"~ Activate `file_open` `Ph_list.Filelist` 1 `'${asmFileName}'` ;"+
								"~ Activate `open_rep` `OpenCascBtn`;";                                                     
								
		session.RunMacro(macro_open_asm);
		return true; // Indicate success
	} catch (error) {
		return { error: error.message };
	}
}	

 // === 一鍵部署函數 (保持原有 macro 代碼) ===
function deployMapkey() {
	try {
		const session = getSession();
		const macro_mapkey = "~ Command `ProCmdUtilMacros`;"+ 
							"~ Select `mapkey_main` `ImpExpCascButton`;"+
							"~ Close `mapkey_main` `ImpExpCascButton`;"+
							"~ Activate `mapkey_main` `psh_import`;"+
							"~ Input `file_open` `opt_EMBED_BROWSER_TB_SAB_LAYOUT` `\\\\\\\\10.1.182.31\\\\a2\\\\A2C\\\\Temp\\\\WEB`;"+
							"~ Update `file_open` `opt_EMBED_BROWSER_TB_SAB_LAYOUT` `\\\\\\\\10.1.182.31\\\\a2\\\\A2C\\\\Temp\\\\WEB`;"+
							"~ Activate `file_open` `opt_EMBED_BROWSER_TB_SAB_LAYOUT`;"+
							"~ FocusIn `file_open` `EMBED_BROWSER_SEARCH_IP`;"+
							"~ FocusOut `file_open` `EMBED_BROWSER_SEARCH_IP`;"+
							"~ Select `file_open` `Ph_list.Filelist` 1 `mapkeys.pro`;"+
							"~ Activate `file_open` `Ph_list.Filelist` 1 `mapkeys.pro`;"+
							"~ Select `mapkey_main` `SaveCascBtn`;"+
							"~ Close `mapkey_main` `SaveCascBtn`;"+
							"~ Activate `mapkey_main` `psh_save_changed`;"+
							"~ Activate `mapkey_main` `CloseButton`;"; 
		
		session.RunMacro(macro_mapkey);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}

function deployRibbon() {
	try {
		const session = getSession();
		const macro_ribbon = "~ Command `AdbCmdOptCustDlg` ;"+
							"~ Open `ribbon_options_dialog` `RibbonCustMenuLayout.RibbonTreeLay.CustRbnModeOptionMenu`;"+
							"~ Close `ribbon_options_dialog` `RibbonCustMenuLayout.RibbonTreeLay.CustRbnModeOptionMenu`;"+
							"~ Select `ribbon_options_dialog` `RibbonCustMenuLayout.RibbonTreeLay.CustRbnModeOptionMenu` 1 `CustRbnPopularModes`;"+
							"~ FocusIn `ribbon_options_dialog` `RibbonCustMenuLayout.RibbonTreeLay.RibbonTree`;"+
							"~ FocusOut `ribbon_options_dialog` `RibbonCustMenuLayout.RibbonTreeLay.RibbonTree`;"+
							"~ Activate `ribbon_options_dialog` `RibbonCustMenuLayout.ImportPB`;"+
							"~ Input `file_open` `opt_EMBED_BROWSER_TB_SAB_LAYOUT` `\\\\\\\\10.1.182.31\\\\a2\\\\A2C\\\\Temp\\\\WEB`;"+
							"~ Update `file_open` `opt_EMBED_BROWSER_TB_SAB_LAYOUT` `\\\\\\\\10.1.182.31\\\\a2\\\\A2C\\\\Temp\\\\WEB`;"+
							"~ Activate `file_open` `opt_EMBED_BROWSER_TB_SAB_LAYOUT`;"+
							"~ FocusIn `file_open` `EMBED_BROWSER_SEARCH_IP`;"+
							"~ FocusOut `file_open` `EMBED_BROWSER_SEARCH_IP`;"+
							"~ Select `file_open` `Ph_list.Filelist` 1 `creo_emp.ui`;"+
							"~ Activate `file_open` `Ph_list.Filelist` 1 `creo_emp.ui`;"+
							"~ Activate `RibbonCustImport` `import`;"+
							"~ Activate `ribbon_options_dialog` `OkPshBtn`;";
		
		session.RunMacro(macro_ribbon);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}
function deployPowerShellValidation() {
	try {
		const session = getSession();
		const macro_ps_validation = "@SYSTEM xcopy \"\\\\\\\\10.1.182.31\\\\a2\\\\A2C\\\\Temp\\\\WEB\\\\Set-PowerShell-Policy.bat\" \"\%cd\%\" /Y  \\n "+
									"start cmd /c  \".\\\\Set-PowerShell-Policy.bat\"\\n exit;" ;
		
		session.RunMacro(macro_ps_validation);
		return true;
	} catch (error) {
		return { error: error.message };
	}
}
