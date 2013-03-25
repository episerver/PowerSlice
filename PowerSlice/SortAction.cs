using System;
using EPiServer.Find;
using EPiServer.Find.Api;

namespace PowerSlice
{
    public class SortAction<T> : SortOption
    {
        public Func<ITypeSearch<T>, SortOrder, ITypeSearch<T>> SortFunction { get; private set; }

        public SortAction(string label, string key, Func<ITypeSearch<T>, SortOrder, ITypeSearch<T>> sortFunction)
            : base(label, key)
        {
            SortFunction = sortFunction;
        }
    }
}