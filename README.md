1) sudo apt update -y
2) curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash
3) sudo apt update nodejs git -y 4) git clone https://github.com/StromBreaker2/blog.git
5)cd blog
6)nano .env
7)MONGO_URI=mongodb+srv://arkfilmers_db_user:12345@cluster0.8nshzyu.mongodb.net/?appName=Cluster0/products?retryWrites=true&w=majority
    PORT=3000
8)npm install
9)nohup node server.js &

