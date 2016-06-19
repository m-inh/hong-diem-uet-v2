jQuery(document).ready(function ($) {
    $('body').on('valid.bs.validator', function (event) {
        var x = event.relatedTarget.outerHTML;
        if (x.indexOf('id="msv"') >= 0) {
            loadTimetable();
        }
    });

    var msv = $('#msv').val();
    if (msv != '' && msv.length == 8) {
        loadTimetable();
    }

    $('.form_submit').on('submit', function (e) {
        e.preventDefault();

        var msv = $('#msv').val();
        var email = $('#email').val();
        register(msv, email);
    });

    function loadTimetable() {
        var msv = $('#msv').val();
        var url = url_ajax + '/getInfor?msv=' + msv;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (data) {
                var time = data.timetable;
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

    function register(msv, email) {
        var url_ajax_register = url_ajax + '/register';
        var recaptcha = $('.g-recaptcha-response').val();
        $.ajax({
            method: 'POST',
            url: url_ajax_register,
            data: {
                email: email,
                msv: msv,
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

    getCountClassUser();
});