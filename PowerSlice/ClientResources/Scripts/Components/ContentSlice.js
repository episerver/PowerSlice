define([
// Dojo
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-geometry",
// Dijit
    "dijit/_TemplatedMixin",
    "dijit/_Container",
    "dijit/layout/_LayoutWidget",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "dijit/form/DropDownButton",
//Custom
    "joel/components/ContentSliceGrid",
    "joel/components/CreateContentInSlice",
    "epi/i18n!epi/cms/nls/powerslice.slice",
    "dojo/text!./templates/ContentSlice.html"
], function (
// Dojo
    dojo,
    declare,
    array,
    lang,
    domStyle,
    domGeometry,
// Dijit
    _TemplatedMixin,
    _Container,
    _LayoutWidget,
    _WidgetsInTemplateMixin,
    Button,
    DropDownMenu,
    MenuItem,
    DropDownButton,
// Custom
    ContentSliceGrid,
    CreateContentInSlice,
    resources,
    template
) {
    return declare("joel.components.ContentSlice",
        [_Container, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            resources: resources,
            sortControls: null,
            
            postCreate: function () {
                this.inherited(arguments);
                this.orderDescending = false;
                this.addCreateButton();
                this.sortControls = [];
                this.addSortControls();
                
                if (this.hideSortOptions) {
                    domStyle.set(this.sortOptionsNode, 'display', 'none');
                }

                if (this.defaultSortOption) {
                    this.sortKey = this.defaultSortOption.key;
                    this.orderDescending = this.defaultSortOption.orderDescending;
                }
                
                this._reloadQuery();
            },
            
            resize: function (newSize) {
                this.inherited(arguments);

                var toolbarSize = domGeometry.getMarginBox(this.toolbar);

                var gridSize = { w: newSize.w, h: newSize.h - toolbarSize.h };

                this.contentQuery.resize(gridSize);
            },
            
            addCreateButton: function () {
                if (!this.createOptions || this.createOptions.length === 0) {
                    return;
                }
                
                var that = this;
                var button;
                
                if (this.createOptions.length == 1) {
                    button = new Button({
                        "class": "epi-mediumButton",
                        iconClass: "epi-iconPlus",
                        showLabel: false,
                        title: that.resources.createbutton.singleoptionprefix + " " + that.createOptions[0].label,
                        onClick: function () {
                            that._createContent(that.createOptions[0]);
                        }
                    });
                } else {
                    var menu = new DropDownMenu({ style: "display: none;" });
                    
                    array.forEach(this.createOptions, function (createOption) {
                        var menuItem = new MenuItem({
                            label: createOption.label,
                            onClick: function () {
                                that._createContent(createOption);
                            }
                        });

                        menu.addChild(menuItem);
                    });

                    button = new DropDownButton({
                        "class": "epi-mediumButton epi-disabledDropdownArrow",
                        iconClass: "epi-iconPlus",
                        showLabel: false,
                        title: that.resources.createbutton.multipleoptions,
                        dropDown: menu
                    });
                }
                this.queryNode.appendChild(button.domNode);
            },
            
            addSortControls: function() {
                if (!this.sortOptions || this.sortOptions.length === 0) {
                    return;
                }
                var that = this;
                //▲▼
                array.forEach(this.sortOptions, function(sortOption) {
                    var sortButton = new Button({
                        label: sortOption.label,
                        "class": "epi-chromelessButton",
                        onClick: function () {
                            if (that.sortKey === sortOption.key) {
                                that.orderDescending = !that.orderDescending;
                            } else {
                                that.orderDescending = sortOption.orderDescending;
                            }
                            that.sortKey = sortOption.key;
                            
                            that._reloadQuery();
                        }
                    });
                    that.sortOptionsNode.appendChild(sortButton.domNode);
                    that.sortControls.push({ key: sortOption.key, button: sortButton });
                });
            },
            
            _queryTextChanged: function (value) {
                if (value) {
                    this.sortKey = null;
                } else if(this.defaultSortOption){
                    this.sortKey = this.defaultSortOption.key;
                    this.orderDescending = this.defaultSortOption.orderDescending;
                }
                
                this._reloadQuery();
            },

            _reloadQuery: function () {
                var that = this;
                array.forEach(this.sortControls, function (sortControl) {
                    if (that.sortKey && sortControl.key === that.sortKey) {
                        dojo.addClass(sortControl.button.domNode, 'epi-boldButton');
                    } else {
                        dojo.removeClass(sortControl.button.domNode, 'epi-boldButton');
                    }
                });
                if (this.sortKey) {
                    this.contentQuery.set("sortKey", this.sortKey);
                    this.contentQuery.set("descending", this.orderDescending);
                } else {
                    this.contentQuery.set("sortKey", null);
                }
                this.contentQuery.set("queryParameters", { q: this.queryText.value });
                this.contentQuery.set("queryName", this.queryName);
            },
            
            _createContent: function (createOption) {
                var createDialog = new CreateContentInSlice({ settings: createOption });
                dojo.connect(createDialog, "onClose", lang.hitch(this, function () {
                    domStyle.set(this.tools, 'display', null);
                }));
                this.toolbar.appendChild(createDialog.domNode);
                domStyle.set(this.tools, 'display', 'none');
            }
        });

});