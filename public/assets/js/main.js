jQuery(document).ready(function ($) {
    $('body').on('valid.bs.validator', function (event) {
        var msv = $('#msv').val();
        if (!msv || msv.length < 8) {
            return;
        }
        loadTimetable();
    });

    var msv = $('#msv').val();
    if (msv != '' && msv.length == 8) {
        loadTimetable();
    }

    $('.form_submit').on('submit', function (e) {
        if ($('.btn_register').hasClass('disabled')) {
            return;
        }
        e.preventDefault();

        var msv = $('#msv').val();
        var email = $('#email').val();
        var name = $('#name').val();
        register(msv, email, name);
    });

    function loadTimetable() {
        var msv = $('#msv').val();
        var url = url_ajax + '/student/' + msv;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (data) {
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
            }
        });
    }

    function register(msv, email, name) {
        var url_ajax_register = url_ajax + '/subscriber';
        var recaptcha = $('.g-recaptcha-response').val();
        $.ajax({
            method: 'POST',
            url: url_ajax_register,
            data: {
                email: email,
                msv: msv,
                name: name,
                'g-recaptcha-response': recaptcha
            },
            dataType: 'json',
            success: function (res) {
                notify(res.err, res.msg)
            }
        });
    }

    function getCountClassUser() {
        $.ajax({
            url: url_ajax + "/count",
            method: 'GET',
            success: function (data) {
                $('#countClass').text(data.class);
                $('#countUser').text(data.user);
            }
        });
    }

    function notify(err, msg) {
        if (err) {
            generate('error', msg);
        } else {
            generate('success', msg);
            $('#msv').val('');
            $('#email').val('');
        }
    }

    function generate(type, msg) {
        var n = noty({
            text: msg,
            type: type,
            dismissQueue: true,
            layout: 'topLeft',
            theme: 'relax',
            closeWith: ['button', 'click'],
            maxVisible: 1,
            modal: false,
            killer: true
        });
    }

    // getCountClassUser();
});