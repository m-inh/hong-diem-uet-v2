(function ($) {
    $(document).ready(function ($) {
        $('body').on('valid.bs.validator', function (event) {
            var msv = $('#msv').val();
            if (!msv || msv.length < 8) {
                return;
            }
            loadTimetable();
        });

        getCountClass();
        getCountUser();

        $('.form_submit').on('submit', function (e) {
            if ($(document).find('.btn_register').hasClass('disabled')) {
                return;
            }
            e.preventDefault();

            var msv = $('#msv').val();
            var email = $('#email').val();
            var name = $('#name').val();
            register(msv, email, name);
        });

        function loadTimetable() {
            $('#timetable').addClass('running');
            var msv = $('#msv').val();
            var url = url_ajax + '/student/' + msv;

            $.ajax({
                url: url,
                method: 'GET',
                success: function (data) {
                    $('#timetable').removeClass('running');

                    if (data.error) {
                        return notify(data.error, data.msg);
                    }

                    var time = data.subject_classes;
                    var nameSV = data.name;
                    var htmlTable = '';
                    for (var i = 0; i < time.length; i++) {
                        var code = time[i].code;
                        var name = time[i].name;
                        var stt = i + 1;

                        htmlTable += '<tr>' +
                            '<td>' + stt + '</td>'
                            + '<td>' + code + '</td>'
                            + '<td>' + name + '</td>'
                            + '</tr>';
                    }

                    $('#name').val(nameSV);
                    $('#timetable tbody').html(htmlTable);
                },
                error: function () {
                    $('#timetable').removeClass('running');
                }
            });
        }

        function register(msv, email, name) {
            var url_ajax_register = url_ajax + '/subscriber';
            var recaptcha = $('.g-recaptcha-response').val();
            var $btn_register = $('.btn_register');
            $btn_register.attr('disabled', true);

            $.ajax({
                method: 'POST',
                url: url_ajax_register,
                data: {
                    email: email,
                    msv: msv,
                    name: name,
                    'recaptcha': recaptcha
                },
                dataType: 'json',
                success: function (res) {
                    notify(res.err, res.msg);
                    $btn_register.attr('disabled', false);
                },
                error: function () {
                    $btn_register.attr('disabled', false);
                    notify(true, "Đã có lỗi gì đó xảy ra! Vui lòng thử lại :)");
                }
            });
        }

        function getCountClass() {
            $.ajax({
                url: url_ajax + "/class/count",
                method: 'GET',
                success: function (res) {
                    $('#countClass').text(res.data.numb_of_class);
                }
            });
        }

        function getCountUser() {
            $.ajax({
                url: url_ajax + "/subscriber/count",
                method: 'GET',
                success: function (res) {
                    $('#countUser').text(res.data.numb_of_subscriber);
                }
            });
        }

        function notify(err, msg) {
            if (err) {
                generateNotification('error', msg);
            } else {
                generateNotification('success', msg);
                $('#msv').val('');
                $('#email').val('');
            }
        }

        function generateNotification(type, msg) {
            var n = noty({
                text: msg,
                type: type,
                dismissQueue: true,
                timeout: 5000,
                layout: 'topLeft',
                theme: 'relax',
                closeWith: ['button', 'click'],
                maxVisible: 1,
                modal: false,
                killer: true
            });
        }
    });
})(jQuery);