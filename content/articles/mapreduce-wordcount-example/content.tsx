import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>1. Prepare WordCounting File</h2>

      <p>
        準備一個用於 word counting 的文字檔案。本範例使用 The Hunger Games 三部曲的內容。從{' '}
        <a href="https://sites.google.com/site/the74thhungergamesbyced/download-the-hunger-games-trilogy-e-book-txt-file">The Hunger Game</a>{' '}
        下載檔案並存到可存取的位置。
      </p>

      <h2>2. Create a New Folder in HDFS</h2>

      <CodeBlock language="bash">{`$ /usr/local/hadoop/bin/hadoop fs -mkdir /wordcount`}</CodeBlock>

      <h2>3. Copy File from Local to HDFS Folder</h2>

      <CodeBlock language="bash">{`$ /usr/local/hadoop/bin/hadoop fs -copyFromLocal /TheHungerGames.txt /wordcount`}</CodeBlock>

      <p>驗證複製成功：</p>

      <CodeBlock language="bash">{`$ /usr/local/hadoop/bin/hadoop fs -cat /wordcount/TheHungerGames.txt`}</CodeBlock>

      <p>也可以透過瀏覽器確認。</p>

      <h2>4. Execute mapreduce-examples.jar</h2>

      <CodeBlock language="bash">{`$ /usr/local/hadoop/bin/hadoop jar /usr/local/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-2.6.0.jar wordcount /wordcount /output`}</CodeBlock>

      <h2>5. Download Results</h2>

      <p>執行成功後，下載並檢視輸出結果。</p>

      <p>原文發表於 <a href="https://wjwang.medium.com/run-mapreduce-wordcount-example-365e6a37affb">Medium</a></p>
    </Prose>
  );
}
