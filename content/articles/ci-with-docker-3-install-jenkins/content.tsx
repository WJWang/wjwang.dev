import {
  Prose,
  CodeBlock,
  Callout,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>系列文章：</p>
      <ul>
        <li><a href="/articles/ci-with-docker-1-install-docker">(1) 安裝 Docker</a></li>
        <li><a href="/articles/ci-with-docker-2-install-gitlab">(2) 安裝 GitLab</a></li>
        <li><a href="/articles/ci-with-docker-3-install-jenkins">(3) 安裝 Jenkins</a></li>
        <li><a href="/articles/ci-with-docker-4-jenkins-nginx">(4) Bootstrap Jenkins with static web project nginx</a></li>
      </ul>

      <h2>安裝 Jenkins CI</h2>

      <h3>Step1. 建立 Jenkins 資料夾並啟動容器</h3>

      <CodeBlock language="bash">{`$ mkdir /srv/jenkins
$ sudo chown 1000 /srv/jenkins
$ sudo chmod  775 /srv/jenkins
$ sudo docker run --name jenkins -p 8888:8080 -p 50000:50000 -v /srv/jenkins:/var/jenkins_home -d --restart unless-stopped jenkins`}</CodeBlock>

      <h3>Step2. 取得初始登入密碼</h3>

      <p>進入 Docker GUI，前往 <strong>Containers → jenkins → stdout/stderr</strong>，在 STDERR 區找到亂數字串密碼：</p>

      <CodeBlock language="bash">{`Jenkins initial setup is required. An admin user has been created and a password generated.
Please use the following password to proceed to installation:

e956cf3e8a4c4aa392f5396653255d78

This may also be found at: /var/jenkins_home/secrets/initialAdminPassword`}</CodeBlock>

      <h3>Step3. 第一次登入 Jenkins</h3>

      <p>透過 <code>http://&lt;IP/Domain&gt;:8888/</code> 存取，輸入 Step2 的初始密碼。</p>

      <h3>Step4. 安裝建議外掛</h3>

      <p>選擇 <strong>Install Suggested Plugin</strong>，讓 Jenkins 自動安裝常用外掛。</p>

      <h3>Step5. 等待外掛安裝完成</h3>

      <h3>Step6. 完成初始設定</h3>

      <h3>Step7. 安裝額外所需外掛</h3>

      <p>前往 <strong>管理 Jenkins → 管理外掛程式 → 可用的</strong>，搜尋並安裝：</p>

      <ul>
        <li>Docker Commons Plugin</li>
        <li>Docker build step plugin</li>
        <li>Git plugin</li>
        <li>Gitlab Hook Plugin</li>
        <li>Gitlab Merge Request Builder</li>
        <li>Publish Over SSH</li>
        <li>Slack Notification Plugin</li>
        <li>SSH plugin</li>
        <li>Maven Integration plugin（Maven 專案用）</li>
        <li>nvm wrapper（Node.js 專案用）</li>
      </ul>

      <Callout variant="warn">
        網路問題可能導致安裝失敗，重啟 Jenkins 後重試即可。
      </Callout>

      <h3>Step8. 等待外掛安裝完成</h3>

      <h3>Step9. 重啟 Jenkins</h3>

      <p>在瀏覽器輸入 <code>http://&lt;IP/Domain&gt;:8888/restart</code> 並確認。</p>

      <h3>Step10. 設定 Docker Builder plugin</h3>

      <p>前往 <strong>管理 Jenkins → 設定系統</strong>，找到 <strong>Docker Builder</strong>，將 <code>Docker URL</code> 設為：</p>

      <CodeBlock language="bash">{`http://<IP/Domain>:2376`}</CodeBlock>

      <Callout variant="info">
        先存檔再使用 Test Connection 按鈕測試。
      </Callout>

      <h3>Step11. 設定 Jenkins 的 SSH 金鑰</h3>

      <CodeBlock language="bash">{`$ sudo su
$ cd /srv/jenkins/
$ mkdir .ssh
$ cp /root/.ssh/id_rsa* /srv/jenkins/.ssh/.
$ chown -R 1000 /srv/jenkins/.ssh
$ chmod -R  775 /srv/jenkins/.ssh
$ exit`}</CodeBlock>

      <h3>Step12. 設定 Publish over SSH plugin</h3>

      <p>前往 <strong>管理 Jenkins → 設定系統</strong>，找到 <strong>Publish over SSH</strong>，將 <code>Path to Key</code> 設為 <code>.ssh/id_rsa</code>，並在 <strong>SSH Servers</strong> 新增遠端主機：</p>

      <ul>
        <li>Name: <code>[USER]@[IP/FQDN]</code></li>
        <li>Hostname: <code>[IP]</code></li>
        <li>Username: <code>[USER]</code></li>
        <li>Remote Directory: <code>/</code></li>
        <li>Port: <code>[ssh port number]</code>（展開 Advanced）</li>
      </ul>

      <h3>Step13. 設定 SSH Plugin</h3>

      <p>前往 <strong>管理 Jenkins → 設定系統</strong>，找到 <strong>SSH remote hosts</strong>，在 <strong>SSH sites</strong> 新增：</p>

      <ul>
        <li>Hostname: <code>[IP]</code></li>
        <li>Port: <code>[ssh port number]</code></li>
        <li>Username: <code>[USER]</code></li>
        <li>Keyfile: <code>/var/jenkins_home/.ssh/id_rsa</code></li>
        <li>Pty: ✓（勾選）</li>
        <li>serverAliveInterval: <code>0</code></li>
      </ul>

      <Callout variant="info">
        初次存檔可能出現 Connection Refused 訊息，此為前端 bug，不影響功能。
      </Callout>

      <p>原文發表於 <a href="https://wjwang.medium.com/ci-tool-chain-with-docker-3-install-jenkins-34f30364b17e">Medium</a></p>
    </Prose>
  );
}
