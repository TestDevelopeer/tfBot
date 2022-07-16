(function () {
	let TFB = {
		init: function () {
			this.Basic.init();
		},
		Basic: {
			init: function () {
				this.LicPage.init();
				this.BotPage.init();
			},
			LicPage: {
				init: function () {
					this.clickListener();
				},
                clickListener: function () {
                    $(document).on('click', '#send', function(){
                        let licKey = $('#lickey').val();
                        if (licKey !== '' && licKey.length > 0) {
                            $.ajax({
                                type: 'POST',
                                async: true,
                                url: "http://localhost:5001/init",
                                dataType: 'json',
                                data: {licKey},
                                success: function (data) {
                                    if (data.success === 1) {
                                        $('#userTitle').html(data.user.user_name);
                                        $('#licTitle').html(`Expire date ${data.user.user_date}`);
                                        $('#licForm').hide();
                                        $('#botButton').removeClass('hidden');
                                    } else {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: data.error
                                        });
                                    }
                                }
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Invalid lic key'
                            });
                        }
                    })
                }
			},
            BotPage: {
                init: function() {
                    this.startBot();
                },
                startBot: function() {
                    $(document).on('click', '#start', function(){
                        $.ajax({
                            type: 'POST',
                            async: true,
                            url: "http://localhost:5001/start",
                            dataType: 'json',
                            success: function (data) {
                                if (data.success === 1) {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Attention!',
                                        html: `
                                            <h4 style='color: orange'>DO NOT CLOSE THE PROGRAM WINDOW!</h4>
                                            <p>For convenience, you can minimize the window!</p>
                                            <p style='color: red'>Bot management:</p>
                                            <p>Open the game, open a flea market</p>
                                            <p>Clear all filters near the gear</p>
                                            <p>Press <b>L Alt + A</b> to start the bot</p>
                                            <p>Press <b>L Alt + S</b> to stop the bot</p>
                                        `,
                                        allowOutsideClick: false,
                                        confirmButtonText: 'OK'
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: data.error
                                    });
                                }
                            }
                        });
                    })
                }
            }
		}
	}
	TFB.init();
})();