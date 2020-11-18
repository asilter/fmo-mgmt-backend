var TaskRunner = require('concurrent-tasks');

const runner = new TaskRunner();

function generateTasks() {
    const tasks = [];
    let count = 10;
    let interval;
    while (count) {
        tasks.push(done => {
            setTimeout(() => {
                // 1 between 10 interval in ms
                interval = Math.floor(Math.random() * 10) + 1;
                // minutes transformation
                interval = interval * 1000 * 60;
                console.log("interval : " + interval / 1000 / 60 + " dk");
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