define([
// Dojo
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/topic",

// Dijit
    "dijit/form/Select",
    "dijit/_Container",
    "dijit/layout/_LayoutWidget",
    "dijit/Toolbar",
    "dijit/form/Button",

// EPi Framework
    "epi",

// EPi CMS
    "epi-cms/component/ContentQueryGrid",
    "epi/i18n!epi/cms/nls/episerver.cms.components.tasks",

], function (
// Dojo
    dojo,
    declare,
    array,
    lang,
    domConstruct,
    domGeom,
    topic,
// Dijit
    Select,
    _Container,
    _LayoutWidget,
    Toolbar,
    Button,
// EPi Framework
    epi,
// EPi CMS
    ContentQueryGrid,
    resources
) {

    return declare([_Container, _LayoutWidget], {
        // summary:
        //      This component will list the latest changed pages for the web site.
        //      This is a modified version of epi-cms/component/Tasks

        gridClass: ContentQueryGrid,
        "class": "epi-powerslice-container",

        resources: resources,

        toolbar: null,
        toolbarGroupNode: null,
        querySelection: null,
        reloadButton: null,

        _selectionChangedEventHandler: null,

        buildRendering: function () {

            this.inherited(arguments);

            var toolbar, options, querySelection, reloadButton, contentQuery;

            toolbar = this.toolbar = new Toolbar({
                "class": "epi-flatToolbar"
            });
            this.addChild(toolbar);

            this.toolbarGroupNode = domConstruct.toDom("<div class=\"epi-floatRight\"></div>");
            domConstruct.place(this.toolbarGroupNode, this.toolbar.domNode);

            options = array.map(this.queries, function (item) {
                return {
                    label: item.displayName,
                    value: item.name
                };
            }, this);
            querySelection = this.querySelection = new Select({
                "class": "epi-chromeless epi-chromeless--with-arrow epi-flat epi-gadget__selector",
                name: "QuerySelection",
                options: options
            });
            domConstruct.place(this.querySelection.domNode, this.toolbarGroupNode, "before");

            reloadButton = this.reloadButton = new Button({
                "class": "epi-flat epi-chromeless",
                label: resources.refresh || "Refresh",  // TODO: Add to resources
                iconClass: "epi-iconReload",
                showLabel: false,
                onClick: lang.hitch(this, this._reloadQuery)
            });
            domConstruct.place(this.reloadButton.domNode, this.toolbarGroupNode);

            contentQuery = this.contentQuery = new this.gridClass();
            this.addChild(contentQuery);

            this.own(
                toolbar,
                querySelection,
                querySelection.on("change", lang.hitch(this, this._reloadQuery)),
                reloadButton,
                contentQuery,
                topic.subscribe("/epi/cms/action/refreshmytasks", lang.hitch(this, this._reloadQuery))
            );
        },

        startup: function(){
            this.inherited(arguments);
            // Set the initial query after the grid has been initialized
            this._reloadQuery();
        },

        resize: function (newSize) {
            // summary:
            //      Customize default resize method
            // newSize: object
            //      The new size of Task component
            // tags:
            //      Public
            this.inherited(arguments);
            this.contentQuery.resize(this._calculateContentQuerySize(newSize));
        },

        _calculateContentQuerySize: function (newSize) {
            // summary:
            //      Calculate the new Size of the Content Query
            // newSize: object
            //      The new size of Task component
            // tags:
            //      Private
            var toolbarSize = domGeom.getMarginBox(this.toolbar.domNode);
            return { w: newSize.w, h: newSize.h - toolbarSize.h };
        },

        _reloadQuery: function () {
            var query = this.querySelection.get("value");
            array.some(this.queries, function (item) {
                if (item.name == query) {
                    this.contentQuery.set("ignoreVersionWhenComparingLinks", !item.versionSpecific);
                    return true;
                }
            }, this);
            this.contentQuery.set("queryName", query);
            this.inherited(arguments);
        }
    });
});
