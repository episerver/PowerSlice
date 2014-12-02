define([
// Dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/aspect",
// EPi
    "epi/shell/widget/dialog/Dialog",
    "epi/shell/widget/SearchBox",
    "./Tasks",
    "./CreateButton",
//Custom
    "./ContentSliceGrid",
    "./SortDropDown",
    "epi/i18n!epi/cms/nls/powerslice.slice"
], function (
// Dojo
    declare,
    array,
    lang,
    aspect,
// EPi
    Dialog,
    SearchBox,
    Tasks,
    CreateButton,
// Custom
    ContentSliceGrid,
    SortDropDown,
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

        i18n: i18n,

        buildRendering: function () {
            this.inherited(arguments);

            this.createButton = new CreateButton();
            this.toolbar.addChild(this.createButton, 1);

            this.queryText = new SearchBox({
                placeHolder: i18n.filter,
                onChange: lang.hitch(this, function(value) {
                    this._reloadQuery(500);
                }),
                intermediateChanges: true
            });
            this.toolbar.addChild(this.queryText);
            this.own(this.queryText);

            //▲▼
            this.sortButton = this._createSortDropDown();
            this.toolbar.addChild(this.sortButton);
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
                "class": "epi-chromeless",
                iconClass: "epi-iconSort",
                showLabel: false,
                title: this.i18n.createbutton.multipleoptions
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

        _reloadQuery: function (delay) {
            var supermethod = this.getInherited(arguments);
            if(this.reloadInterval) {
                clearInterval(this.reloadInterval);
            }
            this.reloadInterval = setInterval(lang.hitch(this, function() {
                var newQueryName = this.querySelection && this.querySelection.get("value"),
                    newQuery = this._getQuery(newQueryName),
                    selectionChanged = newQueryName !== this.contentQuery.get("queryName");

                // Set parameters for contentQuery
                this.contentQuery.set("sortKey", this.sortKey || null);
                this.contentQuery.set("descending", this.sortKey ? this.orderDescending : false);
                this.contentQuery.set("queryParameters", { q: this.queryText ? this.queryText.get("value") : "" });

                if(selectionChanged) {
                    this.createButton.set("options", newQuery.createOptions);
                    this.sortButton.set("options", newQuery.sortOptions);
                    if (newQuery.defaultSortOption) {
                        this.sortButton.set("attribute", newQuery.defaultSortOption.key);
                        this.sortButton.set("descending", newQuery.defaultSortOption.orderDescending);
                    }
                }

                // Run super method
                supermethod.apply(this);
                clearInterval(this.reloadInterval);
            }), delay || 1);
        }

    });
});