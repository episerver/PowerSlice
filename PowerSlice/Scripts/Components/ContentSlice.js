define([
// Dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/topic",
    "dojo/dom-geometry",
    "dojo/dom-construct",
    "dojo/dom-class",
// Dijit
    "dijit/form/Button",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "dijit/form/DropDownButton",
// EPi
    "epi/shell/widget/dialog/Dialog",
    "epi/shell/widget/SearchBox",
    "./Tasks",
//Custom
    "./ContentSliceGrid",
    "./SortDropDown",
    "./CreateContentInSliceDialog",
    "epi/i18n!epi/cms/nls/powerslice.slice"
], function (
// Dojo
    declare,
    array,
    lang,
    aspect,
    topic,
    domGeom,
    domConstruct,
    domClass,
// Dijit
    Button,
    DropDownMenu,
    MenuItem,
    DropDownButton,
// EPi
    Dialog,
    SearchBox,
    Tasks,
// Custom
    ContentSliceGrid,
    SortDropDown,
    CreateContentInSliceDialog,
    i18n
) {
    return declare([Tasks], {

        // gridClass: epi-cms/component/ContentQueryGrid
        //      A ContentQueryGrid or compatible for displaying content results
        gridClass: ContentSliceGrid,

        // orderDescending: bool
        //      Whether to order results in descending order
        orderDescending: false,

        // orderDescending: ./CreateButton
        //      Widget showing a Button or DropDownButton depending on options
        createButton: null,

        // orderDescending: ./SortDropDown
        //      DropDownButton used to set or show current sort order
        sortButton: null,

        // reloadInterval: Number
        //      Stores the ID of the timer used in _reloadQuery
        reloadInterval: null,

        // defaultReloadDelay: Number
        //      The default milliseconds to wait before reloading when typing in searchbox
        defaultSearchDelay: 300,

        i18n: i18n,

        buildRendering: function () {
            this.inherited(arguments);
            // Create-button (default)
            this.button = new Button({
                disabled: true,
                "class": "epi-flat epi-chromeless epi-sort-drop-down--fixed-width",
                iconClass: "epi-iconPlus",
                showLabel: false,
                onClick: lang.hitch(this, function (option) {
                    this._createContent(option);
                })
            });
            this.toolbar.addChild(this.button, 1);
            // Create-dropdown
            this.dropDown = new DropDownButton({
                "class": "epi-flat epi-chromeless epi-sort-drop-down--fixed-width",
                iconClass: "epi-iconPlus",
                showLabel: false,
                title: this.i18n && this.i18n.createbutton ? this.i18n.createbutton.multipleoptions : ""
            });
            // Query text
            this.queryNode = domConstruct.place("<div class=\"queryBar\"></div>", this.toolbar.domNode, "after");
            this.queryText = new SearchBox({
                "class": "epi-search--full-width",
                placeHolder: i18n.filter,
                intermediateChanges: true
            });
            this.queryText.own(
                this.queryText.on("searchBoxChange", lang.hitch(this, function(value) {
                    this._reloadQuery(value ? this.defaultSearchDelay : null);
                }))
            );
            domConstruct.place(this.queryText.domNode, this.queryNode);
            this.own(this.queryText);
            //▲▼ Sorting
            this.sortButton = this._createSortDropDown();
            domConstruct.place(this.sortButton.domNode, this.queryNode);
            this.addChild(this.sortButton, 2);
            this.own(this.sortButton);
        },

        _getCurrentQueryAttr: function() {
            return this._getQuery(this.contentQuery.get("queryName"));
        },

        _getQuery: function (name) {
            var q = array.filter(this.queries, function(item) {
                return name === item.name;
            }, this);
            return q.length > 0 ? q[0] : {};
        },

        _createSortDropDown: function () {
            var dd = new SortDropDown({
                "class": "epi-chromeless epi-sort-drop-down",
                iconClass: "epi-iconSort",
                showLabel: false,
                title: this.i18n.sortbutton
            });
            dd.own(
                // Update sort icons to reflect current sort state
                aspect.after(this.contentQuery.grid, "renderArray", function(response, args) {
                    var sort = args.length > 2 && args[2].sort && args[2].sort.length > 0 ? args[2].sort[0] : {};
                    response.then(function() {
                        dd.set("sortIcon", sort);
                    });
                    return response;
                }),
                dd.watch("attribute", lang.hitch(this, function(name, oldValue, newValue) {
                    this.sortKey = newValue;
                    this._reloadQuery();
                })),
                dd.watch("descending", lang.hitch(this, function(name, oldValue, newValue) {
                    this.orderDescending = newValue;
                    this._reloadQuery();
                }))
            );
            return dd;
        },

        _setSortOptionsAttr: function (options) {
            this.sortButton.set("options", options);
            this._set("options", options);
        },

        _setHideSortOptionsAttr: function (hide) {
            domClass[hide ? "add" : "remove"](this.queryNode, "queryBar--hide-sorting");
            this._set("hideSortOptions", hide);
        },


        _reloadQuery: function (delay) {
            var supermethod = this.getInherited(arguments);
            if(this.reloadInterval) {
                clearInterval(this.reloadInterval);
            }
            this.reloadInterval = setInterval(lang.hitch(this, function() {
                var newQueryName = this.querySelection && this.querySelection.get("value"),
                    newQuery = this._getQuery(newQueryName),
                    selectionChanged = newQueryName !== this.contentQuery.get("queryName");

                if (selectionChanged) {
                    // Set the sort and order based on the defaults
                    if (newQuery.defaultSortOption) {
                        this.sortKey = newQuery.defaultSortOption.key;
                        this.orderDescending = newQuery.defaultSortOption.orderDescending;
                    } else {
                        this.sortKey = null;
                        this.orderDescending = false;
                    }
                }

                // Set parameters for contentQuery
                this.contentQuery.set("sortKey", this.sortKey);
                this.contentQuery.set("descending", this.orderDescending);
                this.contentQuery.set("queryParameters", { q: this.queryText ? this.queryText.get("value") : "" });

                if(selectionChanged && this.sortButton) {
                    // Set available create options
                    this.set("createOptions", newQuery.createOptions);
                    // Set available sort options and show/hide sort button
                    this.set("sortOptions", newQuery.sortOptions);
                    this.set("hideSortOptions", newQuery.hideSortOptions);

                    // Set default sort options as active
                    if (newQuery.defaultSortOption) {
                        this.sortButton.set("attribute", newQuery.defaultSortOption.key);
                        this.sortButton.set("descending", newQuery.defaultSortOption.orderDescending);
                    }
                }

                // Run super method
                supermethod.apply(this);
                clearInterval(this.reloadInterval);
            }), delay || 1);
        },

        _calculateContentQuerySize: function (newSize) {
            // summary:
            //      Calculate the new Size of the Content Query
            // newSize: object
            //      The new size of Task component
            // tags:
            //      Private
            var size = this.inherited(arguments),
                queryTextSize = domGeom.getMarginBox(this.queryText.domNode);
            return { w: newSize.w, h: size.h - queryTextSize.h };
        },

        _setCreateOptionsAttr: function(options) {
            if(options && options.length > 1) {
                var menu = new DropDownMenu({ style: "display: none;" });
                array.forEach(options, function (option) {
                    var menuItem = new MenuItem({
                        label: option.label,
                        onClick: lang.hitch(this, function () {
                            this._createContent(option);
                        })
                    });
                    menu.addChild(menuItem);
                }, this);
                this.dropDown.set("dropDown", menu);
                this.toolbar.removeChild(this.button);
                this.toolbar.addChild(this.dropDown, 1);
            } else {
                var option = options && options.length === 1 ? options[0] : {};
                var title = i18n && i18n.createbutton && option.label ?
                    i18n.createbutton.singleoptionprefix + " " + option.label :
                    "";
                this.button.set("title", title);
                this.button.set("disabled", !options || options.length < 1);
                this.button.onClick = lang.hitch(this, function () {
                    this._createContent(option);
                });
                this.toolbar.removeChild(this.dropDown);
                this.toolbar.addChild(this.button, 1);
            }
        },

        _createContent: function (createOption) {
            var contentNameInput = new CreateContentInSliceDialog({
                defaultContentName: lang.replace(i18n.defaultcontentname, { contentType: createOption.label })
            });

            var dialog = new Dialog({
                defaultActionsVisible: false,
                autofocus: true,
                content: contentNameInput,
                title: lang.replace(i18n.defaultcontentname, { contentType: createOption.label }),
                destroyOnHide: true
            });

            this.own(
                aspect.after(dialog, "onExecute", function () {
                    topic.publish("/epi/shell/action/changeview", "powerslice/components/CreateSpecificContent", null, {
                        predefinedParentId: createOption.parent,
                        predefinedContentTypeId: createOption.contentTypeId,
                        predefinedContentName: lang.trim(dialog.content.get("value"))
                    });
                }, true)
            );
            dialog.show();
        }

    });
});