#pick a base image
FROM nginx:alpine

#remove default nginx page
RUN rm -rf /usr/share/nginx/html/

#copy content from base image from a site folder
COPY /site  /usr/share/nginx/html/

#show what files are present 
RUN ls -la /usr/share/nginx/html

#document port
EXPOSE 80