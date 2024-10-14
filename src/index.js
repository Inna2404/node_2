const path = require("path");
const fs = require("fs");
const { argv } = require("process");

const readLine = require("readline");
const { cpus, EOL, homedir, userInfo, arch } = require("os");
const readLin = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

const usernameArg = argv.find((arg) => arg.startsWith("--username="));
const username = usernameArg ? usernameArg.split("=")[1] : "User";

console.log(`Welcome to the File Manager, ${username}`);
console.log(`You are currently in ${process.cwd()}`);

readLin.on("line", (input) => {
  handleCommand(input);
});
readLin.on("close", () => {
  console.log(`Thank you for using File Manager, ${username}, goodbye`);
});

function handleCommand(command) {
  if (command.trim() === ".exit") {
    readLin.close();
    return;
  }

  const [operation, ...args] = command.split(" ");

  try {
    switch (operation) {
      case "up":
        const parentPath = path.resolve(process.cwd(), "..");
        if (parentPath !== process.cwd()) {
          process.chdir(parentPath);
        }
        break;

      case "cd":
        if (args[0]) {
          process.chdir(args[0]);
        } else {
          console.log("Invaliad input");
        }

        break;

      case "ls":
        fs.readdir(process.cwd(), { withFileTypes: true }, (err, files) => {
          if (err) {
            console.log("Operation falied");
          } else {
            const fileDetail = files.map((file) => {
              return {
                name: file.name,
                type: file.isDirectory() ? "directory" : "file"
              };
            });

            fileDetail.sort((a, b) => {
              if (a.type === b.type) {
                return a.name.localeCompare(b.name);
              }
              return a.type === "directory" ? -1 : 1;
            });

            fileDetail.forEach((fileDet, i) => {
              console.log(`${i}  ${fileDet.name}      '${fileDet.type}'`);
            });
          }
        });
        return;

      case "cat":
        if (args[0]) {
          const filePath = path.resolve(process.cwd(), args[0]);
          const readStream = fs.createReadStream(filePath);

          readStream.on("error", () => {
            console.log("Operation falied");
          });
          readStream.pipe(process.stdout);
        } else {
          console.log("Invalid input");
        }
        return;

      case "add":
        if (args[0]) {
          const filePath = path.resolve(process.cwd(), args[0]);
          fs.writeFile(filePath, "", (err) => {
            if (err) {
              console.log("Operation falied");
            } else {
              console.log(`File ${args[0]} created`);
            }
          });
        } else {
          console.log("Ivalid input");
        }
        return;
      case "rn":
        if (args[0] && args[1]) {
          const oldPath = path.resolve(process.cwd(), args[0]);
          const newPath = path.resolve(process.cwd(), args[1]);
          fs.rename(oldPath, newPath, (err) => {
            if (err) {
              console.log("Operation falied");
            } else {
              console.log(`File renamed from from ${args[0]} to ${args[1]}`);
            }
          });
        } else {
          console.log("Invalid input");
        }
        break;

      case "cp":
        if (args[0] && args[1]) {
          const sourcePath = path.resolve(process.cwd(), args[0]);
          const destPath = path.resolve(process.cwd(), args[1]);
          const readStream = fs.createReadStream(sourcePath);
          const writeStream = fs.createWriteStream(destPath);

          readStream.on("error", () => {
            console.log("Operation falied");
          });
          readStream.pipe(writeStream);
          writeStream.on("finish", () => {
            console.log(`File copy from ${args[0]} to ${args[1]}`);
          });
        } else {
          console.log("Invalid input");
        }

        break;

      case "mv":
        if (args[0] && args[1]) {
          const sourcePath = path.resolve(process.cwd(), args[0]);
          const destPath = path.resolve(process.cwd(), args[1]);
          const readStream = fs.createReadStream(sourcePath);
          const writeStream = fs.createWriteStream(destPath);

          readStream.on("error", () => {
            console.log("Operation falied");
          });

          readStream.pipe(writeStream);
          writeStream.on("finish", () => {
            fs.unlink(sourcePath, (err) => {
              if (err) {
                console.log("Operation falied");
              } else {
                console.log(`File copy from ${args[0]} to ${args[1]}`);
              }
            });
          });
        } else {
          console.log("Invalid input");
        }
        break;

      case "rm":
        if (args[0]) {
          const filePath = path.resolve(process.cwd(), args[0]);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log("Operation falied");
            } else {
              console.log(`File ${args[0]} deleted`);
            }
          });
        } else {
          console.log("Invalid input");
        }
        break;

      case "os":
        if (args[0] === "--EOL") {
          console.log(`EOL: ${EOL}`);
        } else if (args[0] === "--cpus") {
          const cups = cpus();
          console.log(`Total CPUs: ${cpus.length}`);
          cups.forEach((cpu, i) => {
            console.log(`CPU ${i + 1}: ${cpu.model}, ${cpu.speed / 1000} GHz`);
          });
        } else if (args[0] === "--homedir") {
          console.log(`Home Directory: ${homedir()}`);
        } else if (args[0] === "--username") {
          console.log(`Current User: ${userInfo().username}`);
        } else if (args[0] === "--architecture") {
          console.log(`Architecture: ${arch()}`);
        } else {
          console.log("Invalid input");
        }
        return;

      default:
        console.log("Invalid input");
        return;
    }
  } catch (error) {
    console.log("Operation falied");
  }
  console.log(`You are currently in ${process.cwd()}`);
}
