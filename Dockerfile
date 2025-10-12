#pick a base image
FROM nginx:alpine

#copy content from base image from a site folder
COPY /site  /usr/share/nginx/html/

#document port
EXPOSE 80