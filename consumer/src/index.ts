import mongoose from 'mongoose';
const amqp = require('amqplib/callback_api');
const Memcached = require('memcached');
const memcached = new Memcached();


import { News as NewsSchema } from './models/news.model';
const News = mongoose.model('News', NewsSchema);

async function checkForCacheAndSave(titles: string[]) {
  await memcached.get(titles.toString(), function( err: any, data: any ) {
    if (!data) {
      memcached.set(titles.toString(), titles, 10000, function (err: any) {
        if(err) throw new err;
      });
    }
    console.log(data);
  });
}

async function startUp() {
  const memcached = new Memcached();
  memcached.connect( 'localhost:11211', function( err: any, conn: any ) {
    if (err) {
      console.log(conn.server, 'error while memcached connection!!');
    }
  });

  await mongoose.connect('mongodb://127.0.0.1:27017/psi');
  amqp.connect('amqp://localhost', {}, function(error0: any, connection: any) {
    if (error0) {
      console.log(error0);
      throw error0;
    }
    connection.createChannel(function(error1: any, channel: any) {
      if (error1) { throw error1; }

      const queue = 'scrapper';
      channel.assertQueue(queue, { durable: false });
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

      channel.consume(queue, async function(msg: any) {
        console.log(" [x] Received %s", msg.content.toString());
        const message = msg.content.toString();

        memcached.get(message, async function( err: any, data: any ) {
          if (err) { console.log(err); }
          if (!data) {
            memcached.set(message, message, 10000, function (err: any) { if(err) throw new err; });

            const scrapperData = JSON.parse(message);
            await checkForCacheAndSave(scrapperData);
            for (const title of scrapperData) {
              const existingNews = await News.findOne({title});
              if (existingNews) { continue; }

              await News.create({title});
            }
          } else {
            console.log('Already in cache');
          }
        });
      }, {
        noAck: true
      });

    });
  });
}

startUp().then();
