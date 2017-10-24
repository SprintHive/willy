/**
 * Group all the common pod related commands together.
 */

// These are the pods we create port forwards for
const pods = [{
  podPrefix: 'kibana',
  fromPort: '7080',
  toPort: '5601',
  namespace: 'infra',
  command: 'connectToKibana',
  description: 'Creates a kubctl port forward to kibana.'
},{
  podPrefix: 'inggw-kong',
  fromPort: '7081',
  toPort: '8001',
  namespace: 'infra',
  command: 'connectToKong',
  description: 'Creates a kubctl port forward to kong.'
},{
  podPrefix: 'mondb-mongodb-0',
  fromPort: '27027',
  toPort: '27017',
  namespace: 'dev',
  command: 'connectToMongodbDev',
  description: 'Creates a kubctl port forward to mongodb in the dev namespace'
},{
  podPrefix: 'preprod-mongodb-0',
  fromPort: '27037',
  toPort: '27017',
  namespace: 'pre-prod',
  command: 'connectToMongodbPreProd',
  description: 'Creates a kubctl port forward to mongodb in the pre-prod namespace'
},{
  podPrefix: 'mongodb-mongodb-0',
  fromPort: '27047',
  toPort: '27017',
  namespace: 'prod',
  command: 'connectToMongodbProd',
  description: 'Creates a kubctl port forward to mongodb in the production namespace'
},{
  podPrefix: 'es-client',
  fromPort: '9500',
  toPort: '9200',
  namespace: 'infra',
  command: 'connectToElasticsearch',
  description: 'Creates a kubctl port forward to elasticsearch (dev and pre-prod)'
},{
  podPrefix: 'hello-node',
  fromPort: '7090',
  toPort: '8080',
  namespace: 'default',
  command: 'connectToHelloNode',
  description: 'Creates a kubctl port forward to hello node.'
}];

module.exports = function init({willy, utils}) {
  const {chalk, exec, execCmdNoNewLines, execCmdWithNewLines} = utils;

  async function getPod({namespace, podPrefix}) {
    namespace = namespace ? ` -n ${namespace}` : ' --all-namespaces';
    const cmd = `kubectl get po ${namespace} -o jsonpath='{.items..metadata.name}' | tr ' ' '\\n' | 
  grep ${podPrefix} | head -n 1`;
    const { out } = await execCmdNoNewLines(cmd);
    return {pod: out};
  }

  async function listPods({namespace}) {
    namespace = namespace ? ` -n ${namespace}` : ' --all-namespaces';
    const cmd = `kubectl get po ${namespace}`;
    const { out } = await execCmdWithNewLines(cmd);
    return {pods: out}
  }

  function portForward({namespace, pod, port, cb}) {
    console.log(chalk.cyan('Press ^C to quit'))
    namespace = namespace ? ` -n ${namespace}` : '';
    const cmd = `kubectl port-forward ${pod} ${port}  ${namespace}`;
    const kubectl = exec(cmd);
    kubectl.stdout.pipe(process.stdout);
    kubectl.on('close', () => cb && cb());
  }

  willy
    .command('listPods [namespace]', 'List all pods, namespace is optional defaluts to --all-namespaces')
    .action(async function (args, callback) {
      const {namespace} = args;
      const {pods} = await listPods({namespace});
      console.log(`Found pods: \n ${chalk.green(pods)} `);
      callback();
    });

  // create a port forward command for every pod.
  pods.forEach(p => {
    const {namespace, podPrefix, fromPort, toPort, command, description} = p;
    willy
      .command(command, description)
      .action(function (args, cb) {
        getPod({namespace, podPrefix})
          .then(({pod}) => portForward({namespace, pod, port: `${fromPort}:${toPort}`, cb}))
          .then(() => console.log(chalk.green(`Browse to http://localhost:${fromPort}`)))
          .catch(err => console.log(err));
      });
  })
}
