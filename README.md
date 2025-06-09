# Eproject

## Cấu trúc thư mục Frontend

Phần frontend của dự án được phát triển sử dụng Vite và React. Cấu trúc thư mục :

Phần frontend của dự án được phát triển sử dụng Vite và React. Cấu trúc thư mục :

```text
frontend/
├── public/                   # Chứa các tài sản tĩnh được phục vụ trực tiếp (ví dụ: favicon.ico, images không cần xử lý)
├── src/                      # Thư mục chứa mã nguồn chính của ứng dụng frontend
│   ├── assets/               # Chứa các tài sản như ảnh, icon, font chữ cần được import và xử lý bởi bundler
│   ├── components/           # Chứa các UI component nhỏ, có thể tái sử dụng trên nhiều trang (ví dụ: Button, Card, Header, Footer, Slider)
│   ├── context/              # Chứa các file liên quan đến React Context API hoặc các giải pháp quản lý trạng thái toàn cục khác (Redux, Zustand)
│   ├── layouts/              # Định nghĩa các bố cục chung cho các nhóm trang (ví dụ: AdminLayout, UserLayout, AuthLayout)
│   ├── pages/                # Chứa các component đại diện cho từng trang hoàn chỉnh của ứng dụng (ví dụ: HomePage, ProductPage, LoginPage)
│   ├── App.jsx               # Component gốc của ứng dụng, thường chứa cấu hình định tuyến (routing) chính
│   ├── index.css             # File CSS toàn cục hoặc điểm nhập cho các file CSS/SCSS khác
│   └── main.jsx              # Điểm vào (entry point) của ứng dụng React, nơi ReactDOM render component App vào DOM
├── .gitignore                # Danh sách các file và thư mục được Git bỏ qua, không theo dõi
├── index.html                # File HTML gốc cho ứng dụng Single Page Application (SPA)
├── package.json              # Chứa metadata của dự án (tên, phiên bản), danh sách các dependencies và scripts (dev, build, test)
├── package-lock.json         # Tự động tạo, ghi lại phiên bản chính xác của từng dependency, đảm bảo môi trường build nhất quán
└── vite.config.js            # File cấu hình cho Vite, công cụ build và development server


## Hướng dẫn cài đặt và chạy dự án

### Yêu cầu
* Node.js (khuyến nghị phiên bản LTS mới nhất)
* npm hoặc yarn

### Frontend
Di chuyển vào thư mục frontend:
   cd frontend
Cài đặt các dependencies:
npm install
# hoặc
# yarn install
Chạy development server:
npm run dev
# hoặc
# yarn dev

# Thêm file README.md vào staging area: 
git add README.md
# Đẩy các thay đổi lên git:
git add .
# Commit thay đổi:
git commit -m "Cập nhật README với cấu trúc thư mục frontend chi tiết"
# Đẩy lên GitHub:
git push origin master  # Hoặc main nếu không phải là master
