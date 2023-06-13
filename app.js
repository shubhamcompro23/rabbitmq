const rabbit = require('foo-foo-mq');

rabbit.handle({
  queue: "q.1.2",
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
    { name: 'ex.1.2', type: 'direct', autoDelete: true },
    { name: 'dead-letter-exchange-1', type: 'fanout', autoDelete: false }
  ],
  queues: [
    { name: 'q.1.2', autoDelete: true, subscribe: true, deadLetter: "dead-letter-exchange-1" },
    { name: 'deadqueue1', autoDelete: false, subscribe: true, deadLetter: "ex.1.2", messageTtl:6000 },
  ],
  bindings: [
    { exchange: 'ex.1.2', target: 'q.1.2', keys: ["key"] },
    { exchange: 'dead-letter-exchange-1', target: 'deadqueue1', keys: [] }
  ]
}).then(
  () => console.log('connected!')
);


rabbit.publish('ex.1.2', { type: 'MyMessage', routingKey: "key",body: {x:2, y:5} });


setTimeout(() => {
  rabbit.shutdown(true)
},60000);
