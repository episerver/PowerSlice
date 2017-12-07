﻿using System.Collections.Generic;
using System.Linq;
using EPiServer.ServiceLocation;
using EPiServer.Shell.ViewComposition;

namespace PowerSlice
{
    [Component]
    public class SlicesComponent : ComponentDefinitionBase
    {
        private IEnumerable<IContentSlice> _slices;

        public SlicesComponent()
            : this(ServiceLocator.Current.GetAllInstances<IContentSlice>()) {}

        public SlicesComponent(IEnumerable<IContentSlice> slices) : base("powerslice/components/ContentSlice")
        {
            _slices = slices.OrderBy(x => x.SortOrder);
            Categories = new [] { "cms" };

            PlugInAreas = new [] { "/episerver/cms/assets" };
            base.Title = "Powerslice";
        }

        /// <summary>
        /// Creates the component.
        /// </summary>
        /// <returns>The component</returns>
        public override IComponent CreateComponent()
        {
            var component = base.CreateComponent();   
            component.Settings.Add(new Setting("queries", _slices.ToList(), false));
            return component;
        }
    }
}