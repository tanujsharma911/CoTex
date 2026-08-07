FROM nginx:alpine

COPY ./services/load-balancer/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]