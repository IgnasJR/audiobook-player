cd audiobook-player
docker build -t audiobook-player .
docker push ignasjr/player-frontend
cd ..
cd backend
docker build -t ignasjr/player-backend .
docker push ignasjr/player-backend 