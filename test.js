/**
 * Created by TooNies1810 on 6/17/16.
 */
// using SendGrid's Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// var api_key_sendgrid = "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";
// var sendgrid = require("sendgrid");
// sendgrid(api_key_sendgrid);
// var email = new sendgrid.Email();
//
// email.addTo("tienminh.uet@gmail.com");
// email.setFrom("you@youremail.com");
// email.setSubject("Sending with SendGrid is Fun");
// email.setHtml("and easy to do anywhere, even with Node.js");
//
// sendgrid.send(email);

function sendEmailActive(name, from, to, linkActive) {

    var helper = require('sendgrid').mail;
    from_email = new helper.Email(from);
    to_email = new helper.Email(to);
    subject = "Xác nhận tài khoản";

    var content_html = "Xin chào " + name + "<br>" + "<br>" +
        "Chỉ còn 1 bước nữa là xong. Hãy click vào link dưới đây để hoàn tất." + "<br>" +
        "Link: " +
        "<a" + "href=" + linkActive + ">" + linkActive + "</a>" + "<br>" + "<br>" +
        "<strong>" + "Nếu không phải bạn hãy bỏ qua email này. " + "</strong>" +
        "Thân chào và quyết thắng!" + "<br>" +
        "Fries Team.";

    content = new helper.Content("text/html", content_html);
    mail = new helper.Mail(from_email, subject, to_email, content);

    var sg = require('sendgrid').SendGrid("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");
    var requestBody = mail.toJSON();
    var request = sg.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/mail/send';
    request.body = requestBody;
    sg.API(request, function (response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    });
}

sendEmailActive("Nguyễn Tiến Minh", "fries.uet@gmail.com", "minhnt_58@vnu.edu.vn", "blogk.xyz");