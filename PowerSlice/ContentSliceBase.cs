using System.Collections.Generic;
using System.Linq;
using EPiServer;
using EPiServer.Cms.Shell.UI.Rest.ContentQuery;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Find;
using EPiServer.Find.Api;
using EPiServer.Find.Cms;
using EPiServer.Framework.Localization;
using EPiServer.ServiceLocation;
using EPiServer.Shell.Services.Rest;

namespace PowerSlice
{
    public abstract class ContentSliceBase<TContent> : IContentSlice, ISortableContentSlice<TContent> 
        where TContent : IContent
    {
        protected IClient SearchClient;
        protected IContentTypeRepository ContentTypeRepository;
        protected IContentLoader ContentLoader;

        protected ContentSliceBase(IClient searchClient, IContentTypeRepository contentTypeRepository, IContentLoader contentLoader)
        {
            SearchClient = searchClient;
            ContentTypeRepository = contentTypeRepository;
            ContentLoader = contentLoader;
        }

        protected ContentSliceBase()
            : this(ServiceLocator.Current.GetInstance<IClient>(), ServiceLocator.Current.GetInstance<IContentTypeRepository>(), ServiceLocator.Current.GetInstance<IContentLoader>())
        {}

        public virtual ContentRange ExecuteQuery(ContentQueryParameters parameters)
        {
            var searchRequest = SearchClient.Search<TContent>()
                .FilterOnLanguages(new [] { parameters.CurrentLanguage });
            var searchPhrase = parameters.AllParameters["q"];
            var hasFreeTextQuery = !string.IsNullOrWhiteSpace(searchPhrase) && searchPhrase != "*";
            if (hasFreeTextQuery)
            {
                searchRequest = ApplyTextSearch(searchRequest, searchPhrase);
            }

            searchRequest = Filter(searchRequest, parameters);

            searchRequest = ApplyVisibilityFilter(searchRequest);

            if (parameters.SortColumns != null && parameters.SortColumns.Any())
            {
                var sortColumn = parameters.SortColumns.FirstOrDefault();
                searchRequest = ApplySorting(searchRequest, sortColumn);
            }

            var result = searchRequest
                .Skip(parameters.Range.Start)
                .Take(parameters.Range.End)
                .GetContentResult(CacheForSeconds, true);

            var itemRange = new ItemRange
                {
                    Total = result.TotalMatching,
                    Start = parameters.Range.Start,
                    End = parameters.Range.End
                };
            var contentRange = new ContentRange(result.OfType<IContent>(), itemRange);
            return contentRange;
        }

        protected virtual ITypeSearch<TContent> Filter(ITypeSearch<TContent> searchRequest, ContentQueryParameters parameters)
        {
            return searchRequest;
        }

        private ITypeSearch<TContent> ApplyVisibilityFilter(ITypeSearch<TContent> searchRequest)
        {
            return searchRequest.ExcludeDeleted();
        }

        protected virtual ITypeSearch<TContent> ApplySorting(ITypeSearch<TContent> searchRequest, SortColumn sortColumn)
        {
            var sortOption = SortActions.FirstOrDefault(x => x.Key == sortColumn.ColumnName);
            if (sortOption == null)
            {
                return searchRequest;
            }
            var sortOrder = sortColumn.SortDescending ? SortOrder.Descending : SortOrder.Ascending;
            return sortOption.SortFunction(searchRequest, sortOrder);
        }

        protected virtual ITypeSearch<TContent> ApplyTextSearch(ITypeSearch<TContent> searchRequest, string searchPhrase)
        {
            return searchRequest.For(searchPhrase)
                                .InField(x => x.Name, 2)
                                .InField(x => x.SearchText())
                                .Include(x => x.Name.PrefixCaseInsensitive(searchPhrase), 1.5)
                                .Include(x => x.Name.AnyWordBeginsWith(searchPhrase));
        }

        public abstract string Name { get; }

        public abstract int Order { get; }

        public virtual IEnumerable<CreateOption> CreateOptions
        {
            get { return null; }
        }

        public virtual int CacheForSeconds
        {
            get { return 600; }
        }

        public IEnumerable<SortOption> SortOptions
        {
            get { return SortActions; }
        }

        public virtual SortOption DefaultSortOption
        {
            get { return CreateNameSortAction(); }
        }

        public virtual bool HideSortOptions
        {
            get { return false; }
        }

        public virtual IEnumerable<SortAction<TContent>> SortActions
        {
            get
            {
                yield return CreateNameSortAction();

                yield return CreateDescendingStartPublishSortAction();
                
            }
        }

        protected static SortAction<TContent> CreateNameSortAction()
        {
            return new SortAction<TContent>(LocalizationService.Current.GetString("/pagetypes/common/property[@name='icontent_name']/caption"), "name", (search, order) =>
                {
                    if (order == SortOrder.Ascending)
                    {
                        return search.OrderBy(x => x.Name);
                    }
                    return search.OrderByDescending(x => x.Name);
                });
        }

        protected static SortAction<TContent> CreateDescendingStartPublishSortAction()
        {
            return new SortAction<TContent>(LocalizationService.Current.GetString("/pagetypes/common/property[@name='iversionable_startpublish']/caption"), "startpublish", (search, order) =>
            {
                if (order == SortOrder.Ascending)
                {
                    return search.OrderBy(x => ((IVersionable)x).StartPublish, SortMissing.First);
                }
                return search.OrderByDescending(x => ((IVersionable)x).StartPublish, SortMissing.Last);
            })
            {
                OrderDescending = true
            };
        }
    }
}