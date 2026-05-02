import {
  Prose,
  CodeBlock,
  Callout,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>Problem</h2>

      <p>
        MySQL 8.0's root password encryption uses the <code>caching_sha2_password</code> plugin. However, MySQL client software like MySQL Workbench or Sequel Pro cannot find this plugin.
      </p>

      <p>When running a query in the MySQL shell:</p>

      <CodeBlock language="sql">{`mysql> select user, host, plugin, authentication_string from user\\G;`}</CodeBlock>

      <p>
        The output shows that the root user is configured with <code>caching_sha2_password</code>:
      </p>

      <CodeBlock language="text">{`user: root
host: localhost
plugin: caching_sha2_password
authentication_string: $A$005$_94d4m...`}</CodeBlock>

      <p>
        This incompatibility prevents third-party MySQL clients from connecting using the root account.
      </p>

      <h2>Current Solutions</h2>

      <p><strong>Modify encryption rules:</strong></p>

      <CodeBlock language="sql">{`ALTER USER 'root'@'localhost' IDENTIFIED BY 'password' PASSWORD EXPIRE NEVER;`}</CodeBlock>

      <p><strong>Update password and flush privileges:</strong></p>

      <CodeBlock language="sql">{`ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;`}</CodeBlock>

      <p><strong>Reset password:</strong></p>

      <CodeBlock language="sql">{`ALTER user 'root'@'localhost' identified by '{YOUR_PASSWORD}';`}</CodeBlock>

      <Callout variant="info">
        These commands switch the authentication method from <code>caching_sha2_password</code> to <code>mysql_native_password</code>, enabling compatibility with standard MySQL clients.
      </Callout>

      <p>原文發表於 <a href="https://wjwang.medium.com/mysql8-0-caching-sha2-password-image-not-found-f01989b46552">Medium</a></p>
    </Prose>
  );
}
