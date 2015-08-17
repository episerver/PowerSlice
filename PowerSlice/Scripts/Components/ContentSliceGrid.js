define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi-cms/component/ContentQueryGrid"
], function (declare, lang, ContentQueryGrid) {

    return declare([ContentQueryGrid], {
        sortKey: null,
        descending: false,

        _onContextChangedReloadTimeout: null,
        _refreshInterval: 5000,

        fetchData: function () {
            var queryOptions = { ignore: ["query"] };
            if (this.sortKey) {
                queryOptions.sort = [{ attribute: this.sortKey, descending: this.descending }];
            }
            this.grid.set("queryOptions", queryOptions);

            var queryParameters = this.queryParameters || {};
            queryParameters.query = this.queryName;
            this.grid.set("query", queryParameters);
        },

        onContextChanged: function (context) {
            // Using a timeout on context change events to avoid reloading before newly indexed content is searchable
            clearTimeout(this._onContextChangedReloadTimeout);
            this._onContextChangedReloadTimeout = setTimeout(lang.hitch(this, function() {
                this.fetchData();
            }), this._refreshInterval);
        },
    });
});