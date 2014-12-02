define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/promise/all",
    "epi/dependency",
    "epi-cms/contentediting/CreateContent",
    "epi/i18n!epi/cms/nls/episerver.cms.components.createpage"
], function (declare, lang, domAttr, all, dependency, CreateContent, res) {
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
            this.inherited(arguments);
            this.skipContentTypeSelection = true;
        },

        updateView: function (data) {
            this.set("res", res);

            var inherited = this.getInherited(arguments),
                self = this;

            all({
                parent: this.model.contentDataStore.get(data.predefinedParentId),
                contentType: this.contentTypeStore.get(data.predefinedContentTypeId)
            }).then(function(results) {
                    inherited.call(self, {
                        requestedType: results.contentType.typeIdentifier,
                        parent: results.parent
                    });
                    self.model.set("contentName", data.predefinedContentName);
                }
            );
        }
    });
});