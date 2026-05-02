import {
  Prose,
  CodeBlock,
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

      <h2>Overview</h2>

      <p>本篇說明如何用 Jenkins、Docker、Nginx 建立靜態網頁專案的 CI/CD pipeline。</p>

      <h2>Setup Steps</h2>

      <ol>
        <li>初始化專案</li>
        <li>Push 到 GitLab repository，取得 repository URI</li>
        <li>建立 Jenkins 專用的 GitLab 使用者，設定 SSH 金鑰（public key）</li>
        <li>
          在 Docker 上跑 Nginx 容器，掛載靜態內容與 nginx 設定檔兩個 volume：
          <CodeBlock language="bash">{`sudo docker run --name um1215-client \\
  -v /home/administrator/um1215/:/usr/share/nginx/html:ro \\
  -v /home/administrator/um1215/nginx.conf:/etc/nginx/nginx.conf:ro \\
  -p 21201:80 -d --restart=unless-stopped nginx`}</CodeBlock>
          參考：<a href="https://gist.github.com/WJWang/9467a79bc3467d0bdfc3d2baf29e6da3">nginx.conf 設定範例</a>
        </li>
        <li>
          設定 Jenkins task：
          <ul>
            <li>取得 webhook 連結並加入 GitLab</li>
            <li>設定 private key 與 repository URI 以供 Jenkins 取得專案</li>
            <li>若使用 Node.js，選擇 nvm wrapper 並指定版本</li>
            <li>新增 shell 建置指令：
              <CodeBlock language="bash">{`npm install
npm install -d
npm run build`}</CodeBlock>
            </li>
          </ul>
        </li>
        <li>設定 Publish Over SSH</li>
        <li>完成設定</li>
      </ol>

      <p>原文發表於 <a href="https://wjwang.medium.com/ci-tool-chain-with-docker-4-bootstrap-jenkins-with-static-web-project-nginx-c19371e9a9b2">Medium</a></p>
    </Prose>
  );
}
