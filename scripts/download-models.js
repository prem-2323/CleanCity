const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const MODELS = [
  {
    name: 'yolov8n.pt',
    url: 'https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n.pt',
    required: true,
  },
  {
    name: 'yolov8n-trash-cls.pt',
    url: null,
    required: false,
    info: 'Custom trained model — use `npm run train:yolo-cls` to generate it',
  },
];

const weightsDir = path.join(__dirname, '..', 'ai-models', 'weights');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlinkSync(dest);
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  fs.mkdirSync(weightsDir, { recursive: true });

  for (const model of MODELS) {
    const dest = path.join(weightsDir, model.name);
    if (fs.existsSync(dest)) {
      console.log(`  [SKIP] ${model.name} already exists`);
      continue;
    }

    if (model.url) {
      console.log(`  [DL]   ${model.name}...`);
      try {
        await download(model.url, dest);
        console.log(`  [OK]   ${model.name}`);
      } catch (err) {
        console.error(`  [FAIL] ${model.name}: ${err.message}`);
        if (model.required) process.exitCode = 1;
      }
    } else {
      console.log(`  [INFO] ${model.name} — ${model.info}`);
    }
  }
}

main();
