import amqp from 'amqplib';

let connection = null;
let channel = null;

const QUEUE_NAME = 'book_image_processing';

export const connectRabbitMQ = async () => {
  if (connection && channel) return channel;

  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();
    
    // check if the queue exists
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    console.log("✅ Connected to RabbitMQ");
    return channel;
  } catch (error) {
    console.error("❌ RabbitMQ Connection Error:", error);
    throw error;
  }
};

// producer (sends message)
export const sendToQueue = async (data) => {
  const ch = await connectRabbitMQ();
  const message = JSON.stringify(data);
  ch.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });
  console.log(`📤 Sent to RabbitMQ:`, data);
};

// worker (consumes messages)
export const consumeQueue = async (callback) => {
  const ch = await connectRabbitMQ();
  console.log(`👀 Waiting for messages in ${QUEUE_NAME}...`);
  
  ch.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      console.log(`📥 Received:`, content);
      
      try {
        await callback(content);
        ch.ack(msg); // acknowledge success and removes the message from the queue
      } catch (error) {
        console.error("Error processing message:", error);
        // ch.nack(msg);
      }
    }
  });
};