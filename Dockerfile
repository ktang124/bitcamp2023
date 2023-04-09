FROM nikolaik/python-nodejs:python3.11-nodejs16-slim

WORKDIR /app

COPY requirements.txt .

#RUN python3 -m site   --user-base
RUN pip3 install -r requirements.txt

COPY package.json package-lock.json ./

#RUN npm ci
COPY . .
#RUN npm run build
CMD [ "gunicorn", "app:app"]

#CMD [ "npm", "start" ]
EXPOSE 3000
EXPOSE 8000
