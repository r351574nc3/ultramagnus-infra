FROM r351574nc3/awscdk

LABEL maintainer="Leo Przybylski <r351574nc3 at gmail.com>"

ONBUILD COPY package*json .npmrc* /app/
ONBUILD RUN cd /app && npm install 

# Now copy in the full code for the app
ONBUILD COPY . /app
ONBUILD RUN npm run build && rm -rf node_modules && npm install --production 
    

# Set our workdirectory to the app and start with npm
WORKDIR /app
EXPOSE 3000

CMD ["endpoint.sh"]

