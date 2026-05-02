import {
  Prose,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>To install Node.js on macOS, follow these three steps:</p>

      <ol>
        <li>Download a current version node from the official website</li>
        <li>Install <a href="https://github.com/tj/n">n</a> or <a href="https://github.com/creationix/nvm">nvm</a></li>
        <li>Install the version you need from the node version control system.</li>
      </ol>

      <p>原文發表於 <a href="https://wjwang.medium.com/nodejs-installation-macos-c27cb0310e98">Medium</a></p>
    </Prose>
  );
}
