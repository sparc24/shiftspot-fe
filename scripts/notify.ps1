<#
.SYNOPSIS
    Send a Windows toast notification for a Dev Agent status update.

.PARAMETER AgentName
    Name of the agent (e.g. "Planning Agent").

.PARAMETER Status
    Agent outcome: Started | Completed | Blocked | Failed

.PARAMETER Summary
    One or two sentence summary produced by the orchestrator.

.PARAMETER SkipSend
    Test seam. Builds the toast payload but does not dispatch to Windows.
    Returns the XML string on stdout instead.

.EXAMPLE
    .\notify.ps1 -AgentName "Planning Agent" -Status "Completed" -Summary "LLD approved."
#>

param(
    [Parameter(Mandatory)]
    [string]$AgentName,

    [Parameter(Mandatory)]
    [ValidateSet('Started', 'Completed', 'Blocked', 'Failed')]
    [string]$Status,

    [Parameter(Mandatory)]
    [string]$Summary,

    [switch]$SkipSend
)

$AppId  = 'Dev Agent'
$RegKey = "HKCU:\SOFTWARE\Classes\AppUserModelId\$AppId"

# Icons must stay [A-Z]-only. The title is passed through SecurityElement::Escape()
# below, which escapes < > & " ' - so a glyph like '[>]' would render as '[&gt;]'
# in the XML and silently break any test asserting on the literal character.
# Keep this whole file ASCII-only: it has no BOM, so Windows PowerShell 5.1 reads
# it as ANSI and any non-ASCII character (em-dash, curly quote) becomes mojibake
# and can break the parser.
$icon = switch ($Status) {
    'Started'   { '[RUN]' }
    'Completed' { '[OK]' }
    'Blocked'   { '[BLOCKED]' }
    'Failed'    { '[FAILED]' }
    default     { throw "Unmapped status '$Status' - add it to the icon switch as well as ValidateSet." }
}

$title = "$icon $AgentName : $Status"

if ($Summary.Length -gt 200) {
    $Summary = $Summary.Substring(0, 197) + '...'
}

$escapedTitle   = [System.Security.SecurityElement]::Escape($title)
$escapedSummary = [System.Security.SecurityElement]::Escape($Summary)

$xml = @"
<toast duration="short">
  <visual>
    <binding template="ToastGeneric">
      <text>$escapedTitle</text>
      <text>$escapedSummary</text>
    </binding>
  </visual>
</toast>
"@

if ($SkipSend) {
    Write-Output $xml
    exit 0
}

# Register the app ID in HKCU so Windows delivers toasts (no admin required, persists after first run)
if (-not (Test-Path $RegKey)) {
    New-Item -Path $RegKey -Force | Out-Null
    New-ItemProperty -Path $RegKey -Name 'DisplayName'    -Value $AppId -PropertyType String -Force | Out-Null
    New-ItemProperty -Path $RegKey -Name 'ShowInSettings' -Value 0      -PropertyType DWord  -Force | Out-Null
}

# Load Windows Runtime types and dispatch
[void][Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
[void][Windows.UI.Notifications.ToastNotification,        Windows.UI.Notifications, ContentType = WindowsRuntime]
[void][Windows.Data.Xml.Dom.XmlDocument,                  Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]

$doc = [Windows.Data.Xml.Dom.XmlDocument]::new()
$doc.LoadXml($xml)

$toast = [Windows.UI.Notifications.ToastNotification]::new($doc)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($AppId).Show($toast)
