import {
  Prose,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        Here is a simple nodejs code snippet for uploading a file to Amazon S3 without writing to disk. It can be used for uploading a file to S3 in two ways.
      </p>

      <ol>
        <li>Directly upload from BLOB</li>
        <li>Upload from URI</li>
      </ol>

      <p>For the URI method:</p>
      <ul>
        <li>Initial a GET Request to a given URI to fetch data</li>
        <li>Pipe the data to S3 service</li>
        <li>During the piping, it can also execute a callback function to send the S3 response back.</li>
      </ul>

      <p>原文發表於 <a href="https://wjwang.medium.com/nodejs-file-upload-to-s3-25c2fe7ee6d3">Medium</a></p>
    </Prose>
  );
}
