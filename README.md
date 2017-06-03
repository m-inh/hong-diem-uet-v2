# Hóng điểm thi UET

Tool hóng điểm thi viết bằng NodeJS, sử dụng MongoDB làm cơ sở dữ liệu, dịch vụ gửi mail SendGrid

Mỗi khi có lớp học được công bố điểm, hệ thống sẽ gửi một email thông báo tới người dùng đăng kí (subscriber)

Demo: [tại đây](http://hongdiem.uetf.tk/)

## Sử dụng tool
Bạn cần cài đặt môi trường chạy NodeJS, MongoDB và một API key của SendGrid

### Tạo tệp `.env` ở thư mục gốc
Tệp `.env` chứa các thông tin config cơ bản của hệ thống
```
HOST_NAME = localhost
PORT = 3000
MONGODB_URI = localhost:27017/uet
SG_KEY = bla.bla
```

### Crawl dữ liệu sinh viên
```
npm run crawl
```

### Chạy tool
Gõ câu lệnh dưới đây vào cửa sổ dòng lệnh
```
npm start
```
