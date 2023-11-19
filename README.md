[![Actions Status](https://github.com/acfohegi/backend-project-4/workflows/hexlet-check/badge.svg)](https://github.com/acfohegi/backend-project-4/actions)
[![test](https://github.com/acfohegi/backend-project-4/actions/workflows/test.yml/badge.svg)](https://github.com/acfohegi/backend-project-4/actions/workflows/test.yml)
[![lint](https://github.com/acfohegi/backend-project-4/actions/workflows/lint.yml/badge.svg)](https://github.com/acfohegi/backend-project-4/actions/workflows/lint.yml)

[![Maintainability](https://api.codeclimate.com/v1/badges/81e15e6871e6059e6f5f/maintainability)](https://codeclimate.com/github/acfohegi/backend-project-4/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/81e15e6871e6059e6f5f/test_coverage)](https://codeclimate.com/github/acfohegi/backend-project-4/test_coverage)

# Usage

```
Usage: page-loader [options] <url>

Page loader utility

Options:
  -V, --version       output the version number
  -o, --output [dir]  output dir (default: current working directory)
  -h, --help          display help for command
```

# Description

page-loader is a study project from the [Hexlet course](https://ru.hexlet.io/programs/backend/projects/4). 

The utility saves a web-page and its sources to a specified path. Paths for sources are replaced for local files in a final HTML. A source is saved if it comes from the same origin. Only sources from tags 'img', 'link', 'script' are processed.

All the asynchronous code is based on explicit promises. That was the task's requirement. `async/await` were allowed to use in tests only. The set of supported tags, naming rules and other implementation aspects are also based on requirements. Tests have mocks for filesystem and network.

# Demo

### Loading

[![asciicast](https://asciinema.org/a/621293.svg)](https://asciinema.org/a/621293)

### Logging

[![asciicast](https://asciinema.org/a/621904.svg)](https://asciinema.org/a/621904)

### Error handling

[![asciicast](https://asciinema.org/a/621900.svg)](https://asciinema.org/a/621900)

