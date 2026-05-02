import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>1. Install homebrew</h2>

      <CodeBlock language="bash">{`brew update
brew install php71`}</CodeBlock>

      <h2>2. Install different version php</h2>

      <CodeBlock language="bash">{`brew unlink [current php symlinks] // ex. php unlink php71
brew install php56
brew link php56`}</CodeBlock>

      <h2>3. Change php version</h2>

      <CodeBlock language="bash">{`brew services stop [current php] // ex. brew services stop php71
brew unlink [current php symlinks] // ex. php unlink php71
brew link php56`}</CodeBlock>

      <h2>Reference</h2>

      <ul>
        <li><a href="https://dyrynda.com.au/blog/switching-php-versions-with-laravel-valet">Michael Dyrynda | Switching PHP versions with Laravel Valet</a></li>
        <li><a href="https://jigsawye.com/2016/02/01/setup-laravel-development-environment-with-homebrew/">在 OSX 使用 Homebrew 打造精巧的 Laravel 開發環境</a></li>
        <li><a href="https://laravel.com/docs/5.4/valet">Laravel Valet - Laravel - The PHP Framework For Web Artisans</a></li>
      </ul>

      <p>原文發表於 <a href="https://wjwang.medium.com/php-macos-version-control-homebrew-72be1fc692c9">Medium</a></p>
    </Prose>
  );
}
