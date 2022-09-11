import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'bingwa',
  connector: 'mongodb',
  url: 'mongodb+srv://bingwa-root:bingwa1234@cluster0.vci6c.mongodb.net/test',
  host: 'cluster0.vci6c.mongodb.net',
  port: 27017,
  user: 'bingwa-root',
  password: 'bingwa1234',
  database: 'bingwa',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class BingwaDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'bingwa';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.bingwa', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
