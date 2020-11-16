var TaskRunner = require('concurrent-tasks');

const runner = new TaskRunner();

function generateTasks() {
    const tasks = [];
    let count = 10;
    let interval;
    while (count) {
        tasks.push(done => {
            setTimeout(() => {
                // 1 ile 10 aralığı (ms)
                interval = Math.floor(Math.random() * 10) + 1;
                // (dk)
                interval = interval * 1000 * 60;
                //interval = Math.random() * 100000;
                console.log("interval : " + interval / 1000 /60 + " dk");
                work().then(() => {
                    done();
                });
            }, interval);
        });
        count--;
    }
    return tasks;
}

function work() {
    return new Promise((resolve, reject) => {
        console.log("Working ...");
        resolve();
    });
}

runner.addMultiple(generateTasks());
runner.setConcurrency(2);