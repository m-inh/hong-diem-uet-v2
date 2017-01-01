'use strict';

const from = 'fries.uet@gmail.com';

module.exports.sendEmailActive = (to, name, linkActive) => {

    let helper = require('sendgrid').mail;
    let from_email = new helper.Email(from);
    let to_email = new helper.Email(to);
    let subject = "Xác nhận tài khoản";

    let content_html = "Xin chào " + name + "<br>" + "<br>" +
        "Chỉ còn 1 bước nữa là xong. Hãy click vào link dưới đây để hoàn tất." + "<br>" +
        "Link: " +
        "<a" + " href=" + linkActive + ">" + linkActive + "</a>" + "<br>" +
        "<strong>" + "Nếu không phải bạn hãy bỏ qua email này. " + "</strong>" +
        "Thân chào và quyết thắng!" + "<br>" +
        "Fries Team.";

    let content = new helper.Content("text/html", content_html);
    let mail = new helper.Mail(from_email, subject, to_email, content);

    let sg = require('sendgrid').SendGrid(process.env.SG_KEY);
    let requestBody = mail.toJSON();
    let request = sg.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/mail/send';
    request.body = requestBody;

    return new Promise((resolve, reject) => {
        sg.API(request, function (response) {
            if (response.statusCode == 202) {
                resolve('Send email success');
            } else {
                reject('Something went wrong');
            }
        });
    });
};

module.exports.sendNotiEmail = function (userInfo) {
    let name = userInfo.name;
    let to = userInfo.email;
    let nameClass = userInfo.class_name;
    let links = userInfo.link;

    let from = 'fries.uet@gmail.com';
    let helper = require('sendgrid').mail;
    let from_email = new helper.Email(from);
    let to_email = new helper.Email(to);
    let subject = "Thông báo có điểm " + nameClass.trim();
    if (subject.length > 50) {
        subject = subject.substring(0, 50) + " ...";
    }

    let link_html = '<a href="' + links + '" target="_blank">' + links + '</a>' + '<br>';

    let content_html = "Xin chào " + name + "<br>" + "<br>" +
        "Đã có điểm của môn " + "<strong>" + nameClass + "</strong>" + " :" + "<br>" +
        "Link: " + link_html +
        "Chúc bạn một ngày vui vẻ :d" + "<br>" +
        "Fries Team.";

    let content = new helper.Content("text/html", content_html);
    let mail = new helper.Mail(from_email, subject, to_email, content);

    let sg = require('sendgrid').SendGrid(process.env.SG_KEY);
    let requestBody = mail.toJSON();
    let request = sg.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/mail/send';
    request.body = requestBody;

    return new Promise((resolve, reject) => {
        sg.API(request, function (response) {
            if (response.statusCode == 202) {
                resolve('Gui email thanh cong');
            } else {
                reject('Gui email that bai ' + JSON.stringify(userInfo));
            }
        });
    });
}