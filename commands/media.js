async function bulkDownload(client, rl) {
  try {
    const query = await rl.questionAsync(colors.blue('Contact/group name: '));
    const chat = await findContact(client, rl, query);
    const outputDir = `media_${chat.name || chat.id.user}_${Date.now()}`.replace(/[^\w]/g, '_');
    
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(colors.yellow(`⏳ Scanning ${chat.name || 'chat'} for media...`));

    let mediaCount = 0;
    let messageCount = 0;
    let lastMessageId = null;
    let processedMessages = new Set(); // Track processed messages

    while (true) {
      const messages = await chat.fetchMessages({ 
        limit: 50, 
        before: lastMessageId 
      });

      // Exit loop if no more messages
      if (messages.length === 0) break;

      // Filter out already processed messages
      const newMessages = messages.filter(msg => !processedMessages.has(msg.id._serialized));
      if (newMessages.length === 0) break;

      for (const msg of newMessages) {
        processedMessages.add(msg.id._serialized);
        messageCount++;

        if (msg.hasMedia) {
          process.stdout.write(`\rProcessing message ${messageCount}...`);
          const success = await downloadMedia(msg, outputDir);
          if (success) mediaCount++;
        }
      }

      // Update last message ID for next batch
      lastMessageId = messages[messages.length - 1].id._serialized;
    }

    console.log(colors.green(`\n✅ Saved ${mediaCount} files to ${outputDir}/`));
  } catch (error) {
    console.log(colors.red(`\n✗ Error: ${error.message}`));
  }
}

// Modified downloadMedia to support output directory
async function downloadMedia(message, outputDir = '.') {
  try {
    let media = await message.downloadMedia();
    if (!media && message.type === 'video') {
      media = await new Promise(resolve => {
        setTimeout(async () => {
          try {
            resolve(await message.downloadMedia());
          } catch {
            resolve(null);
          }
        }, 2000);
      });
    }

    if (!media) throw new Error('Media download failed');

    // Detect file extension
    let extension = 'dat';
    if (media.mimetype) {
      extension = media.mimetype.split('/')[1];
    } else if (message.type === 'document') {
      extension = message.body.split('.').pop() || 'bin';
    } else {
      const typeExtensions = {
        'image': 'jpg',
        'video': 'mp4',
        'sticker': 'webp',
        'audio': 'ogg',
        'ptt': 'ogg'
      };
      extension = typeExtensions[message.type] || 'dat';
    }

    // Generate filename
    const cleanId = message.id.id.replace(/\W/g, '');
    const timestamp = new Date(message.timestamp * 1000).toISOString().replace(/[:.]/g, '-');
    const filename = path.join(outputDir, `media_${timestamp}_${cleanId}.${extension}`);

    fs.writeFileSync(filename, media.data, 'base64');
    console.log(colors.green(`\n✓ Saved ${filename} (${message.type})`));
    return true;
  } catch (error) {
    console.log(colors.yellow(`\n⚠ Could not download ${message.type}: ${error.message}`));
    return false;
  }
}