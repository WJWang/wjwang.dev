import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>1. Download Hadoop</h2>

      <p>
        從 Hadoop 官網下載，或透過 wget 直接下載。（<a href="http://apache.stu.edu.tw/hadoop/common/hadoop-2.6.0/hadoop-2.6.0.tar.gz">Hadoop download link</a>）
      </p>

      <h2>2. Extract, Move, and Create Symlink</h2>

      <CodeBlock language="bash">{`$ tar -zxf hadoop-2.6.0.tar.gz
$ sudo mv hadoop-2.6.0/ /usr/local/
$ cd /usr/local
$ sudo ln -s hadoop-2.6.0/ hadoop`}</CodeBlock>

      <h2>3. Create a Dedicated Hadoop User</h2>

      <CodeBlock language="bash">{`$ sudo addgroup hadoop
$ sudo adduser --ingroup hadoop hduser
$ sudo adduser hduser sudo
$ sudo chown -R hduser:hadoop /usr/local/hadoop/`}</CodeBlock>

      <h2>4. Configure SSH Passwordless Login</h2>

      <CodeBlock language="bash">{`$ su hduser
$ sudo apt-get install ssh
$ ssh-keygen -t rsa -P ""
$ cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
$ chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh`}</CodeBlock>

      <h2>5. Adjust /etc/sysctl.conf File</h2>

      <p>在檔案底部加入：</p>

      <CodeBlock language="bash">{`net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1`}</CodeBlock>

      <p>修改後：<code>$ sudo service networking restart</code> 或 <code>$ sudo shutdown -r now</code></p>

      <h2>6. Test SSH Connection</h2>

      <CodeBlock language="bash">{`$ su hduser
$ ssh localhost
'Are you sure you want to continue connecting?'(yes/no)yes`}</CodeBlock>

      <h2>7. Update and Install Java</h2>

      <CodeBlock language="bash">{`$ sudo apt-get update
$ sudo apt-get install default-jdk`}</CodeBlock>

      <p>若已安裝，找到 JAVA_HOME 路徑：<code>$ which java | sed -e 's/\(.*\)\/bin\/java/\1/g'</code></p>

      <p>切換為 hduser（<code>$ su hduser</code>）並修改 <code>~/.bashrc</code>，在底部加入：</p>

      <CodeBlock language="bash">{`export HADOOP_HOME=/usr/local/hadoop
export JAVA_HOME=/usr`}</CodeBlock>

      <p>重新載入設定：<code>$ source ~/.bashrc</code></p>

      <h2>8. Adjust Hadoop Configuration Files</h2>

      <h3>建立 HDFS 目錄</h3>

      <CodeBlock language="bash">{`$ su hduser
$ mkdir /usr/local/hadoop/data`}</CodeBlock>

      <h3>修改 hadoop-env.sh</h3>

      <p>將 <code>JAVA_HOME=$&#123;JAVA_HOME&#125;</code> 改為 <code>JAVA_HOME=/usr</code>，並修改 HADOOP_OPTS：</p>

      <CodeBlock language="bash" filename="hadoop-env.sh">{`export HADOOP_OPTS="$HADOOP_OPTS -Djava.net.preferIPv4Stack=true -Djava.library.path=\${HADOOP_PREFIX}/lib"
export HADOOP_COMMON_LIB_NATIVE_DIR=\${HADOOP_PREFIX}/lib/native`}</CodeBlock>

      <h3>修改 yarn-env.sh</h3>

      <CodeBlock language="bash" filename="yarn-env.sh">{`export HADOOP_CONF_LIB_NATIVE_DIR=\${HADOOP_PREFIX:-"/lib/native"}
export HADOOP_OPTS="-Djava.library.path=\${HADOOP_PREFIX}/lib"`}</CodeBlock>

      <h3>修改 core-site.xml</h3>

      <CodeBlock language="xml" filename="core-site.xml">{`<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>fs.default.name</name>
    <value>hdfs://localhost:9000</value>
  </property>
  <property>
    <name>hadoop.tmp.dir</name>
    <value>/usr/local/hadoop/data</value>
  </property>
</configuration>`}</CodeBlock>

      <h3>修改 mapred-site.xml</h3>

      <CodeBlock language="xml" filename="mapred-site.xml">{`<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>mapreduce.framework.name</name>
    <value>yarn</value>
  </property>
</configuration>`}</CodeBlock>

      <h3>修改 hdfs-site.xml</h3>

      <CodeBlock language="xml" filename="hdfs-site.xml">{`<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>dfs.replication</name>
    <value>3</value>
  </property>
</configuration>`}</CodeBlock>

      <h3>修改 yarn-site.xml</h3>

      <CodeBlock language="xml" filename="yarn-site.xml">{`<?xml version="1.0"?>
<configuration>
  <property>
    <name>yarn.nodemanager.aux-services</name>
    <value>mapreduce_shuffle</value>
  </property>
  <property>
    <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
    <value>org.apache.hadoop.mapred.ShuffleHandler</value>
  </property>
  <property>
    <name>yarn.resourcemanager.resource-tracker.address</name>
    <value>localhost:8025</value>
  </property>
  <property>
    <name>yarn.resourcemanager.scheduler.address</name>
    <value>localhost:8030</value>
  </property>
  <property>
    <name>yarn.resourcemanager.address</name>
    <value>localhost:8050</value>
  </property>
</configuration>`}</CodeBlock>

      <h2>9. Format Namenode and Start Hadoop</h2>

      <CodeBlock language="bash">{`$ /usr/local/hadoop/bin/hadoop namenode -format
$ /usr/local/hadoop/sbin/start-dfs.sh
$ /usr/local/hadoop/sbin/start-yarn.sh`}</CodeBlock>

      <h2>10. Verify Installation</h2>

      <p>執行 <code>$ jps</code> 確認各 process 正常運行。</p>

      <p>開啟瀏覽器並前往 <code>http://localhost:50070</code> 查看 Web 介面。</p>

      <p>原文發表於 <a href="https://wjwang.medium.com/install-hadoop-2-6-0-on-ubuntu14-04-df9dc68d9b75">Medium</a></p>
    </Prose>
  );
}
