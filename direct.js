const rabbit = require('foo-foo-mq');

rabbit.handle({
  queue: "directExchangeQueue",
  type:'MyMessage'
},(msg) => {
   let x = Math.floor(Math.random() * 10);
   console.log("x", x)
  if(x < 5){
    console.log("ack", x)
    msg.ack();
  }else{
    console.log("requeue message", x)
    msg.reject()
  }
});


rabbit.configure({ 
  connection: {
    name: 'default',
    user: 'guest',
    pass: 'guest',
    host: 'localhost',
    port: 5672,
    vhost: '%2f',
    replyQueue: 'customReplyQueue'
  },
  exchanges: [
    { name: 'directExchange', type: 'direct', autoDelete: true },
    { name: 'dead-letter-exchange-direct', type: 'direct', autoDelete: false }
  ],
  queues: [
    { name: 'directExchangeQueue', autoDelete: true, subscribe: true, deadLetter: "dead-letter-exchange-direct" },
    { name: 'deaddirectqueue', autoDelete: false, subscribe: true, deadLetter: "directExchange", messageTtl:10000 },
  ],
  bindings: [
    { exchange: 'directExchange', target: 'directExchangeQueue', keys: ["key"] },
    { exchange: 'dead-letter-exchange-direct', target: 'deaddirectqueue', keys: ["key"] }
  ]
}).then(
  () => console.log('connected!')
);


rabbit.publish('directExchange', { type: 'MyMessage', routingKey: "key",body: {x:2, y:5} });


setTimeout(() => {
  rabbit.shutdown(true)
},600000);
