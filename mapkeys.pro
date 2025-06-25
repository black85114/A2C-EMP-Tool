
mapkey z @MAPKEY_NAMECtrl+G;@MAPKEY_LABELReGeneration;\
mapkey(continued) ~ Command `ProCmdRegenGrp`;
mapkey t @MAPKEY_LABELset Transplate;~ Command `ProCmdViewTranspShaded`;
mapkey y @MAPKEY_LABELset Shading;~ Command `ProCmdViewShaded`;
mapkey / @MAPKEY_LABELUn-Activate;\
mapkey(continued) ~ Select `main_dlg_cur` `PHTLeft.AssyTree` 1 `node0`;\
mapkey(continued) ~ Command `ProCmdMakeActive@PopupMenuTree`;


mapkey \ @MAPKEY_LABELWEB EMP Tool;~ Command `ProCmdBrowserBtn`  1;\
mapkey(continued) ~ FocusIn `unembedded_browser_dialog` `opt_EMBED_BROWSER_TB_SAB_LAYOUT`;\
mapkey(continued) ~ Input `unembedded_browser_dialog` `opt_EMBED_BROWSER_TB_SAB_LAYOUT` \
mapkey(continued) `file://10.1.182.31/a2/A2C/Temp/WEB/0-EMP_Tool_v7.html`;\
mapkey(continued) ~ Open `unembedded_browser_dialog` `opt_EMBED_BROWSER_TB_SAB_LAYOUT`;\
mapkey(continued) ~ Update `unembedded_browser_dialog` `opt_EMBED_BROWSER_TB_SAB_LAYOUT` \
mapkey(continued) `file://10.1.182.31/a2/A2C/Temp/WEB/0-EMP_Tool_v7.html`;\
mapkey(continued) ~ Close `unembedded_browser_dialog` `opt_EMBED_BROWSER_TB_SAB_LAYOUT`;\
mapkey(continued) ~ Activate `unembedded_browser_dialog` `opt_EMBED_BROWSER_TB_SAB_LAYOUT`;\
mapkey(continued) ~ FocusOut `unembedded_browser_dialog` `opt_EMBED_BROWSER_TB_SAB_LAYOUT`;
