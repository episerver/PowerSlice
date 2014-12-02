define([
// Dojo
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
// Dijit
    "dijit/form/DropDownButton",
    "dijit/DropDownMenu",
    "dijit/MenuItem"
], function (
// Dojo
    dojo,
    declare,
    array,
    lang,
// Dijit
    DropDownButton,
    DropDownMenu,
    MenuItem
) {

    return declare([DropDownButton], {

        // attribute: String
        //      The attribute to sort on
        attribute: null,

        // descending: bool
        //      Whether to sort in descending order
        descending: false,

        // dropDownClass: dijit/DropDownMenu
        //      A DropDownMenu or compatible widget to use as dropdown
        dropDownClass: DropDownMenu,

        postMixInProperties: function () {
            this.inherited(arguments);
            this.dropDown = this.dropDown || new this.dropDownClass();
        },

        _setSortIconAttr: function (sort) {
            // summary:
            //      Sets the sort icons of the widger
            // example:
            // |    var sortDropDown = new SortDropDown();
            // |    sortDropDown.set("sortIcon", { attribute: "name", descending: true });
            array.forEach(this.dropDown.getChildren(), function (item) {
                if(item.key !== sort.attribute) {
                    item.set("iconClass", null);
                } else if(sort.descending) {
                    item.set("iconClass", "epi-powerslice-iconSortDescending");
                } else {
                    item.set("iconClass", "epi-powerslice-iconSortAscending");
                }
            });
        },

        _setAttributeAttr: function (attribute) {
            this._set("attribute", attribute);
            this.set("sortIcon", { attribute: attribute, descending: this.get("descending") });
        },

        _setDescendingAttr: function (descending) {
            this._set("descending", descending);
            this.set("sortIcon", { attribute: this.get("attribute"), descending: descending });
        },

        _setOptionsAttr: function (options) {
            // summary:
            //      Sets the options available to sort on
            // example:
            // |    var sortDropDown = new SortDropDown();
            // |    sortDropDown.set("options", [
            // |        { label: "Name", key: "name", orderDescending: false },
            // |        { label: "Time", key: "time", orderDescending: true }
            // |    ]);
            array.forEach(this.dropDown.getChildren(), function (item) {
                item.destroy();
            });

            array.forEach(options, function (option) {
                var menuItem = new MenuItem({
                    label: option.label,
                    key: option.key,
                    onClick: lang.hitch(this, function () {
                        this.set("descending", this.get("attribute") === option.key ? !this.get("descending") : option.orderDescending);
                        this.set("attribute", option.key);
                    })
                });
                this.dropDown.addChild(menuItem);
            }, this);

            this.set("disabled", !this.dropDown.hasChildren());
        }
    });

});
