+++
title="Use exec.d binaries to configure the application at runtime"
weight=99
+++

<!--more-->

The [buildpacks `exec.d` interface](https://github.com/buildpacks/spec/blob/main/buildpack.md#execd) allows buildpack authors to execute custom scripts or binaries when the application image is started. This interface can be particularly useful for injecting dynamic behavior or environment variables into the runtime environment of an application.

## Key Points:

    1. Location and Naming: Scripts are placed in the `<layer>/exec.d/` directory within a launch layer and must be executable. They can have any name.

    2. Script Behavior:
        * Environment Variables: Scripts can output environment variables in the form of key=value pairs. These variables are added to the application's runtime environment.
        * File descriptor 3: The output should be directed to file descriptor 3, passed as the first argument to the executable, for environment variable settings. Any other output is ignored.
        * Exit Code: The scripts should exit with a status code of `0` to indicate success. A non-zero exit code will indicate an error and prevent the application from launching.

## Use Cases:
* Dynamic Configuration: Inject configuration values that are determined at runtime.
* Service Bindings: Configure environment variables based on bound services.

## Implementation:
* Write Scripts: Create executable scripts within the `<layer>/exec.d/` directory.
* Set Permissions: Ensure scripts have the appropriate execute permissions (chmod +x).
* Environment Variables: Use scripts to print `key="value"` pairs to the file descriptor passed as the first argument to the executable.

### Example

`exec.d` executables can be written in any language.  We provide examples in bash, Go and Python that inject the `EXAMPLE="test"` into the runtime environment.  It is important that environment variables are written to the open file descriptor passed as the first argument to the `exec.d` binary.

A `bash` example looks as follows:
```bash
#!/bin/bash

# Get the file descriptor from the first argument
FD=$1

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
    // Convert the file descriptor argument to an integer
    fd, err := strconv.Atoi(os.Args[1])
    if err != nil {
        fmt.Println("Invalid file descriptor:", os.Args[1])
        return
    }

	// Open file descriptor 3 for writing
	fd3 := os.NewFile(3, "fd3")
	if fd3 == nil {
		fmt.Println("Failed to open file descriptor 3")
		return
	}
	defer fd3.Close()

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

def main(fd):
    # Ensure the provided file descriptor is valid
    try:
        fd = int(fd)
    except ValueError:
        print("Invalid file descriptor", file=sys.stderr)
        return

    # Write the environment variable to the given file descriptor
    os.write(fd, b'EXAMPLE="test"\n')

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 output_example.py <file_descriptor>", file=sys.stderr)
        sys.exit(1)

    main(sys.argv[1])
```

The `exec.d` interface provides a powerful mechanism for dynamically configuring runtime environments in a flexible and programmable manner, enhancing the customization capabilities available to application programmers using buildpacks.