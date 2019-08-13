using System.Collections.Generic;
using EPiServer.Shell.ContentQuery;

namespace PowerSlice
{
    public interface IContentSlice : IContentQuery
    {
        IEnumerable<CreateOption> CreateOptions { get; }
    }
}