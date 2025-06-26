// Tab 切換功能
function switchTab(tabId) {
    // 隱藏所有 tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 移除所有 tab button 的 active 狀態
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // 顯示選中的 tab content
    document.getElementById(tabId).classList.add('active');
    
    // 設定對應的 tab button 為 active
    event.target.classList.add('active');
}

// 切換配置區塊顯示/隱藏
function toggleConfigSection() {
    const configSection = document.getElementById('configSection');
    const toggleBtn = document.getElementById('toggleConfigBtn');
    
    if (configSection.classList.contains('active')) {
        configSection.classList.remove('active');
        toggleBtn.textContent = '🔧 顯示 EMP 配置設定';
    } else {
        configSection.classList.add('active');
        toggleBtn.textContent = '🔧 隱藏 EMP 配置設定';
    }
}

// 從 localStorage 載入先前儲存的值
function loadFromStorage() {
    const empLibraryPath = localStorage.getItem('emp-library-path');
    if (empLibraryPath) {
	document.getElementById('emp-library-path').value = empLibraryPath;
    }
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('useCurrentModelBtn');
    const runDelMacroCheckbox = document.getElementById('runDelMacroCheckbox');
    const runColorMacroCheckbox = document.getElementById('runColorMacroCheckbox');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const deployCreoToolBtn = document.getElementById('deployCreoToolBtn');
	loadFromStorage();
	
	// 設置 Creo.JS 初始化完成後的回調
	CreoJS.$ADD_ON_LOAD(function() {
		updateCurrentModelInfo();
		updateDirectoryInfo();
	});
	
	// 儲存配置按鈕事件
	saveConfigBtn.addEventListener('click', async function() {
		try {
			saveConfigBtn.disabled = true;
			addStatusMessage("正在儲存配置...", "info");
			
			// 收集配置資料
			const configData = {
				ftpLibEnabled: document.getElementById('ftpLibEnabled').checked,
				localLibEnabled: document.getElementById('localLibEnabled').checked,
				copyMatchingSourceFolders: document.getElementById('copyMatchingSourceFolders').checked,
				autoZeroRenameEnabled: document.getElementById('autoZeroRenameEnabled').checked,
				selfDestructEnabled: document.getElementById('selfDestructEnabled').checked,
				nasHostName: document.getElementById('nasHostName').value || 'ipcfile.gigaipc.intra',
				statusIP: document.getElementById('statusIP').value || '10.1.182.31',
				localLibAddr: document.getElementById('localLibAddr').value.replace(/\\/g, '\\\\') || 'D:\\GIGAIPC_3D\\Wayne_LIB'
			};
			const empLibraryPath = document.getElementById('localLibAddr').value;
			if (empLibraryPath.trim() !== '') {
		                localStorage.setItem('emp-library-path', empLibraryPath);
		        }
			
			// 呼叫 Creo.JS 函數更新配置檔案
			const result = await  CreoJS.updateConfigFile(configData);
			
			if (result && !result.error) {
				addStatusMessage("✅ 配置已成功儲存到 D:\\Config.ini", "success");
			} else {
				addStatusMessage("❌ 配置儲存失敗: " + (result?.error || "未知錯誤"), "error");
			}
			
		} catch (error) {
			addStatusMessage("❌ 配置儲存時發生錯誤: " + error.message, "error");
		} finally {
			saveConfigBtn.disabled = false;
		}
	});
	
	// 一鍵部署按鈕事件
	deployCreoToolBtn.addEventListener('click', async function() {
		try {
			deployCreoToolBtn.disabled = true;
			deployCreoToolBtn.innerHTML = '<span>⏳</span>部署中...';
			addStatusMessage("🚀 開始執行一鍵部署 Creo Tool...", "info");
			
			// 步驟1: Import Mapkey.pro
			addStatusMessage("步驟 1/3: 正在匯入 Mapkey.pro...", "info");
			await sleep(500);
			const mapkeyResult = await CreoJS.deployMapkey();
			if (mapkeyResult && !mapkeyResult.error) {
				addStatusMessage("✅ Mapkey.pro 匯入成功", "success");
			} else {
				addStatusMessage("⚠️ Mapkey.pro 匯入可能失敗: " + (mapkeyResult?.error || "未知錯誤"), "warning");
			}
			
			// 延遲
			await sleep(1500);
			
			// 步驟2-1: Import Ribbon設定檔
			addStatusMessage("步驟 2/3: 正在匯入 Ribbon 設定檔...", "info");
			const ribbonResult = await CreoJS.deployRibbon();
			if (ribbonResult && !ribbonResult.error) {
				addStatusMessage("✅ Ribbon 設定檔匯入成功", "success");
			} else {
				addStatusMessage("⚠️ Ribbon 設定檔匯入可能失敗: " + (ribbonResult?.error || "未知錯誤"), "warning");
			}
			
			// 延遲
			await sleep(1500);
			
			// 步驟2-2: 預先部屬儲存EMP-Config.ini
			addStatusMessage("正在儲存配置...", "info");
			
			// 收集配置資料
			const configData = {
				ftpLibEnabled: document.getElementById('ftpLibEnabled').checked,
				localLibEnabled: document.getElementById('localLibEnabled').checked,
				copyMatchingSourceFolders: document.getElementById('copyMatchingSourceFolders').checked,
				autoZeroRenameEnabled: document.getElementById('autoZeroRenameEnabled').checked,
				selfDestructEnabled: document.getElementById('selfDestructEnabled').checked,
				nasHostName: document.getElementById('nasHostName').value || 'ipcfile.gigaipc.intra',
				statusIP: document.getElementById('statusIP').value || '10.1.182.31',
				localLibAddr: document.getElementById('localLibAddr').value.replace(/\\/g, '\\\\') || 'D:\\GIGAIPC_3D\\Wayne_LIB'
			};
			
			// 呼叫 Creo.JS 函數更新配置檔案
			const result = await  CreoJS.updateConfigFile(configData);
			
			if (result && !result.error) {
				addStatusMessage("✅ 配置已成功儲存到 D:\\Config.ini", "success");
			} else {
				addStatusMessage("❌ 配置儲存失敗: " + (result?.error || "未知錯誤"), "error");
			}
			
			// 延遲
			await sleep(3000);
			
			
			// 步驟3: PowerShell 驗證Batch檔
			addStatusMessage("步驟 3/3: 正在執行 PowerShell 驗證...", "info");
			const psResult = await CreoJS.deployPowerShellValidation();
			if (psResult && !psResult.error) {
				addStatusMessage("✅ PowerShell 驗證執行成功", "success");
			} else {
				addStatusMessage("⚠️ PowerShell 驗證可能失敗: " + (psResult?.error || "未知錯誤"), "warning");
			}
			
			addStatusMessage("🎉 一鍵部署 Creo Tool 完成！", "success");
			
		} catch (error) {
			addStatusMessage("❌ 部署過程中發生錯誤: " + error.message, "error");
		} finally {
			deployCreoToolBtn.disabled = false;
			deployCreoToolBtn.innerHTML = '<span>🛠️</span>開始部署 Creo Tool';
		}
	});
	
          // 使用當前模型名稱按鈕事件
            button.addEventListener('click', async function() {
                // Check button's current text to decide action
                if (button.textContent === "開啟ASM檔案 (須等外部腳本執行完畢!)") {
                    const modelName = button.dataset.modelName; // Retrieve stored modelName
                    if (!modelName) {
                        addStatusMessage("無法獲取模型名稱以開啟ASM", "error");
                        button.disabled = false; // Re-enable button
                        return;
                    }
                    
                    button.disabled = true;
                    addStatusMessage(`準備開啟 '0-${modelName}.asm'...`, "info");
                    try {
                        const openResult = await CreoJS.runOpenAsmMacro(modelName);
                        if (openResult === true) {
                            addStatusMessage(`已執行開啟 '0-${modelName}.asm' 的指令。`, "success");
                        } else {
                            addStatusMessage(`開啟ASM檔案時發生錯誤: ${openResult.error || '未知錯誤'}`, "error");
                        }
                    } catch (error) {
                        addStatusMessage("執行開啟ASM操作時發生例外: " + error.message, "error");
                    } finally {
                         button.disabled = false; // Re-enable button after attempt
                    }

                } else {
                    // Original workflow
                    try {
                        button.disabled = true;
                        addStatusMessage("開始執行操作...", "info");
                        
                        // 清空先前的狀態訊息
                        const statusDiv = document.getElementById('status');
                        while (statusDiv.children.length > 1) {
                            statusDiv.removeChild(statusDiv.lastChild);
                        }
                        if (statusDiv.children.length === 1 && statusDiv.firstElementChild.textContent !== "準備就緒，請選擇操作。") {
                            statusDiv.firstElementChild.textContent = "準備就緒，請選擇操作。"; // Reset first message if it's not the default
                        } else if (statusDiv.children.length === 0) {
                            addStatusMessage("準備就緒，請選擇操作。", "info"); // Re-add initial message if cleared
                        }
                        addStatusMessage("開始執行主要操作流程...", "info");

                        // 第零步：獲取模型名稱和當前目錄 (移到執行刪除和著色之前，因為它們可能需要模型名稱)
                        addStepIndicator("步驟 0：獲取模型資訊");
                        const modelName = await CreoJS.getCurrentModelName();
                        if (!modelName) {
                            addStatusMessage("無法獲取當前模型名稱", "error");
                            throw new Error("無法獲取當前模型名稱");
                        }
                        button.dataset.modelName = modelName; // Store modelName for later use
                        addStatusMessage("使用當前模型名稱: " + modelName, "success");
                        
                        const originalDir = await CreoJS.getCurrentDirectory();
                        addStatusMessage("當前工作目錄: " + originalDir, "info");


                        // 第一步：執行刪除操作 (如果勾選)
                        if (runDelMacroCheckbox.checked) {
                            addStepIndicator("步驟 1：執行刪除操作");
                            addStatusMessage("正在執行刪除操作...", "info");
                            
                            const delResult = await CreoJS.runDelMacro();
                            if (delResult !== true) {
                                addStatusMessage(`刪除操作失敗: ${delResult.error || '未知錯誤'}`, "error");
                                throw new Error("刪除操作失敗");
                            }
                            
                            addStatusMessage("刪除操作已啟動，等待完成...", "info");
                            
                            let delCompleted = false;
                            let delAttempts = 0;
                            const maxDelAttempts = 10; 
                            
                            while (!delCompleted && delAttempts < maxDelAttempts) {
                                await new Promise(resolve => setTimeout(resolve, 500)); 
                                delCompleted = await CreoJS.checkColoringStatus(); // Using checkColoringStatus as a proxy
                                delAttempts++;
                                
                                if (delAttempts === 4) { 
                                    delCompleted = true;
                                }
                            }
                            
                            if (delCompleted) {
                                addStatusMessage("刪除操作完成", "success");
                            } else {
                                addStatusMessage("刪除操作可能未完成或檢查超時，但繼續執行下一步", "warning");
                            }
                        } else {
                            addStatusMessage("跳過刪除操作 (未勾選)", "info");
                        }
					
                        // 第二步：執行著色操作 (如果勾選)
                        if (runColorMacroCheckbox.checked) {
                            addStepIndicator("步驟 2：執行著色操作");
                            addStatusMessage("正在執行著色操作...", "info");
                            
                            const colorResult = await CreoJS.runColorMacro();
                            if (colorResult !== true) {
                                addStatusMessage(`著色操作失敗: ${colorResult.error || '未知錯誤'}`, "error");
                                throw new Error("著色操作失敗");
                            }
                            
                            addStatusMessage("著色操作已啟動，等待完成...", "info");
                            
                            let coloringCompleted = false;
                            let coloringAttempts = 0;
                            const maxColoringAttempts = 10; 
                            
                            while (!coloringCompleted && coloringAttempts < maxColoringAttempts) {
                                await new Promise(resolve => setTimeout(resolve, 500)); 
                                coloringCompleted = await CreoJS.checkColoringStatus();
                                coloringAttempts++;
                                
                                if (coloringAttempts === 4) { 
                                    coloringCompleted = true;
                                }
                            }
                            
                            if (coloringCompleted) {
                                addStatusMessage("著色操作完成，已設為金屬藍色", "success");
                            } else {
                                addStatusMessage("著色操作可能未完成或檢查超時，但繼續執行下一步", "warning");
                            }
                        } else {
                            addStatusMessage("跳過著色操作 (未勾選)", "info");
                        }
                        
                        // 第三步：執行備份操作
                        addStepIndicator("步驟 3：執行備份操作");
                        addStatusMessage("正在執行備份操作...", "info");
                        
                        const backupResult = await CreoJS.runBackupMacro(modelName);
                        if (typeof backupResult !== 'string') {
                            addStatusMessage(`備份操作失敗: ${backupResult.error || '未知錯誤'}`, "error");
                            throw new Error("備份操作失敗");
                        }
                        
                        addStatusMessage("備份操作已啟動，等待完成...", "info");
                        
                        let backupCompleted = false;
                        let backupAttempts = 0;
                        const maxBackupAttempts = 8; 
                        
                        while (!backupCompleted && backupAttempts < maxBackupAttempts) {
                            await new Promise(resolve => setTimeout(resolve, 500)); 
                            backupCompleted = await CreoJS.checkBackupStatus(modelName);
                            backupAttempts++;
                            
                            if (backupAttempts === 4) {
                                backupCompleted = true;
                            }
                        }
                        
                        if (backupCompleted) {
                            addStatusMessage("備份操作完成，已創建資料夾: " + backupResult, "success");
                        } else {
                            addStatusMessage("備份操作可能未完成或檢查超時，但繼續執行下一步", "warning");
                        }
                        
                        // 第四步：找到目標工作資料夾路徑 (注意：此處原文為第五步，但邏輯上應在設置工作目錄之前)
                        addStepIndicator("步驟 4：定位目標工作資料夾");
                        const targetWorkingDir = await CreoJS.findBackupDirectory(); 
                        
                        if (targetWorkingDir) {
                            addStatusMessage("找到目標工作資料夾路徑: " + targetWorkingDir, "success");
                            
                            // 第五步：設置工作目錄
                            addStepIndicator("步驟 5：設置工作目錄");
                            addStatusMessage("嘗試設置工作目錄為: " + targetWorkingDir, "info");
                            
                            const dirResult = await CreoJS.setWorkingDirectory(targetWorkingDir);
                            if (dirResult && dirResult.error) {
                                addStatusMessage("設置工作目錄失敗: " + dirResult.error, "error");
                            } else {
                                addStatusMessage("已成功設置工作目錄為: " + dirResult, "success");
                                updateDirectoryInfo(); // Update display
                            }
                        } else {
                            addStatusMessage("無法找到目標工作資料夾路徑，跳過設置工作目錄", "warning");
					}
					
					// 第六步：關閉視窗+清空記憶體+執行替換批次檔
					addStepIndicator("步驟 6：執行清理與外部EMP替換操作");
                        addStatusMessage("正在執行清理操作...", "info");
                        await new Promise(resolve => setTimeout(resolve, 500)); 
					
                        const cleanResult = await CreoJS.runCleanMacro();
					
                        if (cleanResult !== true) {
                            addStatusMessage(`清除操作啟動失敗: ${cleanResult.error || '未知錯誤'}`, "error");
                        } else {
                            addStatusMessage("清除操作已啟動，等待完成...", "info");
                            
                            let cleanCompleted = false;
                            let cleanAttempts = 0;
                            const maxCleanAttempts = 4; 
                            
                            while (!cleanCompleted && cleanAttempts < maxCleanAttempts) {
                                await new Promise(resolve => setTimeout(resolve, 500)); 
                                cleanCompleted = await CreoJS.checkCleanStatus();
                                cleanAttempts++;
                                
                                if (cleanAttempts === 2) { 
                                    cleanCompleted = true;
                                }
                            }
                            
                            if (cleanCompleted) {
                                addStatusMessage("清除操作完成", "success");		
                            } else {
                                addStatusMessage("清除操作可能未完成或檢查超時", "warning");
                            }
                        }

                        addStatusMessage("正在啟動外部EMP替換腳本 (000-EMP_Translator_v6.ps1)...", "info");
					const batchResult = await CreoJS.runBatchMacro();	
                        addStatusMessage("外部EMP替換腳本已啟動。", "info");				
                        if (cleanResult !== true) {
                            addStatusMessage(`腳本操作啟動失敗: ${batchResult.error || '未知錯誤'}`, "error");
                        } else {
						// 完成所有主要操作
                        addStepIndicator("主要操作流程完成");
                        addStatusMessage("所有主要操作已完成。請等待外部腳本 (000-EMP_Translator_v6.ps1) 執行完畢。", "success");
                        addStatusMessage("待外部腳本完成後，點擊下方按鈕以開啟對應的 ASM 檔案。", "warning");
                        button.textContent = "開啟ASM檔案 (須等外部腳本執行完畢!)"; // Change button text												
					}
                        

                    } catch (error) {
                        addStatusMessage("執行過程中發生錯誤: " + error.message, "error");
                        // 在這裡重置按鈕文字為初始狀態，而不是搜尋、著色等長句
                        button.textContent = "執行模型備份+替換EMP";
                    } finally {
                        button.disabled = false; // Re-enable button
                    }
                }
            });

		// 添加步驟指示器
            function addStepIndicator(stepText) {
                const statusDiv = document.getElementById('status');
                const stepDiv = document.createElement('div');
                stepDiv.className = 'step-indicator';
                stepDiv.textContent = stepText;
                statusDiv.appendChild(stepDiv);
                statusDiv.scrollTop = statusDiv.scrollHeight;
            }
});

// 輔助函數
function addStatusMessage(message, type = "info", targetId = "status") {
	const statusDiv = document.getElementById(targetId);
	const messageDiv = document.createElement('div');
	messageDiv.className = 'status-message ' + type;
	messageDiv.textContent = new Date().toLocaleTimeString() + ' - ' + message;
	statusDiv.appendChild(messageDiv);
	statusDiv.scrollTop = statusDiv.scrollHeight;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateCurrentModelInfo() {
            CreoJS.getCurrentModelName()
                .then(function(modelName) {
                    const infoDiv = document.getElementById('currentModelInfo');
                    
                    if (modelName) {
                        infoDiv.innerHTML = "<strong>當前模型:</strong> " + modelName;
                    } else {
                        infoDiv.innerHTML = "<strong>警告:</strong> 無法獲取當前模型名稱 (可能未開啟任何模型)";
                        infoDiv.style.backgroundColor = "#fff3cd";
                        infoDiv.style.borderLeft = "4px solid #ffc107";
                    }
                })
                .catch(function(error) {
                    const infoDiv = document.getElementById('currentModelInfo');
                    infoDiv.innerHTML = "<strong>錯誤:</strong> 獲取模型名稱時發生錯誤";
                    infoDiv.style.backgroundColor = "#f8d7da";
                    infoDiv.style.borderLeft = "4px solid #dc3545";
                    
                    addStatusMessage("獲取模型名稱時發生錯誤: " + error, "error");
                });
        }

async function updateDirectoryInfo() {
            CreoJS.getCurrentDirectory()
                .then(function(dirPath) {
                    const dirDiv = document.getElementById('directoryInfo');
                    
                    if (dirPath) {
                        dirDiv.innerHTML = "<strong>當前工作目錄:</strong> " + dirPath;
                    } else {
                        dirDiv.innerHTML = "<strong>警告:</strong> 無法獲取當前工作目錄";
                        dirDiv.style.backgroundColor = "#fff3cd";
                        dirDiv.style.borderLeft = "4px solid #ffc107";
                    }
                })
                .catch(function(error) {
                    const dirDiv = document.getElementById('directoryInfo');
                    dirDiv.innerHTML = "<strong>錯誤:</strong> 獲取工作目錄時發生錯誤";
                    dirDiv.style.backgroundColor = "#f8d7da";
                    dirDiv.style.borderLeft = "4px solid #dc3545";
                    
                    addStatusMessage("獲取工作目錄時發生錯誤: " + error, "error");
                });
        }

// 定期更新模型和目錄資訊
setInterval(updateCurrentModelInfo, 5000);
setInterval(updateDirectoryInfo, 10000);
