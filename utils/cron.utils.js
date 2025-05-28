import cron from 'node-cron';

// Storage for all registered cron jobs
const registeredJobs = new Map();

export const registerCronJob = (name, schedule, task, options = {}) => {
    try {
        if (registeredJobs.has(name)) {
        console.warn(`Cron job "${name}" already exists and will be replaced.`);
        registeredJobs.get(name).stop();
        }

        // Validate cron expression
        if (!cron.validate(schedule)) {
        throw new Error(`Invalid cron schedule expression: ${schedule}`);
        }

        const job = cron.schedule(schedule, task, options);
        registeredJobs.set(name, job);
        
        console.log(`Cron job "${name}" registered with schedule: ${schedule}`);
        return true;
    } catch (error) {
        console.error(`Failed to register cron job "${name}":`, error);
        return false;
    }
};

export const getCronJob = (name) => {
    return registeredJobs.get(name) || null;
};

export const stopCronJob = (name) => {
    const job = registeredJobs.get(name);
    if (job) {
        job.stop();
        console.log(`Cron job "${name}" stopped`);
        return true;
    }
    return false;
};

export const startAllJobs = () => {
    registeredJobs.forEach((job, name) => {
        job.start();
        console.log(`Cron job "${name}" started`);
    });
};

export const stopAllJobs = () => {
    registeredJobs.forEach((job, name) => {
        job.stop();
        console.log(`Cron job "${name}" stopped`);
    });
}; 