define("powerslice/components/ContentSliceGrid", [
    "dojo",
    "dojo/_base/lang",
    "epi",
    "epi/dependency",
    "epi-cms/dgrid/DnD",
    "epi-cms/component/ContentQueryGrid"
], function (dojo, lang, epi, dependency, DnD, ContentQueryGrid) {

    return dojo.declare("powerslice.components.ContentSliceGrid", [ContentQueryGrid], {
        sortKey: null,
        descending: false,
        
        fetchData: function () {
            var queryOptions = { ignore: ["query"] };
            if (this.sortKey) {
                queryOptions.sort = [{ attribute: this.sortKey, descending: this.descending }];
            }
            this.grid.set("queryOptions", queryOptions);

            var queryParameters = this.queryParameters || {};
            queryParameters.query = this.queryName;
            this.grid.set("query", queryParameters);
        }
    });
});