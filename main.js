module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'cocos-particle-editor:open': function (uuid) {
        var fspath = Editor.assetdb.uuidToFspath(uuid);
        Editor.Panel.open('cocos-particle-editor.panel',{
            path: fspath
        });
    },
};
