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
});