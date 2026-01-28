const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fakeIO(name, ms, failRate = 0.0) {
  return new Promise(async (resolve, reject) => {
    await sleep(ms);

    const shouldFail = Math.random() < failRate;
    if (shouldFail) {
      return reject(new Error(`[${name}] failed (simulated)`));
    }

    resolve({
      name,
      durationMs: ms,
      timestamp: new Date().toISOString(),
    });
  });
}

// 1) Promises: then / catch / finally + chaining
function demoPromiseChain() {
  console.log("\n=== 1) Promise chain (then / catch / finally) ===");

  return fakeIO("step-1", 300)
    .then((result1) => {
      console.log("success:", result1);
      return fakeIO("step-2", 250);
    })
    .then((result2) => {
      console.log("success:", result2);
      return "final result from promise chain";
    })
    .catch((error) => {
      console.error("error in chain:", error.message);

      return "chain recovered with fallback";
    })
    .finally(() => {
      console.log("finally: always executed");
    });
}

// 2) async / await with try / catch
async function demoAsyncAwait() {
  console.log("\n=== 2) async / await (try / catch) ===");

  try {
    const result1 = await fakeIO("await-1", 200);
    console.log("success:", result1);

    const result2 = await fakeIO("await-2", 200);
    console.log("success:", result2);

    return "final result from async/await";
  } catch (error) {
    console.error("error in async/await:", error.message);
    return "async/await fallback result";
  }
}

// 3) Parallel execution: Promise.all
async function demoParallelAll() {
  console.log("\n=== 3) Parallel execution with Promise.all ===");

  const start = Date.now();

  const tasks = [fakeIO("A", 400), fakeIO("B", 300), fakeIO("C", 200)];

  const results = await Promise.all(tasks);

  console.log(
    "results:",
    results.map((r) => r.name),
  );
  console.log("elapsed(ms):", Date.now() - start);
}

// 4) Collect results without failing fast: Promise.allSettled
async function demoAllSettled() {
  console.log("\n=== 4) Promise.allSettled (success + failure) ===");

  const tasks = [
    fakeIO("S1", 200, 0.0),
    fakeIO("S2", 250, 0.7),
    fakeIO("S3", 150, 0.2),
  ];

  const settledResults = await Promise.allSettled(tasks);

  for (const result of settledResults) {
    if (result.status === "fulfilled") {
      console.log("fulfilled:", result.value.name);
    } else {
      console.log("rejected:", result.reason.message);
    }
  }
}

// 5) First one wins: Promise.race
async function demoRace() {
  console.log("\n=== 5) Promise.race (first to finish) ===");

  const winner = await Promise.race([fakeIO("slow", 400), fakeIO("fast", 120)]);

  console.log("winner:", winner.name);
}

// 6) Timeout using Promise.race
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms),
    ),
  ]);
}

async function demoTimeout() {
  console.log("\n=== 6) Timeout (Promise.race + timer) ===");

  try {
    const result = await withTimeout(fakeIO("operation", 500), 250);
    console.log("success:", result);
  } catch (error) {
    console.error("timeout/error:", error.message);
  }
}

(async function main() {
  console.log("POC: Promises & async/await - Node.js");

  const chainResult = await demoPromiseChain();
  console.log("chain return:", chainResult);

  const asyncAwaitResult = await demoAsyncAwait();
  console.log("async/await return:", asyncAwaitResult);

  await demoParallelAll();
  await demoAllSettled();
  await demoRace();
  await demoTimeout();

  console.log("\nDone ✅");
})();
