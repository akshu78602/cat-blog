# pick a base image
FROM nginx:alpine

# remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

COPY site/ /usr/share/nginx/html/

# show what files are present
RUN ls -la /usr/share/nginx/html

# expose port 80
EXPOSE 80
