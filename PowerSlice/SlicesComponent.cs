using System.Collections.Generic;
using System.Linq;
using EPiServer.ServiceLocation;
using EPiServer.Shell;
using EPiServer.Shell.Gadgets;
using EPiServer.Shell.ViewComposition;
using EPiServer.Shell.ViewComposition.Containers;

namespace PowerSlice
{
    [Component]
    public class SlicesComponent : ComponentDefinitionBase
    {
        private IEnumerable<IContentSlice> _slices;

        public SlicesComponent()
            : this(ServiceLocator.Current.GetAllInstances<IContentSlice>()) {}

        public SlicesComponent(IEnumerable<IContentSlice> slices) : base("powerslice.components.ContentSliceGroup")
        {
            _slices = slices;
            Categories = new [] { "cms" };

            PlugInAreas = new [] { "/episerver/cms/assets" };
            base.Title = "Content slices";
        }

        public override IComponent CreateComponent()
        {
            //var container = new ComponentGroup("Content");
            var container = new ComponentGroup() {Heading = "PowerSlice Content"};
            container.ContainerType = ContainerType.System;

            //Check how to create a container.
            //var container = base.CreateComponent() as IContainer;// { Heading = "Content" };
            //container.ContainerType = ContainerType.System;

            foreach (var slice in _slices.OrderByDescending(x => x.Order))
            {
                var listComponent = new ContentSliceComponent
                    {
                        Heading = slice.Name
                    };
                listComponent.Settings["queryName"] = slice.Name;
                listComponent.Settings["heading"] = slice.Name;
                listComponent.Settings["createOptions"] = slice.CreateOptions;
                var sortableSlice = slice as ISortableContentSlice;
                if (sortableSlice != null)
                {
                    listComponent.Settings["sortOptions"] = sortableSlice.SortOptions;
                    listComponent.Settings["defaultSortOption"] = sortableSlice.DefaultSortOption;
                    listComponent.Settings["hideSortOptions"] = sortableSlice.HideSortOptions;
                }
                container.Add(listComponent);
            }

            return container;
        }
    }
}