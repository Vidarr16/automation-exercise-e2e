import fs from 'fs/promises';
import path from 'path';

class Logger {
  private logFilePath: string;

  constructor() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const fileName = `test_${day}${month}_${hours}${minutes}.log`;
    // Using process.cwd() to ensure it points to the root, then src/test-data
    this.logFilePath = path.join(process.cwd(), 'src', 'test-data', fileName);
  }

  async log(message: string) {
    console.log(message);
    const timestamp = new Date().toISOString();
    // Ensure directory exists before writing (lazy creation or constructor creation)
    // The snippet had it in constructor, but async in constructor is tricky. 
    // The snippet used synchronous-looking mkdir in constructor or assumed it exists.
    // I'll stick to the snippet's logic but make it robust. 
    // Since mkdir is async in fs/promises, I'll use fs-extra or just ensure it exists in log method or init.
    // Actually, the snippet imported fs from 'fs/promises' but used mkdir without await in the constructor? 
    // No, constructors can't await. I will verify directory existence in the log method or use sync fs for the mkdir in constructor.
    // Let's use `fs.mkdir` (async) in `log` or a proper init method. 
    // However, to keep it simple and follow the class structure:
    try {
        await fs.mkdir(path.dirname(this.logFilePath), { recursive: true });
        await fs.appendFile(this.logFilePath, `[${timestamp}] ${message}\n`);
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
  }
}

export const logger = new Logger();
