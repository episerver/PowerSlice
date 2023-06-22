using System.Collections.Generic;
using EPiServer.Shell.ContentQuery;

namespace PowerSlice
{
    public interface IContentSlice : IContentQuery, ISortableContentSlice
    {
        IEnumerable<CreateOption> CreateOptions { get; }
    }
}