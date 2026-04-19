sudo dnf update -y
sudo dnf install nodejs git -y

git clone https://github.com/AbhiDevOps369/cc-blog-app.git
cd cc-blog-app

npm install
nohup node server.js &
