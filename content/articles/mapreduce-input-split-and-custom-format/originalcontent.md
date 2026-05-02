# MapReduce Input Split And Custom Input Format

透過實作 InputFormat interface 來實現客制的 input split

## Interface InputFormat<K,V>

1. 對 job 的 input 進行確認驗證（i.e. configuration 的確認）與生效。
   _Validate the input-specification of the job._

2. 將輸入的檔案（在 HDFS 中為 blocks）轉換成為 Input Split (logical chunks of type InputSplit)，而每一個 Input Split 將會被分別指派給 Mapper 進行處理。
   _Split-up the input file(s) into logical InputSplits, each of which is then assigned to an individual Mapper._

3. 實作 RecordReader，用以產生 InputSplit 的 key/value pairs（實際描述 Mapper 每次要處理的單元），送進 Mapper 處理。
   _Provide the RecordReader implementation to be used to glean input records from the logical InputSplit for processing by the Mapper._
