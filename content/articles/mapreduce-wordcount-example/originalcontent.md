# Run MapReduce WordCount Example

## 1. Prepare WordCounting File

## 2. Create a New Folder in HDFS

```bash
$ /usr/local/hadoop/bin/hadoop fs -mkdir /wordcount
```

## 3. Copy File from Local to HDFS Folder

```bash
$ /usr/local/hadoop/bin/hadoop fs -copyFromLocal /TheHungerGames.txt /wordcount
$ /usr/local/hadoop/bin/hadoop fs -cat /wordcount/TheHungerGames.txt
```

## 4. Execute mapreduce-examples.jar

```bash
$ /usr/local/hadoop/bin/hadoop jar /usr/local/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-2.6.0.jar wordcount /wordcount /output
```

## 5. Download Results
