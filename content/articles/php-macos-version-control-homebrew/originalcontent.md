# PHP macOS & version control (Homebrew)

## 1. Install homebrew

```bash
brew update
brew install php71
```

## 2. Install different version php

```bash
brew unlink [current php symlinks] // ex. php unlink php71
brew install php56
brew link php56
```

## 3. Change php version

```bash
brew services stop [current php] // ex. brew services stop php71
brew unlink [current php symlinks] // ex. php unlink php71
brew link php56
```

## Reference

- [Michael Dyrynda | Switching PHP versions with Laravel Valet](https://dyrynda.com.au/blog/switching-php-versions-with-laravel-valet)
- [在 OSX 使用 Homebrew 打造精巧的 Laravel 開發環境](https://jigsawye.com/2016/02/01/setup-laravel-development-environment-with-homebrew/)
- [Laravel Valet - Laravel - The PHP Framework For Web Artisans](https://laravel.com/docs/5.4/valet)
