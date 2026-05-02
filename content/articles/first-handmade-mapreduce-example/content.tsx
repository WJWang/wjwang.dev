import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>改良 WordCounting 的結果</h2>

      <p>
        此篇改良 WordCounting 範例，在 map function 中過濾附著在單字上的標點符號。過去 "Hello"、"Hello!"、"Hello…"、"Hello," 會被視為不同的 key 分別計算；改良後統一視為同一個 key，輸出結果為 <code>[Hello, 4]</code>。
      </p>

      <h2>開發環境</h2>

      <ul>
        <li>IDE：<strong>Eclipse</strong></li>
        <li>相依管理：<strong>Maven</strong>（從 Maven Repository 取得函式庫）</li>
      </ul>

      <h2>專案步驟</h2>

      <h3>(1) 建立新的 Maven Project</h3>

      <p>在 Eclipse 中建立新的 Maven 專案。</p>

      <h3>(2) 設定 pom.xml</h3>

      <p>在 <code>pom.xml</code> 加入以下相依：</p>
      <ul>
        <li>hadoop-mapreduce-client-core</li>
        <li>hadoop-common (version 2.6.0)</li>
      </ul>

      <h3>(3) 建立新的 Class 檔案</h3>

      <p>在 Eclipse 中建立新的 class 檔案。</p>

      <h3>(4) 實作程式碼</h3>

      <CodeBlock language="java" filename="WordCount.java">{`package wordcount;

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
}`}</CodeBlock>

      <p>程式碼重點：</p>
      <ul>
        <li><code>isEnglish()</code> 方法過濾非字母字元</li>
        <li>map function 以 char array 處理字元，擷取不含標點的單字</li>
        <li>reduce function 累加相同 key 的次數</li>
      </ul>

      <h3>(5) 打包成 JAR 檔</h3>

      <p>用 Maven 將完成的程式碼編譯並打包成可執行的 <code>.jar</code> 檔案。</p>

      <h3>(6) 部署並執行</h3>

      <p>將 <code>.jar</code> 部署到 Hadoop 並以標準 hadoop 指令執行，流程與先前的 MapReduce WordCounting 範例相同。</p>

      <p>原文發表於 <a href="https://wjwang.medium.com/first-handmade-mapreduce-example-5bcfd82cb59">Medium</a></p>
    </Prose>
  );
}
