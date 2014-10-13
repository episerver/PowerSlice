define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/on",
    "epi/dependency",
    "epi-cms/component/CreateContent",
    "epi/i18n!epi/cms/nls/episerver.cms.components.createpage"
], function (declare, lang, domAttr, on, dependency, CreateContent, res) {
    // summary:
    //    Widget for language branch creation.

    return declare([CreateContent], {

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

            on(this.contentDataStore.get(this.predefinedParentId), lang.hitch(this, function (parent) {
                this.set("parent", parent);
                on(this.contentTypeStore.get(this.predefinedContentTypeId), lang.hitch(this, function (contentType) {
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