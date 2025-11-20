// this will run inside the mongo-setup container
// This script will wait for the replica set to be ready and then initiate it.

config = {
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
};

print("Checking replica set status...");

try {
  // nitiate the replica set
  rs.initiate(config);
  print("Replica set initiated.");
} catch (e) {
  // If it's already initiated, this will fail.
  // Check if the error is "already initialized"
  if (e.code === 23) { // 23 is the error code for "already initialized"
    print("Replica set already initialized.");
  } else {
    // If it's another error, re-throw it
    print("Error initiating replica set:");
    printjson(e);
    throw e;
  }
}

print("Waiting for replica set to have a primary...");

// Wait for a primary to be elected
while (true) {
  let status = rs.status();
  let primary = status.members.find(m => m.stateStr === "PRIMARY");
  if (primary) {
    print("Primary found at:", primary.name);
    break;
  }
  print("No primary yet, sleeping for 1 second...");
  sleep(1000);
}

print("Replica set is ready!");