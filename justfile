test: 
  cd frontend && npm run test:run
  cd backend && npm run test:run

build:
  cd frontend && npm run build
  cd backend && npm run build

lint:
  cd frontend && npm run lint
  cd backend && npm run lint