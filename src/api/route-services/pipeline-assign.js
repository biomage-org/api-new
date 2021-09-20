const k8s = require('@kubernetes/client-node');
const getLogger = require('../../utils/getLogger');

const logger = getLogger();

const kc = new k8s.KubeConfig();
kc.loadFromDefault();


const pipelineAssign = async (payload) => {
  const {
    sandboxId, experimentId, activityId, processName,
  } = payload;


  const namespace = `pipeline-${sandboxId}`;
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  const [assignedPods, unassignedPods] = await Promise.all(
    [
      k8sApi.listNamespacedPod(namespace, null, null, null, 'status.phase=Running', `activityId=${activityId},type=pipeline`),
      k8sApi.listNamespacedPod(namespace, null, null, null, null, '!activityId,type=pipeline'),
    ],
  );

  assignedPods.body.items.forEach((pod) => {
    const { name } = pod.metadata;
    logger.log(`Found pipeline running pod ${name}, removing...`);
    k8sApi.removeNamespacedPod(name, namespace);
  });

  const pods = unassignedPods.body.items;
  logger.log(pods.length, 'unassigned candidate pods found. Selecting one...');

  // Select a pod to run this experiment on.
  console.log(pods);
  const selectedPod = parseInt(experimentId, 16) % pods.length;
  console.log(`selected pod ${selectedPod}`);
  console.log(pods[selectedPod]);
  const { name } = pods[selectedPod].metadata;
  logger.log('Pod number', selectedPod, ' with name', name, 'chosen');

  const patch = [
    { op: 'test', path: '/metadata/labels/activityId', value: null },
    {
      op: 'add', path: '/metadata/labels/activityId', value: activityId,
    },
    {
      op: 'add', path: '/metadata/labels/experimentId', value: experimentId,
    },
    {
      op: 'add', path: '/metadata/labels/processName', value: processName,
    },
  ];

  await k8sApi.patchNamespacedPod(name, namespace, patch,
    undefined, undefined, undefined, undefined,
    {
      headers: {
        'content-type': 'application/json-patch+json',
      },
    });
};

module.exports = pipelineAssign;
