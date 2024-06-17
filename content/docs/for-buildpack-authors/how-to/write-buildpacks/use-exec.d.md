+++
title="Use exec.d binaries to configure the application at runtime"
weight=99
+++

<!--more-->

The [buildpacks `exec.d` interface](https://github.com/buildpacks/spec/blob/main/buildpack.md#execd) allows buildpack authors to execute custom scripts or binaries when the application image is started. This interface can be particularly useful for injecting dynamic behavior or environment variables into the runtime environment of an application.

## Key Points:

    1. Location and Naming: Scripts are placed in the `<layer>/exec.d/` directory within a launch layer and must be executable. They can have any name.

    2. Script Behavior:
    * **Inputs**
        * A third open file descriptor (in addition to stdout and stderr).  The third open file descriptor is inherited from the calling process.
    * **Outputs**
        * Valid TOML describing environment variables in the form of key=value pairs. These variables are added to the application's runtime environment. The content should be written to file descriptor 3 (see examples for how to do this).
        * Exit Code: The scripts should exit with a status code of `0` to indicate success. A non-zero exit code will indicate an error and prevent the application from launching.

## Use Cases:
* Dynamic Configuration: Inject configuration values that are determined at runtime.
* Service Bindings: Configure environment variables based on bound services.

## Implementation Steps:
* Write Scripts: Create executable scripts within the `<layer>/exec.d/` directory.
* Set Permissions: Ensure scripts have the appropriate execute permissions (chmod +x).
* Environment Variables: Use scripts to print `key="value"` pairs to the third open file descriptor.

### Examples

`exec.d` executables can be written in any language.  We provide examples in bash, Go and Python that inject the `EXAMPLE="test"` into the runtime environment.  It is important that environment variables are written to the third file descriptor which is inherited by the `exec.d` binary.

A `bash` example looks as follows:
```bash
#!/bin/bash

# Use the third file descriptor
FD=&3

# Output the environment variable EXAMPLE="test" to the specified file descriptor
echo "EXAMPLE=\"test\"" >&$FD
```

And a `Go` example is:
```Go
package main

import (
	"fmt"
	"os"
)

func main() {
	// Open file descriptor 3 for writing
	fd3 := os.NewFile(3, "fd3")
	if fd3 == nil {
		fmt.Println("Failed to open file descriptor 3")
		return
	}

	// Write the environment variable to file descriptor 3
	_, err := fd3.WriteString(`EXAMPLE="test"\n`)
	if err != nil {
		fmt.Println("Error writing to file descriptor 3:", err)
	}
}
```
Finally, we provide a short Python example:
```Python
import os
import sys

def main():
    # Use file descriptor 3
    fd = 3

    # Write the environment variable to the given file descriptor
    os.write(fd, b'EXAMPLE="test"\n')

if __name__ == "__main__":
    main()
```

The `exec.d` interface provides a powerful mechanism for dynamically configuring runtime environments in a flexible and programmable manner, enhancing the customization capabilities available to application programmers using buildpacks.