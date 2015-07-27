var Fs = require('fire-fs');

Editor.registerPanel( 'cocos-particle-editor.panel', {
    is: 'cocos-particle-editor',

    listeners: {
        'panel-show': '_onPanelShow',
        'resize': '_onResize',
    },

    properties: {
        screenColor: {
            type: Object,
            value: function () {
                return {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 1
                };
            },
        },

        parameters: {
            type: Object,
            value: function () {
                return [];
            }
        },
    },

    created: function () {
        this.scene = null;
    },

    ready: function () {
    },

    attached: function () {
        this._init();
    },

    _onPanelShow: function () {
        var uuid = Editor.Selection.curActivate('asset');
        this.uuidToPath(uuid,function(path) {
            this.loadPlist(path);
        }.bind(this));
    },

    'panel:open': function (argv) {
        if (argv && argv.path) {
            this.loadPlist(argv.path);
        }
    },

    'selection:activated': function ( type, uuid ) {
        if ( type !== 'asset' )
            return;

        this.uuidToPath(uuid,function(path) {
            this.loadPlist(path);
        }.bind(this));
    },

    uuidToPath: function (uuid,callback) {
        Editor.assetdb.queryInfoByUuid( uuid, function (info) {
            if (info['meta-type'] === 'particle') {
                callback(info.path);
            }
        }.bind(this));
    },

    _sceneClass: function (screenColor) {
        return 'background: rgba('+screenColor.r * 255|0+','+screenColor.g * 255|0+','+screenColor.b * 255|0+','+screenColor.a+');flex:1;';
    },

    convertColor: function (ccColor) {
        return new Object({
            r: ccColor.r/255,
            g: ccColor.g/255,
            b: ccColor.b/255,
            a: ccColor.a/255
        });
    },

    repaint: function () {
        var policy = new cc.ResolutionPolicy(cc.ContainerStrategy.PROPORTION_TO_FRAME, cc.ContentStrategy.EXACT_FIT);
        cc.view.setDesignResolutionSize(this.$.preview.getBoundingClientRect().width, this.$.preview.getBoundingClientRect().height - 2, policy);
    },

    _onResize: function () {
        if (cc.view) {
            this.repaint();
        }
        if (this.emitter) {
            var winSize = this.$.gameCanvas.getBoundingClientRect();
            this.emitter.setPosition(winSize.width / 2,winSize.height / 2);
        }
    },

    _init: function () {
        var _this = this;
        cc.game.onStart = function(){
            _this.repaint();
            this.scene = cc.Scene.extend({
                onEnter:function () {
                    this._super();
                }
            });
            var particleScreen = new this.scene();
            particleScreen.color = cc.color(255,205,0,255);
            cc.director.runScene(new this.scene());
        };
        cc.game.run('gameCanvas');
    },

    setTexure: function(path) {
        if (!this.emitter) {
            return;
        }
        cc.loader.load(path, function () {
            this.emitter.setTexture(cc.textureCache.addImage(path));
        }.bind(this));
    },

    openDialog: function (callback) {
        this.$.loadbtn.addEventListener('change',function (event) {
            if (event.target.files) {
                callback(event.target.files);
            }
        });
        this.$.loadbtn.click();
    },

    _onSetTextureClick: function () {
        this.openDialog(function (event) {
            this.setTexure(event[0].path);
        }.bind(this));
    },

    _startColorChanged: function (event) {
        event.stopPropagation();
        if (this.emitter) {
            this.emitter.startColor = new cc.Color(this._startColor.r * 255|0, this._startColor.g * 255|0, this._startColor.b * 255|0,this._startColor.a * 255|0);
            // this.emitter.startColorVar = new cc.Color(this._startColorVar.r * 255|0, this._startColorVar.g * 255|0, this._startColorVar.b * 255|0,this._startColorVar.a * 255|0);
        }
    },

    _endColorChanged: function (event) {
        event.stopPropagation();
        if (this.emitter) {
            this.emitter.endColor = new cc.Color(this._endColor.r * 255|0, this._endColor.g * 255|0, this._endColor.b * 255|0,this._endColor.a * 255|0);
            // this.emitter.endColorVar = new cc.Color(this._endColorVar.r * 255|0, this._endColorVar.g * 255|0, this._endColorVar.b * 255|0,this._endColorVar.b * 255|0);
        }
    },

    loadPlist: function (path) {
        cc.loader.load(path, function () {
            this.parameters = cc.loader.getRes(path);
            var node = new cc.ParticleSystem(path);
            cc.director._runningScene.removeAllChildren();
            this.emitter = node;

            this._startColor  = this.convertColor(this.emitter.startColor);
            this._startColorVar = this.convertColor(this.emitter.startColorVar);
            this._endColor = this.convertColor(this.emitter.endColor);
            this._endColorVar = this.convertColor(this.emitter.endColorVar);
            console.log(this.emitter.endColorVar);

            cc.director._runningScene.addChild(this.emitter);
        }.bind(this));
    },

    _onCanvasMouseDown: function (event) {
        event.stopPropagation();

        if (!this.emitter) {
            return;
        }

        var mouseMoveHandle = function (event) {
            var x = event.layerX;
            var y = event.target.getBoundingClientRect().height - event.layerY;
            this.emitter.setPosition(x,y);
        }.bind(this);
        mouseMoveHandle.call(this,event);

        event.target.addEventListener ( 'mousemove', mouseMoveHandle );

        event.target.addEventListener('mouseup',function (event) {
            event.target.removeEventListener('mousemove', mouseMoveHandle);
        }.bind(this));
    },
});
