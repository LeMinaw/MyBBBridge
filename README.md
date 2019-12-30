# MyBBBridge

MyBBBridge is an extension aimed at making MyBB template and theme dev more convenant.

**Warning: this software is pre-alpha. Make backups and use it at your own risk.**

## Features

* Downloading theme (`.css`) and templates (`.html`) files from database to disk.

## How to use

### Configuration

To operate, MyBBBridge *needs* a `.vscode/mbbb.json` file at your workspace root.

You can create one using the command `MyBBBridge: Create config file`.

The default config file looks like this and should be quite self explanatory:

```json
{
    "database": {
        "host": "localhost",
        "port": 3306,
        "database": "mybb",
        "prefix": "mybb_",
        "user": "root",
        "password": ""
    },
    "mybb_version": 1860
}
```

* `mybb_version`: MyBB version to be used in newly created theme files. Existing files
  will keep their version metadata.

### Commands

* `MyBBBridge: Create config file`: Create a new config file, allowing you to start
  using MyBBBridge.

* `MyBBBridge: Load MyBB template set from database`: Download and save all templates
  files of a given template set to the `./template_sets/<template_set_name>/` folder.
  *Overrides existing files without confirmation!*

* `MyBBBridge: Load MyBB style from database`: Download and save all stylesheet files
  of a given style to the `./styles/<style_name>/` folder.
  *Overrides existing files without confirmation!*

## Release Notes

### 0.0.1-alpha

Alpha release providing basic download features.
