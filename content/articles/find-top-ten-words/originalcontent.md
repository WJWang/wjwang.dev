# Find the「Top Ten Words」

## 1. 介紹

接續上一次 First Handmade MapReduce Example 的 WordCounting，我們在這一篇中要將上次的結果再算出文章中出現次數的「前十名」。

## 2. 程式邏輯與實作

### start.java

```java
package topten;

import java.io.File;
import topten.GetTopTen;
import org.apache.commons.io.FileUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;
import org.apache.log4j.BasicConfigurator;

public class start extends Configured implements Tool {
	public static void main(String[] args) throws Exception {
		BasicConfigurator.configure();
		int res = ToolRunner.run(new Configuration(), new start(), args);
		System.exit(res);
	}

	public int run(String[] args) throws Exception {
		Configuration conf = this.getConf();

		File outDir = new File(args[1] + "/second");
		if (outDir.exists()) {
			FileUtils.deleteDirectory(outDir);
		}
		File outDir2 = new File(args[1] + "/first");
		if (outDir2.exists()) {
			FileUtils.deleteDirectory(outDir2);
		}

		Job job = Job.getInstance(conf, "Tool Job");
		job.setJarByClass(CountKeyword.class);
		job.setMapperClass(CountKeyword.ConutMapper.class);
		job.setCombinerClass(CountKeyword.CountReducer.class);
		job.setReducerClass(CountKeyword.CountReducer.class);
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(IntWritable.class);
		FileInputFormat.addInputPath(job, new Path(args[0]));
		FileOutputFormat.setOutputPath(job, new Path(args[1] + "/first"));

		Job job2 = Job.getInstance(conf, "Tool Job2");
		job2.setJarByClass(GetTopTen.class);
		job2.setMapperClass(GetTopTen.TopTenMapper.class);
		job2.setReducerClass(GetTopTen.TopTenReducer.class);
		job2.setMapOutputKeyClass(NullWritable.class);
		job2.setMapOutputValueClass(Text.class);
		job2.setNumReduceTasks(1);
		job2.setOutputKeyClass(IntWritable.class);
		job2.setOutputValueClass(Text.class);
		FileInputFormat.addInputPath(job2, new Path(args[1] + "/first"));
		FileOutputFormat.setOutputPath(job2, new Path(args[1] + "/second"));

		return job.waitForCompletion(true) && job2.waitForCompletion(true) ? 0 : 1;
	}
}
```

### CountKeyword.java

```java
package topten;

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
			for (IntWritable val : values) {
				sum += val.get();
			}
			result.set(sum);
			context.write(key, result);
		}
	}
}
```

### GetTopTen.java

```java
package topten;

import java.io.IOException;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;

public class GetTopTen {
	public static class TopTenMapper extends Mapper<Object, Text, NullWritable, Text> {
		private static Pattern linePtn = 
			Pattern.compile("(?<word>[A-Za-z]*)\\s(?<count>[0-9]+)");
		private TreeMap<Integer, Text> repToRecordMap = new TreeMap<Integer, Text>();

		@Override
		protected void map(Object key, Text value, Context context) 
			throws IOException, InterruptedException {
			String line = value.toString();
			Matcher match = linePtn.matcher(line);
			if (match.matches()) {
				repToRecordMap.put(Integer.parseInt(match.group("count")), 
					new Text(match.group("word")));
			}
			if (repToRecordMap.size() > 10) {
				repToRecordMap.remove(repToRecordMap.firstKey());
			}
		}

		@Override
		protected void cleanup(Context context) 
			throws IOException, InterruptedException {
			for (Integer t : repToRecordMap.keySet()) {
				StringBuilder sb = new StringBuilder();
				sb.append(repToRecordMap.get(t).toString() + " " + t.toString());
				context.write(NullWritable.get(), new Text(sb.toString()));
			}
		}
	}

	public static class TopTenReducer extends Reducer<NullWritable, Text, IntWritable, Text> {
		private TreeMap<Integer, Text> repToRecordMap = new TreeMap<Integer, Text>();
		private static Pattern linePtn = 
			Pattern.compile("(?<word>[A-Za-z]*)\\s(?<count>[0-9]+)");

		@Override
		protected void reduce(NullWritable key, Iterable<Text> values, Context context) 
			throws IOException, InterruptedException {
			for (Text value : values) {
				String line = value.toString();
				Matcher match = linePtn.matcher(line);
				if (match.matches()) {
					repToRecordMap.put(Integer.parseInt(match.group("count")), 
						new Text(match.group("word")));
				}
				if (repToRecordMap.size() > 10) {
					repToRecordMap.remove(repToRecordMap.firstKey());
				}
			}
		}

		@Override
		protected void cleanup(Context context) 
			throws IOException, InterruptedException {
			for (Integer t : repToRecordMap.descendingKeySet()) {
				context.write(new IntWritable(t), repToRecordMap.get(t));
			}
		}
	}
}
```

## 3. 執行結果

以上兩個 Job 串接後，即可透過 MapReduce 的分散式計算，找出文章中出現次數前十名的英文單字。
