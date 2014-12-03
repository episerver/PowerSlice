using System.Collections.Generic;
using System.Linq;
using EPiServer;
using EPiServer.Shell.ContentQuery;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Find;
using EPiServer.Find.Api;
using EPiServer.Find.Cms;
using EPiServer.Framework.Localization;
using EPiServer.ServiceLocation;
using EPiServer.Shell.Services.Rest;
using EPiServer.Shell.Rest;
using EPiServer.Cms.Shell.UI.Rest.ContentQuery;

namespace PowerSlice
{
    public abstract class ContentSliceBase<TContent> : ContentQueryBase, IContentSlice, ISortableContentSlice<TContent> 
        where TContent : IContentData
    {
        protected IClient SearchClient;
        protected IContentTypeRepository ContentTypeRepository;
        protected IContentLoader ContentLoader;

        protected ContentSliceBase(IClient searchClient, IContentTypeRepository contentTypeRepository, IContentLoader contentLoader)
            : base(ServiceLocator.Current.GetInstance<IContentRepository>(), ServiceLocator.Current.GetInstance<IContentQueryHelper>())
        {
            SearchClient = searchClient;
            ContentTypeRepository = contentTypeRepository;
            ContentLoader = contentLoader;
        }

        protected ContentSliceBase()
            : this(EPiServer.Find.Framework.SearchClient.Instance, ServiceLocator.Current.GetInstance<IContentTypeRepository>(), ServiceLocator.Current.GetInstance<IContentLoader>())
        {}

        public override QueryRange<IContent> ExecuteQuery(IQueryParameters parameters)
        {
            var contentQueryParam = parameters as ContentQueryParameters;

            var searchRequest = SearchClient.Search<TContent>()
                .FilterOnLanguages(new[] { contentQueryParam.PreferredCulture.Name });

            var searchPhrase = parameters.AllParameters["q"];
            var hasFreeTextQuery = !string.IsNullOrWhiteSpace(searchPhrase) && searchPhrase != "*";
            if (hasFreeTextQuery)
            {
                searchRequest = ApplyTextSearch(searchRequest, searchPhrase);
            }

            searchRequest = Filter(searchRequest, contentQueryParam);

            searchRequest = ApplyVisibilityFilter(searchRequest);

            if (contentQueryParam.SortColumns != null && contentQueryParam.SortColumns.Any())
            {
                var sortColumn = contentQueryParam.SortColumns.FirstOrDefault();
                searchRequest = ApplySorting(searchRequest, sortColumn);
            }

            if(parameters.Range.Start.HasValue && parameters.Range.End.HasValue)
            {
                searchRequest = searchRequest
                .Skip(parameters.Range.Start.Value)
                .Take(parameters.Range.End.Value);
            }

            var result = searchRequest
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
            var sortOrder = sortColumn.SortDescending ? EPiServer.Find.Api.SortOrder.Descending : EPiServer.Find.Api.SortOrder.Ascending;
            return sortOption.SortFunction(searchRequest, sortOrder);
        }

        protected virtual ITypeSearch<TContent> ApplyTextSearch(ITypeSearch<TContent> searchRequest, string searchPhrase)
        {
            return searchRequest.For(searchPhrase)
                                .InField(x => ((IContent) x).Name, 2)
                                .InField(x => ((IContent)x).SearchText())
                                .Include(x => ((IContent)x).Name.PrefixCaseInsensitive(searchPhrase), 1.5)
                                .Include(x => ((IContent)x).Name.AnyWordBeginsWith(searchPhrase));
        }

        public virtual int Order
        {
            get { return 0; }
        }

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
            return new SortAction<TContent>(LocalizationService.Current.GetString("/powerslice/slice/sortbyname/caption"), "name", (search, order) =>
                {
                    if (order == EPiServer.Find.Api.SortOrder.Ascending)
                    {
                        return search.OrderBy(x => ((IContent)x).Name);
                    }
                    return search.OrderByDescending(x => ((IContent)x).Name);
                });
        }

        protected static SortAction<TContent> CreateDescendingStartPublishSortAction()
        {
            return new SortAction<TContent>(LocalizationService.Current.GetString("/powerslice/slice/sortbystartpublish/caption"), "startpublish", (search, order) =>
            {
                if (order == EPiServer.Find.Api.SortOrder.Ascending)
                {
                    return search.OrderBy(x => ((IVersionable)x).StartPublish, SortMissing.First);
                }
                return search.OrderByDescending(x => ((IVersionable)x).StartPublish, SortMissing.Last);
            })
            {
                OrderDescending = true
            };
        }

        protected override IEnumerable<IContent> GetContent(ContentQueryParameters parameters)
        {
            //Is not used for this class.
            throw new System.NotImplementedException();
        }

        public override string DisplayName
        {
            get { return Name; }
        }
    }
}