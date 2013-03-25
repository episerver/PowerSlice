define("powerslice/components/CreateSpecificContent", [
    "dojo",
    "dojo/i18n",
    "dojo/dom-attr",
    "dojo/_base/lang",
    "dijit",
    "epi/dependency",
    "epi/cms/component/CreateContent",
    "epi/i18n!epi/cms/nls/episerver.cms.components.createpage"
], function (dojo, i18n, domAttr, lang, dijit, dependency, CreateContent, res) {
    // summary:
    //    Widget for language branch creation.

    return dojo.declare("powerslice.components.CreateSpecificContent", [CreateContent], {

        contentTypeStore: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.contentTypeStore) {
                var registry = dependency.resolve("epi.storeregistry");
                this.contentTypeStore = registry.get("epi.cms.contenttype");
            }
        },

        postCreate: function () {
            this.skipContentTypeSelection = true;
            this.inherited(arguments);
        },

        updateView: function (data) {
            this.set("res", res);

            this.inherited(arguments);

            dojo.when(this.contentDataStore.get(this.predefinedParentId), dojo.hitch(this, function (parent) {
                this.set("parent", parent);
                dojo.when(this.contentTypeStore.get(this.predefinedContentTypeId), dojo.hitch(this, function (contentType) {
                    this.selectedContentType = contentType;
                    this._tryCreateContent(this.predefinedContentName, contentType);
                }));
            }));
        },

        getContentName: function () {
            return this.predefinedContentName;
        }

    });

});