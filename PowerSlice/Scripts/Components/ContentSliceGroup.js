define([
    "dojo/_base/declare",
    "epi.shell.widget.layout.ComponentTabContainer",
    "powerslice.components.ContentSlice"
], function (declare, ComponentTabContainer, ContentSlice) {

    return declare([ComponentTabContainer], {
        
        create: function () {
            this.inherited(arguments);

            var child;

            child = new ContentSlice();

            addChild(child, 0);
        }
    });
});