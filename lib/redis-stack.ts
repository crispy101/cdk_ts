import * as cdk from '@aws-cdk/core';
import * as ssm from '@aws-cdk/aws-ssm';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as redis from '@aws-cdk/aws-elasticache';

export class RedisStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc,
        redissg: ec2.SecurityGroup, props?: cdk.StackProps) {

        super(scope, id, props);
    
        const pjt_name = this.node.tryGetContext('project_name');
        const env_name = this.node.tryGetContext('env')
        
        const subnets = []
        for (var ps of vpc.privateSubnets) {
            subnets.push(ps.subnetId)
            }

        const subnet_group = new redis.CfnSubnetGroup(this, 'redis-subnet-group', {
            description: 'Subnet group for Redis',
            subnetIds: subnets
        })

        const redis_cluster = new redis.CfnCacheCluster(this, 'redis', {
            cacheNodeType: 'cache.t2.small',
            engine: 'redis',
            numCacheNodes: 1,
            autoMinorVersionUpgrade: true,
            clusterName: 'redis-'+env_name,
            cacheSubnetGroupName: subnet_group.ref, 
            vpcSecurityGroupIds: [redissg.securityGroupId]
        })

        redis_cluster.addDependsOn(subnet_group)

        new ssm.StringParameter(this, 'redis-endpoint',{
            parameterName: '/'+env_name+'redis-endpoint',
            stringValue: redis_cluster.attrRedisEndpointAddress
        })

        new ssm.StringParameter(this, 'redis-port',{
            parameterName: '/'+env_name+'redis-port',
            stringValue: redis_cluster.attrRedisEndpointPort
        })
        }
    }
