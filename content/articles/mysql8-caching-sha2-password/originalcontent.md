# mysql8.0 caching_sha2_password image not found

## Problem

MySQL 8.0's root password encryption uses the `caching_sha2_password` plugin. However, MySQL client software like MySQL Workbench or Sequel Pro cannot find this plugin.

When running a query in the MySQL shell:

```sql
mysql> select user, host, plugin, authentication_string from user\G;
```

The output shows that the root user is configured with `caching_sha2_password`:

```
user: root
host: localhost
plugin: caching_sha2_password
authentication_string: $A$005$_94d4m...
```

This incompatibility prevents third-party MySQL clients from connecting using the root account.

## Current Solutions

**Modify encryption rules:**

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password' PASSWORD EXPIRE NEVER;
```

**Update password and flush privileges:**

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;
```

**Reset password:**

```sql
ALTER user 'root'@'localhost' identified by '{YOUR_PASSWORD}';
```

These commands switch the authentication method from `caching_sha2_password` to `mysql_native_password`, enabling compatibility with standard MySQL clients.
