using System.Collections.Generic;

namespace PowerSlice
{
    public interface ISortableContentSlice
    {
        IEnumerable<SortOption> SortOptions { get; }
        SortOption DefaultSortOption { get; }
        bool HideSortOptions { get; }
    }

    public interface ISortableContentSlice<TContent> : ISortableContentSlice
    {
        IEnumerable<SortAction<TContent>> SortActions { get; }
    }
}