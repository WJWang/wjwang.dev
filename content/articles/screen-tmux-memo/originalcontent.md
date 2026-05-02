# screen & tmux Memo

## screen Commands
- **INIT:** `screen -S NAME`
- **EXIT:** `ctrl+a ctrl+d`
- **REATTACH:** `screen -r NAME`
- **DETACH:** `screen -rd NAME`

## tmux Commands
- `tmux new -s {name}`
- `tmux ls`
- `tmux a -t`
- `tmux kill-session -t`
- `c-b + [` for scrolling up and down, press `q` to exit
- `c-b + z` zoom in / out
- `c-b + o` + num go to target pane

## References
- [screen usage](https://blog.gtwang.org/linux/screen-command-examples-to-manage-linux-terminals/)
- [tmux usage](https://tmux.github.io/)
- [Scrolling in tmux](https://superuser.com/questions/209437/how-do-i-scroll-in-tmux)
