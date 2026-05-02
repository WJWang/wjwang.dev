# Upload a file to S3 without writing to disk

Here is a simple nodejs code snippet for uploading a file to Amazon S3. It can be used for uploading a file to S3 in two ways.

1. Directly upload from BLOB
2. Upload from URI

For the URI method:
- Initial a GET Request to a given URI to fetch data
- Pipe the data to S3 service
- During the piping, it can also execute a callback function to send the S3 response back.
