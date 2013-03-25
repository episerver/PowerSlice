using System.Collections.Generic;
using EPiServer.Cms.Shell.UI.Rest.ContentQuery;

namespace PowerSlice
{
    public interface IContentSlice : IContentQuery
    {
        int Order { get; }
        IEnumerable<CreateOption> CreateOptions { get; }
    }
}