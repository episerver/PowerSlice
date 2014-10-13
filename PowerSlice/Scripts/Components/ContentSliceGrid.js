define([
    "dojo/_base/declare",
    "epi-cms/component/ContentQueryGrid"
], function (declare, ContentQueryGrid) {

    return declare([ContentQueryGrid], {
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