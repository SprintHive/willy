const amqp = require('amqplib');
const Rx = require('rxjs/Rx');

const obs = Rx.Observable;

module.exports = function init({willy, utils}) {
  const {chalk, execCmdNoNewLines} = utils;

  const connect = (state) => {
    return obs.fromPromise(amqp.connect('amqp://jon:password@localhost'))
      .flatMap(conn => obs.fromPromise(conn.createChannel()))
      .map(ch => {
        state.ch = ch;
        return state;
      })
  }

  const exchangeNames = [];
  exchangeNames.push("address-complete");
  exchangeNames.push("address-request");
  exchangeNames.push("address-verification-completed");
  exchangeNames.push("individual-profile-complete");
  exchangeNames.push("individual-profile-request");
  exchangeNames.push("individual-verification-completed");

  const queueNames = [];
  queueNames.push("address-complete.error-group");
  queueNames.push("address-complete.no-data-group");
  queueNames.push("address-complete.success-group");
  queueNames.push("address-request.compuscan-address-group");
  queueNames.push("address-request.xds-address-group");
  queueNames.push("address-verification-completed.verified-error-group");
  queueNames.push("address-verification-completed.verified-group");
  queueNames.push("address-verification-completed.verified-no-data-group");
  queueNames.push("individual-profile-complete.error-group");
  queueNames.push("individual-profile-complete.no-data-group");
  queueNames.push("individual-profile-complete.success-group");
  queueNames.push("individual-profile-request.compuscan-individual-group");
  queueNames.push("individual-profile-request.xds-both-group");
  queueNames.push("individual-profile-request.xds-individual-group");
  queueNames.push("individual-verification-completed.verified-error-group");
  queueNames.push("individual-verification-completed.verified-no-data-group");
  queueNames.push("individual-verification-completed.verified-group");

  const deleteExchange = (state) => {
    const {ch} = state
    return obs.from(exchangeNames)
      .flatMap(name => obs.fromPromise(ch.deleteExchange(name)).map(() => name))
      .reduce((acc, name) => {
        acc.push(`Deleted exchange ${name}`)
        return acc
      }, [])
      .map(logs => {
        state.log = logs
        return state
      })
  }

  const deleteQueue = (state) => {
    const {ch} = state
    return obs.from(queueNames)
      .do(name => state.log.push(`Deleted exchange ${name}`))
      .flatMap(name => obs.fromPromise(ch.deleteQueue(name)).map(() => name))
      .reduce((acc, name) => {
        acc.push(`Deleted queue ${name}`)
        return acc
      }, [])
      .map(logs => {
        state.log = logs
        return state
      })
  }

  willy
    .command("cleanRabbit", "Clean out the exchanges and queues from rabbit")
    .action(function (args, callback) {
      console.log("Cleaning out the rabbit exchanges and queues...");
      obs.of({
        ch: undefined,
        log: []
      }).flatMap(connect)
        .flatMap(deleteExchange)
        .flatMap(deleteQueue)
        .subscribe(
          ans => console.log("Cleaning out the rabbit exchanges and queues complete."),
          console.error,
          () => callback());
    });
}