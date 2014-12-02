using System.Linq;
using EPiServer.Framework.Initialization;
using EPiServer.Web.Hosting;
using System.Web.Hosting;

namespace PowerSlice
{
    public class AssemblyResourceProviderRegistrationModule : IVirtualPathProviderModule
    {
        public System.Collections.Generic.IEnumerable<VirtualPathProvider> CreateProviders(InitializationEngine context)
        {
            if (context.HostType.Equals(HostType.WebApplication))
            {
                return new VirtualPathProvider[] { new AssemblyResourceProvider() };
            }
            return Enumerable.Empty<VirtualPathProvider>();
        }
    }
}