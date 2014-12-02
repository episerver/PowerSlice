define([

// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

// Dijit
    "dijit/_CssStateMixin",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

// EPi Framework
    "epi",
    "epi/shell/widget/dialog/_DialogContentMixin",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/_ActionProviderWidget",

// Template
    "dojo/text!./templates/CreateContentInSliceDialog.html",

// Resource
    "epi/i18n!epi/cms/nls/powerslice.createdialog"
],
function (

// Dojo
    declare,
    lang,

// Dijit
    _CssStateMixin,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

// EPi Framework
    epi,
    _DialogContentMixin,
    _ModelBindingMixin,
    _ActionProviderWidget,

// Template
    template,

// Resource
    i18n
) {
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _ActionProviderWidget, _DialogContentMixin, _CssStateMixin], {
        // summary:
        //      epi-cms/contentediting/NewContentNameInputDialog based dialog
        // description:
        //      This is a copy of NewContentNameInputDialog, altered to
        //      enable custom messages that are not overwritten after in
        //      postMixInProperties
        // tags:
        //      internal

        templateString: template,

        i18n: i18n,

        defaultContentName: null,

        message: null,

        title: null,

        nameLabel: epi.resources.header.name,

        _setMessageAttr: { node: "messageNode", type: "innerHTML" },

        postMixInProperties: function () {
            this.inherited(arguments);
            this.message = i18n.message;
            this._set("message", this.message);
            this.title = i18n.title;
        },

        postCreate: function () {
            this.inherited(arguments);
            this.contentNameTextbox.set("value", this.defaultContentName);

            this.contentNameTextbox.on("keyup", lang.hitch(this, function (evt) {

                var isValid = this.contentNameTextbox.isValid();

                if (evt.keyCode == dojo.keys.ENTER && isValid) {
                    this.executeDialog();
                }
            }));

            this.on("focus", lang.hitch(this, function () {
                this.contentNameTextbox.textbox.select();
            }));
        },

        _getValueAttr: function () {
            return this.contentNameTextbox.get("value");
        },

        _onBlurVerifyContent: function () {
            // summary:
            //    check if the textfield content is empty on blur,
            //    set to default value if it is.
            //
            // tags:
            //    private
            if(this.contentNameTextbox.get("value") === "") {
                this.contentNameTextbox.set("value", this.defaultContentName);
            }
        },

        getActions: function () {
            // summary:
            //      Overridden from _ActionProvider to get the select current content action added to the containing widget
            //
            // returns:
            //      An array contining a select page action definition, if it is not a shared block

            this._actions = [
                {
                    name: "ok",
                    label: epi.resources.action.ok,
                    settings: { type: "button", "class": "Salt" },
                    action: lang.hitch(this, function () {
                        if (this.contentNameTextbox.isValid()) {
                            this.executeDialog();
                        } else {
                            this.contentNameTextbox.focus();
                        }
                    })
                },
                {
                    name: "cancel",
                    label: epi.resources.action.cancel,
                    settings: { type: "button" },
                    action: lang.hitch(this, function () {
                        this.cancelDialog();
                    })
                }
            ];

            return this._actions;
        }
    });
});