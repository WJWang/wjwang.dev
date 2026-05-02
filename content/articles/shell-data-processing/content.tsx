import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        Shell 文字處理工具是處理「繁瑣但非重複性」資料任務的最順手工具。這類工作不值得專門寫一個應用程式，但用 Shell 指令組合就能快速完成。TSV 檔案是常見的中間格式，之後再轉成 Excel。
      </p>

      <h2>Database 整合</h2>

      <h3>MySQL</h3>

      <CodeBlock language="bash">{`echo "SELECT * FROM users ..." | mysql --host=[host] --user=[usr] --password=[password] --default-character-set=utf8 [DB_NAME]

cat [sql file] | mysql --host=[host] --user=[usr] --password=[password] --default-character-set=utf8 [DB_NAME] | tee sql_result.tsv | head -n 10`}</CodeBlock>

      <h3>PostgreSQL</h3>

      <CodeBlock language="bash">{`echo '[YOUR_SQL]'| PGPASSWORD=[YOUR_PASSWORD] psql -U [user] -h [host] -p [port]| head -n 10`}</CodeBlock>

      <h2>指令參考</h2>

      <h3>Redirection: &gt; 與 &gt;&gt;</h3>

      <CodeBlock language="bash">{`$ ls -l ... > tmp.txt      # Overwrite file
$ ls -l ... >> tmp.txt     # Append to file`}</CodeBlock>

      <h3>cat: 顯示檔案</h3>

      <CodeBlock language="bash">{`$ cat [file]               # Display file contents
$ cat -n [file]            # Show with line numbers
$ cat -s [file]            # Suppress multiple blank lines
$ cat > [file]             # Create/overwrite (Ctrl+D to exit)
$ cat >> [file]            # Append (Ctrl+D to exit)`}</CodeBlock>

      <h3>pipe: | 資料串流</h3>

      <CodeBlock language="bash">{`$ cmd1 | cmd2 | cmd3 | ...
# Example: paginate long output
$ ls -al / | less`}</CodeBlock>

      <h3>find: 搜尋檔案</h3>

      <CodeBlock language="bash">{`$ find [path] [conditions] [actions] [options]

# Find all files in home directory
$ find ~ -type f

# Find PNG files
$ find ~ -type f -name '*.png'

# Complex conditions with OR
$ find ~ \( -type f -not -perm 0600 \) -or \( -type d -not -perm 0700 \)

# Execute actions
$ find ~/Desktop -type f -name '*.png' -print | xargs ls -l`}</CodeBlock>

      <h3>head, tail: 前幾行 / 後幾行</h3>

      <CodeBlock language="bash">{`$ ls -al /bin/usr | head         # First 10 lines
$ ls -al /bin/usr | head -n 5    # First 5 lines
$ ls -al /bin/usr | tail         # Last 10 lines
$ ls -al /bin/usr | tail -n 5    # Last 5 lines`}</CodeBlock>

      <h3>wc: 字數 / 行數統計</h3>

      <CodeBlock language="bash">{`$ wc ~/Desktop/event.js
# Output: lines  words  bytes  filepath
300     757    8813    /Users/wangwilliam/Desktop/event.js

$ wc -l [file]               # Line count only
$ ls -1 [path] | wc -l       # Count files in directory`}</CodeBlock>

      <h3>tee: T 型管線輸出</h3>

      <CodeBlock language="bash">{`# Read stdin, write to both stdout and file
$ ls -al /usr/bin | tee ~/Desktop/tmp.txt | less`}</CodeBlock>

      <h3>grep: 模式比對</h3>

      <CodeBlock language="bash">{`$ grep [options] pattern file

# Options:
# -i   : Case-insensitive
# -v   : Invert match (non-matching lines)
# -c   : Count matches
# -n   : Show line numbers
# -E   : Extended regex

$ ls -al | grep -E '^[a-zA-Zl]{3}'`}</CodeBlock>

      <h3>sort: 排序</h3>

      <CodeBlock language="bash">{`# Sort by 5th field (file size), descending numeric
$ ls -al ~ | sort -nr -k 5

# Sort by column 3, character 7
$ sort -k 3.7 filename

# Options:
# -n   : Numeric sort
# -r   : Reverse sort
# -t   : Field delimiter (default Tab)
# -k   : Field to sort`}</CodeBlock>

      <h3>uniq: 去除重複</h3>

      <CodeBlock language="bash">{`$ cat test.tsv | sort | uniq
# Note: uniq only removes adjacent duplicates; sort first`}</CodeBlock>

      <h3>cut: 擷取欄位</h3>

      <CodeBlock language="bash">{`# Extract fields 1 and 3 (tab-delimited)
$ cat iris.data.tsv | cut -f 1,3 | head

# Using colon delimiter for /etc/passwd
$ cut -d ':' -f 1 /etc/passwd
$ cat /etc/passwd | cut -d ':' -f 1

# Extract by character positions
$ ls -l | cut -c 1-10`}</CodeBlock>

      <h3>paste: 合併檔案</h3>

      <CodeBlock language="bash">{`# Rearrange columns by extracting and pasting files
$ cut -f 1 iris.data.tsv > iris.data.first.tsv
$ cut -f 5 iris.data.tsv > iris.data.fifth.tsv
$ cut -f 2,3,4 iris.data.tsv > iris.data.else.tsv

$ paste iris.data.fifth.tsv iris.data.else.tsv iris.data.first.tsv`}</CodeBlock>

      <h3>comm: 比較兩個檔案</h3>

      <CodeBlock language="bash">{`$ comm A.txt B.txt
# Three-column output: (only A) (only B) (both)

$ comm -1 A.txt B.txt    # Only show columns 2,3
$ comm -2 A.txt B.txt    # Only show columns 1,3
$ comm -3 A.txt B.txt    # Only show columns 1,2`}</CodeBlock>

      <h3>diff, patch: 差異比對</h3>

      <CodeBlock language="bash">{`# Diff operations
$ diff file1 file2
$ diff -w file1 file2              # Ignore whitespace
$ diff -y file1 file2              # Side-by-side view
$ diff -r directory1 directory2    # Recursive directories
$ diff -rq directory1 directory2   # Only filenames

# Patch operations
$ patch < patch_file.diff
$ patch -p1 < patch_file.diff
$ patch -R < patch_file.diff       # Reverse patch`}</CodeBlock>

      <h3>split: 分割大檔案</h3>

      <CodeBlock language="bash">{`$ split -l 10 filename             # 10 lines per file
$ split -n 5 filename              # Split into 5 equal files
$ split -C 512 filename            # 512 bytes max per file`}</CodeBlock>

      <h3>tr: 字元轉換</h3>

      <CodeBlock language="bash">{`$ tr find_characters replace_characters < filename
$ tr 'abcd' 'jkmn' < filename
$ tr -d 'input_characters' < filename           # Delete characters
$ tr -s 'input_characters' < filename           # Compress duplicates
$ tr "[:lower:]" "[:upper:]" < filename        # Uppercase
$ tr -cd "[:print:]" < filename                # Remove non-printable`}</CodeBlock>

      <h3>sed: 串流編輯器</h3>

      <CodeBlock language="bash">{`$ sed 's/find/replace/' filename               # Replace first
$ sed -E 's/regex/replace/g' filename          # Extended regex, global
$ sed -i '' 's/find/replace/g' filename        # In-place edit
$ sed '/line_pattern/s/find/replace/' filename # Conditional replace
$ sed -e 's/find/replace/' -e 's/find/replace/' filename
$ sed 's#find#replace#' filename               # Alternative delimiter`}</CodeBlock>

      <h3>awk: 文字處理</h3>

      <CodeBlock language="bash">{`$ awk '{print $5}' filename                    # Print 5th column
$ awk '/something/ {print $2}' filename        # Conditional print
$ awk -F ',' '{print $NF}' filename            # Last column, comma-delimited
$ awk '{s+=$1} END {print s}' filename         # Sum first column
$ awk '{s+=$1; print $1} END {print "--------"; print s}' filename`}</CodeBlock>

      <h3>xargs: 建立參數</h3>

      <CodeBlock language="bash">{`$ arguments_source | xargs command

# Delete backup files
$ find . -name '*.backup' | xargs rm -v

# Handle spaces in filenames
$ arguments_source | tr '\n' '\0' | xargs -0 command

# Replace placeholder
$ arguments_source | xargs -I _ command _ optional_extra_arguments

# Parallel processing (11 processes)
$ mkdir ~/tmp_work
$ split -l 6000 ~/big_tsv_file.tsv ~/tmp_work/
$ ls ~/tmp_work | xargs -P 11 -I %X bash -c "cat %X | php ~/processor.php" > tmp.txt`}</CodeBlock>

      <h3>rsync: 檔案同步</h3>

      <CodeBlock language="bash">{`$ rsync path/to/file remote_host_name:remote_location
$ rsync remote_host_name:remote_file local_location
$ rsync -az path/to/file remote_host_name:remote_location
$ rsync -r remote_host_name:remote_folder local_folder
$ rsync -ru remote_host_name:remote_folder local_folder
$ rsync -e ssh --progress remote_host_name:remote_file local_file`}</CodeBlock>

      <h3>ssh: 遠端連線</h3>

      <CodeBlock language="bash">{`$ ssh [user]@[server] -p [ssh_port]
$ ssh [user]@[server] -i [key_file]
$ ssh [user]@[server] '[command]'

# Execute remote SQL
$ ssh william@remote-server 'echo "SELECT * FROM users;" | mysql --host=[host] --user=[usr] --password=[password] --default-character-set=utf8 [DB_NAME]'`}</CodeBlock>

      <h3>scp: 安全複製</h3>

      <CodeBlock language="bash">{`$ scp -i [key_file] [local_file] [remote_user]@[remote_server]:[remote_path]
$ scp -i [key_file] [remote_user]@[remote_server]:[remote_file] [local_path]
$ scp -r -P 22000 [local_file] [remote_user]@[remote_server]:[remote_path]
$ scp -3 host1:remote_file host2:remote_dir
$ scp -i ~/.ssh/private_key local_file remote_host:/path/remote_file`}</CodeBlock>

      <h3>stat: 檔案狀態</h3>

      <CodeBlock language="bash">{`$ stat -x fetch.php
# Output includes: File size, type, permissions, owner, timestamps`}</CodeBlock>

      <h2>指令歷史與工作流程</h2>

      <ul>
        <li>使用 <code>history</code> 搭配 <code>![line_number]</code> 重新執行過去的指令</li>
        <li>使用 <code>Ctrl+R [keyword]</code> 搜尋歷史（下一個：Ctrl+R，上一個：Ctrl+Shift+R）</li>
        <li>將固定邏輯的指令組合寫成 shell script 以便重複使用</li>
      </ul>

      <p>原文發表於 <a href="https://wjwang.medium.com/%E4%BD%BF%E7%94%A8shell%E9%80%B2%E8%A1%8C%E8%B3%87%E6%96%99%E8%99%95%E7%90%86-f1a078967200">Medium</a></p>
    </Prose>
  );
}
