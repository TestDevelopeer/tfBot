(function () {
	let TFB = {
		init: function () {
			this.Basic.init();
		},
		Basic: {
			init: function () {
				this.BotPage.init();
			},
            BotPage: {
                init: function() {
                    this.checkUser();
                },
                checkUser: function() {

                }
            }
		}
	}
	TFB.init();
})();