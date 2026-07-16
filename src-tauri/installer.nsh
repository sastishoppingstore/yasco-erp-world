!define NSIS_HOOK_PREINSTALL "NSIS_HOOK_PREINSTALL_"
!macro NSIS_HOOK_PREINSTALL_
  nsExec::Exec '"$SYSDIR\taskkill.exe" /f /im "node.exe" 2>nul'
  nsExec::Exec '"$SYSDIR\taskkill.exe" /f /im "YASCO ERP.exe" 2>nul'
!macroend
