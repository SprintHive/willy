/**
 * Group all the common cluster related commands together.
 */

// These are the clusters we can change to and list
const clusters = [{
  name: 'gke_fabric8-157510_europe-west1-b_demoware',
  command: 'changeClusterToFabric8',
  description: 'Change to the Google demo cluster'
},{
  name: 'gke_playpen-170107_europe-west2-a_nodestack',
  command: 'changeClusterToPlaypen',
  description: 'Change to the Google play pen cluster'
},{
  name: 'dev.wesbank.ekyc.co.za',
  command: 'changeClusterToWesbank',
  description: 'Change to the Wesbank cluster'
},{
  name: 'minikube',
  command: 'changeClusterToMinikube',
  description: 'Change to your minikube cluster'
}]

module.exports = function init({willy, utils}) {
  const {chalk, execCmdNoNewLines} = utils;

  async function whichCluster() {
    const cmd = 'kubectl config current-context';
    const { out } = await execCmdNoNewLines(cmd);
    return {cluster: out}
  }

  async function connectToCluster(name) {
    const cmd = `kubectl config use-context ${name}`;
    const { out } = await execCmdNoNewLines(cmd);
    return {cluster: out}
  }

  clusters.forEach(({name, command, description}) => {
    willy
      .command(command, description)
      .action(async function (args, callback) {
        await connectToCluster(name);
        let {cluster} = await whichCluster();
        console.log(chalk.green(`You are now connected to the "${cluster}" cluster`));
        callback();
      });
  })

  willy
    .command("listClusters", "List all available clusters")
    .action(async function (args, callback) {
      clusters.forEach(c => {
        console.log(chalk.green(c.name));
      })
      callback();
    });

  willy
    .command('whichCluster', 'Check what cluster kubectl is connected to.')
    .action(async function (args, callback) {
      const {cluster} = await whichCluster();
      console.log(`You are currently connected to the ${chalk.blue(cluster)} cluster`);
      callback();
    });
}

