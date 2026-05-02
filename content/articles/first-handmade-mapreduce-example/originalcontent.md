# First Handmade MapReduce Example

## 改良WordCounting的結果

This article improves upon a previous WordCounting example by filtering punctuation marks attached to words in the map function. Previously, variations like "Hello", "Hello!", "Hello…", and "Hello," were counted separately. The enhanced version treats all these as the same key, producing a single result like `[Hello,4]`.

## Development Setup

- **Eclipse** as the IDE
- **Maven** for managing library dependencies
- Libraries sourced from Maven Repository

## Project Steps

### (1) Create a new Maven Project

### (2) Configure pom.xml

- hadoop-mapreduce-client-core
- hadoop-common (version 2.6.0)

### (3) Create a New Class File

### (4) Implementation Code

```java
package wordcount;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapred.*;

import java.io.IOException;
import java.util.Iterator;

public class WordCount {

    public static class Map extends MapReduceBase implements Mapper<LongWritable, Text, Text, IntWritable> {
        private final static IntWritable one = new IntWritable(1);
        private Text word = new Text();

        public void map(LongWritable key, Text value, OutputCollector<Text, IntWritable> output, Reporter reporter) throws IOException {
            String line = value.toString();
            char[] charArray = line.toCharArray();
            int lastIndex = -1;
            for (int i = 0; i < charArray.length; i++) {
                char current = charArray[i];
                if (!isEnglish(current)) {
                    if ((i - lastIndex) > 1) {
                        String candidate = line.substring(lastIndex + 1, i);
                        word.set(candidate);
                        output.collect(word, one);
                    }
                    lastIndex = i;
                }
            }
        }
    }

    public static boolean isEnglish(char c) {
        return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
    }

    public static class Reduce extends MapReduceBase implements Reducer<Text, IntWritable, Text, IntWritable> {
        public void reduce(Text key, Iterator<IntWritable> values, OutputCollector<Text, IntWritable> output, Reporter reporter) throws IOException {
            int sum = 0;
            while (values.hasNext()) {
                sum += values.next().get();
            }
            output.collect(key, new IntWritable(sum));
        }
    }

    public static void main(String[] args) throws Exception {
        JobConf conf = new JobConf(WordCount.class);
        conf.setJobName("wordcount");

        conf.setOutputKeyClass(Text.class);
        conf.setOutputValueClass(IntWritable.class);

        conf.setMapperClass(Map.class);
        conf.setCombinerClass(Reduce.class);
        conf.setReducerClass(Reduce.class);

        conf.setInputFormat(TextInputFormat.class);
        conf.setOutputFormat(TextOutputFormat.class);

        FileInputFormat.setInputPaths(conf, new Path(args[0]));
        FileOutputFormat.setOutputPath(conf, new Path(args[1]));

        JobClient.runJob(conf);
    }
}
```

### (5) Package as JAR File

### (6) Deploy and Execute
