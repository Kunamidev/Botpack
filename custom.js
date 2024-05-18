const logger = require('./utils/log');
const cron = require('node-cron');

module.exports = async ({ api }) => {
  const minInterval = 5;
  let lastMessageTime = 0;
  let messagedThreads = new Set();

  const config = {
    autoRestart: {
      status: false,
      time: 40,
      note: 'To avoid problems, enable periodic bot restarts',
    },
    acceptPending: {
      status: false,
      time: 30,
      note: 'Approve waiting messages after a certain time',
    },
  };

  function autoRestart(config) {
    if (config.status) {
      cron.schedule(`*/${config.time} * * * *`, () => {
        logger.log('Start rebooting the system!', 'Auto Restart');
        process.exit(1);
      });
    }
  }

  function acceptPending(config) {
    if (config.status) {
      cron.schedule(`*/${config.time} * * * *`, async () => {
        const list = [
          ...(await api.getThreadList(1, null, ['PENDING'])),
          ...(await api.getThreadList(1, null, ['OTHER'])),
        ];
        if (list[0]) {
          api.sendMessage('You have been approved for the queue. (This is an automated message)', list[0].threadID);
        }
      });
    }
  }

  autoRestart(config.autoRestart);
  acceptPending(config.acceptPending);

  // AUTOGREET EVERY 10 MINUTES
  cron.schedule('*/10 * * * *', () => {
    const currentTime = Date.now();
    if (currentTime - lastMessageTime < minInterval) {
      console.log("Skipping message due to rate limit");
      return;
    }
    api.getThreadList(25, null, ['INBOX'], async (err, data) => {
      if (err) return console.error("Error [Thread List Cron]: " + err);
      let i = 0;
      let j = 0;

      async function message(thread) {
        try {
          api.sendMessage({
            body:`🤖 𝖧𝖾𝗅𝗅𝗈 𝗂𝗆 𝗁𝖾𝗋𝗎𝗉𝖺𝖼𝗄 𝗆𝗒 𝗉𝗋𝖾𝖿𝗂𝗑: « - »`
          }, thread.threadID, (err) => {
            if (err) return;
            messagedThreads.add(thread.threadID);

          });
        } catch (error) {
          console.error("Error sending a message:", error);
        }
      }

      while (j < 20 && i < data.length) {
        if (data[i].isGroup && data[i].name != data[i].threadID && !messagedThreads.has(data[i].threadID)) {
          await message(data[i]);
          j++;
          const CuD = data[i].threadID;
          setTimeout(() => {
            messagedThreads.delete(CuD);
          }, 1000);
        }
        i++;
      }
    });
  }, {
    scheduled: false, // Set this to false to turn it off
    timezone: "Asia/Manila"
  });

  // AUTOGREET EVERY 30 MINUTES
  cron.schedule('*/30 * * * *', () => {
    const currentTime = Date.now();
    if (currentTime - lastMessageTime < minInterval) {
      console.log("Skipping message due to rate limit");
      return;
    }
    api.getThreadList(25, null, ['INBOX'], async (err, data) => {
      if (err) return console.error("Error [Thread List Cron]: " + err);
      let i = 0;
      let j = 0;

      async function message(thread) {
        try {
          api.sendMessage({
            body: `𝖧𝖾𝗒 𝗁𝗈𝗐 𝖺𝗋𝖾 𝗒𝗈𝗎, 𝗃𝗎𝗌𝗍 𝗍𝗒𝗉𝖾 -𝗁𝖾𝗅𝗉 𝗍𝗈 𝗌𝖾𝖾 𝗆𝗒 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌 ( ˘ ³˘)♥︎`
          }, thread.threadID, (err) => {
            if (err) return;
            messagedThreads.add(thread.threadID);

          });
        } catch (error) {
          console.error("Error sending a message:", error);
        }
      }


      while (j < 20 && i < data.length) {
        if (data[i].isGroup && data[i].name != data[i].threadID && !messagedThreads.has(data[i].threadID)) {
          await message(data[i]);
          j++;
          const CuD = data[i].threadID;
          setTimeout(() => {
            messagedThreads.delete(CuD);
          }, 1000);
        }
        i++;
      }
    });
  }, {
    scheduled: false, // Set this to false to turn it off
    timezone: "Asia/Manila"
  });
};
