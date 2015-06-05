Editor.registerPanel( 'cocos-particle-editor.panel', {
    is: 'cocos-particle-editor',

    properties: {
        menuTab: {
            type: String,
            notify: true,
            value: 0
        }
    },

    listeners: {
        'resize': '_onResize',
    },

    _select: function () {
        this.menuTab = this.$.tabs.selected;
    },

    created: function () {
        this.emitter = null;
    },

    ready: function () {
        this.$.gameCanvas.onloaded = function () {
            alert('load');
        };
    },

    attached: function () {
        this._preview();
    },

    repaint: function () {
        var policy = new cc.ResolutionPolicy(cc.ContainerStrategy.PROPORTION_TO_FRAME, cc.ContentStrategy.EXACT_FIT);
        cc.view.setDesignResolutionSize(320, this.$.preview.getBoundingClientRect().height - 2, policy);
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

    _preview: function () {
        var _this = this;
        cc.game.onStart = function(){
            _this.repaint();
            var MyScene = cc.Scene.extend({
                onEnter:function () {
                    this._super();
                    var winSize = _this.$.gameCanvas.getBoundingClientRect();
                    _this.emitter = cc.ParticleMeteor.create();
                    _this.emitter.setPosition(winSize.width / 2,winSize.height / 2);
                    _this.emitter.setSpeed(150);
                    _this.emitter.setTexture(cc.textureCache.addImage(Editor.url("packages://cocos-particle-editor/panel/test.png")));
                    if(_this.emitter.setShapeType)
                    _this.emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);
                    this.addChild(_this.emitter);
                }
            });
            var particleScreen = new MyScene();
            particleScreen.color = cc.color(255,205,0,255);
            cc.director.runScene(new MyScene());
        };
        cc.game.run('gameCanvas');
    },

    setTexure: function(path) {
        this.emitter.setTexture(cc.textureCache.addImage(path));
    },

    _loadFile: function (event) {
        if (event.target.files) {
            var path = event.target.files[0].path;
            this.setTexure(path);
        }
    },
});
