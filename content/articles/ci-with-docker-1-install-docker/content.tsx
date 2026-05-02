import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>環境</h2>

      <ul>
        <li>Ubuntu Server 14.04 LTS</li>
      </ul>

      <h2>簡介</h2>

      <p>主要以 Docker 方式安裝以下服務：</p>

      <ul>
        <li>DockerUI</li>
        <li>GitLab</li>
        <li>Jenkins</li>
      </ul>

      <p>系列文章：</p>
      <ul>
        <li><a href="/articles/ci-with-docker-1-install-docker">(1) 安裝 Docker</a></li>
        <li><a href="/articles/ci-with-docker-2-install-gitlab">(2) 安裝 GitLab</a></li>
        <li><a href="/articles/ci-with-docker-3-install-jenkins">(3) 安裝 Jenkins</a></li>
        <li><a href="/articles/ci-with-docker-4-jenkins-nginx">(4) Bootstrap Jenkins with static web project nginx</a></li>
      </ul>

      <h2>安裝 Docker</h2>

      <p>主要參考 <a href="https://docs.docker.com/engine/installation/linux/ubuntulinux/">Docker 官方網站的教學</a>，使用 Ubuntu 14.04 的安裝方式：</p>

      <CodeBlock language="bash">{`$ sudo apt-get update
$ sudo apt-get install apt-transport-https ca-certificates
$ sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D`}</CodeBlock>

      <h3>編輯 /etc/apt/sources.list.d/docker.list</h3>

      <p>若 <code>/etc/apt/sources.list.d/docker.list</code> 不存在就自己建立。打開後清空所有內容，加入以下這行：</p>

      <CodeBlock language="bash">{`deb https://apt.dockerproject.org/repo ubuntu-trusty main`}</CodeBlock>

      <CodeBlock language="bash">{`$ sudo apt-get update

# Purge the old repo if it exists
$ sudo apt-get purge lxc-docker

$ apt-cache policy docker-engine
$ sudo apt-get install linux-image-extra-$(uname -r)
$ sudo apt-get install docker-engine
$ sudo service docker start`}</CodeBlock>

      <h3>啟用 Docker Engine REST API</h3>

      <CodeBlock language="bash">{`$ sudo vim /etc/init/docker.conf`}</CodeBlock>

      <p>找到如下區塊，把 <code>DOCKER_OPTS=</code> 改成：</p>

      <CodeBlock language="bash">{`script
        DOCKERD=/usr/bin/dockerd
        DOCKER_OPTS='-H tcp://0.0.0.0:2376 -H unix:///var/run/docker.sock'
        if [ -f /etc/default/$UPSTART_JOB ]; then
                . /etc/default/$UPSTART_JOB
        fi
        exec "$DOCKERD" $DOCKER_OPTS --raw-logs
end script`}</CodeBlock>

      <p>然後重開 Docker：</p>

      <CodeBlock language="bash">{`$ sudo service docker restart`}</CodeBlock>

      <h3>安裝 Docker GUI 監控工具</h3>

      <CodeBlock language="bash">{`$ sudo docker run -d -p 9090:9000 --privileged -v /var/run/docker.sock:/var/run/docker.sock --restart always uifd/ui-for-docker`}</CodeBlock>

      <h3>用 Apache 保護 Docker GUI 監控工具</h3>

      <p>若無安全性疑慮可以跳過此步驟。</p>

      <h4>Step1. 安裝 Apache2 以及 proxy module</h4>

      <CodeBlock language="bash">{`$ sudo apt-get update
$ sudo apt-get install apache2
$ sudo apt-get install -y build-essential
$ sudo apt-get install -y libapache2-mod-proxy-html libxml2-dev
$ sudo apt-get install apache2-utils`}</CodeBlock>

      <h4>Step2. 啟用 proxy module</h4>

      <CodeBlock language="bash">{`$ sudo a2enmod
# 系統接著會詢問你要啟用什麼 module，請輸入：
proxy proxy_ajp proxy_http rewrite deflate headers proxy_balancer proxy_connect proxy_html`}</CodeBlock>

      <h4>Step3. 設定反向代理</h4>

      <CodeBlock language="bash">{`$ sudo vim /etc/apache2/sites-enabled/000-default.conf`}</CodeBlock>

      <p>在 <code>{'<VirtualHost *:80>'}</code> 的區塊內，加入以下：</p>

      <CodeBlock language="apache">{`ProxyPreserveHost On
ProxyPass /docker-ui/ http://localhost:9090/
ProxyPassReverse /docker-ui/ http://localhost:9090/`}</CodeBlock>

      <h4>Step4. 用密碼保護 GUI 介面</h4>

      <CodeBlock language="bash">{`$ sudo mkdir /etc/htpasswd
$ sudo htpasswd -c /etc/htpasswd/.htpasswd [你設定的帳號]
# 此時會問密碼要設為什麼？ 回答 [你設定的密碼]`}</CodeBlock>

      <p>再次編輯 Apache2 設定檔，在 <code>{'<VirtualHost *:80>'}</code> 的區塊<strong>之後</strong>加入：</p>

      <CodeBlock language="apache">{`<Location /docker-ui>
        AuthType Basic
        AuthName "Authentication Required"
        AuthUserFile "/etc/htpasswd/.htpasswd"
        Require valid-user

        Order allow,deny
        Allow from all
</Location>`}</CodeBlock>

      <h4>Step5. 重新啟動 Apache2</h4>

      <CodeBlock language="bash">{`$ sudo /etc/init.d/apache2 restart`}</CodeBlock>

      <h4>Step7. 測試</h4>

      <p>
        由於已在路由器設定外網 80 port 指向 master 節點的 80 port（即剛安裝好的 Apache2），在外部瀏覽器輸入 <code>http://[host-ip/domain]/docker-ui/</code> 後會被詢問密碼，通過後即可看到 Docker GUI 管理介面。
      </p>

      <p>原文發表於 <a href="https://wjwang.medium.com/ci-tool-chain-with-docker-1-install-docker-63e9751e87cd">Medium</a></p>
    </Prose>
  );
}
