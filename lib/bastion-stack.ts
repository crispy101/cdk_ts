import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Subnet, SubnetType } from '@aws-cdk/aws-ec2';


export class BastionStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, sg: ec2.SecurityGroup, props?: cdk.StackProps) {
      super(scope, id, props);
  
      const pjt_name = this.node.tryGetContext('project_name');
      const env_name = this.node.tryGetContext('env')
  
      const userData = ec2.UserData.forLinux()

      userData.addCommands(
            'echo "command 1" > file1.txt',
            'echo "command 2" > file2.txt'
        )
      userData.addOnExitCommands(
          'echo "exit command" > exit.txt'
      )
      
    // How to define a generic ec2 instance for a bastion host that enables key-based ssh access
    // 
    //   const bastion_host = new ec2.Instance(this, 'bastion_host', {
    //     vpc: vpc,
    //     instanceType: new ec2.InstanceType('t3.nano'),
    //     machineImage: new ec2.AmazonLinuxImage({
    //         edition: ec2.AmazonLinuxEdition.STANDARD,
    //         generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    //         storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
    //         virtualization: ec2.AmazonLinuxVirt.HVM,
    //         userData: userData,
    //     }),
    //     keyName: 'udemycdk_key',
    //     securityGroup: sg,
    //     vpcSubnets: { subnetType: SubnetType.PUBLIC }
    //     })

    // How to define a bastion host using ec2.BastionHostLinux class that enables SSM Session-based connection, 
    // i.e. not supporting ssh-key based access. 
    // Therefore, no need to have it in a public subnet.
    
      const bastion_host = new ec2.BastionHostLinux(this, 'bastion_host', {
          vpc: vpc,
          instanceType: new ec2.InstanceType('t3.nano'),
          machineImage: new ec2.AmazonLinuxImage({
              edition: ec2.AmazonLinuxEdition.STANDARD,
              generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
              storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
              virtualization: ec2.AmazonLinuxVirt.HVM,
              userData: userData,
          }),
          securityGroup: sg
          })
    }
}