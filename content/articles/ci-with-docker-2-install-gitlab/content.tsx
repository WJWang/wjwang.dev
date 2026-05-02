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

      <h2>安裝 GitLab</h2>

      <h3>Step1 產生亂數 Secret DB key</h3>

      <CodeBlock language="bash">{`$ sudo apt-get install pwgen
$ pwgen -Bsv1 64
# 此時會印出如下方的一串亂數，請複製下來
HRFwJRdhsjk4VTNmdxCxzFfJcnFJLnwbqVwsfrphdX7mbmHvmxVc9X74RTwVvTmb`}</CodeBlock>

      <Callout variant="info">
        目前 GitLab 所使用的 Secret DB Key 為：<strong>HRFwJRdhsjk4VTNmdxCxzFfJcnFJLnwbqVwsfrphdX7mbmHvmxVc9X74RTwVvTmb</strong>
      </Callout>

      <h3>Step2 安裝所需的 postgresql DB</h3>

      <CodeBlock language="bash">{`$ sudo docker run --name gitlab-postgresql -d \\
    --env 'DB_NAME=gitlabhq_production' \\
    --env 'DB_USER=gitlab' --env 'DB_PASS=password' \\
    --env 'DB_EXTENSION=pg_trgm' \\
    --volume /srv/docker/gitlab/postgresql:/var/lib/postgresql \\
    --restart always \\
    sameersbn/postgresql:9.4-24`}</CodeBlock>

      <h3>Step3 安裝所需的 redis</h3>

      <CodeBlock language="bash">{`$ sudo docker run --name gitlab-redis -d \\
    --volume /srv/docker/gitlab/redis:/var/lib/redis \\
    --restart always \\
    sameersbn/redis:latest`}</CodeBlock>

      <h3>Step4 安裝 GitLab</h3>

      <CodeBlock language="bash">{`$ sudo docker run --name gitlab -d \\
    --link gitlab-postgresql:postgresql --link gitlab-redis:redisio \\
    --publish 10022:22 --publish 10080:80 \\
    --env 'GITLAB_HOST=140.118.5.12' \\
    --env 'GITLAB_PORT=10080' --env 'GITLAB_SSH_PORT=10022' \\
    --env 'GITLAB_SECRETS_DB_KEY_BASE=HRFwJRdhsjk4VTNmdxCxzFfJcnFJLnwbqVwsfrphdX7mbmHvmxVc9X74RTwVvTmb' \\
    --volume /srv/docker/gitlab/gitlab:/home/git/data \\
    sameersbn/gitlab:8.10.2`}</CodeBlock>

      <Callout variant="info">
        GITLAB_SECRETS_DB_KEY_BASE 請輸入剛剛生成的亂數 Secret DB key。
      </Callout>

      <h3>Step5 使用 Gitlab</h3>

      <p>
        開啟瀏覽器，輸入 <code>http://[IP / Domain]:10080/</code> 進入 Gitlab 首頁。
      </p>

      <p>
        由於未設定自動寄信服務（需另外設定 smtp server），新使用者註冊後，需由管理者帳號進入幫新註冊的使用者進行 confirm 的動作才能正常使用。
      </p>

      <p>原文發表於 <a href="https://wjwang.medium.com/ci-tool-chain-with-docker-2-install-gitlab-f5cc96320100">Medium</a></p>
    </Prose>
  );
}
