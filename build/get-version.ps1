Param([string]$branchName, [Int]$buildCounter, [String]$publishPackagesParam)

if (!$branchName -or !$buildCounter) {
    Write-Error "`$branchName and `$buildCounter parameters must be supplied"
    exit 1
}

Function GetVersion($path) {
    [xml] $versionFile = Get-Content $path
    return $versionFile.SelectSingleNode("Project/PropertyGroup/VersionPrefix").InnerText
}

$publishPackages = "False"
if ($publishPackagesParam) {
    $publishPackages = $publishPackagesParam
}

$assemblyVersion = GetVersion "PowerSlice/version.props"
 
if (!$assemblyVersion) {
    $assemblyVersion = "2.0.0"
}

if ("%publishPackages%" -eq "True")
{
   $publishPackages = "True"
}
$informationalVersion = "$assemblyVersion" -f $buildCounter
 
"AssemblyVersion: $assemblyVersion"
"AssemblyInformationalVersion: $informationalVersion"

"##teamcity[setParameter name='packageVersion' value='$informationalVersion']"
"##teamcity[setParameter name='publishPackages' value='$publishPackages']"