exports.handler = async (event) => {
    console.log("Worker received event:", JSON.stringify(event));
    for (const record of event.Records || []) {
      console.log("SQS message:", record.body);
    }
    return { ok: true };
  };