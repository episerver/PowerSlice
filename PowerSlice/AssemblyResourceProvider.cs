using EPiServer.Web;
using EPiServer.Web.Hosting;
using System;
using System.Collections;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Caching;
using System.Web.Hosting;

namespace EPiServer.Find.UI
{
    public class AssemblyResourceProvider : VirtualPathProvider
    {
        static string _rootPath;
        public static string ModuleRootPath
        {
            get
            {
                if (_rootPath == null)
                {
                    var rootPath = Shell.Configuration.EPiServerShellSection.GetSection().ProtectedModules.RootPath;
                    _rootPath = rootPath + "PowerSlice/";
                }
                return _rootPath;
            }
            protected set
            {
                _rootPath = value;
            }
        }

        static Assembly _assembly;
        public static Assembly ModuleAssembly
        {
            get
            {
                if (_assembly == null)
                {
                    _assembly = typeof(AssemblyResourceProvider).Assembly;
                }
                return _assembly;
            }
            protected set
            {
                _assembly = value;
            }
        }

        public static string GetResourcePath(string path)
        {
            string checkPath = VirtualPathUtilityEx.ToAppRelative(path);

            if (checkPath.StartsWith(AssemblyResourceProvider.ModuleRootPath, StringComparison.OrdinalIgnoreCase))
            {
                var relative = checkPath.Substring(AssemblyResourceProvider.ModuleRootPath.Length);

                if (relative.StartsWith("Scripts/", StringComparison.OrdinalIgnoreCase) ||
                    relative.Equals("module.config", StringComparison.OrdinalIgnoreCase))
                {
                    var resourcePath = ModuleAssembly.GetName().Name + "." + relative.Replace('/', '.');

                    return resourcePath;
                }
            }
            return null;
        }

        private bool IsAppResourcePath(string virtualPath)
        {
            if (String.IsNullOrEmpty(virtualPath))
            {
                return false;
            }

            try
            {
                string checkPath = VirtualPathUtilityEx.ToAppRelative(virtualPath);
                var appResourcePath = checkPath.StartsWith(ModuleRootPath, StringComparison.OrdinalIgnoreCase);
                return appResourcePath;
            }
            catch (HttpException)
            {
                return false;
            }
        }

        private bool IsAppResourceDir(string virtualPath)
        {
            if (string.IsNullOrEmpty(virtualPath))
            {
                return false;
            }

            try
            {
                String checkPath = VirtualPathUtilityEx.ToAppRelative(virtualPath);
                return checkPath.EndsWith("/") && checkPath.StartsWith(ModuleRootPath, StringComparison.OrdinalIgnoreCase);
            }
            catch (HttpException)
            {
                return false;
            }
        }

        public override bool FileExists(string virtualPath)
        {
            if (IsAppResourcePath(virtualPath))
            {
                var resourcePath = GetResourcePath(virtualPath);

                return ModuleAssembly.GetManifestResourceNames().Any(r => r.Equals(resourcePath, StringComparison.OrdinalIgnoreCase));
            }
            return Previous != null && Previous.FileExists(virtualPath);
        }

        public override VirtualFile GetFile(string virtualPath)
        {
            if (IsAppResourcePath(virtualPath))
            {
                return new AssemblyResourceVirtualFile(virtualPath);
            }
            return Previous == null ? null : Previous.GetFile(virtualPath);
        }

        public override CacheDependency GetCacheDependency(string virtualPath, System.Collections.IEnumerable virtualPathDependencies, DateTime utcStart)
        {
            if (IsAppResourcePath(virtualPath))
            {
                return new NeverExpiresCacheDep(virtualPath);
            }
            return base.GetCacheDependency(virtualPath, virtualPathDependencies, utcStart);
        }

        public override string GetFileHash(string virtualPath, IEnumerable virtualPathDependencies)
        {
            if (IsAppResourcePath(virtualPath))
            {
                var pathRelative = VirtualPathUtilityEx.ToAppRelative(virtualPath);
                var stringBuilder = new StringBuilder();
                stringBuilder.Append(GetLocalFileHash(virtualPath));
                if (virtualPathDependencies != null)
                {
                    foreach (string path in virtualPathDependencies.OfType<string>().OrderBy(x => x, StringComparer.OrdinalIgnoreCase))
                    {
                        if (!IsAppResourcePath(path))
                        {
                            stringBuilder.Append(base.GetFileHash(path, new[] { path }));
                        }
                        else
                        {
                            stringBuilder.Append(GetLocalFileHash(path));
                        }
                    }
                }

                foreach (var module in ModuleAssembly.GetLoadedModules().OrderBy(m => m.Name, StringComparer.OrdinalIgnoreCase))
                {
                    stringBuilder.Append(module.ModuleVersionId.ToString());
                }

                return stringBuilder.ToString().GetHashCode().ToString("x", CultureInfo.InvariantCulture);
            }
            return Previous.GetFileHash(virtualPath, virtualPathDependencies);
        }

        private string GetLocalFileHash(string virtualPath)
        {
            var stringBuilder = new StringBuilder();
            var fileHash = "9201";
            stringBuilder.Append(fileHash);
            var version = ModuleAssembly.GetName().Version.ToString();
            stringBuilder.Append(virtualPath);
            stringBuilder.Append(version);
            return stringBuilder.ToString().GetHashCode().ToString("x", CultureInfo.InvariantCulture);
        }

        public override VirtualDirectory GetDirectory(string virtualDir)
        {
            if (IsAppResourceDir(virtualDir))
            {
                return new AssemblyResourceVirtualDirectory(virtualDir);
            }
            return Previous.GetDirectory(virtualDir);
        }

        public override bool DirectoryExists(string virtualDir)
        {
            if (IsAppResourceDir(virtualDir))
            {
                return true;
            }
            return Previous.DirectoryExists(virtualDir);
        }

    }

    public class NeverExpiresCacheDep : CacheDependency
    {
        public NeverExpiresCacheDep(string fileName)
            : base()
        {
        }
    }

    class AssemblyResourceVirtualFile : VirtualFile
    {
        string path;
        public AssemblyResourceVirtualFile(string virtualPath)
            : base(virtualPath)
        {
            path = VirtualPathUtilityEx.ToAppRelative(virtualPath);
        }

        public override Stream Open()
        {
            var resourcePath = AssemblyResourceProvider.GetResourcePath(path);

            if (!String.IsNullOrEmpty(resourcePath))
            {
                var stream = AssemblyResourceProvider.ModuleAssembly.GetManifestResourceStream(resourcePath);

                return stream;
            }

            return null;
        }
    }

    class AssemblyResourceVirtualDirectory : VirtualDirectory
    {
        public AssemblyResourceVirtualDirectory(string virtualDir)
            : base(virtualDir)
        {
        }
        public override IEnumerable Children
        {
            get { return Enumerable.Empty<IEnumerable>(); }
        }

        public override IEnumerable Directories
        {
            get { return Enumerable.Empty<IEnumerable>(); }
        }

        public override IEnumerable Files
        {
            get { return Enumerable.Empty<IEnumerable>(); }
        }
    }
}