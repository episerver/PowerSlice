define([
// Dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/aspect",
// Dijit
    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/form/Button",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "dijit/form/DropDownButton",
// EPi
    "epi/shell/widget/dialog/Dialog",
//Custom
    "./CreateContentInSliceDialog",
    "epi/i18n!epi/cms/nls/powerslice.slice"
], function (
// Dojo
    declare,
    array,
    lang,
    topic,
    aspect,
// Dijit
    _WidgetBase,
    _Container,
    Button,
    DropDownMenu,
    MenuItem,
    DropDownButton,
// EPi
    Dialog,
// Custom
    CreateContentInSliceDialog,
    i18n
) {
    return declare([_WidgetBase, _Container], {

        i18n: i18n,

        "class": "dijitInline",

        buildRendering: function () {
            this.inherited(arguments);
            this.button = new Button({
                disabled: true,
                "class": "epi-flat epi-chromeless epi-sort-drop-down--fixed-width",
                iconClass: "epi-iconPlus",
                showLabel: false,
                onClick: lang.hitch(this, function () {
                    this._createContent(option);
                })
            });
            this.dropDown = new DropDownButton({
                "class": "epi-flat epi-chromeless epi-sort-drop-down--fixed-width",
                iconClass: "epi-iconPlus",
                showLabel: false,
                title: this.i18n ? this.i18n.createbutton.multipleoptions : ""
            });
            this.addChild(this.button);
        },

        _setOptionsAttr: function(options) {
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
                this.removeChild(this.button);
                this.addChild(this.dropDown);
            } else {
                var option = options && options.length === 1 ? options[0] : {};
                var title = i18n && i18n.createbutton ?
                    i18n.createbutton.singleoptionprefix + " " + option.label :
                    "";
                this.button.set("title", title);
                this.button.set("disabled", !options || options.length < 1);
                this.button.onClick = lang.hitch(this, function () {
                    this._createContent(option);
                });
                this.removeChild(this.dropDown);
                this.addChild(this.button);
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