import {
  Prose,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>透過實作 InputFormat interface 來實現客制的 input split。</p>

      <h2>Interface InputFormat&lt;K,V&gt;</h2>

      <ol>
        <li>
          <p>
            對 job 的 input 進行確認驗證（i.e. configuration 的確認）與生效。
          </p>
          <p><em>Validate the input-specification of the job.</em></p>
        </li>
        <li>
          <p>
            將輸入的檔案（在 HDFS 中為 blocks）轉換成為 Input Split (logical chunks of type InputSplit)，而每一個 Input Split 將會被分別指派給 Mapper 進行處理。
          </p>
          <p><em>Split-up the input file(s) into logical InputSplits, each of which is then assigned to an individual Mapper.</em></p>
        </li>
        <li>
          <p>
            實作 RecordReader，用以產生 InputSplit 的 key/value pairs（實際描述 Mapper 每次要處理的單元），送進 Mapper 處理。
          </p>
          <p><em>Provide the RecordReader implementation to be used to glean input records from the logical InputSplit for processing by the Mapper.</em></p>
        </li>
      </ol>

      <p>原文發表於 <a href="https://wjwang.medium.com/mapreduce-input-split-and-custom-input-format-439de9ed0f7">Medium</a></p>
    </Prose>
  );
}
