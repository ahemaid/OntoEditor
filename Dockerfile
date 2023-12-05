# Build the frontend 
FROM node:latest as build

# Build application
RUN mkdir /home/project
WORKDIR /home/project
RUN git clone  https://github.com/ahemaid/OntoEditor \
&&  chmod u+x  .
WORKDIR /home/project/OntoEditor
RUN npm install

EXPOSE 5000
EXPOSE 8080

ENV PORT=5000
CMD [ "npm", "start"]


