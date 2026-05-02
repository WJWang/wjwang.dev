import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>1. 介紹</h2>

      <p>
        延續先前的 <a href="/articles/first-handmade-mapreduce-example">WordCounting MapReduce 範例</a>，本篇計算「中位數單字」：在所有不重複單字按出現次數排序後，位於中間位置的那個頻次群組。
      </p>

      <h3>範例</h3>

      <p>給定以下詞頻：</p>

      <table>
        <thead>
          <tr><th>Word</th><th>Total Appearances</th></tr>
        </thead>
        <tbody>
          <tr><td>hadoop</td><td>3</td></tr>
          <tr><td>hdfs</td><td>1</td></tr>
          <tr><td>mapreduce</td><td>5</td></tr>
          <tr><td>pig</td><td>5</td></tr>
          <tr><td>zookeeper</td><td>5</td></tr>
          <tr><td>hive</td><td>4</td></tr>
          <tr><td>oozie</td><td>1</td></tr>
          <tr><td>yarn</td><td>1</td></tr>
          <tr><td>avro</td><td>2</td></tr>
          <tr><td>spark</td><td>3</td></tr>
          <tr><td>mahout</td><td>2</td></tr>
          <tr><td>hbase</td><td>4</td></tr>
        </tbody>
      </table>

      <p>按頻次整理後，中位數群組為頻次 2 的「pig, avro, mahout」。</p>

      <h2>2. 程式邏輯與實作</h2>

      <h3>Main Driver Class</h3>

      <CodeBlock language="java" filename="start.java">{`package mediumWord;

import java.io.File;
import org.apache.commons.io.FileUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;
import org.apache.log4j.BasicConfigurator;

public class start extends Configured implements Tool {
  public enum MediumCounter {
    SUM
  }

  public static void main(String[] args) throws Exception {
    BasicConfigurator.configure();
    int res = ToolRunner.run(new Configuration(), new start(), args);
    System.exit(res);
  }

  public int run(String[] args) throws Exception {
    Configuration conf = this.getConf();

    File outDir = new File(args[1]+"/second");
    if(outDir.exists()) { FileUtils.deleteDirectory(outDir); }
    File outDir2 = new File(args[1]+"/first");
    if(outDir2.exists()) { FileUtils.deleteDirectory(outDir2); }

    // Job 1: Count words
    Job job = Job.getInstance(conf, "Tool Job");
    job.setJarByClass(CountKeyword.class);
    job.setMapperClass(CountKeyword.ConutMapper.class);
    job.setCombinerClass(CountKeyword.CountReducer.class);
    job.setReducerClass(CountKeyword.CountReducer.class);
    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(IntWritable.class);
    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]+"/first"));

    // Job 2: Find median
    Job job2 = Job.getInstance(conf, "Tool Job2");
    job2.setJarByClass(Medium.class);
    job2.setMapperClass(Medium.ExchangeKeyValueMapper.class);
    job2.setReducerClass(Medium.WordCountingReducer.class);
    job2.setMapOutputKeyClass(IntWritable.class);
    job2.setMapOutputValueClass(Text.class);
    job2.setOutputKeyClass(IntWritable.class);
    job2.setOutputValueClass(Text.class);
    FileInputFormat.addInputPath(job2, new Path(args[1]+"/first"));
    FileOutputFormat.setOutputPath(job2, new Path(args[1]+"/second"));

    return job.waitForCompletion(true) && job2.waitForCompletion(true) ? 0 : 1;
  }
}`}</CodeBlock>

      <h3>Word Counting Phase</h3>

      <CodeBlock language="java" filename="CountKeyword.java">{`package mediumWord;

import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;

public class CountKeyword {

  public static boolean isEnglish(char c) {
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
  }

  public static class ConutMapper extends Mapper<Object, Text, Text, IntWritable> {
    private final static IntWritable one = new IntWritable(1);
    private Text word = new Text();

    public void map(Object key, Text value, Context context)
        throws IOException, InterruptedException {
      String line = value.toString();
      char[] charArray = line.toCharArray();
      int lastIndex = -1;
      for (int i = 0; i < charArray.length; i++) {
        char current = charArray[i];
        if (!isEnglish(current)) {
          if ((i - lastIndex) > 1) {
            String candidate = line.substring(lastIndex + 1, i);
            word.set(candidate);
            context.write(word, one);
          }
          lastIndex = i;
        }
      }
    }
  }

  public static class CountReducer extends Reducer<Text, IntWritable, Text, IntWritable> {
    private IntWritable result = new IntWritable();

    public void reduce(Text key, Iterable<IntWritable> values, Context context)
        throws IOException, InterruptedException {
      int sum = 0;
      for (IntWritable val : values) { sum += val.get(); }
      result.set(sum);
      context.write(key, result);
    }
  }
}`}</CodeBlock>

      <h3>Median Calculation Phase</h3>

      <CodeBlock language="java" filename="Medium.java">{`package mediumWord;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import mediumWord.start.MediumCounter;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;

public class Medium {

  public static class ExchangeKeyValueMapper extends Mapper<Object, Text, IntWritable, Text> {
    private final static IntWritable count = new IntWritable();
    private Text word = new Text();
    private static Pattern linePtn = Pattern.compile("(?<word>[A-Za-z]*)\\s(?<count>[0-9]+)");

    @Override
    public void map(Object key, Text value, Context context)
        throws IOException, InterruptedException {
      String line = value.toString();
      Matcher match = linePtn.matcher(line);
      if(match.matches()){
        count.set(Integer.parseInt(match.group("count")));
        word.set(match.group("word"));
        context.write(count, word);
      }
    }
  }

  public static class WordCountingReducer extends Reducer<IntWritable, Text, IntWritable, Text> {
    @Override
    public void reduce(IntWritable key, Iterable<Text> values, Context context)
        throws IOException, InterruptedException {
      StringBuilder sb = new StringBuilder();
      int size = 0;
      sb.append("{wordlist:[");
      for (Text val : values) {
        sb.append("\\""+val.toString()+"\\",");
        context.getCounter(MediumCounter.SUM).increment(1);
        size++;
      }
      sb.replace(sb.toString().length()-1, sb.toString().length(), "");
      sb.append("],wordlength:"+size+",");
      sb.append("sum:"+context.getCounter(MediumCounter.SUM).getValue()+"}");
      context.write(key, new Text(sb.toString()));
    }
  }
}`}</CodeBlock>

      <p>
        本方案採用兩個串接的 MapReduce Job：第一個 Job 統計詞頻，第二個 Job 交換 key 與 value，以頻次為 key 將單字分群，便於找出中位數。
      </p>

      <p>原文發表於 <a href="https://wjwang.medium.com/find-the-median-word-a-word-whose-appearance-is-the-median-1ac4b9934599">Medium</a></p>
    </Prose>
  );
}
