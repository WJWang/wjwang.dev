# Set Hadoop Standalone Mode On MacOS

## 1. 環境

(1) MacOS Yosemite 10.10.2

(2) Java 1.8 (jdk1.8.0_20, 64bits)

(3) Eclipse (Luna)

(4) Hadoop 2.6.0

The installation method below is largely independent of the operating system—as long as you have Java installed, you can work with Hadoop's official JAR files and commands.

## 2. 目標

The objective is to enable Hadoop to run MapReduce jobs locally for convenient testing and debugging during development. Hadoop provides three modes for running MapReduce:

(1) Standalone

(2) Pseudo Distributed

(3) Distributed

During development, you would test with small datasets in Standalone mode to verify logic before deploying to a cluster environment.

## 3. 安裝 Hadoop

**(1) Download Hadoop**

Download Hadoop 2.6.0 from the official source. Extract the archive and place it in a known directory path.

**(2) Configure JAVA_HOME**

Locate your system's JAVA_HOME and modify the JAVA_HOME variable in hadoop_env.sh.

**(3) Export Hadoop to PATH**

Add `export PATH="[your-hadoop-install-path]/hadoop-2.6.0/bin:$PATH"` to your .bash_profile, then run `source ~/.bash_profile`.

Test with the native word counting example:

```bash
hadoop jar /[your-install-path]/hadoop-2.6.0/share/hadoop/mapreduce/hadoop-mapreduce-examples-2.6.0.jar grep <input Dir> <output Dir> <regex>
```

## 4. 管理專案相依性

### Method 1: Add Eclipse Library

Create a custom library in Eclipse using the .jar files located in `/hadoop-2.6.0/share` for your MapReduce project.

### Method 2: Use Maven

Create a Maven Project and add dependencies to pom.xml. Here's an example for MapReduce development:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
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
</project>
```
