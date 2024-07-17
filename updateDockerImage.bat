cd audiobook-player
docker image build -t ignasjr/player-frontend .
docker push ignasjr/player-frontend
cd ..
cd backend
docker build -t ignasjr/player-backend .
docker push ignasjr/player-backend 