import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>1. 環境</h2>
      <ul>
        <li>MacOS Yosemite 10.10.2</li>
        <li>Java 1.8 (jdk1.8.0_20, 64bits)</li>
        <li>Eclipse (Luna)</li>
        <li>Hadoop 2.6.0</li>
      </ul>

      <p>
        The installation method below is largely independent of the operating system—as long as you have Java installed, you can work with Hadoop's official JAR files and commands.
      </p>

      <h2>2. 目標</h2>

      <p>
        The objective is to enable Hadoop to run MapReduce jobs locally for convenient testing and debugging during development. Hadoop provides three modes for running MapReduce:
      </p>
      <ol>
        <li>Standalone</li>
        <li>Pseudo Distributed</li>
        <li>Distributed</li>
      </ol>

      <p>
        During development, you would test with small datasets in Standalone mode to verify logic before deploying to a cluster environment.
      </p>

      <h2>3. 安裝 Hadoop</h2>

      <p><strong>(1) Download Hadoop</strong></p>
      <p>
        Download Hadoop 2.6.0 from the official source. Extract the archive and place it in a known directory path.
      </p>

      <p><strong>(2) Configure JAVA_HOME</strong></p>
      <p>
        Locate your system's JAVA_HOME and modify the JAVA_HOME variable in hadoop_env.sh.
      </p>

      <p><strong>(3) Export Hadoop to PATH</strong></p>
      <p>
        Add <code>{'export PATH="[your-hadoop-install-path]/hadoop-2.6.0/bin:$PATH"'}</code> to your .bash_profile, then run <code>source ~/.bash_profile</code>.
      </p>

      <p>Test with the native word counting example:</p>

      <CodeBlock language="bash">{`hadoop jar /[your-install-path]/hadoop-2.6.0/share/hadoop/mapreduce/hadoop-mapreduce-examples-2.6.0.jar grep <input Dir> <output Dir> <regex>`}</CodeBlock>

      <h2>4. 管理專案相依性</h2>

      <h3>Method 1: Add Eclipse Library</h3>
      <p>
        Create a custom library in Eclipse using the .jar files located in <code>/hadoop-2.6.0/share</code> for your MapReduce project.
      </p>

      <h3>Method 2: Use Maven</h3>
      <p>
        Create a Maven Project and add dependencies to pom.xml. Here's an example for MapReduce development:
      </p>

      <CodeBlock language="xml" filename="pom.xml">{`<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<groupId>soslab</groupId>
	<artifactId>mediumWord</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<dependencies>
		<dependency>
			<groupId>org.apache.hadoop</groupId>
			<artifactId>hadoop-common</artifactId>
			<version>2.6.0</version>
			<exclusions>
				<exclusion>
					<groupId>com.google.guava</groupId>
					<artifactId>guava</artifactId>
				</exclusion>
			</exclusions>
		</dependency>

		<dependency>
			<groupId>org.apache.hadoop</groupId>
			<artifactId>hadoop-mapreduce-client-common</artifactId>
			<version>2.6.0</version>
		</dependency>

		<dependency>
			<groupId>org.apache.hadoop</groupId>
			<artifactId>hadoop-mapreduce-client-core</artifactId>
			<version>2.6.0</version>
		</dependency>

		<dependency>
			<groupId>com.google.guava</groupId>
			<artifactId>guava</artifactId>
			<version>14.0</version>
		</dependency>
	</dependencies>
</project>`}</CodeBlock>

      <p>原文發表於 <a href="https://wjwang.medium.com/set-hadoop-standalone-mode-on-macos-748064d874bb">Medium</a></p>
    </Prose>
  );
}
