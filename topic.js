const rabbit = require('foo-foo-mq');

rabbit.handle({
  queue: "topicExchangeQueue",
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
    { name: 'topicExchange', type: 'topic', autoDelete: true },
    { name: 'dead-letter-exchange-fanout', type: 'fanout', autoDelete: false }
  ],
  queues: [
    { name: 'topicExchangeQueue', autoDelete: true, subscribe: true, deadLetter: "dead-letter-exchange-fanout" },
    { name: 'deadfanoutqueue', autoDelete: false, subscribe: true, deadLetter: "topicExchange", messageTtl:10000 },
  ],
  bindings: [
    { exchange: 'topicExchange', target: 'topicExchangeQueue', keys: ['example.*'] },
    { exchange: 'dead-letter-exchange-fanout', target: 'deadfanoutqueue', keys: [] }
  ]
}).then(
  () => console.log('connected!')
);


rabbit.publish('topicExchange', { type: 'MyMessage',routingKey: "example.test",body: {x:2, y:5} });


setTimeout(() => {
  rabbit.shutdown(true)
},600000);
