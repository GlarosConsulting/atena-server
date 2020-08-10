FROM node:alpine

RUN mkdir -p /code

WORKDIR /code

ADD . /code

RUN yarn install && \
  yarn prisma generate && \
  #    yarn migrate && \
  yarn build && \
  yarn cache clean

CMD [ "yarn", "start" ]

EXPOSE 3333
